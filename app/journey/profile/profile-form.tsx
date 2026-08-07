"use client";

import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import {
  EasyTButton,
  EasyTField,
  EasyTSelect,
} from "@/components/easyt/easyt-controls";
import styles from "../account.module.css";
import { easytCopy } from "@/lib/easyt/i18n";
import { type TravelProfile } from "@/lib/easyt/travel-profile";

export default function ProfileForm({
  name: initialName,
  email,
  initialLanguage,
  initialTravelProfile,
}: {
  name: string;
  email: string;
  initialLanguage: "en" | "es";
  initialTravelProfile: TravelProfile;
}) {
  const [name, setName] = useState(initialName);
  const [language, setLanguage] = useState(initialLanguage);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [travelProfile, setTravelProfile] = useState<TravelProfile>(initialTravelProfile);
  const copy = easytCopy[language];

  useEffect(() => {
    window.localStorage.setItem("easyt-language", initialLanguage);
    document.documentElement.lang = initialLanguage;
    const updateLanguage = (event: Event) => setLanguage((event as CustomEvent<"en" | "es">).detail);
    window.addEventListener("easyt-language-change", updateLanguage);
    return () => window.removeEventListener("easyt-language-change", updateLanguage);
  }, [initialLanguage]);

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setMessage("");
    const result = await authClient.updateUser({ name });
    setSaving(false);
    setMessage(
      result.error
        ? result.error.message || "Profile could not be updated."
        : "Profile updated.",
    );
  };

  const saveLanguage = async (next: "en" | "es") => {
    setLanguage(next);
    window.localStorage.setItem("easyt-language", next);
    document.documentElement.lang = next;
    const response = await fetch("/api/easyt/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language: next }),
    });
    setMessage(
      response.ok
        ? "Language preference saved."
        : "Language preference could not be saved.",
    );
  };

  const saveTravelProfile = async () => {
    setSaving(true);
    const response = await fetch("/api/easyt/profile", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ language, travelProfile }),
    });
    if (response.ok) window.localStorage.setItem("easyt-travel-profile", JSON.stringify(travelProfile));
    setSaving(false);
    setMessage(response.ok ? "Travel preferences saved. EasyT will use them as a starting point for new trips." : "Travel preferences could not be saved.");
  };

  return (
    <div className={styles.profileGrid}>
      <form className={styles.profileCard} onSubmit={save}>
        <h2>{copy.account.personal}</h2>
        <EasyTField label={copy.account.name} value={name} onChange={(event) => setName(event.target.value)} />
        <EasyTField label={copy.account.email} value={email} disabled readOnly />
        <EasyTButton type="submit" loading={saving}>{copy.account.saveProfile}</EasyTButton>
      </form>
      <section className={styles.profileCard}>
        <h2>{copy.account.preferences}</h2>
        <EasyTSelect
          label="Language"
          value={language}
          onChange={(event) => saveLanguage(event.target.value as "en" | "es")}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </EasyTSelect>
        <p className={styles.muted}>{copy.account.languageHint}</p>
      </section>
      <section className={`${styles.profileCard} ${styles.travelProfileCard}`}>
        <p className={styles.eyebrow}>YOUR TRAVEL PROFILE</p>
        <h2>What makes a trip feel good?</h2>
        <p className={styles.muted}>EasyT uses these as a starting point. You can always override them on any trip.</p>
        <EasyTSelect label="Pace" value={travelProfile.pace} onChange={(event) => setTravelProfile((current) => ({ ...current, pace: event.target.value as TravelProfile["pace"] }))}>
          <option value="slow">Slow mornings and room to wander</option><option value="balanced">A balanced rhythm</option><option value="full">Full days, plenty to see</option>
        </EasyTSelect>
        <EasyTSelect label="What pulls you in" value={travelProfile.priority} onChange={(event) => setTravelProfile((current) => ({ ...current, priority: event.target.value as TravelProfile["priority"] }))}>
          <option value="food">Local food and neighbourhoods</option><option value="nature">Nature and time outside</option><option value="culture">Culture, history and design</option><option value="mix">A little of everything</option>
        </EasyTSelect>
        <EasyTSelect label="Hotel moves" value={travelProfile.hotelMoves} onChange={(event) => setTravelProfile((current) => ({ ...current, hotelMoves: event.target.value as TravelProfile["hotelMoves"] }))}>
          <option value="few">Keep them to a minimum</option><option value="some">A few is fine</option><option value="open">I’ll move for the right place</option>
        </EasyTSelect>
        <EasyTSelect label="Comfort level" value={travelProfile.budget} onChange={(event) => setTravelProfile((current) => ({ ...current, budget: event.target.value as TravelProfile["budget"] }))}>
          <option value="value">Good value</option><option value="mid">Mid-range</option><option value="high">Best available</option>
        </EasyTSelect>
        <EasyTButton type="button" loading={saving} onClick={saveTravelProfile}>Save travel profile</EasyTButton>
      </section>
      {message ? (
        <p className={styles.profileMessage} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
