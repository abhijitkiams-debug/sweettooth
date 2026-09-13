"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X, Activity } from "lucide-react";

const NAV = [
  { href: "/products", label: "All Products" },
  { href: "/low-gi/rice-alternative", label: "Rice Swaps" },
  { href: "/low-gi/roti-alternative", label: "Roti Swaps" },
  { href: "/diabetic-friendly/kaju-katli", label: "Mithai" },
  { href: "/methodology", label: "How We Score" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/85 backdrop-blur">
      <div className="container-page flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-mint-600 text-white">
            <Activity size={18} strokeWidth={2.5} />
          </span>
          ZeroSpike
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-sm font-medium text-ink-soft transition hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
          <Link href="/products" className="btn-primary">
            Browse Certified
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="grid h-10 w-10 place-items-center rounded-full border border-ink/15 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink/10 bg-cream md:hidden">
          <div className="container-page flex flex-col py-3">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="rounded-lg px-2 py-3 text-sm font-medium text-ink-soft hover:bg-mint-50"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
}
