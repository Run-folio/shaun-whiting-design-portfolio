import type { Metadata, Viewport } from "next";

export const metadata: Metadata = {
  title: {
    default: "EasyT · Travel your way",
    template: "%s · EasyT",
  },
  description:
    "Shape thoughtful trips, find useful places nearby, and keep the memories that matter.",
  alternates: { canonical: "/journey/home" },
  openGraph: {
    title: "EasyT · Travel your way",
    description:
      "A flexible trip planner for routes with room to breathe, useful local finds, and memories worth keeping.",
    url: "/journey/home",
    siteName: "EasyT",
    type: "website",
  },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f7fb",
};

export default function JourneyLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
