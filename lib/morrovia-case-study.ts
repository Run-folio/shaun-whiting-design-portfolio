import type { CaseStudy } from "./case-studies";

// Reconciled 31 October 2026 against the public beta and dated local QA evidence.
// Local captures and future validation are qualified separately from public features.
// Evidence: release-evidence/2026-10-31/morrovia-editorial-reconciliation.md in the task workspace.
export const morroviaCaseStudy: CaseStudy = {
  slug: "morrovia",
  shortTitle: "Morrovia",
  eyebrow: "Morrovia / Travel / AI-assisted planning",
  title: "Complex trips, made simple",
  summary:
    "Founding, designing and building a travel-planning beta that brings a multi-stop route, itinerary and connections into one editable plan.",
  image: "/morrovia/transport-desktop.webp",
  imageAlt: "Morrovia beta connections workspace showing transport estimates and journeys that need checking",
  role: "Founder, product design and AI-assisted building",
  industry: "Travel / AI-assisted planning",
  year: "Morrovia",
  team: "Independent product",
  intro: {
    challenge: [
      "A multi-stop trip is a system of connected decisions: where to go, how long to stay, how to get there and what changes when one stop moves. Those decisions are often scattered across maps, spreadsheets, booking sites and notes. A convincing itinerary is only useful if the journey works in practice.",
    ],
    approach: [
      "I shaped the product direction, planning flows and interface, using AI-assisted implementation to turn design decisions into working screens. The focus is one editable plan, visible uncertainty and traveller control.",
    ],
    outcome: [
      "Morrovia is a public beta. This case study separates the public planning experience from dated local QA and mobile work. Adoption, revenue and conversion outcomes have not been established here.",
    ],
  },
  metrics: [
    { value: "Beta", label: "Product stage" },
    { value: "AI-assisted", label: "Design-to-build workflow" },
    { value: "Multi-modal", label: "Connected journey planning" },
    { value: "Editable", label: "Traveller stays in control" },
  ],
  overviewMedia: [
    {
      src: "/morrovia/transport-desktop.webp",
      alt: "Morrovia connections list with road and flight estimates plus transfers marked needs checking",
      caption: "Local product QA capture, 18 October 2026. Planning estimates and transfers needing verification are shown as different states. This demonstration trip is not evidence of completed travel or confirmation that this exact interface is public.",
      wide: true,
    },
  ],
  challenges: [
    "Turn an open-ended travel idea into a structured route",
    "Make the connections between destinations believable",
    "Keep the itinerary editable as plans change",
    "Make saved state and recovery understandable",
  ],
  sections: [
    {
      eyebrow: "Product vision",
      title: "A living plan, from first idea to departure",
      body: "The vision is a planning companion that helps someone shape a complex trip without losing control of it. A route is the starting point, then places, nights, activities and transport become parts of the same plan. The experience should support both exploration and practical decisions: what could this trip look like, and what still needs checking before I rely on it?",
    },
    {
      eyebrow: "Decision 01 / 03",
      title: "Start with intent, not a long form",
      body: "The public homepage offers two starting points: choose stops or describe a trip. I designed the flow around turning that intent into a suggested route the traveller can review and change. The aim is a useful starting point with visible assumptions, rather than a finished answer to accept. The example below shows a populated product-tour itinerary that the traveller can refine; demonstration data does not establish the accuracy of a generated plan.",
      resultChip: "Design principle → a starting point the traveller can change",
      media: [{
        src: "/morrovia/homepage-search.png",
        alt: "Morrovia public beta homepage with Plan with stops and Describe my trip options",
        caption: "Public beta homepage with stop-based search and a Describe my trip option. This is the planning entry point, not evidence of generation quality or booking availability.",
      }],
    },
    {
      eyebrow: "Decision 02 / 03",
      title: "Make the journey between places realistic",
      body: "A route on a map is not proof that a connection works. I designed distinct states for transport mode, planning estimates, booking status and transfers that need checking. The public experience presents travel between stops and flags timing to confirm. The dated local QA captures below explore these states in more detail; they do not establish verified timetables, available bookings or a fully released transport service.",
      resultChip: "Design principle → show uncertainty where the decision happens",
      media: [
        {
          src: "/morrovia/transport-mobile.webp",
          alt: "Mobile Morrovia connections view showing transport mode, estimated duration and booking controls",
          caption: "Local mobile QA capture, 18 October 2026. Transport modes, estimated duration and booking actions are visible in this tested interface. This is not a claim that newer mobile changes or these exact controls are live.",
          portrait: true,
        },
      ],
    },
    {
      eyebrow: "Decision 03 / 03",
      title: "Treat the saved trip as the product",
      body: "The public beta is built around an editable plan, with My Trips as the place to return to it. My design work also treats saving, reopening and recovery as core product behaviour. The saved trip below shows a Tokyo day plan alongside its map. A visible save message is not proof of complete persistence reliability; that remains a validation task.",
      resultChip: "Design principle → reliability earns the right to feel simple",
      media: [
        {
          src: "/morrovia/map-saved-tokyo.png",
          alt: "Morrovia saved-trip map with Tokyo day two and the Asakusa and Senso-ji activity",
          caption: "Actual Morrovia saved-trip view, captured 2 November 2026, showing the Tokyo day plan and Asakusa & Senso-ji. The save message is visible interface feedback, not proof of complete persistence reliability or completed travel.",
          wide: true,
        },
      ],
    },
    {
      eyebrow: "AI-assisted building",
      title: "Close the gap between a design and a working product",
      body: "As founder and designer, I moved between product direction, interaction design and AI-assisted implementation. I defined the trip structure, editing flows, uncertainty states and recovery behaviour, then used working screens to expose constraints a static prototype could hide. AI supported implementation and iteration; product judgement, review and verification remained my responsibility.",
    },
    {
      eyebrow: "Process",
      title: "Test the whole journey, including the awkward states",
      body: "The dated local QA captures cover transport presentation, itinerary editing, map drawers and saved-state feedback, using synthetic fixtures where needed. More recent mobile work is locally tested and is not presented here as a public release. These checks are implementation evidence, not a formal usability study or a measured conversion lift. The next step is to observe travellers planning real trips and test comprehension, reliability and recovery.",
      media: [
        {
          src: "/morrovia/map-mobile.webp",
          alt: "Morrovia mobile map with an expanded itinerary drawer and synthetic test activities",
          caption: "Local mobile QA capture, 18 October 2026, with synthetic activities. The expanded drawer keeps the destination and day in context. This dated test interface does not establish that later mobile workspace changes are publicly released.",
          portrait: true,
        },
      ],
    },
  ],
  impact: {
    quantitative: [],
    qualitative: [
      "Stage|Beta; still being validated",
      "Product evidence|Public planning entry points and dated local QA",
      "Commercial outcomes|No verified figures reported",
      "Release scope|Public beta; newer local work remains unreleased",
    ],
  },
  nextSteps: [
    {
      title: "Trust is part of the interface",
      text: "An estimate, a booking and a connection needing confirmation must feel different. Clarity about uncertainty is as useful as the recommendation itself.",
    },
    {
      title: "Reliability comes before polish",
      text: "A beautiful generated itinerary is not enough. Editing, saving, reopening and recovery determine whether someone can depend on the plan.",
    },
    {
      title: "Validate with real planning",
      text: "Use observed travel-planning sessions to assess comprehension and friction. Establish a baseline before reporting adoption or business impact.",
    },
  ],
};
