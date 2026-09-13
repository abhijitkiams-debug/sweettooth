import Link from "next/link";
import { Activity } from "lucide-react";
import { describeLLM } from "@/lib/llm";
import { dataSource } from "@/lib/db/repository";

const COLUMNS = [
  {
    title: "Low-GI Swaps",
    links: [
      { href: "/low-gi/rice-alternative", label: "Rice alternatives" },
      { href: "/low-gi/roti-alternative", label: "Roti alternatives" },
      { href: "/low-gi/sugar-alternative", label: "Sugar alternatives" },
      { href: "/low-gi/chocolate-alternative", label: "Sugar-free chocolate" },
    ],
  },
  {
    title: "Diabetic-Friendly",
    links: [
      { href: "/diabetic-friendly/kaju-katli", label: "Kaju katli" },
      { href: "/diabetic-friendly/cookies", label: "Cookies" },
      { href: "/diabetic-friendly/ice-cream", label: "Ice cream" },
    ],
  },
  {
    title: "ZeroSpike",
    links: [
      { href: "/products", label: "All products" },
      { href: "/methodology", label: "How we score" },
      { href: "/admin", label: "Admin" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-ink/10 bg-paper">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2 font-display text-lg font-semibold">
            <span className="grid h-7 w-7 place-items-center rounded-full bg-mint-600 text-white">
              <Activity size={15} strokeWidth={2.5} />
            </span>
            ZeroSpike
          </div>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Ingredient-verified low-GI foods. We read every label so your blood
            sugar stays flat.
          </p>
        </div>

        {COLUMNS.map((col) => (
          <div key={col.title}>
            <h4 className="text-sm font-semibold text-ink">{col.title}</h4>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-ink-muted hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-ink/10">
        <div className="container-page flex flex-col gap-2 py-5 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ZeroSpike. Affiliate links may earn us a commission.</p>
          <p>
            Curation engine: <span className="font-medium text-ink-soft">{describeLLM()}</span> ·
            Data: <span className="font-medium text-ink-soft">{dataSource()}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
