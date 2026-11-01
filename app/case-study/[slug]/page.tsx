import { notFound } from "next/navigation";
import { CaseStudyDetail } from "@/components/case-study-detail";
import { caseStudies, getCaseStudy } from "@/lib/case-studies";
import { caseStudyOrder } from "@/lib/case-study-presentation";
import "../case-study.css";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
  searchParams?: Promise<{
    layout?: string;
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
    ...(study.slug === "morrovia" ? {
      openGraph: {
        title: `${study.title} | Morrovia | Shaun Whiting`,
        description: study.summary,
        url: `/case-study/${study.slug}`,
        images: [{ url: study.image, alt: study.imageAlt }],
      },
    } : {}),
    alternates: {
      canonical: `/case-study/${study.slug}`,
    },
  };
}

export default async function CaseStudyPage({ params }: PageProps) {
  const { slug } = await params;
  const study = getCaseStudy(slug);
  if (!study) notFound();
  const order = [...caseStudies].sort((a,b) => caseStudyOrder.indexOf(a.slug) - caseStudyOrder.indexOf(b.slug));
  const nextStudy = order[(order.findIndex(item => item.slug === slug) + 1) % order.length];
  return <CaseStudyDetail study={study} nextStudy={nextStudy} />;
}
