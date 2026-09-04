import { prisma } from "@/lib/db";

export type KmsFunnel = {
  views: number;
  tried: number;
  generated: number;
  buyClicks: number;
  shareClicks: number;
};

export type KmsFunnelRanges = {
  today: KmsFunnel;
  last7: KmsFunnel;
  last30: KmsFunnel;
};

const VIEW_TYPES = ["KMS_SHOP_VIEW", "KMS_PRODUCT_VIEW"] as const;

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000);
}

async function funnelSince(shopId: string, since: Date): Promise<KmsFunnel> {
  const rows = await prisma.tryOnAnalyticsEvent.groupBy({
    by: ["type"],
    where: { shopId, createdAt: { gte: since } },
    _count: { _all: true },
  });

  const count = (type: string) =>
    rows.find((r) => r.type === type)?._count._all ?? 0;

  return {
    views: VIEW_TYPES.reduce((sum, t) => sum + count(t), 0),
    tried: count("TRY_ON_OPENED"),
    generated: count("TRY_ON_COMPLETED"),
    buyClicks: count("KMS_BUY_CLICKED"),
    shareClicks: count("KMS_SHARE_CLICKED"),
  };
}

/**
 * Deliberately three small grouped counts rather than a time-series table.
 * Good enough until the volume justifies pre-aggregation.
 */
export async function getKmsFunnel(shopId: string): Promise<KmsFunnelRanges> {
  const [today, last7, last30] = await Promise.all([
    funnelSince(shopId, startOfToday()),
    funnelSince(shopId, daysAgo(7)),
    funnelSince(shopId, daysAgo(30)),
  ]);

  return { today, last7, last30 };
}
