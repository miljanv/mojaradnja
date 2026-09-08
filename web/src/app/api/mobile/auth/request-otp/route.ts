import { z } from "zod";
import { prisma } from "@/lib/db";
import {
  generateOtpCode,
  hashOtp,
  normalizePhone,
} from "@/lib/mobile/auth";
import {
  FREE_SIGNUP_CREDITS,
  OTP_TTL_MS,
  isOtpDevMode,
} from "@/lib/mobile/config";
import { corsPreflight, mobileError, mobileJson } from "@/lib/mobile/http";

export const runtime = "nodejs";

const schema = z.object({ phone: z.string().min(5).max(20) });

export function OPTIONS() {
  return corsPreflight();
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return mobileError("VALIDATION_ERROR", "Neispravan broj telefona.");
  }

  const phone = normalizePhone(parsed.data.phone);
  if (!phone) {
    return mobileError("INVALID_PHONE", "Unesite ispravan broj telefona.");
  }

  const code = generateOtpCode();
  const otpExpiresAt = new Date(Date.now() + OTP_TTL_MS);

  await prisma.mobileUser.upsert({
    where: { phone },
    create: {
      phone,
      credits: FREE_SIGNUP_CREDITS,
      otpCodeHash: hashOtp(code),
      otpExpiresAt,
      otpAttempts: 0,
    },
    update: {
      otpCodeHash: hashOtp(code),
      otpExpiresAt,
      otpAttempts: 0,
    },
  });

  // TODO: when TWILIO_* is configured, send `code` via SMS here.
  return mobileJson({
    ok: true,
    // Only returned in dev mode (no SMS provider configured).
    devCode: isOtpDevMode() ? code : undefined,
  });
}
