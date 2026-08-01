"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
  EasyTButton,
  EasyTField,
  EasyTSegmentedControl,
} from "@/components/easyt/easyt-controls";
import styles from "../account.module.css";

export default function LoginForm({
  callbackURL,
  googleEnabled,
  configured,
  showSetupNotice,
}: {
  callbackURL: string;
  googleEnabled: boolean;
  configured: boolean;
  showSetupNotice: boolean;
}) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">("sign-in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [signupSent, setSignupSent] = useState(false);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const email = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "Traveller");
    const result = mode === "sign-up"
      ? await authClient.signUp.email({ name, email, password, callbackURL })
      : await authClient.signIn.email({ email, password, callbackURL });
    if (result.error) { setError(result.error.message || "We couldn't complete that request."); setBusy(false); }
    else if (mode === "sign-up") { setSignupSent(true); setBusy(false); }
    else window.location.assign(callbackURL);
  };

  return <section className={styles.authPanel}>
    <p className={styles.eyebrow}>EasyT account</p>
    <h2>{mode === "sign-in" ? "Welcome back." : "Start travelling."}</h2>
    <p className={styles.muted}>{signupSent ? "Check your inbox to verify your email, then sign in to open your saved plans." : mode === "sign-in" ? "Open your saved plans and pick up where you left off." : "Save your first plan and keep every trip in one place."}</p>
    {(!configured || showSetupNotice) && <p className={styles.setupNotice}>Accounts are being connected to the live site. The Tokyo Marathon+ prototype and trip builder are still available.</p>}
    <EasyTSegmentedControl
      ariaLabel="Account action"
      className={styles.tabs}
      value={mode}
      onChange={(next) => { setMode(next); setError(""); }}
      options={[
        { label: "Sign in", value: "sign-in" },
        { label: "Create account", value: "sign-up" },
      ]}
    />
    {!signupSent && <form className={styles.form} onSubmit={submit}>
      {mode === "sign-up" && <EasyTField label="Your name" name="name" autoComplete="name" required placeholder="Shaun" />}
      <EasyTField label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" />
      <EasyTField label="Password" name="password" type="password" minLength={8} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required placeholder="At least 8 characters" />
      {mode === "sign-in" && <a className={styles.forgotLink} href="/journey/forgot-password">Forgot password?</a>}
      {error && <p className={styles.error}>{error}</p>}
      <EasyTButton type="submit" fullWidth loading={busy} disabled={!configured}>{configured ? mode === "sign-in" ? "Sign in →" : "Create account →" : "Accounts coming online"}</EasyTButton>
    </form>}
    {googleEnabled && <><div className={styles.divider}>or</div><EasyTButton variant="secondary" fullWidth onClick={() => authClient.signIn.social({ provider: "google", callbackURL })}>Continue with Google</EasyTButton></>}
  </section>;
}
