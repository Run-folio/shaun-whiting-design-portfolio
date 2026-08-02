"use client";

import { ArrowUpRight, LocateFixed, MapPin } from "lucide-react";
import { useState } from "react";
import styles from "./home.module.css";

type Place = { id: string; name: string; address: string; coordinates: [number, number]; mapsUrl: string };

export default function HomeRestaurantFinder() {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty">("idle");
  const [places, setPlaces] = useState<Place[]>([]);
  const findNearby = () => {
    if (!navigator.geolocation) { setState("empty"); return; }
    setState("loading");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`/api/journey-local-search?kind=restaurant&city=your%20location&country=&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await response.json() as { places?: Place[] };
        setPlaces((data.places ?? []).slice(0, 3)); setState(data.places?.length ? "ready" : "empty");
      } catch { setState("empty"); }
    }, () => setState("empty"), { enableHighAccuracy: false, timeout: 8000 });
  };
  if (state === "ready") return <div className={styles.homeResults}><p><span>NEAR YOU</span><b>OpenStreetMap results</b></p>{places.map((place) => <a href={place.mapsUrl} target="_blank" rel="noreferrer" key={place.id}><span><strong>{place.name}</strong><small><MapPin aria-hidden="true" /> {place.address}</small></span><ArrowUpRight aria-hidden="true" /></a>)}<button type="button" onClick={() => { setState("idle"); setPlaces([]); }}>Search again</button></div>;
  return <div className={styles.finderAction}><button type="button" onClick={findNearby} disabled={state === "loading"}><LocateFixed aria-hidden="true" /> {state === "loading" ? "Finding places near you…" : "Use my location"}</button>{state === "empty" ? <small>We couldn’t find nearby venues. Try again or start with a trip.</small> : <small>We’ll use your location only to find nearby places.</small>}</div>;
}
