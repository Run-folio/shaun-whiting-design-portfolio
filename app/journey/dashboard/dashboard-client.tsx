"use client";

import Link from "next/link";
import { Archive, Copy, Edit3, MoreHorizontal, RotateCcw, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { EasyTTrip } from "@/lib/easyt/trip";
import { loadActiveTrip, saveActiveTrip, saveTripToEasyT } from "@/lib/easyt/storage";
import { EasyTSegmentedControl } from "@/components/easyt/easyt-controls";
import styles from "../account.module.css";

export default function DashboardClient({ trips }: { trips: EasyTTrip[] }) {
  const router = useRouter();
  const [view, setView] = useState<"active" | "archived">("active");
  const [working, setWorking] = useState<string | null>(null);
  const [localSync, setLocalSync] = useState<"idle" | "saving" | "error">("idle");
  const [localSyncError, setLocalSyncError] = useState("");

  useEffect(() => {
    const localTrip = loadActiveTrip();
    if (!localTrip || trips.some((trip) => trip.id === localTrip.id)) return;

    let active = true;
    setLocalSync("saving");
    void saveTripToEasyT(localTrip)
      .then((saved) => {
        if (!active) return;
        saveActiveTrip(saved);
        router.refresh();
      })
      .catch((error: unknown) => {
        if (!active) return;
        setLocalSyncError(error instanceof Error ? error.message : "We couldn't add this device's plan to your account.");
        setLocalSync("error");
      });

    return () => { active = false; };
  }, [router, trips]);

  const runAction = async (
    id: string,
    action: "archive" | "restore" | "duplicate",
  ) => {
    setWorking(id);
    const response = await fetch(`/api/easyt/trips/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ action }),
    });
    setWorking(null);
    if (response.ok) router.refresh();
  };

  const remove = async (id: string) => {
    if (!window.confirm("Remove this saved trip?")) return;
    setWorking(id);
    const response = await fetch(`/api/easyt/trips/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    setWorking(null);
    if (response.ok) router.refresh();
  };

  const activeTrips = trips.filter((trip) => trip.status !== "archived");
  const archivedTrips = trips.filter((trip) => trip.status === "archived");
  const visibleTrips = view === "active" ? activeTrips : archivedTrips;

  return (
    <>
      {localSync === "saving" && (
        <p className={styles.syncMessage}>Adding this device's latest plan to your account…</p>
      )}
      {localSync === "error" && (
        <p className={styles.syncError}>Your plan is safe on this device, but it could not be added to your account: {localSyncError}</p>
      )}
      <EasyTSegmentedControl
        ariaLabel="Trip status"
        className={styles.tripViews}
        value={view}
        onChange={setView}
        options={[
          { label: "Active", value: "active", count: activeTrips.length },
          { label: "Archived", value: "archived", count: archivedTrips.length },
        ]}
      />
      <div className={styles.tripGrid}>
        {visibleTrips.map((trip) => (
          <article
            key={trip.id}
            className={`${styles.tripCard} ${working === trip.id ? styles.loading : ""}`}
          >
            <div className={styles.tripMeta}>
              <span>{trip.status}</span>
              <span>
                {trip.startDate} → {trip.endDate}
              </span>
            </div>
            <h2>{trip.title}</h2>
            <p className={styles.tripStops}>
              {trip.stops.map((stop) => stop.name).join(" → ") ||
                "Your route is waiting."}
            </p>
            <div className={styles.tripFooter}>
              <div className={styles.tripActions}>
                <Link href={`/journey/plan?trip=${encodeURIComponent(trip.id)}`}>
                  {trip.status === "archived" ? "View plan" : "Open plan"} →
                </Link>
                <Link
                  className={styles.editTripLink}
                  href={`/journey/new?trip=${encodeURIComponent(trip.id)}`}
                >
                  <Edit3 aria-hidden="true" />
                  Edit trip
                </Link>
              </div>
              <details className={styles.tripMenu}>
                <summary aria-label={`Actions for ${trip.title}`}>
                  <MoreHorizontal aria-hidden="true" />
                </summary>
                <div>
                  {trip.status === "archived" ? (
                    <button
                      type="button"
                      onClick={() => runAction(trip.id, "restore")}
                    >
                      <RotateCcw aria-hidden="true" />
                      Restore
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => runAction(trip.id, "archive")}
                    >
                      <Archive aria-hidden="true" />
                      Archive
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => runAction(trip.id, "duplicate")}
                  >
                    <Copy aria-hidden="true" />
                    Duplicate
                  </button>
                  <button
                    type="button"
                    className={styles.tripDelete}
                    onClick={() => remove(trip.id)}
                  >
                    <Trash2 aria-hidden="true" />
                    Delete
                  </button>
                </div>
              </details>
            </div>
          </article>
        ))}
        {!visibleTrips.length && (
          <div className={styles.empty}>
            <h2>
              {view === "archived"
                ? "Nothing archived."
                : "Your first trip starts here."}
            </h2>
            <p className={styles.muted}>
              {view === "archived"
                ? "Trips you archive will stay safely available here."
                : "Use “New trip” in the header to turn a few destinations into a plan you can actually travel with."}
            </p>
          </div>
        )}
      </div>
    </>
  );
}
