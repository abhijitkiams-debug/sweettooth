import type { RiskTier } from "@/lib/types";
import { RiskTierBadge } from "./RiskTierBadge";

const RING: Record<RiskTier, string> = {
  CERTIFIED_SAFE: "text-mint-600",
  CAUTION: "text-amber-500",
  DISQUALIFIED: "text-red-500",
};

/** Circular ZeroSpike Score dial with the risk tier badge. */
export function ZeroSpikeScoreCard({
  score,
  tier,
  size = 140,
}: {
  score: number;
  tier: RiskTier;
  size?: number;
}) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const dash = c * pct;

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: size, height: size }}>
        <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
          <circle cx="60" cy="60" r={r} fill="none" stroke="currentColor" strokeWidth="10" className="text-ink/10" />
          <circle
            cx="60"
            cy="60"
            r={r}
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={`${dash} ${c}`}
            className={RING[tier]}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-display text-3xl font-semibold text-ink">{score}</span>
          <span className="text-[11px] font-medium uppercase tracking-wider text-ink-muted">/ 100</span>
        </div>
      </div>
      <RiskTierBadge tier={tier} />
    </div>
  );
}
