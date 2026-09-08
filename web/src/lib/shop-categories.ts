import { prisma } from "@/lib/db";

export async function getShopProductCategories(shopId: string): Promise<string[]> {
  const [dbCategories, productCategories] = await Promise.all([
    prisma.shopCategory.findMany({
      where: { shopId },
      orderBy: { name: "asc" },
    }),
    prisma.product.findMany({
      where: { shopId, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    }),
  ]);

  return [
    ...new Set([
      ...dbCategories.map((c) => c.name),
      ...productCategories.map((p) => p.category!).filter(Boolean),
    ]),
  ].sort();
}
