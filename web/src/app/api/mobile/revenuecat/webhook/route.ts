import { prisma } from "@/lib/db";
import { creditsForProduct, getRevenueCatWebhookSecret } from "@/lib/mobile/config";
import { mobileError, mobileJson } from "@/lib/mobile/http";

export const runtime = "nodejs";

/**
 * RevenueCat server-to-server webhook.
 * Configure in RevenueCat dashboard with Authorization header:
 *   Bearer <REVENUECAT_WEBHOOK_SECRET>
 *
 * Grants credits on NON_RENEWING_PURCHASE / INITIAL_PURCHASE / RENEWAL events.
 * The app must set RevenueCat appUserID to the MobileUser id.
 */
const GRANT_EVENTS = new Set([
  "INITIAL_PURCHASE",
  "NON_RENEWING_PURCHASE",
  "RENEWAL",
  "PRODUCT_CHANGE",
  "TEST",
]);

export async function POST(req: Request) {
  const secret = getRevenueCatWebhookSecret();
  if (secret) {
    const auth = req.headers.get("authorization") ?? "";
    const token = auth.startsWith("Bearer ") ? auth.slice(7) : "";
    if (token !== secret) {
      return mobileError("UNAUTHORIZED", "Invalid webhook secret.", 401);
    }
  }

  const body = await req.json().catch(() => null);
  const event = body?.event;
  if (!event || typeof event !== "object") {
    return mobileError("VALIDATION_ERROR", "Missing event.", 400);
  }

  const type = String(event.type ?? "");
  if (!GRANT_EVENTS.has(type)) {
    // Acknowledge but ignore non-purchase events (CANCELLATION, etc).
    return mobileJson({ ok: true, ignored: type });
  }

  const appUserId = String(event.app_user_id ?? "");
  const productId = String(event.product_id ?? "");
  const amount = creditsForProduct(productId);

  if (!appUserId || amount < 1) {
    return mobileJson({ ok: true, ignored: "no-op" });
  }

  const user = await prisma.mobileUser.findFirst({
    where: { OR: [{ id: appUserId }, { rcAppUserId: appUserId }] },
  });
  if (!user) {
    // Unknown user; acknowledge so RevenueCat stops retrying.
    return mobileJson({ ok: true, ignored: "unknown-user" });
  }

  await prisma.mobileUser.update({
    where: { id: user.id },
    data: {
      credits: { increment: amount },
      rcAppUserId: user.rcAppUserId ?? appUserId,
    },
  });

  return mobileJson({ ok: true, granted: amount });
}
