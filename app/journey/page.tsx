"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, Castle, Flower2, House, Landmark, Mountain, PawPrint, PersonStanding, Plane, Plus, Torus, Utensils, Waves, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JourneyGlobe, type JourneyMapPlace } from "@/components/journey-globe";
import { JourneyCarousel } from "@/components/journey-carousel";
import { JourneyRestaurantFinder } from "@/components/journey-restaurant-finder";
import { JourneyLocalFinder } from "@/components/journey-local-finder";
import { JourneyWeather } from "@/components/journey-weather";
import { journeyCalendar, journeyDayMedia, journeyDetails, journeyMedia, march2027Journey, type JourneyCalendarDay, type JourneyLeg, type JourneyRestaurant, type JourneyStop, type RestaurantMeal } from "@/lib/journey";
import { getCountryIntelligence } from "@/lib/country-intelligence";
import { loadActiveTrip, loadTripFromEasyT, saveActiveTrip, saveTripToEasyT } from "@/lib/easyt/storage";
import { authClient } from "@/lib/auth-client";
import type { EasyTTrip } from "@/lib/easyt/trip";
import { estimateLeg } from "@/lib/easyt/planner";
import { applyRecommendation, recommendationImpact, reviewTrip, undoRecommendation } from "@/lib/easyt/review";
import styles from "./journey.module.css";

const destinationIcons: Record<string, LucideIcon> = {
  plane: Plane,
  runner: PersonStanding,
  garden: Flower2,
  town: House,
  onsen: Waves,
  castle: Castle,
  panda: PawPrint,
  temple: Landmark,
  pillars: Mountain,
  gate: Torus,
  skyline: Building2,
};

type CustomPick = { id: string; title: string; area: string; type: string; duration: string; description: string; image?: string; sourceUrl?: string; coordinates?: [number, number]; country?: string };
type CustomDestination = { id: string; name: string; country?: string; coordinates?: [number, number]; kind?: string };
type CustomBrief = { origin: string; destinations: CustomDestination[]; startDate: string; duration: string; travellers: string; interests: string[]; picks: Record<string, string[]>; pickDetails?: Record<string, CustomPick[]> };

function customBriefFromEasyT(trip: EasyTTrip): CustomBrief {
  const duration = Math.max(1, Math.round((+new Date(`${trip.endDate}T00:00:00`) - +new Date(`${trip.startDate}T00:00:00`)) / 86400000) + 1);
  const pickDetails = Object.fromEntries(trip.stops.map((stop) => [
    stop.id,
    trip.planItems
      .filter((item) => item.stopId === stop.id && item.type === "activity")
      .map((item) => ({
        id: item.id,
        title: item.title,
        area: stop.name,
        type: "Activity",
        duration: "Flexible",
        description: item.reason,
        image: item.image ?? undefined,
        sourceUrl: item.sourceUrl ?? undefined,
        coordinates: item.longitude !== null && item.latitude !== null ? [item.longitude, item.latitude] : undefined,
        country: stop.country,
      } satisfies CustomPick)),
  ]));

  return {
    origin: trip.brief.origin,
    destinations: trip.stops.map((stop) => ({
      id: stop.id,
      name: stop.name,
      country: stop.country,
      coordinates: stop.longitude !== null && stop.latitude !== null ? [stop.longitude, stop.latitude] : undefined,
      kind: "place",
    })),
    startDate: trip.startDate,
    duration: String(duration),
    travellers: String(trip.travellers),
    interests: [],
    picks: trip.brief.selectedPlaces,
    pickDetails,
  };
}

const customCoordinates: Record<string, [number, number]> = {
  "guatemala city": [-90.5069, 14.6349], london: [-0.1276, 51.5072], japan: [139.6917, 35.6895], tokyo: [139.6917, 35.6895], "hong kong": [114.1694, 22.3193], france: [2.3522, 48.8566], spain: [2.1734, 41.3851], italy: [12.4964, 41.9028], china: [104.1954, 35.8617], thailand: [100.5018, 13.7563], mexico: [-99.1332, 19.4326], "united states": [-74.006, 40.7128], "united kingdom": [-0.1276, 51.5072], "south korea": [126.978, 37.5665], germany: [13.405, 52.52], portugal: [-9.1393, 38.7223], greece: [23.7275, 37.9838], turkey: [28.9784, 41.0082], vietnam: [105.8342, 21.0278], indonesia: [115.1889, -8.4095], australia: [151.2093, -33.8688], brazil: [-43.1729, -22.9068], morocco: [-7.9811, 31.6295], canada: [-79.3832, 43.6532], india: [77.209, 28.6139], singapore: [103.8198, 1.3521], "united arab emirates": [55.2708, 25.2048], egypt: [31.2357, 30.0444], croatia: [18.0944, 42.6507], switzerland: [8.5417, 47.3769], argentina: [-58.3816, -34.6037], peru: [-77.0428, -12.0464], cusco: [-71.9785, -13.517], "sacred valley": [-72.115, -13.308], "machu picchu": [-72.5451, -13.1631], colombia: [-74.0721, 4.711], "bogotá": [-74.0721, 4.711], bogota: [-74.0721, 4.711], medellín: [-75.5812, 6.2442], medellin: [-75.5812, 6.2442], iceland: [-21.9426, 64.1466], "new zealand": [174.7633, -36.8485], "south africa": [18.4241, -33.9249], "costa rica": [-84.0907, 9.9281], philippines: [120.9842, 14.5995], malaysia: [101.6869, 3.139], austria: [16.3738, 48.2082], netherlands: [4.9041, 52.3676], czechia: [14.4378, 50.0755], "czech republic": [14.4378, 50.0755], ireland: [-6.2603, 53.3498], norway: [10.7522, 59.9139], denmark: [12.5683, 55.6761], sweden: [18.0686, 59.3293], poland: [19.945, 50.0647], chile: [-70.6693, -33.4489], kenya: [36.8219, -1.2921], tanzania: [39.2083, -6.7924], maldives: [73.5093, 4.1755], guatemala: [-90.5069, 14.6349],
};

function customCoordinate(name: string, fallback: string): [number, number] | null { return customCoordinates[name.toLowerCase()] ?? customCoordinates[fallback.toLowerCase()] ?? null; }
function journeyTransportMode(mode: EasyTTrip["legs"][number]["mode"]): "flight" | "road" | "rail" {
  if (mode === "flight") return "flight";
  if (mode === "train") return "rail";
  return "road";
}
function isGenericPlanningPrompt(value?: string) { return !value || /^(historic core|a standout museum|a local neighbourhood|best viewpoint|market, food hall|a nearby landscape|a seasonal|the strongest day trip|a slower local day|the place.s signature|choose .*strongest)/i.test(value); }
function isPickCompatibleWithDestination(pick: CustomPick | undefined, destination: CustomDestination) {
  if (!pick) return false;
  const destinationCountry = destination.country ?? destination.name;
  if (pick.country) return pick.country.toLocaleLowerCase() === destinationCountry.toLocaleLowerCase();
  const context = `${destination.name} ${destinationCountry}`.toLocaleLowerCase();
  return `${pick.area} ${pick.description}`.toLocaleLowerCase().includes(context);
}

function customPlaceDetails(place: CustomPick | undefined) {
  if (!place) return [];

  const type = place.type.toLowerCase();
  const setting = place.area ? `around ${place.area}` : "around this place";
  const duration = place.duration || "a focused visit";
  const pacing = type.includes("food")
    ? `Make this the anchor for a proper meal, then keep the rest of the day walkable ${setting}.`
    : type.includes("nature") || type.includes("hike") || type.includes("landscape")
      ? `Start early, leave some weather buffer, and avoid adding a long transfer on either side.`
      : type.includes("beach")
        ? `Keep the surrounding time deliberately loose so weather and the pace of the day can lead.`
        : type.includes("museum") || type.includes("heritage") || type.includes("landmark") || type.includes("culture")
          ? `Give it ${duration}, then pair it only with nearby streets, food or another walkable stop.`
          : `Treat it as one focused chapter ${setting}, rather than trying to stack unrelated stops around it.`;
  const check = type.includes("nature") || type.includes("hike") || type.includes("landscape")
    ? "Check the forecast, opening conditions and the return transport before committing the day."
    : type.includes("food")
      ? "Check opening hours and whether a reservation is useful once the day and meal time are fixed."
      : "Check opening hours, closure days and any timed-entry requirement before you lock the day in.";

  return [
    { title: "Use the day well", copy: pacing },
    { title: "Before you go", copy: check },
  ];
}
function customDate(startDate: string, offset: number) { const date = new Date(`${startDate || "2027-03-01"}T00:00:00`); date.setDate(date.getDate() + offset); return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date); }
const planningBases: Record<string, string> = { peru: "Cusco", colombia: "Bogotá", japan: "Tokyo", china: "Beijing", italy: "Rome", france: "Paris", spain: "Barcelona", thailand: "Bangkok", vietnam: "Hanoi", indonesia: "Bali", "south korea": "Seoul", mexico: "Mexico City", portugal: "Lisbon", greece: "Athens", turkey: "Istanbul", "united kingdom": "London", "united states": "New York", australia: "Sydney", brazil: "Rio de Janeiro", morocco: "Marrakech", india: "Delhi", egypt: "Cairo", "new zealand": "Auckland", "south africa": "Cape Town" };
function planningBase(destination: string) { return getCountryIntelligence(destination)?.preferredFirstBase ?? planningBases[destination.toLowerCase()] ?? destination; }
function formatEstimate(minutes: number | null) { return minutes === null ? "Confirm connection" : `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m approx.`; }
function connection(from: JourneyStop, to: JourneyStop, first: boolean): JourneyCalendarDay["travel"] {
  const estimate = estimateLeg({ name: from.city, country: from.country, coordinates: from.coordinates ?? undefined }, { id: to.id, name: to.city, country: to.country, coordinates: to.coordinates ?? undefined });
  return { mode: estimate.mode === "train" ? "rail" : estimate.mode === "flight" ? "flight" : "road", from: first ? undefined : from.city, detail: `${estimate.distanceKm ? `${estimate.distanceKm.toLocaleString()} km · ` : ""}${estimate.note}`, duration: formatEstimate(estimate.durationMinutes) };
}
function makeCustomJourney(brief: CustomBrief) {
  const totalDays = Math.max(1, Number.parseInt(brief.duration, 10) || 10);
  const allocations = brief.destinations.map(() => Math.max(2, Math.floor(totalDays / Math.max(1, brief.destinations.length))));
  let extra = totalDays - allocations.reduce((sum, value) => sum + value, 0); for (let index = 0; extra > 0; index = (index + 1) % allocations.length, extra -= 1) allocations[index] += 1;
  const stops: JourneyStop[] = [{ id: "custom-origin", city: brief.origin, country: brief.origin, date: customDate(brief.startDate, 0), coordinates: customCoordinate(brief.origin, brief.origin), theme: "transit", marker: "plane", description: "Your starting point. Journey will keep travel days visible rather than hiding them between destinations.", highlights: ["Departure", "Route begins"], aiPrompt: "What should I prepare before leaving?" }];
  const calendar: JourneyCalendarDay[] = [];
  let dayNumber = 0;
  brief.destinations.forEach((destination, destinationIndex) => {
    const picks = brief.picks[destination.id] ?? [];
    const pickDetails = brief.pickDetails?.[destination.id] ?? [];
    const country = destination.country ?? destination.name;
    const base = destination.name;
    const previousBase = destinationIndex ? brief.destinations[destinationIndex - 1].name : brief.origin;
    for (let localDay = 0; localDay < allocations[destinationIndex]; localDay += 1) {
      dayNumber += 1;
      const isArrival = localDay === 0;
      // A selected place is a finite commitment, not filler to repeat until the
      // city allocation is exhausted. Remaining days stay at the selected base.
      const picked = !isArrival && localDay - 1 < picks.length ? picks[localDay - 1] : undefined;
      const pick = picked ? pickDetails.find((entry) => entry.title === picked) : undefined;
      // Existing drafts can contain old, globally ambiguous discovery results.
      // Keep those safely at the country base rather than putting the trip on a
      // different continent while the user updates the selection.
      const isPlace = !isGenericPlanningPrompt(picked) && isPickCompatibleWithDestination(pick, destination);
      const city = isPlace ? picked! : base;
      const stopId = `custom-${destination.id}-${localDay + 1}`;
      const previousStop = stops[stops.length - 1];
      stops.push({
        id: stopId, city, country, date: customDate(brief.startDate, dayNumber - 1), coordinates: isPlace ? pick?.coordinates ?? destination.coordinates ?? customCoordinate(city, "") : destination.coordinates ?? customCoordinate(city, ""), theme: isArrival ? "city" : "mountain", marker: isArrival ? "skyline" : "temple",
        description: isPlace ? (pick?.description ?? `A focused day for ${city} in ${country}.`) : (isArrival ? `A calm arrival chapter in ${base}, with enough room to settle before the trip’s bigger days.` : `A focused day in ${base}, ${country}.`),
        highlights: isArrival ? ["Arrival", "Check in", "Local dinner"] : isPlace ? [pick?.area ?? country, pick?.type ?? "Signature place", pick?.duration ?? "Flexible"] : [country, "Local base", "Flexible"], aiPrompt: `What should I refine around ${city}?`,
      });
      calendar.push({ id: `custom-day-${dayNumber}`, date: customDate(brief.startDate, dayNumber - 1), label: `Day ${dayNumber}`, stopId, city, title: isArrival ? `Arrive in ${base}` : isPlace ? picked! : `Explore ${base}`, travel: isArrival ? connection(previousStop, stops[stops.length - 1], destinationIndex === 0) : previousStop.country === country ? connection(previousStop, stops[stops.length - 1], false) : undefined, items: isArrival ? [`Check in around ${base}`, "A gentle orientation walk in the closest district", "Choose dinner near your base"] : [isPlace ? picked! : `Explore ${base} at a slower pace`, `Pair ${isPlace ? picked! : "your base"} with one nearby supporting place`, "Reserve a restaurant or stay option directly in today’s plan"] });
    }
  });
  const legs: JourneyLeg[] = stops.slice(1).map((stop, index) => {
    const from = stops[index];
    const local = from.country === stop.country;
    const estimate = estimateLeg({ name: from.city, country: from.country, coordinates: from.coordinates ?? undefined }, { id: stop.id, name: stop.city, country: stop.country, coordinates: stop.coordinates ?? undefined });
    return { from: from.id, to: stop.id, mode: estimate.mode === "train" ? "rail" : estimate.mode === "flight" ? "flight" : "road", label: estimate.label, detail: `${estimate.distanceKm ? `${estimate.distanceKm.toLocaleString()} km · ` : ""}${estimate.note}`, duration: formatEstimate(estimate.durationMinutes) };
  });
  return { title: "Your Journey", dateRange: `${customDate(brief.startDate, 0)} — ${customDate(brief.startDate, Math.max(0, totalDays - 1))}`, stops, legs, calendar };
}

/**
 * Map Plan is a second view of the canonical EasyT document, not another
 * itinerary generator. The public `/journey` story continues to use its fixed
 * editorial dataset; only `/journey/plan` enters this path.
 */
function makeEasyTJourney(trip: EasyTTrip) {
  const origin: JourneyStop = {
    id: `${trip.id}-origin`,
    city: trip.brief.origin,
    country: trip.brief.origin,
    date: customDate(trip.startDate, 0),
    coordinates: trip.brief.originCoordinates ?? customCoordinate(trip.brief.origin, trip.brief.origin),
    theme: "transit",
    marker: "plane",
    description: "Your starting point. Travel days stay visible as part of the plan.",
    highlights: ["Departure", "Route begins"],
    aiPrompt: "What should I prepare before leaving?",
  };
  const stopById = new Map(trip.stops.map((stop) => [stop.id, stop]));
  const orderedItems = [...trip.planItems].sort((a, b) => a.dayNumber - b.dayNumber);
  const stops: JourneyStop[] = [origin];
  const calendar: JourneyCalendarDay[] = orderedItems.map((item, index) => {
    const base = stopById.get(item.stopId) ?? trip.stops[0];
    const selectedPlaceTitles = new Set(base ? (trip.brief.selectedPlaces[base.id] ?? []) : []);
    // A generated day can pair places under a human title ("X + nearby time").
    // Coordinates are the reliable signal that it is a real mappable place.
    const isMappedPlace = item.type === "activity" && (selectedPlaceTitles.has(item.title) || (item.latitude !== null && item.longitude !== null));
    const city = isMappedPlace ? item.title : (base?.name ?? item.title);
    const country = base?.country ?? city;
    const stopId = `${trip.id}-day-${item.dayNumber}`;
    const coordinates: [number, number] | null = item.longitude !== null && item.latitude !== null
      ? [item.longitude, item.latitude]
      : base?.longitude !== null && base?.longitude !== undefined && base.latitude !== null
        ? [base.longitude, base.latitude]
        : customCoordinate(city, "");
    const previousItem = orderedItems[index - 1];
    const previousBase = previousItem ? stopById.get(previousItem.stopId) : undefined;
    const movedBase = index === 0 || previousBase?.id !== base?.id;
    const relatedLeg = movedBase && base
      ? trip.legs.find((leg) => leg.toStopId === base.id)
      : undefined;
    const estimatedLeg = movedBase && base ? estimateLeg(
      {
        name: index === 0 ? trip.brief.origin : previousBase?.name ?? "Previous stop",
        country: index === 0 ? trip.brief.origin : previousBase?.country ?? "",
        coordinates: index === 0 ? origin.coordinates ?? undefined : previousBase?.longitude !== null && previousBase?.longitude !== undefined && previousBase.latitude !== null ? [previousBase.longitude, previousBase.latitude] : undefined,
      },
      {
        id: base.id,
        name: base.name,
        country: base.country,
        coordinates: base.longitude !== null && base.latitude !== null ? [base.longitude, base.latitude] : undefined,
      },
    ) : undefined;
    const minutes = relatedLeg?.durationMinutes ?? estimatedLeg?.durationMinutes;
    const distanceKm = relatedLeg?.distanceKm ?? estimatedLeg?.distanceKm;
    const travel = movedBase ? {
      mode: relatedLeg ? journeyTransportMode(relatedLeg.mode) : estimatedLeg ? journeyTransportMode(estimatedLeg.mode) : (index === 0 ? "flight" : "road"),
      from: index === 0 ? trip.brief.origin : previousBase?.name,
      detail: `${distanceKm ? `${distanceKm.toLocaleString()} km · ` : ""}${relatedLeg?.provider ?? estimatedLeg?.note ?? `Travel to ${base?.name ?? city}`}`,
      duration: minutes ? `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, "0")}m` : "Confirm the best connection",
    } satisfies JourneyCalendarDay["travel"] : undefined;

    stops.push({
      id: stopId,
      city,
      country,
      date: customDate(trip.startDate, item.dayNumber - 1),
      coordinates,
      theme: item.type === "arrival" ? "city" : "mountain",
      marker: item.type === "arrival" ? "skyline" : "temple",
      description: item.reason,
      highlights: item.notes.slice(0, 3),
      aiPrompt: `What should I refine around ${city}?`,
    });

    return {
      id: `${trip.id}-calendar-${item.dayNumber}`,
      date: customDate(trip.startDate, item.dayNumber - 1),
      label: `Day ${item.dayNumber}`,
      stopId,
      city,
      title: item.title,
      travel,
      items: item.notes.length ? item.notes : [item.title],
    };
  });
  const legs: JourneyLeg[] = stops.slice(1).map((stop, index) => {
    const from = stops[index];
    const day = calendar[index];
    return {
      from: from.id,
      to: stop.id,
      mode: day.travel?.mode ?? "road",
      label: `${from.city} → ${stop.city}`,
      detail: day.travel?.detail ?? "Day plan",
      duration: day.travel?.duration ?? "Local movement",
    };
  });
  return {
    title: trip.title || "Your Journey",
    dateRange: `${customDate(trip.startDate, 0)} — ${customDate(trip.endDate, 0)}`,
    stops,
    legs,
    calendar,
  };
}

export default function JourneyPage() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const isPlanningPreview = pathname === "/journey/plan";
  const [selectedDayId, setSelectedDayId] = useState("day-03");
  const [selectedId, setSelectedId] = useState("tokyo");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ restaurant: JourneyRestaurant; meal?: RestaurantMeal }>();
  const [customBrief, setCustomBrief] = useState<CustomBrief | null>(null);
  const [customTrip, setCustomTrip] = useState<EasyTTrip | null>(null);
  const [planHydrated, setPlanHydrated] = useState(!isPlanningPreview);
  const [resolvedCoordinates, setResolvedCoordinates] = useState<Record<string, [number, number]>>({});
  const [placeMedia, setPlaceMedia] = useState<Record<string, { image?: string; description?: string; sourceUrl?: string; coordinates?: [number, number] }>>({});
  const [cloudSaveState, setCloudSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [autoSaveRequested, setAutoSaveRequested] = useState(false);
  const trackRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  const journey = useMemo(() => {
    const base = customTrip
      ? makeEasyTJourney(customTrip)
      : customBrief
        ? makeCustomJourney(customBrief)
        : ({ title: march2027Journey.title, dateRange: march2027Journey.dateRange, stops: march2027Journey.stops, legs: march2027Journey.legs, calendar: journeyCalendar });
    return customBrief ? { ...base, stops: base.stops.map((stop) => ({ ...stop, coordinates: resolvedCoordinates[stop.id] ?? stop.coordinates, description: placeMedia[stop.id]?.description ?? stop.description })) } : base;
  }, [customBrief, customTrip, resolvedCoordinates, placeMedia]);
  const isCustomJourney = Boolean(customBrief);
  const editTripHref = customTrip
    ? `/journey/new?trip=${encodeURIComponent(customTrip.id)}`
    : "/journey/new";
  const selected = useMemo(
    () => journey.stops.find((stop) => stop.id === selectedId) ?? journey.stops[0],
    [selectedId, journey.stops],
  );
  const selectedDay = journey.calendar.find((day) => day.id === selectedDayId) ?? journey.calendar[0];
  const selectedDayIndex = journey.calendar.findIndex((day) => day.id === selectedDay.id);
  const reviewRecommendations = useMemo(() => customTrip ? reviewTrip(customTrip).map((item) => ({ ...item, status: customTrip.recommendations.find((saved) => saved.id === item.id)?.status ?? item.status })) : [], [customTrip]);
  const customPlace = useMemo(() => {
    if (!customBrief) return undefined;
    return customBrief.destinations.flatMap((destination) => customBrief.pickDetails?.[destination.id] ?? [])
      .find((place) => place.title === selected.city && (!place.country || place.country.toLowerCase() === selected.country.toLowerCase()));
  }, [customBrief, selected.city, selected.country]);
  // The original Journey is deliberately editorial. Generated trips only show
  // guidance grounded in the actual place the traveller selected — never the
  // generic country-level boilerplate that made every day read the same.
  const details = isCustomJourney ? customPlaceDetails(customPlace) : (journeyDetails[selected.id] ?? []);
  const media = isCustomJourney ? undefined : journeyMedia[selected.id];
  const customImage = placeMedia[selected.id]?.image
    ? { src: placeMedia[selected.id]!.image!, alt: selected.city, caption: selected.city, sourceUrl: placeMedia[selected.id]?.sourceUrl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(selected.city.replace(/ /g, "_"))}` }
    : customPlace?.image
      ? { src: customPlace.image, alt: selected.city, caption: selected.city, sourceUrl: customPlace.sourceUrl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(selected.city.replace(/ /g, "_"))}` }
      : Object.entries(placeMedia).map(([stopId, item]) => {
        const stop = journey.stops.find((candidate) => candidate.id === stopId);
        return stop?.country === selected.country && item.image
          ? { src: item.image, alt: selected.country, caption: `${selected.country} · journey reference`, sourceUrl: item.sourceUrl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(selected.country.replace(/ /g, "_"))}` }
          : undefined;
      }).find(Boolean);
  const dayMedia = journeyDayMedia[selectedDay.id];
  const images = isCustomJourney ? (customImage ? [customImage] : []) : (dayMedia?.length ? dayMedia : media ? [media.hero, ...(media.gallery ?? [])] : []);
  const mapPreviewImage = images.find((image) => image.src !== images[0]?.src);
  const customMapPlace: JourneyMapPlace | undefined = isCustomJourney && selected.coordinates ? { name: selected.city, coordinates: selected.coordinates, address: `${selected.city}, ${selected.country}`, image: customImage, summary: selected.description } : undefined;
  const DestinationIcon = destinationIcons[selected.marker] ?? Landmark;
  const handleRestaurantSelect = useCallback((restaurant?: JourneyRestaurant, meal?: RestaurantMeal) => {
    setSelectedRestaurant(restaurant ? { restaurant, meal } : undefined);
  }, []);

  const changeRecommendation = useCallback((recommendationId: string, action: "apply" | "undo") => {
    if (!customTrip) return;
    const source = { ...customTrip, recommendations: reviewRecommendations };
    const next = action === "apply" ? applyRecommendation(source, recommendationId) : undoRecommendation(source, recommendationId);
    setCustomTrip(next);
    saveActiveTrip(next);
    if (session?.user) {
      setCloudSaveState("saving");
      void saveTripToEasyT(next).then((saved) => { saveActiveTrip(saved); setCustomTrip(saved); setCloudSaveState("saved"); }).catch(() => setCloudSaveState("error"));
    }
  }, [customTrip, reviewRecommendations, session?.user]);

  const savePlan = useCallback(async () => {
    if (!customTrip) return;
    if (!session?.user) {
      const next = `/journey/plan?trip=${encodeURIComponent(customTrip.id)}&save=1`;
      router.push(`/journey/login?next=${encodeURIComponent(next)}`);
      return;
    }
    setCloudSaveState("saving");
    try {
      const reviewedTrip = { ...customTrip, recommendations: reviewTrip(customTrip) };
      const saved = await saveTripToEasyT(reviewedTrip);
      saveActiveTrip(saved);
      setCustomTrip(saved);
      setCustomBrief(customBriefFromEasyT(saved));
      setCloudSaveState("saved");
      router.replace(`/journey/plan?trip=${encodeURIComponent(saved.id)}`);
    } catch {
      setCloudSaveState("error");
    }
  }, [customTrip, router, session?.user]);

  useEffect(() => {
    hasMounted.current = true;
    const hydratePlan = async () => {
      if (!isPlanningPreview) return;
      try {
        const params = new URLSearchParams(window.location.search);
        const tripId = params.get("trip");
        setAutoSaveRequested(params.get("save") === "1");
        let activeTrip: EasyTTrip | null = null;
        if (tripId) {
          try { activeTrip = await loadTripFromEasyT(tripId); } catch { /* fall back to the local canonical copy */ }
        }
        const localTrip = loadActiveTrip();
        if (!activeTrip && (!tripId || localTrip?.id === tripId)) activeTrip = localTrip;
        if (activeTrip) {
          setCustomTrip(activeTrip);
          setCustomBrief(customBriefFromEasyT(activeTrip));
          return;
        }
        // Older local drafts remain readable during migration, but new plans no
        // longer write this compatibility payload.
        try {
          const stored = window.localStorage.getItem("journey:planned-trip");
          const parsed = stored ? JSON.parse(stored) : null;
          if (parsed?.brief?.destinations?.length) setCustomBrief(parsed.brief as CustomBrief);
        } catch { /* A static Journey remains available if a local draft is malformed. */ }
      } finally {
        setPlanHydrated(true);
      }
    };
    void hydratePlan();
  }, [isPlanningPreview]);

  useEffect(() => {
    if (!isPlanningPreview || !autoSaveRequested || !customTrip || !session?.user || cloudSaveState !== "idle") return;
    void savePlan();
  }, [autoSaveRequested, cloudSaveState, customTrip, isPlanningPreview, savePlan, session?.user]);

  useEffect(() => {
    if (!customBrief) return;
    const generated = customTrip ? makeEasyTJourney(customTrip) : makeCustomJourney(customBrief);
    const firstDay = generated.calendar[0];
    if (firstDay) {
      setSelectedDayId(firstDay.id);
      setSelectedId(firstDay.stopId);
    }
  }, [customBrief, customTrip]);

  useEffect(() => {
    if (!customBrief) return;
    const generated = customTrip ? makeEasyTJourney(customTrip) : makeCustomJourney(customBrief);
    let active = true;
    Promise.all(generated.stops.slice(1).map(async (stop) => {
      const country = stop.id === "custom-origin" ? "" : stop.country;
      const response = await fetch(`/api/journey-place?title=${encodeURIComponent(stop.city)}&country=${encodeURIComponent(country)}`);
      const payload = await response.json() as { place?: { image?: string; description?: string; sourceUrl?: string; coordinates?: [number, number] } | null };
      return [stop.id, payload.place] as const;
    })).then((results) => {
      if (!active) return;
      setPlaceMedia(Object.fromEntries(results.filter((entry): entry is [string, NonNullable<typeof entry[1]>] => Boolean(entry[1]))));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [customBrief, customTrip]);

  useEffect(() => {
    if (!customBrief) return;
    const places = (customTrip ? makeEasyTJourney(customTrip) : makeCustomJourney(customBrief)).stops;
    if (!places.length) return;
    let active = true;
    Promise.all(places.map(async (place) => {
      // The origin is entered as a city/place, not a country. Supplying
      // `London, London` makes Nominatim correctly reject London, UK.
      const country = place.id === "custom-origin" ? "" : place.country;
      const response = await fetch(`/api/journey-geocode?place=${encodeURIComponent(place.city)}&country=${encodeURIComponent(country)}`);
      const payload = await response.json() as { result?: { coordinates?: [number, number] } | null };
      return [place.id, payload.result?.coordinates] as const;
    })).then((results) => {
      if (!active) return;
      setResolvedCoordinates((current) => ({ ...current, ...Object.fromEntries(results.filter((entry): entry is [string, [number, number]] => Boolean(entry[1]))) }));
    }).catch(() => undefined);
    return () => { active = false; };
  }, [customBrief, customTrip]);

  useEffect(() => {
    if (!window.matchMedia("(max-width: 720px)").matches) return;
    const frame = window.requestAnimationFrame(() => {
      const track = trackRef.current;
      const activeDay = track?.querySelector<HTMLElement>(`[data-day-id="${selectedDayId}"]`);
      if (!track || !activeDay) return;
      const trackBox = track.getBoundingClientRect();
      const dayBox = activeDay.getBoundingClientRect();
      const delta = (dayBox.left + dayBox.width / 2) - (trackBox.left + trackBox.width / 2);
      track.scrollBy({ left: delta, behavior: "smooth" });
    });
    setSelectedRestaurant(undefined);
    return () => window.cancelAnimationFrame(frame);
  }, [selectedDayId]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      if (selectedDayIndex === journey.calendar.length - 1) {
        setIsPlaying(false);
      } else {
        const nextDay = journey.calendar[selectedDayIndex + 1];
        setSelectedDayId(nextDay.id);
        setSelectedId(nextDay.stopId);
      }
    }, 1550);
    return () => window.clearTimeout(timer);
  }, [isPlaying, selectedDayIndex, journey.calendar]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setIsPlaying(false);
        const nextDay = journey.calendar[Math.min(selectedDayIndex + 1, journey.calendar.length - 1)];
        setSelectedDayId(nextDay.id);
        setSelectedId(nextDay.stopId);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setIsPlaying(false);
        const previousDay = journey.calendar[Math.max(selectedDayIndex - 1, 0)];
        setSelectedDayId(previousDay.id);
        setSelectedId(previousDay.stopId);
      }
      if (event.key === " ") {
        if (target?.matches("button")) return;
        event.preventDefault();
        setIsPlaying((playing) => !playing);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedDayIndex, journey.calendar]);

  if (isPlanningPreview && !planHydrated) {
    return (
      <main className={`${styles.journey} ${styles.planLoading}`} aria-busy="true">
        <div className={styles.planLoadingMark}><span>Easy</span><b>T</b></div>
        <p>Opening your journey…</p>
      </main>
    );
  }

  return (
    <main className={styles.journey}>
      <JourneyGlobe
        stops={journey.stops}
        legs={journey.legs}
        selectedId={selectedId}
        selectedDayId={selectedDayId}
        activeItems={selectedDay.items}
        previewImage={mapPreviewImage}
        detailImageSrc={images[0]?.src}
        dayPlace={customMapPlace}
        restaurant={selectedRestaurant}
        variant={isCustomJourney ? "planner" : "story"}
        onSelect={(id) => {
          setIsPlaying(false);
          setSelectedId(id);
          const matchingDay = journey.calendar.find((day) => day.stopId === id)
            ?? (!isCustomJourney && id === "los-angeles-out" ? journey.calendar[0] : undefined);
          if (matchingDay) setSelectedDayId(matchingDay.id);
        }}
      />
      <div className={styles.vignette} />
      <div className={styles.grain} />

      <header className={styles.topbar}>
        <div className={styles.headerRow}>
          {isPlanningPreview ? <Link href={editTripHref} className={styles.back}>← Edit trip</Link> : <Link href="/" className={styles.back}>← Shaun Whiting</Link>}
          <div className={styles.titleLockup}><span>{journey.title}</span><small>{journey.dateRange}</small></div>
          <nav className={styles.headerActions} aria-label="EasyT account navigation">
            <Link href="/journey/dashboard" className={styles.myTripsLink}>My trips</Link>
            {isPlanningPreview && isCustomJourney ? <button type="button" className={styles.savePlanLink} onClick={() => void savePlan()} disabled={cloudSaveState === "saving"}>
              {cloudSaveState === "saving" ? "Saving…" : cloudSaveState === "saved" ? "Saved" : "Save trip"}
            </button> : null}
            {isPlanningPreview && customTrip && session?.user ? <a className={styles.exportPlanLink} href={`/api/easyt/trips/${encodeURIComponent(customTrip.id)}/pdf`} download={`${customTrip.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}.pdf`}>Export PDF</a> : null}
            <Link href="/journey/new" className={styles.createTripLink}><Plus /> <span>New trip</span></Link>
          </nav>
        </div>
        <nav className={styles.timeline} aria-label="Trip itinerary">
          <div className={styles.track} ref={trackRef} style={{ gridTemplateColumns: `repeat(${journey.calendar.length}, minmax(132px, 1fr))` }}>
            {journey.calendar.map((day, index) => {
              const active = day.id === selectedDayId;
              return (
                <button
                  key={day.id}
                  data-day-id={day.id}
                  onClick={() => { setIsPlaying(false); setSelectedDayId(day.id); setSelectedId(day.stopId); }}
                  className={`${styles.stop} ${active ? styles.active : ""}`}
                  aria-current={active ? "step" : undefined}
                >
                  <span className={styles.stopNode}><i /></span>
                  <span className={styles.stopDate}>{day.date} · {day.label}</span>
                  <strong>{day.city}</strong>
                  {index < journey.calendar.length - 1 ? <span className={styles.segment} /> : null}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <section className={styles.destination} aria-live="polite">
        <motion.div
          key={selected.id}
          initial={hasMounted.current ? { opacity: 0, x: -7, filter: "blur(2px)" } : false}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 260, damping: 30, mass: .65 }}
        >
            <div className={styles.destinationIntro}>
              <div className={styles.destinationLine} />
              <div className={styles.introTop}>
                <p className={styles.kicker}>{selectedDay.date} <span /> {selected.country}</p>
                {selected.coordinates ? <JourneyWeather city={selected.city} coordinates={selected.coordinates} date={selectedDay.date} /> : <span className={styles.weatherUnavailable}>Weather appears once this stop is mapped.</span>}
              </div>
              <div className={styles.destinationTitle}><h1>{selected.city}</h1><span aria-hidden="true"><DestinationIcon /></span></div>
              <p className={styles.description}>{selected.description}</p>
              {!isCustomJourney ? <div className={styles.highlights}>
                {selected.highlights.map((highlight, index) => <span key={highlight}><b>0{index + 1}</b>{highlight}</span>)}
              </div> : null}
            </div>
            {images.length ? <>
              <JourneyCarousel images={images} city={selectedDay.city} storyKey={selectedDay.id} />
              <details className={styles.exploreMore} open>
                <summary><span>Explore {selected.city}</span><b>More details</b></summary>
                <div className={styles.exploreContent}>
                  {details.map((detail) => <article key={detail.title}><h3>{detail.title}</h3><p>{detail.copy}</p></article>)}
                </div>
              </details>
            </> : null}
            {!images.length && details.length ? <div className={styles.detailSections}>
              {details.map((detail) => <details key={detail.title} open={isCustomJourney}><summary>{detail.title}<span>+</span></summary><p>{detail.copy}</p></details>)}
            </div> : null}
        </motion.div>
      </section>

      <aside className={styles.itineraryPanel} aria-live="polite">
        <motion.div
          key={selectedDay.id}
          initial={hasMounted.current ? { opacity: 0, x: 8 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.itineraryEyebrow}>{selectedDay.date} <span /> {selectedDay.label}</p>
          <h2>{selectedDay.title}</h2>
          <p className={styles.itineraryLocation}>{selectedDay.city}</p>
          {isPlanningPreview && customTrip ? <section className={styles.reviewPanel} aria-label="Plan review">
            <div className={styles.reviewHeader}><div><small>PLAN REVIEW</small><strong>{reviewRecommendations.length ? `${reviewRecommendations.length} planning signal${reviewRecommendations.length === 1 ? "" : "s"}` : "No immediate warnings"}</strong></div><span>Deterministic checks</span></div>
            {reviewRecommendations.length ? <div className={styles.reviewList}>{reviewRecommendations.map((item) => <article key={item.id} className={`${styles.reviewItem} ${styles[`review${item.severity[0].toUpperCase()}${item.severity.slice(1)}`]} ${item.status !== "open" ? styles.reviewResolved : ""}`}><div><b>{item.status === "open" ? item.severity : item.status}</b><strong>{item.message}</strong></div><p>{item.evidence}</p><small>Affects {item.affectedDays.length ? item.affectedDays.map((day) => `day ${day}`).join(", ") : "the overall plan"} · {item.confidence} confidence</small><p className={styles.reviewImpact}>{recommendationImpact(item)}</p><div className={styles.reviewActions}>{item.status === "open" ? <button type="button" onClick={() => changeRecommendation(item.id, "apply")}>Apply</button> : <button type="button" onClick={() => changeRecommendation(item.id, "undo")}>Undo</button>}</div></article>)}</div> : <p className={styles.reviewEmpty}>The route currently has coverage for every day and no long road transfer signal. Live schedules and closures still need checking before booking.</p>}
          </section> : null}
          {selectedDay.travel ? <div className={styles.dayTravel}><Plane /><div><small>{selectedDay.travel.mode === "flight" ? "Travel connection" : "Local transfer"}</small><strong>{selectedDay.travel.from ? `${selectedDay.travel.from} → ${selectedDay.city}` : selectedDay.travel.detail}</strong><span>{selectedDay.travel.duration} · {selectedDay.travel.detail}</span></div></div> : null}
          <ol>
            {selectedDay.items.map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></li>)}
            {selectedRestaurant ? <li className={styles.savedRestaurant}>
              <b>{String(selectedDay.items.length + 1).padStart(2, "0")}</b>
              <a href={selectedRestaurant.restaurant.mapsUrl} target="_blank" rel="noreferrer">
                <span className={styles.savedRestaurantIcon}><Utensils /></span>
                <span className={styles.savedRestaurantCopy}>
                  <small>{selectedRestaurant.meal ?? "Meal"} · saved restaurant</small>
                  <strong>{selectedRestaurant.restaurant.name}</strong>
                  <em>{selectedRestaurant.restaurant.area}</em>
                </span>
                <ArrowUpRight />
              </a>
            </li> : null}
          </ol>
          {selectedDayIndex < journey.calendar.length - 1 ? <button type="button" className={styles.nextDay} onClick={() => {
            const nextDay = journey.calendar[selectedDayIndex + 1];
            setIsPlaying(false);
            setSelectedDayId(nextDay.id);
            setSelectedId(nextDay.stopId);
          }}><small>Next</small><span>{journey.calendar[selectedDayIndex + 1].date}</span><strong>{journey.calendar[selectedDayIndex + 1].city} →</strong></button> : null}
          {isCustomJourney && selected.coordinates ? <><JourneyLocalFinder kind="restaurant" city={selected.city} country={selected.country} dayId={selectedDay.id} coordinates={selected.coordinates} onRestaurantSelect={handleRestaurantSelect} /><JourneyLocalFinder kind="stay" city={selected.city} country={selected.country} dayId={selectedDay.id} coordinates={selected.coordinates} /></> : !isCustomJourney ? <JourneyRestaurantFinder stopId={selected.id} city={selected.city} dayId={selectedDay.id} onSelectRestaurant={handleRestaurantSelect} /> : null}
        </motion.div>
      </aside>

      <button className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`} onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? "Pause journey sequence" : "Play journey sequence"}>
        <span>{isPlaying ? "Ⅱ" : "▶"}</span>
        <strong>{isPlaying ? "Pause journey" : "Play journey"}</strong>
        <small>{selectedDayIndex + 1} / {journey.calendar.length}</small>
      </button>
      {cloudSaveState === "error" ? <p className={styles.savePlanError}>Couldn’t save this trip just now. Your plan is still safe on this device.</p> : null}

    </main>
  );
}
