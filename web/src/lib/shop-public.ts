import { prisma } from "@/lib/db";
import { RESERVED_ROUTES } from "@/lib/constants";

export async function getShopBySlug(slug: string) {
  if ((RESERVED_ROUTES as readonly string[]).includes(slug)) {
    return null;
  }

  return prisma.shop.findUnique({
    where: { slug },
  });
}

export async function getPublishedShop(slug: string) {
  const shop = await getShopBySlug(slug);
  if (!shop?.isPublished) return null;
  return shop;
}

export function getInstagramUrl(username?: string | null) {
  if (!username) return null;
  return `https://instagram.com/${username.replace(/^@/, "")}`;
}
