"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyShopOwnership } from "@/lib/auth";
import type { ActionResult } from "./shop";

export async function getShopCategories(shopId: string) {
  await verifyShopOwnership(shopId);
  return prisma.shopCategory.findMany({
    where: { shopId },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function ensureShopCategory(
  shopId: string,
  name: string
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    const trimmed = name.trim();
    if (!trimmed) return { success: true };

    await prisma.shopCategory.upsert({
      where: { shopId_name: { shopId, name: trimmed } },
      create: { shopId, name: trimmed },
      update: {},
    });

    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Failed to save category",
    };
  }
}
