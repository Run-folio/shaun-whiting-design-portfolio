"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowUpRight, Building2, Castle, Flower2, House, Landmark, Mountain, PawPrint, PersonStanding, Plane, Torus, Utensils, Waves, type LucideIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { JourneyGlobe } from "@/components/journey-globe";
import { JourneyCarousel } from "@/components/journey-carousel";
import { JourneyRestaurantFinder } from "@/components/journey-restaurant-finder";
import { JourneyWeather } from "@/components/journey-weather";
import { journeyCalendar, journeyDayMedia, journeyDetails, journeyMedia, march2027Journey, type JourneyRestaurant, type RestaurantMeal } from "@/lib/journey";
import styles from "./journey.module.css";

const destinationIcons: Record<string, LucideIcon> = {
  plane: Plane,
  runner: PersonStanding,
  garden: Flower2,
  town: House,
  onsen: Waves,
  castle: Castle,
  panda: PawPrint,
  temple: Landmark,
  pillars: Mountain,
  gate: Torus,
  skyline: Building2,
};

export default function JourneyPage() {
  const [selectedDayId, setSelectedDayId] = useState("day-03");
  const [selectedId, setSelectedId] = useState("tokyo");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<{ restaurant: JourneyRestaurant; meal?: RestaurantMeal }>();
  const hasMounted = useRef(false);
  const selected = useMemo(
    () => march2027Journey.stops.find((stop) => stop.id === selectedId) ?? march2027Journey.stops[0],
    [selectedId],
  );
  const selectedDay = journeyCalendar.find((day) => day.id === selectedDayId) ?? journeyCalendar[0];
  const selectedDayIndex = journeyCalendar.findIndex((day) => day.id === selectedDay.id);
  const details = journeyDetails[selected.id] ?? [];
  const media = journeyMedia[selected.id];
  const images = journeyDayMedia[selectedDay.id] ?? (media ? [media.hero, ...(media.gallery ?? [])] : []);
  const mapPreviewImage = images.find((image) => image.src !== images[0]?.src);
  const DestinationIcon = destinationIcons[selected.marker] ?? Landmark;
  const handleRestaurantSelect = useCallback((restaurant?: JourneyRestaurant, meal?: RestaurantMeal) => {
    setSelectedRestaurant(restaurant ? { restaurant, meal } : undefined);
  }, []);

  useEffect(() => { hasMounted.current = true; }, []);

  useEffect(() => {
    document.querySelector(`[data-day-id="${selectedDayId}"]`)?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
    setSelectedRestaurant(undefined);
  }, [selectedDayId]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = window.setTimeout(() => {
      if (selectedDayIndex === journeyCalendar.length - 1) {
        setIsPlaying(false);
      } else {
        const nextDay = journeyCalendar[selectedDayIndex + 1];
        setSelectedDayId(nextDay.id);
        setSelectedId(nextDay.stopId);
      }
    }, 1550);
    return () => window.clearTimeout(timer);
  }, [isPlaying, selectedDayIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target?.matches("input, textarea, select")) return;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        setIsPlaying(false);
        const nextDay = journeyCalendar[Math.min(selectedDayIndex + 1, journeyCalendar.length - 1)];
        setSelectedDayId(nextDay.id);
        setSelectedId(nextDay.stopId);
      }
      if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        setIsPlaying(false);
        const previousDay = journeyCalendar[Math.max(selectedDayIndex - 1, 0)];
        setSelectedDayId(previousDay.id);
        setSelectedId(previousDay.stopId);
      }
      if (event.key === " ") {
        if (target?.matches("button")) return;
        event.preventDefault();
        setIsPlaying((playing) => !playing);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedDayIndex]);

  return (
    <main className={styles.journey}>
      <JourneyGlobe
        stops={march2027Journey.stops}
        legs={march2027Journey.legs}
        selectedId={selectedId}
        activeItems={selectedDay.items}
        previewImage={mapPreviewImage}
        detailImageSrc={images[0]?.src}
        restaurant={selectedRestaurant}
        onSelect={(id) => {
          setIsPlaying(false);
          setSelectedId(id);
          const matchingDay = journeyCalendar.find((day) => day.stopId === id)
            ?? (id === "los-angeles-out" ? journeyCalendar[0] : undefined);
          if (matchingDay) setSelectedDayId(matchingDay.id);
        }}
      />
      <div className={styles.vignette} />
      <div className={styles.grain} />

      <header className={styles.topbar}>
        <div className={styles.headerRow}>
          <Link href="/" className={styles.back}>← Shaun Whiting</Link>
          <div className={styles.titleLockup}><span>{march2027Journey.title}</span><small>{march2027Journey.dateRange}</small></div>
          <span />
        </div>
        <nav className={styles.timeline} aria-label="Trip itinerary">
          <div className={styles.track}>
            {journeyCalendar.map((day, index) => {
              const active = day.id === selectedDayId;
              return (
                <button
                  key={day.id}
                  data-day-id={day.id}
                  onClick={() => { setIsPlaying(false); setSelectedDayId(day.id); setSelectedId(day.stopId); }}
                  className={`${styles.stop} ${active ? styles.active : ""}`}
                  aria-current={active ? "step" : undefined}
                >
                  <span className={styles.stopNode}><i /></span>
                  <span className={styles.stopDate}>{day.date} · {day.label}</span>
                  <strong>{day.city}</strong>
                  {index < journeyCalendar.length - 1 ? <span className={styles.segment} /> : null}
                </button>
              );
            })}
          </div>
        </nav>
      </header>

      <section className={styles.destination} aria-live="polite">
        <motion.div
          key={selected.id}
          initial={hasMounted.current ? { opacity: 0, x: -7, filter: "blur(2px)" } : false}
          animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
          transition={{ type: "spring", stiffness: 260, damping: 30, mass: .65 }}
        >
            <div className={styles.destinationIntro}>
              <div className={styles.destinationLine} />
              <div className={styles.introTop}>
                <p className={styles.kicker}>{selectedDay.date} <span /> {selected.country}</p>
                <JourneyWeather city={selected.city} coordinates={selected.coordinates} date={selectedDay.date} />
              </div>
              <div className={styles.destinationTitle}><h1>{selected.city}</h1><span aria-hidden="true"><DestinationIcon /></span></div>
              <p className={styles.description}>{selected.description}</p>
              <div className={styles.highlights}>
                {selected.highlights.map((highlight, index) => <span key={highlight}><b>0{index + 1}</b>{highlight}</span>)}
              </div>
            </div>
            {images.length ? <>
              <JourneyCarousel images={images} city={selectedDay.city} storyKey={selectedDay.id} />
              <details className={styles.exploreMore} open>
                <summary><span>Explore {selected.city}</span><b>More details</b></summary>
                <div className={styles.exploreContent}>
                  {details.map((detail) => <article key={detail.title}><h3>{detail.title}</h3><p>{detail.copy}</p></article>)}
                </div>
              </details>
            </> : null}
            {!media && details.length ? <div className={styles.detailSections}>
              {details.map((detail) => <details key={detail.title}><summary>{detail.title}<span>+</span></summary><p>{detail.copy}</p></details>)}
            </div> : null}
        </motion.div>
      </section>

      <aside className={styles.itineraryPanel} aria-live="polite">
        <motion.div
          key={selectedDay.id}
          initial={hasMounted.current ? { opacity: 0, x: 8 } : false}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: .32, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className={styles.itineraryEyebrow}>{selectedDay.date} <span /> {selectedDay.label}</p>
          <h2>{selectedDay.title}</h2>
          <p className={styles.itineraryLocation}>{selectedDay.city}</p>
          <ol>
            {selectedDay.items.map((item, index) => <li key={item}><b>{String(index + 1).padStart(2, "0")}</b><span>{item}</span></li>)}
            {selectedRestaurant ? <li className={styles.savedRestaurant}>
              <b>{String(selectedDay.items.length + 1).padStart(2, "0")}</b>
              <a href={selectedRestaurant.restaurant.mapsUrl} target="_blank" rel="noreferrer">
                <span className={styles.savedRestaurantIcon}><Utensils /></span>
                <span className={styles.savedRestaurantCopy}>
                  <small>{selectedRestaurant.meal ?? "Meal"} · saved restaurant</small>
                  <strong>{selectedRestaurant.restaurant.name}</strong>
                  <em>{selectedRestaurant.restaurant.area}</em>
                </span>
                <ArrowUpRight />
              </a>
            </li> : null}
          </ol>
          {selectedDayIndex < journeyCalendar.length - 1 ? <button type="button" className={styles.nextDay} onClick={() => {
            const nextDay = journeyCalendar[selectedDayIndex + 1];
            setIsPlaying(false);
            setSelectedDayId(nextDay.id);
            setSelectedId(nextDay.stopId);
          }}><small>Next</small><span>{journeyCalendar[selectedDayIndex + 1].date}</span><strong>{journeyCalendar[selectedDayIndex + 1].city} →</strong></button> : null}
          <JourneyRestaurantFinder stopId={selected.id} city={selected.city} dayId={selectedDay.id} onSelectRestaurant={handleRestaurantSelect} />
        </motion.div>
      </aside>

      <button className={`${styles.playButton} ${isPlaying ? styles.playing : ""}`} onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? "Pause journey sequence" : "Play journey sequence"}>
        <span>{isPlaying ? "Ⅱ" : "▶"}</span>
        <strong>{isPlaying ? "Pause journey" : "Play journey"}</strong>
        <small>{selectedDayIndex + 1} / {journeyCalendar.length}</small>
      </button>

    </main>
  );
}
