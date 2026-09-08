export type PurchasesBackend = "demo" | "revenuecat";

export type CreditPack = { id: string; credits: number };

export type PurchaseResult = {
  /** New credit balance if known immediately (demo mode). */
  credits: number | null;
  /** True when the purchase went through RevenueCat (credits arrive via webhook). */
  viaRevenueCat: boolean;
};
