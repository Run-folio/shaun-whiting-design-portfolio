import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Geist", "Inter", "IBM Plex Sans", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ["Geist Mono", "JetBrains Mono", "SFMono-Regular", "Menlo", "monospace"],
      },
      colors: {
        ink: "#000000",
        paper: "#ffffff",
        mist: "#f7f7f5",
        accent: "#1f1d3d",
        signal: "#ff3d8b",
        hairline: "#e6e6e6",
        "block-lime": "#dceeb1",
        "block-lilac": "#c5b0f4",
        "block-cream": "#f4ecd6",
        "block-pink": "#efd4d4",
        "block-mint": "#c8e6cd",
        "block-coral": "#f3c9b6",
        "block-navy": "#1f1d3d",
      },
      boxShadow: {
        soft: "0 4px 16px rgba(0, 0, 0, 0.06)",
      },
    },
  },
  plugins: [],
};

export default config;
