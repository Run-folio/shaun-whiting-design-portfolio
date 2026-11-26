import { ArrowRight, Layers3, UserRound, UsersRound } from "lucide-react";
import { BeforeAfterSlider } from "@/components/before-after-slider";
import { CaseStudyAnalytics } from "@/components/case-study-analytics";
import { CaseStudyPreviewImage as CaseStudyImage } from "@/components/case-study-preview-image";
import { Reveal, StaggerGroup, StaggerItem } from "@/components/motion";
import { Footer, Navigation } from "@/components/ui";
import { TrackedLink } from "@/components/tracked-link";
import { ViewportVideo } from "@/components/viewport-video";
import type { CaseStudy, CaseStudyMedia } from "@/lib/case-studies";
import { caseStudyPresentation, caseStudyEyebrow, presentCaseStudyMedia } from "@/lib/case-study-presentation";
import { caseStudyMediaPlan } from "@/lib/case-study-media-plan";

export function CaseStudyDetail({ study, nextStudy }: { study: CaseStudy; nextStudy: CaseStudy }) {
  const { hero: heroMedia, intro, outcomeScope } = caseStudyPresentation(study);
  const displayTitle = study.slug === "returns-platform" ? "Doddle Returns Platform" : study.shortTitle ?? study.title;
  const isMorrovia = study.slug === "morrovia";
  const usesStructuredDecisions = isMorrovia || study.slug === "rio" || study.slug === "returns-kiosk" || study.slug === "returns-platform";
  const { sections, walkthrough, gallery: imageGallery } = caseStudyMediaPlan(study, heroMedia);
  const decisions = usesStructuredDecisions
    ? sections.filter((section) => section.eyebrow?.toLowerCase().startsWith("decision"))
    : sections.filter((section) => section.eyebrow?.toLowerCase() !== "process");
  const callout = sections.find((section) => {
    const eyebrow = section.eyebrow?.toLowerCase() ?? "";
    return eyebrow.includes("tradeoff") || eyebrow.includes("foundation");
  });
  const processSection = sections.find((section) => section.eyebrow?.toLowerCase() === "process");


  const visionSection = isMorrovia ? sections.find((section) => section.eyebrow === "Product vision") : undefined;
  const buildingSection = isMorrovia ? sections.find((section) => section.eyebrow === "AI-assisted building") : undefined;

  return (
    <>
      <CaseStudyAnalytics slug={study.slug} title={study.shortTitle ?? study.title} />
      <Navigation />
      <main id="main" className="case-detail">
        <article>
          <header id="overview" className="case-detail-opening">
            <div className="case-detail-container">
              <p className="case-detail-eyebrow">{caseStudyEyebrow(study)}</p>
              <h1>{displayTitle}<span>.</span></h1>
              <p className="case-detail-summary">{intro}</p>
              <dl id="scope" className="case-detail-scope">
                <Meta label="Role" icon={UserRound} value={study.slug === "returns-platform" ? "Founding Product Designer · " + study.role : study.role} />
                <Meta label="Company" icon={Layers3} value={study.duration ?? study.year} />
                <Meta label={study.team ? "Context" : "Industry"} icon={UsersRound} value={study.team ?? study.industry} />
              </dl>
            </div>
          </header>
          <StatBand metrics={study.metrics} scope={outcomeScope} title={displayTitle} qualitative={isMorrovia} />
          <nav className="case-detail-jumps case-detail-container" aria-label="Case study sections">
            <a href="#context">Overview</a>
            {decisions.length ? <a href="#decisions">Decisions</a> : null}
            <a href="#impact">Impact</a>
          </nav>
          <section id="context" className="case-detail-context case-detail-container" aria-label="Project overview">
            <div className="case-detail-feature">
              <figure id="artifact" className="case-detail-product">
                <CaseStudyImage item={heroMedia} gallery={imageGallery} hero />
              </figure>
              <div className="case-detail-challenge">
                <h2 className="case-detail-challenge-title">The challenge</h2>
                {study.slug === "returns-platform" ? <p className="case-detail-challenge-lead">Make paperless returns work for customers, merchants and store teams.</p> : null}
                {study.intro.challenge.map(paragraph => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </div>
            <div className="case-detail-abstract">
              <TldrColumn title="What I did" paragraphs={study.intro.approach ?? [study.role]} />
              <TldrColumn title="The outcome" paragraphs={study.intro.outcome} />
            </div>
          </section>

          {visionSection ? (
            <section id="vision" className="px-6 pb-14 sm:px-8 lg:px-20 xl:px-24">
              <Reveal className="mx-auto max-w-[1200px]">
                <SectionEyebrow>Product vision</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-[340] leading-[1.08] tracking-[-0.025em]">{visionSection.title}</h2>
                <p className="mt-6 max-w-4xl text-lg font-[330] leading-[1.55] text-black/72">{visionSection.body}</p>
              </Reveal>
            </section>
          ) : null}

          {walkthrough ? (
            <section id="walkthrough" className="bg-mist px-6 py-14 sm:px-8 sm:py-16 lg:px-20 lg:py-20 xl:px-24">
              <Reveal className="mx-auto max-w-[1100px]">
                <SectionEyebrow>Workflow in motion</SectionEyebrow>
                <div className="mt-6"><MediaFigure item={{ ...walkthrough, wide: true }} gallery={imageGallery} /></div>
              </Reveal>
            </section>
          ) : null}

          {decisions.length ? (
            <section id="decisions" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-20 lg:py-28 xl:px-24">
              <div className="mx-auto max-w-[1200px] space-y-20">
                {decisions.map((section, index) => (
                  <DecisionSection key={section.title} section={section} index={index} gallery={imageGallery} />
                ))}
              </div>
            </section>
          ) : null}

          {callout ? (
            <section className="border-y border-black/10 px-6 py-14 sm:px-8 lg:px-20 xl:px-24">
              <Reveal className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)] lg:items-start">
                <div>
                  <SectionEyebrow>{callout.eyebrow ?? "Callout"}</SectionEyebrow>
                  <h2 className="mt-4 max-w-sm text-balance text-3xl font-[340] leading-[1.08] tracking-[-0.025em]">
                    {callout.title}
                    <span className="text-signal">.</span>
                  </h2>
                </div>
                <div className="case-detail-callout p-7 sm:p-8">
                  <p className="text-balance text-[clamp(1.15rem,1.6vw,1.55rem)] font-[340] leading-[1.34] tracking-[-0.02em]">
                    {callout.body}
                  </p>
                </div>
              </Reveal>
            </section>
          ) : null}

          {buildingSection ? (
            <section id="building" className="border-y border-black/10 px-6 py-14 sm:px-8 lg:px-20 xl:px-24">
              <Reveal className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)]">
                <div>
                  <SectionEyebrow>AI-assisted building</SectionEyebrow>
                  <h2 className="mt-4 text-3xl font-[340] leading-[1.08] tracking-[-0.025em]">{buildingSection.title}</h2>
                </div>
                <p className="text-lg font-[330] leading-[1.55] text-black/72">{buildingSection.body}</p>
              </Reveal>
            </section>
          ) : null}

          <section id="impact" className="px-6 py-16 sm:px-8 sm:py-20 lg:px-20 lg:py-24 xl:px-24">
            <Reveal className="mx-auto grid max-w-[1200px] gap-8 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)]">
              <div>
                <SectionEyebrow>{isMorrovia ? "Beta outcomes" : "Impact"}</SectionEyebrow>
                <h2 className="mt-4 text-3xl font-[340] leading-[1.08] tracking-[-0.025em]">
                  {isMorrovia ? "What the beta shows so far" : "What changed"}<span className="text-signal">.</span>
                </h2>
              </div>
              <ImpactTable items={[...study.impact.quantitative, ...study.impact.qualitative]} />
            </Reveal>
          </section>

          {processSection ? (
            <section id="process" className="border-t border-black/10 px-6 py-14 sm:px-8 lg:px-20 xl:px-24">
              <Reveal className="mx-auto max-w-[1200px]">
                <div className="grid gap-8 lg:grid-cols-[minmax(0,0.32fr)_minmax(0,0.68fr)]">
                  <div>
                    <SectionEyebrow>{processSection.eyebrow ?? "Process"}</SectionEyebrow>
                    <h2 className="mt-4 max-w-xs text-balance text-2xl font-[340] leading-[1.1] tracking-[-0.02em]">
                      {processSection.title}
                    </h2>
                  </div>
                  <div>
                    {processSection.body ? (
                      <p className="max-w-4xl text-base font-[330] leading-[1.55] tracking-[-0.01em] text-black/68">
                        {processSection.body}
                      </p>
                    ) : null}
                    {processSection.media?.length ? (
                      <MediaGrid items={processSection.media} gallery={imageGallery} className="mt-8" compact />
                    ) : null}
                  </div>
                </div>
              </Reveal>
            </section>
          ) : null}

          {study.nextSteps ? (
            <section id="next-steps" className="px-6 pb-16 sm:px-8 sm:pb-20 lg:px-20 lg:pb-28 xl:px-24">
              <div className="mx-auto max-w-[1200px]">
                <Reveal>
                  <SectionEyebrow>{isMorrovia ? "Lessons and next steps" : "Future opportunities"}</SectionEyebrow>
                </Reveal>
                <StaggerGroup className="mt-8 grid gap-4 md:grid-cols-3" staggerDelay={0.07}>
                  {study.nextSteps.map((step) => (
                    <StaggerItem
                      key={step.title}
                      className="rounded-lg bg-mist p-6 ring-1 ring-transparent transition-[transform,box-shadow] duration-[180ms] ease-premium hover:-translate-y-[3px] hover:shadow-lift hover:ring-black/5"
                    >
                      <h3 className="text-xl font-[540] tracking-[-0.015em]">{step.title}</h3>
                      <p className="mt-3 text-base font-[330] leading-[1.45] text-black/64">{step.text}</p>
                    </StaggerItem>
                  ))}
                </StaggerGroup>
              </div>
            </section>
          ) : null}

          <section className="px-6 pb-20 pt-14 sm:px-8 lg:px-20 xl:px-24">
            <Reveal className="mx-auto max-w-[1200px]">
              <div className="case-detail-next p-8 sm:p-10 lg:p-14">
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
                    className="case-detail-next-link inline-flex min-h-11 w-fit items-center gap-2 rounded-full px-5 text-[15px]"
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

function Meta({ label, value, icon: Icon }: { label: string; value: string; icon: typeof UserRound }) {
  return <div><dt><span className="sr-only">{label}</span><Icon size={17} aria-hidden="true" /></dt><dd>{value}</dd></div>;
}

function SectionEyebrow({ children }: { children: React.ReactNode }) {
  return <p className="font-mono text-xs uppercase tracking-[0.18em] text-signal">{children}</p>;
}

function StatBand({ metrics, scope, title, qualitative = false }: { metrics: Array<{ value: string; label: string }>; scope?: string; title: string; qualitative?: boolean }) {
  return (
    <section aria-label={`${title} ${qualitative ? "product highlights" : "outcomes"}`} className={`case-detail-outcomes case-detail-container${qualitative ? " case-detail-highlights" : ""}`}>
      <dl className="case-detail-outcomes-grid">
        {metrics.map(metric => <div key={metric.label}>
          <dt>{metric.label}</dt><dd>{metric.value}</dd>
        </div>)}
      </dl>
      {scope ? <p className="case-detail-outcome-scope">{scope}</p> : null}
    </section>
  );
}

function TldrColumn({ title, paragraphs }: { title: string; paragraphs: string[] }) {
  return (
    <Reveal>
      <h2 className="case-detail-eyebrow mb-4">{title}</h2>
      <div className="space-y-4 text-base font-[330] leading-[1.5] tracking-[-0.01em] text-black/72">
        {paragraphs.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </Reveal>
  );
}

function DecisionSection({
  section,
  index,
  gallery,
}: {
  section: {
    eyebrow?: string;
    title: string;
    body?: string;
    resultChip?: string;
    bullets?: string[];
    media?: CaseStudyMedia[];
    comparison?: { before: CaseStudyMedia; after: CaseStudyMedia; label?: string; beforeLabel?: string; afterLabel?: string };
  };
  index: number;
  gallery: CaseStudyMedia[];
}) {
  const media = section.media;
  const text = (
    <div className="max-w-xl">
      {section.eyebrow ? <p className="mb-5 font-mono text-xs uppercase tracking-[0.18em] text-signal">{section.eyebrow}</p> : null}
      <h2 className="text-balance text-3xl font-[340] leading-[1.08] tracking-[-0.025em] sm:text-4xl">
        {section.title}
        <span className="text-signal">.</span>
      </h2>
      {section.body ? (
        <div className="mt-5 space-y-4 text-base font-[330] leading-[1.55] tracking-[-0.01em] text-black/70">
          {splitDecisionBody(section.body).map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      ) : null}
      {section.bullets?.length ? <ul className="mt-5 list-disc space-y-2 pl-5 text-base font-[330] leading-[1.55] text-black/70">{section.bullets.map(point => <li key={point}>{point}</li>)}</ul> : null}
      {section.resultChip ? (
        <p className="case-detail-chip mt-6 inline-block px-3 py-2 font-mono text-[0.68rem] font-[540] uppercase tracking-[0.08em]">
          {section.resultChip}
        </p>
      ) : null}
    </div>
  );
  const visual = section.comparison || media?.length ? (
    <div className="space-y-6">
      {section.comparison ? <BeforeAfterSlider before={section.comparison.before} after={section.comparison.after} label={section.comparison.label} beforeLabel={section.comparison.beforeLabel} afterLabel={section.comparison.afterLabel} gallery={gallery} /> : null}
      {media?.length ? <MediaGrid items={media} gallery={gallery} /> : null}
    </div>
  ) : null;

  if (!visual) return <Reveal>{text}</Reveal>;

  return (
    <Reveal className="grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-14">
      {index % 2 === 0 ? (
        <>
          {text}
          {visual}
        </>
      ) : (
        <>
          <div className="lg:order-2 lg:justify-self-end">{text}</div>
          <div className="lg:order-1">{visual}</div>
        </>
      )}
    </Reveal>
  );
}

function splitDecisionBody(body: string) {
  const sentences = body.match(/[^.!?]+[.!?]+/g);
  if (!sentences || sentences.length < 3) {
    return [body];
  }

  const midpoint = Math.ceil(sentences.length / 2);
  return [sentences.slice(0, midpoint).join(" ").trim(), sentences.slice(midpoint).join(" ").trim()];
}

function ImpactTable({ items }: { items: string[] }) {
  return (
    <div className="grid gap-x-10 lg:grid-cols-2">
      {items.map((item) => {
        if (!item.includes("|") && !/:\s/.test(item)) return <div key={item} className="border-t border-black/12 py-4 text-sm font-[330] leading-[1.5] text-black/72">{item}</div>;
        const [label, value] = item.includes("|") ? item.split("|") : item.split(/:\s(.+)/);

        return (
          <div key={item} className="grid grid-cols-[minmax(0,1fr)_auto] gap-6 border-t border-black/12 py-4 text-sm">
            <p className="font-[330] leading-[1.35] text-black/62">{label}</p>
            <p className="text-right font-[560] leading-[1.35] text-ink">{value ?? ""}</p>
          </div>
        );
      })}
    </div>
  );
}

function MediaFigure({ item: originalItem, gallery }: { item: CaseStudyMedia; gallery?: CaseStudyMedia[] }) {
  const item = presentCaseStudyMedia(originalItem);
  gallery = gallery ?? [item];
  return (
    <figure data-portrait={item.portrait || undefined} className="overflow-hidden rounded-lg bg-mist">
      <div
        className={
          item.type === "video" || item.type === "embed"
            ? `relative ${
                item.portrait
                  ? "mx-auto aspect-[9/16] w-[min(100%,640px)] min-w-0"
                  : "aspect-video"
              }`
            : "relative"
        }
      >
        {item.type === "video" ? (
          <ViewportVideo src={item.src} poster={item.poster} autoplayOnView={item.autoplayOnView} className="h-full w-full object-contain" />
        ) : item.type === "embed" ? (
          <iframe
            src={item.src}
            title={item.alt ?? item.caption}
            allowFullScreen
            className="h-full w-full border-0"
            loading="lazy"
          />
        ) : (
          <CaseStudyImage item={item} gallery={gallery} />
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
      <figcaption className="border-t border-black/10 px-5 py-4 text-sm font-[330] leading-[1.45] text-black/62">
        {item.caption}
      </figcaption>
    </figure>
  );
}

function HeroArtifact({ desktop, mobile, gallery }: { desktop: CaseStudyMedia; mobile: CaseStudyMedia; gallery: CaseStudyMedia[] }) {
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-t-lg sm:aspect-[16/5]">
      <div className="absolute inset-0 sm:hidden">
        <CaseStudyImage item={mobile} gallery={gallery} />
      </div>
      <div className="absolute inset-0 hidden sm:block">
        <CaseStudyImage item={desktop} gallery={gallery} />
      </div>
    </div>
  );
}

function MediaGrid({
  items,
  gallery,
  className = "",
  compact = false,
}: {
  items: CaseStudyMedia[];
  gallery: CaseStudyMedia[];
  className?: string;
  compact?: boolean;
}) {
  const wideItems = items.filter((item) => item.wide);
  const gridItems = items.filter((item) => !item.wide);
  const hasPortrait = gridItems.some((item) => item.portrait);

  return (
    <div className={`space-y-5 ${className}`}>
      {wideItems.map((item) => (
        <MediaFigure key={`${item.src}-${item.caption}`} item={item} gallery={gallery} />
      ))}
      {gridItems.length ? (
        <div
          className={`grid gap-5 ${
            compact
              ? "sm:grid-cols-3"
              : hasPortrait && gridItems.length > 1
                ? "md:grid-cols-[minmax(0,1fr)_minmax(260px,360px)]"
                : gridItems.length > 1
                  ? "sm:grid-cols-2"
                  : ""
          }`}
        >
          {gridItems.map((item) => (
            <MediaFigure key={`${item.src}-${item.caption}`} item={item} gallery={gallery} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
