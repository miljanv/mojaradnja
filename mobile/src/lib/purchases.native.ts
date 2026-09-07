import { Platform } from "react-native";
import { purchaseCredits } from "./api";
import { REVENUECAT_ANDROID_KEY, REVENUECAT_IOS_KEY } from "./config";
import type {
  CreditPack,
  PurchaseResult,
  PurchasesBackend,
} from "./purchases-types";

export const purchasesBackend: PurchasesBackend = "revenuecat";

type PurchasesModule = typeof import("react-native-purchases").default;

let purchases: PurchasesModule | null = null;
let configured = false;

function apiKey(): string {
  return Platform.OS === "ios" ? REVENUECAT_IOS_KEY : REVENUECAT_ANDROID_KEY;
}

export async function initPurchases(appUserId: string): Promise<void> {
  if (!apiKey()) return; // No RevenueCat key -> demo fallback.
  try {
    const mod = await import("react-native-purchases");
    purchases = mod.default;
    await purchases.configure({ apiKey: apiKey(), appUserID: appUserId });
    configured = true;
  } catch {
    configured = false;
  }
}

export async function buyPack(
  token: string,
  pack: CreditPack
): Promise<PurchaseResult> {
  if (configured && purchases) {
    const offerings = await purchases.getOfferings();
    const pkg = offerings.current?.availablePackages.find(
      (p) => p.product.identifier === pack.id
    );
    if (pkg) {
      await purchases.purchasePackage(pkg);
      // Credits are granted server-side via the RevenueCat webhook.
      return { credits: null, viaRevenueCat: true };
    }
  }
  // Fallback: demo grant through the backend so the flow always completes.
  const r = await purchaseCredits(token, {
    productId: pack.id,
    credits: pack.credits,
  });
  return { credits: r.credits, viaRevenueCat: false };
}
