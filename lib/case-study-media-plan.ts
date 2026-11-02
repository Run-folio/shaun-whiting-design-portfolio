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
      decisions[0].media = undefined; // Keep the extraction explanation and result without the field-ticket image.
      break;
    case "returns-platform":
      decisions[0].media = decisions[0].media?.map(item => ({ ...item, alt: "Merchant returns queue with statuses and exceptions", caption: "The merchant returns queue showing return status and exceptions." }));
      decisions[2].media = [
        { ...study.postDecisionsShowcase!.media, wide: true },
        ...decisions[2].media!.map(item => ({ ...item, alt: "Configured carrier methods for return routing", caption: "Carrier methods configured for return routing." })),
      ];
      if (process) process.media = process.media?.map(item => ({ ...item, caption: item.src.includes("store4_en3nyf") ? "Store dispatch states: open totes, ready to dispatch and dispatched." : item.src.includes("portal5") ? "Merchant configuration: rule priorities, tags and status." : "Carrier selection rules and the default carrier." }));
      break;
    case "morrovia":
      decisions[1].media = study.overviewMedia?.map(item => ({ ...item, wide: true }));
      break;
    case "returns-kiosk":
      decisions[0].comparison = undefined;
      decisions[0].media = decisions[0].media?.map(item => ({ ...item, caption: "The scan prompt, parcel constraints and scan-success confirmation." }));
      if (decisions[2].comparison) decisions[2].comparison = {
        ...decisions[2].comparison,
        before: { ...decisions[2].comparison.before, alt: "Amazon return kiosks installed in a grocery store", caption: "Physical kiosk installation in a grocery store." },
        after: { ...decisions[2].comparison.after, alt: "Amazon return kiosk beside a parcel hatch in a retail store", caption: "Physical kiosk and parcel hatch in a retail store." },
        beforeLabel: "Grocery store",
        afterLabel: "Retail store",
        label: "Slide to explore two physical kiosk installations and their retail context.",
      };
      break;
    case "farfetch": {
      const retail = sections.find(section => section.eyebrow === "Retail innovation");
      const designs = sections.find(section => section.eyebrow === "Key designs");
      const native = sections.find(section => section.eyebrow === "Design");
      const mirror = native?.media?.[0];
      if (native) native.media = [
        { ...study.overviewMedia![0], alt: "Farfetch iOS discovery, product and shopping-bag screens", caption: "The iOS shopping journey, from discovery to the shopping bag." },
        { ...study.overviewMedia![1], alt: "Farfetch Android discovery and product-detail screens", caption: "Android discovery, navigation and product-detail screens." },
        { ...study.challengeMedia![0], alt: "Farfetch Android basket, delivery, payment and confirmation screens", caption: "The Android checkout journey, from basket to order confirmation." },
      ];
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
