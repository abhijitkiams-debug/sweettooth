"use client";

import { motion } from "framer-motion";
import type { RiskTier } from "@/lib/types";

/**
 * Animated glucose-response curve. Certified-safe products draw a near-flat
 * line; caution a modest bump; disqualified a sharp spike — a visual proxy for
 * expected post-meal blood-sugar impact, scaled by the ZeroSpike Score.
 */
export function GlucoseSpikeVisualizer({
  tier,
  score,
  glycemicIndex,
}: {
  tier: RiskTier;
  score: number;
  glycemicIndex?: number | null;
}) {
  const W = 320;
  const H = 140;
  const baseY = 108; // fasting baseline

  // Peak height grows as safety falls. GI (if present) refines it.
  const severity =
    glycemicIndex != null
      ? Math.min(1, glycemicIndex / 80)
      : 1 - Math.min(1, Math.max(0, score) / 100);
  const peak = baseY - (14 + severity * 78);

  const color =
    tier === "CERTIFIED_SAFE" ? "#188053" : tier === "CAUTION" ? "#c98a15" : "#c0392b";

  // Cubic curve: baseline → peak (~35% width) → settle back toward baseline.
  const d = `M8,${baseY} C 70,${baseY} 96,${peak} 128,${peak} S 220,${baseY - severity * 10} 312,${baseY - severity * 4}`;

  const label =
    tier === "CERTIFIED_SAFE"
      ? "Nice and steady — barely a ripple"
      : tier === "CAUTION"
        ? "A gentle rise — easy does it"
        : "A proper spike — one to skip";

  return (
    <figure className="card p-4 sm:p-5">
      <figcaption className="mb-2 flex items-center justify-between text-xs font-medium text-ink-muted">
        <span>The ZeroSpike curve</span>
        <span>after a serving</span>
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={label}>
        {/* baseline grid */}
        <line x1="8" y1={baseY} x2={W - 8} y2={baseY} stroke="#0f1b17" strokeOpacity="0.12" strokeDasharray="3 4" />
        <text x="8" y={baseY + 18} className="fill-ink-muted" fontSize="9">
          before
        </text>
        {/* area under curve */}
        <motion.path
          d={`${d} L 312,${baseY} L 8,${baseY} Z`}
          fill={color}
          fillOpacity="0.08"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        />
        <motion.path
          d={d}
          fill="none"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        />
      </svg>
      <p className="mt-1 text-sm font-medium" style={{ color }}>
        {label}
      </p>
    </figure>
  );
}
