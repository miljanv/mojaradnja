import { purchaseCredits } from "./api";
import type {
  CreditPack,
  PurchaseResult,
  PurchasesBackend,
} from "./purchases-types";

export const purchasesBackend: PurchasesBackend = "demo";

export async function initPurchases(_appUserId: string): Promise<void> {
  // No native billing on web — demo mode.
}

export async function buyPack(
  token: string,
  pack: CreditPack
): Promise<PurchaseResult> {
  const r = await purchaseCredits(token, {
    productId: pack.id,
    credits: pack.credits,
  });
  return { credits: r.credits, viaRevenueCat: false };
}
