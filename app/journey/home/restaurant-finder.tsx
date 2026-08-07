"use client";

import { ArrowUpRight, LocateFixed, MapPin } from "lucide-react";
import { useState } from "react";
import styles from "./home.module.css";

type Place = { id: string; name: string; address: string; coordinates: [number, number]; mapsUrl: string };

export default function HomeRestaurantFinder() {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty">("idle");
  const [places, setPlaces] = useState<Place[]>([]);
  const [moment, setMoment] = useState("Right now");
  const [kind, setKind] = useState<"restaurant" | "stay">("restaurant");
  const findNearby = () => {
    if (!navigator.geolocation) { setState("empty"); return; }
    setState("loading");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`/api/journey-local-search?kind=${kind}&city=your%20location&country=&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await response.json() as { places?: Place[] };
        setPlaces((data.places ?? []).slice(0, 3)); setState(data.places?.length ? "ready" : "empty");
      } catch { setState("empty"); }
    }, () => setState("empty"), { enableHighAccuracy: false, timeout: 8000 });
  };
  const prompt = kind === "stay" ? "A nearby place to land tonight, without sending you across town." : moment === "One free hour" ? "A quick, nearby stop with no long detour." : moment === "Rainy afternoon" ? "Somewhere easy to reach and linger indoors." : moment === "After a long day" ? "Keep it close, uncomplicated and worth it." : "Find a good place close to where you are.";
  if (state === "ready") return <div className={styles.homeResults}><p><span>NEAR YOU · {kind === "stay" ? "A PLACE TO STAY" : moment}</span><b>OpenStreetMap results</b></p><small className={styles.momentCopy}>{prompt}</small>{places.map((place) => <a href={place.mapsUrl} target="_blank" rel="noreferrer" key={place.id}><span><strong>{place.name}</strong><small><MapPin aria-hidden="true" /> {place.address}</small></span><ArrowUpRight aria-hidden="true" /></a>)}<button type="button" onClick={() => { setState("idle"); setPlaces([]); }}>Search again</button></div>;
  return <div className={styles.finderAction}><span className={styles.momentLabel}>WHAT DO YOU NEED?</span><div className={styles.momentChoices}><button type="button" className={kind === "restaurant" ? styles.momentActive : ""} onClick={() => { setKind("restaurant"); setState("idle"); }}>Eat nearby</button><button type="button" className={kind === "stay" ? styles.momentActive : ""} onClick={() => { setKind("stay"); setState("idle"); }}>Find a stay</button></div>{kind === "restaurant" && <><span className={styles.momentLabel}>WHAT DOES THE MOMENT NEED?</span><div className={styles.momentChoices}>{["Right now", "One free hour", "Rainy afternoon", "After a long day"].map((option) => <button type="button" className={moment === option ? styles.momentActive : ""} key={option} onClick={() => setMoment(option)}>{option}</button>)}</div></>}<small className={styles.momentCopy}>{prompt}</small><button type="button" onClick={findNearby} disabled={state === "loading"}><LocateFixed aria-hidden="true" /> {state === "loading" ? "Finding places near you…" : "Use my location"}</button>{state === "empty" ? <small>We couldn’t find nearby venues. Try again or start with a trip.</small> : <small>We’ll use your location only to find nearby places.</small>}</div>;
}
