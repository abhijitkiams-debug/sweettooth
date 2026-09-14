"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu, X } from "lucide-react";

const NAV = [
  { href: "/products", label: "Shop" },
  { href: "/low-gi/rice-alternative", label: "Swaps" },
  { href: "/diabetic-friendly/kaju-katli", label: "Mithai" },
  { href: "/methodology", label: "Our method" },
];

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-ink/10 bg-cream/80 backdrop-blur-md">
      <div className="container-wide flex h-[70px] items-center justify-between">
        <Link
          href="/"
          className="font-display text-2xl font-semibold tracking-tightest text-ink"
          aria-label="ZeroSpike home"
        >
          ZeroSpike<span className="text-mint-500">.</span>
        </Link>

        <nav className="hidden items-center gap-9 md:flex">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="text-[0.8rem] font-medium uppercase tracking-[0.14em] text-ink-soft transition hover:text-ink"
            >
              {n.label}
            </Link>
          ))}
          <Link href="/products" className="btn-primary !px-5 !py-2.5 !text-[0.8rem]">
            Browse
          </Link>
        </nav>

        <button
          type="button"
          aria-label="Toggle menu"
          className="grid h-11 w-11 place-items-center rounded-full border border-ink/15 md:hidden"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {open && (
        <nav className="border-t border-ink/10 bg-cream md:hidden">
          <div className="container-wide flex flex-col py-4">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="border-b border-ink/5 py-4 font-display text-2xl text-ink"
                onClick={() => setOpen(false)}
              >
                {n.label}
              </Link>
            ))}
            <Link href="/products" className="btn-primary mt-5" onClick={() => setOpen(false)}>
              Browse certified foods
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
