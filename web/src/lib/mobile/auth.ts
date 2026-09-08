import { createHash, randomBytes, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";
import type { MobileUser } from "@/lib/prisma-client";

const PHONE_RE = /^\+?[1-9]\d{6,14}$/;

/** Normalize a phone number to a compact E.164-ish string. */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.replace(/[\s()\-.]/g, "");
  if (!PHONE_RE.test(trimmed)) return null;
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

export function generateOtpCode(): string {
  // 6-digit numeric code.
  return String(randomBytes(4).readUInt32BE(0) % 1_000_000).padStart(6, "0");
}

export function hashOtp(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

export function verifyOtpHash(code: string, hash: string | null): boolean {
  if (!hash) return false;
  const a = Buffer.from(hashOtp(code));
  const b = Buffer.from(hash);
  return a.length === b.length && timingSafeEqual(a, b);
}

export function generateSessionToken(): string {
  return randomBytes(32).toString("hex");
}

/** Resolve the authenticated mobile user from the Authorization header. */
export async function getMobileUserFromRequest(
  req: Request
): Promise<MobileUser | null> {
  const header = req.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7).trim() : "";
  if (!token) return null;
  return prisma.mobileUser.findUnique({ where: { token } });
}
