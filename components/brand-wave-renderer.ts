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
uniform vec3 pointer;
uniform float time;
uniform float dpr;
uniform float mobile;
varying float isAccent;
varying float diameter;
void main() {
  vec2 p = position.xy;
  float row = position.z - .5;
  float edge = sin(3.14159 * p.x);
  float start = smoothstep(0.,.75,time);
  // Use two travelling phases for a rolling, gently twisting ribbon, rather
  // than moving the whole silhouette in lockstep. Start at the fallback pose.
  float sweep = sin(time*2.15 - p.x*7.9);
  float fold = sin(time*1.54 - p.x*12.4 + row*.65);
  vec2 drift = vec2(7.0*sin(time*1.8 - p.x*6.5)*edge,
    (18.0*sweep + 6.0*fold + 9.0*row*sin(time*1.86 - p.x*6.5)) * (.65 + .35*edge));
  drift *= start * mix(vec2(1.),vec2(.58,.37),mobile);

  // A desktop pointer bends only the part of the ribbon it is near. The
  // field follows a damped pointer, without relying on overlays or click events.
  vec2 relative = (pointer.xy-p)*viewport;
  vec2 local = relative / vec2(clamp(viewport.x*.13,110.,220.),104.);
  float proximity = pointer.z * exp(-dot(local,local));
  drift += proximity * vec2(clamp(relative.x*.2,-8.,8.)*edge,
    -mix(13.,31.,smoothstep(-20.,30.,relative.y)));

  // Ease into the frame bounds rather than chopping off the crest or marker.
  float margin = mix(2.,mix(9.,6.,mobile),accent);
  float room = (drift.y > 0. ? (1.-p.y) : p.y) * viewport.y - margin;
  float maximum = max(0.,room);
  drift.y *= maximum/(maximum + abs(drift.y) + .001);
  p += drift/viewport;
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
  const uniforms = { viewport: { value: { x: 1, y: 1 } }, pointer: { value: { x: .5, y: .5, z: 0 } }, time: { value: 0 }, dpr: { value: 1 }, mobile: { value: 0 } };
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
  const target = { x: .5, y: .5, strength: 0 };
  const parent = host.parentElement;
  const move = (e: PointerEvent) => {
    if (!running || !finePointer.matches || e.pointerType === "touch") return;
    const rect = host.getBoundingClientRect();
    const x = Math.max(0,Math.min(1,(e.clientX-rect.left)/Math.max(1,rect.width)));
    const y = Math.max(0,Math.min(1,(e.clientY-rect.top)/Math.max(1,rect.height)));
    if (!target.strength && uniforms.pointer.value.z < .025) {
      // Enter at the pointer, not with a spurious sweep from the last location.
      uniforms.pointer.value.x = x;
      uniforms.pointer.value.y = y;
    }
    target.x = x;
    target.y = y;
    target.strength = 1;
  };
  const leave = () => { target.strength = 0; };
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
      const seconds = last ? Math.min(.1,(t-last)/1000) : 0;
      uniforms.time.value += seconds;
      last = t;
      const follow = 1 - Math.exp(-seconds * 10);
      const release = 1 - Math.exp(-seconds * 6);
      const pointer = uniforms.pointer.value;
      pointer.x += follow*(target.x-pointer.x);
      pointer.y += follow*(target.y-pointer.y);
      pointer.z += (target.strength ? follow : release)*(target.strength-pointer.z);
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
      else {
        cancelAnimationFrame(frame);
        target.strength = 0;
        uniforms.pointer.value.z = 0;
      }
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
