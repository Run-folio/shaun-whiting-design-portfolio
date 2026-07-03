import type { Metadata } from "next";
import { Analytics } from "@/components/analytics";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://shaunwhiting.com"),
  title: "Shaun Whiting | Staff Product Designer",
  description:
    "Staff product designer shaping complex AI, fintech, ecommerce and logistics products into clear, useful experiences.",
  openGraph: {
    title: "Shaun Whiting | Staff Product Designer",
    description:
      "Product design for complex systems, AI, fintech, logistics and ecommerce. 15+ years of end-to-end UX, systems thinking and measurable product impact.",
    url: "https://shaunwhiting.com",
    siteName: "Shaun Whiting",
    locale: "en_US",
    type: "website",
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="bg-paper font-sans text-ink antialiased dark:bg-[#0d0d0c] dark:text-[#f4f3ef]">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
