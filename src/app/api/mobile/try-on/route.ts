import { prisma } from "@/lib/db";
import { getMobileUserFromRequest } from "@/lib/mobile/auth";
import { corsPreflight, mobileError, mobileJson } from "@/lib/mobile/http";
import { runMobileTryOn } from "@/lib/mobile/tryon";
import type { TryOnCategory, TryOnPhotoType } from "@/lib/try-on/types";
import { TRY_ON_CATEGORIES, TRY_ON_PHOTO_TYPES } from "@/lib/try-on/types";

export const runtime = "nodejs";
export const maxDuration = 120;

const MAX_BYTES = 12 * 1024 * 1024; // 12MB per image
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export function OPTIONS() {
  return corsPreflight();
}

async function fileToBuffer(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  return { buffer, contentType: file.type || "image/jpeg" };
}

export async function POST(req: Request) {
  const user = await getMobileUserFromRequest(req);
  if (!user) {
    return mobileError("UNAUTHORIZED", "Niste prijavljeni.", 401);
  }

  let form: Awaited<ReturnType<Request["formData"]>>;
  try {
    form = await req.formData();
  } catch {
    return mobileError("VALIDATION_ERROR", "Očekivan je multipart upload.");
  }

  const personFile = form.get("person");
  const garmentFile = form.get("garment");
  if (!(personFile instanceof File) || !(garmentFile instanceof File)) {
    return mobileError(
      "VALIDATION_ERROR",
      "Potrebne su dve fotografije (person i garment)."
    );
  }

  for (const f of [personFile, garmentFile]) {
    if (!ALLOWED.includes(f.type)) {
      return mobileError("INVALID_IMAGE", "Podržani formati: JPEG, PNG, WebP.");
    }
    if (f.size > MAX_BYTES) {
      return mobileError("INVALID_IMAGE", "Fotografija je prevelika (max 12MB).");
    }
  }

  const rawCategory = String(form.get("category") ?? "one-pieces");
  const category = (
    TRY_ON_CATEGORIES.includes(rawCategory as TryOnCategory)
      ? rawCategory
      : "one-pieces"
  ) as TryOnCategory;

  const rawPhotoType = String(form.get("garmentPhotoType") ?? "flat-lay");
  const garmentPhotoType = (
    TRY_ON_PHOTO_TYPES.includes(rawPhotoType as TryOnPhotoType)
      ? rawPhotoType
      : "flat-lay"
  ) as TryOnPhotoType;

  // Atomically consume one credit (guards against races / double taps).
  const consumed = await prisma.mobileUser.updateMany({
    where: { id: user.id, credits: { gte: 1 } },
    data: { credits: { decrement: 1 } },
  });
  if (consumed.count === 0) {
    return mobileError(
      "AI_CREDITS_EXHAUSTED",
      "Nemate dovoljno kredita. Kupite još da nastavite.",
      402
    );
  }

  const [person, garment] = await Promise.all([
    fileToBuffer(personFile),
    fileToBuffer(garmentFile),
  ]);

  const attempt = await prisma.mobileTryOn.create({
    data: {
      userId: user.id,
      status: "PROCESSING",
      provider: "pending",
      personImageUrl: "",
      garmentImageUrl: "",
      category,
    },
  });

  try {
    const result = await runMobileTryOn({
      person,
      garment,
      category,
      garmentPhotoType,
    });

    await prisma.mobileTryOn.update({
      where: { id: attempt.id },
      data: {
        status: "COMPLETED",
        provider: result.provider,
        personImageUrl: result.personImageUrl,
        garmentImageUrl: result.garmentImageUrl,
        resultImageUrl: result.resultImageUrl,
        completedAt: new Date(),
      },
    });

    const fresh = await prisma.mobileUser.findUnique({
      where: { id: user.id },
      select: { credits: true },
    });

    return mobileJson({
      id: attempt.id,
      status: "COMPLETED",
      provider: result.provider,
      resultImageUrl: result.resultImageUrl,
      credits: fresh?.credits ?? 0,
    });
  } catch (e) {
    // Refund the credit on failure (idempotent via creditRefunded flag).
    await prisma.$transaction([
      prisma.mobileUser.update({
        where: { id: user.id },
        data: { credits: { increment: 1 } },
      }),
      prisma.mobileTryOn.update({
        where: { id: attempt.id },
        data: {
          status: "FAILED",
          creditRefunded: true,
          errorMessage: e instanceof Error ? e.message : "Nepoznata greška",
        },
      }),
    ]);

    return mobileError(
      "PROVIDER_ERROR",
      "Probavanje nije uspelo. Kredit je vraćen. Pokušajte ponovo.",
      502
    );
  }
}
