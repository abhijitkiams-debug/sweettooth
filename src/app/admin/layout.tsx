import type { Metadata } from "next";
import Link from "next/link";
import { LayoutDashboard, Package, PlusCircle, FolderTree, ArrowLeft, Lock, Unlock } from "lucide-react";
import { adminGuardEnabled } from "@/lib/admin/auth";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/products/new", label: "Add product", icon: PlusCircle },
  { href: "/admin/categories", label: "Category mapping", icon: FolderTree },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const guarded = adminGuardEnabled();

  return (
    <div className="container-page py-8">
      <div className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="md:sticky md:top-20 md:self-start">
          <div className="flex items-center justify-between">
            <span className="eyebrow">ZeroSpike Admin</span>
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                guarded ? "bg-mint-50 text-mint-700" : "bg-amber-50 text-amber-700"
              }`}
              title={
                guarded
                  ? "Writes require the ADMIN_TOKEN header"
                  : "Writes are open — set ADMIN_TOKEN before deploying"
              }
            >
              {guarded ? <Lock size={11} /> : <Unlock size={11} />}
              {guarded ? "Guarded" : "Open"}
            </span>
          </div>

          <nav className="mt-4 flex flex-col gap-1">
            {NAV.map((n) => (
              <Link
                key={n.href}
                href={n.href}
                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-ink-soft transition hover:bg-mint-50 hover:text-ink"
              >
                <n.icon size={16} />
                {n.label}
              </Link>
            ))}
          </nav>

          <Link
            href="/"
            className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-ink"
          >
            <ArrowLeft size={13} /> Back to site
          </Link>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
