import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import { notFound } from "next/navigation";
import { Navigation, Footer } from "@/components/ui";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { CaseStudyHeroMedia } from "@/components/case-study-hero-media";
import { CaseStudyAnalytics } from "@/components/case-study-analytics";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { CaseStudyRail } from "@/components/case-study-rail";
import { TrackedLink } from "@/components/tracked-link";
import type { CaseStudyMedia } from "@/lib/case-studies";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    return {
      title: "Case Study | Shaun Whiting",
    };
  }

  return {
    title: `${study.title} | Shaun Whiting`,
    description: study.summary,
    alternates: {
      canonical: `/case-study/${study.slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);

  if (!study) {
    notFound();
  }

  const currentIndex = caseStudies.findIndex((item) => item.slug === study.slug);
  const nextStudy = caseStudies[(currentIndex + 1) % caseStudies.length];
  const heroComparison = study.slug === "returns-kiosk" ? study.challengeComparisons?.[0] : undefined;

  const railItems = [
    { id: "overview", label: "Overview" },
    { id: "context", label: "Context" },
    { id: "challenge", label: "Challenge" },
    { id: "process", label: "Process" },
    { id: "impact", label: "Impact" },
    ...(study.nextSteps ? [{ id: "next-steps", label: "What's next" }] : []),
  ];

  return (
    <>
      <CaseStudyAnalytics slug={study.slug} title={study.shortTitle ?? study.title} />
      <Navigation />
      <CaseStudyRail items={railItems} />
      <main className="bg-paper text-ink dark:bg-[#0d0d0c] dark:text-[#f4f3ef]">
        <article>
          <header id="overview" className="px-6 pb-8 pt-28 sm:px-8 sm:pb-10 lg:px-20 lg:pt-32 xl:px-24">
            <div className="mx-auto max-w-[1400px]">
              <Link
                href="/#work"
                className="mb-8 inline-flex items-center gap-2 text-sm font-[480] tracking-[-0.01em] text-black/58 transition duration-200 hover:text-signal dark:text-white/58 dark:hover:text-signal lg:mb-10"
              >
                <ArrowLeft size={16} aria-hidden="true" />
                Back to selected work
              </Link>
              <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(320px,0.42fr)] lg:items-end lg:gap-14">
                <Reveal>
                  <p className="mb-5 font-mono text-xs uppercase tracking-[0.22em] text-signal">{study.eyebrow}</p>
                  <h1 className="max-w-5xl text-balance text-[clamp(3.15rem,6.6vw,7.1rem)] font-[310] leading-[0.94] tracking-[-0.055em]">
                    {study.title}
                    <span className="text-signal">.</span>
                  </h1>
                </Reveal>
                <Reveal delay={0.08} className="max-w-xl">
                  <p className="text-[clamp(1.3rem,1.75vw,2rem)] font-[330] leading-[1.23] tracking-[-0.025em]">
                    {study.summary}
                  </p>
                  <dl className="mt-8 grid gap-4 border-t border-black/10 pt-5 text-sm dark:border-white/10 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
                    <Meta label="Role" value={study.role} />
                    <Meta label="Team" value={study.team ?? study.industry} />
                    <Meta label="Duration" value={study.duration ?? study.year} />
                  </dl>
                </Reveal>
              </div>
            </div>
          </header>

          <section id="proof" className="px-6 pb-10 pt-2 sm:px-8 lg:px-20 lg:pb-16 xl:px-24">
            <div className="mx-auto max-w-[1400px]">
              <Reveal>
                {heroComparison ? (
                  <BeforeAfterSlider
                    before={heroComparison.before}
                    after={heroComparison.after}
                    label={heroComparison.label}
                  />
                ) : (
                  <CaseStudyHeroMedia image={study.image} imageAlt={study.imageAlt} metrics={study.metrics} />
                )}
              </Reveal>
            </div>
          </section>

          <section id="context" className="px-6 py-12 sm:px-8 sm:py-16 lg:px-20 lg:py-20 xl:px-24">
            <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[minmax(0,0.52fr)_minmax(420px,0.48fr)] lg:gap-14">
              <Reveal>
                <SectionEyebrow>Project overview</SectionEyebrow>
                <h2 className="mt-4 max-w-3xl text-balance text-4xl font-[340] leading-[1.06] tracking-[-0.03em] sm:text-5xl lg:text-[3.6rem]">
                  Problem, approach and outcome<span className="text-signal">.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.08} className="space-y-6 text-lg font-[330] leading-[1.48] tracking-[-0.01em] text-black/72 dark:text-white/72">
                {study.intro.challenge.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
                {study.intro.outcome.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </Reveal>
            </div>
            {study.overviewMedia?.length ? (
              <Reveal delay={0.1} className="mx-auto mt-10 max-w-[1400px]">
                <MediaGrid items={study.overviewMedia} />
              </Reveal>
            ) : null}
          </section>

          <section id="challenge" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-20 lg:py-28 xl:px-24">
            <div className="mx-auto max-w-[1400px]">
              <div className="grid gap-10 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16">
                <Reveal>
                  <SectionEyebrow>Challenge</SectionEyebrow>
                  <h2 className="text-3xl font-[340] leading-[1.08] tracking-[-0.025em] sm:text-4xl">
                    What needed to be solved<span className="text-signal">.</span>
                  </h2>
                </Reveal>
                <StaggerGroup
                  className={`grid gap-3 ${study.challengeMedia?.length || study.challengeComparisons?.length ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-2"}`}
                  staggerDelay={0.05}
                >
                  {study.challenges.map((challenge, index) => (
                    <StaggerItem
                      key={challenge}
                      className={
                        study.challengeMedia?.length || study.challengeComparisons?.length
                          ? "rounded-lg bg-mist p-5 text-lg font-[330] tracking-[-0.01em] ring-1 ring-transparent transition-[transform,box-shadow] duration-[180ms] ease-premium hover:-translate-y-[3px] hover:shadow-lift hover:ring-black/5 dark:bg-[#151514]"
                          : "flex items-start gap-4 rounded-lg bg-mist p-6 text-lg font-[330] tracking-[-0.01em] ring-1 ring-black/5 transition-[transform,box-shadow] duration-[180ms] ease-premium hover:-translate-y-[3px] hover:shadow-lift dark:bg-[#151514] dark:ring-white/10"
                      }
                    >
                      {study.challengeMedia?.length || study.challengeComparisons?.length ? (
                        challenge
                      ) : (
                        <>
                          <span className="font-mono text-xs leading-[1.8] text-signal">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                          <span>{challenge}</span>
                        </>
                      )}
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
              {!heroComparison && study.challengeComparisons?.length ? (
                <div className="mt-10 grid gap-6">
                  {study.challengeComparisons.map((comparison) => (
                    <Reveal key={comparison.label ?? comparison.before.src}>
                      <BeforeAfterSlider before={comparison.before} after={comparison.after} label={comparison.label} />
                    </Reveal>
                  ))}
                </div>
              ) : study.challengeMedia?.length ? (
                <Reveal delay={0.05}>
                  <MediaGrid items={study.challengeMedia} className="mt-10" />
                </Reveal>
              ) : null}
            </div>
          </section>

          <section id="process" className="border-y border-black/10 px-6 py-16 dark:border-white/10 sm:px-8 sm:py-20 lg:px-20 lg:py-28 xl:px-24">
            <div className="mx-auto max-w-[1400px]">
              <Reveal>
                <SectionEyebrow>Process and product decisions</SectionEyebrow>
              </Reveal>
              <div className="mt-8 grid gap-6">
                {study.sections.map((section, index) => (
                  <Reveal
                    key={`${section.title}-${index}`}
                    className="grid gap-8 border-t border-black/10 pt-8 dark:border-white/10 lg:grid-cols-[minmax(0,0.48fr)_minmax(320px,0.52fr)]"
                  >
                    <div>
                      {section.eyebrow ? (
                        <p className="mb-4 font-mono text-xs uppercase tracking-[0.18em] text-signal">{section.eyebrow}</p>
                      ) : null}
                      <h3 className="max-w-2xl text-balance text-3xl font-[340] leading-[1.08] tracking-[-0.025em] sm:text-4xl">
                        {section.title}
                      </h3>
                    </div>
                    <div>
                      {section.body ? (
                        section.bullets || section.media?.length ? (
                          <p className="text-xl font-[330] leading-[1.45] tracking-[-0.01em] text-black/72 dark:text-white/72">
                            {section.body}
                          </p>
                        ) : (
                          <div className="rounded-lg bg-block-lime p-7 text-ink sm:p-8">
                            <p className="text-balance text-[clamp(1.35rem,1.9vw,1.8rem)] font-[340] leading-[1.32] tracking-[-0.02em]">
                              {section.body}
                            </p>
                          </div>
                        )
                      ) : null}
                      {section.bullets ? (
                        <ul className="mt-6 grid gap-3">
                          {section.bullets.map((item) => (
                            <li key={item} className="flex gap-3 text-base font-[330] leading-[1.45] text-black/72 dark:text-white/72">
                              <Check className="mt-1 h-4 w-4 flex-none text-signal" aria-hidden="true" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                    {section.media?.length ? (
                      <div className="lg:col-span-2">
                        <MediaGrid items={section.media} />
                      </div>
                    ) : null}
                  </Reveal>
                ))}
              </div>
            </div>
          </section>

          <section id="impact" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-20 lg:py-28 xl:px-24">
            <div className="mx-auto grid max-w-[1200px] gap-6 lg:grid-cols-2">
              <Reveal>
                <ImpactList title="Quantitative impact" items={study.impact.quantitative} />
              </Reveal>
              <Reveal delay={0.08}>
                <ImpactList title="Qualitative impact" items={study.impact.qualitative} />
              </Reveal>
            </div>
          </section>

          {study.nextSteps ? (
            <section id="next-steps" className="px-6 pb-16 sm:px-8 sm:pb-20 lg:px-20 lg:pb-28 xl:px-24">
              <div className="mx-auto max-w-[1200px]">
                <Reveal>
                  <SectionEyebrow>Future opportunities</SectionEyebrow>
                </Reveal>
                <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-3" staggerDelay={0.07}>
                  {study.nextSteps.map((step) => (
                    <StaggerItem
                      key={step.title}
                      className="rounded-lg bg-mist p-6 ring-1 ring-transparent transition-[transform,box-shadow] duration-[180ms] ease-premium hover:-translate-y-[3px] hover:shadow-lift hover:ring-black/5 dark:bg-[#151514]"
                    >
                      <h3 className="text-xl font-[540] tracking-[-0.015em]">{step.title}</h3>
                      <p className="mt-3 text-base font-[330] leading-[1.45] text-black/64 dark:text-white/64">{step.text}</p>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </section>
          ) : null}

          <section className="px-6 pb-20 sm:px-8 lg:px-20 xl:px-24">
            <Reveal className="mx-auto max-w-[1200px]">
              <div className="rounded-lg border border-black/5 bg-block-lime/80 p-8 text-ink shadow-[0_20px_60px_rgba(0,0,0,0.08)] backdrop-blur-lg transition-[transform,box-shadow] duration-300 ease-premium hover:-translate-y-1 hover:shadow-[0_28px_80px_rgba(0,0,0,0.12)] dark:border-white/10 sm:p-10 lg:p-14">
                <p className="font-mono text-xs uppercase tracking-[0.18em]">Next case study</p>
                <div className="mt-8 flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
                  <h2 className="max-w-3xl text-balance text-4xl font-[340] leading-[1.06] tracking-[-0.03em] sm:text-5xl">
                    {nextStudy.title}
                    <span className="text-signal">.</span>
                  </h2>
                  <TrackedLink
                    href={`/case-study/${nextStudy.slug}`}
                    eventName="case_study_cta_clicked"
                    eventData={{
                      case_study_slug: nextStudy.slug,
                      case_study_title: nextStudy.shortTitle ?? nextStudy.title,
                      cta_label: "Read next",
                      location: "next_case_study",
                    }}
                    className="inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-ink px-5 text-[15px] font-[480] tracking-[-0.01em] text-white transition duration-200 hover:bg-signal focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-signal focus-visible:ring-offset-2 focus-visible:ring-offset-block-lime"
                  >
                    Read next <ArrowRight size={16} aria-hidden="true" />
                  </TrackedLink>
                </div>
              </div>
            </Reveal>
          </section>
        </article>
      </main>
      <Footer />
    </>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="font-mono text-[0.68rem] uppercase tracking-[0.18em] text-signal">{label}</dt>
      <dd className="mt-2 font-[330] leading-[1.35] text-black/70 dark:text-white/70">{value}</dd>
    </div>
  );
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">{children}</p>;
}

function ImpactList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="rounded-lg bg-mist p-6 dark:bg-[#151514] sm:p-8">
      <h2 className="text-3xl font-[340] leading-[1.08] tracking-[-0.025em]">{title}</h2>
      <ul className="mt-8 grid gap-4">
        {items.map((item) => (
          <li key={item} className="flex gap-3 text-base font-[330] leading-[1.45] text-black/72 dark:text-white/72">
            <Check className="mt-1 h-4 w-4 flex-none text-signal" aria-hidden="true" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function MediaFigure({ item }: { item: CaseStudyMedia }) {
  return (
    <figure className="overflow-hidden rounded-[24px] bg-mist dark:bg-white/6">
      <div
        className={
          item.type === "video"
            ? `relative ${item.portrait ? "mx-auto aspect-[9/16] max-h-[620px] max-w-[360px]" : "aspect-video"}`
            : "relative"
        }
      >
        {item.type === "video" ? (
          <video className="h-full w-full object-contain" controls muted playsInline preload="metadata">
            <source src={item.src} type="video/mp4" />
          </video>
        ) : (
          <Image
            src={item.src}
            alt={item.alt ?? item.caption}
            width={1800}
            height={1100}
            sizes="100vw"
            className="h-auto w-full"
          />
        )}
        {item.callouts?.length
          ? item.callouts.map((callout, index) => (
              <span
                key={`${callout.x}-${callout.y}-${callout.label}`}
                className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${callout.x}%`, top: `${callout.y}%` }}
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-signal font-mono text-xs font-[540] text-white shadow-[0_2px_10px_rgba(0,0,0,0.25)] ring-2 ring-white/80">
                  {index + 1}
                </span>
                <span className="pointer-events-none absolute left-9 top-1/2 w-max max-w-[220px] -translate-y-1/2 rounded-md bg-ink/92 px-3 py-1.5 text-xs font-[400] leading-snug text-white opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                  {callout.label}
                </span>
              </span>
            ))
          : null}
      </div>
      <figcaption className="border-t border-black/10 px-5 py-4 text-sm font-[330] leading-[1.45] text-black/62 dark:border-white/10 dark:text-white/62">
        {item.caption}
      </figcaption>
    </figure>
  );
}

function MediaGrid({ items, className = "" }: { items: CaseStudyMedia[]; className?: string }) {
  const wideItems = items.filter((item) => item.wide);
  const gridItems = items.filter((item) => !item.wide);
  const hasPortrait = gridItems.some((item) => item.portrait);

  return (
    <div className={`space-y-5 ${className}`}>
      {wideItems.map((item) => (
        <MediaFigure key={`${item.src}-${item.caption}`} item={item} />
      ))}
      {gridItems.length ? (
        <div className={`grid gap-5 ${hasPortrait ? "md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]" : ""}`}>
          {gridItems.map((item) => (
            <MediaFigure key={`${item.src}-${item.caption}`} item={item} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
