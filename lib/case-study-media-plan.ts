import type { CaseStudy, CaseStudyMedia } from "./case-studies";
import { presentCaseStudyMedia } from "./case-study-presentation";

// Curate once per explanatory purpose, then keep both the page and lightbox unique.
// Source case-study content and assets remain available; this is presentation only.
export function caseStudyMediaPlan(study: CaseStudy, hero: CaseStudyMedia) {
  const sections = study.sections.map(section => ({ ...section, media: section.media?.map(presentCaseStudyMedia) }));
  const decisions = sections.filter(section => section.eyebrow?.toLowerCase().startsWith("decision"));
  const process = sections.find(section => section.eyebrow?.toLowerCase() === "process");
  let walkthrough: CaseStudyMedia | undefined;

  switch (study.slug) {
    case "rio":
      walkthrough = study.overviewMedia?.[0]; // The motion prototype adds a distinct explanation.
      decisions[0].media = [{ src: "/rio/rio-field-ticket.png", alt: "Redacted field-ticket example with labour and equipment line items", caption: "A redacted field-ticket example: the labour and equipment lines that need to become structured data.", wide: true }];
      if (process) process.media = process.media?.slice(0, 1); // One clear approval-flow diagram.
      break;
    case "returns-platform":
      decisions[0].media = undefined; // The admin list does not explain merchant-branded initiation.
      decisions[2].media = [{ ...study.postDecisionsShowcase!.media, wide: true }];
      if (process) process.media = process.media?.filter(item => item.src.includes("store4_en3nyf")).map(item => ({ ...item, caption: "Store dispatch states: open totes, ready to dispatch and dispatched." }));
      break;
    case "morrovia":
      decisions[0].media = [{ src: "/morrovia/itinerary-workspace.png", alt: "Sample Cusco itinerary populated with activities and day parts", caption: "Existing product-tour capture of a populated Cusco itinerary. This is demonstration data, not a customer trip or evidence of newly released mobile work.", wide: true }];
      decisions[1].media = study.overviewMedia?.map(item => ({ ...item, wide: true }));
      if (process) process.media = undefined; // The desktop map already shows the populated activity plan.
      break;
    case "returns-kiosk":
      decisions[0].media = undefined;
      decisions[0].comparison = undefined;
      decisions[2].comparison = undefined; // Source pair is physical kiosk photos, not an interface before/after.
      if (process) process.media = process.media?.filter(item => !item.src.includes("amazoncase4_w6zzqt"));
      break;
    case "farfetch": {
      const retail = sections.find(section => section.eyebrow === "Retail innovation");
      const designs = sections.find(section => section.eyebrow === "Key designs");
      const native = sections.find(section => section.eyebrow === "Design");
      const mirror = native?.media?.[0];
      if (native) native.media = undefined;
      if (retail) retail.media = [{ ...study.challengeMedia![1], alt: "Farfetch Store of the Future mirror installed in a retail setting", caption: "The physical fitting-room mirror installation for Store of the Future.", wide: true }];
      if (designs && mirror) designs.media = [{ ...mirror, alt: "Farfetch interactive mirror clothing-selection interface", caption: "The mirror interface showing clothing selection and related items.", wide: true }];
      break;
    }
  }

  const gallery: CaseStudyMedia[] = [hero];
  const seen = new Set([hero.src]);
  function claim(item: CaseStudyMedia) {
    if (seen.has(item.src)) return false;
    seen.add(item.src);
    if (!item.type || item.type === "image") gallery.push(item);
    return true;
  }
  if (walkthrough && !claim(walkthrough)) walkthrough = undefined;
  for (const section of sections) {
    if (section.comparison) {
      if (seen.has(section.comparison.before.src) || seen.has(section.comparison.after.src)) section.comparison = undefined;
      else { claim(section.comparison.before); claim(section.comparison.after); }
    }
    section.media = section.media?.filter(claim);
  }
  return { sections, walkthrough, gallery };
}
