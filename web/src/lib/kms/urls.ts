import { getInstagramUrl } from "@/lib/shop-public-client";

/** Only http(s) survives — blocks javascript:, data: and other injected schemes. */
export function safeExternalUrl(raw?: string | null): string | null {
  if (!raw) return null;
  try {
    const url = new URL(raw.trim());
    if (url.protocol !== "https:" && url.protocol !== "http:") return null;
    return url.toString();
  } catch {
    return null;
  }
}

/**
 * Where "Kupi ovaj komad" points: product link wins, then the shop-wide link,
 * then the shop's Instagram profile as a contact fallback.
 */
export function resolvePurchaseUrl(input: {
  productPurchaseUrl?: string | null;
  shopPurchaseUrl?: string | null;
  instagramUsername?: string | null;
}): string | null {
  return (
    safeExternalUrl(input.productPurchaseUrl) ??
    safeExternalUrl(input.shopPurchaseUrl) ??
    safeExternalUrl(getInstagramUrl(input.instagramUsername))
  );
}
