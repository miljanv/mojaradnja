"use server";

import { revalidatePath } from "next/cache";
import { verifyShopOwnership } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { safeExternalUrl } from "@/lib/kms/urls";
import type { ActionResult } from "@/lib/actions/shop";

export async function updateKmsSettings(
  shopId: string,
  data: {
    kmsPublicEnabled: boolean;
    purchaseUrl: string;
    instagramUsername: string;
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
        error: "KakoMiStoji nije omogućen za ovu prodavnicu.",
      };
    }

    const rawPurchaseUrl = data.purchaseUrl.trim();
    const purchaseUrl = rawPurchaseUrl ? safeExternalUrl(rawPurchaseUrl) : null;
    if (rawPurchaseUrl && !purchaseUrl) {
      return {
        success: false,
        error: "Link za kupovinu mora počinjati sa http:// ili https://",
      };
    }

    const instagramUsername =
      data.instagramUsername.trim().replace(/^@/, "").slice(0, 60) || null;
    if (instagramUsername && !/^[A-Za-z0-9._]+$/.test(instagramUsername)) {
      return { success: false, error: "Instagram korisničko ime nije validno." };
    }

    await prisma.shop.update({
      where: { id: shopId },
      data: {
        kmsPublicEnabled: data.kmsPublicEnabled,
        purchaseUrl,
        instagramUsername,
      },
    });

    revalidatePath("/dashboard/kakomistoji");
    revalidatePath("/dashboard/shop");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}

export async function updateProductPurchaseUrl(
  shopId: string,
  productId: string,
  purchaseUrl: string
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);

    const raw = purchaseUrl.trim();
    const safe = raw ? safeExternalUrl(raw) : null;
    if (raw && !safe) {
      return {
        success: false,
        error: "Link mora počinjati sa http:// ili https://",
      };
    }

    await prisma.product.update({
      where: { id: productId, shopId },
      data: { purchaseUrl: safe },
    });

    revalidatePath("/dashboard/kakomistoji");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed" };
  }
}
