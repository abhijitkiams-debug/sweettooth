import type { Metadata } from "next";
import { Inter, Fraunces } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteUrl } from "@/lib/engine/seo";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans", display: "swap" });
const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "ZeroSpike — Low-GI & Diabetic-Friendly Food, Verified",
    template: "%s · ZeroSpike",
  },
  description:
    "ZeroSpike scores packaged foods for blood-sugar safety. Every product is checked against its ingredient label — monk fruit and stevia in, maltitol out. CGM-verified.",
  keywords: [
    "low GI food",
    "diabetic friendly",
    "sugar free",
    "keto India",
    "no maltitol",
    "blood sugar",
  ],
  openGraph: {
    type: "website",
    title: "ZeroSpike — Low-GI & Diabetic-Friendly Food, Verified",
    description:
      "Ingredient-verified low-GI foods with a ZeroSpike Score. Monk fruit and stevia in, maltitol out.",
    siteName: "ZeroSpike",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
