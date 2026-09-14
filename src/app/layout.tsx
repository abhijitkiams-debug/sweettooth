import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { siteUrl } from "@/lib/engine/seo";

// Body: Plus Jakarta Sans — friendly, warm, and highly legible on web + mobile.
const sans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});
// Display: Bricolage Grotesque — characterful and cheerful for big headlines.
const display = Bricolage_Grotesque({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "ZeroSpike — Treats that love you back",
    template: "%s · ZeroSpike",
  },
  description:
    "A joyful pantry of low-GI, diabetic-friendly and keto treats — cookies, chocolate, mithai and more — scored against their real ingredients. Monk fruit and stevia in, maltitol out. CGM-verified.",
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
    title: "ZeroSpike — Treats that love you back",
    description:
      "All the treat, none of the sugar-crash regret. Cookies, chocolate and mithai scored against their real ingredients.",
    siteName: "ZeroSpike",
  },
  twitter: { card: "summary_large_image" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${display.variable}`}>
      <body className="flex min-h-screen flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
