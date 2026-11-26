import type { CaseStudy, CaseStudyMedia } from "./case-studies";

export const caseStudyOrder = ["rio", "returns-platform", "morrovia", "returns-kiosk", "farfetch"];

// Presentation choices use existing case evidence; underlying case data stays intact.
export function caseStudyPresentation(study: CaseStudy) {
  const hero = study.slug === "rio" ? study.heroTestMedia!.desktop
    : study.slug === "morrovia" ? { src: "/morrovia/homepage-2026-11.webp", alt: "Morrovia’s Plan and Describe search above seven featured routes in Our Picks", caption: "Choose stops or describe a trip, with suggested journeys to explore." }
    : study.slug === "farfetch" ? study.postDecisionsShowcase!.media
    : study.overviewMedia![0];
  const intro = study.slug === "rio"
    ? "Rio turns hydrocarbon field tickets into approved SAP service entry sheets using AI extraction, validation, exception handling and orchestrated approvals."
    : study.slug === "returns-platform"
      ? "A B2B SaaS returns platform connecting customer initiation, merchant configuration, orchestration and store processing across five continents."
      : study.summary;
  const outcomeScope = study.slug === "rio" ? "Across field and back-office operations." : undefined;
  return { hero, intro, outcomeScope };
}

// Replace the explicitly-labelled draft placeholder with a verified real asset.
// This shows the entry point, not a fictional natural-language planning screen.
export function presentCaseStudyMedia(item: CaseStudyMedia): CaseStudyMedia {
  return item.src === "/morrovia/planning-placeholder.svg"
    ? { src: "/morrovia/homepage-2026-11.webp", alt: "Morrovia homepage with Plan and Describe options above Our Picks", caption: "Travellers can enter their stops, describe a trip or start with a featured route." }
    : item;
}

// Keep the useful categories while omitting project-name prefixes repeated in H1.
export function caseStudyEyebrow(study: CaseStudy) {
  const names = [study.shortTitle, study.title].filter(Boolean).map(name => name!.toLowerCase());
  return study.eyebrow.split(/\s*\/\s*|\s*\|\s*/).filter(category => {
    const label = category.toLowerCase();
    return !names.some(name => name === label || name.startsWith(label + " "));
  }).join(" | ");
}
