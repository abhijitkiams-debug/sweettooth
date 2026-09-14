import type { RiskTier } from "@/lib/types";
import { categoryMeta } from "@/data/taxonomy";

/**
 * Joyful, appetising category swatch used in place of external product photos,
 * so the demo never shows a broken image while still feeling like a fun,
 * guilt-free treat brand. The tile colour comes from the product's category
 * (see CATEGORIES in taxonomy) so the catalogue reads as bright and varied.
 * If real imageUrls exist, the first is used instead.
 */
export function ProductImage({
  slug,
  title,
  categorySlug,
  imageUrls,
  overline,
  className = "",
  aspect = "aspect-[4/5]",
}: {
  slug: string;
  title: string;
  categorySlug: string;
  tier?: RiskTier;
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

  const { tint, accent } = categoryMeta(categorySlug);
  const monogram = title.trim().charAt(0).toUpperCase();

  return (
    <div
      className={`relative ${aspect} w-full overflow-hidden rounded-2xl ${className}`}
      style={{ backgroundColor: tint }}
      role="img"
      aria-label={title}
    >
      {/* soft duotone bloom for depth */}
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(120% 120% at 22% 14%, rgba(255,255,255,0.55), transparent 55%), radial-gradient(130% 130% at 85% 92%, ${accent}33, transparent 60%)`,
        }}
      />
      {overline && (
        <span
          className="absolute left-4 top-4 text-[0.62rem] font-semibold uppercase tracking-[0.2em]"
          style={{ color: accent }}
        >
          {overline}
        </span>
      )}
      <div className="absolute inset-0 grid place-items-center">
        <span
          className="font-display text-[clamp(3rem,7vw,5rem)] font-bold"
          style={{ color: accent, opacity: 0.9 }}
        >
          {monogram}
        </span>
      </div>
    </div>
  );
}
