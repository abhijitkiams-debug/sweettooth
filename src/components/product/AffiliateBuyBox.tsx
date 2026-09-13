"use client";

import { useMemo, useState } from "react";
import { ShoppingCart, Tag } from "lucide-react";
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
  D2C_REFERRAL: "Buy Direct with Coupon",
};

export function AffiliateBuyBox({
  productSlug,
  links,
}: {
  productSlug: string;
  links: AffiliateLink[];
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

  return (
    <div className="card p-5">
      <div className="space-y-3">
        {sorted.map((link) => {
          const off = discountPct(link.mrpINR, link.priceINR);
          return (
            <div
              key={link.id}
              className={`rounded-xl border p-3.5 ${
                link.isPrimary ? "border-mint-300 bg-mint-50/40" : "border-ink/10"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ink">{MERCHANT_LABEL[link.integrationType]}</p>
                  <div className="mt-0.5 flex items-center gap-2">
                    <span className="text-lg font-semibold text-ink">{formatINR(link.priceINR)}</span>
                    {off > 0 && (
                      <>
                        <span className="text-xs text-ink-muted line-through">{formatINR(link.mrpINR)}</span>
                        <span className="rounded-full bg-mint-100 px-1.5 py-0.5 text-[11px] font-semibold text-mint-700">
                          {off}% off
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <button type="button" onClick={() => openBridge(link)} className="btn-primary shrink-0">
                  <ShoppingCart size={16} />
                  <span className="hidden sm:inline">{CTA_LABEL[link.integrationType]}</span>
                  <span className="sm:hidden">Buy</span>
                </button>
              </div>
              {link.couponCode && (
                <p className="mt-2 flex items-center gap-1.5 text-xs text-mint-700">
                  <Tag size={13} /> Code <strong>{link.couponCode}</strong>
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
