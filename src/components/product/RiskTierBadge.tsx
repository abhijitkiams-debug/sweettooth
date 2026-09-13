import { ShieldCheck, AlertTriangle, XCircle } from "lucide-react";
import type { RiskTier } from "@/lib/types";

const CONFIG: Record<
  RiskTier,
  { label: string; icon: typeof ShieldCheck; className: string }
> = {
  CERTIFIED_SAFE: {
    label: "Certified Safe",
    icon: ShieldCheck,
    className: "bg-mint-50 text-mint-800 ring-mint-200",
  },
  CAUTION: {
    label: "Caution",
    icon: AlertTriangle,
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  DISQUALIFIED: {
    label: "Disqualified",
    icon: XCircle,
    className: "bg-red-50 text-red-800 ring-red-200",
  },
};

export function RiskTierBadge({ tier, size = "md" }: { tier: RiskTier; size?: "sm" | "md" }) {
  const { label, icon: Icon, className } = CONFIG[tier];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset ${className} ${
        size === "sm" ? "px-2.5 py-1 text-xs" : "px-3 py-1.5 text-sm"
      }`}
    >
      <Icon size={size === "sm" ? 13 : 15} strokeWidth={2.4} />
      {label}
    </span>
  );
}
