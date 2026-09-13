import { Star, Activity } from "lucide-react";
import type { HarvestedReview } from "@/lib/types";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex" aria-label={`${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={14}
          className={i <= rating ? "fill-amber-400 text-amber-400" : "text-ink/20"}
        />
      ))}
    </span>
  );
}

export function ReviewList({ reviews }: { reviews: HarvestedReview[] }) {
  if (!reviews.length) {
    return <p className="text-sm text-ink-muted">No harvested reviews yet.</p>;
  }

  return (
    <ul className="space-y-4">
      {reviews.map((r) => (
        <li key={r.id} className="card p-4">
          <div className="flex flex-wrap items-center gap-2">
            <Stars rating={r.rating} />
            <span className="text-sm font-semibold text-ink">{r.reviewerName}</span>
            <span className="text-xs text-ink-muted">via {r.source}</span>
            {r.isCgmVerified && (
              <span className="inline-flex items-center gap-1 rounded-full bg-mint-50 px-2 py-0.5 text-[11px] font-semibold text-mint-700 ring-1 ring-inset ring-mint-200">
                <Activity size={11} strokeWidth={2.6} /> CGM-verified
              </span>
            )}
          </div>
          <p className="mt-2 text-sm leading-relaxed text-ink-soft">{r.reviewText}</p>
        </li>
      ))}
    </ul>
  );
}
