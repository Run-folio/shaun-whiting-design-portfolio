"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { cloudinaryImage, type TravelPhoto } from "@/lib/photography";

export function PhotographyGrid({ photos }: { photos: TravelPhoto[] }) {
  const [selectedPhoto, setSelectedPhoto] = useState<TravelPhoto | null>(null);

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedPhoto(null);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <button
            key={photo.publicId}
            type="button"
            onClick={() => setSelectedPhoto(photo)}
            className="group relative overflow-hidden rounded-[24px] bg-mist text-left transition duration-200 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-paper dark:bg-white/6 dark:focus-visible:ring-offset-[#0d0d0c]"
            aria-label={`Open photo from ${photo.country}`}
          >
            <span className="relative block aspect-[4/3]">
              <Image
                src={cloudinaryImage(photo.publicId)}
                alt={`Travel photography from ${photo.country}`}
                fill
                sizes="(min-width: 1280px) 31vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover transition duration-300 group-hover:scale-[1.03]"
              />
            </span>
            <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/66 via-black/20 to-transparent px-5 pb-5 pt-20 text-white">
              <span className="text-lg font-[520] tracking-[-0.01em]">{photo.country}</span>
              <span className="text-2xl leading-none" aria-hidden="true">
                {photo.flag}
              </span>
            </span>
          </button>
        ))}
      </div>

      {selectedPhoto ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/82 p-4 backdrop-blur-sm sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`Photo from ${selectedPhoto.country}`}
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-[24px] bg-paper shadow-2xl dark:bg-[#11110f]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedPhoto(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-sm transition duration-200 hover:bg-signal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-black dark:bg-black dark:text-white"
              aria-label="Close photo"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <div className="relative h-[72vh] max-h-[780px] min-h-[320px] bg-black">
              <Image
                src={cloudinaryImage(selectedPhoto.publicId)}
                alt={`Travel photography from ${selectedPhoto.country}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="flex items-center justify-between px-5 py-4 sm:px-6">
              <p className="text-xl font-[520] tracking-[-0.015em] text-ink dark:text-white">
                {selectedPhoto.country}
              </p>
              <span className="text-3xl leading-none" aria-hidden="true">
                {selectedPhoto.flag}
              </span>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
