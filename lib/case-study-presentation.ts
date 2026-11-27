import type { CaseStudy, CaseStudyMedia } from "./case-studies";

export const caseStudyOrder = ["rio", "returns-platform", "morrovia", "returns-kiosk", "farfetch"];

// Presentation choices use existing case evidence; underlying case data stays intact.
export function caseStudyPresentation(study: CaseStudy) {
  const hero = study.slug === "rio" ? study.heroTestMedia!.desktop
    : study.slug === "morrovia" ? { src: "/morrovia/homepage-2026-11.webp", alt: "Morrovia’s Plan and Describe search above seven featured routes in Our Picks", caption: "Choose stops or describe a trip, with suggested journeys to explore." }
    : study.slug === "farfetch" ? study.postDecisionsShowcase!.media
    : study.overviewMedia![0];
  const intro = headerCopy[study.slug] ?? study.summary;
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

// Keep header context concise without inventing role titles or repeating project names.
const headerCopy: Record<string, string> = {
  "returns-platform": "One platform for customers to start returns and for retailers to set rules, route parcels and process them in store.",
  rio: "Turns paper field tickets into approved SAP service entry sheets using AI extraction, validation and exception handling.",
  morrovia: "A travel-planning beta that brings a multi-stop route, itinerary and connections into one editable plan.",
  farfetch: "Native shopping apps, plus a future retail concept exhibited at the London Design Museum.",
};

const headerRoles: Record<string, string> = {
  "returns-platform": "Founding Product Designer",
  rio: "Staff Product Designer",
  morrovia: "Founder & Product Designer",
  "returns-kiosk": "Founding | Senior Staff Product Designer",
  farfetch: "Senior Product Designer (contract)",
};

export function caseStudyHeader(study: CaseStudy) {
  const role = headerRoles[study.slug] ?? study.role;
  if (study.slug === "morrovia") return { role, affiliation: "Independent side project", affiliationLabel: "Context" };
  if (study.slug === "farfetch") return { role, affiliation: "iOS & Android", affiliationLabel: "Platforms" };
  return { role, affiliation: study.year, affiliationLabel: "Company" };
}
