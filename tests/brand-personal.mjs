import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";
const read=(path)=>readFileSync(new URL("../"+path,import.meta.url),"utf8");
test("both personal pages use the shared editorial treatment and original routes",()=>{
  for(const p of ["more-about-me","photography"]){
    const src=read("app/"+p+"/page.tsx");
    assert.ok(src.includes('className="personal-page"'));
    assert.ok(src.includes("personal-masthead"));
    assert.doesNotMatch(src, /aria-label="Breadcrumb"/i);
    assert.ok(!src.includes("pt-[92px]"));
    assert.ok(src.includes('canonical: "/'+p+'"'));
  }
});
test("photographs retain their real sources, captions, full gallery and keyboard lightbox",()=>{
  const about=read("app/more-about-me/page.tsx"), photos=read("app/photography/page.tsx"), grid=read("app/photography/photography-grid.tsx");
  for(const original of ["v1744685819/shaun3_horawe.jpg","398417558_1_l1mndf","UTMB 100K 2024","/#work"])assert.ok(about.includes(original));
  assert.ok(about.includes('href="/photography"')); assert.ok(photos.includes('href="/more-about-me"'));
  assert.match(about, /<PhotographyGrid photos=\{featuredTravelPhotos\} variant="featured"\s*\/>/);
  assert.ok(photos.includes("photos={travelPhotos}")); assert.ok(grid.includes("setSelectedIndex(index)")); assert.ok(grid.includes("<ImageLightbox"));
  assert.ok(grid.includes("personal-country")); assert.ok(grid.includes('aria-label={`Open photo from ${photo.country}`}'));
});
test("Beyond Design features Norway in the landscape row, without removing Nepal from the full collection",()=>{
  const source=read("lib/photography.ts");
  assert.match(source,/const featuredCountries = \["Guatemala", "Norway", "Iceland"/);
  assert.match(source,/{ country: "Nepal", flag:/);
  assert.match(source,/{ country: "Norway", flag:/);
});
test("photo cards use the original separate grid proportions with a flag-and-country rollover", () => {
  const grid = read("app/photography/photography-grid.tsx");
  const css = read("app/personal-pages.css");
  assert.match(grid, /className="personal-photo-caption"/);
  assert.match(grid, /aria-hidden="true">\{photo\.flag\}/);
  assert.match(css, /\.personal-photo-grid--featured\s*\{[^}]*--photo-aspect:\s*3\s*\/\s*2/);
  assert.match(css, /\.personal-photo-grid--gallery\s*\{[^}]*--photo-aspect:\s*4\s*\/\s*3/);
  assert.match(css, /@media \(hover: hover\) and \(pointer: fine\)/);
  assert.match(css, /\.personal-photo-button:focus-visible \.personal-photo-caption/);
});
