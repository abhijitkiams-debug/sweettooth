import { HelpCircle } from "lucide-react";

/** Static FAQ list (paired with FAQPage JSON-LD on the page). */
export function FaqBlock({ faqs }: { faqs: { q: string; a: string }[] }) {
  if (!faqs.length) return null;
  return (
    <div className="space-y-3">
      {faqs.map((f) => (
        <details key={f.q} className="card group p-4 open:bg-mint-50/30">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 font-semibold text-ink">
            <span className="flex items-center gap-2">
              <HelpCircle size={17} className="text-mint-600" />
              {f.q}
            </span>
            <span className="text-ink-muted transition group-open:rotate-45">+</span>
          </summary>
          <p className="mt-3 pl-7 text-sm leading-relaxed text-ink-soft">{f.a}</p>
        </details>
      ))}
    </div>
  );
}
