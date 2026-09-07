import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  generateSessionToken,
  normalizePhone,
  verifyOtpHash,
} from "@/lib/mobile/auth";
import { OTP_MAX_ATTEMPTS } from "@/lib/mobile/config";
import { corsPreflight, mobileError, mobileJson } from "@/lib/mobile/http";

export const runtime = "nodejs";

const schema = z.object({
  phone: z.string().min(5).max(20),
  code: z.string().min(4).max(8),
});

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return mobileError("VALIDATION_ERROR", "Neispravan zahtev.");
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return mobileError("INVALID_PHONE", "Unesite ispravan broj telefona.");
  }

  const user = await prisma.mobileUser.findUnique({ where: { phone } });
  if (!user || !user.otpCodeHash || !user.otpExpiresAt) {
    return mobileError("OTP_NOT_REQUESTED", "Zatražite kod ponovo.", 400);
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    return mobileError("OTP_EXPIRED", "Kod je istekao. Zatražite novi.", 400);
  }

  if (user.otpAttempts >= OTP_MAX_ATTEMPTS) {
    return mobileError(
      "OTP_TOO_MANY_ATTEMPTS",
      "Previše pokušaja. Zatražite novi kod.",
      429
    );
  }

  if (!verifyOtpHash(parsed.data.code, user.otpCodeHash)) {
    await prisma.mobileUser.update({
      where: { id: user.id },
      data: { otpAttempts: { increment: 1 } },
    });
    return mobileError("OTP_INVALID", "Pogrešan kod.", 401);
  }

  const token = generateSessionToken();
  const updated = await prisma.mobileUser.update({
    where: { id: user.id },
    data: {
      token,
      otpCodeHash: null,
      otpExpiresAt: null,
      otpAttempts: 0,
    },
  });

  return mobileJson({
    token,
    user: {
      id: updated.id,
      phone: updated.phone,
      credits: updated.credits,
    },
  });
}
