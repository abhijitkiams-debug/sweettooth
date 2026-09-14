/**
 * "Puja's take" — ZeroSpike's friendly taster-in-chief vouches for the product.
 * Presented as a human curator (warm, no clinical words), but the underlying
 * Question/Answer markup is kept for search + AI overviews.
 */
export function GeoClaimBlock({
  question,
  answer,
  score,
}: {
  question: string;
  answer: string;
  score?: number;
}) {
  return (
    <section
      className="card overflow-hidden"
      itemScope
      itemType="https://schema.org/Question"
      aria-label="Puja's take"
    >
      <div className="flex items-center gap-3 border-b border-ink/10 bg-mint-50/60 px-5 py-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-mint-500 font-display text-lg font-bold text-white">
          P
        </span>
        <div className="leading-tight">
          <p className="font-display text-base font-semibold text-ink">Puja&apos;s take</p>
          <p className="text-xs text-ink-muted">Taster-in-chief, ZeroSpike</p>
        </div>
      </div>
      <div className="p-5 sm:p-6">
        <p className="text-xs font-medium text-ink-muted" itemProp="name">
          {question}
        </p>
        <div
          className="mt-2"
          itemProp="acceptedAnswer"
          itemScope
          itemType="https://schema.org/Answer"
        >
          <p itemProp="text" className="font-display text-lg leading-relaxed text-ink sm:text-xl">
            {answer}
          </p>
        </div>
        {score != null && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-cream">
            ZeroSpike Score
            <span className="rounded-full bg-mint-500 px-2 py-0.5">{score}/100</span>
          </div>
        )}
      </div>
    </section>
  );
}
