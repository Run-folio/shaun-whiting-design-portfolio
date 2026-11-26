// Run against next dev/start or the static preview: node tests/brand-case-studies.mjs URL
import assert from "node:assert/strict";
const origin = process.argv[2] || "http://localhost:3000";
const cases = [
  ["returns-platform", "Doddle Returns Platform", "$12M", "88.2%", "Average processing time"],
  ["rio", "Rio", "87%", "Across field and back-office operations."],
  ["morrovia", "Morrovia", "Public beta", "AI-assisted build", "Editable itinerary"],
  ["returns-kiosk", "Amazon Returns Kiosk", "$60M", "$22.5M", "28% shorter", "69% lower"],
  ["farfetch", "Farfetch Mobile", "4.8★", "20M+"],
];
// Visual evidence in reading and gallery order, captured from the rendered
// pre-redesign portfolio (62c9ad4a), minus the retired Amazon prototype.
const cloudinary = "https://res.cloudinary.com/dbt3wkwa3/image/upload/f_auto,q_auto/";
const expectedHeader = {
  "returns-platform": ["Founding Product Designer", "Doddle / Blue Yonder", "B2B SaaS / Reverse Logistics"],
  "rio": ["Staff Product Designer", "Convergent IS", "Energy / AI Workflows"],
  "morrovia": ["Founder &amp; Product Designer", "Independent side project", "Travel / AI-assisted planning"],
  "returns-kiosk": ["Founding / Senior Staff Product Designer", "Doddle / Blue Yonder", "Logistics / Retail"],
  "farfetch": ["Senior Product Designer (contract)", "iOS &amp; Android", "Luxury Ecommerce / AI Retail"],
};
const expectedMedia = {
  "returns-platform": [
    ["img", "/RP1.png"],
    ["img", "/Returns.png"],
    ["img", "/rules.png"],
    ["img", "/Grading.png"],
    ["img", "/Carrier.png"],
    ["img", cloudinary + "portal5_v2acug.png"],
    ["img", cloudinary + "portal6_fv7tts.png"],
    ["img", cloudinary + "store4_en3nyf.png"],
  ],
  "rio": [
    ["img", "/rio/rio-hero-desktop.png"],
    ["source", "/rio/ses-flow-video.mp4"],
    ["img", "/Exceptions.png"],
    ["img", "/Approve.png"],
    ["img", "/Approvals.jpg"],
    ["img", "/rio/rio-approval-stages.jpg"],
  ],
  "morrovia": [
    ["img", "/morrovia/homepage-2026-11.webp"],
    ["img", "/morrovia/itinerary-2026-11.webp"],
    ["img", "/morrovia/transport-2026-11.webp"],
    ["img", "/morrovia/map-2026-11.webp"],
  ],
  "returns-kiosk": [
    ["img", "/Multi-Kiosk.png"],
    ["img", cloudinary + "amazoncase8_juwrkx.png"],
    ["img", cloudinary + "amazoncase5_iojjuv"],
    ["img", cloudinary + "amazoncase7_nqcd5t"],
    ["img", cloudinary + "amazoncase4_w6zzqt.jpg"],
    ["img", cloudinary + "amazoncase2_tgcmw0.png"],
    ["img", cloudinary + "amazoncase3_wmo0i6.png"],
  ],
  "farfetch": [
    ["img", "/ff.png"],
    ["img", "/farfetch-mobile.png"],
    ["img", cloudinary + "ff4_mhude1.png"],
    ["img", cloudinary + "ff-android2_dhic2u.jpg"],
    ["img", cloudinary + "ff5_ucwlrn.jpg"],
    ["img", cloudinary + "ff6_qk193d.png"],
  ],
};

function mediaOrder(html) {
  return [...html.matchAll(/<(img|source|iframe)\b[^>]*?\ssrc="([^"]*)"[^>]*>/g)].map(([, tag, escapedSrc]) => {
    const src = escapedSrc.replaceAll("&amp;", "&");
    // Development can use Next's image proxy while the static export emits
    // the original URLs. Compare the original source rather than the proxy.
    const url = new URL(src, origin);
    return [tag, url.pathname === "/_next/image" ? url.searchParams.get("url") : src];
  });
}

for (const [slug,title,...evidence] of cases) {
  const response = await fetch(new URL("/case-study/" + slug, origin));
  assert.equal(response.status, 200, slug);
  const html = await response.text();
  const article = html.match(/<article\b[^>]*>[\s\S]*?<\/article>/)?.[0] || "";
  assert.doesNotMatch(article, /aria-label="Breadcrumb"/i, slug);
  assert.ok(article.includes(title), slug + ": case title");
  const header = article.match(/<header\b[^>]*id="overview"[^>]*>[\s\S]*?<\/header>/)?.[0] ?? "";
  const scope = header.match(/<dl\b[^>]*id="scope"[^>]*>[\s\S]*?<\/dl>/)?.[0] ?? "";
  assert.ok(scope && header.indexOf(scope) < header.indexOf("<h1>"), slug + ": icon metadata belongs above the single title");
  assert.equal([...header.matchAll(/<h1>/g)].length, 1);
  assert.doesNotMatch(header, /case-detail-eyebrow/, slug + ": no duplicate project categories");
  assert.equal([...scope.matchAll(/<svg\b/g)].length, 3, slug + ": retain three icons");
  assert.deepEqual([...scope.matchAll(/<dd>(.*?)<\/dd>/g)].map(m => m[1]), expectedHeader[slug]);
  for (const value of evidence) assert.ok(article.includes(value), slug + ": " + value);
  for (const id of ["overview","scope","artifact","context","decisions","impact"]) assert.ok(article.includes('id="'+id+'"'), slug+": preserved anchor "+id);
  for (const id of ["context","decisions","impact"]) assert.ok(article.includes('href="#'+id+'"'), slug+": section jump "+id);
  assert.ok(article.indexOf('class="case-detail-outcomes') < article.indexOf('id="artifact"'), slug+": show the outcomes before the walkthrough");
  assert.ok(article.includes('aria-label="Open '), slug+": product image zoom");
  const artifact = article.match(/<figure\b[^>]*id="artifact"[^>]*>[\s\S]*?<\/figure>/)?.[0] ?? "";
  assert.deepEqual(mediaOrder(artifact), [expectedMedia[slug][0]], slug + ": same lead image as before redesign");
  assert.deepEqual(mediaOrder(article), expectedMedia[slug], slug + ": media sequence preserves the original story order with intentional replacements");
  if (slug === "returns-kiosk") {
    assert.doesNotMatch(html, /25 fewer steps|450 journeys|AMAZON-Kiosk-V2|Interactive Figma prototype showing the multiple-return flow|20\.59%|6\.58%|56 seconds|56 sec/i);
    assert.doesNotMatch(article, /(?:10x|10×).{0,24}(?:kiosk|unit)|(?:kiosk|unit).{0,24}(?:10x|10×)/i);
    assert.doesNotMatch(article, /<iframe\b/, "Retired private Amazon prototype is not rendered");
    assert.match(article, /Amazon Returns Kiosk multiple-return redesign screens/, "Keep the static multiple-return walkthrough");
  }
  if (slug === "returns-platform") assert.doesNotMatch(html, /to process two items|two-item processing|two items processed in 53 seconds/i);
  if (slug === "rio") assert.doesNotMatch(html, /zero re-keying/i);
  if (slug === "farfetch") assert.doesNotMatch(html, /boosted farfetch ipo/i);
  assert.match(article, /class="case-detail-challenge-title">The challenge/, slug + ": readable challenge hierarchy");
  if (slug === "morrovia") {
    assert.match(article, /aria-label="Morrovia product highlights"/);
    assert.doesNotMatch(html, /No established adoption, revenue or conversion outcomes/);
  }
  if (slug === "rio") {
    assert.match(article, /<video\b[^>]*poster="\/rio\/ses-flow-poster.webp"/);
    assert.match(article, /<video\b[^>]*loop=""/);
  }
  assert.doesNotMatch(article, /id="process" class="border-y/);
  assert.doesNotMatch(html, /class="flex flex-col gap-4 border-t hairline pt-8/);
  assert.ok(article.includes("Read next"), slug+": next study");
  console.log(slug+" OK");
}
