"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { LoopProjectGallery } from "./loop-project-gallery";
import { TrackedLink } from "./tracked-link";

const featured = [
  { href: "/case-study/returns-platform", title: "Doddle Returns Platform", tag: "B2B SaaS | Reverse logistics",
    image: "/Returns.png", width: 2800, height: 2100, alt: "Doddle’s desktop returns dashboard showing the full returns list and processing status",
    summary: "Returns orchestration for major retailers" },
  { href: "/case-study/rio", title: "Rio: AI field ticketing", tag: "AI workflows | Energy",
    image: "/rio/rio-hero-desktop.png", width: 2800, height: 2100, alt: "Rio service entry sheets with approval statuses and supplier details",
    summary: "87% fewer manual touchpoints" },
  { href: "/case-study/morrovia", title: "Morrovia", tag: "Independent project | Travel",
    image: "/morrovia/map-2026-11.webp", width: 1600, height: 1000, alt: "Morrovia map of a seven-stop route through Japan and South Korea",
    summary: "AI-assisted multi-stop trip planning" },
  { href: "/case-study/returns-kiosk", title: "Amazon Returns Kiosk", tag: "Logistics | Retail",
    image: "/kiosk.jpg", width: 1976, height: 2077, alt: "Amazon self-service returns kiosk",
    summary: "Redesigning self-service parcel returns" },
];

export function FolioWorkCarousel() {
  return (
    <LoopProjectGallery className="folio-carousel" id={null} items={featured} showPosition renderItem={(index, focusable) => {
      const { href, title, tag, image, alt, summary, width, height } = featured[index];
      return (
        <article className="folio-card">
          <div className="folio-carousel-heading">
            <div className="alt-project-heading-content">
              <p className="folio-eyebrow">{tag}</p>
              <h3>{title}</h3>
            </div>
          </div>
          <div className="folio-shot">
            <Image src={image} alt={alt} width={width} height={height} sizes="(max-width: 719px) 85vw, (max-width: 1099px) 43vw, 30vw" />
          </div>
          <p className="folio-summary">{summary}</p>
          <TrackedLink className="folio-case-link" href={href} tabIndex={focusable ? 0 : -1}
            eventName="case_study_cta_clicked" eventData={{ case_study_title: title, location: "home_featured" }}
            aria-label={`View ${title} case study`}>View case study <ArrowUpRight size={16} aria-hidden="true" /></TrackedLink>
        </article>
      );
    }} />
  );
}
