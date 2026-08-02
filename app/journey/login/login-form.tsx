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
  initialMode,
  initialEmail,
  verificationSent,
}: {
  callbackURL: string;
  googleEnabled: boolean;
  configured: boolean;
  showSetupNotice: boolean;
  initialMode?: "sign-in" | "sign-up";
  initialEmail?: string;
  verificationSent?: boolean;
}) {
  const [mode, setMode] = useState<"sign-in" | "sign-up">(initialMode ?? "sign-in");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState(initialEmail ?? "");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    const data = new FormData(event.currentTarget);
    const submittedEmail = String(data.get("email") || "");
    const password = String(data.get("password") || "");
    const name = String(data.get("name") || "Traveller");
    const result = mode === "sign-up"
      ? await authClient.signUp.email({ name, email, password, callbackURL })
      : await authClient.signIn.email({ email: submittedEmail, password, callbackURL });
    if (result.error) { setError(result.error.message || "We couldn't complete that request."); setBusy(false); }
    else if (mode === "sign-up") {
      window.location.assign(`/journey/login?next=${encodeURIComponent(callbackURL)}&email=${encodeURIComponent(submittedEmail)}&sent=1`);
    }
    else window.location.assign(callbackURL);
  };

  return <section className={styles.authPanel}>
    <p className={styles.eyebrow}>EasyT account</p>
    <h2>{mode === "sign-in" ? "Welcome back." : "Start travelling."}</h2>
    <p className={styles.muted}>{verificationSent ? `We sent a verification link to ${initialEmail || "your email"}. Confirm it, then sign in below.` : mode === "sign-in" ? "Open your saved plans and pick up where you left off." : "Save your first plan and keep every trip in one place."}</p>
    {(!configured || showSetupNotice) && <p className={styles.setupNotice}>Accounts are being connected to the live site. The Tokyo Marathon+ prototype and trip builder are still available.</p>}
    <EasyTSegmentedControl
      ariaLabel="Account action"
      className={styles.tabs}
      value={mode}
      onChange={(next) => { setMode(next); setError(""); }}
      options={[
        { label: "Sign in", value: "sign-in" },
        { label: "New here?", value: "sign-up" },
      ]}
    />
    <form className={styles.form} onSubmit={submit}>
      {mode === "sign-up" && <EasyTField label="Your name" name="name" autoComplete="name" required placeholder="Shaun" />}
      <EasyTField label="Email" name="email" type="email" autoComplete="email" required placeholder="you@example.com" value={email} onChange={(event) => setEmail(event.target.value)} />
      <EasyTField label="Password" name="password" type="password" minLength={8} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required placeholder="At least 8 characters" />
      {mode === "sign-in" && <a className={styles.forgotLink} href="/journey/forgot-password">Forgot password?</a>}
      {error && <p className={styles.error}>{error}</p>}
      <EasyTButton type="submit" fullWidth loading={busy} disabled={!configured}>{configured ? mode === "sign-in" ? "Sign in →" : "Create account →" : "Accounts coming online"}</EasyTButton>
    </form>
    {googleEnabled && <><div className={styles.divider}>or</div><EasyTButton variant="secondary" fullWidth onClick={() => authClient.signIn.social({ provider: "google", callbackURL })}>Continue with Google</EasyTButton></>}
  </section>;
}
