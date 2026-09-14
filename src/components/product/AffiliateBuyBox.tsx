"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Tag, Sparkles } from "lucide-react";
import type { AffiliateLink } from "@/lib/types";
import { buildAffiliateRoute } from "@/lib/engine/linkBuilder";
import { formatINR, discountPct } from "@/lib/utils/format";
import { TransferBridgeModal, type BridgeTarget } from "@/components/modals/TransferBridgeModal";

const MERCHANT_LABEL: Record<AffiliateLink["integrationType"], string> = {
  AMAZON_TAG: "Amazon",
  FLIPKART_AFFID: "Flipkart",
  GOAFFPRO: "Store",
  D2C_REFERRAL: "Brand Store",
};

const CTA_LABEL: Record<AffiliateLink["integrationType"], string> = {
  AMAZON_TAG: "Buy on Amazon",
  FLIPKART_AFFID: "Buy on Flipkart",
  GOAFFPRO: "Buy Now",
  D2C_REFERRAL: "Buy Direct",
};

export function AffiliateBuyBox({
  productSlug,
  links,
  zerospikeOffer,
}: {
  productSlug: string;
  links: AffiliateLink[];
  zerospikeOffer?: string | null;
}) {
  const [target, setTarget] = useState<BridgeTarget | null>(null);

  const sorted = useMemo(
    () => [...links].sort((a, b) => Number(b.isPrimary) - Number(a.isPrimary) || a.priceINR - b.priceINR),
    [links],
  );

  if (!sorted.length) {
    return <p className="text-sm text-ink-muted">No purchase links available.</p>;
  }

  const openBridge = (link: AffiliateLink) => {
    const { finalUrl, couponToCopy } = buildAffiliateRoute({
      integrationType: link.integrationType,
      targetUrl: link.targetUrl,
      affiliateTag: link.affiliateTag ?? undefined,
      couponCode: link.couponCode ?? undefined,
    });
    setTarget({
      finalUrl,
      couponCode: couponToCopy,
      integrationType: link.integrationType,
      merchantLabel: MERCHANT_LABEL[link.integrationType],
      productSlug,
    });
  };

  const bestPrice = Math.min(...sorted.map((l) => l.priceINR));

  return (
    <div className="card p-4 sm:p-5">
      {zerospikeOffer && (
        <div className="mb-3 flex items-start gap-2 rounded-xl bg-mint-50 px-3.5 py-2.5 text-sm text-mint-800 ring-1 ring-inset ring-mint-200">
          <Sparkles size={16} className="mt-0.5 shrink-0 text-mint-600" />
          <span>
            <strong>ZeroSpike offer:</strong> {zerospikeOffer}
          </span>
        </div>
      )}

      <div className="space-y-3">
        {sorted.map((link) => {
          const off = discountPct(link.mrpINR, link.priceINR);
          const isBest = link.priceINR === bestPrice;
          return (
            <div
              key={link.id}
              className={`rounded-2xl border p-4 ${
                link.isPrimary ? "border-mint-300 bg-mint-50/40" : "border-ink/10"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-ink">
                    {MERCHANT_LABEL[link.integrationType]}
                    {isBest && (
                      <span className="rounded-full bg-mint-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-mint-700">
                        Best price
                      </span>
                    )}
                  </p>
                  <div className="mt-1 flex flex-wrap items-baseline gap-2">
                    <span className="text-xl font-semibold text-ink">{formatINR(link.priceINR)}</span>
                    {off > 0 && (
                      <>
                        <span className="text-sm text-ink-muted line-through">{formatINR(link.mrpINR)}</span>
                        <span className="text-sm font-semibold text-mint-700">{off}% off</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => openBridge(link)}
                className="btn-primary mt-3 w-full"
              >
                <ShoppingCart size={16} />
                {CTA_LABEL[link.integrationType]}
              </button>

              {link.couponCode && (
                <p className="mt-2.5 flex items-center gap-1.5 text-xs text-mint-700">
                  <Tag size={13} /> Use code <strong>{link.couponCode}</strong>
                  {link.referralNote ? ` — ${link.referralNote}` : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-3 text-[11px] leading-relaxed text-ink-muted">
        Prices are indicative and set by the merchant. ZeroSpike may earn an
        affiliate commission at no extra cost to you.
      </p>

      <TransferBridgeModal target={target} onClose={() => setTarget(null)} />
    </div>
  );
}
