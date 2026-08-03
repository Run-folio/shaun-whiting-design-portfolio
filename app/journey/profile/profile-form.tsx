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
      {message ? (
        <p className={styles.profileMessage} role="status">
          {message}
        </p>
      ) : null}
    </div>
  );
}
