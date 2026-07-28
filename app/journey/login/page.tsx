import LoginForm from "./login-form";
import EasyTNavigation from "../easyt-navigation";
import styles from "../account.module.css";
import { isEasyTAuthConfigured } from "@/lib/easyt/auth-environment";

export const metadata = { title: "Sign in · EasyT" };

export default async function EasyTLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; setup?: string }> }) {
  const { next, setup } = await searchParams;
  const callbackURL = next?.startsWith("/journey/") ? next : "/journey/dashboard";
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const configured = isEasyTAuthConfigured();
  return <main className={styles.page}>
    <EasyTNavigation current="login" />
    <div className={styles.authWrap}>
      <div className={styles.authGrid}>
        <section className={styles.authStory}>
          <div><p className={styles.eyebrow}>Your trips, kept together</p><h1>Go further.<br/>Lose less.</h1><p>Build the plan, shape every day and keep the useful details with you while you travel.</p></div>
          <div className={styles.storyList}><span><b>01</b> Living visual itineraries</span><span><b>02</b> Plans that update with you</span><span><b>03</b> One home for every trip</span></div>
        </section>
        <LoginForm callbackURL={callbackURL} googleEnabled={googleEnabled} configured={configured} showSetupNotice={setup === "required"} />
      </div>
    </div>
  </main>;
}
