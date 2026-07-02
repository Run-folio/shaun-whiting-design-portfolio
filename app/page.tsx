import {
  AboutPreview,
  Contact,
  FeaturedWork,
  Footer,
  Hero,
  Navigation,
  RunningAdventure,
} from "@/components/ui";

export default function Home() {
  return (
    <>
      <Navigation />
      <main id="main">
        <Hero />
        <AboutPreview />
        <FeaturedWork />
        <RunningAdventure />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
