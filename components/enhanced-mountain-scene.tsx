"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// Preview-only experiment. The original MountainScene remains unchanged.
const COLUMNS = 148;
const ROWS = 76;
const vertexShader = `
  uniform float uTime;
  uniform float uPixelRatio;
  uniform vec2 uPointer;
  uniform float uHover;
  attribute float aDepth;
  varying float vDepth;
  varying float vAccent;
  void main() {
    vec3 p = position;
    float wave = sin(p.x * .65 + p.z * .38 - uTime * .65) * .11;
    wave += sin(p.x * .32 - p.z * .55 + uTime * .42) * .07;
    p.y += wave * (1.0 - aDepth * .48);
    p.x += sin(p.z * .42 + uTime * .32) * .035;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    vec4 projected = projectionMatrix * view;
    vec2 screen = projected.xy / projected.w;
    float distance = length((screen - uPointer) * vec2(1.0, .75));
    float envelope = exp(-distance * distance * 9.0) * uHover;
    p.y += sin(distance * 20.0 - uTime * 2.4) * envelope * .075;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    gl_PointSize = clamp((1.0 - aDepth * .3) * 22.0 / -view.z * uPixelRatio, .7, 3.0 * uPixelRatio);
    vDepth = aDepth;
    vAccent = envelope * .32;
  }
`;
const fragmentShader = `
  varying float vDepth;
  varying float vAccent;
  void main() {
    float radius = length(gl_PointCoord - vec2(.5));
    float circle = 1.0 - smoothstep(.24, .5, radius);
    if (circle < .01) discard;
    vec3 ink = mix(vec3(.25), vec3(.67), vDepth);
    vec3 pink = vec3(1.0, .239, .545);
    gl_FragColor = vec4(mix(ink, pink, vAccent), circle * mix(.54, .23, vDepth));
  }
`;

function ridgeHeight(x: number, depth: number) {
  const center = Math.exp(-Math.pow((x - .52) * 4.9, 2)) * (3.35 - depth * .74);
  const left = Math.exp(-Math.pow((x - .27) * 7.8, 2)) * (1.35 - depth * .42);
  const right = Math.exp(-Math.pow((x - .74) * 6.2, 2)) * (1.8 - depth * .46);
  return center + left + right + Math.sin(x * 46 + depth * 4.6) * .11 + Math.sin(x * 94) * .045;
}

export function EnhancedMountainScene() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = mount.current;
    const hero = container?.parentElement;
    if (!container || !hero) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const finePointer = matchMedia("(hover: hover) and (pointer: fine)");
    let disposeScene: (() => void) | undefined;

    function setup() {
      disposeScene?.(); disposeScene = undefined;
      if (motion.matches) return;
      let renderer: THREE.WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: "low-power" });
      } catch { return; }
      renderer.setClearAlpha(0);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
      container!.appendChild(renderer.domElement);
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(40, 1, .1, 80);
      const positions = new Float32Array(COLUMNS * ROWS * 3);
      const depths = new Float32Array(COLUMNS * ROWS);
      for (let row = 0; row < ROWS; row++) {
        const depth = row / (ROWS - 1);
        for (let column = 0; column < COLUMNS; column++) {
          const index = row * COLUMNS + column;
          const x = Math.min(1, column / (COLUMNS - 1) + (row % 2 ? .5 / COLUMNS : 0));
          const valley = Math.pow(depth, 1.42) * 2.18;
          const centerBase = Math.exp(-Math.pow((x - .52) * 3.05, 2)) * Math.exp(-Math.pow((depth - .68) * 2.35, 2)) * .58;
          const rawY = -3.15 + ridgeHeight(x, depth) - valley + centerBase + Math.sin(depth * 20 + x * 4.4) * .09;
          positions[index * 3] = (x - .5) * (19.2 - depth * 1.35);
          positions[index * 3 + 1] = THREE.MathUtils.lerp(rawY, -3.55 + Math.sin(x * Math.PI) * .05, THREE.MathUtils.smoothstep(depth, .62, 1) * .78);
          positions[index * 3 + 2] = -depth * 8.2;
          depths[index] = depth;
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("aDepth", new THREE.BufferAttribute(depths, 1));
      const uniforms = {
        uTime: { value: 0 }, uPixelRatio: { value: renderer.getPixelRatio() },
        uPointer: { value: new THREE.Vector2(3, 3) }, uHover: { value: 0 },
      };
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false });
      const cloud = new THREE.Points(geometry, material);
      cloud.scale.setScalar(1.5); cloud.position.set(1.36, .06, 0); cloud.rotation.x = -.1;
      scene.add(cloud);
      let frame = 0, last = 0, elapsed = 0, visible = false, lost = false, active = false;
      const target = new THREE.Vector2(3, 3);
      function draw(now: number) {
        frame = 0;
        if (!visible || document.hidden || lost) return;
        // 30fps is enough for this restrained background; time pauses offscreen.
        if (now - last >= 1000 / 30) {
          const dt = last ? Math.min((now - last) / 1000, .05) : 0;
          elapsed += dt; last = now;
          uniforms.uTime.value = elapsed;
          uniforms.uHover.value = THREE.MathUtils.lerp(uniforms.uHover.value, active ? 1 : 0, 1 - Math.exp(-dt * 5));
          uniforms.uPointer.value.lerp(target, 1 - Math.exp(-dt * 7));
          try { renderer.render(scene, camera); } catch { stop(); lost = true; return; }
        }
        frame = requestAnimationFrame(draw);
      }
      function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
      function resume() { if (visible && !document.hidden && !lost && !frame) frame = requestAnimationFrame(draw); }
      function visibility() { if (document.hidden) { active = false; stop(); } else resume(); }
      function resize() {
        const width = container!.clientWidth, height = container!.clientHeight;
        renderer.setSize(width, height, false); camera.aspect = width / Math.max(height, 1);
        camera.position.set(0, 1.15, width < 700 ? 10.2 : 8.6);
        camera.lookAt(.42, -1.18, -2.9); camera.updateProjectionMatrix();
      }
      function pointer(event: PointerEvent) {
        if (!finePointer.matches || event.pointerType === "touch") return;
        const rect = container!.getBoundingClientRect();
        target.set((event.clientX - rect.left) / rect.width * 2 - 1, 1 - (event.clientY - rect.top) / rect.height * 2);
        // Start a fresh interaction at the pointer, rather than sweeping across text.
        if (!active) uniforms.uPointer.value.copy(target);
        active = true;
      }
      function leave() { active = false; }
      function contextLost(event: Event) { event.preventDefault(); lost = true; stop(); renderer.domElement.style.opacity = "0"; }
      const intersection = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        if (visible) resume(); else { active = false; stop(); }
      });
      const sizes = new ResizeObserver(resize);
      sizes.observe(container!); intersection.observe(hero!);
      document.addEventListener("visibilitychange", visibility);
      hero!.addEventListener("pointermove", pointer, { passive: true });
      hero!.addEventListener("pointerleave", leave);
      finePointer.addEventListener("change", leave);
      renderer.domElement.addEventListener("webglcontextlost", contextLost);
      resize();
      disposeScene = () => {
        stop(); intersection.disconnect(); sizes.disconnect();
        document.removeEventListener("visibilitychange", visibility);
        hero!.removeEventListener("pointermove", pointer); hero!.removeEventListener("pointerleave", leave);
        finePointer.removeEventListener("change", leave);
        renderer.domElement.removeEventListener("webglcontextlost", contextLost);
        geometry.dispose(); material.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove();
      };
    }
    setup(); motion.addEventListener("change", setup);
    return () => { motion.removeEventListener("change", setup); disposeScene?.(); };
  }, []);
  return <div ref={mount} data-dots-variant="flow" aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-16 z-0 opacity-90 mix-blend-multiply" />;
}
