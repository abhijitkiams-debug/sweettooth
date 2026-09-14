import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Bright, joyful "guilt-free treat" palette.
        ink: {
          DEFAULT: "#17240f", // deep leaf-green near-black — warmer than pure black
          soft: "#41503a",
          muted: "#7c8a74",
        },
        cream: "#fff7ea", // sunny, bright warm ground
        paper: "#ffffff",
        sand: "#fbefd8", // warm cream panel
        // Fresh, vivid green — the "zero / healthy" signal.
        mint: {
          50: "#e9fbef",
          100: "#c9f5d7",
          200: "#98ebb5",
          300: "#5cdd8e",
          400: "#2ec96c",
          500: "#12ad54",
          600: "#0a8f45",
          700: "#0b723a",
          800: "#0d5a30",
          900: "#0c4a29",
        },
        // Playful secondary accents — indulgent "treat" pops.
        berry: "#ef4d75", // raspberry
        mango: "#ffb020", // sunny amber
        grape: "#a366d6",
        sky: "#33b4c9",
        safe: "#0a8f45",
        caution: "#c9871a",
        danger: "#e0473f",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      fontSize: {
        // Fluid, oversized editorial scale.
        display: ["clamp(2.75rem, 6vw, 5.25rem)", { lineHeight: "0.98", letterSpacing: "-0.03em" }],
        "display-sm": ["clamp(2.25rem, 4.5vw, 3.5rem)", { lineHeight: "1.02", letterSpacing: "-0.025em" }],
        headline: ["clamp(1.75rem, 3vw, 2.75rem)", { lineHeight: "1.08", letterSpacing: "-0.02em" }],
        lede: ["clamp(1.125rem, 1.6vw, 1.375rem)", { lineHeight: "1.55" }],
      },
      letterSpacing: {
        tightest: "-0.04em",
      },
      maxWidth: {
        prose: "68ch",
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
        "3xl": "2rem",
      },
      boxShadow: {
        card: "0 1px 2px rgba(27,26,21,0.04), 0 18px 40px -28px rgba(27,26,21,0.22)",
        soft: "0 24px 60px -32px rgba(27,26,21,0.30)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(14px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.7s cubic-bezier(0.22,1,0.36,1) both",
      },
    },
  },
  plugins: [],
};

export default config;
