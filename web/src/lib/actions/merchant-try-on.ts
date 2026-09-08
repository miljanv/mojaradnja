"use server";

import { revalidatePath } from "next/cache";
import { verifyShopOwnership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getMerchantTryOnStats } from "@/lib/try-on/jobs";
import {
  TRY_ON_CATEGORIES,
  TRY_ON_PHOTO_TYPES,
  type TryOnCategory,
  type TryOnPhotoType,
} from "@/lib/try-on/types";
import type { ActionResult } from "@/lib/actions/shop";

export async function updateProductTryOn(
  shopId: string,
  productId: string,
  data: {
    tryOnEnabled: boolean;
    tryOnCategory: TryOnCategory | null;
    tryOnPhotoType: TryOnPhotoType | null;
    tryOnGarmentImageKey: string | null;
    tryOnSegmentationFree: boolean;
  }
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { virtualTryOnEnabled: true },
    });
    if (!shop?.virtualTryOnEnabled) {
      return {
        success: false,
        error: "Virtual Try-On nije omogućen za ovu prodavnicu.",
      };
    }

    if (data.tryOnEnabled) {
      if (!data.tryOnCategory || !TRY_ON_CATEGORIES.includes(data.tryOnCategory)) {
        return { success: false, error: "Izaberite AI kategoriju odeće." };
      }
      if (!data.tryOnPhotoType || !TRY_ON_PHOTO_TYPES.includes(data.tryOnPhotoType)) {
        return { success: false, error: "Izaberite tip fotografije proizvoda." };
      }
      if (!data.tryOnGarmentImageKey) {
        return {
          success: false,
          error: "Izaberite fotografiju proizvoda za AI.",
        };
      }

      const image = await prisma.productImage.findFirst({
        where: {
          id: data.tryOnGarmentImageKey,
          productId,
          product: { shopId },
        },
      });
      if (!image) {
        return {
          success: false,
          error: "Fotografija mora pripadati ovom proizvodu.",
        };
      }
    }

    await prisma.product.update({
      where: { id: productId, shopId },
      data: {
        tryOnEnabled: data.tryOnEnabled,
        tryOnCategory: data.tryOnEnabled ? data.tryOnCategory : null,
        tryOnPhotoType: data.tryOnEnabled ? data.tryOnPhotoType : null,
        tryOnGarmentImageKey: data.tryOnEnabled
          ? data.tryOnGarmentImageKey
          : null,
        tryOnSegmentationFree: data.tryOnEnabled
          ? data.tryOnSegmentationFree
          : true,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${productId}`);
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed",
    };
  }
}

export async function fetchMerchantTryOnStats(shopId: string) {
  await verifyShopOwnership(shopId);
  return getMerchantTryOnStats(shopId);
}
