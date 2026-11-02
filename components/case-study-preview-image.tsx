"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { ImageLightbox, type LightboxImage } from "./image-lightbox";
import { caseStudyMediaSizes } from "@/lib/case-study-media-sizes";
import type { CaseStudyMedia } from "@/lib/case-studies";

// Isolated preview adapter: retain the existing gallery while containing focus.
export function CaseStudyPreviewImage({ item, gallery, hero = false, textOnly }: { item: CaseStudyMedia; gallery: CaseStudyMedia[]; hero?: boolean; textOnly?: string }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const scope = useRef<HTMLDivElement>(null);
  const open = selectedIndex !== null;
  const images = useMemo<LightboxImage[]>(() => gallery.map(media => ({ src: media.src, alt: media.alt ?? media.caption, label: media.alt ?? media.caption, detail: media.caption })), [gallery]);
  const itemIndex = Math.max(0, gallery.findIndex(media => media.src === item.src));
  useEffect(() => {
    if (!open) return;
    const dialog = scope.current?.querySelector<HTMLElement>('[role="dialog"]');
    if (!dialog) return;
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const controls = () => Array.from(dialog.querySelectorAll<HTMLElement>('button, a[href], [tabindex]')).filter(el => el.tabIndex >= 0 && !el.hasAttribute('disabled') && el.getClientRects().length > 0);
    controls()[0]?.focus({ preventScroll: true });
    function trap(event: KeyboardEvent) {
      if (event.key !== "Tab") return;
      const items = controls(), first = items[0], last = items.at(-1);
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
    }
    function contain(event: FocusEvent) { if (event.target instanceof Node && !dialog!.contains(event.target)) controls()[0]?.focus({ preventScroll: true }); }
    document.addEventListener("keydown", trap, true); document.addEventListener("focusin", contain);
    return () => { document.removeEventListener("keydown", trap, true); document.removeEventListener("focusin", contain); if (previous?.isConnected) previous.focus({ preventScroll: true }); };
  }, [open]);
  return <>
    <button type="button" onClick={() => setSelectedIndex(itemIndex)} className={`group cursor-zoom-in text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-inset ${textOnly ? "underline underline-offset-4" : "block w-full"}`} aria-label={textOnly ?? `Open ${item.alt ?? item.caption}`}>
      {textOnly ?? <Image src={item.src} alt={item.alt ?? item.caption} width={caseStudyMediaSizes[item.src]?.width ?? 1800} height={caseStudyMediaSizes[item.src]?.height ?? 1100} priority={hero} sizes={hero ? "(min-width: 1600px) 1400px, (min-width: 1024px) 88vw, 94vw" : "100vw"} className="h-auto w-full transition duration-300 group-hover:scale-[1.01]" />}
    </button>
    {selectedIndex !== null ? <div ref={scope}><ImageLightbox images={images} selectedIndex={selectedIndex} onClose={() => setSelectedIndex(null)} onSelect={setSelectedIndex} /></div> : null}
  </>;
}
