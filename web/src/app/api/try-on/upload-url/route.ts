import { NextResponse } from "next/server";
import { z } from "zod";
import { uploadImageBuffer } from "@/lib/try-on/storage";
import { getOrCreateVisitorSessionId, getClientIpHash } from "@/lib/try-on/visitor";
import { TRY_ON_ERROR_CODES } from "@/lib/try-on/types";
import { prisma } from "@/lib/db";

const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_BYTES = 10 * 1024 * 1024;

const bodySchema = z.object({
  contentType: z.enum(["image/jpeg", "image/png", "image/webp"]),
  /** Base64 without data: prefix */
  dataBase64: z.string().min(100).max(14_000_000),
  fileName: z.string().max(120).optional(),
});

/** In-memory IP rate limit: max 10 uploads / hour */
const uploadHits = new Map<string, { count: number; resetAt: number }>();

function checkIpRateLimit(ipHash: string): boolean {
  const now = Date.now();
  const entry = uploadHits.get(ipHash);
  if (!entry || entry.resetAt < now) {
    uploadHits.set(ipHash, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 10) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    await getOrCreateVisitorSessionId();
    const ipHash = await getClientIpHash();
    if (!checkIpRateLimit(ipHash)) {
      return NextResponse.json(
        { error: TRY_ON_ERROR_CODES.RATE_LIMITED, message: "Previše zahteva. Pokušajte kasnije." },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: TRY_ON_ERROR_CODES.INVALID_IMAGE,
          message: "Fotografija nije podržana. Izaberite JPEG, PNG ili WebP.",
        },
        { status: 400 }
      );
    }

    if (!ALLOWED.has(parsed.data.contentType)) {
      return NextResponse.json(
        {
          error: TRY_ON_ERROR_CODES.INVALID_IMAGE,
          message: "Fotografija nije podržana. Izaberite JPEG, PNG ili WebP.",
        },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(parsed.data.dataBase64, "base64");
    if (buffer.byteLength > MAX_BYTES) {
      return NextResponse.json(
        {
          error: TRY_ON_ERROR_CODES.INVALID_IMAGE,
          message: "Fotografija je prevelika (max 10 MB).",
        },
        { status: 400 }
      );
    }

    // Soft check that shop exists is not required for upload; job creation validates.
    void prisma;

    const ext =
      parsed.data.contentType === "image/png"
        ? "png"
        : parsed.data.contentType === "image/webp"
          ? "webp"
          : "jpg";
    const uploaded = await uploadImageBuffer(
      buffer,
      parsed.data.fileName ?? `try-on-person.${ext}`,
      parsed.data.contentType
    );

    return NextResponse.json({
      personImageKey: uploaded.key,
      // Do not log; return only for immediate client confirmation
      ok: true,
    });
  } catch {
    return NextResponse.json(
      {
        error: TRY_ON_ERROR_CODES.PROVIDER_ERROR,
        message: "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije.",
      },
      { status: 500 }
    );
  }
}
