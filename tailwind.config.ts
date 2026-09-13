import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Brand palette — clean, clinical, trustworthy (mint/ink)
        ink: {
          DEFAULT: "#0f1b17",
          soft: "#33443c",
          muted: "#6b7d74",
        },
        cream: "#f7f5ef",
        paper: "#fffdf8",
        mint: {
          50: "#effaf3",
          100: "#d7f2e0",
          200: "#b0e5c5",
          300: "#7fd3a4",
          400: "#4bba82",
          500: "#279f66",
          600: "#188053",
          700: "#146645",
          800: "#135139",
          900: "#0f4230",
        },
        // Risk-tier semantic colors
        safe: "#188053",
        caution: "#c98a15",
        danger: "#c0392b",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "Georgia", "serif"],
      },
      borderRadius: {
        xl: "1rem",
        "2xl": "1.5rem",
      },
      boxShadow: {
        card: "0 1px 3px rgba(15,27,23,0.06), 0 8px 24px -12px rgba(15,27,23,0.12)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.5s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
