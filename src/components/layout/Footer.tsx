import Link from "next/link";
import { describeLLM } from "@/lib/llm";
import { dataSource } from "@/lib/db/repository";

const COLUMNS = [
  {
    title: "Smart swaps",
    links: [
      { href: "/low-gi/rice-alternative", label: "Rice swaps" },
      { href: "/low-gi/roti-alternative", label: "Roti swaps" },
      { href: "/low-gi/sugar-alternative", label: "Better sweeteners" },
      { href: "/low-gi/chocolate-alternative", label: "Chocolate" },
    ],
  },
  {
    title: "Sweet things",
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
    <footer className="mt-24 bg-ink text-cream">
      <div className="container-wide py-16 md:py-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link href="/" className="font-display text-3xl font-semibold tracking-tightest text-cream">
              ZeroSpike<span className="text-mint-300">.</span>
            </Link>
            <p className="mt-4 max-w-xs font-display text-lg text-cream/85">
              Sweet without the spike.
            </p>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="text-[0.72rem] font-semibold uppercase tracking-[0.2em] text-mint-300">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-cream/75 transition hover:text-cream">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-cream/10">
        <div className="container-wide flex flex-col gap-2 py-6 text-xs text-cream/55 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ZeroSpike. Affiliate links may earn us a commission.</p>
          <p>
            Engine: <span className="text-cream/80">{describeLLM()}</span> · Data:{" "}
            <span className="text-cream/80">{dataSource()}</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
