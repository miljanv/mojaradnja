import { cookies, headers } from "next/headers";
import { createHash, randomBytes } from "crypto";
import { VISITOR_COOKIE_NAME } from "./types";

export async function getOrCreateVisitorSessionId(): Promise<string> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE_NAME)?.value;
  if (existing && /^[a-zA-Z0-9_-]{16,64}$/.test(existing)) {
    return existing;
  }

  const id = randomBytes(24).toString("base64url");
  jar.set(VISITOR_COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return id;
}

export async function getVisitorSessionId(): Promise<string | null> {
  const jar = await cookies();
  const existing = jar.get(VISITOR_COOKIE_NAME)?.value;
  if (existing && /^[a-zA-Z0-9_-]{16,64}$/.test(existing)) {
    return existing;
  }
  return null;
}

export async function getClientIpHash(): Promise<string> {
  const h = await headers();
  const ip =
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "unknown";
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}
