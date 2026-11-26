import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { buildWave, waveSvg } from "../lib/brand-wave-geometry.mjs";

test("wide wave climbs from the lower left, crests above the intro, trails down right", () => {
  const { dots, rows, columns } = buildWave(1440, 430);
  assert.equal(rows, 9);
  assert.ok(columns >= 95 && columns <= 115);
  const mids = dots.filter(p => p.row === 4);
  const at = x => mids.reduce((best,p) => Math.abs(p.x - x) < Math.abs(best.x - x) ? p : best);
  assert.ok(at(0.04).y > 0.76);
  assert.ok(at(0.72).y < 0.15);
  assert.ok(at(0.98).y > at(0.78).y + 0.12);
  assert.ok(dots.filter(p => p.accent).length === 1);
  assert.ok(dots.find(p => p.accent).x > 0.82);
});

test("mobile wave is parked at the seam; no field of dots through buttons or text", () => {
  const { dots } = buildWave(390, 465);
  assert.ok(Math.min(...dots.map(p => p.y)) >= 0.895);
  assert.ok(dots.some(p => p.y > 0.975));
  assert.ok(dots.length < 500);
});

test("static art and WebGL share the same geometry; only one accent and no random shape", () => {
  for (const [width, height, name] of [[1440,430,"desktop"],[390,465,"mobile"]]) {
    const markup = waveSvg(width,height);
    assert.equal(fs.readFileSync(new URL("../public/brand/wave-"+name+".svg",import.meta.url),"utf8"), markup);
    assert.equal((markup.match(/#25e6d1/g)||[]).length,1);
    assert.deepEqual(buildWave(width,height),buildWave(width,height));
    assert.ok(markup.length < 30000);
  }
});

test("keeps the full upper crest inside short desktop headers", () => {
  for (const [w,h] of [[1440,430],[1024,300]]) {
    assert.ok(Math.min(...buildWave(w,h).dots.map(p=>p.y*h)) >= 6);
  }
});
