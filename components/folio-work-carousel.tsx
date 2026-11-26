"use client";

import Image from "next/image";
import { LoopProjectGallery } from "./loop-project-gallery";
import { TrackedLink } from "./tracked-link";

const featured = [
  { href: "/case-study/returns-platform", title: "Doddle Returns Platform", tag: "B2B SaaS | Reverse logistics",
    image: "/RP1.png", width: 3840, height: 2160, alt: "Doddle’s desktop return detail showing items, resolution controls and parcel tracking" },
  { href: "/case-study/rio", title: "Rio: AI field ticketing", tag: "AI workflows | Energy",
    image: "/rio/rio-hero-desktop.png", width: 2800, height: 2100, alt: "Rio service entry sheets with approval statuses and supplier details" },
  { href: "/case-study/morrovia", title: "Morrovia", tag: "Independent project | Travel",
    image: "/morrovia/homepage-2026-11.webp", width: 1800, height: 1066, alt: "Morrovia homepage with trip search and featured journeys" },
  { href: "/case-study/returns-kiosk", title: "Amazon Returns Kiosk", tag: "Logistics | Retail",
    image: "/kiosk.jpg", width: 1976, height: 2077, alt: "Amazon self-service returns kiosk" },
];

export function FolioWorkCarousel() {
  return (
    <LoopProjectGallery className="folio-carousel" id={null} items={featured} showPosition controlsBelow snapToCard renderItem={(index, focusable) => {
      const { href, title, tag, image, alt, width, height } = featured[index];
      return (
        <article className="folio-card">
          <div className="folio-carousel-heading">
            <div className="alt-project-heading-content">
              <p className="folio-eyebrow">{tag}</p>
              <h3><TrackedLink className="folio-case-link" href={href} tabIndex={focusable ? 0 : -1}
                eventName="case_study_cta_clicked" eventData={{ case_study_title: title, location: "home_featured" }}
                aria-label={`View ${title} case study`}>{title}</TrackedLink></h3>
            </div>
          </div>
          <div className="folio-shot" data-preview={href === "/case-study/returns-platform" ? "return-detail" : undefined}>
            <Image src={image} alt={alt} width={width} height={height} sizes="(max-width: 719px) 85vw, (max-width: 1099px) 43vw, 30vw" />
          </div>
        </article>
      );
    }} />
  );
}
