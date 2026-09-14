import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm, editorial neutrals with a single calm sage accent.
        ink: {
          DEFAULT: "#1b1a15", // warm near-black
          soft: "#4d4a40",
          muted: "#8f8b7d",
        },
        cream: "#f4f1e9", // warm paper ground
        paper: "#fbfaf5",
        sand: "#e9e4d6", // subtle warm panel
        clay: "#c9713f", // warm secondary accent, used sparingly
        // Sage green — muted, wellness-forward.
        mint: {
          50: "#f0f4ee",
          100: "#dde7d7",
          200: "#bccfb1",
          300: "#94b285",
          400: "#6d9760",
          500: "#517b45",
          600: "#3f6337",
          700: "#344f2e",
          800: "#2b3f27",
          900: "#243421",
        },
        safe: "#3f6337",
        caution: "#b07a1a",
        danger: "#b23b2e",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
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
