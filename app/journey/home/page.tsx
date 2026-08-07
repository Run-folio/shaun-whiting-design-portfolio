import Link from "next/link";
import { ArrowRight, Compass, MapPin, Plus, Sparkles, Stamp, Utensils } from "lucide-react";
import { journeyMedia } from "@/lib/journey";
import EasyTNavigation from "../easyt-navigation";
import HomeRestaurantFinder from "./restaurant-finder";
import InspirationExplorer from "./inspiration-explorer";
import styles from "./home.module.css";
import polish from "./home-polish.module.css";

export const metadata = { title: "Travel your way · EasyT" };

export default function EasyTHomePage() {
  return (
    <main className={styles.page}>
      <EasyTNavigation current="home" />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Travel starts before the booking</p>
          <h1>Make room for the good parts.</h1>
          <p className={styles.lede}>EasyT turns what you want from a break, whether that is food, nature or more time, into a trip you can shape. It stays useful once you are there too.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#moods"><Sparkles aria-hidden="true" /> Find your kind of trip</a>
            <Link className={styles.textLink} href="/journey/new"><Plus aria-hidden="true" /> Start from scratch</Link>
          </div>
          <div className={styles.heroProof}><span><Sparkles aria-hidden="true" /> Personal, not packaged</span><span><Compass aria-hidden="true" /> Useful on the way</span></div>
        </div>
        <div className={`${styles.heroCard} ${polish.heroCard}`}>
          <div className={styles.heroImage} style={{ backgroundImage: `url(${journeyMedia.tokyo?.hero.src ?? "/journey/tokyo.jpg"})` }} />
          <div className={styles.heroCardOverlay}><span>YOUR NEXT CHAPTER</span><strong>Tokyo, Kanazawa<br />& the Japanese Alps</strong><small>23 days · built around your pace</small></div>
        </div>
      </section>

      <section className={`${styles.why} ${polish.why}`}>
        <p className={styles.eyebrow}>Why EasyT</p>
        <div><h2>Most travel tools begin after you choose a destination. EasyT begins with why you want to go.</h2><p>Choose a route that fits the kind of break you need. You get a useful first plan, not a fixed itinerary. Every day, stop and place remains editable.</p></div>
      </section>

      <InspirationExplorer />

      <section className={styles.tools}>
        <article className={`${styles.toolCard} ${styles.restaurantCard} ${polish.toolCard}`}><div className={styles.toolIcon}><Utensils aria-hidden="true" /></div><p className={styles.eyebrow}>When you’re already there</p><h2>Hungry now?</h2><p>Find a real restaurant near your location that fits the moment, your budget and the shape of today.</p><HomeRestaurantFinder /></article>
        <article className={`${styles.toolCard} ${styles.stampCard} ${polish.toolCard}`}><div className={styles.stampMap}><span className={styles.mapDot} /><span className={styles.mapDot} /><span className={styles.mapDot} /><span className={styles.mapLine} /></div><div className={styles.toolIcon}><Stamp aria-hidden="true" /></div><p className={styles.eyebrow}>Keep the story</p><h2>Collect your stamps.</h2><p>Mark the places you’ve lived, loved and returned to. Your map becomes a record of how you travel.</p><Link className={styles.secondary} href="/journey/stamped">Open your map <ArrowRight aria-hidden="true" /></Link></article>
      </section>

      <section className={styles.how}><p className={styles.eyebrow}>How EasyT works</p><div className={styles.steps}><div><b>01</b><strong>Find your spark</strong><span>Browse places and ideas that match the way you like to travel.</span></div><div><b>02</b><strong>Shape the route</strong><span>Build a plan with enough structure to be useful and enough space to breathe.</span></div><div><b>03</b><strong>Keep exploring</strong><span>Use EasyT in the moment, then collect the places that become part of your story.</span></div></div></section>
    </main>
  );
}
