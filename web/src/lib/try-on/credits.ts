import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export class TryOnServiceError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
    this.name = "TryOnServiceError";
  }
}

type Tx = Prisma.TransactionClient;

/**
 * Atomically consume 1 credit and create TRY_ON_USE transaction.
 * Returns false if no credits available.
 */
export async function consumeCreditForJob(
  tx: Tx,
  params: { shopId: string; tryOnJobId: string }
): Promise<boolean> {
  const updated = await tx.shop.updateMany({
    where: { id: params.shopId, aiCredits: { gt: 0 } },
    data: { aiCredits: { decrement: 1 } },
  });
  if (updated.count === 0) return false;

  await tx.aiCreditTransaction.create({
    data: {
      shopId: params.shopId,
      tryOnJobId: params.tryOnJobId,
      amount: -1,
      type: "TRY_ON_USE",
      note: "Virtual Try-On generation",
    },
  });
  return true;
}

/**
 * Idempotent refund of exactly one credit for a failed job.
 * Safe to call multiple times — unique partial index + creditRefunded flag.
 */
export async function refundCreditForJob(tryOnJobId: string): Promise<boolean> {
  return prisma.$transaction(async (tx) => {
    const job = await tx.tryOnJob.findUnique({ where: { id: tryOnJobId } });
    if (!job) return false;
    if (!job.creditConsumed || job.creditRefunded) return false;

    try {
      await tx.aiCreditTransaction.create({
        data: {
          shopId: job.shopId,
          tryOnJobId: job.id,
          amount: 1,
          type: "TRY_ON_REFUND",
          note: "Refund after failed Virtual Try-On",
        },
      });
    } catch {
      // Unique constraint — already refunded
      return false;
    }

    await tx.shop.update({
      where: { id: job.shopId },
      data: { aiCredits: { increment: 1 } },
    });
    await tx.tryOnJob.update({
      where: { id: job.id },
      data: { creditRefunded: true },
    });
    return true;
  });
}

export async function adminAdjustCredits(params: {
  shopId: string;
  amount: number;
  note: string;
  createdByUserId: string;
}): Promise<{ aiCredits: number }> {
  if (!params.note.trim()) {
    throw new TryOnServiceError("NOTE_REQUIRED", "Napomena je obavezna");
  }
  if (params.amount === 0) {
    throw new TryOnServiceError("INVALID_AMOUNT", "Količina ne sme biti 0");
  }

  return prisma.$transaction(async (tx) => {
    const shop = await tx.shop.findUnique({ where: { id: params.shopId } });
    if (!shop) throw new TryOnServiceError("SHOP_NOT_FOUND", "Shop nije pronađen");

    const next = shop.aiCredits + params.amount;
    if (next < 0) {
      throw new TryOnServiceError(
        "INSUFFICIENT_CREDITS",
        "Nema dovoljno kredita za oduzimanje"
      );
    }

    const updated = await tx.shop.update({
      where: { id: params.shopId },
      data: { aiCredits: next },
    });

    await tx.aiCreditTransaction.create({
      data: {
        shopId: params.shopId,
        amount: params.amount,
        type: params.amount > 0 ? "ADMIN_ADD" : "ADMIN_REMOVE",
        note: params.note.trim(),
        createdByUserId: params.createdByUserId,
      },
    });

    return { aiCredits: updated.aiCredits };
  });
}

export async function setShopVirtualTryOnEnabled(
  shopId: string,
  enabled: boolean
): Promise<void> {
  await prisma.shop.update({
    where: { id: shopId },
    data: { virtualTryOnEnabled: enabled },
  });
}
