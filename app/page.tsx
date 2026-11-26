import type { Metadata } from "next";
import { ArrowDown, Linkedin, Mail } from "lucide-react";
import { FolioCollaborations } from "@/components/folio-collaborations";
import { FolioWorkCarousel } from "@/components/folio-work-carousel";
import { Navigation, Footer } from "@/components/ui";
import { BrandWave } from "@/components/brand-wave";
import { TrackedAnchor } from "@/components/tracked-link";
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

        <FolioCollaborations />

        <section className="folio-work" id="work" aria-labelledby="folio-work-heading" tabIndex={-1}>
          <h2 className="sr-only" id="folio-work-heading">Selected work</h2>
          <FolioWorkCarousel />
        </section>

        <section id="contact" className="folio-contact" aria-labelledby="folio-contact-heading">
          <div><p className="folio-eyebrow">Get in touch</p><h2 id="folio-contact-heading">Let’s talk<span>.</span></h2></div>
          <div><p>London on-site or hybrid | UK remote</p>
            <div className="folio-contact-links">
              <TrackedAnchor href="mailto:sw@shaunwhiting.com" eventName="email_contact_clicked" eventData={{ location: "home_contact" }}><Mail size={17} aria-hidden="true" /> <span>Email Shaun</span></TrackedAnchor>
              <TrackedAnchor href="https://www.linkedin.com/in/shaunwhiting/" eventName="linkedin_clicked" eventData={{ location: "home_contact" }}><Linkedin size={17} aria-hidden="true" /> <span>LinkedIn</span></TrackedAnchor>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
