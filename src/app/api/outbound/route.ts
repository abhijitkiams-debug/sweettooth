import { NextRequest, NextResponse } from "next/server";

/**
 * Outbound click bridge (PRD §5, step 4). Logs a click metric, then 302s to the
 * affiliate URL. Only http(s) URLs are allowed (open-redirect guard).
 */
export const runtime = "edge";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get("url");
  const slug = searchParams.get("slug") ?? "unknown";
  const type = searchParams.get("type") ?? "unknown";

  if (!url) {
    return NextResponse.json({ error: "missing url" }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(url);
  } catch {
    return NextResponse.json({ error: "invalid url" }, { status: 400 });
  }
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    return NextResponse.json({ error: "unsupported protocol" }, { status: 400 });
  }

  // Click metric. In production wire this to your analytics / DB sink.
  console.log(
    JSON.stringify({
      event: "affiliate_click",
      slug,
      integrationType: type,
      host: target.host,
      ts: new Date().toISOString(),
    }),
  );

  return NextResponse.redirect(target.toString(), 302);
}
