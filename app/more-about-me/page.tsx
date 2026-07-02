import Image from "next/image";
import type { ComponentType } from "react";
import { Camera, Globe2, Route } from "lucide-react";
import { Footer, Navigation } from "@/components/ui";

export const metadata = {
  title: "More about me | Shaun Whiting",
  description:
    "A more personal look at Shaun Whiting: running, travel, photography and the experiences that shape his product design practice.",
};

const cloudinaryImage = (publicId: string) =>
  `https://res.cloudinary.com/dbt3wkwa3/image/upload/f_auto,q_auto/${publicId}`;

const portraitImage = cloudinaryImage("v1744685819/shaun3_horawe.jpg");
const utmbImage = cloudinaryImage("398417558_1_l1mndf");

const photos = [
  { country: "Guatemala", publicId: "guatemala_jkuqfl" },
  { country: "Nepal", publicId: "nepal_pieful" },
  { country: "Iceland", publicId: "iceland_rmehmy" },
  { country: "Japan", publicId: "japan_tyklgc" },
  { country: "Argentina", publicId: "argentina_hyoz4x" },
  { country: "Namibia", publicId: "namibia_vwfyeb" },
  { country: "Peru", publicId: "peru_to7dtv" },
  { country: "Switzerland", publicId: "switzerland_qyppa0" },
  { country: "Australia", publicId: "australia_simevv" },
];

export default function MoreAboutMePage() {
  return (
    <>
      <Navigation />
      <main id="main" className="pt-[92px]">
        <section className="container-pad py-16 sm:py-24">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:items-start lg:gap-20">
            <div>
              <p className="mb-6 font-mono text-xs uppercase tracking-[0.16em] text-signal">More about me</p>
              <h1 className="max-w-5xl text-balance text-6xl font-[320] leading-[0.98] tracking-[-0.045em] text-ink dark:text-white sm:text-7xl lg:text-[7.6rem]">
                Outside work, movement keeps me curious<span className="text-signal">.</span>
              </h1>
            </div>
            <div className="grid gap-8">
              <figure className="overflow-hidden rounded-[24px] bg-mist dark:bg-white/6">
                <div className="relative aspect-square">
                  <Image
                    src={portraitImage}
                    alt="Shaun Whiting"
                    fill
                    priority
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover object-center"
                  />
                </div>
              </figure>
            </div>
          </div>
        </section>

        <section className="container-pad border-t border-black/10 py-14 dark:border-white/10 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-20">
            <SectionIntro icon={Route} eyebrow="Running" title="Endurance changed how I solve problems." />
            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:pt-[98px]">
              <div className="space-y-6 text-xl font-[330] leading-[1.45] tracking-[-0.01em] text-black/72 dark:text-white/72">
                <p>
                  At 21 I was told I&apos;d never walk again after a life-changing accident. Rebuilding taught me resilience, patience and long-term thinking.
                </p>
                <p>
                  Today I run marathons and ultras. Like product design, progress comes from understanding the terrain, adapting and improving over time.
                </p>
              </div>
              <figure className="overflow-hidden rounded-[24px] bg-mist dark:bg-white/6">
                <div className="relative aspect-[4/3]">
                  <Image
                    src={utmbImage}
                    alt="Shaun Whiting running UTMB 100k in the mountains"
                    fill
                    sizes="(min-width: 1024px) 420px, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-black/10 px-5 py-4 font-mono text-xs uppercase tracking-[0.14em] text-black/58 dark:border-white/10 dark:text-white/58">
                  UTMB 100K 2024
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <section className="container-pad border-t border-black/10 py-14 dark:border-white/10 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-20">
            <SectionIntro icon={Globe2} eyebrow="Travel" title="75 countries visited." />
            <p className="max-w-3xl text-xl font-[330] leading-[1.45] tracking-[-0.01em] text-black/72 dark:text-white/72 lg:pt-[98px]">
              Travel keeps me curious about how people move, decide and adapt to different environments. Those observations continue to shape how I think about products.
            </p>
          </div>
        </section>

        <section className="container-pad border-t border-black/10 py-14 dark:border-white/10 sm:py-20">
          <div className="mb-10 grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)_420px] lg:gap-20">
            <SectionIntro icon={Camera} eyebrow="Photography" title="A few favourite moments." />
            <p className="text-xl font-[330] leading-[1.45] tracking-[-0.01em] text-black/72 dark:text-white/72 lg:pt-[98px]">
              Photography slows me down. It helps me notice texture, rhythm, people, weather and the quiet details that are easy to miss.
            </p>
            <div aria-hidden="true" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {photos.map((photo) => (
              <figure
                key={photo.publicId}
                className="overflow-hidden rounded-[24px] bg-mist dark:bg-white/6"
              >
                <div className="relative aspect-[3/2]">
                  <Image
                    src={cloudinaryImage(photo.publicId)}
                    alt={`Travel photography from ${photo.country}`}
                    fill
                    sizes="(min-width: 1024px) 31vw, (min-width: 640px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
                <figcaption className="border-t border-black/10 px-5 py-4 font-mono text-xs uppercase tracking-[0.14em] text-black/58 dark:border-white/10 dark:text-white/58">
                  {photo.country}
                </figcaption>
              </figure>
            ))}
          </div>
        </section>

        <section className="container-pad py-14 sm:py-20">
          <div className="rounded-[24px] bg-block-lime p-8 text-ink sm:p-12 lg:p-16">
            <div className="max-w-5xl">
              <p className="font-mono text-xs uppercase tracking-[0.16em]">Personal thread</p>
              <p className="mt-8 text-balance text-4xl font-[330] leading-[1.08] tracking-[-0.035em] sm:text-5xl lg:text-6xl">
                The same curiosity that takes me into mountains and unfamiliar places is the thing I bring back into product work.
              </p>
              <a
                href="/#work"
                className="mt-10 inline-flex rounded-full bg-ink px-6 py-3 text-base font-[520] tracking-[-0.01em] text-white transition duration-200 hover:bg-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-4 focus-visible:ring-offset-block-lime"
              >
                Explore my work →
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function SectionIntro({
  icon: Icon,
  eyebrow,
  title,
}: {
  icon: ComponentType<{ size?: number; strokeWidth?: number; "aria-hidden"?: boolean }>;
  eyebrow: string;
  title: string;
}) {
  return (
    <div>
      <div className="mb-5 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-ink dark:bg-white/12 dark:text-white">
        <Icon size={19} strokeWidth={1.7} aria-hidden={true} />
      </div>
      <p className="mb-5 font-mono text-xs uppercase tracking-[0.16em] text-signal">{eyebrow}</p>
      <h2 className="max-w-sm text-balance text-4xl font-[340] leading-[1.06] tracking-[-0.03em] text-ink dark:text-white sm:text-5xl">
        {title}
      </h2>
    </div>
  );
}
