import type { MetadataRoute } from "next";
import { caseStudies } from "@/lib/case-studies";

const siteUrl = "https://shaunwhiting.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: siteUrl,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/more-about-me`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/photography`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...caseStudies.map((study) => ({
      url: `${siteUrl}/case-study/${study.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}

