/**
 * Editorial route knowledge for EasyT.
 *
 * This is deliberately separate from generated itinerary documents. A route is
 * a reusable, reviewable starting point; a trip is the traveller's editable
 * copy. Durations are planning allowances until a live operator feed is wired.
 */
export type RouteRegion = "asia" | "europe" | "south-america" | "central-america" | "north-america" | "africa";
export type RouteInterest = "food" | "culture" | "nature" | "rail" | "coast" | "hiking" | "wildlife" | "heritage";
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
  highlights?: string[];
  sourceLinks: Array<{ label: string; url: string; covers: string }>;
  confidence: RouteConfidence;
  reviewedAt: string;
};

const verify = "Verify current schedules, entry rules and opening hours before booking.";

const coreRouteFamilies: RouteFamily[] = [
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

const extraRouteFamilies: RouteFamily[] = [
  { key: "thailand-laos", title: "Thailand to Laos, slowly", region: "asia", countries: ["Thailand", "Laos"], interests: ["food", "nature", "culture"], bestFor: "Markets, river towns and a softer overland route through mainland Southeast Asia.", suggestedDays: { min: 10, ideal: 14, max: 20 }, bases: ["Bangkok", "Chiang Mai", "Luang Prabang"], stops: [{ name: "Bangkok", country: "Thailand", coordinates: [100.5018, 13.7563], minimumNights: 3, reason: "A high-energy opening with food and easy onward connections." }, { name: "Chiang Mai", country: "Thailand", coordinates: [98.9853, 18.7883], minimumNights: 3, reason: "A calmer northern base for markets, temples and mountain days." }, { name: "Luang Prabang", country: "Laos", coordinates: [102.135, 19.8856], minimumNights: 3, reason: "A gentle river finish with room to slow down." }], connections: [], seasonalNotes: ["Rain and river conditions vary by month; keep the border day flexible."], sourceLinks: [{ label: "Tourism Thailand", url: "https://www.tourismthailand.org/", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "south-korea", title: "South Korea by rail", region: "asia", countries: ["South Korea"], interests: ["food", "rail", "culture"], bestFor: "Seoul energy, coastal food towns and a simple rail spine.", suggestedDays: { min: 8, ideal: 12, max: 16 }, bases: ["Seoul", "Gyeongju", "Busan"], stops: [{ name: "Seoul", country: "South Korea", coordinates: [126.978, 37.5665], minimumNights: 4, reason: "A deep urban opening with neighbourhoods worth lingering in." }, { name: "Gyeongju", country: "South Korea", coordinates: [129.2247, 35.8562], minimumNights: 2, reason: "A heritage pause between city chapters." }, { name: "Busan", country: "South Korea", coordinates: [129.0756, 35.1796], minimumNights: 3, reason: "A coastal, food-led finish." }], connections: [], seasonalNotes: ["Spring and autumn are popular; reserve rail and stays earlier."], sourceLinks: [{ label: "Visit Korea", url: "https://english.visitkorea.or.kr/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "malaysia-singapore", title: "Malaysia to Singapore, by appetite", region: "asia", countries: ["Malaysia", "Singapore"], interests: ["food", "culture", "coast"], bestFor: "A low-friction food route from street markets to a polished city finish.", suggestedDays: { min: 8, ideal: 11, max: 16 }, bases: ["Kuala Lumpur", "Penang", "Singapore"], stops: [{ name: "Kuala Lumpur", country: "Malaysia", coordinates: [101.6869, 3.139], minimumNights: 3, reason: "A diverse opening that rewards eating across neighbourhoods." }, { name: "Penang", country: "Malaysia", coordinates: [100.3327, 5.4141], minimumNights: 3, reason: "A compact food and heritage base." }, { name: "Singapore", country: "Singapore", coordinates: [103.8198, 1.3521], minimumNights: 3, reason: "A clean, easy final chapter." }], connections: [], seasonalNotes: ["Heat is year-round; plan outdoor days around the morning."], sourceLinks: [{ label: "Malaysia Travel", url: "https://www.malaysia.travel/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "philippines-islands", title: "Philippines, choose your islands", region: "asia", countries: ["Philippines"], interests: ["coast", "nature", "wildlife"], bestFor: "A flexible island route that protects transfer days and leaves room for weather.", suggestedDays: { min: 10, ideal: 14, max: 21 }, bases: ["Manila", "Palawan", "Cebu"], stops: [{ name: "Manila", country: "Philippines", coordinates: [120.9842, 14.5995], minimumNights: 2, reason: "A practical arrival and short cultural opening." }, { name: "Palawan", country: "Philippines", coordinates: [118.7353, 9.8349], minimumNights: 5, reason: "The main nature chapter deserves generous weather buffer." }, { name: "Cebu", country: "Philippines", coordinates: [123.8854, 10.3157], minimumNights: 3, reason: "A flexible finish with coast and onward options." }], connections: [], seasonalNotes: ["Weather can change flights and boats; avoid tight connections."], sourceLinks: [{ label: "Department of Tourism", url: "https://tourism.gov.ph/", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "argentina-chile", title: "Buenos Aires to Patagonia", region: "south-america", countries: ["Argentina", "Chile"], interests: ["nature", "food", "hiking"], bestFor: "Big landscapes balanced with city nights and realistic flight buffers.", suggestedDays: { min: 14, ideal: 18, max: 26 }, bases: ["Buenos Aires", "El Calafate", "Puerto Natales"], stops: [{ name: "Buenos Aires", country: "Argentina", coordinates: [-58.3816, -34.6037], minimumNights: 3, reason: "A generous city opening before the long distances." }, { name: "El Calafate", country: "Argentina", coordinates: [-72.2768, -50.3404], minimumNights: 4, reason: "A practical glacier base with weather room." }, { name: "Puerto Natales", country: "Chile", coordinates: [-72.5286, -51.7236], minimumNights: 4, reason: "A calm staging point for Patagonia days." }], connections: [], seasonalNotes: ["Patagonia is seasonal and windy; protect a spare day before departures."], sourceLinks: [{ label: "Argentina Travel", url: "https://www.argentina.travel/en", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "brazil-coast", title: "Brazil, city to coast", region: "south-america", countries: ["Brazil"], interests: ["coast", "food", "culture"], bestFor: "A warm route that moves from Rio energy to a slower northeast coast.", suggestedDays: { min: 12, ideal: 16, max: 24 }, bases: ["Rio de Janeiro", "Salvador", "Praia do Forte"], stops: [{ name: "Rio de Janeiro", country: "Brazil", coordinates: [-43.1729, -22.9068], minimumNights: 4, reason: "A city chapter with nature built into the edges." }, { name: "Salvador", country: "Brazil", coordinates: [-38.5014, -12.973], minimumNights: 4, reason: "A music, food and history-led middle chapter." }, { name: "Praia do Forte", country: "Brazil", coordinates: [-37.9942, -12.5763], minimumNights: 3, reason: "A beach finish with breathing room." }], connections: [], seasonalNotes: ["Domestic flights are long; avoid stacking them against fixed activities."], sourceLinks: [{ label: "Visit Brasil", url: "https://www.visitbrasil.com/", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "mexico-yucatan", title: "Yucatán, cenotes to coast", region: "central-america", countries: ["Mexico"], interests: ["food", "culture", "coast"], bestFor: "A manageable loop of food, archaeology, swimming and warm evenings.", suggestedDays: { min: 8, ideal: 12, max: 18 }, bases: ["Mérida", "Valladolid", "Tulum"], stops: [{ name: "Mérida", country: "Mexico", coordinates: [-89.5926, 20.9674], minimumNights: 3, reason: "A food and culture base with easy day-trip options." }, { name: "Valladolid", country: "Mexico", coordinates: [-88.2033, 20.6896], minimumNights: 2, reason: "A smaller base for cenotes and heritage." }, { name: "Tulum", country: "Mexico", coordinates: [-87.4654, 20.2114], minimumNights: 3, reason: "A coast finish that can flex with the weather." }], connections: [], seasonalNotes: ["Heat and storms can reshape coast days; keep plans light."], sourceLinks: [{ label: "Visit Mexico", url: "https://visitmexico.com/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "costa-rica-wild", title: "Costa Rica, a softer loop", region: "central-america", countries: ["Costa Rica"], interests: ["nature", "wildlife", "coast"], bestFor: "Volcanoes, rainforest and Pacific time without changing base every day.", suggestedDays: { min: 10, ideal: 14, max: 20 }, bases: ["La Fortuna", "Monteverde", "Santa Teresa"], stops: [{ name: "La Fortuna", country: "Costa Rica", coordinates: [-84.7033, 10.467], minimumNights: 3, reason: "A practical nature opening around the volcano." }, { name: "Monteverde", country: "Costa Rica", coordinates: [-84.8256, 10.3156], minimumNights: 3, reason: "A cooler cloud-forest pause." }, { name: "Santa Teresa", country: "Costa Rica", coordinates: [-85.1347, 9.6539], minimumNights: 4, reason: "A Pacific finish with genuinely open days." }], connections: [], seasonalNotes: ["Road times are slower than the map suggests; preserve transfer buffers."], sourceLinks: [{ label: "Visit Costa Rica", url: "https://www.visitcostarica.com/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "spain-rail", title: "Spain, a rail-shaped appetite", region: "europe", countries: ["Spain"], interests: ["food", "rail", "culture"], bestFor: "A city route where each stop changes the table, light and daily rhythm.", suggestedDays: { min: 10, ideal: 14, max: 20 }, bases: ["Madrid", "Seville", "Barcelona"], stops: [{ name: "Madrid", country: "Spain", coordinates: [-3.7038, 40.4168], minimumNights: 4, reason: "A broad, walkable opening with excellent food." }, { name: "Seville", country: "Spain", coordinates: [-5.9845, 37.3891], minimumNights: 3, reason: "A warmer middle chapter with slower evenings." }, { name: "Barcelona", country: "Spain", coordinates: [2.1734, 41.3851], minimumNights: 4, reason: "A coastal, design-led finish." }], connections: [], seasonalNotes: ["Summer heat can make the south intense; shoulder seasons are easier."], sourceLinks: [{ label: "Spain Travel", url: "https://www.spain.info/en/", covers: "Official destination context" }], confidence: "high", reviewedAt: "2026-08-09" },
  { key: "france-south", title: "France, markets and the south", region: "europe", countries: ["France"], interests: ["food", "coast", "culture"], bestFor: "A relaxed progression from Paris scale to Provence light and Mediterranean evenings.", suggestedDays: { min: 10, ideal: 14, max: 20 }, bases: ["Paris", "Avignon", "Nice"], stops: [{ name: "Paris", country: "France", coordinates: [2.3522, 48.8566], minimumNights: 4, reason: "A dense opening that rewards choosing fewer neighbourhoods." }, { name: "Avignon", country: "France", coordinates: [4.8055, 43.9493], minimumNights: 3, reason: "A useful base for markets and smaller towns." }, { name: "Nice", country: "France", coordinates: [7.262, 43.7102], minimumNights: 3, reason: "A bright coastal finish with easy day trips." }], connections: [], seasonalNotes: ["Rail is strong, but summer demand needs earlier planning."], sourceLinks: [{ label: "France.fr", url: "https://www.france.fr/en/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "greece-islands", title: "Greece, mainland to island", region: "europe", countries: ["Greece"], interests: ["coast", "culture", "food"], bestFor: "Ancient sites, a single island base and a pace that leaves the afternoon open.", suggestedDays: { min: 9, ideal: 13, max: 18 }, bases: ["Athens", "Naxos", "Chania"], stops: [{ name: "Athens", country: "Greece", coordinates: [23.7275, 37.9838], minimumNights: 3, reason: "A cultural opening before the ferry rhythm begins." }, { name: "Naxos", country: "Greece", coordinates: [25.376, 37.1036], minimumNights: 4, reason: "A balanced island base with villages and beaches." }, { name: "Chania", country: "Greece", coordinates: [24.018, 35.5138], minimumNights: 3, reason: "A relaxed Cretan finish." }], connections: [], seasonalNotes: ["Ferries are weather-sensitive; avoid same-day flight connections."], sourceLinks: [{ label: "Visit Greece", url: "https://visitgreece.gr/", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "turkey-coast", title: "Turkey, cities and the Aegean", region: "europe", countries: ["Turkey"], interests: ["food", "coast", "culture"], bestFor: "A generous first look at Istanbul, ancient coast and slower Aegean evenings.", suggestedDays: { min: 10, ideal: 14, max: 21 }, bases: ["Istanbul", "Selçuk", "Bodrum"], stops: [{ name: "Istanbul", country: "Turkey", coordinates: [28.9784, 41.0082], minimumNights: 4, reason: "A huge city that needs protected wandering time." }, { name: "Selçuk", country: "Turkey", coordinates: [27.368, 37.9514], minimumNights: 2, reason: "A practical heritage base away from the coast crowds." }, { name: "Bodrum", country: "Turkey", coordinates: [27.4305, 37.0344], minimumNights: 4, reason: "A sea-led finish with room to do less." }], connections: [], seasonalNotes: ["Summer coast demand is high; spring and autumn are more flexible."], sourceLinks: [{ label: "Go Türkiye", url: "https://goturkiye.com/", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "scotland-islands", title: "Scotland, road and weather", region: "europe", countries: ["United Kingdom"], interests: ["nature", "coast", "hiking"], bestFor: "A weather-aware road route where the landscape is the itinerary.", suggestedDays: { min: 8, ideal: 12, max: 18 }, bases: ["Edinburgh", "Isle of Skye", "Glasgow"], stops: [{ name: "Edinburgh", country: "United Kingdom", coordinates: [-3.1883, 55.9533], minimumNights: 3, reason: "A compact city opening before the road widens." }, { name: "Isle of Skye", country: "United Kingdom", coordinates: [-6.2, 57.3], minimumNights: 4, reason: "A landscape base that needs flexible days." }, { name: "Glasgow", country: "United Kingdom", coordinates: [-4.2518, 55.8642], minimumNights: 2, reason: "A music and food finish with easy departure options." }], connections: [], seasonalNotes: ["Weather can change quickly; never overbook walking days."], sourceLinks: [{ label: "VisitScotland", url: "https://www.visitscotland.com/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "morocco-rail", title: "Morocco, medinas to mountains", region: "africa", countries: ["Morocco"], interests: ["food", "culture", "nature"], bestFor: "A textured route with rail between cities and a deliberate mountain pause.", suggestedDays: { min: 9, ideal: 13, max: 19 }, bases: ["Marrakech", "Fes", "Chefchaouen"], stops: [{ name: "Marrakech", country: "Morocco", coordinates: [-7.5898, 31.6295], minimumNights: 3, reason: "A vivid opening that benefits from one unplanned evening." }, { name: "Fes", country: "Morocco", coordinates: [-5.0078, 34.0181], minimumNights: 3, reason: "A deeper cultural chapter with a different pace." }, { name: "Chefchaouen", country: "Morocco", coordinates: [-5.2636, 35.1714], minimumNights: 2, reason: "A mountain-town pause before the journey home." }], connections: [], seasonalNotes: ["Heat changes the best time of day; keep midday light."], sourceLinks: [{ label: "Visit Morocco", url: "https://www.visitmorocco.com/en", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "south-africa-garden", title: "South Africa, city to garden route", region: "africa", countries: ["South Africa"], interests: ["nature", "wildlife", "coast"], bestFor: "A balanced first route from Cape Town to wildlife and the southern coast.", suggestedDays: { min: 12, ideal: 17, max: 24 }, bases: ["Cape Town", "Hermanus", "Knysna"], stops: [{ name: "Cape Town", country: "South Africa", coordinates: [18.4241, -33.9249], minimumNights: 4, reason: "A rich opening that combines city, food and landscape." }, { name: "Hermanus", country: "South Africa", coordinates: [19.2345, -34.4187], minimumNights: 2, reason: "A coastal wildlife pause." }, { name: "Knysna", country: "South Africa", coordinates: [23.047, -34.0363], minimumNights: 4, reason: "A slower garden-route base with flexible day trips." }], connections: [], seasonalNotes: ["Distances are real; avoid treating the garden route as a quick hop."], sourceLinks: [{ label: "South African Tourism", url: "https://www.southafrica.net/", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
];

const landmarkRouteFamilies: RouteFamily[] = [
  { key: "mexico-guatemala-belize", title: "Maya worlds, three countries", region: "central-america", countries: ["Mexico", "Guatemala", "Belize"], interests: ["heritage", "nature", "coast"], bestFor: "Chichén Itzá, Tikal and Caribbean water in one carefully paced loop.", suggestedDays: { min: 12, ideal: 16, max: 24 }, bases: ["Mérida", "Flores", "Caye Caulker"], stops: [{ name: "Mérida", country: "Mexico", coordinates: [-89.5926, 20.9674], minimumNights: 3, reason: "A strong cultural base for Chichén Itzá and cenotes." }, { name: "Flores", country: "Guatemala", coordinates: [-89.9, 16.93], minimumNights: 4, reason: "A practical base for an unhurried Tikal visit." }, { name: "Caye Caulker", country: "Belize", coordinates: [-88.0283, 17.742], minimumNights: 3, reason: "A low-key reef finish after the inland heat." }], connections: [], seasonalNotes: ["Border crossings and heat need buffer; avoid stacking ruins on transfer days."], highlights: ["Chichén Itzá", "Tikal", "Belize Barrier Reef"], sourceLinks: [{ label: "Mundo Maya", url: "https://www.mundomaya.travel/en", covers: "Regional heritage context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "usa-canada-west", title: "The western parks, two countries", region: "north-america", countries: ["United States", "Canada"], interests: ["nature", "wildlife", "hiking"], bestFor: "A Rockies route connecting Banff, Yellowstone and big landscape days without city hopping.", suggestedDays: { min: 14, ideal: 18, max: 26 }, bases: ["Calgary", "Banff", "Yellowstone"], stops: [{ name: "Calgary", country: "Canada", coordinates: [-114.0719, 51.0447], minimumNights: 2, reason: "A practical arrival before the parks." }, { name: "Banff", country: "Canada", coordinates: [-115.5708, 51.1784], minimumNights: 5, reason: "A generous base for the Canadian Rockies." }, { name: "Yellowstone", country: "United States", coordinates: [-110.5885, 44.428], minimumNights: 5, reason: "A slower wildlife and geothermal chapter." }], connections: [], seasonalNotes: ["Park access and lodging are seasonal; reserve early and protect weather days."], highlights: ["Banff National Park", "Yellowstone National Park", "Grand Prismatic Spring"], sourceLinks: [{ label: "Parks Canada", url: "https://parks.canada.ca/", covers: "Official park context" }, { label: "National Park Service", url: "https://www.nps.gov/", covers: "US park context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "usa-southwest", title: "American Southwest icons", region: "north-america", countries: ["United States"], interests: ["nature", "heritage", "hiking"], bestFor: "Grand Canyon scale, desert light and a road route that earns its distances.", suggestedDays: { min: 8, ideal: 12, max: 18 }, bases: ["Las Vegas", "Grand Canyon", "Moab"], stops: [{ name: "Las Vegas", country: "United States", coordinates: [-115.1398, 36.1699], minimumNights: 1, reason: "A practical gateway rather than the main event." }, { name: "Grand Canyon", country: "United States", coordinates: [-112.1401, 36.0544], minimumNights: 3, reason: "Give the landscape a full day, not a photo stop." }, { name: "Moab", country: "United States", coordinates: [-109.5498, 38.5733], minimumNights: 3, reason: "A base for Arches and Canyonlands." }], connections: [], seasonalNotes: ["Summer heat changes walking plans; shoulder seasons are kinder."], highlights: ["Grand Canyon", "Arches National Park", "Canyonlands"], sourceLinks: [{ label: "Visit the USA", url: "https://www.visittheusa.com/", covers: "Official destination context" }], confidence: "high", reviewedAt: "2026-08-09" },
  { key: "egypt-jordan", title: "Nile to Petra", region: "africa", countries: ["Egypt", "Jordan"], interests: ["heritage", "culture", "nature"], bestFor: "Ancient-world highlights with enough time for Cairo, the Nile and Petra to land.", suggestedDays: { min: 10, ideal: 14, max: 20 }, bases: ["Cairo", "Luxor", "Wadi Musa"], stops: [{ name: "Cairo", country: "Egypt", coordinates: [31.2357, 30.0444], minimumNights: 3, reason: "A high-density opening for the Pyramids and old Cairo." }, { name: "Luxor", country: "Egypt", coordinates: [32.6396, 25.6872], minimumNights: 3, reason: "A river base for the Valley of the Kings." }, { name: "Wadi Musa", country: "Jordan", coordinates: [35.4794, 30.3285], minimumNights: 3, reason: "A proper Petra base rather than a rushed stopover." }], connections: [], seasonalNotes: ["Heat is serious; plan monuments early and protect midday recovery."], highlights: ["Pyramids of Giza", "Valley of the Kings", "Petra"], sourceLinks: [{ label: "Experience Egypt", url: "https://www.experienceegypt.eg/", covers: "Official destination context" }, { label: "Visit Jordan", url: "https://visitjordan.com/", covers: "Official destination context" }], confidence: "needs-review", reviewedAt: "2026-08-09" },
  { key: "india-golden-triangle", title: "India’s golden triangle", region: "asia", countries: ["India"], interests: ["heritage", "food", "culture"], bestFor: "Delhi, Agra and Jaipur with space for the scale and sensory detail.", suggestedDays: { min: 7, ideal: 10, max: 15 }, bases: ["Delhi", "Agra", "Jaipur"], stops: [{ name: "Delhi", country: "India", coordinates: [77.1025, 28.7041], minimumNights: 3, reason: "A layered opening that needs a measured first day." }, { name: "Agra", country: "India", coordinates: [78.0081, 27.1767], minimumNights: 1, reason: "A focused Taj Mahal chapter with an early start." }, { name: "Jaipur", country: "India", coordinates: [75.7873, 26.9124], minimumNights: 3, reason: "A colourful finish with forts, markets and food." }], connections: [], seasonalNotes: ["Heat and traffic reshape timings; keep transfers and monuments separate."], highlights: ["Taj Mahal", "Agra Fort", "Amber Fort"], sourceLinks: [{ label: "Incredible India", url: "https://www.incredibleindia.gov.in/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "italy-greece", title: "Italy to Greece, ancient and alive", region: "europe", countries: ["Italy", "Greece"], interests: ["heritage", "food", "coast"], bestFor: "Rome, Athens and an island finish linked by a clear Mediterranean arc.", suggestedDays: { min: 12, ideal: 16, max: 22 }, bases: ["Rome", "Athens", "Naxos"], stops: [{ name: "Rome", country: "Italy", coordinates: [12.4964, 41.9028], minimumNights: 4, reason: "A major heritage opening that deserves protected time." }, { name: "Athens", country: "Greece", coordinates: [23.7275, 37.9838], minimumNights: 3, reason: "A living city around an ancient centre." }, { name: "Naxos", country: "Greece", coordinates: [25.376, 37.1036], minimumNights: 4, reason: "A restorative island finish." }], connections: [], seasonalNotes: ["Summer ferries and heritage sites are busy; shoulder season improves the shape."], highlights: ["Colosseum", "Acropolis", "Delphi"], sourceLinks: [{ label: "Italia.it", url: "https://www.italia.it/en", covers: "Official destination context" }, { label: "Visit Greece", url: "https://visitgreece.gr/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
  { key: "portugal-spain", title: "Iberia by rail and coast", region: "europe", countries: ["Portugal", "Spain"], interests: ["rail", "food", "coast"], bestFor: "Lisbon, Seville and Barcelona with a route that changes flavour without frantic moves.", suggestedDays: { min: 12, ideal: 16, max: 22 }, bases: ["Lisbon", "Seville", "Barcelona"], stops: [{ name: "Lisbon", country: "Portugal", coordinates: [-9.1393, 38.7223], minimumNights: 4, reason: "A walkable, food-led opening." }, { name: "Seville", country: "Spain", coordinates: [-5.9845, 37.3891], minimumNights: 3, reason: "A warm cultural middle chapter." }, { name: "Barcelona", country: "Spain", coordinates: [2.1734, 41.3851], minimumNights: 4, reason: "A design and coast finish." }], connections: [], seasonalNotes: ["Heat and rail demand rise in summer; plan the south early or late in the day."], highlights: ["Alhambra day trip", "Sagrada Família", "Sintra"], sourceLinks: [{ label: "Visit Portugal", url: "https://www.visitportugal.com/en", covers: "Official destination context" }, { label: "Spain Travel", url: "https://www.spain.info/en/", covers: "Official destination context" }], confidence: "medium", reviewedAt: "2026-08-09" },
];

export const routeFamilies: RouteFamily[] = [...coreRouteFamilies, ...extraRouteFamilies, ...landmarkRouteFamilies];

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
