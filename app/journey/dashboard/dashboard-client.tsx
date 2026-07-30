"use client";

import Link from "next/link";
import { Archive, Copy, Edit3, Gift, MoreHorizontal, RotateCcw, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { EasyTTrip } from "@/lib/easyt/trip";
import { EasyTSegmentedControl } from "@/components/easyt/easyt-controls";
import { EasyTFeedback } from "@/components/easyt/easyt-feedback";
import styles from "../account.module.css";

export default function DashboardClient({ trips }: { trips: EasyTTrip[] }) {
  const router = useRouter();
  const [view, setView] = useState<"active" | "archived">("active");
  const [working, setWorking] = useState<string | null>(null);
  const [gifting, setGifting] = useState<EasyTTrip | null>(null);
  const [giftEmail, setGiftEmail] = useState("");
  const [giftNote, setGiftNote] = useState("");
  const [giftState, setGiftState] = useState<"idle" | "sending" | "complete">("idle");
  const [giftError, setGiftError] = useState("");
  const [claimUrl, setClaimUrl] = useState("");
  const [delivered, setDelivered] = useState(false);

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

  const openGift = (trip: EasyTTrip) => {
    setGifting(trip);
    setGiftEmail("");
    setGiftNote("");
    setGiftState("idle");
    setGiftError("");
    setClaimUrl("");
  };

  const sendGift = async () => {
    if (!gifting) return;
    setGiftState("sending");
    setGiftError("");
    const response = await fetch(`/api/easyt/trips/${encodeURIComponent(gifting.id)}/gift`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ email: giftEmail, note: giftNote }),
    });
    const payload = (await response.json()) as { error?: string; claimUrl?: string; delivered?: boolean };
    if (!response.ok || !payload.claimUrl) {
      setGiftState("idle");
      setGiftError(payload.error || "Unable to create invitation.");
      return;
    }
    setClaimUrl(payload.claimUrl);
    setDelivered(Boolean(payload.delivered));
    setGiftState("complete");
  };

  const copyClaimUrl = async () => {
    await navigator.clipboard.writeText(claimUrl);
  };

  const activeTrips = trips.filter((trip) => trip.status !== "archived");
  const archivedTrips = trips.filter((trip) => trip.status === "archived");
  const visibleTrips = view === "active" ? activeTrips : archivedTrips;

  return (
    <>
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
            <Link
              className={styles.tripCardLink}
              href={`/journey/plan?trip=${encodeURIComponent(trip.id)}`}
              aria-label={`Open ${trip.title}`}
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
            </Link>
            <div className={styles.tripFooter}>
              <div className={styles.tripActions}>
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
                  <button type="button" onClick={() => openGift(trip)}>
                    <Gift aria-hidden="true" />
                    Gift this trip
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
      {gifting ? (
        <div className={styles.giftOverlay} role="presentation" onMouseDown={() => setGifting(null)}>
          <section className={styles.giftDialog} role="dialog" aria-modal="true" aria-labelledby="gift-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className={styles.giftClose} type="button" onClick={() => setGifting(null)} aria-label="Close gift dialog"><X aria-hidden="true" /></button>
            <span className={styles.giftDialogIcon}><Gift aria-hidden="true" /></span>
            <p className={styles.eyebrow}>Gift an editable copy</p>
            <h2 id="gift-title">Share {gifting.title}</h2>
            {giftState === "complete" ? (
              <div className={styles.giftComplete}>
                <p>{delivered ? "Invitation sent. They can claim an editable copy from their email." : "Your invitation is ready. Copy the private claim link to send it yourself."}</p>
                <input value={claimUrl} readOnly aria-label="Gift claim link" />
                <button type="button" className={styles.primaryLink} onClick={copyClaimUrl}>Copy claim link</button>
              </div>
            ) : (
              <>
                <p className={styles.muted}>They’ll receive their own draft. Your plan is never changed.</p>
                <label className={styles.field}>
                  <span>Recipient email</span>
                  <input type="email" value={giftEmail} onChange={(event) => setGiftEmail(event.target.value)} placeholder="friend@example.com" autoComplete="email" />
                </label>
                <label className={styles.field}>
                  <span>Note (optional)</span>
                  <textarea value={giftNote} onChange={(event) => setGiftNote(event.target.value)} placeholder="A little head start for our next adventure…" maxLength={500} />
                </label>
                {giftError ? <p className={styles.syncError}>{giftError}</p> : null}
                <button type="button" className={styles.primaryLink} onClick={sendGift} disabled={giftState === "sending"}>{giftState === "sending" ? "Creating invite…" : "Create invitation"}</button>
              </>
            )}
          </section>
        </div>
      ) : null}
      <EasyTFeedback />
    </>
  );
}
