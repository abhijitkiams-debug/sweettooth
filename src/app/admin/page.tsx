import Link from "next/link";
import { PlusCircle, Package, FolderTree, Database, Cpu, ArrowRight } from "lucide-react";
import { getStats, dataSource } from "@/lib/db/repository";
import { describeLLM } from "@/lib/llm";
import { adminGuardEnabled } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const stats = await getStats();
  const source = dataSource();

  return (
    <div>
      <h1 className="font-display text-3xl font-semibold text-ink">Dashboard</h1>
      <p className="mt-1 text-ink-soft">Manage the ZeroSpike catalogue and category mapping.</p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard label="Total products" value={stats.total} />
        <StatCard label="Certified safe" value={stats.certified} tone="ok" />
        <StatCard label="Caution" value={stats.caution} tone="warn" />
        <StatCard label="Disqualified" value={stats.disqualified} tone="danger" />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <InfoRow
          icon={<Database size={16} />}
          label="Data source"
          value={source === "database" ? "PostgreSQL (persistent)" : "In-memory seed (ephemeral)"}
          note={
            source === "database"
              ? "Changes persist to your database."
              : "Changes persist only while this server is running. Set DATABASE_URL for durable storage."
          }
        />
        <InfoRow
          icon={<Cpu size={16} />}
          label="Curation engine"
          value={describeLLM()}
          note="Scores are computed server-side on save; hard-fail ingredients always force disqualification."
        />
      </div>

      {!adminGuardEnabled() && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          Admin writes are currently <strong>open</strong>. Set an{" "}
          <code className="rounded bg-amber-100 px-1">ADMIN_TOKEN</code> env var to require a token
          before deploying publicly.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <QuickLink href="/admin/products/new" icon={<PlusCircle size={18} />} title="Add a product" desc="Paste ingredients — we score it." />
        <QuickLink href="/admin/products" icon={<Package size={18} />} title="Manage products" desc="Edit, re-score, or remove." />
        <QuickLink href="/admin/categories" icon={<FolderTree size={18} />} title="Category mapping" desc="See how categories feed SEO pages." />
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }: { label: string; value: number; tone?: "ok" | "warn" | "danger" }) {
  const color =
    tone === "ok" ? "text-mint-700" : tone === "warn" ? "text-amber-600" : tone === "danger" ? "text-red-600" : "text-ink";
  return (
    <div className="card p-4">
      <div className={`font-display text-3xl font-semibold ${color}`}>{value}</div>
      <div className="text-xs text-ink-muted">{label}</div>
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-ink">
        {icon} {label}
      </div>
      <p className="mt-1 text-sm text-ink-soft">{value}</p>
      <p className="mt-1 text-xs text-ink-muted">{note}</p>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link href={href} className="card group flex flex-col p-5 transition hover:border-mint-300 hover:shadow-md">
      <span className="grid h-10 w-10 place-items-center rounded-full bg-mint-600 text-white">{icon}</span>
      <span className="mt-3 flex items-center gap-1 font-semibold text-ink">
        {title} <ArrowRight size={15} className="opacity-0 transition group-hover:opacity-100" />
      </span>
      <span className="text-sm text-ink-muted">{desc}</span>
    </Link>
  );
}
