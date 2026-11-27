"use client";

import { useEffect, useRef, type ReactNode } from "react";

export function PortfolioMetricMotion({ children }: { children: ReactNode }) {
  const band = useRef<HTMLDListElement>(null);

  useEffect(() => {
    const list = band.current;
    if (!list) return;
    list.dataset.motionReady = "true";
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (preference.matches || !("IntersectionObserver" in window) || typeof list.animate !== "function") return;

    const numbers = Array.from(list.querySelectorAll<HTMLElement>("dd")).filter(
      (item) => /\d/.test(item.textContent ?? ""),
    );
    if (!numbers.length) return;

    let animations: Animation[] = [];
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting && entry.intersectionRatio >= 0.3)) return;
      observer.disconnect();
      if (preference.matches) return;
      animations = numbers.map((item, index) =>
        item.animate(
          [{ opacity: 0.66, transform: "translateY(9px)" }, { opacity: 1, transform: "translateY(0)" }],
          { duration: 420, delay: index * 65, easing: "cubic-bezier(.18,.75,.25,1)", fill: "backwards" },
        ),
      );
      list.closest(".case-detail-outcomes")?.setAttribute("data-motion-played", "true");
    }, { threshold: 0.3 });
    const cancelForReducedMotion = () => {
      if (!preference.matches) return;
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
    };

    observer.observe(list);
    preference.addEventListener("change", cancelForReducedMotion);
    return () => {
      observer.disconnect();
      animations.forEach((animation) => animation.cancel());
      preference.removeEventListener("change", cancelForReducedMotion);
    };
  }, []);

  return <dl ref={band} className="case-detail-outcomes-grid" data-portfolio-metric-motion>{children}</dl>;
}
