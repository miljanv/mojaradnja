import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { trackTryOnEvent } from "@/lib/try-on/analytics";
import { getOrCreateVisitorSessionId } from "@/lib/try-on/visitor";
import { KMS_EVENT_MAP, KMS_EVENT_NAMES, UTM_KEYS } from "@/lib/kms/events";

const schema = z.object({
  event: z.enum(KMS_EVENT_NAMES),
  shopSlug: z.string().min(1).max(120).optional(),
  productId: z.string().min(1).max(60).optional(),
  tryOnJobId: z.string().min(1).max(60).optional(),
  utm: z
    .object(Object.fromEntries(UTM_KEYS.map((k) => [k, z.string().max(120).optional()])))
    .partial()
    .optional(),
  referrer: z.string().max(120).optional(),
});

export async function POST(req: Request) {
  try {
    const parsed = schema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ ok: false }, { status: 400 });
    }

    const { event, shopSlug, productId, tryOnJobId, utm, referrer } = parsed.data;

    // Landing views have no shop context yet; the analytics table is shop-scoped.
    if (!shopSlug) return NextResponse.json({ ok: true });

    const shop = await prisma.shop.findUnique({
      where: { slug: shopSlug },
      select: { id: true, virtualTryOnEnabled: true },
    });
    if (!shop?.virtualTryOnEnabled) {
      return NextResponse.json({ ok: true });
    }

    const visitorSessionId = await getOrCreateVisitorSessionId();

    await trackTryOnEvent({
      shopId: shop.id,
      productId,
      tryOnJobId,
      visitorSessionId,
      type: KMS_EVENT_MAP[event],
      metadata:
        utm && Object.keys(utm).length > 0
          ? { ...utm, referrer }
          : referrer
            ? { referrer }
            : undefined,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
