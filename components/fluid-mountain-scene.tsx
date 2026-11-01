"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

// A separate exploration rebuilt from MountainScene's original field and palette.
// Its static positions stay on the GPU; the shader moves the whole surface.
const COLUMNS = 148, ROWS = 76;
const vertexShader = `
  uniform float uTime, uHover, uAspect, uPixelRatio;
  uniform vec2 uPointer, uVelocity;
  attribute vec3 color;
  varying vec3 vColor;
  varying float vAccent;
  varying vec2 vScreen;
  void main() {
    vec3 p = position;
    float depth = abs(p.z) / 8.2;
    float pull = 1.0 - depth * .72;
    // Domain-warped waves travel through the ridges as one flexible surface.
    float bend = sin(p.x * .29 - p.z * .36 + uTime * .48);
    float swell = sin(p.x * .64 + p.z * .48 - uTime * .92 + bend * .9);
    float cross = cos(p.x * .36 - p.z * .58 + uTime * .68);
    p.y += (swell * .37 + cross * .24) * (.55 + .45 * pull);
    p.x += cos(p.z * .6 + uTime * .5 + bend) * .17 * pull;
    p.z += sin(p.x * .38 + p.z * .28 - uTime * .46) * .22;
    vec4 projected = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec2 delta = (projected.xy / projected.w - uPointer) * vec2(uAspect, 1.0);
    float distance = sqrt(dot(delta, delta) + .012);
    float envelope = exp(-distance * distance * 5.5) * uHover;
    float ring = sin(distance * 11.0 - uTime * 3.2);
    // A soft vortex, travelling rings and a short directional wake follow input.
    vec2 tangent = vec2(-delta.y, delta.x) / sqrt(dot(delta, delta) + .09);
    p.xy += tangent * envelope * (.36 + .17 * sin(uTime * 1.4));
    p.xy += uVelocity * envelope * .24;
    p.y += ring * envelope * .22;
    p.z += cos(distance * 9.0 - uTime * 2.6) * envelope * .32;
    vec4 view = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * view;
    vScreen = gl_Position.xy / gl_Position.w;
    gl_PointSize = clamp(.047 * 360.0 * uPixelRatio / -view.z * (1.0 + envelope * .3), .65, 4.0 * uPixelRatio);
    vColor = color;
    vAccent = envelope * (.18 + .34 * max(ring, 0.0));
  }
`;
const fragmentShader = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAccent;
  varying vec2 vScreen;
  void main() {
    float alpha = 1.0 - smoothstep(.3, .5, length(gl_PointCoord - vec2(.5)));
    if (alpha < .02) discard;
    gl_FragColor = vec4(mix(vColor, vec3(1.0, .239, .545), vAccent), alpha * uOpacity);
  }
`;

const ribbonFragmentShader = `
  uniform float uOpacity;
  varying vec3 vColor;
  varying float vAccent;
  varying vec2 vScreen;
  void main() {
    // Quiet centre protects the copy; edges retain expressive continuous ribbons.
    float quiet = exp(-pow(vScreen.x * 1.5, 4.0) - pow((vScreen.y - .03) * 5.5, 4.0));
    float alpha = uOpacity * (.55 - quiet * .4);
    vec3 pink = vec3(1.0, .239, .545);
    gl_FragColor = vec4(mix(vColor, pink, min(.85, vAccent * 1.45)), alpha);
  }
`;

function ridgeHeight(x: number, depth: number) {
  const center = Math.exp(-Math.pow((x - .52) * 4.9, 2)) * (3.35 - depth * .74);
  const left = Math.exp(-Math.pow((x - .27) * 7.8, 2)) * (1.35 - depth * .42);
  const right = Math.exp(-Math.pow((x - .74) * 6.2, 2)) * (1.8 - depth * .46);
  return center + left + right + Math.sin(x * 46 + depth * 4.6) * .11 + Math.sin(x * 94) * .045;
}

export function FluidMountainScene() {
  const mount = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const container = mount.current, hero = container?.parentElement;
    if (!container || !hero) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let dispose: (() => void) | undefined;
    function setup() {
      dispose?.(); dispose = undefined;
      if (motion.matches) return;
      let renderer: THREE.WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); }
      catch { return; }
      renderer.setClearAlpha(0); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
      container!.appendChild(renderer.domElement);
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(40, 1, .1, 80);
      const positions = new Float32Array(COLUMNS * ROWS * 3), colors = new Float32Array(COLUMNS * ROWS * 3);
      // Exact original mountain geometry: stagger, ridges, valley and base flattening.
      for (let row = 0; row < ROWS; row++) {
        const depth = row / (ROWS - 1), offset = row % 2 ? .5 / COLUMNS : 0;
        for (let column = 0; column < COLUMNS; column++) {
          const i = (row * COLUMNS + column) * 3;
          const x = THREE.MathUtils.clamp(column / (COLUMNS - 1) + offset, 0, 1);
          const centerBase = Math.exp(-Math.pow((x - .52) * 3.05, 2)) * Math.exp(-Math.pow((depth - .68) * 2.35, 2)) * .58;
          const rawY = -3.15 + ridgeHeight(x, depth) - Math.pow(depth, 1.42) * 2.18 + centerBase + Math.sin(depth * 20 + x * 4.4) * .09;
          positions[i] = (x - .5) * (19.2 - depth * 1.35);
          positions[i + 1] = THREE.MathUtils.lerp(rawY, -3.55 + Math.sin(x * Math.PI) * .05, THREE.MathUtils.smoothstep(depth, .62, 1) * .78);
          positions[i + 2] = -depth * 8.2;
        }
      }
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const uniforms = { uTime: { value: 0 }, uHover: { value: 0 }, uAspect: { value: 1 }, uPixelRatio: { value: renderer.getPixelRatio() }, uOpacity: { value: .58 }, uPointer: { value: new THREE.Vector2(3, 3) }, uVelocity: { value: new THREE.Vector2() } };
      const material = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader, transparent: true, depthWrite: false });
      const cloud = new THREE.Group(); cloud.scale.setScalar(1.5); scene.add(cloud);
      cloud.add(new THREE.Points(geometry, material));
      const ribbonGeometry = new THREE.BufferGeometry();
      // Smooth only the connected contours, retaining the original dotted ridges.
      const ribbonPositions = positions.slice();
      for (let row = 0; row < ROWS; row++) for (let column = 0; column < COLUMNS; column++) {
        let height = 0, weight = 0;
        for (let offset = -3; offset <= 3; offset++) {
          const sample = Math.max(0, Math.min(COLUMNS - 1, column + offset));
          const w = 4 - Math.abs(offset); height += positions[(row * COLUMNS + sample) * 3 + 1] * w; weight += w;
        }
        ribbonPositions[(row * COLUMNS + column) * 3 + 1] = height / weight;
      }
      ribbonGeometry.setAttribute("position", new THREE.BufferAttribute(ribbonPositions, 3));
      ribbonGeometry.setAttribute("color", geometry.getAttribute("color"));
      const segments: number[] = [];
      for (let row = 0; row < ROWS; row += 3) for (let column = 0; column < COLUMNS - 1; column++) {
        segments.push(row * COLUMNS + column, row * COLUMNS + column + 1);
      }
      ribbonGeometry.setIndex(segments);
      const ribbonMaterial = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader: ribbonFragmentShader, transparent: true, depthWrite: false });
      cloud.add(new THREE.LineSegments(ribbonGeometry, ribbonMaterial));
      function theme() {
        const dark = document.documentElement.classList.contains("dark");
        const peak = new THREE.Color(dark ? "#f4f3ef" : "#111111"), field = new THREE.Color(dark ? "#9a9f98" : "#92938e"), far = new THREE.Color(dark ? "#565c57" : "#dad8d0");
        for (let i = 0; i < positions.length; i += 3) {
          const depth = Math.abs(positions[i + 2]) / 8.2, mix = THREE.MathUtils.clamp((positions[i + 1] + 2.35) / 3.35, 0, 1);
          const color = far.clone().lerp(field, 1 - depth).lerp(peak, mix * .86);
          colors[i] = color.r; colors[i + 1] = color.g; colors[i + 2] = color.b;
        }
        geometry.getAttribute("color").needsUpdate = true; uniforms.uOpacity.value = dark ? .72 : .58;
      }
      const themeObserver = new MutationObserver(theme); themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] }); theme();
      const target = new THREE.Vector2(), mouse = new THREE.Vector2(), pointerTarget = new THREE.Vector2(3, 3), velocity = new THREE.Vector2();
      let frame = 0, last = 0, time = 0, visible = false, lost = false, active = false;
      function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
      function draw(now: number) {
        frame = 0; if (!visible || document.hidden || lost) return;
        if (now - last >= 1000 / 30) {
          const dt = last ? Math.min((now - last) / 1000, .05) : 0; last = now; time += dt;
          const damping = 1 - Math.exp(-dt * 6);
          mouse.lerp(target, damping); uniforms.uPointer.value.lerp(pointerTarget, damping);
          uniforms.uHover.value = THREE.MathUtils.lerp(uniforms.uHover.value, active ? 1 : 0, damping);
          uniforms.uVelocity.value.lerp(velocity, damping); velocity.multiplyScalar(Math.exp(-dt * 5));
          uniforms.uTime.value = time;
          cloud.rotation.set(-.1 + mouse.y * .055, mouse.x * .18, 0);
          cloud.position.set(.8 + mouse.x * .32, .15, 0);
          camera.lookAt(.42 + mouse.x * .22, -1.18 + mouse.y * .14, -2.9);
          try { renderer.render(scene, camera); } catch { lost = true; renderer.domElement.style.opacity = "0"; stop(); return; }
        }
        frame = requestAnimationFrame(draw);
      }
      function resume() { if (visible && !document.hidden && !lost && !frame) frame = requestAnimationFrame(draw); }
      function visibility() { if (document.hidden) { active = false; stop(); } else resume(); }
      function resize() { const w = container!.clientWidth, h = container!.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(h, 1); uniforms.uAspect.value = camera.aspect; camera.position.set(0, 1.15, w < 700 ? 10.2 : 8.6); camera.updateProjectionMatrix(); }
      function pointer(event: PointerEvent) {
        if (!fine.matches || event.pointerType === "touch") return;
        const r = container!.getBoundingClientRect(); const next = new THREE.Vector2((event.clientX - r.left) / r.width * 2 - 1, 1 - (event.clientY - r.top) / r.height * 2);
        if (active) velocity.copy(next).sub(pointerTarget).multiplyScalar(12).clampLength(0, 1.5); else uniforms.uPointer.value.copy(next);
        pointerTarget.copy(next); target.set(next.x, -next.y); active = true;
      }
      function leave() { active = false; target.set(0, 0); velocity.set(0, 0); }
      function contextLost(e: Event) { e.preventDefault(); lost = true; stop(); renderer.domElement.style.opacity = "0"; }
      const intersection = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); if (visible) resume(); else { leave(); stop(); } }); intersection.observe(hero!);
      const sizes = new ResizeObserver(resize); sizes.observe(container!); resize();
      document.addEventListener("visibilitychange", visibility); hero!.addEventListener("pointermove", pointer, { passive: true }); hero!.addEventListener("pointerleave", leave); fine.addEventListener("change", leave); renderer.domElement.addEventListener("webglcontextlost", contextLost);
      dispose = () => { stop(); intersection.disconnect(); sizes.disconnect(); themeObserver.disconnect(); document.removeEventListener("visibilitychange", visibility); hero!.removeEventListener("pointermove", pointer); hero!.removeEventListener("pointerleave", leave); fine.removeEventListener("change", leave); renderer.domElement.removeEventListener("webglcontextlost", contextLost); geometry.dispose(); ribbonGeometry.dispose(); material.dispose(); ribbonMaterial.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
    }
    setup(); motion.addEventListener("change", setup);
    return () => { motion.removeEventListener("change", setup); dispose?.(); };
  }, []);
  return <div ref={mount} data-dots-variant="fluid" aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-16 z-0 opacity-90 mix-blend-multiply dark:opacity-70 dark:mix-blend-screen" />;
}
