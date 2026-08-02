import LoginForm from "./login-form";
import EasyTNavigation from "../easyt-navigation";
import styles from "../account.module.css";
import { isEasyTAuthConfigured } from "@/lib/easyt/auth-environment";

export const metadata = { title: "Sign in · EasyT" };

export default async function EasyTLoginPage({ searchParams }: { searchParams: Promise<{ next?: string; setup?: string; mode?: string; email?: string; sent?: string }> }) {
  const { next, setup, mode, email, sent } = await searchParams;
  const callbackURL = next?.startsWith("/journey/") ? next : "/journey/dashboard";
  const googleEnabled = Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  const configured = isEasyTAuthConfigured();
  const initialMode = mode === "sign-up" ? "sign-up" : "sign-in";
  return <main className={styles.page}>
    <EasyTNavigation current="login" />
    <div className={styles.authWrap}>
      <div className={styles.authGrid}>
        <section className={styles.authStory}>
          <div><p className={styles.eyebrow}>EasyT · travel companion</p><h1>Plan once.<br/>Travel better.</h1><p>Build a living itinerary, keep every detail in reach, and make decisions together as you go.</p></div>
          <div className={styles.storyList}><span>A map that follows every day</span><span>Real places, useful timing</span><span>Restaurants and stays in context</span></div>
        </section>
          <LoginForm callbackURL={callbackURL} googleEnabled={googleEnabled} configured={configured} showSetupNotice={setup === "required"} initialMode={sent === "1" ? "sign-in" : initialMode} initialEmail={email} verificationSent={sent === "1"} />
      </div>
    </div>
  </main>;
}
