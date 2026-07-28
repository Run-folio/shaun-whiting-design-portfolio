"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { authClient } from "@/lib/auth-client";
import { clearActiveTrip } from "@/lib/easyt/storage";
import type { EasyTTrip } from "@/lib/easyt/trip";
import styles from "../account.module.css";

export default function DashboardClient({ trips, controlsOnly = false }: { trips: EasyTTrip[]; controlsOnly?: boolean }) {
  const router = useRouter();
  const [deleting, setDeleting] = useState<string | null>(null);
  if (controlsOnly) return <div className={styles.dashActions}>
    <Link className={styles.primaryLink} href="/journey/new" onClick={() => clearActiveTrip()}>+ New trip</Link>
    <button className={styles.secondary} onClick={async () => { await authClient.signOut(); router.push("/journey/login"); router.refresh(); }}>Sign out</button>
  </div>;

  const remove = async (id: string) => {
    if (!window.confirm("Remove this saved trip?")) return;
    setDeleting(id);
    const response = await fetch(`/api/easyt/trips/${encodeURIComponent(id)}`, { method: "DELETE" });
    setDeleting(null);
    if (response.ok) router.refresh();
  };

  return <div className={styles.tripGrid}>
    {trips.map((trip) => <article key={trip.id} className={`${styles.tripCard} ${deleting === trip.id ? styles.loading : ""}`}>
      <div className={styles.tripMeta}><span>{trip.status}</span><span>{trip.startDate} → {trip.endDate}</span></div>
      <h2>{trip.title}</h2>
      <p className={styles.tripStops}>{trip.stops.map((stop) => stop.name).join(" → ") || "Your route is waiting."}</p>
      <div className={styles.tripFooter}><Link href={`/journey/new?trip=${encodeURIComponent(trip.id)}`}>Open plan →</Link><button className={styles.danger} onClick={() => remove(trip.id)} disabled={deleting === trip.id}>Delete</button></div>
    </article>)}
    {!trips.length && <div className={styles.empty}><h2>Your first trip starts here.</h2><p className={styles.muted}>Turn a few destinations into a plan you can actually travel with.</p><Link className={styles.primaryLink} href="/journey/new" onClick={() => clearActiveTrip()}>Build a trip →</Link></div>}
  </div>;
}
