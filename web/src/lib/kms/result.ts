import { prisma } from "@/lib/db";
import { getPublicImageUrl } from "@/lib/try-on/storage";
import { resolvePurchaseUrl } from "./urls";

/**
 * Loads a shared try-on result by its unguessable token. Returns null once the
 * retention job has deleted the image, so expired links degrade to a 404.
 */
export async function getSharedResult(token: string) {
  const job = await prisma.tryOnJob.findUnique({
    where: { shareToken: token },
    select: {
      id: true,
      status: true,
      resultImageKey: true,
      resultImageDeletedAt: true,
      shop: {
        select: {
          slug: true,
          name: true,
          logoUrl: true,
          instagramUsername: true,
          purchaseUrl: true,
          isPublished: true,
          virtualTryOnEnabled: true,
          kmsPublicEnabled: true,
        },
      },
      product: {
        select: { id: true, slug: true, name: true, price: true, purchaseUrl: true },
      },
    },
  });

  if (
    !job ||
    job.status !== "COMPLETED" ||
    !job.resultImageKey ||
    job.resultImageDeletedAt ||
    !job.shop.isPublished ||
    !job.shop.virtualTryOnEnabled ||
    !job.shop.kmsPublicEnabled
  ) {
    return null;
  }

  return {
    resultImageUrl: getPublicImageUrl(job.resultImageKey),
    shop: job.shop,
    product: {
      id: job.product.id,
      slug: job.product.slug,
      name: job.product.name,
      price: Number(job.product.price),
    },
    purchaseUrl: resolvePurchaseUrl({
      productPurchaseUrl: job.product.purchaseUrl,
      shopPurchaseUrl: job.shop.purchaseUrl,
      instagramUsername: job.shop.instagramUsername,
    }),
  };
}
