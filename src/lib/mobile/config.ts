/**
 * Configuration for the "Probaj" mobile app backend.
 *
 * Everything degrades gracefully: when third-party keys are missing the API
 * still works in a self-contained demo mode so the mobile app never crashes.
 */

/** Credits granted automatically on first phone registration. */
export const FREE_SIGNUP_CREDITS = 3;

/** How long an SMS one-time code stays valid. */
export const OTP_TTL_MS = 5 * 60 * 1000;

/** Max verify attempts before a new code must be requested. */
export const OTP_MAX_ATTEMPTS = 5;

/** True when a real fal.ai key is configured (enables real try-on). */
export function isFalConfigured(): boolean {
  return Boolean(process.env.FAL_KEY?.trim());
}

/** True when UploadThing is configured (durable image hosting). */
export function isUploadThingConfigured(): boolean {
  return Boolean(process.env.UPLOADTHING_TOKEN?.trim());
}

/**
 * True when an SMS provider is configured. When false, the OTP code is
 * returned in the API response (dev mode) so the flow can be exercised
 * without sending real text messages.
 */
export function isSmsConfigured(): boolean {
  return Boolean(process.env.TWILIO_AUTH_TOKEN?.trim());
}

export function isOtpDevMode(): boolean {
  return !isSmsConfigured();
}

/** RevenueCat webhook shared secret (Authorization: Bearer <secret>). */
export function getRevenueCatWebhookSecret(): string | null {
  return process.env.REVENUECAT_WEBHOOK_SECRET?.trim() || null;
}

/**
 * Maps a RevenueCat product identifier to the number of credits it grants.
 * Falls back to a sensible default pack mapping so the demo works even before
 * products are wired up in the RevenueCat dashboard.
 */
export function creditsForProduct(productId: string | undefined | null): number {
  if (!productId) return 0;
  const explicit: Record<string, number> = {
    credits_1: 1,
    credits_5: 5,
    credits_20: 20,
    credits_50: 50,
  };
  if (productId in explicit) return explicit[productId];
  // "probaj_10_credits" -> 10
  const match = productId.match(/(\d+)/);
  return match ? parseInt(match[1]!, 10) : 0;
}
