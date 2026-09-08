import { prisma } from "@/lib/db";
import type { TryOnAnalyticsEventType } from "@/generated/prisma/client";

export async function trackTryOnEvent(params: {
  shopId: string;
  type: TryOnAnalyticsEventType;
  productId?: string | null;
  tryOnJobId?: string | null;
  visitorSessionId?: string | null;
  orderId?: string | null;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  try {
    await prisma.tryOnAnalyticsEvent.create({
      data: {
        shopId: params.shopId,
        type: params.type,
        productId: params.productId ?? undefined,
        tryOnJobId: params.tryOnJobId ?? undefined,
        visitorSessionId: params.visitorSessionId ?? undefined,
        orderId: params.orderId ?? undefined,
        metadata: (params.metadata ?? undefined) as object | undefined,
      },
    });
  } catch {
    // Analytics must not break the main flow
  }
}
