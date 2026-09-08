import { z } from "zod";
import { prisma } from "@/lib/db";
import { getMobileUserFromRequest } from "@/lib/mobile/auth";
import { creditsForProduct } from "@/lib/mobile/config";
import { corsPreflight, mobileError, mobileJson } from "@/lib/mobile/http";

export const runtime = "nodejs";

/**
 * Demo / sandbox credit grant. In production, credits are granted by the
 * RevenueCat webhook after a verified purchase. This endpoint lets the app
 * complete the purchase flow when running without RevenueCat native billing
 * (e.g. Expo Go / web), so the "1 credit = 1 try" loop is always testable.
 */
const schema = z.object({
  productId: z.string().min(1).max(64).optional(),
  credits: z.number().int().min(1).max(200).optional(),
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const user = await getMobileUserFromRequest(req);
  if (!user) {
    return mobileError("UNAUTHORIZED", "Niste prijavljeni.", 401);
  }

  const body = await req.json().catch(() => ({}));
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return mobileError("VALIDATION_ERROR", "Neispravan zahtev.");
  }

  const amount =
    parsed.data.credits ?? creditsForProduct(parsed.data.productId);
  if (!amount || amount < 1) {
    return mobileError("INVALID_PRODUCT", "Nepoznat paket kredita.");
  }

  const updated = await prisma.mobileUser.update({
    where: { id: user.id },
    data: { credits: { increment: amount } },
  });

  return mobileJson({ ok: true, added: amount, credits: updated.credits });
}
