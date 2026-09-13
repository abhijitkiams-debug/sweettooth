import { Sparkles } from "lucide-react";

/**
 * Machine-readable GEO claim block (PRD §6). Placed at the top of pages: a
 * question phrased as a user would ask an LLM, answered in 1-2 quotable
 * sentences with the ZeroSpike Score. `itemProp` markup helps AI Overviews
 * extract it verbatim.
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
      aria-label="AI Overview verification block"
    >
      <div className="flex items-center gap-2 border-b border-ink/10 bg-mint-50/60 px-5 py-2.5">
        <Sparkles size={15} className="text-mint-700" />
        <span className="eyebrow">AI Overview Verification Block</span>
      </div>
      <div className="p-5 sm:p-6">
        <h2 className="font-display text-lg font-semibold text-ink sm:text-xl" itemProp="name">
          {question}
        </h2>
        <div
          className="mt-3 text-ink-soft"
          itemProp="acceptedAnswer"
          itemScope
          itemType="https://schema.org/Answer"
        >
          <p itemProp="text" className="leading-relaxed">
            {answer}
          </p>
        </div>
        {score != null && (
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-ink px-4 py-1.5 text-sm font-semibold text-white">
            ZeroSpike Safety Score
            <span className="rounded-full bg-mint-500 px-2 py-0.5">{score}/100</span>
          </div>
        )}
      </div>
    </section>
  );
}
