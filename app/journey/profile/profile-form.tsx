"use client";

import { useEffect, useState, type FormEvent } from "react";
import { authClient } from "@/lib/auth-client";
import {
  EasyTButton,
  EasyTField,
  EasyTSelect,
} from "@/components/easyt/easyt-controls";
import styles from "../account.module.css";

export default function ProfileForm({
  name: initialName,
  email,
  initialLanguage,
}: {
  name: string;
  email: string;
  initialLanguage: "en" | "es";
}) {
  const [name, setName] = useState(initialName);
  const [language, setLanguage] = useState(initialLanguage);
  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    window.localStorage.setItem("easyt-language", initialLanguage);
    document.documentElement.lang = initialLanguage;
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

  return (
    <div className={styles.profileGrid}>
      <form className={styles.profileCard} onSubmit={save}>
        <h2>Personal details</h2>
        <EasyTField label="Name" value={name} onChange={(event) => setName(event.target.value)} />
        <EasyTField label="Email" value={email} disabled readOnly />
        <EasyTButton type="submit" loading={saving}>Save profile</EasyTButton>
      </form>
      <section className={styles.profileCard}>
        <h2>Preferences</h2>
        <EasyTSelect
          label="Language"
          value={language}
          onChange={(event) => saveLanguage(event.target.value as "en" | "es")}
        >
          <option value="en">English</option>
          <option value="es">Español</option>
        </EasyTSelect>
        <p className={styles.muted}>
          Your navigation language follows your EasyT account. Full trip
          translation can follow as the product grows.
        </p>
      </section>
      {message ? (
        <p className={styles.profileMessage} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
