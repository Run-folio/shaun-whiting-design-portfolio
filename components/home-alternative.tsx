"use client";

import Image from "next/image";
import { ArrowLeft, ArrowRight, Mail } from "lucide-react";
import { Component, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { projects as sourceProjects } from "@/lib/content";

// This presentation order belongs only to the alternative homepage.
const alternativeOrder: Record<string, number> = {
  "/case-study/rio": 0,
  "/case-study/returns-platform": 1,
  "/case-study/morrovia": 2,
  "/case-study/returns-kiosk": 3,
};
const projects = sourceProjects.filter(project => project.href in alternativeOrder).sort(
  (a, b) => (alternativeOrder[a.href] ?? Infinity) - (alternativeOrder[b.href] ?? Infinity),
);
// Concise context derived from the existing case-study summaries.
const projectContext: Record<string, string> = {
  "/case-study/rio": "Turning field tickets into validated, approved service entry sheets.",
  "/case-study/returns-platform": "Giving retailers control over policies, routing and store processing.",
  "/case-study/morrovia": "Turning a travel idea into an editable journey with realistic connections.",
  "/case-study/returns-kiosk": "Reducing hesitation and clarifying parcel constraints for multiple returns.",
};
import { LoopProjectGallery } from "./loop-project-gallery";
import { MountainScene } from "./mountain-scene";
import { TransformingMountainScene } from "./transforming-mountain-scene";
import { FluidMountainScene } from "./fluid-mountain-scene";
import { EnhancedMountainScene } from "./enhanced-mountain-scene";
import { TrackedAnchor, TrackedLink } from "./tracked-link";

// Decorative WebGL is optional: an unsupported GPU must never hide the page.
class DotsBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? null : this.props.children; }
}

function HeroDots() {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    function update() {
      if (motion.matches) { setEnabled(false); return; }
      try {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
        setEnabled(Boolean(context));
        context?.getExtension("WEBGL_lose_context")?.loseContext();
      } catch { setEnabled(false); }
    }
    update();
    motion.addEventListener("change", update);
    return () => motion.removeEventListener("change", update);
  }, []);
  return enabled ? <DotsBoundary><MountainScene /></DotsBoundary> : null;
}

const stats = [
  "16 years designing",
  "67M+ users reached",
  "$72M measured savings",
  "AI & systems",
];

export function AlternativeHome({ layout = "carousel", enhancedDots = false, fluidDots = false, mountainMorph = false }: { layout?: "carousel" | "grid"; enhancedDots?: boolean; fluidDots?: boolean; mountainMorph?: boolean }) {
  return (
    <>
      <section id="about" aria-label="About Shaun" className={`alt-hero${fluidDots || mountainMorph ? " alt-hero-fluid" : ""}${layout === "carousel" ? " alt-hero-centered" : ""} relative isolate scroll-mt-28 overflow-hidden bg-paper text-ink dark:bg-[#0d0d0c] dark:text-[#f4f3ef]`}>
        {mountainMorph ? <TransformingMountainScene /> : fluidDots ? <FluidMountainScene /> : enhancedDots ? <EnhancedMountainScene /> : <HeroDots />}
        <div data-hero-fade className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-[30svh] bg-[linear-gradient(to_top,#ffffff_0%,rgba(255,255,255,0.92)_38%,rgba(255,255,255,0.4)_62%,rgba(255,255,255,0)_100%)] dark:bg-[linear-gradient(to_top,#0d0d0c_0%,rgba(13,13,12,0.92)_38%,rgba(13,13,12,0.4)_62%,rgba(13,13,12,0)_100%)]" />
        <div className="alt-hero-content relative z-10">
          <h1>{layout === "carousel" ? "Making complex products feel simple" : "Helping teams make complex products feel simple"}<span className="text-signal">.</span></h1>
          <div className="alt-intro">
            <p>Staff Product Designer building AI and SaaS products, from first idea to scale</p>
            <TrackedAnchor href="mailto:sw@shaunwhiting.com" eventName="email_contact_clicked" eventData={{ cta_label: "Let’s talk", destination_url: "mailto:sw@shaunwhiting.com", location: "alternative_hero" }} className="alt-hero-cta">Let’s talk</TrackedAnchor>
          </div>
        </div>
        <section aria-label="Experience and impact" className="alt-metrics relative z-10">
          <ul>{stats.map(stat => <li key={stat}>{stat}</li>)}</ul>
        </section>
      </section>
      {layout === "grid" ? <ProjectGallery layout="grid" /> : <LoopProjectGallery items={projects} renderItem={(index, focusable) => <ProjectCardContent project={projects[index]} layout="carousel" focusable={focusable} />} />}
    </>
  );
}

function ProjectGallery({ layout }: { layout: "carousel" | "grid" }) {
  const track = useRef<HTMLUListElement>(null);
  const [trackHeight, setTrackHeight] = useState<number>();
  const [position, setPosition] = useState({ first: true, last: false, next: 0 });
  useEffect(() => {
    const el = track.current;
    if (!el || layout === "grid") return;
    function update() {
      if (!el) return;
      const bounds = el.getBoundingClientRect();
      const edge = bounds.right;
      // Size for the visible cards, including the peek. The taller kiosk grows
      // the gallery when reached instead of leaving a large initial blank area.
      const visible = Array.from(el.children).filter(card => {
        const box = card.getBoundingClientRect();
        return box.right > bounds.left + 2 && box.left < edge - 2;
      });
      setTrackHeight(Math.max(...visible.map(card => card.getBoundingClientRect().height), 0) + 24);
      const clipped = Array.from(el.children).findIndex(card => card.getBoundingClientRect().right > edge + 2);
      setPosition({ first: el.scrollLeft < 2, last: el.scrollWidth - el.clientWidth - el.scrollLeft < 2, next: clipped < 0 ? projects.length - 1 : clipped });
    }
    update();
    el.addEventListener("scroll", update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    Array.from(el.children).forEach(card => observer.observe(card));
    return () => { el.removeEventListener("scroll", update); observer.disconnect(); };
  }, [layout]);

  function move(direction: number) {
    const el = track.current;
    if (!el) return;
    const step = (el.children[1] as HTMLElement)?.offsetLeft - (el.children[0] as HTMLElement)?.offsetLeft || el.clientWidth;
    el.scrollBy({ left: direction * step, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }
  function keyDown(event: KeyboardEvent<HTMLUListElement>) {
    if (event.target !== event.currentTarget) return;
    if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
      event.preventDefault(); move(event.key === "ArrowRight" ? 1 : -1);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      track.current?.scrollTo({ left: event.key === "Home" ? 0 : track.current.scrollWidth, behavior: "instant" });
    }
  }
  const next = projects[position.next];
  return (
    <section id="work" aria-label="Selected work" className={`alt-work${layout === "grid" ? " alt-work-grid" : ""}`}>
      {layout === "carousel" ? <div className="alt-gallery-toolbar">
        <p className="sr-only" aria-live="polite">{position.last ? "End of project gallery" : `More projects: ${next.title}`}</p>
        <div className="alt-gallery-controls" aria-label="Project gallery controls">
          <button type="button" aria-label="Previous projects" aria-controls="alt-projects" disabled={position.first} onClick={() => move(-1)}><ArrowLeft size={20} aria-hidden="true" /></button>
          <button type="button" aria-label="Next projects" aria-controls="alt-projects" disabled={position.last} onClick={() => move(1)}><ArrowRight size={20} aria-hidden="true" /></button>
        </div>
      </div> : null}
      {layout === "carousel" ? <p id="alt-gallery-help" className="sr-only">Use the left and right arrow keys to explore projects. Home and End move to the first and last project. You can also swipe horizontally.</p> : null}
      <ul id="alt-projects" ref={track} className="alt-project-track" style={layout === "carousel" ? { height: trackHeight } : undefined} aria-label="Case studies" aria-describedby={layout === "carousel" ? "alt-gallery-help" : undefined} tabIndex={layout === "carousel" ? 0 : undefined} onKeyDown={layout === "carousel" ? keyDown : undefined}>
        {projects.map(project => (
          <li key={project.href} className={`alt-project-card${project.href === "/case-study/returns-kiosk" ? " alt-project-card-kiosk" : ""}`}>
            <ProjectCardContent project={project} layout={layout} />
          </li>
        ))}
      </ul>
    </section>
  );
}


function ProjectCardContent({ project, layout, focusable = true }: {
  project: (typeof projects)[number];
  layout: "carousel" | "grid";
  focusable?: boolean;
}) {
  return (
    <article>
      <div className={layout === "carousel" ? "alt-project-heading" : undefined}><div className={layout === "carousel" ? "alt-project-heading-content" : undefined}>
              <p className="alt-project-context font-mono text-xs uppercase tracking-[0.16em] text-signal">{project.industry.split(/\s*\/\s*/).join(" | ")}</p>
              <h2 className="text-balance text-4xl font-[540] leading-[1.02] tracking-[-0.025em] sm:text-5xl">
                <TrackedLink tabIndex={layout === "carousel" ? (focusable ? 0 : -1) : undefined} href={project.href} eventName="case_study_cta_clicked" eventData={{ case_study_title: project.title, cta_label: "Project title", location: "alternative_gallery" }} className="rounded-sm transition duration-200 hover:text-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-white">
                  {project.title}
                </TrackedLink>
              </h2>
      {layout === "carousel" ? <p className="alt-project-summary">{projectContext[project.href]}</p> : null}
      </div></div>
              <TrackedLink tabIndex={layout === "carousel" ? (focusable ? 0 : -1) : undefined} href={project.href} eventName="case_study_cta_clicked" eventData={{ case_study_title: project.title, location: "alternative_gallery_image" }} className="alt-project-image-link group relative block overflow-hidden rounded-[24px] bg-mist transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-paper dark:bg-white/6 dark:focus-visible:ring-offset-[#0d0d0c]" aria-label={`View ${project.title} case study`}>
                <Image src={layout === "carousel" && project.href === "/case-study/morrovia" ? "/morrovia/homepage-search.png" : project.image} alt={layout === "carousel" && project.href === "/case-study/morrovia" ? "Morrovia homepage with multi-stop trip search" : `${project.title} product experience`} width={1600} height={1000} sizes="(min-width: 1024px) 43vw, (min-width: 640px) 62vw, 85vw" className="alt-project-image h-auto w-full transition duration-300 group-hover:scale-[1.015]" />
              </TrackedLink>
              {layout === "grid" ? <p className="alt-project-summary">{projectContext[project.href]}</p> : null}
              <p className="alt-outcome-label">Key outcomes</p>
              <dl className="alt-outcomes">{project.outcomes.map((originalOutcome, index) => { const outcome = project.href === "/case-study/returns-kiosk" && index === 2 ? { value: "56 sec", label: "Journey time, down from 90 sec" } : originalOutcome; return <div key={outcome.label}><dd>{outcome.value}</dd><dt>{outcome.label}</dt></div>; })}</dl>
              <TrackedLink tabIndex={layout === "carousel" ? (focusable ? 0 : -1) : undefined} href={project.href} eventName="case_study_cta_clicked" eventData={{ case_study_title: project.title, cta_label: "View", location: "alternative_gallery" }} className="alt-view" aria-label={`View ${project.title} case study`}>View <ArrowRight size={16} aria-hidden="true" /></TrackedLink>
            </article>
  );
}

export function AlternativeContact() {
  return (
    <section id="contact" aria-label="Contact Shaun" className="alt-contact">
      <div className="alt-contact-panel">
        <h2>Complex problems deserve thoughtful design</h2>
        <p>I'm always interested in teams tackling ambitious products, complex systems and meaningful challenges. If that sounds like what you're building, I'd love to hear from you.</p>
        <div className="alt-contact-actions">
          <TrackedAnchor href="mailto:sw@shaunwhiting.com" eventName="email_contact_clicked" eventData={{ cta_label: "Email Shaun", destination_url: "mailto:sw@shaunwhiting.com", location: "alternative_contact_panel" }} className="alt-contact-email">Email Shaun <Mail size={17} aria-hidden="true" /></TrackedAnchor>
          <TrackedAnchor href="https://www.linkedin.com/in/shaunwhiting/" eventName="linkedin_clicked" eventData={{ cta_label: "LinkedIn", destination_url: "https://www.linkedin.com/in/shaunwhiting/", location: "alternative_contact_panel" }} className="alt-contact-linkedin">LinkedIn <ArrowRight size={17} aria-hidden="true" /></TrackedAnchor>
        </div>
      </div>
    </section>
  );
}
