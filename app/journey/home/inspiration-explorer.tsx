import Link from "next/link";
import { ArrowRight, Clock3, MapPin } from "lucide-react";
import styles from "./home-explorer.module.css";

const routes = [
  {
    place: "Japan",
    title: "Japan, one good day at a time",
    detail: "Tokyo energy, mountain towns and enough room for a meal to change the plan.",
    image: "/journey/japan-evening-route.jpg",
    href: "/journey/routes/japan-slow",
    tag: "Asia · 10 days",
    bases: "Tokyo · Takayama · Kyoto",
  },
  {
    place: "Portugal",
    title: "The Atlantic reset",
    detail: "Lisbon energy, a quiet coast and nothing booked too tightly.",
    image: "/journey/portugal-atlantic-route.jpg",
    href: "/journey/routes/portugal-coast",
    tag: "Europe · 7 days",
    bases: "Lisbon · Comporta · Lagos",
  },
  {
    place: "Peru",
    title: "Andean highlands, gently",
    detail: "Acclimatise, take the Sacred Valley slowly, then choose your big day.",
    image: "/journey/peru-sacred-valley-route.jpg",
    href: "/journey/routes/andean-highlands",
    tag: "South America · 9 days",
    bases: "Cusco · Sacred Valley · Arequipa",
  },
  {
    place: "Taiwan",
    title: "Taiwan by train",
    detail: "Night markets, tea hills and an easy rail route south.",
    image: "/journey/taiwan-rail-route.jpg",
    href: "/journey/routes/taiwan-rail",
    tag: "Asia · 8 days",
    bases: "Taipei · Taichung · Tainan",
  },
];

export default function InspirationExplorer() {
  const [featured, ...moreRoutes] = routes;
  return <section className={styles.explorer} id="routes">
    <header className={styles.explorerHead}>
      <div><p className={styles.eyebrow}>Start with a good idea</p><h2>Choose a route with a point of view.</h2></div>
    </header>

    <Link className={styles.featuredRoute} href={featured.href}>
      <div className={styles.featuredImage} style={{ backgroundImage: `url(${featured.image})` }}><span>{featured.place}</span><small>{featured.tag}</small></div>
      <div className={styles.featuredCopy}>
        <p>Featured route</p><h3>{featured.title}</h3><span>{featured.detail}</span>
        <dl><div><dt><MapPin aria-hidden="true" /> Bases</dt><dd>{featured.bases}</dd></div><div><dt><Clock3 aria-hidden="true" /> Your call</dt><dd>Change any stop, day or suggestion</dd></div></dl>
        <b>Build this route <ArrowRight aria-hidden="true" /></b>
      </div>
    </Link>

    <div className={styles.routeGrid}>
      {moreRoutes.map((route) => <Link className={styles.routeCard} key={route.place} href={route.href}>
        <div className={styles.routeImage} style={{ backgroundImage: `url(${route.image})` }}><span>{route.tag}</span></div>
        <div><small>{route.place}</small><strong>{route.title}</strong><p>{route.detail}</p><i>Open route <ArrowRight aria-hidden="true" /></i></div>
      </Link>)}
    </div>
    <p className={styles.routeFooter}>Want a completely blank canvas? <Link href="/journey/new">Start a trip from scratch <ArrowRight aria-hidden="true" /></Link></p>
  </section>;
}
