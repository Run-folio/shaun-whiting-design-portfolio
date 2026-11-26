import Image from "next/image";
import Link from "next/link";
import { Footer, Navigation } from "@/components/ui";
import { cloudinaryImage, featuredTravelPhotos } from "@/lib/photography";
import { PhotographyGrid } from "../photography/photography-grid";
import "../personal-pages.css";

export const metadata = {
  title: "More about me | Shaun Whiting",
  description: "A more personal look at Shaun Whiting: running, travel, photography and the experiences that shape his product design practice.",
  alternates: { canonical: "/more-about-me" },
};

const portraitImage = cloudinaryImage("v1744685819/shaun3_horawe.jpg");
const utmbImage = cloudinaryImage("398417558_1_l1mndf");

export default function MoreAboutMePage() {
  return (
    <>
      <Navigation />
      <main id="main" className="personal-page">
        <section className="personal-masthead" aria-labelledby="beyond-heading">
          <div className="personal-frame personal-portrait-layout">
            <div>
              <p className="personal-kicker">Beyond Design</p>
              <h1 id="beyond-heading">Outside work, movement keeps me curious<span>.</span></h1>
            </div>
            <figure className="personal-portrait">
              <Image src={portraitImage} alt="Shaun Whiting" fill priority sizes="(min-width: 900px) 320px, (min-width: 640px) 25vw, 140px" />
            </figure>
          </div>
        </section>

        <section className="personal-frame personal-run" aria-labelledby="running-heading">
          <figure className="personal-race-photo">
            <Image src={utmbImage} alt="Shaun Whiting running UTMB 100k in the mountains" fill sizes="(min-width: 820px) 49vw, 96vw" />
            <figcaption>UTMB 100K 2024</figcaption>
          </figure>
          <div className="personal-run-copy">
            <p className="personal-kicker">Running</p>
            <h2 id="running-heading">Endurance changed how I solve problems<span>.</span></h2>
            <p>At 21 I was told I&apos;d never walk again after a life-changing accident. Rebuilding taught me resilience, patience and long-term thinking.</p>
            <p>Today I run marathons and ultras. Like product design, progress comes from understanding the terrain, adapting and improving over time.</p>
          </div>
        </section>

        <section className="personal-frame personal-travel" aria-labelledby="travel-heading">
          <div className="personal-section-line">
            <p className="personal-kicker">Travel photography</p>
            <Link className="personal-link" href="/photography">See all photos <span aria-hidden="true">→</span></Link>
          </div>
          <div className="personal-travel-intro">
            <h2 id="travel-heading">75 countries visited<span>.</span></h2>
            <p>Travel keeps me curious about how people move, decide and adapt to different environments. Photography slows me down and helps me notice texture, rhythm, weather and the quiet details that shape everyday experiences.</p>
          </div>
          <PhotographyGrid photos={featuredTravelPhotos} variant="featured" />
        </section>

        <section className="personal-frame personal-thread">
          <p className="personal-kicker">Personal thread</p>
          <p>The same curiosity that takes me into mountains and unfamiliar places is the thing I bring back into product work.</p>
          <Link className="personal-link" href="/#work">Explore my work <span aria-hidden="true">→</span></Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
