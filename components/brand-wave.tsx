"use client";

import { useEffect, useRef } from "react";
import styles from "./brand-wave.module.css";
import type { WaveHandle } from "./brand-wave-renderer";

/** Static branded art is present at first paint, even with JS or WebGL disabled. */
export function BrandWave({ mobileOnly = false }: { mobileOnly?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const host = ref.current;
    if (!host || !("IntersectionObserver" in window)) return;
    const mobile = window.matchMedia("(max-width: 760px)");
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const forced = window.matchMedia("(forced-colors: active)");
    let visible = false;
    let active = false;
    let epoch = 0;
    let failed = false;
    let loading = false;
    let renderer: WaveHandle | null = null;
    const fallback = () => { delete host.dataset.renderer; };
    const clear = () => {
      ++epoch;
      active = false;
      loading = false;
      fallback();
      renderer?.dispose();
      renderer = null;
    };
    const update = () => {
      if ((mobileOnly && !mobile.matches) || motion.matches || forced.matches) { clear(); return; }
      active = visible && !document.hidden;
      if (renderer) { renderer.setActive(active); return; }
      if (!active || loading || failed) return;
      loading = true;
      const token = epoch;
      // No Three.js download/GL allocation for reduced-motion visits.
      // Keep the initial art on screen through chunk load and first draw.
      import("./brand-wave-renderer").then(({ createWaveRenderer }) => {
        if (token !== epoch) return;
        loading = false;
        if (!active || failed) return;
        try {
          renderer = createWaveRenderer(host, () => {
            failed = true;
            clear();
          });
          renderer.setActive(true);
        } catch {
          failed = true;
          clear();
        }
      }).catch(() => {
        if (token !== epoch) return;
        failed = true;
        clear();
      });
    };
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(host);
    if (mobileOnly) mobile.addEventListener("change", update);
    motion.addEventListener("change", update);
    forced.addEventListener("change", update);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      if (mobileOnly) mobile.removeEventListener("change", update);
      motion.removeEventListener("change", update);
      forced.removeEventListener("change", update);
      document.removeEventListener("visibilitychange", update);
      clear();
    };
  }, [mobileOnly]);
  return <div ref={ref} className={mobileOnly ? `${styles.layer} ${styles.mobileOnly}` : styles.layer} data-brand-wave="" aria-hidden="true" />;
}
