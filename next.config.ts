import type { NextConfig } from "next";

const staticExport = process.env.STATIC_EXPORT === "1";
const distDir = process.env.NEXT_DIST_DIR ?? ".next";

const nextConfig: NextConfig = {
  distDir,
  ...(staticExport ? { output: "export" as const } : {}),
  images: {
    ...(staticExport ? { unoptimized: true } : {}),
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/dbt3wkwa3/**",
      },
    ],
  },
};

export default nextConfig;
