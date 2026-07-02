"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { cloudinaryImage, type TravelPhoto } from "@/lib/photography";

export function PhotographyGrid({ photos }: { photos: TravelPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto = selectedIndex === null ? null : photos[selectedIndex];

  const showPreviousPhoto = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return currentIndex === 0 ? photos.length - 1 : currentIndex - 1;
    });
  }, [photos.length]);

  const showNextPhoto = useCallback(() => {
    setSelectedIndex((currentIndex) => {
      if (currentIndex === null) {
        return currentIndex;
      }

      return currentIndex === photos.length - 1 ? 0 : currentIndex + 1;
    });
  }, [photos.length]);

  useEffect(() => {
    if (!selectedPhoto) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
      }

      if (event.key === "ArrowLeft") {
        showPreviousPhoto();
      }

      if (event.key === "ArrowRight") {
        showNextPhoto();
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedPhoto, showNextPhoto, showPreviousPhoto]);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo, index) => (
          <button
            key={photo.publicId}
            type="button"
            onClick={() => setSelectedIndex(index)}
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
          onClick={() => setSelectedIndex(null)}
        >
          <div
            className="relative w-full max-w-6xl overflow-hidden rounded-[24px] bg-paper shadow-2xl dark:bg-[#11110f]"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedIndex(null)}
              className="absolute right-4 top-4 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink shadow-sm transition duration-200 hover:bg-signal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-black dark:bg-black dark:text-white"
              aria-label="Close photo"
            >
              <X size={20} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showPreviousPhoto}
              className="absolute left-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-ink shadow-sm transition duration-200 hover:bg-signal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-black dark:bg-black/80 dark:text-white"
              aria-label="Previous photo"
            >
              <ChevronLeft size={24} strokeWidth={2} aria-hidden="true" />
            </button>
            <button
              type="button"
              onClick={showNextPhoto}
              className="absolute right-4 top-1/2 z-10 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/92 text-ink shadow-sm transition duration-200 hover:bg-signal hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-black dark:bg-black/80 dark:text-white"
              aria-label="Next photo"
            >
              <ChevronRight size={24} strokeWidth={2} aria-hidden="true" />
            </button>
            <div className="relative h-[64vh] max-h-[720px] min-h-[300px] bg-black">
              <Image
                src={cloudinaryImage(selectedPhoto.publicId)}
                alt={`Travel photography from ${selectedPhoto.country}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>
            <div className="px-5 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <p className="text-xl font-[520] tracking-[-0.015em] text-ink dark:text-white">
                  {selectedPhoto.country}
                </p>
                <div className="flex items-center gap-4">
                  <span className="font-mono text-xs uppercase tracking-[0.16em] text-black/48 dark:text-white/48">
                    {(selectedIndex ?? 0) + 1} / {photos.length}
                  </span>
                  <span className="text-3xl leading-none" aria-hidden="true">
                    {selectedPhoto.flag}
                  </span>
                </div>
              </div>
              <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
                {photos.map((photo, index) => {
                  const isSelected = index === selectedIndex;

                  return (
                    <button
                      key={photo.publicId}
                      type="button"
                      onClick={() => setSelectedIndex(index)}
                      className={`relative h-14 w-20 shrink-0 overflow-hidden rounded-[10px] transition duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-[#11110f] ${
                        isSelected ? "ring-2 ring-signal" : "opacity-60 hover:opacity-100"
                      }`}
                      aria-label={`Show ${photo.country}`}
                      aria-current={isSelected}
                    >
                      <Image
                        src={cloudinaryImage(photo.publicId)}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
