"use client";

import { useEffect, useState } from "react";
import { X, Check, ClipboardCheck, ShieldCheck, ExternalLink } from "lucide-react";
import { executeOutboundRedirect, outboundHref } from "@/lib/utils/outboundRedirect";
import type { IntegrationType } from "@/lib/types";

export interface BridgeTarget {
  finalUrl: string;
  couponCode: string | null;
  integrationType: IntegrationType;
  merchantLabel: string;
  productSlug: string;
}

const SAFETY_CHECKLIST = [
  "No maltitol, isomalt, or maltodextrin",
  "Sweetened with monk fruit, stevia, allulose or erythritol",
  "Check net carbs per serving on arrival",
  "Verify batch label matches what we scored",
];

/**
 * Transfer bridge modal (PRD §5). On open it auto-copies the coupon to the
 * clipboard, shows the zero-spike safety checklist, and includes a native
 * anchor fail-safe against popup blockers. Confirm triggers the outbound
 * redirect via the click-tracking /api/outbound route.
 */
export function TransferBridgeModal({
  target,
  onClose,
}: {
  target: BridgeTarget | null;
  onClose: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const [popupBlocked, setPopupBlocked] = useState(false);

  const trackedHref = target
    ? outboundHref(target.finalUrl, target.productSlug, target.integrationType)
    : "#";

  // Auto-copy coupon as soon as the modal opens.
  useEffect(() => {
    if (!target?.couponCode) return;
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard
        .writeText(target.couponCode)
        .then(() => setCopied(true))
        .catch(() => setCopied(false));
    }
  }, [target]);

  // Close on Escape.
  useEffect(() => {
    if (!target) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [target, onClose]);

  if (!target) return null;

  const proceed = () =>
    executeOutboundRedirect({
      url: trackedHref,
      couponCode: target.couponCode,
      onPopupBlocked: () => setPopupBlocked(true),
    });

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-ink/50 p-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label="Continue to merchant"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md overflow-hidden rounded-2xl bg-paper shadow-2xl animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-ink/10 px-5 py-3.5">
          <h3 className="font-display text-lg font-semibold text-ink">
            Continue to {target.merchantLabel}
          </h3>
          <button type="button" aria-label="Close" onClick={onClose} className="text-ink-muted hover:text-ink">
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4 p-5">
          {target.couponCode && (
            <div className="flex items-center gap-2 rounded-xl bg-mint-50 px-4 py-3 text-sm text-mint-800 ring-1 ring-inset ring-mint-200">
              {copied ? <ClipboardCheck size={18} /> : <Check size={18} />}
              <span>
                {copied ? (
                  <>
                    Coupon code <strong>{target.couponCode}</strong> copied to clipboard!
                  </>
                ) : (
                  <>
                    Use code <strong>{target.couponCode}</strong> at checkout.
                  </>
                )}
              </span>
            </div>
          )}

          <div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-ink">
              <ShieldCheck size={16} className="text-mint-600" /> Zero-spike checklist
            </p>
            <ul className="mt-2 space-y-1.5">
              {SAFETY_CHECKLIST.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-ink-soft">
                  <Check size={15} className="mt-0.5 shrink-0 text-mint-600" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {popupBlocked && (
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-800">
              Your browser blocked the new tab — redirecting you now, or use the link below.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <button type="button" onClick={proceed} className="btn-primary w-full">
              Continue to {target.merchantLabel}
              <ExternalLink size={16} />
            </button>
            {/* Native anchor fail-safe against popup blockers (PRD §5). */}
            <a
              href={trackedHref}
              target="_blank"
              rel="noopener noreferrer"
              className="text-center text-xs text-ink-muted underline underline-offset-2 hover:text-ink"
            >
              Link not opening? Click here to continue manually.
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
