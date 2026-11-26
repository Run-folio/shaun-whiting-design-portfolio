"use client";

import Image from "next/image";
import { useState } from "react";
import { ImageLightbox } from "@/components/image-lightbox";
import { cloudinaryImage, type TravelPhoto } from "@/lib/photography";

export function PhotographyGrid({ photos }: { photos: TravelPhoto[] }) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const selectedPhoto = selectedIndex === null ? null : photos[selectedIndex];

  return (
    <>
      <div className="personal-photo-grid">
        {photos.map((photo, index) => (
          <button
            key={photo.publicId}
            type="button"
            onClick={() => setSelectedIndex(index)}
            className="personal-photo-button"
            aria-label={`Open photo from ${photo.country}`}
          >
            <span className="personal-print">
              <Image
                src={cloudinaryImage(photo.publicId)}
                alt={`Travel photography from ${photo.country}`}
                fill
                onLoad={({ currentTarget: image }) => {
                  if (image.naturalHeight) {
                    image.closest("button")?.style.setProperty("--personal-photo-aspect", String(image.naturalWidth / image.naturalHeight));
                  }
                }}
                sizes="(min-width: 900px) 31vw, (min-width: 600px) 47vw, 94vw"
              />
            </span>
            <span className="personal-country">{photo.country}</span>
          </button>
        ))}
      </div>

      {selectedPhoto && selectedIndex !== null ? (
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
      ) : null}
    </>
  );
}
