// Run against next dev/start or the static preview: node tests/brand-case-studies.mjs URL
import assert from "node:assert/strict";
const origin = process.argv[2] || "http://localhost:3000";
const cases = [
  ["returns-platform", "Doddle Returns Platform", "$12M", "88.2%", "Average processing time"],
  ["rio", "Rio", "87%", "Across field and back-office operations."],
  ["morrovia", "Morrovia", "Beta", "No established adoption, revenue or conversion outcomes."],
  ["returns-kiosk", "Amazon Returns Kiosk", "$60M", "$22.5M", "28% shorter", "69% lower"],
  ["farfetch", "Farfetch Mobile", "4.8★", "20M+"],
];
// Visual evidence in reading and gallery order, captured from the rendered
// pre-redesign portfolio (62c9ad4a), minus the retired Amazon prototype.
const cloudinary = "https://res.cloudinary.com/dbt3wkwa3/image/upload/f_auto,q_auto/";
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
    ["img", "/morrovia/homepage-complete.png"],
    ["img", "/morrovia/itinerary-current.png"],
    ["img", "/morrovia/transport-current.png"],
    ["img", "/morrovia/map-route-current.png"],
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
  for (const value of evidence) assert.ok(article.includes(value), slug + ": " + value);
  for (const id of ["overview","scope","artifact","context","decisions","impact"]) assert.ok(article.includes('id="'+id+'"'), slug+": preserved anchor "+id);
  for (const id of ["context","decisions","impact"]) assert.ok(article.includes('href="#'+id+'"'), slug+": section jump "+id);
  assert.ok(article.indexOf('class="case-detail-outcomes') < article.indexOf('id="artifact"'), slug+": show the outcomes before the walkthrough");
  assert.ok(article.includes('aria-label="Open '), slug+": product image zoom");
  const artifact = article.match(/<figure\b[^>]*id="artifact"[^>]*>[\s\S]*?<\/figure>/)?.[0] ?? "";
  assert.deepEqual(mediaOrder(artifact), [expectedMedia[slug][0]], slug + ": same lead image as before redesign");
  assert.deepEqual(mediaOrder(article), expectedMedia[slug], slug + ": image, video and embed reading order matches pre-redesign");
  if (slug === "returns-kiosk") {
    assert.doesNotMatch(html, /25 fewer steps|450 journeys|AMAZON-Kiosk-V2|Interactive Figma prototype showing the multiple-return flow|20\.59%|6\.58%|56 seconds|56 sec/i);
    assert.doesNotMatch(article, /<iframe\b/, "Retired private Amazon prototype is not rendered");
    assert.match(article, /Amazon Returns Kiosk multiple-return redesign screens/, "Keep the static multiple-return walkthrough");
  }
  if (slug === "returns-platform") assert.doesNotMatch(html, /to process two items|two-item processing|two items processed in 53 seconds/i);
  if (slug === "rio") assert.doesNotMatch(html, /zero re-keying/i);
  if (slug === "farfetch") assert.doesNotMatch(html, /boosted farfetch ipo/i);
  assert.ok(article.includes("Read next"), slug+": next study");
  console.log(slug+" OK");
}
