"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox";
import { cloudinaryImage, type TravelPhoto } from "@/lib/photography";

export function PhotographyGrid({
  photos,
  variant = "gallery",
}: {
  photos: TravelPhoto[];
  variant?: "featured" | "gallery";
}) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const openerRef = useRef<HTMLButtonElement>(null);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const isOpen = selectedIndex !== null;

  useEffect(() => {
    if (!isOpen) return;
    const opener = openerRef.current;
    lightboxRef.current?.querySelector<HTMLButtonElement>('button[aria-label="Close image"]')?.focus({ preventScroll: true });
    return () => opener?.focus({ preventScroll: true });
  }, [isOpen]);

  return (
    <>
      <div className={`personal-photo-grid personal-photo-grid--${variant}`}>
        {photos.map((photo, index) => (
          <button
            key={photo.publicId}
            type="button"
            onClick={(event) => { openerRef.current = event.currentTarget; setSelectedIndex(index); }}
            className="personal-photo-button"
            aria-label={`Open photo from ${photo.country}`}
          >
            <span className="personal-print">
              <Image
                src={cloudinaryImage(photo.publicId)}
                alt={`Travel photography from ${photo.country}`}
                fill
                sizes={variant === "featured"
                  ? "(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
                  : "(min-width: 1280px) 31vw, (min-width: 640px) 50vw, 100vw"}
              />
            </span>
            <span className="personal-photo-caption">
              <span className="personal-country">{photo.country}</span>
              <span className="personal-photo-flag" aria-hidden="true">{photo.flag}</span>
            </span>
          </button>
        ))}
      </div>

      {selectedIndex !== null ? (
        <div ref={lightboxRef} onKeyDown={(event) => {
          if (event.key !== "Tab") return;
          const controls = event.currentTarget.querySelectorAll<HTMLButtonElement>("button:not([disabled])");
          const first = controls[0];
          const last = controls[controls.length - 1];
          if (event.shiftKey && event.target === first) {
            event.preventDefault();
            last?.focus();
          } else if (!event.shiftKey && event.target === last) {
            event.preventDefault();
            first?.focus();
          }
        }}>
          <ImageLightbox
            images={photos.map((photo) => ({
              src: cloudinaryImage(photo.publicId),
              alt: `Travel photography from ${photo.country}`,
              label: photo.country,
              detail: photo.flag,
            }))}
            selectedIndex={selectedIndex}
            onClose={() => setSelectedIndex(null)}
            onSelect={setSelectedIndex}
          />
        </div>
      ) : null}
    </>
  );
}
