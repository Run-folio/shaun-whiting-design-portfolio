"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { loopOrigin, loopSlots, projectAtSlot, rebaseLoop, visibleLoop } from "@/lib/alternative-carousel";

type Item = { title: string; href: string };
type WindowState = { base: number; focusMask: number; height?: number };

export function LoopProjectGallery({ items, renderItem }: {
  items: Item[];
  renderItem: (index: number, focusable: boolean) => ReactNode;
}) {
  const track = useRef<HTMLUListElement>(null);
  const geometry = useRef({ step: 0, width: 0 });
  const target = useRef<number | null>(null);
  const pendingLeft = useRef(0);
  const origin = loopOrigin(items.length);
  const [step, setStep] = useState(0);
  const [view, setView] = useState<WindowState>({ base: origin, focusMask: (1 << items.length) - 1 });
  const viewRef = useRef(view);
  const syncRef = useRef<(immediate?: boolean) => void>(() => {});

  useLayoutEffect(() => {
    const el = track.current;
    if (!el) return;
    const count = items.length;
    let mounted = true;

    function sync(immediate = true) {
      if (!mounted || !geometry.current.step) return;
      const { step: stride, width } = geometry.current;
      const rebased = rebaseLoop(el!.scrollLeft, stride, count);
      const window = visibleLoop(rebased.left, el!.clientWidth, stride, width, count);
      const children = Array.from(el!.children) as HTMLLIElement[];
      const heights = new Map(children.map(child => [Number(child.dataset.projectIndex), child.getBoundingClientRect().height]));
      const next = {
        base: window.base,
        focusMask: window.fullyVisible.reduce((mask, slot) => mask | (1 << projectAtSlot(slot, count)), 0),
        height: Math.max(0, ...heights.values()) + 24,
      };
      const previous = viewRef.current;
      if (next.base !== previous.base || next.focusMask !== previous.focusMask || Math.abs((next.height ?? 0) - (previous.height ?? 0)) > .5) {
        // React may move keyed nodes when the cyclic visual order changes.
        // Keep the exact focused link/track, without scrolling it or the page.
        const focused = document.activeElement instanceof HTMLElement && el!.contains(document.activeElement)
          ? document.activeElement : null;
        viewRef.current = next;
        if (immediate) flushSync(() => setView(next)); else setView(next);
        if (focused?.isConnected && document.activeElement !== focused) focused.focus({ preventScroll: true });
      }
      if (rebased.shift) {
        if (target.current !== null) target.current += rebased.shift * stride;
        el!.scrollLeft = rebased.left;
      }
    }
    syncRef.current = sync;

    function measure() {
      const first = el!.querySelector<HTMLLIElement>(".alt-project-card");
      if (!first) return;
      const headerHeight = Math.max(0, ...Array.from(el!.querySelectorAll<HTMLElement>(".alt-project-heading-content")).map(header => header.getBoundingClientRect().height));
      el!.style.setProperty("--alt-heading-height", `${headerHeight}px`);
      const width = first.getBoundingClientRect().width;
      const gap = Number.parseFloat(getComputedStyle(el!).columnGap) || 24;
      const stride = width + gap;
      const previous = geometry.current.step;
      if (Math.abs(stride - previous) > .1) {
        const slot = previous ? el!.scrollLeft / previous : origin;
        pendingLeft.current = slot * stride;
        geometry.current = { step: stride, width };
        target.current = null;
        setStep(stride);
      } else sync(false);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    Array.from(el.children).forEach(card => observer.observe(card));
    el.querySelectorAll(".alt-project-heading-content").forEach(header => observer.observe(header));
    const scrolled = () => sync();
    const directInput = () => { target.current = null; };
    const settled = () => {
      // Starting another smooth movement can emit scrollend for the cancelled
      // one. Only release the queued destination when the current one arrives.
      if (target.current !== null && Math.abs(el!.scrollLeft - target.current) < 1) target.current = null;
    };
    el.addEventListener("scroll", scrolled, { passive: true });
    el.addEventListener("scrollend", settled);
    el.addEventListener("wheel", directInput, { passive: true });
    el.addEventListener("pointerdown", directInput, { passive: true });
    measure();
    return () => {
      mounted = false;
      observer.disconnect();
      el.removeEventListener("scroll", scrolled);
      el.removeEventListener("scrollend", settled);
      el.removeEventListener("wheel", directInput);
      el.removeEventListener("pointerdown", directInput);
    };
  }, [items.length, origin]);

  useLayoutEffect(() => {
    if (!step || !track.current) return;
    track.current.scrollLeft = pendingLeft.current;
    syncRef.current(false);
  }, [step]);

  function move(direction: number) {
    const el = track.current;
    const stride = geometry.current.step;
    if (!el || !stride) return;
    const start = target.current ?? Math.round(el.scrollLeft / stride) * stride;
    target.current = start + direction * stride;
    el.scrollTo({ left: target.current, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function keyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      const el = track.current;
      if (!el || !step) return;
      const cycle = Math.floor((el.scrollLeft + .75) / step / items.length) * items.length;
      target.current = null;
      el.scrollTo({ left: (cycle + (event.key === "End" ? items.length - 1 : 0)) * step, behavior: "instant" });
    }
  }

  const slots = step ? Array.from({ length: items.length }, (_, offset) => view.base + offset)
    : Array.from({ length: items.length }, (_, index) => index);
  const first = projectAtSlot(view.base, items.length);
  return (
    <section id="work" role="region" aria-roledescription="carousel" aria-label="Selected work" className="alt-work alt-work-loop">
      <div className="alt-gallery-toolbar">
        <p className="sr-only" aria-live="polite" aria-atomic="true">{items[first].title}, project {first + 1} of {items.length}. Gallery loops in both directions.</p>
        <div className="alt-gallery-controls" aria-label="Project gallery controls">
          <button type="button" aria-label="Previous projects" aria-controls="alt-projects" onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
          <button type="button" aria-label="Next projects" aria-controls="alt-projects" onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
        </div>
      </div>
      <p id="alt-gallery-help" className="sr-only">Use the left and right arrow keys to explore projects in a continuous loop. Home moves to Rio; End moves to Amazon Returns Kiosk. You can also swipe horizontally. Tab visits links in fully visible cards.</p>
      <ul id="alt-projects" ref={track} className={`alt-project-track${step ? " alt-project-track-loop" : ""}`}
        style={{ height: view.height, "--alt-loop-step": `${step}px`, "--alt-loop-slots": loopSlots(items.length) } as CSSProperties}
        aria-label="Case studies" aria-describedby="alt-gallery-help" tabIndex={0} onKeyDown={keyDown}>
        {slots.map(slot => {
          const index = projectAtSlot(slot, items.length);
          const project = items[index];
          return <li key={project.href} data-project-index={index} data-loop-slot={slot}
            aria-label={`${project.title}, project ${index + 1} of ${items.length}`} aria-posinset={index + 1} aria-setsize={items.length}
            className={`alt-project-card${project.href === "/case-study/returns-kiosk" ? " alt-project-card-kiosk" : ""}`}
            style={step ? { transform: `translateX(${slot * step}px)` } : undefined}>
            {renderItem(index, !step || Boolean(view.focusMask & (1 << index)))}
          </li>;
        })}
      </ul>
    </section>
  );
}
