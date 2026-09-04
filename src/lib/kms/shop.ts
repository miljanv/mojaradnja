import { prisma } from "@/lib/db";
import { productTryOnEligible } from "@/lib/try-on/eligibility";

export type KmsShop = NonNullable<Awaited<ReturnType<typeof getKmsShop>>>;
export type KmsProduct = Awaited<ReturnType<typeof getKmsProducts>>[number];

/**
 * A shop is publicly visible on KakoMiStoji only when it is published AND the
 * superadmin has enabled Virtual Try-On for it.
 */
export async function getKmsShop(slug: string) {
  const shop = await prisma.shop.findUnique({
    where: { slug },
    select: {
      id: true,
      slug: true,
      name: true,
      description: true,
      logoUrl: true,
      instagramUsername: true,
      primaryColor: true,
      isPublished: true,
      virtualTryOnEnabled: true,
      kmsPublicEnabled: true,
      aiCredits: true,
      purchaseUrl: true,
    },
  });

  if (
    !shop ||
    !shop.isPublished ||
    !shop.virtualTryOnEnabled ||
    !shop.kmsPublicEnabled
  ) {
    return null;
  }
  return shop;
}

export async function getKmsProducts(shopId: string) {
  const products = await prisma.product.findMany({
    where: { shopId, status: "ACTIVE", tryOnEnabled: true },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  return products.filter(productTryOnEligible).map((product) => ({
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: Number(product.price),
    imageUrl:
      product.images.find((img) => img.id === product.tryOnGarmentImageKey)?.url ??
      product.images[0]?.url ??
      null,
  }));
}

export async function getKmsProduct(shopId: string, productSlug: string) {
  const product = await prisma.product.findFirst({
    where: { shopId, slug: productSlug, status: "ACTIVE", tryOnEnabled: true },
    include: { images: { orderBy: { sortOrder: "asc" } } },
  });

  if (!product || !productTryOnEligible(product)) return null;

  const garmentImage =
    product.images.find((img) => img.id === product.tryOnGarmentImageKey) ??
    product.images[0];

  if (!garmentImage) return null;

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: Number(product.price),
    purchaseUrl: product.purchaseUrl,
    garmentImageUrl: garmentImage.url,
    images: product.images.map((img) => img.url),
  };
}
