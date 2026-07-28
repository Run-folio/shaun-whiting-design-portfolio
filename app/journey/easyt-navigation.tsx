import Link from "next/link";
import { ArrowLeft, Map, Plus } from "lucide-react";
import styles from "./easyt-navigation.module.css";

type EasyTNavigationProps = {
  current?: "prototype" | "trips" | "new" | "login";
};

export default function EasyTNavigation({ current }: EasyTNavigationProps) {
  return (
    <header className={styles.header}>
      <Link className={styles.portfolio} href="/">
        <ArrowLeft aria-hidden="true" />
        <span>Shaun Whiting</span>
      </Link>

      <Link className={styles.brand} href="/journey/dashboard" aria-label="EasyT — My trips">
        <span>Easy</span><b>T</b>
      </Link>

      <nav className={styles.actions} aria-label="EasyT navigation">
        <Link className={`${styles.quietLink} ${current === "prototype" ? styles.current : ""}`} href="/journey">
          <Map aria-hidden="true" /><span>Prototype</span>
        </Link>
        <Link className={`${styles.quietLink} ${current === "trips" ? styles.current : ""}`} href="/journey/dashboard">
          <span>My trips</span>
        </Link>
        {current !== "new" ? (
          <Link className={styles.primaryLink} href="/journey/new">
            <Plus aria-hidden="true" /><span>New trip</span>
          </Link>
        ) : null}
      </nav>
    </header>
  );
}
