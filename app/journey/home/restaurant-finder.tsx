"use client";

import { ArrowUpRight, LocateFixed, MapPin } from "lucide-react";
import { useState } from "react";
import styles from "./home.module.css";

type Place = { id: string; name: string; address: string; coordinates: [number, number]; mapsUrl: string };

export default function HomeRestaurantFinder() {
  const [state, setState] = useState<"idle" | "loading" | "ready" | "empty" | "location">("idle");
  const [places, setPlaces] = useState<Place[]>([]);
  const [moment, setMoment] = useState("Right now");
  const [kind, setKind] = useState<"restaurant" | "stay">("restaurant");
  const findNearby = () => {
    if (!navigator.geolocation) { setState("location"); return; }
    setState("loading");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const response = await fetch(`/api/journey-local-search?kind=${kind}&city=your%20location&country=&lat=${coords.latitude}&lon=${coords.longitude}`);
        const data = await response.json() as { places?: Place[] };
        setPlaces((data.places ?? []).slice(0, 3)); setState(data.places?.length ? "ready" : "empty");
      } catch { setState("empty"); }
    }, () => setState("location"), { enableHighAccuracy: false, timeout: 8000 });
  };
  const prompt = kind === "stay" ? "A nearby place to land tonight, without sending you across town." : moment === "One free hour" ? "A quick stop with no long detour." : moment === "Rainy afternoon" ? "Somewhere easy to reach and linger indoors." : moment === "After a long day" ? "Keep it close, uncomplicated and worth it." : "A good place close to where you are.";
  if (state === "ready") return <div className={styles.homeResults}><p><span>NEAR YOU · {kind === "stay" ? "A PLACE TO STAY" : moment}</span><b>OpenStreetMap results</b></p><small className={styles.momentCopy}>{prompt}</small>{places.map((place) => <a href={place.mapsUrl} target="_blank" rel="noreferrer" key={place.id}><span><strong>{place.name}</strong><small><MapPin aria-hidden="true" /> {place.address}</small></span><ArrowUpRight aria-hidden="true" /></a>)}<button type="button" onClick={() => { setState("idle"); setPlaces([]); }}>Search again</button></div>;
  if (state === "location") return <div className={styles.finderNotice}><strong>Location is off.</strong><span>Allow location access in your browser, then we can search the places around you.</span><button type="button" onClick={findNearby}><LocateFixed aria-hidden="true" /> Try again</button></div>;
  return <div className={styles.finderAction}><div><span className={styles.momentLabel}>I’M LOOKING FOR</span><div className={styles.momentChoices}><button type="button" className={kind === "restaurant" ? styles.momentActive : ""} onClick={() => { setKind("restaurant"); setState("idle"); }}>Food</button><button type="button" className={kind === "stay" ? styles.momentActive : ""} onClick={() => { setKind("stay"); setState("idle"); }}>A place to stay</button></div></div>{kind === "restaurant" && <div><span className={styles.momentLabel}>RIGHT NOW, I WANT</span><div className={styles.momentChoices}>{["A quick bite", "One free hour", "A rainy plan", "An easy evening"].map((option, index) => <button type="button" className={moment === ["Right now", "One free hour", "Rainy afternoon", "After a long day"][index] ? styles.momentActive : ""} key={option} onClick={() => setMoment(["Right now", "One free hour", "Rainy afternoon", "After a long day"][index])}>{option}</button>)}</div></div>}<small className={styles.momentCopy}>{prompt}</small><button type="button" onClick={findNearby} disabled={state === "loading"}><LocateFixed aria-hidden="true" /> {state === "loading" ? "Finding places near you…" : kind === "stay" ? "Find stays near me" : "Find food near me"}</button>{state === "empty" ? <small className={styles.finderStatus}>Nothing named came back nearby. Try another search.</small> : <small className={styles.finderStatus}>Your location is used only for this search.</small>}</div>;
}
