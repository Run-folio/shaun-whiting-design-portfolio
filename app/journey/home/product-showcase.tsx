"use client";

import { useState } from "react";
import styles from "./product-shots.module.css";

const screens = [
  { id: "plan", label: "Map plan", eyebrow: "Plan on the move", title: "The whole day, in your hand.", copy: "See the route, today’s plan and nearby options in one calm mobile view.", image: "/journey/product-shots/map-plan-mobile.jpeg", alt: "EasyT map plan on a phone" },
  { id: "time", label: "Shape time", eyebrow: "Make room", title: "Give each place the time it deserves.", copy: "Move a slider and EasyT reshapes the route without losing the rhythm of the trip.", image: "/journey/product-shots/time-mobile.jpeg", alt: "EasyT time allocation on a phone" },
  { id: "finder", label: "Find nearby", eyebrow: "In the moment", title: "Find the right place for right now.", copy: "Ask for a meal or a stay near you, then choose from real nearby places without leaving the day’s plan.", image: "/journey/product-shots/finder-mobile.jpeg", alt: "EasyT nearby restaurant finder on a phone" },
  { id: "profile", label: "Travel profile", eyebrow: "Made for you", title: "A trip that starts with how you travel.", copy: "Set your pace, priorities and comfort level once. EasyT uses them as a thoughtful starting point for every new route.", image: "/journey/product-shots/profile-mobile.jpeg", alt: "EasyT travel profile on a phone" },
  { id: "stamps", label: "Stamps", eyebrow: "Remember it", title: "Keep the places that changed you.", copy: "Build a personal record of the countries and moments you want to keep close.", image: "/journey/product-shots/stamps-mobile.jpeg", alt: "EasyT Stamps map on a phone" },
];

export default function ProductShowcase() {
  const [active, setActive] = useState(0);
  const screen = screens[active];
  return <section className={styles.section} aria-labelledby="easyt-in-action">
    <div className={styles.intro}><div><p className={styles.eyebrow}>EasyT in motion</p><h2 id="easyt-in-action">A useful trip companion, not just a plan.</h2></div><p>Explore the parts of EasyT that stay useful before, during and after a trip.</p></div>
    <div className={styles.picker} role="tablist" aria-label="EasyT mobile features">{screens.map((item, index) => <button type="button" role="tab" aria-selected={active === index} className={active === index ? styles.active : ""} onClick={() => setActive(index)} key={item.id}>{item.label}</button>)}</div>
    <div className={styles.showcase}>
      <div className={styles.device}><div className={styles.speaker} /><div className={styles.screen}><img src={screen.image} alt={screen.alt} /></div></div>
      <div className={styles.copy}><small>{screen.eyebrow}</small><h3>{screen.title}</h3><p>{screen.copy}</p><button type="button" onClick={() => setActive((active + 1) % screens.length)}>Show next feature</button></div>
    </div>
  </section>;
}
