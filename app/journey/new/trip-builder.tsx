"use client";

/**
 * EasyT — new trip builder (v2 flow: Where → When → Places → Style → Draft)
 * Self-contained client component. Drop in at app/journey/new/trip-builder.tsx
 * and render <TripBuilder /> from page.tsx.
 *
 * Wire-up points marked TODO: geocode validation, place catalog, day imagery,
 * research pass. Everything else is complete.
 */

import {
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  Clock, GripVertical, MapPin, Mountain, Plane, Plus, Users, X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadActiveTrip, loadTripFromEasyT, saveActiveTrip, saveTripToEasyT } from "@/lib/easyt/storage";
import { tripFromBuilder } from "@/lib/easyt/trip";
import { journeyMedia, type JourneyImage } from "@/lib/journey";
import styles from "./trip-builder.module.css";

/* ---------------------------------------------------------------- data */

export type Place = {
  title: string; area: string; type: string;
  cost: number; tags: string[]; description: string;
  image?: string; sourceUrl?: string; coordinates?: [number, number];
};
export type Stop = { id: string; name: string; country: string; coordinates?: [number, number] };

// TODO: replace with the live discovery API response.
const CATALOG: Record<string, Place[]> = {
  tokyo: [
    { title: "Asakusa & Senso-ji", area: "East Tokyo", type: "Landmark", cost: 0.5, tags: ["Cities"], description: "Old Tokyo atmosphere, best paired with a nearby food stop rather than a cross-city rush." },
    { title: "Meiji Jingu & Harajuku", area: "West Tokyo", type: "Culture", cost: 0.5, tags: ["Cities"], description: "A forested shrine and the city's most kinetic streets in one natural area." },
    { title: "Mt. Takao", area: "Tokyo west", type: "Nature", cost: 0.5, tags: ["Nature"], description: "A rail escape for a summit walk and a proper break from the city." },
    { title: "Tokyo Marathon", area: "Central Tokyo", type: "Anchor event", cost: 1, tags: ["Cities"], description: "A fixed date that the rest of the week has to bend around." },
    { title: "Food neighbourhood night", area: "Ginza · Shinjuku or Ebisu", type: "Food", cost: 0.5, tags: ["Food"], description: "Leave a night open for the sort of meal that changes the shape of a city." },
  ],
  "hong kong": [
    { title: "Victoria Peak", area: "Central", type: "Viewpoint", cost: 0.5, tags: ["Cities"], description: "The big skyline moment; pair it with Central and a harbour evening." },
    { title: "Star Ferry & harbour", area: "Central ↔ Tsim Sha Tsui", type: "City ritual", cost: 0.5, tags: ["Cities"], description: "A short crossing with maximum sense of place, especially close to dusk." },
    { title: "Dragon's Back", area: "Shek O", type: "Hike", cost: 0.5, tags: ["Nature", "Beach"], description: "A ridge walk finishing naturally near Big Wave Bay or Shek O." },
    { title: "Tai Kwun & old Central", area: "Central", type: "Design + culture", cost: 0.5, tags: ["Cities"], description: "Heritage, galleries and the city's steep streets in one compact stop." },
    { title: "Cantonese food night", area: "Wan Chai or Kowloon", type: "Food", cost: 0.5, tags: ["Food"], description: "Room for one flexible dinner rather than deciding the cuisine in advance." },
  ],
};

/**
 * Fast, relevant next-stop prompts. They deliberately appear only after a
 * destination has been added — an empty route should not pretend to know
 * where someone wants to go.
 */
const NEARBY_SUGGESTIONS: Record<string, string[]> = {
  tokyo: ["Nikko", "Kanazawa", "Takayama", "Kyoto"],
  japan: ["Kyoto", "Kanazawa", "Takayama", "Nikko"],
  paris: ["Versailles", "Reims", "Lyon", "Bordeaux"],
  france: ["Lyon", "Bordeaux", "Nice", "Strasbourg"],
  "mexico city": ["Puebla", "Oaxaca", "Tepoztlán", "San Miguel de Allende"],
  mexico: ["Puebla", "Oaxaca", "Mérida", "San Miguel de Allende"],
  bangkok: ["Ayutthaya", "Kanchanaburi", "Chiang Mai", "Koh Samui"],
  thailand: ["Chiang Mai", "Ayutthaya", "Kanchanaburi", "Krabi"],
  london: ["Bath", "Oxford", "Brighton", "Edinburgh"],
  "united kingdom": ["Bath", "Edinburgh", "York", "Brighton"],
  barcelona: ["Girona", "Valencia", "Madrid", "Seville"],
  madrid: ["Toledo", "Seville", "Valencia", "Barcelona"],
  spain: ["Seville", "Granada", "Valencia", "Barcelona"],
  rome: ["Florence", "Naples", "Bologna", "Sorrento"],
  italy: ["Florence", "Bologna", "Naples", "Venice"],
  "hong kong": ["Macau", "Shenzhen", "Guangzhou", "Taipei"],
  china: ["Shanghai", "Chengdu", "Xi'an", "Hong Kong"],
  "guatemala city": ["Antigua Guatemala", "Lake Atitlán", "Flores", "Semuc Champey"],
  guatemala: ["Antigua Guatemala", "Lake Atitlán", "Flores", "Tikal"],
};
const FILTERS = ["All", "Food", "Nature", "Cities", "Beach"];
const STEPS = [
  { label: "Where", note: "Route first" },
  { label: "When", note: "Dates set length" },
  { label: "Places", note: "Spend your days" },
  { label: "Style", note: "How it should feel" },
];

/** Distinct filler days — never repeat one entry verbatim. */
const OPEN_DAYS = [
  { title: "Open day", reason: "Nothing scheduled. Whatever you found yesterday gets today.", items: ["Start wherever you left off", "One walkable area, no cross-city legs", "Leave the evening open"] },
  { title: "Neighbourhood day", reason: "One district, on foot, chosen once you're on the ground.", items: ["Pick a district over breakfast", "Walk it properly rather than ticking sights", "Eat where the queue is local"] },
  { title: "Day trip, if you feel like it", reason: "Held loosely — a short rail hop, or nothing at all.", items: ["Check the weather first", "Keep it under 90 minutes each way", "Be back for an unhurried dinner"] },
  { title: "Slow morning", reason: "A deliberate gap so the trip doesn't turn into a schedule.", items: ["No alarm", "One thing only, in the afternoon", "Restock and reset"] },
  { title: "Repeat day", reason: "Go back to the one place that landed best so far.", items: ["Return somewhere you liked", "See it at a different hour", "Nothing new required"] },
];

/* ------------------------------------------------------------- helpers */

const pad = (n: number) => String(n).padStart(2, "0");
const half = (n: number) => String(n).replace(".5", "½");
const iso = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
const fmtLong = (value: string) => {
  if (!value) return "";
  const d = new Date(`${value}T00:00:00`);
  return Number.isNaN(d.getTime()) ? "" : new Intl.DateTimeFormat("en", { day: "numeric", month: "short", year: "numeric" }).format(d);
};
const parseTyped = (text: string) => {
  const d = new Date(text);
  return Number.isNaN(d.getTime()) ? null : iso(d);
};
const placesFor = (stop: Stop, discovered: Record<string, Place[]>): Place[] =>
  discovered[stop.id] ?? CATALOG[stop.name.trim().toLowerCase()] ?? [];

const suggestionsFor = (stop?: Stop) => {
  if (!stop) return [];
  const nearby = NEARBY_SUGGESTIONS[stop.name.trim().toLowerCase()]
    ?? NEARBY_SUGGESTIONS[stop.country.trim().toLowerCase()]
    ?? [];
  return nearby.filter((name) => name.toLowerCase() !== stop.name.toLowerCase());
};

const MEDIA_KEYS: Record<string, string> = {
  "hong kong": "hong-kong",
  "mt takao": "tokyo",
};

const PLACE_IMAGE_HINTS: Record<string, string> = {
  "asakusa & senso-ji": "tokyo.jpg",
  "meiji jingu & harajuku": "imperial-palace.jpg",
  "mt. takao": "takao-summit.jpg",
  "tokyo marathon": "tokyo-marathon.jpg",
  "food neighbourhood night": "ginza-night.jpg",
  "victoria peak": "hong-kong.jpg",
  "star ferry & harbour": "star-ferry.jpg",
  "dragon's back": "dragons-back.jpg",
  "tai kwun & old central": "hong-kong-central-tram.jpg",
  "cantonese food night": "hong-kong-central-tram.jpg",
};

const mediaImagesFor = (destination: string): JourneyImage[] => {
  const normalized = destination.trim().toLowerCase();
  const key = MEDIA_KEYS[normalized] ?? normalized.replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  const media = journeyMedia[key];
  return media ? [media.hero, ...(media.gallery ?? [])] : [];
};

const normalizeMediaText = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const placeImageFor = (place: Place, stop: Stop): JourneyImage | null => {
  if (place.image) return { src: place.image, alt: place.title, caption: place.title, sourceUrl: place.sourceUrl ?? place.image };
  const images = mediaImagesFor(stop.name);
  const filename = PLACE_IMAGE_HINTS[place.title.toLowerCase()];
  if (filename) return images.find((image) => image.src.endsWith(`/${filename}`)) ?? null;
  const words = place.title.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length > 3);
  return images.find((image) => words.some((word) => `${image.alt} ${image.caption}`.toLowerCase().includes(word))) ?? images[0] ?? null;
};

const dayImageFor = (day: { title: string; destination: string; items: string[] }, index: number): JourneyImage | null => {
  const images = mediaImagesFor(day.destination);
  if (!images.length) return null;
  const searchable = normalizeMediaText(`${day.title} ${day.items.join(" ")}`);
  const hinted = Object.entries(PLACE_IMAGE_HINTS).find(([title]) => searchable.includes(normalizeMediaText(title)))?.[1];
  return (hinted ? images.find((image) => image.src.endsWith(`/${hinted}`)) : null) ?? images[index % images.length];
};

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) close(); };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open, close]);
  return ref;
}

/* --------------------------------------------------------- sub-components */

function Calendar({ value, onPick }: { value: string; onPick: (v: string) => void }) {
  const [view, setView] = useState(value || iso(new Date()));
  const v = new Date(`${view}T00:00:00`);
  const offset = new Date(v.getFullYear(), v.getMonth(), 1).getDay();
  const total = new Date(v.getFullYear(), v.getMonth() + 1, 0).getDate();
  const shift = (delta: number) => {
    const next = new Date(v); next.setMonth(next.getMonth() + delta, 1); setView(iso(next));
  };
  return (
    <div className={styles.calendar}>
      <div className={styles.calendarHead}>
        <button type="button" onClick={() => shift(-1)} aria-label="Previous month"><ChevronLeft /></button>
        <strong>{new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(v)}</strong>
        <button type="button" onClick={() => shift(1)} aria-label="Next month"><ChevronRight /></button>
      </div>
      <div className={styles.calendarWeekdays}>
        {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
      </div>
      <div className={styles.calendarGrid}>
        {Array.from({ length: offset }, (_, i) => <span key={`p${i}`} />)}
        {Array.from({ length: total }, (_, i) => {
          const day = `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(i + 1)}`;
          return <button type="button" key={day} className={day === value ? styles.calendarDaySelected : ""} onClick={() => onPick(day)}>{i + 1}</button>;
        })}
      </div>
    </div>
  );
}

function RadioGroup<T extends string>({ label, help, value, options, onChange }: {
  label: string; help: string; value: T;
  options: { value: T; label: string; note: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <fieldset className={styles.group}>
      <legend>{label}</legend>
      <p className={styles.groupHelp}>{help}</p>
      <div className={styles.groupGrid} style={{ gridTemplateColumns: `repeat(${options.length},1fr)` }}>
        {options.map((opt) => {
          const on = opt.value === value;
          return (
            <button type="button" key={opt.value} role="radio" aria-checked={on}
              className={`${styles.radioCard} ${on ? styles.radioCardOn : ""}`} onClick={() => onChange(opt.value)}>
              <span className={styles.radioDot} />
              <span>
                <strong>{opt.label}</strong>
                <small>{opt.note}</small>
              </span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

/* ------------------------------------------------------------- main */

export default function TripBuilder() {
  const [tripId, setTripId] = useState(() => `trip-${crypto.randomUUID()}`);
  const [createdAt, setCreatedAt] = useState(() => new Date().toISOString());
  const [hydrated, setHydrated] = useState(false);
  const [saveState, setSaveState] = useState<"saving" | "saved" | "offline">("saving");
  const [step, setStep] = useState(0);
  const [generated, setGenerated] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const today = useMemo(() => iso(new Date()), []);
  const oneWeekLater = useMemo(() => { const date = new Date(); date.setDate(date.getDate() + 6); return iso(date); }, []);
  const [origin, setOrigin] = useState("");
  const [originCoordinates, setOriginCoordinates] = useState<[number, number] | undefined>();
  const [originTouched, setOriginTouched] = useState(false);
  const [originError, setOriginError] = useState("");
  const [stops, setStops] = useState<Stop[]>([]);
  const [stopInput, setStopInput] = useState("");
  const [stopError, setStopError] = useState("");
  const [dragId, setDragId] = useState<string | null>(null);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(oneWeekLater);
  const [picker, setPicker] = useState<"start" | "end" | null>(null);

  const [filter, setFilter] = useState("All");
  const [picks, setPicks] = useState<Record<string, string[]>>({});
  const [discoveredPlaces, setDiscoveredPlaces] = useState<Record<string, Place[]>>({});
  const [discovering, setDiscovering] = useState<Record<string, boolean>>({});

  const [mustDo, setMustDo] = useState("");
  const [mustDoTouched, setMustDoTouched] = useState(false);
  const [pace, setPace] = useState<"slow" | "full">("slow");
  const [hotels, setHotels] = useState<"few" | "some">("few");
  const [budget, setBudget] = useState<"value" | "mid" | "high">("value");

  const pickerRef = useDismiss(Boolean(picker), () => setPicker(null));

  useEffect(() => {
    let active = true;
    const applySaved = (saved: ReturnType<typeof loadActiveTrip>) => {
      if (!saved || !active) return;
      setTripId(saved.id);
      setCreatedAt(saved.createdAt);
      setOrigin(saved.brief.origin);
      setOriginCoordinates(saved.brief.originCoordinates);
      setStops(saved.stops.map(({ id, name, country, longitude, latitude }) => ({ id, name, country, coordinates: longitude !== null && latitude !== null ? [longitude, latitude] : undefined })));
      setStartDate(saved.startDate);
      setEndDate(saved.endDate);
      setPicks(saved.brief.selectedPlaces);
      setMustDo(saved.brief.mustDo);
      setPace(saved.brief.pace);
      setHotels(saved.brief.hotelChanges);
      setBudget(saved.brief.budgetBand);
    };
    const hydrate = async () => {
      const tripIdFromUrl = new URLSearchParams(window.location.search).get("trip");
      if (tripIdFromUrl) {
        try {
          const cloudTrip = await loadTripFromEasyT(tripIdFromUrl);
          if (cloudTrip) {
            applySaved(cloudTrip);
            saveActiveTrip(cloudTrip);
          } else {
            const localTrip = loadActiveTrip();
            if (localTrip?.id === tripIdFromUrl) applySaved(localTrip);
          }
        } catch {
          const localTrip = loadActiveTrip();
          if (localTrip?.id === tripIdFromUrl) applySaved(localTrip);
        }
      }
      if (active) setHydrated(true);
    };
    void hydrate();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    stops.forEach((stop) => {
      if (!stop.coordinates || discoveredPlaces[stop.id] || discovering[stop.id]) return;
      setDiscovering((current) => ({ ...current, [stop.id]: true }));
      const [lon, lat] = stop.coordinates;
      fetch(`/api/journey-discover?destination=${encodeURIComponent(stop.name)}&country=${encodeURIComponent(stop.country)}&lat=${lat}&lon=${lon}`)
        .then((response) => response.json())
        .then((payload: { places?: Place[] }) => setDiscoveredPlaces((current) => ({ ...current, [stop.id]: payload.places ?? [] })))
        .catch(() => setDiscoveredPlaces((current) => ({ ...current, [stop.id]: [] })))
        .finally(() => setDiscovering((current) => ({ ...current, [stop.id]: false })));
    });
  }, [stops, discoveredPlaces, discovering]);

  const totalDays = useMemo(() => {
    const d = Math.round((+new Date(`${endDate}T00:00:00`) - +new Date(`${startDate}T00:00:00`)) / 86400000) + 1;
    return Number.isFinite(d) && d > 0 ? d : 1;
  }, [startDate, endDate]);

  const committed = useMemo(() => stops.length + stops.reduce((sum, stop) => {
    const titles = picks[stop.id] ?? [];
    return sum + placesFor(stop, discoveredPlaces).filter((p) => titles.includes(p.title)).reduce((a, p) => a + p.cost, 0);
  }, 0), [stops, picks, discoveredPlaces]);

  const openDays = Math.max(0, totalDays - committed);
  const over = committed > totalDays;
  const selected = stops.flatMap((stop) => (picks[stop.id] ?? []).map((title) => ({ stopId: stop.id, title })));
  const contextualSuggestions = useMemo(
    () => suggestionsFor(stops.at(-1)).filter((name) => !stops.some((stop) => stop.name.toLowerCase() === name.toLowerCase())).slice(0, 4),
    [stops],
  );
  const originMissing = originTouched && (!origin.trim() || Boolean(originError));
  const gate = step === 0 ? (!origin.trim() ? "Add where you're starting from" : !stops.length ? "Add at least one stop to continue" : "") : "";

  const addStop = async (name?: string) => {
    const value = (name ?? stopInput).trim();
    if (!value) return setStopError("Type a city, region or landmark first.");
    if (stops.some((s) => s.name.toLowerCase() === value.toLowerCase())) return setStopError(`${value} is already in your route.`);
    setStopError("Checking this place…");
    try {
      const response = await fetch(`/api/journey-geocode?place=${encodeURIComponent(value)}`);
      const payload = await response.json() as { result?: { name?: string; country?: string; coordinates?: [number, number] } | null };
      if (!payload.result?.coordinates || !payload.result.country) return setStopError(`We couldn't verify “${value}”. Try a city, region or landmark with its country.`);
      const resolvedName = payload.result.name?.split(",")[0]?.trim() || value;
      const id = `${resolvedName.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`;
      setStops((current) => [...current, { id, name: resolvedName, country: payload.result!.country!, coordinates: payload.result!.coordinates }]);
      setStopInput(""); setStopError("");
    } catch {
      setStopError("We couldn't check that place just now. Please try again.");
    }
  };

  const validateOrigin = async () => {
    if (!origin.trim()) { setOriginTouched(true); setOriginError("Add the city or airport you're leaving from."); return false; }
    try {
      const response = await fetch(`/api/journey-geocode?place=${encodeURIComponent(origin.trim())}`);
      const payload = await response.json() as { result?: { name?: string; coordinates?: [number, number] } | null };
      if (!payload.result?.coordinates) { setOriginTouched(true); setOriginError("We couldn't verify that starting point."); return false; }
      setOriginCoordinates(payload.result.coordinates);
      setOriginError("");
      return true;
    } catch {
      setOriginError("We couldn't check that starting point just now.");
      return false;
    }
  };
  const togglePick = (stopId: string, title: string) => {
    const current = picks[stopId] ?? [];
    setPicks({ ...picks, [stopId]: current.includes(title) ? current.filter((t) => t !== title) : [...current, title] });
  };

  /** Each selected place is consumed exactly once; leftovers cycle varied open days. */
  const draft = useMemo(() => {
    if (!stops.length) return [];
    const alloc = stops.map(() => Math.max(2, Math.floor(totalDays / stops.length)));
    let remaining = Math.max(0, totalDays - alloc.reduce((a, b) => a + b, 0));
    for (let p = 0; remaining > 0; p += 1, remaining -= 1) alloc[p % alloc.length] += 1;

    let cursor = 0;
    return stops.flatMap((stop, si) => {
      const titles = picks[stop.id] ?? [];
      const chosen = placesFor(stop, discoveredPlaces).filter((p) => titles.includes(p.title));
      const queue = pace === "slow" ? chosen.slice(0, Math.max(1, Math.ceil(chosen.length / 2))) : [...chosen];
      let openIndex = 0;
      return Array.from({ length: alloc[si] }, (_, i) => {
        const number = ++cursor;
        const arrival = i === 0;
        const anchor = si === 0 && i === Math.min(alloc[si] - 1, 2) && Boolean(mustDo.trim());
        if (anchor) {
          const at = queue.findIndex((p) => p.title === mustDo.trim());
          if (at >= 0) queue.splice(at, 1);
        }
        const place = !arrival && !anchor && queue.length ? queue.shift()! : null;
        const open = !arrival && !anchor && !place ? OPEN_DAYS[openIndex++ % OPEN_DAYS.length] : null;
        const date = new Date(`${startDate}T00:00:00`);
        date.setDate(date.getDate() + number - 1);
        return {
          number: pad(number),
          date: new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date),
          destination: stop.name,
          title: anchor ? mustDo.trim() : arrival ? "Arrive and settle in" : place ? place.title : `${open!.title} in ${stop.name}`,
          reason: anchor ? "Your one non-negotiable becomes the day's centre of gravity."
            : arrival ? "A softer start makes the whole trip feel less like transit."
            : place ? `Built around ${place.title} and kept inside ${place.area}, rather than adding another base.`
            : open!.reason,
          items: anchor ? ["Keep the morning protected", `Build the day around ${mustDo.trim()}`, "Leave the evening deliberately light"]
            : arrival ? ["Arrive, transfer and check in", `Short walk near your base in ${stop.name}`, "One easy local dinner"]
            : place ? [place.title, place.description, `Keep the day in ${place.area}`]
            : open!.items,
        };
      });
    });
  }, [stops, picks, totalDays, startDate, mustDo, pace, discoveredPlaces]);

  const activeTripDocument = useMemo(() => tripFromBuilder({
    id: tripId,
    origin,
    stops,
    startDate,
    endDate,
    picks,
    mustDo,
    pace,
    hotels,
    budget,
    draft,
    placeDetails: discoveredPlaces,
    originCoordinates,
    createdAt,
  }), [tripId, origin, stops, startDate, endDate, picks, mustDo, pace, hotels, budget, draft, discoveredPlaces, originCoordinates, createdAt]);

  useEffect(() => {
    if (!hydrated || !origin.trim() || !stops.length) return;
    setSaveState("saving");
    const timer = window.setTimeout(async () => {
      saveActiveTrip(activeTripDocument);
      try {
        const saved = await saveTripToEasyT(activeTripDocument);
        saveActiveTrip(saved);
        setSaveState("saved");
      } catch {
        setSaveState("offline");
      }
    }, 450);
    return () => window.clearTimeout(timer);
  }, [hydrated, activeTripDocument]);

  const index = Math.min(activeDay, Math.max(0, draft.length - 1));
  const active = draft[index];
  const activeImage = active ? dayImageFor(active, index) : null;

  /* ------------------------------------------------------------ draft view */

  if (generated && active) {
    return (
      <div className={styles.shellWide}>
        <div className={styles.draftHead}>
          <div>
            <p className={styles.eyebrow}>Draft · editable</p>
            <h2>{origin} to {stops.map((s) => s.name).join(" & ")}</h2>
          </div>
          <button type="button" className={styles.ghost} onClick={() => { setGenerated(false); setStep(3); }}>Edit brief</button>
        </div>

        <div className={styles.draftSummary}>
          <span><CalendarDays /> {totalDays} days</span>
          <span><Clock /> {pace === "slow" ? "Slower pace" : "Fuller pace"}</span>
          <span><MapPin /> {selected.length} selected places</span>
        </div>

        <div className={styles.draftBody}>
          <div className={styles.timeline}>
            <div className={styles.timelineHead}>
              <strong>Day by day</strong>
              <small>{draft.length} DAYS</small>
            </div>
            {draft.map((day, i) => (
              <button type="button" key={day.number}
                className={`${styles.timelineRow} ${i === index ? styles.timelineRowOn : ""}`}
                onClick={() => setActiveDay(i)}>
                <b>{day.number}</b>
                <span>
                  <em>{day.destination}</em>
                  <strong>{day.title}</strong>
                </span>
                <small>{day.date}</small>
              </button>
            ))}
          </div>

          <section className={styles.dayDetail}>
            <div className={styles.dayMeta}>
              <p><span>{active.date}</span> · DAY {active.number}</p>
              <span><MapPin /> {active.destination}</span>
            </div>
            <h3>{active.title}</h3>
            <p className={styles.dayReason}>{active.reason}</p>

            {activeImage ? (
              <figure className={styles.dayImage}>
                <img src={activeImage.src} alt={activeImage.alt} />
                <figcaption><span>{activeImage.caption}</span><a href={activeImage.sourceUrl} target="_blank" rel="noreferrer">Source ↗</a></figcaption>
              </figure>
            ) : (
              <div className={`${styles.dayImage} ${styles.dayImageFallback}`} role="img" aria-label={`Image for ${active.title}`}>
                <span>{active.destination}</span>
              </div>
            )}

            <ol className={styles.dayItems}>
              {active.items.map((text, i) => (
                <li key={i}><b>{pad(i + 1)}</b>{text}</li>
              ))}
            </ol>
            <div className={styles.dayNav}>
              <button type="button" disabled={index === 0} onClick={() => setActiveDay(index - 1)}>← Previous day</button>
              <button type="button" disabled={index >= draft.length - 1} onClick={() => setActiveDay(index + 1)}>Next day →</button>
            </div>
          </section>
        </div>

        <div className={styles.draftFoot}>
          <p><strong>{saveState === "saving" ? "Saving changes…" : saveState === "saved" ? "Saved to EasyT" : "Saved on this device"}</strong> · The research pass verifies transport, opening windows and where you actually sleep.</p>
          <button type="button" className={styles.primary} onClick={() => {
            saveActiveTrip(activeTripDocument);
            window.location.assign(`/journey/plan?trip=${encodeURIComponent(activeTripDocument.id)}`);
          }}>Open map view →</button>
        </div>
      </div>
    );
  }

  /* ---------------------------------------------------------- brief wizard */

  return (
    <div className={styles.shellWide}>
      <nav className={styles.steps} aria-label="Trip brief progress">
        {STEPS.map((s, i) => (
          <button type="button" key={s.label} onClick={() => setStep(i)}
            className={`${styles.stepTab} ${i === step ? styles.stepTabOn : ""} ${i < step ? styles.stepTabDone : ""}`}>
            <b>{i < step ? "✓" : pad(i + 1)}</b>
            <span><span>{s.label}</span><small>{s.note}</small></span>
          </button>
        ))}
      </nav>

      <div className={styles.wizardBody}>
        <div className={styles.pane}>
          {step === 0 && (
            <div className={styles.stack}>
              <div className={`${styles.card} ${originMissing ? styles.cardError : ""}`}>
                <span className={styles.cardLabel}><Plane /> Starting from</span>
                <input value={origin} placeholder="City or airport" aria-label="Starting from"
                  onChange={(e) => { setOrigin(e.target.value); setOriginTouched(true); setOriginCoordinates(undefined); setOriginError(""); }}
                  onBlur={() => { if (origin.trim() && !originCoordinates) void validateOrigin(); }} />
                <small className={originMissing ? styles.hintError : styles.hint}>
                  {originError || (originMissing ? "Add the city or airport you're leaving from." : "")}
                </small>
              </div>

              <div className={`${styles.card} ${stopError ? styles.cardError : ""}`}>
                <span className={styles.cardLabel}><MapPin /> Add a destination</span>
                <input value={stopInput} placeholder="City, region or landmark" aria-label="Add a destination"
                  onChange={(e) => { setStopInput(e.target.value); setStopError(""); }}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStop(); } }} />
                <small className={stopError ? styles.hintError : styles.hint}>
                  {stopError}
                </small>
                {!stopInput.trim() && contextualSuggestions.length > 0 && (
                  <div className={styles.suggestions}>
                    {contextualSuggestions.map((name) => (
                      <button type="button" key={name} onClick={() => addStop(name)}><Plus /> {name}</button>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.stopList}>
                {stops.map((stop, i) => (
                  <div key={stop.id} draggable
                    className={`${styles.stopRow} ${dragId === stop.id ? styles.stopRowDragging : ""}`}
                    onDragStart={(e) => { setDragId(stop.id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setData("text/plain", stop.id); }}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const from = stops.findIndex((x) => x.id === (dragId ?? e.dataTransfer.getData("text/plain")));
                      if (from < 0 || from === i) return setDragId(null);
                      const next = [...stops];
                      const [moving] = next.splice(from, 1);
                      next.splice(i, 0, moving);
                      setStops(next); setDragId(null);
                    }}
                    onDragEnd={() => setDragId(null)}>
                    <b>{pad(i + 1)}</b>
                    <GripVertical className={styles.grip} aria-hidden />
                    <div>
                      <strong>{stop.name}</strong>
                      <small>{(picks[stop.id] ?? []).length} places selected</small>
                    </div>
                    <button
                      type="button"
                      className={styles.removeStop}
                      onClick={() => setStops(stops.filter((x) => x.id !== stop.id))}
                      aria-label={`Remove ${stop.name}`}
                    >
                      <X />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.stack} ref={pickerRef}>
              <div className={styles.dateRow}>
                {([
                  { key: "start" as const, label: "Start date", value: startDate, set: (v: string) => { setStartDate(v); if (v > endDate) setEndDate(v); } },
                  { key: "end" as const, label: "End date", value: endDate, set: (v: string) => setEndDate(v < startDate ? startDate : v) },
                ]).map((field) => (
                  <div key={field.key} className={`${styles.card} ${picker === field.key ? styles.cardOpen : ""}`}>
                    <button type="button" className={styles.cardTrigger} aria-expanded={picker === field.key}
                      onClick={() => setPicker(picker === field.key ? null : field.key)}>
                      <span className={styles.cardLabel}><CalendarDays /> {field.label}</span>
                      <span className={styles.cardValue}>
                        <strong>{fmtLong(field.value) || "Pick a date"}</strong>
                        <ChevronDown />
                      </span>
                    </button>
                    {picker === field.key && (
                      <div className={styles.popover}>
                        <Calendar value={field.value} onPick={(v) => { field.set(v); setPicker(null); }} />
                        <label className={styles.typeIt}>Or type it
                          <input defaultValue={fmtLong(field.value)}
                            onChange={(e) => { const v = parseTyped(e.target.value); if (v) field.set(v); }} />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <p className={styles.lengthNote}>
                <strong>{totalDays} {totalDays === 1 ? "day" : "days"}</strong>
                <span>{stops.length ? `Roughly ${Math.max(2, Math.floor(totalDays / stops.length))} days per stop across ${stops.length} ${stops.length === 1 ? "base" : "bases"}.` : "Add stops and this splits across them."}</span>
              </p>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className={styles.filters}>
                {FILTERS.map((label) => (
                  <button type="button" key={label} onClick={() => setFilter(label)}
                    className={`${styles.filter} ${filter === label ? styles.filterOn : ""}`}>{label}</button>
                ))}
              </div>
              <div className={styles.panels}>
                {stops.map((stop, si) => {
                  const titles = picks[stop.id] ?? [];
                  const list = placesFor(stop, discoveredPlaces).filter((p) => filter === "All" || p.tags.includes(filter));
                  return (
                    <section key={stop.id}>
                      <div className={styles.panelHead}>
                        <div>
                          <small>{pad(si + 1)} · {(stop.country || "verified stop").toUpperCase()}</small>
                          <h3>{stop.name}</h3>
                        </div>
                        <small className={titles.length ? styles.countOn : ""}>{titles.length} selected</small>
                      </div>
                      <div className={styles.placeList}>
                        {discovering[stop.id] && <p className={styles.railEmptyText}>Finding real places, landmarks and activities around {stop.name}…</p>}
                        {!discovering[stop.id] && !list.length && <p className={styles.railEmptyText}>No reliable suggestions loaded yet. Check the location or try again shortly.</p>}
                        {list.map((place) => {
                          const on = titles.includes(place.title);
                          const image = placeImageFor(place, stop);
                          return (
                            <button type="button" key={place.title} aria-pressed={on}
                              className={`${styles.placeCard} ${on ? styles.placeCardOn : ""}`}
                              onClick={() => togglePick(stop.id, place.title)}>
                              {image ? <span className={styles.placeThumb}><img src={image.src} alt="" /></span> : <span className={styles.placeThumbFallback}>{place.title.slice(0, 1)}</span>}
                              <span className={styles.placeBox}>{on ? "✓" : "+"}</span>
                              <span className={styles.placeText}>
                                <small>{place.area} · {place.type}</small>
                                <strong>{place.title}</strong>
                                <span>{place.description}</span>
                              </span>
                              <span className={styles.placeCost}>{on ? "−" : "+"}{half(place.cost)} day</span>
                            </button>
                          );
                        })}
                      </div>
                    </section>
                  );
                })}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stack}>
              <div className={`${styles.card} ${mustDoTouched && !mustDo.trim() ? styles.cardError : ""}`}>
                <span className={styles.cardLabel}><Mountain /> One thing this trip must include</span>
                <input value={mustDo} placeholder="A place, event or experience" aria-label="Must-do place"
                  onChange={(e) => { setMustDo(e.target.value); setMustDoTouched(true); }} />
                <small className={mustDoTouched && !mustDo.trim() ? styles.hintError : styles.hint}>
                  {mustDoTouched && !mustDo.trim() ? "Name one thing and the draft protects a day for it." : "Everything else can move around it."}
                </small>
              </div>
              <RadioGroup label="Pace" help="This changes how many selected places land on each day."
                value={pace} onChange={setPace}
                options={[
                  { value: "slow", label: "Slower", note: "Fewer places per day, more open time." },
                  { value: "full", label: "Fuller", note: "Every selected place gets placed." },
                ]} />
              <RadioGroup label="Hotel changes" help="Fewer bases means more day trips instead of moves."
                value={hotels} onChange={setHotels}
                options={[
                  { value: "few", label: "As few as possible", note: "One base per city." },
                  { value: "some", label: "Happy to move", note: "Change base to shorten travel." },
                ]} />
              <RadioGroup label="Budget band" help="Used to pick where to sleep and eat during research."
                value={budget} onChange={setBudget}
                options={[
                  { value: "value", label: "Good value", note: "Comfortable, not precious." },
                  { value: "mid", label: "Mid-range", note: "Some splurges." },
                  { value: "high", label: "No ceiling", note: "Best available." },
                ]} />
            </div>
          )}
        </div>

        <aside className={styles.rail} aria-label="Trip so far">
          <div className={styles.railBlock}>
            <small className={styles.railLabel}>ROUTE SO FAR</small>
            <div className={styles.railRoute}>
              {[{ name: origin.trim() || "Add your origin", note: "Departure", origin: true },
                ...stops.map((stop) => ({
                  name: stop.name,
                  note: `${(picks[stop.id] ?? []).length} selected · ${Math.max(2, Math.floor(totalDays / Math.max(1, stops.length)))} days`,
                  origin: false,
                }))].map((node, i, list) => (
                <div key={`${node.name}-${i}`} className={styles.railNode}>
                  <span className={styles.railMarker}>
                    <span className={node.origin ? styles.railDotOrigin : styles.railDot} />
                    {i < list.length - 1 && <span className={styles.railLine} />}
                  </span>
                  <span>
                    <strong className={node.origin ? styles.railNameMuted : ""}>{node.name}</strong>
                    <small>{node.note}</small>
                  </span>
                </div>
              ))}
              {!stops.length && <p className={styles.railEmpty}>Add a stop and the route builds here as you go.</p>}
            </div>
          </div>

          <div className={styles.railBlock}>
            <div className={styles.railBudgetHead}>
              <small className={styles.railLabel}>DAYS BUDGET</small>
              <small className={over ? styles.railOver : ""}>
                {over ? `OVER BY ${half(committed - totalDays)}` : openDays === 0 ? "FULL" : "ROOM LEFT"}
              </small>
            </div>
            <div className={styles.budgetTrack}>
              <span className={over ? styles.budgetFillOver : styles.budgetFill}
                style={{ width: `${Math.min(100, (committed / Math.max(1, totalDays)) * 100)}%` }} />
            </div>
            <p className={styles.budgetLine}>{totalDays} days available · {half(committed)} committed · {half(openDays)} open</p>
            {over && <p className={styles.railOver}>More is selected than the dates allow. Remove a place, drop a stop, or add days.</p>}
          </div>

          <div className={styles.railBlock}>
            <small className={styles.railLabel}>SELECTED PLACES</small>
            {selected.length ? (
              <div className={styles.chips}>
                {selected.map((entry) => (
                  <span key={`${entry.stopId}-${entry.title}`} className={styles.chip}>
                    {entry.title}
                    <button type="button" onClick={() => togglePick(entry.stopId, entry.title)} aria-label="Remove place"><X /></button>
                  </span>
                ))}
              </div>
            ) : <p className={styles.railEmptyText}>Nothing selected yet. Step 03 is where the trip gets specific.</p>}
          </div>
        </aside>
      </div>

      <div className={styles.wizardFoot}>
        <button type="button" className={styles.ghost} disabled={step === 0} onClick={() => setStep(Math.max(0, step - 1))}>Back</button>
        <div className={styles.footRight}>
          <small className={styles.saveState}>{saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved to EasyT" : "Saved on this device"}</small>
          {gate && <small className={styles.gate}>{gate}</small>}
          <button type="button" className={styles.primary} disabled={Boolean(gate)}
            onClick={async () => {
              if (gate) return;
              if (step === 0 && !(await validateOrigin())) return;
              if (step === 3) { setGenerated(true); setActiveDay(0); } else setStep(step + 1);
            }}>
            {step === 3 ? "Build the draft" : "Continue"} →
          </button>
        </div>
      </div>
    </div>
  );
}
