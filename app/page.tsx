import { Footer } from "@/components/ui";
import { AlternativeNavigation } from "@/components/alternative-navigation";
import { AlternativeHome, AlternativeContact } from "@/components/home-alternative";
import "./home-alt/home-alt.css";

export default function Home() {
  return <div className="alternative-page">
    <AlternativeNavigation />
    <main id="main" className="home-alternative"><AlternativeHome /><AlternativeContact /></main>
    <Footer />
  </div>;
}
