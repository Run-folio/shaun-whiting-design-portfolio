// Run against the actual Next entry point: node tests/brand-home.mjs http://localhost:3000
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
const target = process.argv[2] || "http://localhost:3000";
const html = target.startsWith("file:") ? await readFile(new URL(target), "utf8") : await (await fetch(target)).text();
const main = html.match(/<main\b[^>]*>[\s\S]*?<\/main>/)?.[0] || "";
const text = str => str.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
const heading = text(main.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/)?.[1] || "").replace(/\s+\./g, ".");
assert.equal(heading, "Complexity solved.", "Homepage heading");
assert.match(main, /Senior Product Designer/);
assert.match(main, /AI products \| B2B SaaS \| 0→1/);
assert.match(main, /href="#work"/);
assert.match(main, /id="work"/);
const cards = [...main.matchAll(/<article\b[^>]*>([\s\S]*?)<\/article>/g)].map(m => m[1]);
assert.match(main, /aria-roledescription="carousel"/, "Restore the looping selected work carousel");
assert.match(main, /Previous projects/);
assert.match(main, /Next projects/);
assert.equal(cards.length, 4, "Four featured projects, no carousel duplicates");
for (const [i, slug] of ["returns-platform", "rio", "morrovia", "returns-kiosk"].entries()) {
  assert.match(cards[i], new RegExp('href="/case-study/' + slug + '"'));
  assert.match(cards[i], /<img[^>]*\balt="[^"]+"/);
}
assert.match(cards[2], /Independent project/i);
assert.ok(cards.every(card => !card.includes("/case-study/farfetch")), "Farfetch stays outside the carousel");
for (const slug of ["returns-kiosk", "farfetch"]) assert.match(main, new RegExp('href="/case-study/' + slug + '"'));
assert.match(main, /London on-site or hybrid/);
assert.match(html, /href="\/resume.pdf"/);
assert.match(html, /sw@shaunwhiting.com/);
console.log("Homepage content, case-study destinations and contact checks passed.");
