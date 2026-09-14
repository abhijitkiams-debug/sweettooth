import type { Metadata } from "next";
import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import {
  APPROVED_SWEETENERS,
  APPROVED_BASES,
  CAUTION_INGREDIENTS,
  HARD_FAIL_INGREDIENTS,
} from "@/lib/engine/scoring-rules";
import { titleCase } from "@/lib/utils/format";
import { describeLLM } from "@/lib/llm";

export const metadata: Metadata = {
  title: "How We Score — The ZeroSpike Methodology",
  description:
    "The exact rules behind the ZeroSpike Score: hard-fail additives, caution sweeteners, and the approved monk-fruit/stevia/allulose/erythritol formulations.",
};

function uniqTitle(list: readonly string[]): string[] {
  return Array.from(new Set(list.map((s) => titleCase(s))));
}

export default function MethodologyPage() {
  return (
    <div className="container-page max-w-3xl py-14 md:py-20">
      <span className="eyebrow">Transparency</span>
      <h1 className="mt-4 display-sm text-ink">How we score</h1>
      <p className="lede mt-5">
        Every ZeroSpike Score comes from one formula applied to a product&apos;s real
        ingredient list — not its marketing.
      </p>

      <div className="mt-6 rounded-2xl bg-ink px-6 py-5 text-center font-display text-xl text-white">
        ZeroSpike Score = 100 − Glycemic Penalty − Additive Penalty
      </div>

      <p className="mt-4 text-sm text-ink-muted">
        Curation engine in this deployment: <strong>{describeLLM()}</strong>. The
        LLM refines soft estimates (net carbs, GI), but hard-fail ingredients
        always force a disqualification regardless of the model&apos;s output.
      </p>

      <Section
        icon={<XCircle className="text-red-500" />}
        title="Instant disqualification (0 / DISQUALIFIED)"
        desc="Any of these forces a score of 0 — the &lsquo;sugar-free&rsquo; label doesn&apos;t matter."
        items={uniqTitle(HARD_FAIL_INGREDIENTS)}
        tone="danger"
      />
      <Section
        icon={<AlertTriangle className="text-amber-500" />}
        title="Caution (40–79)"
        desc="Low-to-moderate impact, but enough to keep a product out of certification."
        items={uniqTitle(CAUTION_INGREDIENTS)}
        tone="warn"
      />
      <Section
        icon={<ShieldCheck className="text-mint-600" />}
        title="Approved sweeteners (toward 80–100)"
        desc="The only sweeteners that keep glucose flat."
        items={uniqTitle(APPROVED_SWEETENERS)}
        tone="ok"
      />
      <Section
        icon={<ShieldCheck className="text-mint-600" />}
        title="Approved low-GI bases"
        desc="Flours and fibers that replace refined starch."
        items={uniqTitle(APPROVED_BASES)}
        tone="ok"
      />
    </div>
  );
}

function Section({
  icon,
  title,
  desc,
  items,
  tone,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
  items: string[];
  tone: "ok" | "warn" | "danger";
}) {
  const chip =
    tone === "ok"
      ? "bg-mint-50 text-mint-800 ring-mint-200"
      : tone === "warn"
        ? "bg-amber-50 text-amber-800 ring-amber-200"
        : "bg-red-50 text-red-800 ring-red-200";
  return (
    <section className="mt-8">
      <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink">
        {icon} {title}
      </h2>
      <p className="mt-1 text-sm text-ink-soft">{desc}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {items.map((i) => (
          <span key={i} className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${chip}`}>
            {i}
          </span>
        ))}
      </div>
    </section>
  );
}
