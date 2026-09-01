import { NextResponse } from "next/server";
import { z } from "zod";
import { trackTryOnEvent } from "@/lib/try-on/analytics";
import { getOrCreateVisitorSessionId } from "@/lib/try-on/visitor";
import { prisma } from "@/lib/db";

const schema = z.object({
  shopSlug: z.string().min(1),
  productId: z.string().min(1),
  type: z.enum([
    "TRY_ON_OPENED",
    "ORDER_STARTED_AFTER_TRY_ON",
  ]),
  tryOnJobId: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const visitorSessionId = await getOrCreateVisitorSessionId();
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({
      where: { slug: parsed.data.shopSlug },
      select: { id: true },
    });
    if (!shop) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await trackTryOnEvent({
      shopId: shop.id,
      productId: parsed.data.productId,
      visitorSessionId,
      tryOnJobId: parsed.data.tryOnJobId,
      type: parsed.data.type,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
