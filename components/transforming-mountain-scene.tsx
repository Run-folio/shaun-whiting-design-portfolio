"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";

const COLUMNS = 161, ROWS = 81;
const vertexShader = `
  uniform float uTime, uHover, uAspect;
  uniform vec2 uPointer;
  varying vec3 vPosition;
  varying vec2 vScreen;
  varying float vMorph, vAccent;
  void main() {
    float phase = mod(uTime, 18.0);
    // Eight seconds of mountain, three to melt, two fluid, three to rebuild,
    // then two more seconds of mountain before the cycle repeats.
    float morph = smoothstep(8.0, 11.0, phase) * (1.0 - smoothstep(13.0, 16.0, phase));
    vec3 p = position;
    float bend = sin(p.x * .28 - p.z * .38 + uTime * .45);
    float fluid = -.8 + sin(p.x * .55 + p.z * .48 - uTime * .85 + bend * .7) * .7;
    fluid += cos(p.x * .29 - p.z * .6 + uTime * .65) * .4;
    p.y = mix(position.y, fluid, morph);
    p.x += sin(p.z * .6 + uTime * .48) * .25 * morph;
    vec4 clip = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vec2 delta = (clip.xy / clip.w - uPointer) * vec2(uAspect, 1.0);
    float distance = sqrt(dot(delta, delta) + .03);
    float envelope = exp(-distance * distance * 5.0) * uHover;
    p.y += sin(distance * 10.0 - uTime * 2.4) * envelope * (.035 + morph * .2);
    p.x += -delta.y * envelope * .15 * morph;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
    vPosition = p;
    vScreen = gl_Position.xy / gl_Position.w;
    vMorph = morph;
    vAccent = envelope * (.15 + morph * .25);
  }
`;
const surfaceFragment = `
  varying vec3 vPosition;
  varying vec2 vScreen;
  varying float vMorph, vAccent;
  void main() {
    vec3 normal = normalize(cross(dFdx(vPosition), dFdy(vPosition)));
    float light = abs(dot(normal, normalize(vec3(-.55, .8, .45))));
    float height = clamp((vPosition.y + 2.8) / 6.5, 0.0, 1.0);
    vec3 stone = mix(vec3(.78), vec3(.98), light);
    stone = mix(stone, vec3(1.0), height * .35);
    stone = mix(stone, vec3(1.0, .86, .92), vAccent * .35);
    float quiet = exp(-pow(vScreen.x * 1.5, 4.0) - pow((vScreen.y - .03) * 5.0, 4.0));
    gl_FragColor = vec4(stone, (.75 - quiet * .35) * (1.0 - vMorph * .65));
  }
`;
const contourFragment = `
  varying vec3 vPosition;
  varying vec2 vScreen;
  varying float vMorph, vAccent;
  void main() {
    float quiet = exp(-pow(vScreen.x * 1.5, 4.0) - pow((vScreen.y - .03) * 5.0, 4.0));
    float height = clamp((vPosition.y + 2.8) / 6.5, 0.0, 1.0);
    vec3 ink = mix(vec3(.65), vec3(.23), height);
    gl_FragColor = vec4(mix(ink, vec3(1.0, .239, .545), vAccent), (.3 + height * .3) * (1.0 - quiet * .7));
  }
`;
function mountainHeight(x: number, z: number) {
  function peak(cx: number, cz: number, height: number, width: number, depth: number) {
    const dx = (x - cx) / width, dz = (z - cz) / depth;
    const distance = Math.sqrt(dx * dx + dz * dz);
    const ridge = 1 + Math.sin(Math.atan2(dz, dx) * 5 + .6) * .065;
    return Math.pow(Math.max(0, 1 - distance * ridge), 1.18) * height;
  }
  return -2.8 + Math.max(peak(0, -3.6, 6.5, 6, 5.3), peak(-4.2, -4.7, 4.5, 4.2, 4), peak(3.7, -5.2, 5, 4, 4.5));
}

export function TransformingMountainScene() {
  const mount = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const container = mount.current, hero = container?.parentElement;
    if (!container || !hero) return;
    const motion = matchMedia("(prefers-reduced-motion: reduce)");
    const fine = matchMedia("(hover: hover) and (pointer: fine)");
    let dispose: (() => void) | undefined;
    function setup() {
      dispose?.(); dispose = undefined; setReady(false);
      // Static SVG mountain is also the unsupported-GPU fallback.
      if (motion.matches) return;
      let renderer: THREE.WebGLRenderer;
      try { renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "low-power" }); } catch { return; }
      renderer.setClearAlpha(0); renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
      renderer.domElement.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
      container!.appendChild(renderer.domElement);
      const scene = new THREE.Scene(), camera = new THREE.PerspectiveCamera(38, 1, .1, 80);
      const positions = new Float32Array(COLUMNS * ROWS * 3), triangles: number[] = [], contours: number[] = [];
      for (let row = 0; row < ROWS; row++) for (let column = 0; column < COLUMNS; column++) {
        const index = row * COLUMNS + column, x = column / (COLUMNS - 1) * 20 - 10, z = 2 - row / (ROWS - 1) * 13;
        positions.set([x, mountainHeight(x, z), z], index * 3);
        if (column < COLUMNS - 1 && row < ROWS - 1) triangles.push(index, index + COLUMNS, index + 1, index + 1, index + COLUMNS, index + COLUMNS + 1);
        if (column < COLUMNS - 1 && row % 3 === 0) contours.push(index, index + 1);
        // Radial ridgelines give the solid mountain depth, not only horizontal waves.
        if (row < ROWS - 1 && column % 12 === 0) contours.push(index, index + COLUMNS);
      }
      const geometry = new THREE.BufferGeometry(); geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3)); geometry.setIndex(triangles);
      const lines = new THREE.BufferGeometry(); lines.setAttribute("position", geometry.getAttribute("position")); lines.setIndex(contours);
      const uniforms = { uTime: { value: 0 }, uHover: { value: 0 }, uAspect: { value: 1 }, uPointer: { value: new THREE.Vector2(3, 3) } };
      const surface = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader: surfaceFragment, transparent: true, side: THREE.DoubleSide, depthWrite: true, polygonOffset: true, polygonOffsetFactor: 1, polygonOffsetUnits: 1 });
      const strokes = new THREE.ShaderMaterial({ uniforms, vertexShader, fragmentShader: contourFragment, transparent: true, depthWrite: false });
      const terrain = new THREE.Group(); terrain.add(new THREE.Mesh(geometry, surface), new THREE.LineSegments(lines, strokes)); scene.add(terrain);
      const target = new THREE.Vector2(), mouse = new THREE.Vector2(), pointerTarget = new THREE.Vector2(3, 3);
      let frame = 0, last = 0, elapsed = 0, visible = false, active = false, lost = false, first = true;
      function stop() { cancelAnimationFrame(frame); frame = 0; last = 0; }
      function draw(now: number) {
        frame = 0; if (!visible || document.hidden || lost) return;
        if (now - last >= 1000 / 30) {
          const dt = last ? Math.min((now - last) / 1000, .1) : 0; last = now; elapsed += dt;
          const damping = 1 - Math.exp(-dt * 5); mouse.lerp(target, damping); uniforms.uPointer.value.lerp(pointerTarget, damping);
          uniforms.uHover.value = THREE.MathUtils.lerp(uniforms.uHover.value, active ? 1 : 0, damping); uniforms.uTime.value = elapsed;
          terrain.rotation.set(0, -.08 + mouse.x * .06, 0); camera.lookAt(mouse.x * .12, -.1 + mouse.y * .08, -3.5);
          try { renderer.render(scene, camera); if (first) { first = false; setReady(true); } } catch { lost = true; setReady(false); stop(); return; }
        }
        frame = requestAnimationFrame(draw);
      }
      function resume() { if (visible && !document.hidden && !lost && !frame) frame = requestAnimationFrame(draw); }
      function visibility() { if (document.hidden) { active = false; stop(); } else resume(); }
      function resize() { const w = container!.clientWidth, h = container!.clientHeight; renderer.setSize(w, h, false); camera.aspect = w / Math.max(h, 1); uniforms.uAspect.value = camera.aspect; camera.position.set(0, 2.5, w < 700 ? 19.5 : 14.2); camera.updateProjectionMatrix(); }
      function pointer(event: PointerEvent) { if (!fine.matches || event.pointerType === "touch") return; const r = container!.getBoundingClientRect(); const next = new THREE.Vector2((event.clientX - r.left) / r.width * 2 - 1, 1 - (event.clientY - r.top) / r.height * 2); if (!active) uniforms.uPointer.value.copy(next); pointerTarget.copy(next); target.copy(next); active = true; }
      function leave() { active = false; target.set(0, 0); }
      function contextLost(event: Event) { event.preventDefault(); lost = true; stop(); renderer.domElement.style.opacity = "0"; setReady(false); }
      const intersection = new IntersectionObserver(entries => { visible = entries.some(e => e.isIntersecting); if (visible) resume(); else { leave(); stop(); } }); intersection.observe(hero!);
      const sizes = new ResizeObserver(resize); sizes.observe(container!); resize();
      document.addEventListener("visibilitychange", visibility); hero!.addEventListener("pointermove", pointer, { passive: true }); hero!.addEventListener("pointerleave", leave); fine.addEventListener("change", leave); renderer.domElement.addEventListener("webglcontextlost", contextLost);
      dispose = () => { stop(); intersection.disconnect(); sizes.disconnect(); document.removeEventListener("visibilitychange", visibility); hero!.removeEventListener("pointermove", pointer); hero!.removeEventListener("pointerleave", leave); fine.removeEventListener("change", leave); renderer.domElement.removeEventListener("webglcontextlost", contextLost); geometry.dispose(); lines.dispose(); surface.dispose(); strokes.dispose(); renderer.dispose(); renderer.forceContextLoss(); renderer.domElement.remove(); };
    }
    setup(); motion.addEventListener("change", setup);
    return () => { motion.removeEventListener("change", setup); dispose?.(); };
  }, []);
  return <div ref={mount} data-dots-variant="mountain" aria-hidden="true" className="pointer-events-none absolute inset-x-0 -inset-y-16 z-0 opacity-90 mix-blend-multiply">
    <svg data-static-mountain viewBox="0 0 1440 794" preserveAspectRatio="xMidYMid slice" className="absolute inset-0 h-full w-full" style={{ opacity: ready ? 0 : 1 }}>
      <path d="M-100 750 300 300 455 440 720 185 985 415 1140 260 1540 750Z" fill="#f1f1ee" stroke="#a4a5a0" />
      <path d="m300 300 60 335 95-195 265-255-65 445 330-125 155-155-25 425M720 185l104 350 161-30M455 440l98 213 102-113 90 160 79-255 98 220 63-250" fill="none" stroke="#b1b2ad" strokeWidth="1.2" />
      <path d="m230 575 130 60 193 18 192 47 177-35 193 20 165-54" fill="none" stroke="#c5c6c1" />
    </svg>
  </div>;
}
