import Link from "next/link";
import { ArrowRight, Compass, MapPin, Plus, Sparkles, Stamp, Utensils } from "lucide-react";
import { journeyMedia } from "@/lib/journey";
import EasyTNavigation from "../easyt-navigation";
import HomeRestaurantFinder from "./restaurant-finder";
import styles from "./home.module.css";

const ideas = [
  { title: "A slower Guatemala", note: "Markets, volcanic lakes and long lunches", image: journeyMedia.guatemala?.hero.src ?? "/journey/guatemala-city.jpg", href: "/journey/new" },
  { title: "Japan, one good day at a time", note: "Food, trains and room to wander", image: journeyMedia.tokyo?.hero.src ?? "/journey/tokyo.jpg", href: "/journey/new" },
  { title: "The mountain route", note: "High trails, old towns and hot springs", image: journeyMedia.takayama?.hero.src ?? "/journey/takayama.jpg", href: "/journey/new" },
];

export const metadata = { title: "Travel your way · EasyT" };

export default function EasyTHomePage() {
  return (
    <main className={styles.page}>
      <EasyTNavigation current="prototype" />
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>A better way to travel</p>
          <h1>Make room for the good parts.</h1>
          <p className={styles.lede}>EasyT helps you find the places worth going to, shape them into a trip that feels like yours, and keep discovering when you’re already there.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primary} href="/journey/new"><Plus aria-hidden="true" /> Start building</Link>
            <a className={styles.textLink} href="#ideas">Get inspired <ArrowRight aria-hidden="true" /></a>
          </div>
          <div className={styles.heroProof}><span><Sparkles aria-hidden="true" /> Personal, not packaged</span><span><Compass aria-hidden="true" /> Useful on the way</span></div>
        </div>
        <div className={styles.heroCard}>
          <div className={styles.heroImage} style={{ backgroundImage: `url(${journeyMedia.tokyo?.hero.src ?? "/journey/tokyo.jpg"})` }} />
          <div className={styles.heroCardOverlay}><span>YOUR NEXT CHAPTER</span><strong>Tokyo, Kanazawa<br />& the Japanese Alps</strong><small>23 days · built around your pace</small></div>
        </div>
      </section>

      <section className={styles.ideas} id="ideas">
        <div className={styles.sectionIntro}><div><p className={styles.eyebrow}>Start with a feeling</p><h2>Where could you go from here?</h2></div><p>Use an idea as a starting point, then make it yours.</p></div>
        <div className={styles.ideaGrid}>{ideas.map((idea) => <Link href={idea.href} className={styles.ideaCard} key={idea.title}><div className={styles.ideaImage} style={{ backgroundImage: `url(${idea.image})` }} /><div><strong>{idea.title}</strong><span>{idea.note}</span><ArrowRight aria-hidden="true" /></div></Link>)}</div>
      </section>

      <section className={styles.tools}>
        <article className={`${styles.toolCard} ${styles.restaurantCard}`}><div className={styles.toolIcon}><Utensils aria-hidden="true" /></div><p className={styles.eyebrow}>When you’re already there</p><h2>Hungry now?</h2><p>Find a real restaurant near your location that fits the moment, your budget and the shape of today.</p><HomeRestaurantFinder /></article>
        <article className={`${styles.toolCard} ${styles.stampCard}`}><div className={styles.stampMap}><span className={styles.mapDot} /><span className={styles.mapDot} /><span className={styles.mapDot} /><span className={styles.mapLine} /></div><div className={styles.toolIcon}><Stamp aria-hidden="true" /></div><p className={styles.eyebrow}>Keep the story</p><h2>Collect your stamps.</h2><p>Mark the places you’ve lived, loved and returned to. Your map becomes a record of how you travel.</p><Link className={styles.secondary} href="/journey/stamped">Open your map <ArrowRight aria-hidden="true" /></Link></article>
      </section>

      <section className={styles.how}><p className={styles.eyebrow}>How EasyT works</p><div className={styles.steps}><div><b>01</b><strong>Find your spark</strong><span>Browse places and ideas that match the way you like to travel.</span></div><div><b>02</b><strong>Shape the route</strong><span>Build a plan with enough structure to be useful and enough space to breathe.</span></div><div><b>03</b><strong>Keep exploring</strong><span>Use EasyT in the moment, then collect the places that become part of your story.</span></div></div></section>
    </main>
  );
}
