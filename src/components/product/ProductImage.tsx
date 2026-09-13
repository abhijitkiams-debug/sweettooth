import type { RiskTier } from "@/lib/types";

/**
 * Branded gradient tile used in place of external product photos, so the demo
 * never shows a broken image. Deterministic hue from the product slug keeps
 * each product visually distinct. If real imageUrls exist, the first is used.
 */
const TIER_RING: Record<RiskTier, string> = {
  CERTIFIED_SAFE: "from-mint-200 to-mint-400",
  CAUTION: "from-amber-100 to-amber-300",
  DISQUALIFIED: "from-red-100 to-red-300",
};

function hue(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) % 360;
  return h;
}

export function ProductImage({
  slug,
  title,
  tier,
  imageUrls,
  className = "",
  aspect = "aspect-[4/3]",
}: {
  slug: string;
  title: string;
  tier: RiskTier;
  imageUrls?: string[];
  className?: string;
  aspect?: string;
}) {
  if (imageUrls && imageUrls.length > 0) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imageUrls[0]}
        alt={title}
        className={`${aspect} w-full rounded-xl object-cover ${className}`}
      />
    );
  }

  const h = hue(slug);
  const initials = title
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-xl bg-gradient-to-br ${TIER_RING[tier]} ${className}`}
      role="img"
      aria-label={title}
    >
      <div
        className="absolute inset-0 opacity-70"
        style={{
          background: `radial-gradient(120% 120% at 20% 15%, hsl(${h} 70% 92%), transparent 60%), radial-gradient(120% 120% at 85% 90%, hsl(${(h + 40) % 360} 65% 88%), transparent 55%)`,
        }}
      />
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-4xl font-semibold text-ink/70">{initials}</span>
      </div>
    </div>
  );
}
