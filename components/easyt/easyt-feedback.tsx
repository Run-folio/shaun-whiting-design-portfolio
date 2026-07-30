"use client";

import { useEffect, useState } from "react";
import { MessageCircleHeart, X } from "lucide-react";

import styles from "@/app/journey/account.module.css";

const faces = ["😞", "🙁", "😐", "🙂", "😍"];
const storageKey = "easyt-dashboard-feedback-dismissed";

export function EasyTFeedback() {
  const [dismissed, setDismissed] = useState(false);
  const [rating, setRating] = useState<number | null>(null);
  const [comment, setComment] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");

  useEffect(() => {
    setDismissed(localStorage.getItem(storageKey) === "1");
  }, []);

  const close = () => {
    localStorage.setItem(storageKey, "1");
    setDismissed(true);
  };

  const send = async () => {
    if (!rating) return;
    setState("sending");
    try {
      const response = await fetch("/api/easyt/feedback", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (!response.ok) throw new Error();
      setState("sent");
      window.setTimeout(close, 1600);
    } catch {
      localStorage.setItem("easyt-dashboard-feedback-draft", JSON.stringify({ rating, comment }));
      setState("error");
    }
  };

  if (dismissed) return null;
  return <aside className={styles.feedback} aria-label="Share feedback">
    <button className={styles.feedbackClose} type="button" onClick={close} aria-label="Dismiss feedback"><X size={15} /></button>
    {state === "sent" ? <><strong>Thank you.</strong><p>Your feedback helps shape EasyT.</p></> : <>
      <span className={styles.feedbackIcon}><MessageCircleHeart size={17} /></span>
      <strong>How’s EasyT feeling?</strong>
      <p>Quick rating, optional note.</p>
      <div className={styles.feedbackFaces} role="radiogroup" aria-label="Rate EasyT from 1 to 5">
        {faces.map((face, index) => <button key={face} type="button" className={rating === index + 1 ? styles.feedbackFaceActive : ""} onClick={() => { setRating(index + 1); setState("idle"); }} aria-label={`${index + 1} out of 5`} aria-pressed={rating === index + 1}>{face}</button>)}
      </div>
      {rating ? <>
        <textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Anything we could improve? (optional)" maxLength={1000} />
        <button type="button" className={styles.feedbackSend} onClick={send} disabled={state === "sending"}>{state === "sending" ? "Sending…" : "Send feedback"}</button>
      </> : null}
      {state === "error" ? <small>Saved privately on this device — try again later.</small> : null}
    </>}
  </aside>;
}
