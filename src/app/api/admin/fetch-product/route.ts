import { NextRequest, NextResponse } from "next/server";
import { fetchProductDraft } from "@/lib/admin/fetch-product";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

/**
 * POST { url } → best-effort product draft (title, images, price, bullets,
 * description, specs, tags, rating, + a suggested affiliate link).
 */
export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let body: { url?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const url = (body.url ?? "").trim();
  if (!/^https?:\/\//i.test(url)) {
    return NextResponse.json({ error: "a valid http(s) URL is required" }, { status: 400 });
  }

  const draft = await fetchProductDraft(url);
  return NextResponse.json({ draft });
}
