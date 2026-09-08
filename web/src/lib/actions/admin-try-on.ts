"use server";

import { revalidatePath } from "next/cache";
import { requireAdminAccess } from "@/lib/admin";
import { getAuthUser } from "@/lib/auth";
import {
  adminAdjustCredits,
  setShopVirtualTryOnEnabled,
  TryOnServiceError,
} from "@/lib/try-on/credits";
import { FREE_TRY_ON_CREDITS } from "@/lib/try-on/types";
import { prisma } from "@/lib/db";
import type { ActionResult } from "@/lib/actions/shop";

export async function adminSetShopTryOn(
  shopId: string,
  enabled: boolean
): Promise<ActionResult<{ aiCredits?: number }>> {
  try {
    await requireAdminAccess();
    const user = await getAuthUser();
    await setShopVirtualTryOnEnabled(shopId, enabled);

    let aiCredits: number | undefined;
    if (enabled && user) {
      const shop = await prisma.shop.findUnique({
        where: { id: shopId },
        select: { aiCredits: true },
      });
      if (shop && shop.aiCredits === 0) {
        const granted = await adminAdjustCredits({
          shopId,
          amount: FREE_TRY_ON_CREDITS,
          note: `Početnih ${FREE_TRY_ON_CREDITS} besplatnih KakoMiStoji proba`,
          createdByUserId: user.id,
        });
        aiCredits = granted.aiCredits;
      }
    }

    revalidatePath("/admin");
    return { success: true, data: { aiCredits } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed",
    };
  }
}

export async function adminChangeAiCredits(
  shopId: string,
  amount: number,
  note: string
): Promise<ActionResult<{ aiCredits: number }>> {
  try {
    await requireAdminAccess();
    const user = await getAuthUser();
    if (!user) return { success: false, error: "Unauthorized" };

    const result = await adminAdjustCredits({
      shopId,
      amount,
      note,
      createdByUserId: user.id,
    });
    revalidatePath("/admin");
    return { success: true, data: result };
  } catch (e) {
    if (e instanceof TryOnServiceError) {
      return { success: false, error: e.message };
    }
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed",
    };
  }
}

export async function getAdminShopTryOnData(shopId: string) {
  await requireAdminAccess();
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      id: true,
      name: true,
      virtualTryOnEnabled: true,
      aiCredits: true,
    },
  });
  if (!shop) return null;

  const [transactions, jobs] = await Promise.all([
    prisma.aiCreditTransaction.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.tryOnJob.findMany({
      where: { shopId },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        product: { select: { name: true } },
      },
    }),
  ]);

  return { shop, transactions, jobs };
}
