import Link from "next/link";
import { ArrowRight, Compass, Plus, Sparkles, Stamp, Utensils } from "lucide-react";
import { journeyMedia } from "@/lib/journey";
import EasyTNavigation from "../easyt-navigation";
import HomeRestaurantFinder from "./restaurant-finder";
import InspirationExplorer from "./inspiration-explorer";
import styles from "./home.module.css";
import polish from "./home-polish.module.css";
import stampCard from "./stamp-card.module.css";
import ProductShowcase from "./product-showcase";

export const metadata = { title: "Travel your way · EasyT" };

export default function EasyTHomePage() {
  return (
    <main className={styles.page}>
      <EasyTNavigation current="home" />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>Travel, with a little more thought</p>
          <h1>Good trips start with a feeling.</h1>
          <p className={styles.lede}>Pick a route that matches the break you need. EasyT gives you a thoughtful first plan, then leaves it open for you to make it yours.</p>
          <div className={styles.heroActions}>
            <a className={styles.primary} href="#routes"><Sparkles aria-hidden="true" /> See featured routes</a>
            <Link className={styles.textLink} href="/journey/new"><Plus aria-hidden="true" /> Start from scratch</Link>
          </div>
          <div className={styles.heroProof}><span><Sparkles aria-hidden="true" /> Personal, not packaged</span><span><Compass aria-hidden="true" /> Useful before and during the trip</span></div>
        </div>
        <Link href="/journey/routes/japan-slow" className={`${styles.heroCard} ${polish.heroCard}`} aria-label="Explore the Japan route">
          <div className={styles.heroImage} style={{ backgroundImage: `url(${journeyMedia.tokyo?.hero.src ?? "/journey/tokyo.jpg"})` }} />
          <div className={styles.heroCardOverlay}><span>YOUR NEXT CHAPTER</span><strong>Tokyo, Kanazawa<br />& the Japanese Alps</strong><small>Explore the Japan route <ArrowRight aria-hidden="true" /></small></div>
        </Link>
      </section>

      <InspirationExplorer />

      <ProductShowcase />

      <section className={styles.tools}>
        <article className={`${styles.toolCard} ${styles.restaurantCard} ${polish.toolCard}`}><div className={styles.toolIcon}><Utensils aria-hidden="true" /></div><p className={styles.eyebrow}>Out and about</p><h2>Find a good place nearby.</h2><p>Choose what you need, then EasyT will search around your current location.</p><HomeRestaurantFinder /></article>
        <article className={`${styles.toolCard} ${styles.stampCard} ${stampCard.stampCard} ${polish.toolCard}`}><div className={`${styles.stampMap} ${stampCard.mapLayer}`}><span className={styles.mapDot} /><span className={styles.mapDot} /><span className={styles.mapDot} /><span className={styles.mapLine} /></div><div className={styles.toolIcon}><Stamp aria-hidden="true" /></div><p className={styles.eyebrow}>Keep the story</p><h2>Collect your stamps.</h2><p>Mark the places you’ve lived, loved and returned to. Your map becomes a record of how you travel.</p><Link className={styles.secondary} href="/journey/stamped">Open your map <ArrowRight aria-hidden="true" /></Link></article>
      </section>
    </main>
  );
}
