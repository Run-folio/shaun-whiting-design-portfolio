import Image from "next/image";
import Link from "next/link";
import { Footer, Navigation } from "@/components/ui";
import { cloudinaryImage, travelPhotos } from "@/lib/photography";

export const metadata = {
  title: "Photography | Shaun Whiting",
  description:
    "Travel photography from Shaun Whiting, captured across countries, mountains, cities and unfamiliar places.",
};

export default function PhotographyPage() {
  return (
    <>
      <Navigation />
      <main id="main" className="pt-[92px]">
        <section className="container-pad py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-end lg:gap-20">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-signal">Photography</p>
              <h1 className="max-w-5xl text-balance text-6xl font-[320] leading-[0.98] tracking-[-0.045em] text-ink dark:text-white sm:text-7xl lg:text-[7.6rem]">
                A few favourite moments<span className="text-signal">.</span>
              </h1>
            </div>
            <p className="max-w-2xl text-2xl font-[330] leading-[1.35] tracking-[-0.02em] text-ink dark:text-white sm:text-3xl">
              Places, textures and small details collected while moving through the world.
            </p>
          </div>
        </section>

        <section className="container-pad border-t border-black/10 py-14 dark:border-white/10 sm:py-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {travelPhotos.map((photo) => (
              <figure key={photo.publicId} className="group relative overflow-hidden rounded-[24px] bg-mist dark:bg-white/6">
                <div className="relative aspect-[3/2]">
                  <Image
                    src={cloudinaryImage(photo.publicId)}
                    alt={`Travel photography from ${photo.country}`}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover transition duration-300 group-hover:scale-[1.03]"
                  />
                </div>
                <figcaption className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-gradient-to-t from-black/62 via-black/18 to-transparent px-5 pb-5 pt-16 text-white">
                  <span className="text-lg font-[520] tracking-[-0.01em]">{photo.country}</span>
                  <span className="text-2xl leading-none" aria-hidden="true">
                    {photo.flag}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="container-pad pb-14 sm:pb-20">
          <Link
            href="/more-about-me"
            className="inline-flex rounded-full border border-ink px-6 py-3 text-base font-[520] tracking-[-0.01em] text-ink transition duration-200 hover:bg-ink hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-paper dark:border-white dark:text-white dark:hover:bg-white dark:hover:text-ink dark:focus-visible:ring-offset-[#0d0d0c]"
          >
            Back to Beyond Design
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
