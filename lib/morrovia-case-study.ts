import type { CaseStudy } from "./case-studies";

// Current product context and read-only captures; no unverified impact metrics.
export const morroviaCaseStudy: CaseStudy = {
  slug: "morrovia",
  shortTitle: "Morrovia",
  eyebrow: "Morrovia / Travel / AI-assisted planning",
  title: "Complex trips, made simple",
  summary:
    "Founding, designing and building a travel-planning beta that brings a multi-stop route, itinerary and connections into one editable plan.",
  image: "/morrovia/homepage-complete.png",
  imageAlt: "Morrovia trip search with complete suggested journey cards",
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
      "Morrovia is a public beta bringing route planning, itineraries and connections into one editable workspace.",
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
      src: "/morrovia/transport-current.png",
      alt: "Morrovia Japan, China and Hong Kong connections with transport estimates and booking states",
      caption: "Transport mode, estimated duration and booking state stay visible between stops.",
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
      body: "The public homepage offers two starting points: choose stops or describe a trip. I designed the flow around turning that intent into a suggested route the traveller can review and change. The aim is a useful starting point with visible assumptions, rather than a finished answer to accept. The itinerary brings day-by-day planning and activity ideas into the same workspace.",
      resultChip: "Design principle → a starting point the traveller can change",
      media: [{
        src: "/morrovia/itinerary-current.png",
        alt: "Current Tokyo itinerary with day parts, trip stops and activity suggestions",
        caption: "A day-by-day itinerary keeps travel, open time and activity ideas together.",
      }],
    },
    {
      eyebrow: "Decision 02 / 03",
      title: "Make the journey between places realistic",
      body: "A route on a map is not proof that a connection works. I designed distinct states for transport mode, planning estimates, booking status and transfers that need checking. The public experience presents travel between stops and flags timing to confirm.",
      resultChip: "Design principle → show uncertainty where the decision happens",
      media: [
        {
          src: "/morrovia/transport-current.png",
          alt: "Morrovia connections showing transport mode, estimated duration and booking state",
          caption: "Transport mode, estimated duration and booking state stay visible between stops.",
          wide: true,
        },
      ],
    },
    {
      eyebrow: "Decision 03 / 03",
      title: "Treat the saved trip as the product",
      body: "My Trips gives the plan a place to return to. I designed the route, itinerary and map as connected views of the same saved trip, so travellers can pick up their planning where they left off.",
      resultChip: "Design principle → reliability earns the right to feel simple",
      media: [
        {
          src: "/morrovia/map-route-current.png",
          alt: "Whole-trip map connecting London, Japan, China and Hong Kong with numbered stops and transport modes",
          caption: "The full route keeps stop order and travel between places in view.",
          wide: true,
        },
      ],
    },
    {
      eyebrow: "AI-assisted building",
      title: "Close the gap between a design and a working product",
      body: "As founder and designer, I moved between product direction, interaction design and AI-assisted implementation. I defined the trip structure, editing flows, uncertainty states and recovery behaviour, then used working screens to expose constraints a static prototype could hide. AI supported implementation and iteration; product judgement, review and verification remained my responsibility.",
    },

  ],
  impact: {
    quantitative: [],
    qualitative: [
      "Stage|Beta; still being validated",
      "Product evidence|Search, itinerary, transport and saved-trip map",
      "Commercial outcomes|No verified figures reported",
      "Release scope|Public beta",
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
