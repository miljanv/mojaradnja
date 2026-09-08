import { NextResponse } from "next/server";
import { requireShop } from "@/lib/auth";
import { getMerchantTryOnStats } from "@/lib/try-on/jobs";

export async function GET() {
  try {
    const { shop } = await requireShop();
    const stats = await getMerchantTryOnStats(shop.id);
    return NextResponse.json(stats);
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
