import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "EasyT: travel planning that fits you",
    short_name: "EasyT",
    description: "Build, adapt, and keep your trips close at hand.",
    start_url: "/journey/home",
    scope: "/journey/",
    display: "standalone",
    background_color: "#f7f5f6",
    theme_color: "#17152f",
    icons: [
      {
        src: "/brand/morrow-route-mark-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
