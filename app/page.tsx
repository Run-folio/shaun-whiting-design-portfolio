import type { Metadata } from "next";
import { ArrowDown, Mail } from "lucide-react";
import { FolioCollaborations } from "@/components/folio-collaborations";
import { FolioWorkCarousel } from "@/components/folio-work-carousel";
import { Navigation } from "@/components/ui";
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

      </main>
      <footer id="contact" className="folio-contact" aria-labelledby="folio-contact-heading">
        <div>
          <p className="folio-eyebrow">Get in touch</p>
          <h2 id="folio-contact-heading">Let’s talk<span>.</span></h2>
          <div className="folio-contact-links">
            <TrackedAnchor href="mailto:sw@shaunwhiting.com" eventName="email_contact_clicked" eventData={{ location: "home_contact" }}><Mail size={17} aria-hidden="true" /> <span>Email Shaun</span></TrackedAnchor>
            <TrackedAnchor href="https://www.linkedin.com/in/shaunwhiting/" eventName="linkedin_clicked" eventData={{ location: "home_contact" }}>
              <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden="true" focusable="false">
                {/* LinkedIn mark from Bootstrap Icons (MIT). */}
                <path d="M0 1.146C0 .513.526 0 1.175 0h13.65C15.474 0 16 .513 16 1.146v13.708c0 .633-.526 1.146-1.175 1.146H1.175C.526 16 0 15.487 0 14.854zm4.943 12.248V6.169H2.542v7.225zm-1.2-8.212c.837 0 1.358-.554 1.358-1.248-.015-.709-.52-1.248-1.342-1.248S2.4 3.226 2.4 3.934c0 .694.521 1.248 1.327 1.248zm4.908 8.212V9.359c0-.216.016-.432.08-.586.173-.431.568-.878 1.232-.878.869 0 1.216.662 1.216 1.634v3.865h2.401V9.25c0-2.22-1.184-3.252-2.764-3.252-1.274 0-1.845.7-2.165 1.193v.025h-.016l.016-.025V6.169h-2.4c.03.678 0 7.225 0 7.225z"/>
              </svg> <span>LinkedIn</span>
            </TrackedAnchor>
          </div>
        </div>
        <div className="folio-contact-details">
          <p>London or UK Remote</p>
          <p>Product design, systems thinking and careful execution.</p>
          <p>© {new Date().getFullYear()} Shaun Whiting</p>
        </div>
      </footer>
    </div>
  );
}
