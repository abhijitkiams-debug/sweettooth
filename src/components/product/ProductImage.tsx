import type { RiskTier } from "@/lib/types";

/**
 * Editorial "lifestyle" swatch used in place of external product photos, so the
 * demo never shows a broken image while still feeling like a premium D2C brand.
 * A deterministic warm hue per slug keeps products distinct; the tier tints only
 * a soft corner glow, keeping the overall look calm and minimal. If real
 * imageUrls exist, the first is used instead.
 */
const TIER_GLOW: Record<RiskTier, string> = {
  CERTIFIED_SAFE: "81 123 69", // sage
  CAUTION: "176 122 26", // amber
  DISQUALIFIED: "178 59 46", // clay-red
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
  overline,
  className = "",
  aspect = "aspect-[4/5]",
}: {
  slug: string;
  title: string;
  tier: RiskTier;
  imageUrls?: string[];
  overline?: string;
  className?: string;
  aspect?: string;
}) {
  if (imageUrls && imageUrls.length > 0) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={imageUrls[0]}
        alt={title}
        className={`${aspect} w-full rounded-2xl object-cover ${className}`}
      />
    );
  }

  const h = hue(slug);
  const glow = TIER_GLOW[tier];
  const monogram = title
    .split(/\s+/)
    .slice(0, 1)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-2xl ${className}`}
      style={{ backgroundColor: `hsl(${h} 24% 90%)` }}
      role="img"
      aria-label={title}
    >
      {/* warm editorial wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(130% 120% at 18% 12%, hsl(${h} 30% 95% / 0.9), transparent 55%), radial-gradient(120% 130% at 88% 92%, rgb(${glow} / 0.16), transparent 58%)`,
        }}
      />
      {overline && (
        <span className="absolute left-4 top-4 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-ink/45">
          {overline}
        </span>
      )}
      <div className="absolute inset-0 grid place-items-center">
        <span className="font-display text-[clamp(3rem,7vw,5rem)] font-semibold text-ink/25">
          {monogram}
        </span>
      </div>
    </div>
  );
}
