/**
 * Editorial route knowledge for EasyT.
 *
 * This is deliberately separate from generated itinerary documents. A route is
 * a reusable, reviewable starting point; a trip is the traveller's editable
 * copy. Durations are planning allowances until a live operator feed is wired.
 */
export type RouteRegion = "asia" | "europe" | "south-america" | "central-america" | "africa";
export type RouteInterest = "food" | "culture" | "nature" | "rail" | "coast" | "hiking" | "wildlife";
export type RouteConfidence = "high" | "medium" | "needs-review";

export type RouteConnection = {
  from: string;
  to: string;
  mode: "train" | "bus" | "road" | "ferry" | "flight";
  planningMinutes: number | null;
  note: string;
  confidence: RouteConfidence;
};

export type RouteFamily = {
  key: string;
  title: string;
  region: RouteRegion;
  countries: string[];
  interests: RouteInterest[];
  bestFor: string;
  suggestedDays: { min: number; ideal: number; max: number };
  bases: string[];
  stops: Array<{ name: string; country: string; coordinates: [number, number]; minimumNights: number; reason: string }>;
  connections: RouteConnection[];
  seasonalNotes: string[];
  sourceLinks: Array<{ label: string; url: string; covers: string }>;
  confidence: RouteConfidence;
  reviewedAt: string;
};

const verify = "Verify current schedules, entry rules and opening hours before booking.";

export const routeFamilies: RouteFamily[] = [
  {
    key: "japan-slow",
    title: "Japan, one good day at a time",
    region: "asia",
    countries: ["Japan"],
    interests: ["food", "culture", "rail"],
    bestFor: "A first Japan trip with room for neighbourhoods, meals and slower mornings.",
    suggestedDays: { min: 8, ideal: 10, max: 14 },
    bases: ["Tokyo", "Takayama", "Kyoto"],
    stops: [
      { name: "Tokyo", country: "Japan", coordinates: [139.6917, 35.6895], minimumNights: 3, reason: "An energetic opening chapter with enough time to settle in." },
      { name: "Takayama", country: "Japan", coordinates: [137.2523, 36.146], minimumNights: 2, reason: "A smaller mountain base that changes the rhythm between cities." },
      { name: "Kyoto", country: "Japan", coordinates: [135.7681, 35.0116], minimumNights: 3, reason: "A walkable cultural finish that rewards unplanned time." },
    ],
    connections: [
      { from: "Tokyo", to: "Takayama", mode: "train", planningMinutes: 300, note: `Rail and regional connection allowance. ${verify}`, confidence: "medium" },
      { from: "Takayama", to: "Kyoto", mode: "train", planningMinutes: 260, note: `Regional rail connection allowance. ${verify}`, confidence: "medium" },
    ],
    seasonalNotes: ["Spring and autumn are popular and need earlier accommodation planning.", "Summer is hot and humid in cities; keep hiking days flexible."],
    sourceLinks: [
      { label: "Japan Travel", url: "https://www.japan.travel/en/", covers: "Official destination and regional context" },
      { label: "Japan Railways", url: "https://www.japanrailpass-reservation.net/", covers: "Rail planning reference" },
    ],
    confidence: "medium",
    reviewedAt: "2026-08-08",
  },
  {
    key: "taiwan-rail",
    title: "Taiwan by train",
    region: "asia",
    countries: ["Taiwan"],
    interests: ["food", "rail", "culture"],
    bestFor: "Low-friction movement, night markets and a route that keeps changing without changing hotels every night.",
    suggestedDays: { min: 6, ideal: 8, max: 12 },
    bases: ["Taipei", "Taichung", "Tainan"],
    stops: [
      { name: "Taipei", country: "Taiwan", coordinates: [121.5654, 25.033], minimumNights: 3, reason: "A food-led opening with excellent local transport." },
      { name: "Taichung", country: "Taiwan", coordinates: [120.6736, 24.1477], minimumNights: 2, reason: "A useful mid-route pause with arts and tea country nearby." },
      { name: "Tainan", country: "Taiwan", coordinates: [120.227, 22.9997], minimumNights: 2, reason: "A slower, food-first finish." },
    ],
    connections: [{ from: "Taipei", to: "Taichung", mode: "train", planningMinutes: 100, note: `High-speed rail allowance. ${verify}`, confidence: "medium" }, { from: "Taichung", to: "Tainan", mode: "train", planningMinutes: 100, note: `High-speed rail allowance. ${verify}`, confidence: "medium" }],
    seasonalNotes: ["Typhoon season can affect east-coast plans; keep alternatives inland.", "Summer heat and rain favour shorter, neighbourhood-led days."],
    sourceLinks: [{ label: "Taiwan Tourism", url: "https://eng.taiwan.net.tw/", covers: "Official destination context" }, { label: "Taiwan Railways", url: "https://www.railway.gov.tw/tra-tip-web/tip", covers: "Rail operator reference" }],
    confidence: "medium",
    reviewedAt: "2026-08-08",
  },
  {
    key: "andean-highlands",
    title: "Andean highlands, gently",
    region: "south-america",
    countries: ["Peru", "Bolivia"],
    interests: ["nature", "culture", "hiking"],
    bestFor: "Big landscapes with altitude, recovery time and fewer rushed transfers.",
    suggestedDays: { min: 9, ideal: 12, max: 18 },
    bases: ["Cusco", "Sacred Valley", "Arequipa"],
    stops: [
      { name: "Cusco", country: "Peru", coordinates: [-71.9785, -13.517], minimumNights: 3, reason: "Start gently and let the body adjust to altitude." },
      { name: "Sacred Valley", country: "Peru", coordinates: [-72.115, -13.308], minimumNights: 3, reason: "A lower-pressure base for landscapes and heritage sites." },
      { name: "Arequipa", country: "Peru", coordinates: [-71.5375, -16.409], minimumNights: 2, reason: "A lower-key final chapter with a different climate and scale." },
    ],
    connections: [{ from: "Cusco", to: "Sacred Valley", mode: "road", planningMinutes: 120, note: `Road transfer allowance; altitude and traffic can change the day. ${verify}`, confidence: "medium" }, { from: "Sacred Valley", to: "Arequipa", mode: "flight", planningMinutes: 360, note: `Door-to-door flight allowance. ${verify}`, confidence: "needs-review" }],
    seasonalNotes: ["Wet-season conditions can change trekking access and road times.", "Altitude affects pacing; the engine should never promise a strenuous day immediately after arrival."],
    sourceLinks: [{ label: "Peru Travel", url: "https://www.peru.travel/en", covers: "Official destination context" }, { label: "UNESCO World Heritage", url: "https://whc.unesco.org/en/statesparties/pe", covers: "Heritage sites and significance" }],
    confidence: "medium",
    reviewedAt: "2026-08-08",
  },
  {
    key: "portugal-atlantic",
    title: "The Atlantic reset",
    region: "europe",
    countries: ["Portugal"],
    interests: ["coast", "food", "culture"],
    bestFor: "A city-to-coast route with fewer hotel changes and weather-flexible days.",
    suggestedDays: { min: 6, ideal: 7, max: 12 },
    bases: ["Lisbon", "Comporta", "Lagos"],
    stops: [
      { name: "Lisbon", country: "Portugal", coordinates: [-9.1393, 38.7223], minimumNights: 2, reason: "A colourful, walkable opening with food and neighbourhood energy." },
      { name: "Comporta", country: "Portugal", coordinates: [-8.79, 38.38], minimumNights: 2, reason: "A genuine pause between city and coast." },
      { name: "Lagos", country: "Portugal", coordinates: [-8.6742, 37.1028], minimumNights: 2, reason: "Wide-open Atlantic days and a relaxed finish." },
    ],
    connections: [{ from: "Lisbon", to: "Comporta", mode: "road", planningMinutes: 120, note: `Road allowance. ${verify}`, confidence: "medium" }, { from: "Comporta", to: "Lagos", mode: "road", planningMinutes: 240, note: `Road allowance. ${verify}`, confidence: "medium" }],
    seasonalNotes: ["Summer is busier and more expensive along the coast.", "Spring and early autumn often give a better balance of weather and space."],
    sourceLinks: [{ label: "Visit Portugal", url: "https://www.visitportugal.com/en", covers: "Official destination context" }, { label: "Visit Lisboa", url: "https://www.visitlisboa.com/en", covers: "City context" }],
    confidence: "medium",
    reviewedAt: "2026-08-08",
  },
  {
    key: "vietnam-cambodia",
    title: "Vietnam to Angkor, without rushing",
    region: "asia",
    countries: ["Vietnam", "Cambodia"],
    interests: ["food", "culture", "nature"],
    bestFor: "A first Southeast Asia route with street food, river landscapes, and a strong cultural finish.",
    suggestedDays: { min: 12, ideal: 16, max: 22 },
    bases: ["Hanoi", "Hoi An", "Ho Chi Minh City", "Siem Reap"],
    stops: [
      { name: "Hanoi", country: "Vietnam", coordinates: [105.8342, 21.0278], minimumNights: 3, reason: "A lively, food-led opening with a walkable old quarter." },
      { name: "Hoi An", country: "Vietnam", coordinates: [108.338, 15.88], minimumNights: 3, reason: "A slower central base for food, bicycles, and coast time." },
      { name: "Ho Chi Minh City", country: "Vietnam", coordinates: [106.6297, 10.8231], minimumNights: 3, reason: "A high-energy southern chapter before the border crossing." },
      { name: "Siem Reap", country: "Cambodia", coordinates: [103.8564, 13.3633], minimumNights: 3, reason: "A generous base for Angkor rather than a rushed day trip." },
    ],
    connections: [{ from: "Hanoi", to: "Hoi An", mode: "flight", planningMinutes: 240, note: `Domestic flight allowance; compare overnight rail for a slower alternative. ${verify}`, confidence: "medium" }, { from: "Hoi An", to: "Ho Chi Minh City", mode: "flight", planningMinutes: 240, note: `Domestic flight allowance. ${verify}`, confidence: "medium" }, { from: "Ho Chi Minh City", to: "Siem Reap", mode: "flight", planningMinutes: 300, note: `Cross-border flight allowance; confirm entry requirements. ${verify}`, confidence: "needs-review" }],
    seasonalNotes: ["Monsoon patterns vary by coast and region; avoid treating Vietnam as one weather season.", "Angkor is best with early starts and a protected recovery afternoon."],
    sourceLinks: [{ label: "Vietnam Tourism", url: "https://vietnam.travel/", covers: "Official destination context" }, { label: "Visit Cambodia", url: "https://www.tourismcambodia.com/", covers: "Official tourism context" }, { label: "UNESCO Angkor", url: "https://whc.unesco.org/en/list/668/", covers: "Heritage context" }],
    confidence: "needs-review",
    reviewedAt: "2026-08-08",
  },
  {
    key: "colombia-ecuador",
    title: "Colombia to Ecuador, city to cloud forest",
    region: "south-america",
    countries: ["Colombia", "Ecuador"],
    interests: ["culture", "nature", "food", "hiking"],
    bestFor: "A varied Andean route that moves from city energy to coffee country and highland landscapes.",
    suggestedDays: { min: 12, ideal: 16, max: 22 },
    bases: ["Bogotá", "Medellín", "Salento", "Quito"],
    stops: [
      { name: "Bogotá", country: "Colombia", coordinates: [-74.0721, 4.711], minimumNights: 3, reason: "A cultural opening that gives context before smaller places." },
      { name: "Medellín", country: "Colombia", coordinates: [-75.5812, 6.2442], minimumNights: 3, reason: "A warm-weather city base with neighbourhoods and day-trip options." },
      { name: "Salento", country: "Colombia", coordinates: [-75.57, 4.637], minimumNights: 3, reason: "A compact coffee-country base with space for a valley hike." },
      { name: "Quito", country: "Ecuador", coordinates: [-78.4678, -0.1807], minimumNights: 3, reason: "A highland finish that needs a lighter first day at altitude." },
    ],
    connections: [{ from: "Bogotá", to: "Medellín", mode: "flight", planningMinutes: 220, note: `Domestic flight allowance. ${verify}`, confidence: "medium" }, { from: "Medellín", to: "Salento", mode: "road", planningMinutes: 420, note: `Long road transfer allowance; break the journey if needed. ${verify}`, confidence: "needs-review" }, { from: "Salento", to: "Quito", mode: "flight", planningMinutes: 420, note: `Cross-border flight allowance; check routing and entry requirements. ${verify}`, confidence: "needs-review" }],
    seasonalNotes: ["Rain can change mountain-road times; preserve a buffer before flights.", "Quito and nearby highlands require altitude-aware pacing."],
    sourceLinks: [{ label: "Colombia Travel", url: "https://colombia.travel/en", covers: "Official destination context" }, { label: "Ecuador Travel", url: "https://ecuador.travel/en/", covers: "Official destination context" }],
    confidence: "needs-review",
    reviewedAt: "2026-08-08",
  },
  {
    key: "italy-table",
    title: "Italy between tables",
    region: "europe",
    countries: ["Italy"],
    interests: ["food", "culture", "rail"],
    bestFor: "A rail-friendly first Italy route where each base has a distinct appetite and rhythm.",
    suggestedDays: { min: 8, ideal: 12, max: 18 },
    bases: ["Bologna", "Florence", "Rome"],
    stops: [
      { name: "Bologna", country: "Italy", coordinates: [11.3426, 44.4949], minimumNights: 3, reason: "A food-first opening that is easy to explore without rushing." },
      { name: "Florence", country: "Italy", coordinates: [11.2558, 43.7696], minimumNights: 3, reason: "A concentrated cultural chapter with manageable day trips." },
      { name: "Rome", country: "Italy", coordinates: [12.4964, 41.9028], minimumNights: 4, reason: "A high-density finish that deserves protected time." },
    ],
    connections: [{ from: "Bologna", to: "Florence", mode: "train", planningMinutes: 100, note: `High-speed rail allowance. ${verify}`, confidence: "high" }, { from: "Florence", to: "Rome", mode: "train", planningMinutes: 120, note: `High-speed rail allowance. ${verify}`, confidence: "high" }],
    seasonalNotes: ["Spring and autumn offer a better balance of heat and crowd levels.", "Reserve high-demand museums and rail legs around public holidays."],
    sourceLinks: [{ label: "Italia.it", url: "https://www.italia.it/en", covers: "Official destination context" }, { label: "Trenitalia", url: "https://www.trenitalia.com/en.html", covers: "Rail operator reference" }],
    confidence: "high",
    reviewedAt: "2026-08-08",
  },
  {
    key: "balkans-overland",
    title: "The Balkans, one border at a time",
    region: "europe",
    countries: ["Croatia", "Montenegro", "Albania"],
    interests: ["coast", "nature", "culture"],
    bestFor: "A flexible Adriatic route for travellers who want coast, mountains, and fewer predictable city breaks.",
    suggestedDays: { min: 10, ideal: 14, max: 21 },
    bases: ["Dubrovnik", "Kotor", "Shkodër", "Tirana"],
    stops: [
      { name: "Dubrovnik", country: "Croatia", coordinates: [18.0944, 42.6507], minimumNights: 2, reason: "A dramatic coastal opening; use it as a base rather than a checklist." },
      { name: "Kotor", country: "Montenegro", coordinates: [18.7712, 42.4247], minimumNights: 3, reason: "A mountain-and-bay pause with flexible day-trip options." },
      { name: "Shkodër", country: "Albania", coordinates: [19.503, 42.0683], minimumNights: 2, reason: "A softer landing into northern Albania and the mountains." },
      { name: "Tirana", country: "Albania", coordinates: [19.8187, 41.3275], minimumNights: 3, reason: "A lively finish with access to a wider range of day trips." },
    ],
    connections: [{ from: "Dubrovnik", to: "Kotor", mode: "bus", planningMinutes: 180, note: `Border-crossing coach allowance; queues can change the day. ${verify}`, confidence: "needs-review" }, { from: "Kotor", to: "Shkodër", mode: "bus", planningMinutes: 240, note: `Cross-border road allowance. ${verify}`, confidence: "needs-review" }, { from: "Shkodër", to: "Tirana", mode: "bus", planningMinutes: 150, note: `Intercity coach allowance. ${verify}`, confidence: "medium" }],
    seasonalNotes: ["Summer coast demand is high; shoulder season improves flexibility.", "Border crossings need buffer and should not be paired with a fixed timed activity."],
    sourceLinks: [{ label: "Croatia Tourism", url: "https://croatia.hr/en-gb", covers: "Official destination context" }, { label: "Montenegro Travel", url: "https://www.montenegro.travel/en", covers: "Official destination context" }, { label: "Albania Tourism", url: "https://albania.al/", covers: "Official destination context" }],
    confidence: "needs-review",
    reviewedAt: "2026-08-08",
  },
];

export const routeFamilyByKey = Object.fromEntries(routeFamilies.map((route) => [route.key, route]));

export function scoreRouteFamily(route: RouteFamily, input: { days?: number; interests?: RouteInterest[]; region?: RouteRegion }) {
  const interestMatches = input.interests?.filter((interest) => route.interests.includes(interest)).length ?? 0;
  const dayFit = input.days === undefined ? 0 : input.days >= route.suggestedDays.min && input.days <= route.suggestedDays.max ? 2 : -1;
  const regionFit = input.region && input.region !== route.region ? -2 : 0;
  return interestMatches * 2 + dayFit + regionFit + (route.confidence === "high" ? 1 : 0);
}

export function recommendRouteFamilies(input: Parameters<typeof scoreRouteFamily>[1]) {
  return [...routeFamilies].sort((a, b) => scoreRouteFamily(b, input) - scoreRouteFamily(a, input));
}
