"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { defaultTravelProfile, isTravelProfile, type TravelProfile } from "@/lib/easyt/travel-profile";
import styles from "./home-explorer.module.css";
import profileStyles from "./home-profile-signal.module.css";
import onboardingStyles from "./profile-onboarding.module.css";
import detailStyles from "./explorer-detail.module.css";

const routes = [
  { mood: "Food", place: "Japan", title: "Japan, one good day at a time", detail: "Tokyo energy, mountain towns and enough room for a meal to change the plan.", image: "/journey/omicho-market.jpg", href: "/journey/new?inspire=japan-slow", tag: "Asia · 10 days", bases: "Tokyo · Takayama · Kyoto", best: "October to November", tradeoff: "Book rail legs around weekends" },
  { mood: "Coast", place: "Portugal", title: "The Atlantic reset", detail: "Lisbon energy, quiet coast and nothing booked too tightly.", href: "/journey/new?inspire=portugal-coast", tag: "Europe · 7 days", bases: "Lisbon · Comporta · Lagos", best: "May to June or September", tradeoff: "A car makes the coast easier" },
  { mood: "Andes", place: "Peru", title: "Andean highlands, gently", detail: "Acclimatise, take the Sacred Valley slowly, then choose your big day.", href: "/journey/new?inspire=andean-highlands", tag: "South America · 9 days", bases: "Cusco · Sacred Valley · Arequipa", best: "May to September", tradeoff: "Altitude changes the pace" },
  { mood: "Rail", place: "Spain", title: "Mediterranean by rail", detail: "Three cities, no internal flights and full days that still have a siesta built in.", href: "/journey/new?inspire=mediterranean-rail", tag: "Europe · 8 days", bases: "Barcelona · Valencia · Granada", best: "April to June or September", tradeoff: "One longer rail day" },
  { mood: "Slow", place: "Vietnam", title: "Stay a little longer", detail: "Street food, rice valleys and a route that leaves room to change your mind.", href: "/journey/new?inspire=northern-vietnam", tag: "Asia · 10 days", bases: "Hanoi · Ninh Bình · Sapa", best: "October to November", tradeoff: "Sapa needs an overnight rail or drive" },
  { mood: "Coffee", place: "Colombia", title: "City to coffee hills", detail: "Big city energy, Medellín light and a softer final few days in the hills.", href: "/journey/new?inspire=colombia-colour", tag: "South America · 9 days", bases: "Bogotá · Medellín · Salento", best: "December to March", tradeoff: "A domestic flight saves a long road leg" },
  { mood: "Table", place: "Italy", title: "Italy between tables", detail: "Bologna, Florence and Rome with time to sit down properly in each.", href: "/journey/new?inspire=italy-table", tag: "Europe · 8 days", bases: "Bologna · Florence · Rome", best: "April to June or October", tradeoff: "Reserve key meals early" },
  { mood: "Cities", place: "South Korea", title: "South Korea beyond Seoul", detail: "Fast trains, old capital quiet and a finish by the sea.", href: "/journey/new?inspire=south-korea-slow", tag: "Asia · 8 days", bases: "Seoul · Gyeongju · Busan", best: "April to May or October", tradeoff: "Move on weekday mornings" },
  { mood: "Wild", place: "Patagonia", title: "Patagonia at the edges", detail: "A route for weather windows, big landscapes and fewer fixed days.", href: "/journey/new?inspire=patagonia-edges", tag: "South America · 11 days", bases: "Santiago · Puerto Natales · El Calafate", best: "November to March", tradeoff: "Weather can reorder the plan" },
  { mood: "Islands", place: "Taiwan", title: "Taiwan by train", detail: "Night markets, tea hills and a fast, delicious rail route south.", href: "/journey/new?inspire=taiwan-rail", tag: "Asia · 8 days", bases: "Taipei · Taichung · Tainan", best: "October to April", tradeoff: "Summer brings heat and rain" },
];

export default function InspirationExplorer() {
  const [activeMood, setActiveMood] = useState("Food");
  const [profile, setProfile] = useState<TravelProfile>(defaultTravelProfile);
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem("easyt-travel-profile") ?? "null");
      if (isTravelProfile(saved)) {
        setProfile(saved);
        const mood = saved.priority === "nature" ? "Wild" : saved.priority === "culture" ? "Table" : saved.priority === "food" ? "Food" : saved.pace === "slow" ? "Slow" : "Coast";
        setActiveMood(mood);
      } else setShowOnboarding(true);
    } catch { /* the editorial default remains useful */ }
  }, []);
  const active = routes.find((route) => route.mood === activeMood) ?? routes[0];
  const finishOnboarding = () => {
    window.localStorage.setItem("easyt-travel-profile", JSON.stringify(profile));
    setShowOnboarding(false);
    setActiveMood(profile.priority === "nature" ? "Wild" : profile.priority === "culture" ? "Table" : profile.priority === "food" ? "Food" : profile.pace === "slow" ? "Slow" : "Coast");
  };
  return <section className={styles.explorer} id="moods">
    <div className={styles.explorerHead}><div><p className={styles.eyebrow}>Pick a feeling, not a pin</p><h2>What are you really leaving for?</h2></div><p>Tap a mood. We will start with a route that has character, then hand it over to you.</p></div>
    {showOnboarding && <section className={onboardingStyles.panel}><div><div><p>YOUR TRAVEL PROFILE · 30 SECONDS</p><h3>Let’s make the first route feel like you.</h3></div><span>You can change this any time. It shapes discovery; it never locks a trip.</span></div><div className={onboardingStyles.fields}><label>Pace<select value={profile.pace} onChange={(event) => setProfile((current) => ({ ...current, pace: event.target.value as TravelProfile["pace"] }))}><option value="slow">Slow</option><option value="balanced">Balanced</option><option value="full">Full</option></select></label><label>Priority<select value={profile.priority} onChange={(event) => setProfile((current) => ({ ...current, priority: event.target.value as TravelProfile["priority"] }))}><option value="food">Food</option><option value="nature">Nature</option><option value="culture">Culture</option><option value="mix">A mix</option></select></label><label>Hotel moves<select value={profile.hotelMoves} onChange={(event) => setProfile((current) => ({ ...current, hotelMoves: event.target.value as TravelProfile["hotelMoves"] }))}><option value="few">Keep it simple</option><option value="some">A few is fine</option><option value="open">I’ll move for it</option></select></label><label>Comfort<select value={profile.budget} onChange={(event) => setProfile((current) => ({ ...current, budget: event.target.value as TravelProfile["budget"] }))}><option value="value">Good value</option><option value="mid">Mid-range</option><option value="high">Best available</option></select></label><button type="button" onClick={finishOnboarding}>Show my routes →</button></div></section>}
    <div className={profileStyles.profileSignal}>YOUR PROFILE · {profile.priority === "mix" ? "A little of everything" : profile.priority} · {profile.pace} pace</div><div className={styles.moodButtons} role="tablist" aria-label="Travel moods">
      {routes.map((route) => <button type="button" key={route.mood} role="tab" aria-selected={route.mood === activeMood} className={route.mood === activeMood ? styles.moodButtonOn : ""} onClick={() => setActiveMood(route.mood)}>{route.mood}</button>)}
    </div>
    <div className={styles.explorerStage}>
      <div className={`${styles.explorerImage} ${active.image ? "" : styles.routeArt}`} data-mood={active.mood.toLowerCase()} style={active.image ? { backgroundImage: `url(${active.image})` } : undefined}><span>{active.place}</span><i>{active.tag}</i></div>
      <div className={styles.explorerCopy}><p><Sparkles aria-hidden="true" /> YOUR STARTING POINT</p><h3>{active.title}</h3><span>{active.detail}</span><dl className={detailStyles.facts}><div><dt>Bases</dt><dd>{active.bases}</dd></div><div><dt>Best window</dt><dd>{active.best}</dd></div><div><dt>Know this</dt><dd>{active.tradeoff}</dd></div></dl><Link href={active.href}>Open this route <ArrowRight aria-hidden="true" /></Link><small>You’ll be able to change every stop, day and suggestion.</small></div>
      <div className={styles.routeNudge}><b>Not a package.</b><span>A shaped first thought you can pull apart and make yours.</span></div>
    </div>
  </section>;
}
