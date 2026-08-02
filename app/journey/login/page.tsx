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
          <div><p className={styles.eyebrow}>EasyT · travel planning</p><h1>Plan with confidence.<br/>Travel with context.</h1></div>
          <div className={styles.storyList}><span><b>01</b> A map for every day</span><span><b>02</b> Real places, not placeholders</span><span><b>03</b> Useful details when you need them</span></div>
        </section>
        <LoginForm callbackURL={callbackURL} googleEnabled={googleEnabled} configured={configured} showSetupNotice={setup === "required"} />
      </div>
    </div>
  </main>;
}
