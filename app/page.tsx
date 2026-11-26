import type { Metadata } from "next";
import { ArrowDown, ArrowUpRight } from "lucide-react";
import Image from "next/image";
import { Navigation, Footer } from "@/components/ui";
import { BrandWave } from "@/components/brand-wave";
import { TrackedAnchor, TrackedLink } from "@/components/tracked-link";
import "./folio-home.css";

export const metadata: Metadata = {
  title: "Shaun Whiting | Senior Product Designer",
  description: "Selected product design work in B2B SaaS, AI workflows and zero-to-one products.",
  openGraph: {
    title: "Shaun Whiting | Senior Product Designer",
    description: "Selected product design work in B2B SaaS, AI workflows and zero-to-one products.",
    url: "https://shaunwhiting.com", siteName: "Shaun Whiting", locale: "en_GB", type: "website",
  },
};

const featured = [
  { slug: "returns-platform", title: "Doddle Returns Platform", tag: "B2B SaaS | Reverse logistics",
    image: "/folio-work/doddle.webp", alt: "Doddle’s returns dashboard showing request dates, customers and order references",
    summary: "Returns orchestration for major retailers" },
  { slug: "rio", title: "Rio: AI field ticketing", tag: "AI workflows | Energy",
    image: "/folio-work/rio.webp", alt: "Rio service entry sheets with approval statuses and supplier details",
    summary: "87% fewer manual touchpoints" },
  { slug: "morrovia", title: "Morrovia", tag: "Independent project | Travel",
    image: "/folio-work/morrovia.webp", alt: "Morrovia route map showing a multi-stop trip across Asia",
    summary: "AI-assisted multi-stop trip planning" },
];

const moreWork = [
  { slug: "returns-kiosk", title: "Amazon Returns Kiosk", tag: "Retail logistics" },
  { slug: "farfetch", title: "Farfetch Mobile", tag: "Luxury ecommerce" },
];

export default function Home() {
  return (
    <div className="folio-home">
      <Navigation />
      <main id="main">
        <section id="about" className="folio-hero" aria-labelledby="folio-heading">
          <BrandWave />
          <div className="folio-hero-inner">
            <h1 id="folio-heading">Complexity <span>solved<i>.</i></span></h1>
            <div className="folio-intro">
              <p>Senior Product Designer</p>
              <p>I help teams make complex products feel simple.</p>
              <p className="folio-tags">AI products | B2B SaaS | 0→1</p>
              <a className="folio-primary" href="#work">View selected work <ArrowDown size={20} aria-hidden="true" /></a>
              <small>Available from <time dateTime="2027-01-04">4 January 2027</time></small>
            </div>
          </div>
        </section>

        <section className="folio-work" id="work" aria-labelledby="folio-work-heading" tabIndex={-1}>
          <h2 className="sr-only" id="folio-work-heading">Selected work</h2>
          <div className="folio-cards">
            {featured.map(({ slug, title, tag, image, alt, summary }) => (
              <article className="folio-card" key={slug}>
                <p className="folio-eyebrow">{tag}</p>
                <h3>{title}</h3>
                <div className="folio-shot">
                  <Image src={image} alt={alt} width={960} height={564}
                    sizes="(max-width: 719px) 92vw, 33vw" />
                </div>
                <p className="folio-summary">{summary}</p>
                <TrackedLink className="folio-case-link" href={`/case-study/${slug}`}
                  eventName="case_study_cta_clicked" eventData={{ case_study_title: title, location: "home_featured" }}
                  aria-label={`View ${title} case study`}>View case study <ArrowUpRight size={16} aria-hidden="true" /></TrackedLink>
              </article>
            ))}
          </div>

          <div className="folio-more">
            <h2>More work</h2>
            {moreWork.map(({ slug, title, tag }) =>
              <TrackedLink key={slug} className="folio-more-link" href={`/case-study/${slug}`}
                eventName="case_study_cta_clicked" eventData={{ case_study_title: title, location: "home_more_work" }}>
                <span>{title}</span><small>{tag}</small><ArrowUpRight size={20} aria-hidden="true" />
              </TrackedLink>
            )}
          </div>
        </section>

        <section id="contact" className="folio-contact" aria-labelledby="folio-contact-heading">
          <div><p className="folio-eyebrow">Get in touch</p><h2 id="folio-contact-heading">Let’s talk<span>.</span></h2></div>
          <div><p>London on-site or hybrid | UK remote</p>
            <div className="folio-contact-links">
              <TrackedAnchor href="mailto:sw@shaunwhiting.com" eventName="email_contact_clicked" eventData={{ location: "home_contact" }}>Email Shaun <ArrowUpRight size={16} aria-hidden="true" /></TrackedAnchor>
              <TrackedAnchor href="https://www.linkedin.com/in/shaunwhiting/" eventName="linkedin_clicked" eventData={{ location: "home_contact" }}>LinkedIn <ArrowUpRight size={16} aria-hidden="true" /></TrackedAnchor>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
