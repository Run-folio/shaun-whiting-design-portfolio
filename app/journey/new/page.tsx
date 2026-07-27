"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, CalendarDays, CalendarRange, Check, ChevronLeft, ChevronRight, FileText, GripVertical, LoaderCircle, MapPin, Mountain, Plane, Plus, Sparkles, TrainFront, Upload, Users, X } from "lucide-react";
import { DragEvent, KeyboardEvent, useEffect, useMemo, useState } from "react";
import { featuredAttractions, rankedCountryPlaces } from "@/lib/world-discovery";
import { MountainScene } from "@/components/mountain-scene";
import styles from "./new-trip.module.css";

const interests = ["Food", "Nature", "Cities", "Beach"];
const constraints = ["Slow pace", "Fewer hotel changes", "Good value"];

type Destination = { id: string; name: string; country?: string; coordinates?: [number, number]; kind?: string };
type Brief = {
  origin: string;
  destinations: Destination[];
  startDate: string;
  endDate: string;
  duration: string;
  travellers: string;
  anchor: string;
  interests: string[];
  constraints: string[];
  picks: Record<string, string[]>;
  pickDetails: Record<string, DiscoveryPlace[]>;
};

type DraftDay = { id: string; number: number; date: string; destination: string; destinationId: string; title: string; items: string[]; transport: string; reason: string };
type DiscoveryPlace = { id: string; title: string; area: string; type: string; duration: string; description: string; image?: string; country?: string };
type ResearchPlan = {
  recommendation: { title: string; summary: string; why: string[] };
  routeOptions: { label: string; route: string[]; verdict: string; tradeoff: string }[];
  challenges: string[];
  researchNext: string[];
};
type ResearchState = "idle" | "loading" | "ready" | "configuration" | "error";
type ImportedPlan = {
  sourceName: string;
  origin?: string;
  startDate?: string;
  endDate?: string;
  travellers?: string;
  stops: string[];
  mustDos: string[];
  notes: string[];
};

const defaultBrief: Brief = {
  origin: "Guatemala City",
  destinations: [{ id: "tokyo", name: "Tokyo", country: "Japan", coordinates: [139.6917, 35.6895], kind: "city" }, { id: "hong-kong", name: "Hong Kong", country: "Hong Kong", coordinates: [114.1694, 22.3193], kind: "city" }],
  startDate: "2027-03-01",
  endDate: "2027-03-16",
  duration: "16",
  travellers: "2 travellers",
  anchor: "",
  interests: ["Food", "Nature", "Cities"],
  constraints: ["Slow pace", "Fewer hotel changes"],
  picks: { tokyo: ["Tokyo Marathon", "Mt. Takao"] },
  pickDetails: {},
};

const discoveryCatalog: Record<string, DiscoveryPlace[]> = {
  japan: [
    { id: "tokyo-marathon", title: "Tokyo Marathon", area: "Tokyo", type: "Anchor event", duration: "1 day", description: "Make it the fixed centre of a calm Tokyo week, with recovery built around it." },
    { id: "tokyo-neighbourhoods", title: "Tokyo neighbourhood rhythm", area: "Tokyo · Ginza, Asakusa & Shibuya", type: "City", duration: "1–2 days", description: "A flexible cluster of food, streets and low-effort wandering rather than a citywide checklist." },
    { id: "mount-takao", title: "Mt. Takao", area: "Tokyo west", type: "Nature", duration: "Half day", description: "The close-to-Tokyo hike that gives the city section a real change of texture." },
    { id: "kanazawa", title: "Kanazawa old quarters", area: "Kanazawa · Omicho, Kenroku-en & Higashi Chaya", type: "Culture + food", duration: "2 days", description: "A compact post-marathon chapter with seafood, gardens and historic lanes." },
    { id: "japanese-alps", title: "Japanese Alps & onsen", area: "Takayama · Okuhida · Matsumoto", type: "Mountains", duration: "3–4 days", description: "Mountain towns, a ryokan pause and big scenery without adding another flight." },
    { id: "kyoto", title: "Kyoto heritage", area: "Kyoto · Gion & Fushimi", type: "Culture", duration: "2–3 days", description: "A classic heritage chapter; best chosen only when it earns the time in your route." },
  ],
  tokyo: [
    { id: "asakusa", title: "Asakusa & Senso-ji", area: "East Tokyo", type: "Landmark", duration: "Half day", description: "Old Tokyo atmosphere, best paired with a nearby food stop rather than a cross-city rush." },
    { id: "meiji", title: "Meiji Jingu & Harajuku", area: "West Tokyo", type: "Culture", duration: "Half day", description: "A forested shrine and the city’s most kinetic streets in one natural area." },
    { id: "takao", title: "Mt. Takao", area: "Tokyo west", type: "Nature", duration: "Half day", description: "A straightforward rail escape for a summit walk and a proper break from the city." },
    { id: "tokyo-food", title: "Food neighbourhood night", area: "Ginza · Shinjuku or Ebisu", type: "Food", duration: "Evening", description: "Leave a night deliberately open for the sort of meal that changes the shape of a city." },
  ],
  "hong kong": [
    { id: "peak", title: "Victoria Peak", area: "Central", type: "Viewpoint", duration: "Half day", description: "The city’s big skyline moment; pair it with Central and a harbour evening." },
    { id: "star-ferry", title: "Star Ferry & harbour", area: "Central ↔ Tsim Sha Tsui", type: "City ritual", duration: "Evening", description: "A short crossing with maximum sense of place, especially close to dusk." },
    { id: "dragons-back", title: "Dragon’s Back", area: "Shek O", type: "Hike", duration: "Half day", description: "A classic ridge walk finishing naturally near Big Wave Bay or Shek O." },
    { id: "tai-kwun", title: "Tai Kwun & old Central", area: "Central", type: "Design + culture", duration: "Half day", description: "A compact culture stop that layers heritage, galleries and the city’s steep streets." },
    { id: "dim-sum", title: "Cantonese food night", area: "Central · Wan Chai or Kowloon", type: "Food", duration: "Evening", description: "Make room for one flexible dinner rather than deciding the cuisine before you arrive." },
  ],
  china: [
    { id: "chengdu-pandas", title: "Chengdu panda morning", area: "Chengdu", type: "Wildlife", duration: "Half day", description: "Go at opening, when the base is most active, then let the city take over." },
    { id: "chengdu-food", title: "Sichuan food & tea houses", area: "Chengdu", type: "Food + culture", duration: "1 day", description: "A slower counterpoint to the mountains: people’s parks, shared dishes and evening streets." },
    { id: "fanjingshan", title: "Fanjingshan summit", area: "Tongren", type: "Mountain", duration: "1 day", description: "A dedicated mountain day for the temple-topped Golden Summit, not a rushed detour." },
    { id: "zhangjiajie", title: "Zhangjiajie National Forest Park", area: "Wulingyuan", type: "Landscape", duration: "2 days", description: "Give the sandstone pillars enough time for both high viewpoints and the forest floor." },
    { id: "tianmen", title: "Tianmen Mountain & Heaven’s Gate", area: "Zhangjiajie", type: "Landscape", duration: "1 day", description: "A separate final mountain circuit, built around the cableway, cliff paths and natural arch." },
  ],
};

function discoveryFor(destination: Destination): DiscoveryPlace[] {
  const key = destination.name.trim().toLowerCase();
  const country = destination.country ?? destination.name;
  if (discoveryCatalog[key]) return discoveryCatalog[key].map((place) => ({ ...place, country }));
  const exactPlace = { id: `${key}-selected-stop`, title: destination.name, area: country, type: destination.kind ?? "Verified stop", duration: "1–2 days", description: `A verified ${destination.kind ?? "place"} to use as a base or route anchor.`, country };
  const ranked = rankedCountryPlaces[key];
  if (ranked) return ranked.map((place, index) => ({ ...place, id: `${key}-ranked-${index}`, country }));
  const featured = featuredAttractions[key];
  if (featured) return featured.map((place, index) => ({ ...place, id: `${key}-featured-${index}`, country }));
  // Never pad this selection with generic categories. Empty means the research
  // layer has not found a verified, named place for the destination yet.
  return [exactPlace];
}

function toggle(values: string[], value: string) {
  return values.includes(value) ? values.filter((entry) => entry !== value) : [...values, value];
}

function scopeSelectionData(destinations: Destination[], picks: Record<string, string[]> = {}, pickDetails: Record<string, DiscoveryPlace[]> = {}) {
  const activeIds = new Set(destinations.map((destination) => destination.id));
  return {
    picks: Object.fromEntries(Object.entries(picks).filter(([id]) => activeIds.has(id))),
    pickDetails: Object.fromEntries(Object.entries(pickDetails).filter(([id]) => activeIds.has(id))),
  };
}

function tripLength(startDate: string, endDate: string, fallback: number) {
  const start = new Date(`${startDate}T00:00:00`);
  const end = new Date(`${endDate}T00:00:00`);
  const days = Math.round((end.getTime() - start.getTime()) / 86400000) + 1;
  return Number.isFinite(days) && days > 0 ? days : fallback;
}

function formatDate(startDate: string, offset: number) {
  if (!startDate) return `Day ${offset + 1}`;
  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + offset);
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}

function dateAfter(startDate: string, duration: number) {
  if (!startDate) return "";
  const date = new Date(`${startDate}T00:00:00`);
  date.setDate(date.getDate() + Math.max(0, duration - 1));
  return date.toISOString().slice(0, 10);
}

function uniqueValues(values: string[]) {
  return [...new Set(values.map((value) => value.replace(/\s+/g, " ").trim()).filter(Boolean).map((value) => value.toLowerCase()))]
    .map((value) => values.find((candidate) => candidate.replace(/\s+/g, " ").trim().toLowerCase() === value)?.replace(/\s+/g, " ").trim() ?? value);
}

function normaliseImportedDate(value: string) {
  const iso = value.match(/\b(20\d{2})[-/.](\d{1,2})[-/.](\d{1,2})\b/);
  if (iso) return `${iso[1]}-${iso[2].padStart(2, "0")}-${iso[3].padStart(2, "0")}`;
  const written = value.match(/\b([A-Za-z]{3,9})\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s+(20\d{2}))?\b/);
  if (!written) return undefined;
  const parsed = new Date(`${written[1]} ${written[2]}, ${written[3] ?? new Date().getFullYear()}`);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString().slice(0, 10);
}

function cleanImportedPlace(value: string) {
  return value
    .replace(/^\s*(?:day\s*\d+|\d{1,2}[./-]\d{1,2}(?:[./-]\d{2,4})?|\d+)[\s:|—–-]*/i, "")
    .replace(/\b(?:hotel|check-?in|flight|train|airport|booking|reservation|notes?)\b.*$/i, "")
    .replace(/[•·]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function isPlausibleImportedPlace(value: string) {
  const candidate = cleanImportedPlace(value);
  if (candidate.length < 3 || candidate.length > 64) return false;
  if (/\b(?:arrival|departure|free day|travel day|flight|train|hotel|breakfast|lunch|dinner|transfer|check in|check-in)\b/i.test(candidate)) return false;
  return /^[\p{L}\p{N}][\p{L}\p{N}\s'’.,&()-]*$/u.test(candidate);
}

function extractImportPlan(rawText: string, sourceName: string): ImportedPlan {
  const lines = rawText.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const dates = uniqueValues(lines.flatMap((line) => line.match(/\b20\d{2}[-/.]\d{1,2}[-/.]\d{1,2}\b|\b(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)\s+\d{1,2}(?:st|nd|rd|th)?(?:,?\s+20\d{2})?\b/gi) ?? []).map(normaliseImportedDate).filter((date): date is string => Boolean(date))).sort();
  const labelled = (label: string) => lines.map((line) => line.match(new RegExp(`^\\s*${label}\\s*[:—–-]\\s*(.+)$`, "i"))?.[1]).filter((value): value is string => Boolean(value));
  const routePieces = lines.flatMap((line) => line.includes("→") || line.includes("->") ? line.split(/(?:→|->)/) : []);
  const tabularCandidates = lines.flatMap((line) => {
    const cells = line.split(/\t|\||;/).map(cleanImportedPlace).filter(Boolean);
    if (cells.length >= 2) return cells.slice(0, 3);
    const commaCells = line.split(",").map(cleanImportedPlace).filter(Boolean);
    return commaCells.length >= 2 ? commaCells.slice(0, 2) : [];
  });
  const explicitStops = [...labelled("destination"), ...labelled("stop"), ...labelled("place"), ...labelled("city"), ...routePieces, ...tabularCandidates];
  const fallbackStops = lines.filter((line) => /^(?:day\s*\d+|\d{1,2}[./-]\d{1,2})/i.test(line)).map((line) => cleanImportedPlace(line.split(/[:|—–-]/).at(-1) ?? line));
  const stops = uniqueValues([...explicitStops, ...fallbackStops].map(cleanImportedPlace).filter(isPlausibleImportedPlace)).slice(0, 12);
  const mustDos = uniqueValues([...labelled("must[- ]?do"), ...labelled("highlight"), ...labelled("non[- ]?negotiable")].map(cleanImportedPlace).filter(isPlausibleImportedPlace)).slice(0, 4);
  return {
    sourceName,
    origin: labelled("from|origin|starting from")[0],
    startDate: dates[0],
    endDate: dates.at(-1),
    travellers: labelled("travellers?|travelers?|who is going")[0],
    stops,
    mustDos,
    notes: lines.filter((line) => /\b(?:booked|reservation|hotel|flight|train|confirm)\b/i.test(line)).slice(0, 4),
  };
}

function buildDraftDays(destinations: Destination[], totalDays: number, startDate: string, anchor: string, selectedInterests: string[], picks: Record<string, string[]>, pickDetails: Record<string, DiscoveryPlace[]>, pace: "fewer" | "more"): DraftDay[] {
  if (!destinations.length) return [];
  const allocations = destinations.map(() => Math.max(2, Math.floor(totalDays / destinations.length)));
  let remaining = Math.max(0, totalDays - allocations.reduce((sum, value) => sum + value, 0));
  let pointer = 0;
  while (remaining > 0) { allocations[pointer % allocations.length] += 1; pointer += 1; remaining -= 1; }
  let cursor = 0;
  return destinations.flatMap((destination, destinationIndex) => Array.from({ length: allocations[destinationIndex] }, (_, dayIndex) => {
    const isArrival = dayIndex === 0;
    const isFinal = destinationIndex === destinations.length - 1 && dayIndex === allocations[destinationIndex] - 1;
    const number = cursor + 1;
    cursor += 1;
    const anchorDay = destinationIndex === 0 && dayIndex === Math.min(allocations[destinationIndex] - 1, 2) && anchor;
    const savedTitles = picks[destination.id] ?? [];
    const savedDetails = pickDetails[destination.id] ?? [];
    const savedActivities = savedTitles.map((title) => savedDetails.find((place) => place.title === title) ?? discoveryFor(destination).find((place) => place.title === title) ?? {
      id: `${destination.id}-${title}`,
      title,
      area: destination.name,
      type: "Saved place",
      duration: "Flexible",
      description: `Keep this day centred on ${title} in ${destination.name}.`,
    });
    // Fewer means more depth in the same base. More means using every saved
    // activity — it never invents another city or asks the traveller to move.
    const activities = pace === "fewer" ? savedActivities.slice(0, Math.max(1, Math.ceil(savedActivities.length / 2))) : savedActivities;
    const activity = !isArrival && !anchorDay && activities.length ? activities[(dayIndex - 1) % activities.length] : undefined;
    const activityItems = activity ? [activity.title, activity.description, activity.area ? `Keep the day in ${activity.area}` : `Stay within ${destination.name}`] : [
      `Start close to your base in ${destination.name}`,
      "Choose one walkable area rather than crossing the city",
      "Leave the evening open for a local meal",
    ];
    return {
      id: `${destination.id}-${dayIndex + 1}`,
      number,
      date: formatDate(startDate, number - 1),
      destination: destination.name,
      destinationId: destination.id,
      title: anchorDay ? anchor : isArrival ? "Arrive and settle in" : activity?.title ?? (isFinal ? `A final day in ${destination.name}` : `Explore ${destination.name}`),
      items: anchorDay ? ["Keep the morning protected", `Build the day around ${anchor}`, "Leave the evening deliberately light"] : isArrival ? ["Arrive, transfer and check in", `Take a short walk near your base in ${destination.name}`, "Choose one easy local dinner"] : activityItems,
      transport: isArrival ? destinationIndex === 0 ? "International arrival" : `Travel to ${destination.name}` : "Walk + local transport",
      reason: anchorDay ? "Your non-negotiable becomes the day’s centre of gravity." : isArrival ? "A softer start makes the whole trip feel less like transit." : activity ? `Built around ${activity.title} and kept inside ${destination.name}, rather than adding another base.` : `A flexible day in ${destination.name}; save named places to turn this into a specific activity plan.`,
    };
  }));
}

function plannerWarnings(brief: Brief, totalDays: number) {
  const selectedPlaces = Object.values(brief.picks).flat().length;
  const warnings: string[] = [];
  if (brief.destinations.length > 1 && totalDays / brief.destinations.length < 3) warnings.push("This route is broad for the time available. Either remove a destination or accept travel-heavy days.");
  if (selectedPlaces > totalDays - brief.destinations.length) warnings.push("You have more saved places than protected sightseeing days. Journey should choose, not simply squeeze them all in.");
  if (!brief.constraints.includes("Slow pace")) warnings.push("Transport is still an open constraint. The research pass should verify every inter-city leg before this becomes a bookable plan.");
  return warnings.length ? warnings : ["The shape is viable. The research pass should now test transport, opening windows and exact accommodation bases."];
}

export default function NewTripPage() {
  const [step, setStep] = useState(0);
  const [brief, setBrief] = useState<Brief>(defaultBrief);
  const [destinationInput, setDestinationInput] = useState("");
  const [draggedDestinationId, setDraggedDestinationId] = useState<string | null>(null);
  const [locationMessage, setLocationMessage] = useState("");
  const [isValidatingLocation, setIsValidatingLocation] = useState(false);
  const [mustDoInput, setMustDoInput] = useState(defaultBrief.anchor);
  const [mustDoMessage, setMustDoMessage] = useState("");
  const [isValidatingMustDo, setIsValidatingMustDo] = useState(false);
  const [livePlaces, setLivePlaces] = useState<Record<string, DiscoveryPlace[]>>({});
  const [placeImages, setPlaceImages] = useState<Record<string, string | null>>({});
  const [generated, setGenerated] = useState(false);
  const [saved, setSaved] = useState(false);
  const [researchState, setResearchState] = useState<ResearchState>("idle");
  const [researchPlan, setResearchPlan] = useState<ResearchPlan | null>(null);
  const [researchMessage, setResearchMessage] = useState("");
  const [importText, setImportText] = useState("");
  const [importedPlan, setImportedPlan] = useState<ImportedPlan | null>(null);
  const [importMessage, setImportMessage] = useState("");
  const [isReadingImport, setIsReadingImport] = useState(false);
  const duration = Math.max(1, Number.parseInt(brief.duration, 10) || tripLength(brief.startDate, brief.endDate, 12));
  const scopedSelections = useMemo(() => scopeSelectionData(brief.destinations, brief.picks, brief.pickDetails), [brief.destinations, brief.picks, brief.pickDetails]);
  const itineraryPace = brief.constraints.includes("Slow pace") ? "fewer" : "more";
  const draftDays = useMemo(() => buildDraftDays(brief.destinations, duration, brief.startDate, brief.anchor, brief.interests, scopedSelections.picks, scopedSelections.pickDetails, itineraryPace), [brief, duration, brief.anchor, brief.interests, scopedSelections, itineraryPace]);
  const [selectedDraftDayId, setSelectedDraftDayId] = useState<string>(draftDays[0]?.id ?? "");
  const selectedDraftDay = draftDays.find((day) => day.id === selectedDraftDayId) ?? draftDays[0];
  const savedPlaceTitles = useMemo(() => brief.destinations.flatMap((destination) => scopedSelections.picks[destination.id] ?? []), [brief.destinations, scopedSelections.picks]);
  const warnings = useMemo(() => plannerWarnings({ ...brief, ...scopedSelections }, duration), [brief, duration, scopedSelections]);

  const update = <Key extends keyof Brief>(key: Key, value: Brief[Key]) => setBrief((current) => ({ ...current, [key]: value }));
  const next = () => setStep((current) => Math.min(current + 1, 3));
  const previous = () => setStep((current) => Math.max(current - 1, 0));
  const draftPayload = () => JSON.stringify({ brief: { ...brief, ...scopedSelections, selectedRoute: itineraryPace }, research: researchPlan, researchedAt: researchPlan ? new Date().toISOString() : undefined, savedAt: new Date().toISOString() });
  const saveDraft = () => {
    const payload = draftPayload();
    window.localStorage.setItem("journey:latest-trip-brief", payload);
    window.localStorage.setItem("journey:planned-trip", payload);
    setSaved(true);
  };
  const buildVisualDraft = () => {
    const payload = draftPayload();
    window.localStorage.setItem("journey:latest-trip-brief", payload);
    window.localStorage.setItem("journey:planned-trip", payload);
    setSelectedDraftDayId(draftDays[0]?.id ?? "");
    setGenerated(true);
  };
  const researchRoute = async () => {
    setResearchState("loading");
    setResearchMessage("");
    try {
      const response = await fetch("/api/journey-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, selectedRouteId: itineraryPace }),
      });
      const data = await response.json() as { plan?: ResearchPlan; code?: string; message?: string };
      if (response.status === 503 && data.code === "CONFIGURATION_REQUIRED") {
        setResearchState("configuration");
        setResearchMessage(data.message ?? "Add GROQ_API_KEY to .env.local to enable free-tier Journey research.");
        return;
      }
      if (!response.ok || !data.plan) throw new Error(data.message ?? "The live research pass could not be completed.");
      setResearchPlan(data.plan);
      setResearchState("ready");
      const payload = JSON.stringify({ brief: { ...brief, ...scopedSelections, selectedRoute: itineraryPace }, research: data.plan, researchedAt: new Date().toISOString(), savedAt: new Date().toISOString() });
      window.localStorage.setItem("journey:latest-trip-brief", payload);
      window.localStorage.setItem("journey:planned-trip", payload);
    } catch (error) {
      setResearchState("error");
      setResearchMessage(error instanceof Error ? error.message : "The live research pass could not be completed.");
    }
  };
  const addDestination = async () => {
    const name = destinationInput.trim();
    if (!name) return;
    setIsValidatingLocation(true);
    setLocationMessage("");
    try {
      const response = await fetch(`/api/journey-geocode?place=${encodeURIComponent(name)}`);
      const data = await response.json() as { result?: { name?: string; country?: string; coordinates?: [number, number]; kind?: string } | null };
      const result = data.result;
      if (!response.ok || !result?.name || !result.country || !result.coordinates) {
        setLocationMessage("Choose a real city, region or landmark.");
        return;
      }
      const existing = brief.destinations.find((destination) => destination.name.toLowerCase() === result.name!.toLowerCase() && destination.country?.toLowerCase() === result.country!.toLowerCase());
      if (existing) { setLocationMessage(`${result.name} is already in your trip.`); return; }
      const destination = { id: `${result.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`, name: result.name, country: result.country, coordinates: result.coordinates, kind: result.kind };
      update("destinations", [...brief.destinations, destination]);
      setDestinationInput("");
    } catch {
      setLocationMessage("Couldn’t verify that place. Try a more specific name.");
    } finally {
      setIsValidatingLocation(false);
    }
  };
  const removeDestination = (id: string) => setBrief((current) => {
    const destinations = current.destinations.filter((destination) => destination.id !== id);
    return { ...current, destinations, ...scopeSelectionData(destinations, current.picks, current.pickDetails) };
  });
  const moveDestination = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;
    setBrief((current) => {
      const sourceIndex = current.destinations.findIndex((destination) => destination.id === sourceId);
      const targetIndex = current.destinations.findIndex((destination) => destination.id === targetId);
      if (sourceIndex < 0 || targetIndex < 0) return current;
      const destinations = [...current.destinations];
      const [moving] = destinations.splice(sourceIndex, 1);
      destinations.splice(targetIndex, 0, moving);
      return { ...current, destinations };
    });
  };
  const destinationDragStart = (event: DragEvent<HTMLDivElement>, id: string) => {
    setDraggedDestinationId(id);
    event.dataTransfer.effectAllowed = "move";
    event.dataTransfer.setData("text/plain", id);
  };
  const destinationDrop = (event: DragEvent<HTMLDivElement>, targetId: string) => {
    event.preventDefault();
    const sourceId = draggedDestinationId ?? event.dataTransfer.getData("text/plain");
    if (sourceId) moveDestination(sourceId, targetId);
    setDraggedDestinationId(null);
  };
  const destinationKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") { event.preventDefault(); addDestination(); }
  };
  const verifyMustDo = async () => {
    const value = mustDoInput.trim();
    if (!value) return;
    setIsValidatingMustDo(true);
    setMustDoMessage("");
    try {
      const response = await fetch(`/api/journey-geocode?place=${encodeURIComponent(value)}`);
      const data = await response.json() as { result?: { name?: string; country?: string } | null };
      if (!response.ok || !data.result?.name || !data.result.country) { setMustDoMessage("Choose a real place to protect in the route."); return; }
      update("anchor", data.result.name);
      setMustDoInput(data.result.name);
      setMustDoMessage(`Verified · ${data.result.name}, ${data.result.country}`);
    } catch {
      setMustDoMessage("Couldn’t verify that place. Try a more specific name.");
    } finally {
      setIsValidatingMustDo(false);
    }
  };
  const togglePick = (destinationId: string, place: DiscoveryPlace) => setBrief((current) => {
    const picks = current.picks[destinationId] ?? [];
    const selected = picks.includes(place.title);
    const details = current.pickDetails?.[destinationId] ?? [];
    return {
      ...current,
      picks: { ...current.picks, [destinationId]: selected ? picks.filter((pick) => pick !== place.title) : [...picks, place.title] },
      pickDetails: { ...(current.pickDetails ?? {}), [destinationId]: selected ? details.filter((pick) => pick.title !== place.title) : [...details.filter((pick) => pick.title !== place.title), place] },
    };
  });
  const setStartDate = (startDate: string) => setBrief((current) => {
    const currentDuration = Math.max(1, Number.parseInt(current.duration, 10) || 1);
    return { ...current, startDate, endDate: dateAfter(startDate, currentDuration) };
  });
  const setEndDate = (endDate: string) => setBrief((current) => ({
    ...current,
    endDate,
    duration: String(tripLength(current.startDate, endDate, Number.parseInt(current.duration, 10) || 1)),
  }));
  const setDuration = (value: string) => setBrief((current) => {
    const nextDuration = Math.max(1, Number.parseInt(value, 10) || 1);
    return { ...current, duration: String(nextDuration), endDate: dateAfter(current.startDate, nextDuration) };
  });
  const reviewImportedPlan = (rawText: string, sourceName: string) => {
    if (!rawText.trim()) { setImportMessage("Paste a few itinerary lines or choose a file first."); return; }
    const plan = extractImportPlan(rawText, sourceName);
    setImportedPlan(plan);
    setImportMessage(plan.stops.length || plan.mustDos.length || plan.startDate ? "Review what EasyT found, then apply only the verified details you want." : "No clear dates or places found yet. Try a more structured itinerary, with one place per line.");
  };
  const readImportedFile = async (file: File) => {
    setIsReadingImport(true);
    setImportMessage("");
    try {
      let text = "";
      const name = file.name.toLowerCase();
      if (name.endsWith(".csv") || name.endsWith(".txt")) {
        text = await file.text();
      } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
        const XLSX = await import("xlsx");
        const workbook = XLSX.read(await file.arrayBuffer(), { type: "array" });
        text = workbook.SheetNames.map((sheetName) => XLSX.utils.sheet_to_csv(workbook.Sheets[sheetName])).join("\n");
      } else if (name.endsWith(".docx")) {
        const mammoth = await import("mammoth");
        const result = await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() });
        text = result.value;
      } else {
        setImportMessage("Use a CSV, XLSX, DOCX or plain-text file for now.");
        return;
      }
      setImportText(text);
      reviewImportedPlan(text, file.name);
    } catch {
      setImportMessage("EasyT couldn’t read that file. Try exporting it as CSV or DOCX.");
    } finally {
      setIsReadingImport(false);
    }
  };
  const applyImportedPlan = async () => {
    if (!importedPlan) return;
    setIsReadingImport(true);
    setImportMessage("Checking imported places against the map…");
    try {
      const outcomes = await Promise.all(importedPlan.stops.map(async (place) => {
        const response = await fetch(`/api/journey-geocode?place=${encodeURIComponent(place)}`);
        const data = await response.json() as { result?: { name?: string; country?: string; coordinates?: [number, number]; kind?: string } | null };
        return data.result?.name && data.result.country && data.result.coordinates ? data.result : null;
      }));
      const importedMustDo = importedPlan.mustDos[0];
      const mustDoResponse = importedMustDo ? await fetch(`/api/journey-geocode?place=${encodeURIComponent(importedMustDo)}`) : null;
      const mustDoData = mustDoResponse ? await mustDoResponse.json() as { result?: { name?: string; country?: string; coordinates?: [number, number] } | null } : null;
      const verifiedMustDo = mustDoData?.result?.name && mustDoData.result.country && mustDoData.result.coordinates ? mustDoData.result.name : undefined;
      const verified = outcomes.filter((result): result is { name: string; country: string; coordinates: [number, number]; kind?: string } => Boolean(result))
        .filter((result, index, list) => list.findIndex((candidate) => candidate.name.toLowerCase() === result.name.toLowerCase() && candidate.country.toLowerCase() === result.country.toLowerCase()) === index)
        .map((result, index) => ({ id: `import-${result.name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${index}`, ...result }));
      setBrief((current) => {
        const startDate = importedPlan.startDate ?? current.startDate;
        const endDate = importedPlan.endDate ?? current.endDate;
        const destinations = verified.length ? verified : current.destinations;
        return {
          ...current,
          origin: importedPlan.origin ?? current.origin,
          travellers: importedPlan.travellers ?? current.travellers,
          startDate,
          endDate,
          duration: String(tripLength(startDate, endDate, Number.parseInt(current.duration, 10) || 1)),
          anchor: verifiedMustDo ?? current.anchor,
          destinations,
          ...scopeSelectionData(destinations, {}, {}),
        };
      });
      if (importedMustDo) setMustDoInput(verifiedMustDo ?? importedMustDo);
      if (verified.length) {
        setImportMessage(`Applied ${verified.length} verified stop${verified.length === 1 ? "" : "s"}${verifiedMustDo ? " and your verified must-do" : ""}. You can refine them below.`);
      } else {
        setImportMessage("Dates and notes were applied, but no imported places could be verified. Add them manually below.");
      }
    } catch {
      setImportMessage("EasyT couldn’t verify the imported places. You can still add them individually.");
    } finally {
      setIsReadingImport(false);
    }
  };

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem("journey:latest-trip-brief");
      if (!stored) return;
      const parsed = JSON.parse(stored) as { brief?: Omit<Partial<Brief>, "destinations"> & { destinations?: Destination[] | string } };
      if (!parsed.brief) return;
      const destinations = Array.isArray(parsed.brief.destinations)
        ? parsed.brief.destinations
        : typeof parsed.brief.destinations === "string"
          ? parsed.brief.destinations.split(",").map((name) => name.trim()).filter(Boolean).map((name) => ({ id: name.toLowerCase().replace(/[^a-z0-9]+/g, "-"), name }))
          : defaultBrief.destinations;
      setBrief({ ...defaultBrief, ...parsed.brief, destinations, ...scopeSelectionData(destinations, parsed.brief.picks ?? {}, parsed.brief.pickDetails ?? {}) });
      setMustDoInput(parsed.brief.anchor ?? "");
    } catch {
      // A malformed local prototype draft should never block a new one.
    }
  }, []);

  useEffect(() => {
    const missing = brief.destinations.filter((destination) => !livePlaces[destination.id]);
    if (!missing.length) return;
    const controller = new AbortController();
    Promise.all(missing.map(async (destination) => {
      const response = await fetch(`/api/journey-discover?destination=${encodeURIComponent(destination.name)}&country=${encodeURIComponent(destination.country ?? "")}`, { signal: controller.signal });
      const data = response.ok ? await response.json() as { places?: DiscoveryPlace[] } : { places: [] };
      return [destination.id, data.places ?? []] as const;
    })).then((results) => setLivePlaces((current) => ({ ...current, ...Object.fromEntries(results) }))).catch(() => undefined);
    return () => controller.abort();
  }, [brief.destinations, livePlaces]);

  useEffect(() => {
    const candidates = brief.destinations.flatMap((destination) => {
      const editorial = discoveryFor(destination);
      const live = (livePlaces[destination.id] ?? []).filter((place) => !editorial.some((seed) => seed.title.toLowerCase() === place.title.toLowerCase()));
      const curated = Boolean(rankedCountryPlaces[destination.name.trim().toLowerCase()] || featuredAttractions[destination.name.trim().toLowerCase()] || discoveryCatalog[destination.name.trim().toLowerCase()]);
      return (curated ? [...editorial, ...live] : [...live, ...editorial]).slice(0, 10).map((place) => ({ destination, place }));
    }).filter(({ destination, place }) => !place.image && !Object.prototype.hasOwnProperty.call(placeImages, `${destination.id}:${place.id}`)).slice(0, 24);
    if (!candidates.length) return;
    let active = true;
    Promise.all(candidates.map(async ({ destination, place }) => {
      const response = await fetch(`/api/journey-place?title=${encodeURIComponent(place.title)}&area=${encodeURIComponent(place.area)}&country=${encodeURIComponent(destination.country ?? "")}`);
      const data = response.ok ? await response.json() as { place?: { image?: string } | null } : {};
      return [`${destination.id}:${place.id}`, data.place?.image ?? null] as const;
    })).then((results) => { if (active) setPlaceImages((current) => ({ ...current, ...Object.fromEntries(results) })); }).catch(() => undefined);
    return () => { active = false; };
  }, [brief.destinations, livePlaces, placeImages]);

  useEffect(() => {
    if (!draftDays.length) return;
    if (!draftDays.some((day) => day.id === selectedDraftDayId)) setSelectedDraftDayId(draftDays[0].id);
  }, [draftDays, selectedDraftDayId]);

  return (
    <main className={styles.page}>
      <MountainScene />
      <header className={styles.header}>
        <Link href="/journey" className={styles.back}><ArrowLeft /> EasyT · Travel companion prototype</Link>
        <div className={styles.easyT} aria-label="EasyT"><span>Easy</span><b>T</b></div>
        <div className={styles.stepCounter}>0{step + 1} / 04</div>
      </header>

      <section className={styles.intro}>
        <p className={styles.eyebrow}>EASYT · MAKE THE BUCKET LIST REAL</p>
        <h1>{generated ? "Your first plan." : ["Build your trip.", "Pick your places.", "Set the pace.", "Review your plan."][step]}</h1>
        {generated ? <p className={styles.lede}>Edit the route before turning it into your map-led itinerary.</p> : null}
      </section>

      <section className={`${styles.builder} ${generated ? styles.generated : ""}`} aria-label="Create a new trip">
        {!generated ? <>
          <nav className={styles.steps} aria-label="Trip brief progress">
            {["The trip", "Places", "Style & pace", "First draft"].map((label, index) => <button key={label} type="button" className={index === step ? styles.currentStep : index < step ? styles.completeStep : ""} onClick={() => setStep(index)}><b>{index < step ? <Check /> : `0${index + 1}`}</b><span>{label}</span></button>)}
          </nav>
          <div className={styles.formArea}>
            {step === 0 ? <>
              <section className={styles.planImport} aria-labelledby="plan-import-title">
                <div className={styles.planImportHead}>
                  <div>
                    <small>ALREADY HAVE A PLAN?</small>
                    <h3 id="plan-import-title">Start from what you have.</h3>
                  </div>
                  <label className={styles.uploadPlan}>
                    {isReadingImport ? <LoaderCircle className={styles.spinner} /> : <Upload />}
                    <span>{isReadingImport ? "Reading…" : "Upload plan"}</span>
                    <input type="file" accept=".csv,.txt,.xlsx,.xls,.docx" onChange={(event) => {
                      const file = event.currentTarget.files?.[0];
                      if (file) void readImportedFile(file);
                      event.currentTarget.value = "";
                    }} />
                  </label>
                </div>
                {importedPlan ? <div className={styles.importReview}>
                  <div><small>{importedPlan.sourceName}</small><strong>Found {importedPlan.stops.length} possible stop{importedPlan.stops.length === 1 ? "" : "s"}</strong></div>
                  {importedPlan.startDate || importedPlan.endDate ? <p>{importedPlan.startDate ?? "Date?"} → {importedPlan.endDate ?? "Date?"}</p> : null}
                  {importedPlan.stops.length ? <div className={styles.importChips}>{importedPlan.stops.map((place) => <span key={place}><MapPin /> {place}</span>)}</div> : null}
                  {importedPlan.mustDos.length ? <div className={styles.importMustDos}><Mountain /> Must-do: {importedPlan.mustDos.join(" · ")}</div> : null}
                  {importedPlan.notes.length ? <div className={styles.importNotes}><FileText /><div><small>BOOKING CUES</small>{importedPlan.notes.slice(0, 3).map((note) => <span key={note}>{note}</span>)}</div></div> : null}
                  <button type="button" className={styles.applyImportButton} onClick={() => void applyImportedPlan()} disabled={isReadingImport}><Check /> Apply verified details</button>
                </div> : null}
                {importMessage ? <p className={styles.importMessage} role="status">{importMessage}</p> : null}
              </section>
              <div className={styles.dateGrid}><label><span className={styles.dateLabel}><CalendarDays /> Start date</span><input type="date" value={brief.startDate} onChange={(event) => setStartDate(event.target.value)} onInput={(event) => setStartDate(event.currentTarget.value)} /></label><label><span className={styles.dateLabel}><CalendarDays /> End date</span><input type="date" value={brief.endDate} min={brief.startDate} onChange={(event) => setEndDate(event.target.value)} onInput={(event) => setEndDate(event.currentTarget.value)} /></label><label><span className={styles.dateLabel}><CalendarRange /> Trip length</span><input type="number" min="1" value={brief.duration} onChange={(event) => setDuration(event.target.value)} /></label></div>
              <div className={styles.fieldGrid}><label>Starting from<input value={brief.origin} onChange={(event) => update("origin", event.target.value)} placeholder="City or airport" /></label><label>How many are going?<select value={brief.travellers} onChange={(event) => update("travellers", event.target.value)} aria-label="How many are going?"><option value="" disabled>Select travellers</option>{[1, 2, 3, 4, 5, 6, 7, 8].map((count) => <option key={count} value={`${count} traveller${count === 1 ? "" : "s"}`}>{count} traveller{count === 1 ? "" : "s"}</option>)}</select></label></div>
              <div className={styles.destinationBuilder}>
                <div className={styles.destinationBuilderHead}><label>Where are you going?</label><small>Drag to reorder</small></div>
                <div className={styles.addDestination}><input value={destinationInput} onChange={(event) => { setDestinationInput(event.target.value); setLocationMessage(""); }} onKeyDown={destinationKeyDown} placeholder="Add a city, region or landmark" aria-label="Add a verified stop" /><button type="button" disabled={isValidatingLocation} onClick={addDestination}><Plus /> {isValidatingLocation ? "Checking…" : "Add stop"}</button></div>
                <p className={styles.coverageNote}><Sparkles /> Every stop is checked against a real map before it joins the route.</p>
                {locationMessage ? <p className={styles.locationMessage} role="status">{locationMessage}</p> : null}
                <div className={styles.destinationList}>{brief.destinations.map((destination, index) => <div className={`${styles.destinationChip} ${draggedDestinationId === destination.id ? styles.draggingDestination : ""}`} key={destination.id} draggable onDragStart={(event) => destinationDragStart(event, destination.id)} onDragOver={(event) => event.preventDefault()} onDrop={(event) => destinationDrop(event, destination.id)} onDragEnd={() => setDraggedDestinationId(null)}><b>{String(index + 1).padStart(2, "0")}</b><GripVertical className={styles.dragHandle} aria-hidden="true" /><MapPin /><div><strong>{destination.name}</strong><small>{destination.country}</small></div><span className={styles.destinationChipActions}><button type="button" aria-label={`Remove ${destination.name}`} onClick={() => removeDestination(destination.id)}><X /></button></span></div>)}</div>
              </div>
            </> : null}
            {step === 1 ? <>
              <div className={styles.formHeading}><span>02</span><div><h2>Pick places</h2><p>Only real places. Pick what matters.</p></div></div>
              <div className={styles.countryChapterList}>{brief.destinations.map((destination, destinationIndex) => {
                const editorial = discoveryFor(destination);
                const live = (livePlaces[destination.id] ?? []).filter((place) => !editorial.some((seed) => seed.title.toLowerCase() === place.title.toLowerCase()));
                const hasCuratedLayer = Boolean(rankedCountryPlaces[destination.name.trim().toLowerCase()] || featuredAttractions[destination.name.trim().toLowerCase()] || discoveryCatalog[destination.name.trim().toLowerCase()]);
                const places = (hasCuratedLayer ? [...editorial, ...live] : [...live, ...editorial])
                  .filter((place, index, list) => list.findIndex((candidate) => candidate.title.toLowerCase() === place.title.toLowerCase()) === index)
                  .slice(0, 10);
                return <section key={destination.id} className={styles.discoveryPanel}>
                  <div className={styles.discoveryPanelHead}><div><small>{String(destinationIndex + 1).padStart(2, "0")} · {destination.country?.toUpperCase() ?? "VERIFIED STOP"}</small><h3>{destination.name}</h3></div><p><b>{(brief.picks[destination.id] ?? []).length} saved</b></p></div>
                  {places.length ? <div className={styles.placeGrid}>{places.map((place, index) => { const selected = (brief.picks[destination.id] ?? []).includes(place.title); const image = place.image ?? placeImages[`${destination.id}:${place.id}`]; return <button type="button" key={place.id} className={selected ? styles.selectedPlace : ""} onClick={() => togglePick(destination.id, { ...place, country: destination.name })} aria-pressed={selected}><b>{String(index + 1).padStart(2, "0")}</b><span className={styles.placeSelect}>{selected ? <Check /> : <Plus />}</span>{image ? <span className={styles.placeCardImage} style={{ backgroundImage: `url(${image})` }} aria-hidden="true" /> : <span className={styles.placeCardFallback} aria-hidden="true"><span>Finding image</span></span>}<div><small>{place.area} · {place.type}</small><strong>{place.title}</strong><em>{place.duration}</em><p>{place.description}</p></div></button>; })}</div> : <p className={styles.emptyPlaces}>Finding named places for {destination.name}…</p>}
                </section>;
              })}</div>
            </> : null}
            {step === 2 ? <><div className={styles.formHeading}><span>03</span><div><h2>Style & pace</h2><p>One must-do, then your preferences.</p></div></div><div className={styles.mustDo}><Mountain /><div><label>Must-do place<input value={mustDoInput} onChange={(event) => { setMustDoInput(event.target.value); update("anchor", ""); setMustDoMessage(""); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); verifyMustDo(); } }} placeholder="e.g. Machu Picchu" /></label><button type="button" onClick={verifyMustDo} disabled={isValidatingMustDo || !mustDoInput.trim()}>{isValidatingMustDo ? "Checking…" : "Verify"}</button>{mustDoMessage ? <small className={brief.anchor ? styles.verifiedMustDo : ""}>{mustDoMessage}</small> : null}</div></div><div className={styles.preferenceGroup}><small>MORE OF</small><div className={styles.choiceGrid}>{interests.map((interest) => <button type="button" key={interest} className={brief.interests.includes(interest) ? styles.selectedChoice : ""} onClick={() => update("interests", toggle(brief.interests, interest))}><span>{brief.interests.includes(interest) ? <Check /> : "+"}</span>{interest}</button>)}</div></div><div className={styles.preferenceGroup}><small>KEEP IT</small><div className={styles.choiceGrid}>{constraints.map((constraint) => <button type="button" key={constraint} className={brief.constraints.includes(constraint) ? styles.selectedChoice : ""} onClick={() => update("constraints", toggle(brief.constraints, constraint))}><span>{brief.constraints.includes(constraint) ? <Check /> : "+"}</span>{constraint}</button>)}</div></div></> : null}
            {step === 3 ? <><div className={styles.formHeading}><span>04</span><div><h2>Review plan</h2><p>Ready to build?</p></div></div><div className={styles.reviewList}><div><small>Route</small><strong>{brief.origin} → {brief.destinations.map((destination) => destination.name).join(" → ") || "Add a destination"}</strong></div><div><small>Dates</small><strong>{brief.startDate || "Choose a start"} → {brief.endDate || "Choose an end"} · {duration} days</strong></div><div><small>Must-do</small><strong>{brief.anchor || "No fixed must-do"}</strong></div><div><small>Saved places</small><strong>{savedPlaceTitles.join(" · ") || "Let EasyT choose the anchors"}</strong></div><div><small>Priorities</small><strong>{brief.interests.join(" · ") || "Add your priorities"}</strong></div></div></> : null}
          </div>
          <footer className={styles.actions}><button type="button" className={styles.textButton} onClick={previous} disabled={step === 0}>Back</button>{step < 3 ? <button type="button" className={styles.primaryButton} onClick={next}>Continue <ArrowRight /></button> : <button type="button" className={styles.primaryButton} disabled={!brief.destinations.length} onClick={buildVisualDraft}><Sparkles /> Build visual draft</button>}</footer>
        </> : <>
          <div className={styles.draftHeader}><div><p className={styles.eyebrow}>AI route review · editable</p><h2>{brief.origin} to {brief.destinations.map((destination) => destination.name).join(" & ")}</h2></div><button type="button" className={styles.textButton} onClick={() => setGenerated(false)}>Edit brief</button></div>
          <div className={styles.draftSummary}><span><Plane /> {brief.origin}</span><b>{duration} days</b><span><MapPin /> {brief.destinations.length} stops</span><span><Users /> {brief.travellers}</span></div>
          <div className={styles.draftWorkspace}>
            <aside className={styles.draftTimeline} aria-label="Generated itinerary days"><div className={styles.timelineTitle}><small>ITINERARY</small><strong>{draftDays.length} days</strong></div>{draftDays.map((day, index) => <button type="button" key={day.id} className={day.id === selectedDraftDay?.id ? styles.activeDraftDay : ""} onClick={() => setSelectedDraftDayId(day.id)}><span><b>{String(day.number).padStart(2, "0")}</b><small>{day.date}</small></span><div><em>{index === 0 || day.destination !== draftDays[index - 1]?.destination ? `IN ${day.destination.toUpperCase()}` : day.destination}</em><strong>{day.title}</strong></div></button>)}</aside>
            {selectedDraftDay ? <section className={styles.dayDetail} aria-live="polite"><div className={styles.dayDetailMeta}><p><span>{selectedDraftDay.date}</span> · DAY {String(selectedDraftDay.number).padStart(2, "0")}</p><span className={styles.dayDestination}><MapPin /> {selectedDraftDay.destination}</span></div><h3>{selectedDraftDay.title}</h3><p className={styles.dayReason}>{selectedDraftDay.reason}</p><div className={styles.dayTransport}><span>{selectedDraftDay.transport.includes("Travel") || selectedDraftDay.transport.includes("arrival") ? <Plane /> : <TrainFront />}</span><div><small>DAY RHYTHM</small><strong>{selectedDraftDay.transport}</strong><p>{selectedDraftDay.transport.includes("Travel") ? "This is a protected transfer day — Journey deliberately leaves room either side." : "A paced day with a single headline experience and flexible local movement."}</p></div></div><ol>{selectedDraftDay.items.map((item, index) => <li key={item}><b>0{index + 1}</b><span>{item}</span></li>)}</ol><div className={styles.dayActions}><button type="button">Add a place <Plus /></button><button type="button">Regenerate this day <Sparkles /></button></div><div className={styles.dayNavigation}><button type="button" disabled={selectedDraftDay.number === 1} onClick={() => setSelectedDraftDayId(draftDays[Math.max(0, selectedDraftDay.number - 2)]?.id)}><ChevronLeft /> Previous day</button><button type="button" disabled={selectedDraftDay.number === draftDays.length} onClick={() => setSelectedDraftDayId(draftDays[Math.min(draftDays.length - 1, selectedDraftDay.number)]?.id)}>Next day <ChevronRight /></button></div></section> : null}
          </div>
          <div className={styles.draftMeta}><div><small>TRIP RHYTHM</small><strong>{brief.constraints.includes("Slow pace") ? "Slow & spacious" : "More active"}</strong></div><div><small>DISCOVERY MIX</small><strong>{brief.interests.slice(0, 2).join(" + ") || "Open"}</strong></div><div><small>NEXT</small><strong>Place-by-place map</strong></div></div>
          <footer className={styles.actions}><button type="button" className={styles.textButton} onClick={() => setGenerated(false)}>Adjust the brief</button><Link href="/journey/plan" className={styles.primaryButton} onClick={saveDraft}>Open your Journey <ArrowRight /></Link></footer>
          {saved ? <p className={styles.savedNote}>Saved locally for this prototype. The next product milestone is turning this draft into its own live map and timeline.</p> : null}
        </>}
      </section>
    </main>
  );
}
