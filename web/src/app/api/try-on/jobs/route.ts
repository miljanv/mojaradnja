import { NextResponse } from "next/server";
import { z } from "zod";
import { createTryOnJob } from "@/lib/try-on/jobs";
import { TryOnServiceError } from "@/lib/try-on/credits";
import { getOrCreateVisitorSessionId, getClientIpHash } from "@/lib/try-on/visitor";
import { TRY_ON_ERROR_CODES } from "@/lib/try-on/types";

const schema = z.object({
  shopSlug: z.string().min(1).max(100),
  productId: z.string().min(1).max(64),
  personImageKey: z.string().min(1).max(512),
  idempotencyKey: z.string().min(8).max(128),
  consent: z.literal(true),
});

const ipHits = new Map<string, { count: number; resetAt: number }>();

function checkIp(ipHash: string): boolean {
  const now = Date.now();
  const entry = ipHits.get(ipHash);
  if (!entry || entry.resetAt < now) {
    ipHits.set(ipHash, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 20) return false;
  entry.count += 1;
  return true;
}

export async function POST(req: Request) {
  try {
    const visitorSessionId = await getOrCreateVisitorSessionId();
    const ipHash = await getClientIpHash();
    if (!checkIp(ipHash)) {
      return NextResponse.json(
        {
          error: TRY_ON_ERROR_CODES.RATE_LIMITED,
          message: "Previše zahteva. Pokušajte kasnije.",
        },
        { status: 429 }
      );
    }

    const json = await req.json();
    const parsed = schema.safeParse(json);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "VALIDATION_ERROR",
          message: "Neispravan zahtev.",
        },
        { status: 400 }
      );
    }

    const { jobId } = await createTryOnJob({
      shopSlug: parsed.data.shopSlug,
      productId: parsed.data.productId,
      personImageKey: parsed.data.personImageKey,
      visitorSessionId,
      idempotencyKey: parsed.data.idempotencyKey,
    });

    return NextResponse.json({ jobId });
  } catch (e) {
    if (e instanceof TryOnServiceError) {
      const status =
        e.code === TRY_ON_ERROR_CODES.AI_CREDITS_EXHAUSTED
          ? 402
          : e.code === TRY_ON_ERROR_CODES.RATE_LIMITED
            ? 429
            : 400;
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status }
      );
    }
    return NextResponse.json(
      {
        error: TRY_ON_ERROR_CODES.PROVIDER_ERROR,
        message: "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije.",
      },
      { status: 500 }
    );
  }
}
