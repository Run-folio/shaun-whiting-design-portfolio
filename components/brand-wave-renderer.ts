import { BufferAttribute, BufferGeometry, Camera, Points, RawShaderMaterial, Scene, WebGLRenderer } from "three";
import { buildWave } from "@/lib/brand-wave-geometry.mjs";

export interface WaveHandle {
  setActive(active: boolean): void;
  dispose(): void;
}

// Dot positions are expressed in screen space so a camera never rotates the
// recognisable silhouette out of view. Apply bounded, continuous offsets to the
// whole band, not individually noisy particle velocities.
const vertex = `
precision highp float;
attribute vec3 position;
attribute float accent;
uniform vec2 viewport;
uniform vec2 pointer;
uniform float time;
uniform float dpr;
uniform float mobile;
varying float isAccent;
varying float diameter;
void main() {
  vec2 p = position.xy;
  float envelope = .63 + .37 * sin(3.14159 * clamp(p.x,0.,1.));
  float phase = p.x*5.2 + position.z*.36;
  float drift = (sin(time*.44 + phase) - sin(phase)) * 1.55;
  float weight = exp(-9.0 * pow(p.x - pointer.x,2.0));
  p.y += (drift + weight*pointer.y*3.2) * envelope * mix(1.,.30,mobile) / viewport.y;
  p.x += .75*(cos(time*.32+p.x*3.)-cos(p.x*3.))/viewport.x;
  gl_Position = vec4(p.x*2.-1., 1.-p.y*2., 0., 1.);
  diameter = mix(mix(2.15,1.65,mobile),mix(15.,9.,mobile),accent) * dpr;
  gl_PointSize = diameter+2.;
  isAccent = accent;
}`;
const fragment = `
precision mediump float;
varying float isAccent;
varying float diameter;
void main(){
  float dist = length(gl_PointCoord - vec2(.5)) * (diameter + 2.);
  float a = 1. - smoothstep(diameter*.5-.45,diameter*.5+.45,dist);
  gl_FragColor = vec4(mix(vec3(.949,.961,.980),vec3(.145,.902,.820),isAccent),a*mix(.83,1.,isAccent));
}`;

export function createWaveRenderer(host: HTMLDivElement, onLost: () => void): WaveHandle {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("webgl2", { alpha: true, antialias: false, powerPreference: "low-power", depth: false, stencil: false });
  if (!context) throw new Error("Optional WebGL2 decorative surface unavailable");
  const renderer = new WebGLRenderer({ canvas, context, alpha: true, antialias: false });
  renderer.setClearColor(0, 0);
  const uniforms = { viewport: { value: { x: 1, y: 1 } }, pointer: { value: { x: .5, y: 0 } }, time: { value: 0 }, dpr: { value: 1 }, mobile: { value: 0 } };
  const material = new RawShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, transparent: true, depthTest:false, depthWrite: false, uniforms });
  const geometry = new BufferGeometry();
  const points = new Points(geometry,material);
  points.frustumCulled = false;
  const scene = new Scene();
  scene.add(points);
  const camera = new Camera();
  let running = false;
  let disposed = false;
  let frame = 0;
  let last = 0;
  let width = 0;
  let height = 0;
  const finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  const target = { x: .5, y: 0 };
  const parent = host.parentElement;
  const move = (e: PointerEvent) => {
    if (!finePointer.matches || e.pointerType === "touch") return;
    const rect = host.getBoundingClientRect();
    target.x = Math.max(0,Math.min(1,(e.clientX-rect.left)/Math.max(1,width)));
    target.y = Math.max(-1,Math.min(1,2*(e.clientY-rect.top)/Math.max(1,height)-1));
  };
  const leave = () => { target.y = 0; };
  const resize = () => {
    if (disposed) return;
    const w = Math.round(host.clientWidth), h = Math.round(host.clientHeight);
    if (w < 1 || h < 1 || (w === width && h === height)) return;
    width=w; height=h;
    const dpr = Math.min(window.devicePixelRatio || 1,2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(w,h,false);
    const wave = buildWave(w,h);
    const positions = new Float32Array(wave.dots.length*3);
    const accent = new Float32Array(wave.dots.length);
    wave.dots.forEach((p,i) => { positions.set([p.x,p.y,p.row/(wave.rows-1)],i*3); accent[i]=p.accent ? 1 : 0; });
    // Dispose previous GPU buffers before resizing/replacing their attributes.
    geometry.dispose();
    geometry.setAttribute("position",new BufferAttribute(positions,3));
    geometry.setAttribute("accent",new BufferAttribute(accent,1));
    uniforms.viewport.value.x=w; uniforms.viewport.value.y=h;
    uniforms.dpr.value=dpr; uniforms.mobile.value=wave.narrow ? 1 : 0;
  };
  const draw = (t: number) => {
    if (!running || disposed) return;
    if (!last || t-last >= 1000/30 - .5) {
      if (last) uniforms.time.value += Math.min(.1,(t-last)/1000);
      last = t;
      uniforms.pointer.value.x += .1*(target.x-uniforms.pointer.value.x);
      uniforms.pointer.value.y += .1*(target.y-uniforms.pointer.value.y);
      resize();
      if (width && height) {
        try {
          renderer.render(scene,camera);
          if (context.isContextLost()) { onLost(); return; }
          if (host.dataset.renderer !== "webgl") host.dataset.renderer="webgl";
        } catch { onLost(); return; }
      }
    }
    frame=requestAnimationFrame(draw);
  };
  const lost = (event: Event) => { event.preventDefault(); onLost(); };
  canvas.addEventListener("webglcontextlost",lost);
  parent?.addEventListener("pointermove",move,{ passive:true });
  parent?.addEventListener("pointerleave",leave);
  host.appendChild(canvas);
  return {
    setActive(value) {
      if (disposed || running === value) return;
      running=value; last=0;
      if (running) frame=requestAnimationFrame(draw);
      else { cancelAnimationFrame(frame); target.y = 0; }
    },
    dispose() {
      disposed=true; running=false; cancelAnimationFrame(frame);
      canvas.removeEventListener("webglcontextlost",lost);
      parent?.removeEventListener("pointermove",move);
      parent?.removeEventListener("pointerleave",leave);
      geometry.dispose(); material.dispose(); renderer.dispose();
      if (!context.isContextLost()) renderer.forceContextLoss();
      canvas.remove();
    }
  };
}
