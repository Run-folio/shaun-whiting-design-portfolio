"use client";

import { FormEvent, useState } from "react";
import { authClient } from "@/lib/auth-client";
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
    else window.location.assign(callbackURL);
  };

  return <section className={styles.authPanel}>
    <p className={styles.eyebrow}>EasyT account</p>
    <h2>{mode === "sign-in" ? "Welcome back." : "Start travelling."}</h2>
    <p className={styles.muted}>{mode === "sign-in" ? "Open your saved plans and pick up where you left off." : "Save your first plan and keep every trip in one place."}</p>
    {(!configured || showSetupNotice) && <p className={styles.setupNotice}>Accounts are being connected to the live site. The Tokyo Marathon+ prototype and trip builder are still available.</p>}
    <div className={styles.tabs} role="tablist">
      <button className={mode === "sign-in" ? styles.active : ""} type="button" onClick={() => { setMode("sign-in"); setError(""); }}>Sign in</button>
      <button className={mode === "sign-up" ? styles.active : ""} type="button" onClick={() => { setMode("sign-up"); setError(""); }}>Create account</button>
    </div>
    <form className={styles.form} onSubmit={submit}>
      {mode === "sign-up" && <label className={styles.field}><span>Your name</span><input name="name" autoComplete="name" required placeholder="Shaun" /></label>}
      <label className={styles.field}><span>Email</span><input name="email" type="email" autoComplete="email" required placeholder="you@example.com" /></label>
      <label className={styles.field}><span>Password</span><input name="password" type="password" minLength={8} autoComplete={mode === "sign-in" ? "current-password" : "new-password"} required placeholder="At least 8 characters" /></label>
      {error && <p className={styles.error}>{error}</p>}
      <button className={styles.button} disabled={busy || !configured}>{busy ? "Working…" : configured ? mode === "sign-in" ? "Sign in →" : "Create account →" : "Accounts coming online"}</button>
    </form>
    {googleEnabled && <><div className={styles.divider}>or</div><button className={styles.secondary} type="button" onClick={() => authClient.signIn.social({ provider: "google", callbackURL })}>Continue with Google</button></>}
  </section>;
}
