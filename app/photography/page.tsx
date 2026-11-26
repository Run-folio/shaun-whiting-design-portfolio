import Link from "next/link";
import { Footer, Navigation } from "@/components/ui";
import { travelPhotos } from "@/lib/photography";
import { PhotographyGrid } from "./photography-grid";
import "../personal-pages.css";

export const metadata = {
  title: "Photography | Shaun Whiting",
  description: "Travel photography from Shaun Whiting: places that made him slow down, look closer and pay attention.",
  alternates: { canonical: "/photography" },
};

export default function PhotographyPage() {
  return (
    <>
      <Navigation />
      <main id="main" className="personal-page">
        <section className="personal-masthead personal-gallery-mast" aria-labelledby="photos-heading">
          <div className="personal-frame">
            <div className="personal-gallery-intro">
              <h1 id="photos-heading">What I see<span>.</span></h1>
              <p>Places that made me slow down, look closer and pay attention.</p>
            </div>
          </div>
        </section>
        <section className="personal-frame personal-gallery" aria-label="Travel photographs by country">
          <PhotographyGrid photos={travelPhotos} />
          <Link className="personal-link personal-back" href="/more-about-me"><span aria-hidden="true">←</span> Back to Beyond Design</Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
