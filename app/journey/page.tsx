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

type CustomPick = { id: string; title: string; area: string; type: string; duration: string; description: string; image?: string; country?: string };
type CustomDestination = { id: string; name: string; country?: string; coordinates?: [number, number]; kind?: string };
type CustomBrief = { origin: string; destinations: CustomDestination[]; startDate: string; duration: string; travellers: string; interests: string[]; picks: Record<string, string[]>; pickDetails?: Record<string, CustomPick[]> };

const customCoordinates: Record<string, [number, number]> = {
  "guatemala city": [-90.5069, 14.6349], london: [-0.1276, 51.5072], japan: [139.6917, 35.6895], tokyo: [139.6917, 35.6895], "hong kong": [114.1694, 22.3193], france: [2.3522, 48.8566], spain: [2.1734, 41.3851], italy: [12.4964, 41.9028], china: [104.1954, 35.8617], thailand: [100.5018, 13.7563], mexico: [-99.1332, 19.4326], "united states": [-74.006, 40.7128], "united kingdom": [-0.1276, 51.5072], "south korea": [126.978, 37.5665], germany: [13.405, 52.52], portugal: [-9.1393, 38.7223], greece: [23.7275, 37.9838], turkey: [28.9784, 41.0082], vietnam: [105.8342, 21.0278], indonesia: [115.1889, -8.4095], australia: [151.2093, -33.8688], brazil: [-43.1729, -22.9068], morocco: [-7.9811, 31.6295], canada: [-79.3832, 43.6532], india: [77.209, 28.6139], singapore: [103.8198, 1.3521], "united arab emirates": [55.2708, 25.2048], egypt: [31.2357, 30.0444], croatia: [18.0944, 42.6507], switzerland: [8.5417, 47.3769], argentina: [-58.3816, -34.6037], peru: [-77.0428, -12.0464], cusco: [-71.9785, -13.517], "sacred valley": [-72.115, -13.308], "machu picchu": [-72.5451, -13.1631], colombia: [-74.0721, 4.711], "bogotá": [-74.0721, 4.711], bogota: [-74.0721, 4.711], medellín: [-75.5812, 6.2442], medellin: [-75.5812, 6.2442], iceland: [-21.9426, 64.1466], "new zealand": [174.7633, -36.8485], "south africa": [18.4241, -33.9249], "costa rica": [-84.0907, 9.9281], philippines: [120.9842, 14.5995], malaysia: [101.6869, 3.139], austria: [16.3738, 48.2082], netherlands: [4.9041, 52.3676], czechia: [14.4378, 50.0755], "czech republic": [14.4378, 50.0755], ireland: [-6.2603, 53.3498], norway: [10.7522, 59.9139], denmark: [12.5683, 55.6761], sweden: [18.0686, 59.3293], poland: [19.945, 50.0647], chile: [-70.6693, -33.4489], kenya: [36.8219, -1.2921], tanzania: [39.2083, -6.7924], maldives: [73.5093, 4.1755], guatemala: [-90.5069, 14.6349],
};

function customCoordinate(name: string, fallback: string): [number, number] { return customCoordinates[name.toLowerCase()] ?? customCoordinates[fallback.toLowerCase()] ?? [0, 0]; }
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
function connection(from: string, to: string, first: boolean): JourneyCalendarDay["travel"] { const local = from === to; return { mode: local ? "road" : "flight", from: first ? undefined : from, detail: local ? `Local transfer into ${to}` : `Travel from ${from} to ${to}`, duration: local ? "~30–60 min transfer" : "Travel day · confirm the best flight or rail link" }; }
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
      const picked = !isArrival && picks.length ? picks[(localDay - 1) % picks.length] : undefined;
      const pick = picked ? pickDetails.find((entry) => entry.title === picked) : undefined;
      // Existing drafts can contain old, globally ambiguous discovery results.
      // Keep those safely at the country base rather than putting the trip on a
      // different continent while the user updates the selection.
      const isPlace = !isGenericPlanningPrompt(picked) && isPickCompatibleWithDestination(pick, destination);
      const city = isPlace ? picked! : base;
      const stopId = `custom-${destination.id}-${localDay + 1}`;
      const previousStop = stops[stops.length - 1];
      stops.push({
        id: stopId, city, country, date: customDate(brief.startDate, dayNumber - 1), coordinates: isArrival && destination.coordinates ? destination.coordinates : customCoordinate(city, country), theme: isArrival ? "city" : "mountain", marker: isArrival ? "skyline" : "temple",
        description: isPlace ? (pick?.description ?? `A focused day for ${city} in ${country}.`) : (isArrival ? `A calm arrival chapter in ${base}, with enough room to settle before the trip’s bigger days.` : `A focused day in ${base}, ${country}.`),
        highlights: isArrival ? ["Arrival", "Check in", "Local dinner"] : isPlace ? [pick?.area ?? country, pick?.type ?? "Signature place", pick?.duration ?? "Flexible"] : [country, "Local base", "Flexible"], aiPrompt: `What should I refine around ${city}?`,
      });
      calendar.push({ id: `custom-day-${dayNumber}`, date: customDate(brief.startDate, dayNumber - 1), label: `Day ${dayNumber}`, stopId, city, title: isArrival ? `Arrive in ${base}` : isPlace ? picked! : `Explore ${base}`, travel: isArrival ? connection(previousBase, base, destinationIndex === 0) : previousStop.country === country ? connection(previousStop.city, city, false) : undefined, items: isArrival ? [`Check in around ${base}`, "A gentle orientation walk in the closest district", "Choose dinner near your base"] : [isPlace ? picked! : `Explore ${base} at a slower pace`, `Pair ${isPlace ? picked! : "your base"} with one nearby supporting place`, "Reserve a restaurant or stay option directly in today’s plan"] });
    }
  });
  const legs: JourneyLeg[] = stops.slice(1).map((stop, index) => {
    const from = stops[index];
    const local = from.country === stop.country;
    return { from: from.id, to: stop.id, mode: local ? "road" : "flight", label: `${from.city} → ${stop.city}`, detail: local ? "Local connection · confirm the best rail, road or transfer" : "Suggested transport leg · verify the best service before booking", duration: local ? "Local travel" : "Travel day" };
  });
  return { title: "Your Journey", dateRange: `${customDate(brief.startDate, 0)} — ${customDate(brief.startDate, Math.max(0, totalDays - 1))}`, stops, legs, calendar };
}

export default function JourneyPage() {
  const pathname = usePathname();
  const router = useRouter();
  const isPlanningPreview = pathname === "/journey/plan";
  const [selectedDayId, setSelectedDayId] = useState("day-03");
  const [selectedId, setSelectedId] = useState("tokyo");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ restaurant: JourneyRestaurant; meal?: RestaurantMeal }>();
  const [customBrief, setCustomBrief] = useState<CustomBrief | null>(null);
  const [resolvedCoordinates, setResolvedCoordinates] = useState<Record<string, [number, number]>>({});
  const [placeMedia, setPlaceMedia] = useState<Record<string, { image?: string; description?: string; sourceUrl?: string; coordinates?: [number, number] }>>({});
  const trackRef = useRef<HTMLDivElement>(null);
  const hasMounted = useRef(false);
  const journey = useMemo(() => {
    const base = customBrief ? makeCustomJourney(customBrief) : ({ title: march2027Journey.title, dateRange: march2027Journey.dateRange, stops: march2027Journey.stops, legs: march2027Journey.legs, calendar: journeyCalendar });
    return customBrief ? { ...base, stops: base.stops.map((stop) => ({ ...stop, coordinates: resolvedCoordinates[stop.id] ?? stop.coordinates, description: placeMedia[stop.id]?.description ?? stop.description })) } : base;
  }, [customBrief, resolvedCoordinates, placeMedia]);
  const isCustomJourney = Boolean(customBrief);
  const selected = useMemo(
    () => journey.stops.find((stop) => stop.id === selectedId) ?? journey.stops[0],
    [selectedId, journey.stops],
  );
  const selectedDay = journey.calendar.find((day) => day.id === selectedDayId) ?? journey.calendar[0];
  const selectedDayIndex = journey.calendar.findIndex((day) => day.id === selectedDay.id);
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
  const customImage = placeMedia[selected.id]?.image ? { src: placeMedia[selected.id]!.image!, alt: selected.city, caption: selected.city, sourceUrl: placeMedia[selected.id]?.sourceUrl ?? `https://en.wikipedia.org/wiki/${encodeURIComponent(selected.city.replace(/ /g, "_"))}` } : undefined;
  const images = isCustomJourney ? (customImage ? [customImage] : []) : (journeyDayMedia[selectedDay.id] ?? (media ? [media.hero, ...(media.gallery ?? [])] : []));
  const mapPreviewImage = images.find((image) => image.src !== images[0]?.src);
  const customMapPlace: JourneyMapPlace | undefined = isCustomJourney ? { name: selected.city, coordinates: selected.coordinates, address: `${selected.city}, ${selected.country}`, image: customImage, summary: selected.description } : undefined;
  const DestinationIcon = destinationIcons[selected.marker] ?? Landmark;
  const handleRestaurantSelect = useCallback((restaurant?: JourneyRestaurant, meal?: RestaurantMeal) => {
    setSelectedRestaurant(restaurant ? { restaurant, meal } : undefined);
  }, []);

  useEffect(() => {
    hasMounted.current = true;
    try {
      if (!isPlanningPreview) return;
      const stored = window.localStorage.getItem("journey:planned-trip");
      const parsed = stored ? JSON.parse(stored) : null;
      if (parsed?.brief?.destinations?.length) setCustomBrief(parsed.brief as CustomBrief);
    } catch { /* A static Journey remains available if a local draft is malformed. */ }
  }, [isPlanningPreview]);

  useEffect(() => {
    if (!customBrief) return;
    const generated = makeCustomJourney(customBrief);
    const firstDay = generated.calendar[0];
    if (firstDay) {
      setSelectedDayId(firstDay.id);
      setSelectedId(firstDay.stopId);
    }
  }, [customBrief]);

  useEffect(() => {
    if (!customBrief) return;
    const generated = makeCustomJourney(customBrief);
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
  }, [customBrief]);

  useEffect(() => {
    if (!customBrief) return;
    const places = makeCustomJourney(customBrief).stops;
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
  }, [customBrief]);

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
          {isPlanningPreview ? <button type="button" className={styles.back} onClick={() => router.back()}>← Back to builder</button> : <Link href="/" className={styles.back}>← Shaun Whiting</Link>}
          <div className={styles.titleLockup}><span>{journey.title}</span><small>{journey.dateRange}</small></div>
          <Link href="/journey/new" className={styles.createTripLink}><Plus /> <span>Create new trip</span></Link>
        </div>
        <nav className={styles.timeline} aria-label="Trip itinerary">
          <div className={styles.track} ref={trackRef} style={{ gridTemplateColumns: `repeat(${journey.calendar.length}, minmax(74px, 1fr))` }}>
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
                <JourneyWeather city={selected.city} coordinates={selected.coordinates} date={selectedDay.date} />
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
          {isCustomJourney ? <><JourneyLocalFinder kind="restaurant" city={selected.city} country={selected.country} dayId={selectedDay.id} coordinates={selected.coordinates} onRestaurantSelect={handleRestaurantSelect} /><JourneyLocalFinder kind="stay" city={selected.city} country={selected.country} dayId={selectedDay.id} coordinates={selected.coordinates} /></> : <JourneyRestaurantFinder stopId={selected.id} city={selected.city} dayId={selectedDay.id} onSelectRestaurant={handleRestaurantSelect} />}
        </motion.div>
      </aside>

      <button className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`} onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? "Pause journey sequence" : "Play journey sequence"}>
        <span>{isPlaying ? "Ⅱ" : "▶"}</span>
        <strong>{isPlaying ? "Pause journey" : "Play journey"}</strong>
        <small>{selectedDayIndex + 1} / {journey.calendar.length}</small>
      </button>

    </main>
  );
}
