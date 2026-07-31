"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Languages,
  LogOut,
  Map,
  Plus,
  UserRound,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { clearActiveTrip } from "@/lib/easyt/storage";
import { EasyTLinkButton } from "@/components/easyt/easyt-controls";
import styles from "./easyt-navigation.module.css";

type EasyTNavigationProps = {
  current?: "prototype" | "trips" | "new" | "login" | "profile";
  account?: { name?: string | null; email: string; language?: Language };
};

const copy = {
  en: {
    prototype: "Prototype",
    trips: "My trips",
    newTrip: "New trip",
    account: "Account",
    profile: "Profile",
    language: "Language",
    signOut: "Sign out",
  },
  es: {
    prototype: "Prototipo",
    trips: "Mis viajes",
    newTrip: "Nuevo viaje",
    account: "Cuenta",
    profile: "Perfil",
    language: "Idioma",
    signOut: "Cerrar sesión",
  },
} as const;

type Language = keyof typeof copy;

export default function EasyTNavigation({
  current,
  account,
}: EasyTNavigationProps) {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const [language, setLanguage] = useState<Language>("en");

  useEffect(() => {
    if (account?.language) {
      setLanguage(account.language);
      window.localStorage.setItem("easyt-language", account.language);
      document.documentElement.lang = account.language;
      return;
    }
    const saved = window.localStorage.getItem("easyt-language");
    if (saved === "en" || saved === "es") setLanguage(saved);
  }, [account?.language]);

  const changeLanguage = (next: Language) => {
    setLanguage(next);
    window.localStorage.setItem("easyt-language", next);
    document.documentElement.lang = next;
    if (activeAccount) {
      void fetch("/api/easyt/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ language: next }),
      });
    }
  };

  const signOut = async () => {
    await authClient.signOut();
    router.push("/journey/login");
    router.refresh();
  };

  const labels = copy[language];
  const activeAccount =
    account ||
    (session?.user
      ? { name: session.user.name, email: session.user.email }
      : undefined);
  const accountLabel =
    activeAccount?.name?.trim() || activeAccount?.email || labels.account;

  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.portfolio}
        onClick={() => {
          if (window.history.length > 1) router.back();
          else router.push("/journey/dashboard");
        }}
        aria-label="Go back"
      >
        <ArrowLeft aria-hidden="true" />
        <span>Back</span>
      </button>

      <Link
        className={styles.brand}
        href="/journey/dashboard"
        aria-label="EasyT — My trips"
      >
        <span>Easy</span>
        <b>T</b>
      </Link>

      <nav className={styles.actions} aria-label="EasyT navigation">
        <EasyTLinkButton
          className={`${styles.quietLink} ${current === "prototype" ? styles.current : ""}`}
          href="/journey"
          icon={Map}
          size="small"
          variant="secondary"
        >
          <span>{labels.prototype}</span>
        </EasyTLinkButton>
        <EasyTLinkButton
          className={`${styles.quietLink} ${styles.tripsLink} ${current === "trips" ? styles.current : ""}`}
          href="/journey/dashboard"
          size="small"
          variant="secondary"
        >
          <span>{labels.trips}</span>
        </EasyTLinkButton>
        {current !== "new" ? (
          <EasyTLinkButton
            className={styles.primaryLink}
            href="/journey/new"
            icon={Plus}
            size="small"
            onClick={() => clearActiveTrip()}
          >
            <span>{labels.newTrip}</span>
          </EasyTLinkButton>
        ) : null}
        {activeAccount ? (
          <details className={styles.accountMenu}>
            <summary
              className={`${styles.accountTrigger} ${current === "profile" ? styles.current : ""}`}
            >
              <span className={styles.avatar}>
                {accountLabel.slice(0, 1).toUpperCase()}
              </span>
              <span className={styles.accountName}>{accountLabel}</span>
              <ChevronDown aria-hidden="true" />
            </summary>
            <div className={styles.accountPopover}>
              <div className={styles.accountIdentity}>
                <strong>{activeAccount.name || labels.account}</strong>
                <span>{activeAccount.email}</span>
              </div>
              <Link href="/journey/profile">
                <UserRound aria-hidden="true" />
                <span>{labels.profile}</span>
              </Link>
              <label className={styles.languageControl}>
                <Languages aria-hidden="true" />
                <span>{labels.language}</span>
                <select
                  value={language}
                  onChange={(event) =>
                    changeLanguage(event.target.value as Language)
                  }
                  aria-label={labels.language}
                >
                  <option value="en">English</option>
                  <option value="es">Español</option>
                </select>
              </label>
              <button type="button" onClick={signOut}>
                <LogOut aria-hidden="true" />
                <span>{labels.signOut}</span>
              </button>
            </div>
          </details>
        ) : current !== "login" ? (
          <Link
            className={styles.accountTrigger}
            href="/journey/dashboard"
            aria-label={labels.account}
          >
            <UserRound aria-hidden="true" />
            <span className={styles.accountName}>{labels.account}</span>
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
