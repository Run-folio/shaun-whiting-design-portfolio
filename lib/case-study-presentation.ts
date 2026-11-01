import type { CaseStudy, CaseStudyMedia } from "./case-studies";

export const caseStudyOrder = ["rio", "returns-platform", "morrovia", "returns-kiosk", "farfetch"];

// Presentation choices use existing case evidence; underlying case data stays intact.
export function caseStudyPresentation(study: CaseStudy) {
  const hero = study.slug === "rio" ? study.heroTestMedia!.desktop
    : study.slug === "morrovia" ? { src: "/morrovia/homepage-search.png", alt: "Morrovia homepage with multi-stop trip search", caption: "Actual Morrovia beta homepage with multi-stop search and the option to describe a trip." }
    : study.slug === "farfetch" ? study.postDecisionsShowcase!.media
    : study.overviewMedia![0];
  const intro = study.slug === "rio"
    ? "Rio turns hydrocarbon field tickets into approved SAP service entry sheets using AI extraction, validation, exception handling and orchestrated approvals."
    : study.slug === "returns-platform"
      ? "A B2B SaaS returns platform connecting customer initiation, merchant configuration, orchestration and store processing across five continents."
      : study.summary;
  const outcomeScope = study.slug === "rio" ? "Across field and back-office operations."
    : study.slug === "morrovia" ? "No established adoption, revenue or conversion outcomes." : undefined;
  return { hero, intro, outcomeScope };
}

// Replace the explicitly-labelled draft placeholder with a verified real asset.
// This shows the entry point, not a fictional natural-language planning screen.
export function presentCaseStudyMedia(item: CaseStudyMedia): CaseStudyMedia {
  return item.src === "/morrovia/planning-placeholder.svg"
    ? { src: "/morrovia/homepage-search.png", alt: "Morrovia beta homepage with trip search and a Describe my trip option", caption: "Actual beta homepage. Travellers can start with stops or choose to describe their trip; this capture shows the entry point." }
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
