import { Footer, Navigation } from "@/components/ui";
import { AlternativeHome, AlternativeContact } from "@/components/home-alternative";
import "./home-alt/home-alt.css";

export default function Home() {
  return <div className="alternative-page">
    <Navigation />
    <main id="main" className="home-alternative"><AlternativeHome /><AlternativeContact /></main>
    <Footer />
  </div>;
}
