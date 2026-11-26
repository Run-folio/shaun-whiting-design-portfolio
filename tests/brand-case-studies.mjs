// Run against next dev/start or the static preview: node tests/brand-case-studies.mjs URL
import assert from "node:assert/strict";
const origin = process.argv[2] || "http://localhost:3000";
const cases = [
  ["returns-platform", "Doddle Returns Platform", "$12M", "88.2%"],
  ["rio", "Rio", "87%", "Across field and back-office operations."],
  ["morrovia", "Morrovia", "Beta", "No established adoption, revenue or conversion outcomes."],
  ["returns-kiosk", "Amazon Returns Kiosk", "$60M", "$22.5M"],
  ["farfetch", "Farfetch Mobile", "4.8★", "20M+"],
];
for (const [slug,title,...evidence] of cases) {
  const response = await fetch(new URL("/case-study/" + slug, origin));
  assert.equal(response.status, 200, slug);
  const html = await response.text();
  const article = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0] || "";
  assert.match(article, /aria-label="Breadcrumb"/, slug);
  assert.ok(article.includes(title), slug + ": case title");
  for (const value of evidence) assert.ok(article.includes(value), slug + ": " + value);
  for (const id of ["overview","scope","artifact","context","decisions","impact"]) assert.ok(article.includes('id="'+id+'"'), slug+": preserved anchor "+id);
  for (const id of ["context","decisions","impact"]) assert.ok(article.includes('href="#'+id+'"'), slug+": section jump "+id);
  assert.ok(article.indexOf('class="case-detail-outcomes') < article.indexOf('id="artifact"'), slug+": show the outcomes before the walkthrough");
  assert.ok(article.includes('aria-label="Open '), slug+": product image zoom");
  if (slug === "returns-platform") {
    assert.ok(article.includes("Doddle paperless returns: choose an item"), "Use the approved original three-phone hero");
    assert.ok(article.includes("Merchant return detail and item timeline"), "Keep the previous merchant screenshot accessible");
  }
  assert.ok(article.includes("Read next"), slug+": next study");
  console.log(slug+" OK");
}
