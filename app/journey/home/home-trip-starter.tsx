"use client";

import { ArrowRight, CalendarDays, MapPin, Plane } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { languageFromStorage, type EasyTLanguage } from "@/lib/easyt/i18n";
import styles from "./home.module.css";

type GeocodeResult = { name?: string; country?: string; coordinates?: [number, number] };

const copy = {
  en: {
    eyebrow: "Start a real trip", title: "Where are you going next?", intro: "Begin with the basics. You can shape every stop, day and detail in the builder.", from: "Leaving from", fromPlaceholder: "City or airport", to: "Going to", toPlaceholder: "City, region or landmark", dates: "Dates", continue: "Start building", checking: "Checking your route…", error: "We could not find both places. Try a city, region or airport.", samePlace: "Choose a different starting point and destination.", dateError: "Choose an end date after your start date.", note: "No account needed to start.",
  },
  es: {
    eyebrow: "Empieza un viaje real", title: "¿A dónde vas después?", intro: "Empieza con lo básico. Podrás dar forma a cada parada, día y detalle en el creador.", from: "Sales de", fromPlaceholder: "Ciudad o aeropuerto", to: "Vas a", toPlaceholder: "Ciudad, región o lugar", dates: "Fechas", continue: "Empezar a crear", checking: "Comprobando tu ruta…", error: "No pudimos encontrar ambos lugares. Prueba una ciudad, región o aeropuerto.", samePlace: "Elige un punto de partida y destino diferentes.", dateError: "Elige una fecha de fin posterior a la fecha de inicio.", note: "No necesitas una cuenta para empezar.",
  },
} as const;

function iso(date: Date) { return date.toISOString().slice(0, 10); }

export default function HomeTripStarter() {
  const router = useRouter();
  const [language, setLanguage] = useState<EasyTLanguage>("en");
  const [origin, setOrigin] = useState("");
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState(() => iso(new Date()));
  const [endDate, setEndDate] = useState(() => iso(new Date(Date.now() + 6 * 86_400_000)));
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const text = copy[language];
  const dateMin = useMemo(() => startDate, [startDate]);

  useEffect(() => {
    setLanguage(languageFromStorage());
    const updateLanguage = (event: Event) => setLanguage((event as CustomEvent<EasyTLanguage>).detail);
    window.addEventListener("easyt-language-change", updateLanguage);
    return () => window.removeEventListener("easyt-language-change", updateLanguage);
  }, []);

  const resolve = async (place: string) => {
    const response = await fetch(`/api/journey-geocode?place=${encodeURIComponent(place.trim())}`);
    const payload = await response.json() as { result?: GeocodeResult | null };
    return payload.result;
  };

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");
    if (endDate <= startDate) { setError(text.dateError); return; }
    if (origin.trim().toLowerCase() === destination.trim().toLowerCase()) { setError(text.samePlace); return; }
    setLoading(true);
    try {
      const [resolvedOrigin, resolvedDestination] = await Promise.all([resolve(origin), resolve(destination)]);
      if (!resolvedOrigin?.coordinates || !resolvedDestination?.coordinates || !resolvedDestination.country) {
        setError(text.error);
        return;
      }
      window.localStorage.setItem("easyt-home-trip-draft", JSON.stringify({
        origin: resolvedOrigin.name?.split(",")[0]?.trim() || origin.trim(),
        originCoordinates: resolvedOrigin.coordinates,
        destination: {
          id: `${(resolvedDestination.name || destination).toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}`,
          name: resolvedDestination.name?.split(",")[0]?.trim() || destination.trim(),
          country: resolvedDestination.country,
          coordinates: resolvedDestination.coordinates,
        },
        startDate,
        endDate,
      }));
      router.push("/journey/new?homeDraft=1");
    } catch {
      setError(text.error);
    } finally {
      setLoading(false);
    }
  };

  return <form className={styles.startBuilder} onSubmit={(event) => void submit(event)}>
    <div className={styles.startBuilderIntro}><p>{text.eyebrow}</p><h2>{text.title}</h2><span>{text.intro}</span></div>
    <label><span><Plane aria-hidden="true" /> {text.from}</span><input required value={origin} onChange={(event) => setOrigin(event.target.value)} placeholder={text.fromPlaceholder} /></label>
    <label><span><MapPin aria-hidden="true" /> {text.to}</span><input required value={destination} onChange={(event) => setDestination(event.target.value)} placeholder={text.toPlaceholder} /></label>
    <label className={styles.dateField}><span><CalendarDays aria-hidden="true" /> {text.dates}</span><div><input required type="date" value={startDate} onChange={(event) => { setStartDate(event.target.value); if (event.target.value >= endDate) setEndDate(event.target.value); }} /><input required type="date" min={dateMin} value={endDate} onChange={(event) => setEndDate(event.target.value)} /></div></label>
    <div className={styles.startBuilderAction}><button type="submit" disabled={loading}>{loading ? text.checking : <>{text.continue} <ArrowRight aria-hidden="true" /></>}</button><small className={error ? styles.startBuilderError : undefined}>{error || text.note}</small></div>
  </form>;
}
