import { prisma } from "@/lib/db";

export async function generateOrderNumber(shopId: string): Promise<string> {
  const shop = await prisma.shop.update({
    where: { id: shopId },
    data: { orderCounter: { increment: 1 } },
    select: { orderCounter: true, slug: true },
  });

  const prefix = shop.slug.slice(0, 4).toUpperCase().replace(/[^A-Z]/g, "S");
  return `${prefix}-${shop.orderCounter}`;
}
