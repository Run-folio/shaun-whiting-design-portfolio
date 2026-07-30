"use client";

import { ArrowUpRight, BedDouble, MapPin, RotateCcw, Utensils } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { JourneyRestaurant, RestaurantMeal } from "@/lib/journey";
import styles from "@/app/journey/journey.module.css";

type LocalPlace = { id: string; name: string; address: string; category: string; coordinates: [number, number]; mapsUrl: string; bookingUrl?: string };
type MealPace = "quick" | "relaxed" | "occasion";
type MealMood = "local" | "comfort" | "surprise";
type StayStyle = "simple" | "character" | "comfort";

export function JourneyLocalFinder({ kind, city, country, dayId, coordinates, onRestaurantSelect }: { kind: "restaurant" | "stay"; city: string; country: string; dayId: string; coordinates: [number, number]; onRestaurantSelect?: (restaurant?: JourneyRestaurant, meal?: RestaurantMeal) => void }) {
  const [meal, setMeal] = useState<RestaurantMeal | undefined>();
  const [pace, setPace] = useState<MealPace | undefined>();
  const [mood, setMood] = useState<MealMood | undefined>();
  const [stayStyle, setStayStyle] = useState<StayStyle | undefined>();
  const [places, setPlaces] = useState<LocalPlace[]>([]);
  const [chosen, setChosen] = useState<LocalPlace | null>(null);
  const [saved, setSaved] = useState<LocalPlace | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchUnavailable, setSearchUnavailable] = useState(false);
  const storageKey = `journey:local-${kind}:v2`;
  const label = kind === "restaurant" ? "Taste finder" : "Stay finder";
  const Icon = kind === "restaurant" ? Utensils : BedDouble;
  const isReady = kind === "restaurant" ? Boolean(meal && pace && mood) : Boolean(stayStyle);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSearchUnavailable(false);
    setChosen(null);
    setSaved(null);
    setMeal(undefined);
    setPace(undefined);
    setMood(undefined);
    setStayStyle(undefined);
    fetch(`/api/journey-local-search?kind=${kind}&city=${encodeURIComponent(city)}&country=${encodeURIComponent(country)}&lat=${coordinates[1]}&lon=${coordinates[0]}`)
      .then((response) => response.ok ? response.json() : { places: [] })
      .then((data: { places?: LocalPlace[]; unavailable?: boolean }) => { if (active) { setPlaces(data.places ?? []); setSearchUnavailable(Boolean(data.unavailable)); } })
      .catch(() => { if (active) { setPlaces([]); setSearchUnavailable(true); } })
      .finally(() => { if (active) setLoading(false); });
    try {
      const store = JSON.parse(window.localStorage.getItem(storageKey) ?? "{}") as Record<string, LocalPlace>;
      if (store[dayId]) { setSaved(store[dayId]); setChosen(store[dayId]); }
    } catch { /* The finder remains usable without local persistence. */ }
    return () => { active = false; };
  }, [city, coordinates, country, dayId, kind, storageKey]);

  useEffect(() => {
    if (kind !== "restaurant" || !saved || !onRestaurantSelect) return onRestaurantSelect?.();
    onRestaurantSelect({ name: saved.name, area: city, summary: saved.address, order: "Confirm current opening hours", pace: [pace ?? "quick"], craving: ["signature"], spend: ["mid"], meal: [meal ?? "dinner"], dish: ["local"], coordinates: saved.coordinates, fit: `Saved for this specific ${city} day.`, mapsUrl: saved.mapsUrl }, meal ?? "dinner");
  }, [city, kind, meal, onRestaurantSelect, pace, saved]);

  const candidates = useMemo(() => {
    if (!isReady) return [];
    const query = mood === "local" ? /local|regional|traditional|seafood|sushi|ramen|curry|noodle/i : mood === "comfort" ? /cafe|fast|burger|pizza|ramen|noodle|bakery/i : /restaurant|cafe|hotel|guest/i;
    const matched = places.filter((place) => query.test(`${place.name} ${place.category}`));
    return (matched.length ? matched : places).slice(0, 4);
  }, [isReady, mood, places]);

  const save = () => {
    if (!chosen) return;
    setSaved(chosen);
    try { window.localStorage.setItem(storageKey, JSON.stringify({ ...JSON.parse(window.localStorage.getItem(storageKey) ?? "{}"), [dayId]: chosen })); } catch { /* no-op */ }
  };
  const reset = () => { setSaved(null); setChosen(null); setMeal(undefined); setPace(undefined); setMood(undefined); setStayStyle(undefined); };

  return <section className={styles.restaurantFinder} aria-label={`${label} for ${city}`}>
    <header><span><Icon /></span><div><small>{label}</small><strong>{city}</strong></div></header>
    <p className={styles.restaurantContext}><b>{kind === "restaurant" ? "Choose the meal" : "Choose the base"}</b><span>Results are named OpenStreetMap venues around today’s mapped location—not invented shortlists.</span></p>
    {loading ? <p className={styles.restaurantLocalNote}>Checking actual local venues…</p> : null}
    {!loading && !places.length ? <p className={styles.restaurantLocalNote}>{searchUnavailable ? "Live venue search is temporarily unavailable. Open Maps to search around today’s location instead." : "No mapped venues came back for this area. Open Maps to search around the day’s location instead."}</p> : null}
    {!loading && kind === "restaurant" && !meal ? <div className={styles.restaurantQuestion}><p>First, choose the moment <b>1 / 4</b></p><h3>When do you want to eat?</h3><div>{(["lunch", "dinner"] as const).map((option) => <button key={option} type="button" onClick={() => setMeal(option)}>{option}</button>)}</div></div> : null}
    {!loading && kind === "restaurant" && meal && !pace ? <div className={styles.restaurantQuestion}><p>Then, the pace <b>2 / 4</b></p><h3>How should the meal feel?</h3><div>{([{ value: "quick", label: "Quick & easy" }, { value: "relaxed", label: "Take our time" }, { value: "occasion", label: "A trip highlight" }] as const).map((option) => <button key={option.value} type="button" onClick={() => setPace(option.value)}>{option.label}</button>)}</div></div> : null}
    {!loading && kind === "restaurant" && meal && pace && !mood ? <div className={styles.restaurantQuestion}><p>Finally, the direction <b>3 / 4</b></p><h3>What sounds right?</h3><div>{([{ value: "local", label: "Local favourite" }, { value: "comfort", label: "Easy comfort" }, { value: "surprise", label: "Surprise me" }] as const).map((option) => <button key={option.value} type="button" onClick={() => setMood(option.value)}>{option.label}</button>)}</div></div> : null}
    {!loading && kind === "stay" && !stayStyle ? <div className={styles.restaurantQuestion}><p>Choose a base <b>1 / 2</b></p><h3>What kind of stay suits today?</h3><div>{([{ value: "simple", label: "Simple & central" }, { value: "character", label: "Local character" }, { value: "comfort", label: "Comfort first" }] as const).map((option) => <button key={option.value} type="button" onClick={() => setStayStyle(option.value)}>{option.label}</button>)}</div></div> : null}
    {isReady && !chosen && candidates.length ? <div className={styles.localCandidates}><p><span>{kind === "restaurant" ? "4 / 4 · REAL MAP RESULTS" : "2 / 2 · REAL MAP RESULTS"}</span><b>Choose a place</b></p>{candidates.map((place) => <button key={place.id} type="button" onClick={() => setChosen(place)}><span><strong>{place.name}</strong><small>{place.address}</small></span><em>{place.category.replace(/_/g, " ")}</em></button>)}</div> : null}
    {chosen ? <article className={styles.restaurantResult}><p><span>{saved ? `Saved ${kind === "stay" ? "stay" : meal}` : `Chosen ${kind === "stay" ? "stay" : meal}`}</span><b>{saved ? "In today’s plan ↑" : "Check before saving"}</b></p><h3>{chosen.name}</h3><span><MapPin /> {chosen.address}</span><p className={styles.restaurantFit}>{kind === "stay" ? "A real mapped property near this day’s location—compare room type, rate and cancellation terms before booking." : "A real mapped venue near the day’s location—open the map to confirm hours and reviews."}</p><div className={styles.restaurantActions}><a href={chosen.mapsUrl} target="_blank" rel="noreferrer">Open in Maps <ArrowUpRight /></a>{kind === "stay" && chosen.bookingUrl ? <a href={chosen.bookingUrl} target="_blank" rel="noreferrer">Search Booking <ArrowUpRight /></a> : null}<button type="button" className={styles.restaurantSave} onClick={save} disabled={Boolean(saved)}>{saved ? "Saved to itinerary" : `Add ${kind === "stay" ? "stay" : "to today"}`}</button><button type="button" aria-label="Change selection" onClick={reset}><RotateCcw /></button></div></article> : null}
  </section>;
}
