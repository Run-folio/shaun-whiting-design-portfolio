"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { LoopProjectGallery } from "./loop-project-gallery";
import { TrackedLink } from "./tracked-link";

const featured = [
  { href: "/case-study/returns-platform", title: "Doddle Returns Platform", tag: "B2B SaaS | Reverse logistics",
    image: "/folio-work/doddle.webp", alt: "Doddle’s returns dashboard showing request dates, customers and order references",
    summary: "Returns orchestration for major retailers" },
  { href: "/case-study/rio", title: "Rio: AI field ticketing", tag: "AI workflows | Energy",
    image: "/folio-work/rio.webp", alt: "Rio service entry sheets with approval statuses and supplier details",
    summary: "87% fewer manual touchpoints" },
  { href: "/case-study/morrovia", title: "Morrovia", tag: "Independent project | Travel",
    image: "/folio-work/morrovia.webp", alt: "Morrovia route map showing a multi-stop trip across Asia",
    summary: "AI-assisted multi-stop trip planning" },
  { href: "/case-study/returns-kiosk", title: "Amazon Returns Kiosk", tag: "Logistics | Retail",
    image: "/kiosk.jpg", alt: "Amazon self-service returns kiosk",
    summary: "Redesigning self-service parcel returns" },
];

export function FolioWorkCarousel() {
  return (
    <LoopProjectGallery className="folio-carousel" id={null} items={featured} renderItem={(index, focusable) => {
      const { href, title, tag, image, alt, summary } = featured[index];
      return (
        <article className="folio-card">
          <div className="folio-carousel-heading">
            <div className="alt-project-heading-content">
              <p className="folio-eyebrow">{tag}</p>
              <h3>{title}</h3>
            </div>
          </div>
          <div className="folio-shot">
            <Image src={image} alt={alt} width={960} height={564}
              sizes="(max-width: 719px) 80vw, (max-width: 1099px) 43vw, 31vw" />
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
