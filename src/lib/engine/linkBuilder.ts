/**
 * Non-API affiliate link builder (PRD §4). Constructs affiliate parameters
 * dynamically across 4 integration tiers with no external API dependency.
 */
export interface LinkBuildInput {
  integrationType: "AMAZON_TAG" | "FLIPKART_AFFID" | "GOAFFPRO" | "D2C_REFERRAL";
  targetUrl: string;
  affiliateTag?: string;
  couponCode?: string;
}

export interface LinkBuildOutput {
  finalUrl: string;
  couponToCopy: string | null;
}

export function buildAffiliateRoute(input: LinkBuildInput): LinkBuildOutput {
  const defaultAmazonTag =
    process.env.NEXT_PUBLIC_DEFAULT_AMAZON_TAG || "zerospike-21";
  let url: URL;

  try {
    url = new URL(input.targetUrl);
  } catch {
    return { finalUrl: input.targetUrl, couponToCopy: input.couponCode || null };
  }

  switch (input.integrationType) {
    case "AMAZON_TAG":
      url.searchParams.set("tag", input.affiliateTag || defaultAmazonTag);
      break;
    case "FLIPKART_AFFID":
      url.searchParams.set("affid", input.affiliateTag || "zerospike");
      break;
    case "GOAFFPRO":
      url.searchParams.set("ref", input.affiliateTag || "zerospike");
      break;
    case "D2C_REFERRAL":
      // Keeps original D2C URL, relies on coupon code copy.
      break;
  }

  return {
    finalUrl: url.toString(),
    couponToCopy: input.couponCode || null,
  };
}
