/**
 * Outbound transfer bridge (PRD §5). Auto-copies a coupon code, opens the
 * affiliate URL in a new tab, and falls back to a same-tab redirect if a popup
 * blocker prevents the new tab.
 */
export interface RedirectParams {
  url: string;
  couponCode?: string | null;
  onPopupBlocked?: () => void;
}

export async function executeOutboundRedirect({
  url,
  couponCode,
  onPopupBlocked,
}: RedirectParams): Promise<void> {
  // 1. Auto-copy coupon code to clipboard.
  if (couponCode && typeof navigator !== "undefined" && navigator.clipboard) {
    try {
      await navigator.clipboard.writeText(couponCode);
    } catch (err) {
      console.warn("Clipboard permission denied:", err);
    }
  }

  // 2. Attempt window.open.
  const newTab = window.open(url, "_blank", "noopener,noreferrer");

  // 3. Popup-blocker fallback execution.
  const isBlocked = !newTab || newTab.closed || typeof newTab.closed === "undefined";

  if (isBlocked) {
    if (onPopupBlocked) onPopupBlocked();
    setTimeout(() => {
      window.location.href = url;
    }, 1200);
  } else {
    newTab.focus();
  }
}

/** Build the click-tracked outbound URL that logs a metric then 302-redirects. */
export function outboundHref(finalUrl: string, productSlug: string, integrationType: string): string {
  const params = new URLSearchParams({
    url: finalUrl,
    slug: productSlug,
    type: integrationType,
  });
  return `/api/outbound?${params.toString()}`;
}
