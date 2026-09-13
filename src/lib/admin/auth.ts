import { NextRequest, NextResponse } from "next/server";

/**
 * Optional admin guard for mutating endpoints.
 *
 * - If `ADMIN_TOKEN` is unset (local / demo), requests are allowed — keeps the
 *   getting-started experience frictionless.
 * - If `ADMIN_TOKEN` is set, mutating requests must send a matching
 *   `x-admin-token` header (or `admin_token` cookie).
 *
 * Returns a 401 NextResponse when denied, or null when the request may proceed.
 * Set ADMIN_TOKEN before deploying publicly.
 */
export function requireAdmin(req: NextRequest): NextResponse | null {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) return null;

  const provided = req.headers.get("x-admin-token") ?? req.cookies.get("admin_token")?.value;
  if (provided && provided === expected) return null;

  return NextResponse.json({ error: "unauthorized" }, { status: 401 });
}

/** Whether admin write access is currently gated by a token. */
export function adminGuardEnabled(): boolean {
  return Boolean(process.env.ADMIN_TOKEN);
}
