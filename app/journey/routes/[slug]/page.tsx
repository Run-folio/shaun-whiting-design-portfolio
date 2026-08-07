import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Route, Sparkles } from "lucide-react";
import { notFound } from "next/navigation";
import EasyTNavigation from "../../easyt-navigation";
import { inspirationByKey } from "@/lib/easyt/inspiration";
import styles from "./route-overview.module.css";

const routeStories: Record<string, { eyebrow: string; title: string; summary: string; image: string; duration: string; rhythm: string; bestFor: string; promise: string; notes: string[] }> = {
  "japan-slow": { eyebrow: "Asia · food and mountains", title: "Japan, one good day at a time", summary: "A first-time Japan route that moves from Tokyo’s energy into smaller mountain towns, then ends with Kyoto at a human pace.", image: "/journey/japan-evening-route.jpg", duration: "10 days", rhythm: "3 bases · 2 rail days", bestFor: "Food, culture and an unhurried first visit", promise: "The route is designed to leave a little room in every place: for an unexpected counter seat, a slower morning or one more walk.", notes: ["Tokyo is your energetic opening chapter, not a checklist.", "Takayama adds mountain air and a softer rhythm between the cities.", "Kyoto is saved for last, with enough time to wander properly."] },
  "portugal-coast": { eyebrow: "Europe · city to coast", title: "The Atlantic reset", summary: "Start with Lisbon’s colour and energy, ease into Comporta, then finish on the Algarve with nowhere to rush back from.", image: "/journey/portugal-atlantic-route.jpg", duration: "7 days", rhythm: "3 bases · easy road route", bestFor: "Sea air, good food and a genuinely slower week", promise: "This is deliberately light on hotel changes and full of days that can flex around the weather, a long lunch or a beach you did not expect to find.", notes: ["Lisbon brings the buzz, without trying to see every neighbourhood.", "Comporta creates the pause between the city and the coast.", "Lagos gives the final wide-open days by the Atlantic."] },
  "andean-highlands": { eyebrow: "South America · altitude and landscapes", title: "Andean highlands, gently", summary: "A highland route that gives your body time to acclimatise before asking for its biggest days, with Cusco, the Sacred Valley and Arequipa in a calm sequence.", image: "/journey/peru-sacred-valley-route.jpg", duration: "9 days", rhythm: "3 bases · altitude-aware pacing", bestFor: "Big landscapes without overfilling every day", promise: "The plan protects the important things: recovery at altitude, weather buffer and a little freedom to decide which big day feels right once you are there.", notes: ["Cusco starts slowly, so the altitude does not set the agenda.", "The Sacred Valley gets proper space rather than a rushed day trip.", "Arequipa gives the trip a graceful, lower-key final chapter."] },
  "taiwan-rail": { eyebrow: "Asia · rail and night markets", title: "Taiwan by train", summary: "A fast, delicious route south through Taipei, Taichung and Tainan, held together by easy rail legs and nights that stay open for eating.", image: "/journey/taiwan-rail-route.jpg", duration: "8 days", rhythm: "3 bases · rail-first", bestFor: "Night markets, tea hills and low-friction movement", promise: "The rail route keeps transfers simple, so you can arrive, drop your bag and spend your energy on the places that make Taiwan memorable.", notes: ["Taipei starts with neighbourhood energy and room to eat your way around it.", "Taichung breaks the journey with slower streets and green space.", "Tainan is the warm, food-led finish with time to follow your appetite."] },
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const story = routeStories[slug];
  return { title: story ? `${story.title} · EasyT` : "Route · EasyT" };
}

export default async function RouteOverviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const seed = inspirationByKey[slug];
  const story = routeStories[slug];
  if (!seed || !story) notFound();

  return <main className={styles.page}>
    <EasyTNavigation current="home" />
    <section className={styles.hero}>
      <div className={styles.heroImage} style={{ backgroundImage: `url(${story.image})` }}><div><p>{story.eyebrow}</p><span>{story.duration}</span></div></div>
      <div className={styles.heroCopy}><p className={styles.eyebrow}>A route with room to breathe</p><h1>{story.title}</h1><p>{story.summary}</p><dl><div><dt><CalendarDays aria-hidden="true" /> Time</dt><dd>{story.duration}</dd></div><div><dt><Route aria-hidden="true" /> Shape</dt><dd>{story.rhythm}</dd></div><div><dt><Sparkles aria-hidden="true" /> Best for</dt><dd>{story.bestFor}</dd></div></dl><Link className={styles.primary} href={`/journey/new?inspire=${encodeURIComponent(seed.key)}`}>Make this trip mine <ArrowRight aria-hidden="true" /></Link><small>You will choose dates, adjust the pace and change every stop next.</small></div>
    </section>
    <section className={styles.routeBody}>
      <p className={styles.routeLabel}>The route · {story.rhythm}</p>
      <ol className={styles.stops}>{seed.stops.map((stop, index) => <li key={stop.id}><b>0{index + 1}</b><div><p><MapPin aria-hidden="true" /> {stop.country}</p><h3>{stop.name}</h3><span>{story.notes[index]}</span></div></li>)}</ol>
    </section>
  </main>;
}
