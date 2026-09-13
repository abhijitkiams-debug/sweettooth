import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, dataSource } from "@/lib/db/repository";
import { createProduct } from "@/lib/db/mutations";
import { ProductInputSchema } from "@/lib/admin/product-input";
import { requireAdmin } from "@/lib/admin/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const products = await getAllProducts();
  return NextResponse.json({ dataSource: dataSource(), count: products.length, products });
}

export async function POST(req: NextRequest) {
  const denied = requireAdmin(req);
  if (denied) return denied;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "invalid JSON body" }, { status: 400 });
  }

  const parsed = ProductInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "validation failed", issues: parsed.error.flatten() },
      { status: 422 },
    );
  }

  const product = await createProduct(parsed.data);
  return NextResponse.json({ product, dataSource: dataSource() }, { status: 201 });
}
