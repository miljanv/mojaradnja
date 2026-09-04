import { prisma } from "@/lib/db";
import { createId, createShareToken } from "@/lib/try-on/id";
import {
  consumeCreditForJob,
  refundCreditForJob,
  TryOnServiceError,
} from "./credits";
import { getTryOnProvider } from "./provider";
import { getFetchableImageUrl, getPublicImageUrl, uploadImageFromUrl } from "./storage";
import { trackTryOnEvent } from "./analytics";
import {
  MAX_ACTIVE_JOBS_PER_PRODUCT,
  STALE_PROCESSING_HOURS,
  TRY_ON_CATEGORIES,
  TRY_ON_ERROR_CODES,
  TRY_ON_PHOTO_TYPES,
  TRY_ON_PROVIDER_ID,
  type TryOnCategory,
  type TryOnPhotoType,
} from "./types";
import { productTryOnEligible } from "./eligibility";

function isTryOnCategory(v: string | null | undefined): v is TryOnCategory {
  return !!v && (TRY_ON_CATEGORIES as string[]).includes(v);
}

function isTryOnPhotoType(v: string | null | undefined): v is TryOnPhotoType {
  return !!v && (TRY_ON_PHOTO_TYPES as string[]).includes(v);
}

export { productTryOnEligible };

export async function createTryOnJob(params: {
  shopSlug: string;
  productId: string;
  personImageKey: string;
  visitorSessionId: string;
  idempotencyKey: string;
}): Promise<{ jobId: string }> {
  if (params.idempotencyKey.length < 8 || params.idempotencyKey.length > 128) {
    throw new TryOnServiceError("INVALID_IDEMPOTENCY", "Nevažeći idempotency key");
  }

  const existing = await prisma.tryOnJob.findUnique({
    where: { idempotencyKey: params.idempotencyKey },
  });
  if (existing) {
    return { jobId: existing.id };
  }

  const product = await prisma.product.findFirst({
    where: { id: params.productId, shop: { slug: params.shopSlug } },
    include: {
      shop: true,
      images: true,
    },
  });

  if (!product) {
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.PRODUCT_NOT_ELIGIBLE,
      "Proizvod nije pronađen"
    );
  }

  if (!product.shop.virtualTryOnEnabled) {
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.TRY_ON_DISABLED,
      "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije."
    );
  }

  if (!productTryOnEligible(product)) {
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.PRODUCT_NOT_ELIGIBLE,
      "Ovaj proizvod trenutno ne podržava virtualno probavanje."
    );
  }

  const garmentBelongs = product.images.some(
    (img) => img.id === product.tryOnGarmentImageKey || img.url === product.tryOnGarmentImageKey
  );
  if (!garmentBelongs) {
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.INVALID_GARMENT,
      "Fotografija proizvoda za AI nije validna."
    );
  }

  if (product.shop.aiCredits <= 0) {
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.AI_CREDITS_EXHAUSTED,
      "Shop trenutno nema dostupnih AI kredita."
    );
  }

  const activeJob = await prisma.tryOnJob.findFirst({
    where: {
      visitorSessionId: params.visitorSessionId,
      productId: product.id,
      status: { in: ["PENDING", "PROCESSING"] },
    },
  });
  if (activeJob) {
    if (MAX_ACTIVE_JOBS_PER_PRODUCT <= 1) {
      throw new TryOnServiceError(
        TRY_ON_ERROR_CODES.ACTIVE_JOB_EXISTS,
        "Već imate aktivno generisanje za ovaj proizvod."
      );
    }
  }

  const garmentImage = product.images.find(
    (img) => img.id === product.tryOnGarmentImageKey || img.url === product.tryOnGarmentImageKey
  )!;

  const jobId = createId();

  try {
    await prisma.$transaction(async (tx) => {
      await tx.tryOnJob.create({
        data: {
          id: jobId,
          shopId: product.shopId,
          productId: product.id,
          visitorSessionId: params.visitorSessionId,
          provider: TRY_ON_PROVIDER_ID,
          personImageKey: params.personImageKey,
          status: "PENDING",
          creditConsumed: true,
          idempotencyKey: params.idempotencyKey,
          shareToken: createShareToken(),
        },
      });

      const ok = await consumeCreditForJob(tx, {
        shopId: product.shopId,
        tryOnJobId: jobId,
      });
      if (!ok) {
        throw new TryOnServiceError(
          TRY_ON_ERROR_CODES.AI_CREDITS_EXHAUSTED,
          "Shop trenutno nema dostupnih AI kredita."
        );
      }
    });
  } catch (e) {
    if (e instanceof TryOnServiceError) throw e;
    // Unique idempotency race
    const raced = await prisma.tryOnJob.findUnique({
      where: { idempotencyKey: params.idempotencyKey },
    });
    if (raced) return { jobId: raced.id };
    throw e;
  }

  await trackTryOnEvent({
    shopId: product.shopId,
    productId: product.id,
    tryOnJobId: jobId,
    visitorSessionId: params.visitorSessionId,
    type: "TRY_ON_STARTED",
  });

  const provider = getTryOnProvider();
  try {
    const [personImageUrl, garmentImageUrl] = await Promise.all([
      getFetchableImageUrl(params.personImageKey),
      getFetchableImageUrl(garmentImage.url),
    ]);

    const submitted = await provider.submit({
      personImageUrl,
      garmentImageUrl,
      category: product.tryOnCategory as TryOnCategory,
      garmentPhotoType: product.tryOnPhotoType as TryOnPhotoType,
      segmentationFree: product.tryOnSegmentationFree,
    });

    await prisma.tryOnJob.update({
      where: { id: jobId },
      data: {
        providerRequestId: submitted.providerRequestId,
        status: "PROCESSING",
        startedAt: new Date(),
      },
    });
  } catch (e) {
    await failJobAndRefund(
      jobId,
      TRY_ON_ERROR_CODES.PROVIDER_ERROR,
      e instanceof Error ? e.message : "Submit failed"
    );
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.PROVIDER_ERROR,
      "Generisanje nije uspelo. Kredit nije potrošen."
    );
  }

  return { jobId };
}

export async function failJobAndRefund(
  jobId: string,
  errorCode: string,
  errorMessage: string
): Promise<void> {
  await prisma.tryOnJob.update({
    where: { id: jobId },
    data: {
      status: "FAILED",
      errorCode,
      errorMessage,
      failedAt: new Date(),
    },
  });
  await refundCreditForJob(jobId);

  const job = await prisma.tryOnJob.findUnique({ where: { id: jobId } });
  if (job) {
    await trackTryOnEvent({
      shopId: job.shopId,
      productId: job.productId,
      tryOnJobId: job.id,
      visitorSessionId: job.visitorSessionId,
      type: "TRY_ON_FAILED",
      metadata: { errorCode },
    });
  }
}

export async function syncTryOnJobStatus(
  jobId: string,
  visitorSessionId: string | null
): Promise<{
  id: string;
  status: string;
  resultImageUrl?: string;
  errorCode?: string | null;
  errorMessage?: string | null;
  shareToken?: string | null;
}> {
  const job = await prisma.tryOnJob.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.JOB_NOT_FOUND,
      "Job nije pronađen"
    );
  }

  if (
    visitorSessionId &&
    job.visitorSessionId &&
    job.visitorSessionId !== visitorSessionId
  ) {
    throw new TryOnServiceError(
      TRY_ON_ERROR_CODES.UNAUTHORIZED,
      "Nemate pristup ovom poslu"
    );
  }

  if (job.status === "COMPLETED") {
    return {
      id: job.id,
      status: job.status,
      resultImageUrl: job.resultImageKey
        ? getPublicImageUrl(job.resultImageKey)
        : undefined,
      shareToken: job.shareToken,
    };
  }

  if (job.status === "FAILED") {
    return {
      id: job.id,
      status: job.status,
      errorCode: job.errorCode,
      errorMessage: publicErrorMessage(job.errorCode),
    };
  }

  if (!job.providerRequestId) {
    return { id: job.id, status: job.status };
  }

  const provider = getTryOnProvider();
  const status = await provider.getStatus(job.providerRequestId);

  if (status.status === "processing") {
    return { id: job.id, status: "PROCESSING" };
  }

  if (status.status === "failed") {
    const canRetry =
      job.retryCount < 1 && isSafeTechnicalError(status.error);
    if (canRetry) {
      await retryProviderSubmit(job.id);
      return { id: job.id, status: "PROCESSING" };
    }
    await failJobAndRefund(
      job.id,
      TRY_ON_ERROR_CODES.PROVIDER_ERROR,
      status.error ?? "Provider failed"
    );
    return {
      id: job.id,
      status: "FAILED",
      errorCode: TRY_ON_ERROR_CODES.PROVIDER_ERROR,
      errorMessage: "Generisanje nije uspelo. Kredit nije potrošen.",
    };
  }

  // completed — copy result into our storage (idempotent)
  const claimed = await prisma.tryOnJob.updateMany({
    where: {
      id: job.id,
      status: { in: ["PENDING", "PROCESSING"] },
      resultImageKey: null,
    },
    data: { status: "PROCESSING" },
  });

  if (claimed.count === 0) {
    const fresh = await prisma.tryOnJob.findUnique({ where: { id: job.id } });
    return {
      id: job.id,
      status: fresh?.status ?? "PROCESSING",
      resultImageUrl: fresh?.resultImageKey
        ? getPublicImageUrl(fresh.resultImageKey)
        : undefined,
      shareToken: fresh?.shareToken,
    };
  }

  try {
    const uploaded = await uploadImageFromUrl(
      status.resultImageUrl!,
      `try-on-${job.id}.jpg`
    );
    const shareToken = job.shareToken ?? createShareToken();
    await prisma.tryOnJob.update({
      where: { id: job.id },
      data: {
        status: "COMPLETED",
        resultImageKey: uploaded.key,
        completedAt: new Date(),
        shareToken,
      },
    });
    await trackTryOnEvent({
      shopId: job.shopId,
      productId: job.productId,
      tryOnJobId: job.id,
      visitorSessionId: job.visitorSessionId,
      type: "TRY_ON_COMPLETED",
    });
    return {
      id: job.id,
      status: "COMPLETED",
      resultImageUrl: uploaded.url,
      shareToken,
    };
  } catch (e) {
    await failJobAndRefund(
      job.id,
      TRY_ON_ERROR_CODES.PROVIDER_ERROR,
      e instanceof Error ? e.message : "Result copy failed"
    );
    return {
      id: job.id,
      status: "FAILED",
      errorCode: TRY_ON_ERROR_CODES.PROVIDER_ERROR,
      errorMessage: "Generisanje nije uspelo. Kredit nije potrošen.",
    };
  }
}

async function retryProviderSubmit(jobId: string): Promise<void> {
  const job = await prisma.tryOnJob.findUnique({
    where: { id: jobId },
    include: {
      product: { include: { images: true, shop: true } },
    },
  });
  if (!job || job.retryCount >= 1) return;

  const garmentImage = job.product.images.find(
    (img) =>
      img.id === job.product.tryOnGarmentImageKey ||
      img.url === job.product.tryOnGarmentImageKey
  );
  if (!garmentImage || !isTryOnCategory(job.product.tryOnCategory) || !isTryOnPhotoType(job.product.tryOnPhotoType)) {
    return;
  }

  const provider = getTryOnProvider();
  const [personImageUrl, garmentImageUrl] = await Promise.all([
    getFetchableImageUrl(job.personImageKey),
    getFetchableImageUrl(garmentImage.url),
  ]);
  const submitted = await provider.submit({
    personImageUrl,
    garmentImageUrl,
    category: job.product.tryOnCategory,
    garmentPhotoType: job.product.tryOnPhotoType,
    segmentationFree: job.product.tryOnSegmentationFree,
  });

  await prisma.tryOnJob.update({
    where: { id: jobId },
    data: {
      providerRequestId: submitted.providerRequestId,
      retryCount: { increment: 1 },
      status: "PROCESSING",
      startedAt: new Date(),
      errorCode: null,
      errorMessage: null,
    },
  });
}

function isSafeTechnicalError(error?: string): boolean {
  if (!error) return true;
  const lower = error.toLowerCase();
  return (
    lower.includes("timeout") ||
    lower.includes("network") ||
    lower.includes("econn") ||
    lower.includes("503") ||
    lower.includes("502") ||
    lower.includes("temporarily")
  );
}

function publicErrorMessage(code: string | null | undefined): string {
  switch (code) {
    case TRY_ON_ERROR_CODES.AI_CREDITS_EXHAUSTED:
      return "Shop trenutno nema dostupnih AI kredita.";
    case TRY_ON_ERROR_CODES.PRODUCT_NOT_ELIGIBLE:
      return "Ovaj proizvod trenutno ne podržava virtualno probavanje.";
    case TRY_ON_ERROR_CODES.PROVIDER_ERROR:
      return "Generisanje nije uspelo. Kredit nije potrošen.";
    default:
      return "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije.";
  }
}

export async function reconcileStaleJobs(): Promise<number> {
  const cutoff = new Date(Date.now() - STALE_PROCESSING_HOURS * 60 * 60 * 1000);
  const stale = await prisma.tryOnJob.findMany({
    where: {
      status: { in: ["PENDING", "PROCESSING"] },
      createdAt: { lt: cutoff },
    },
    take: 50,
  });

  let handled = 0;
  for (const job of stale) {
    try {
      if (job.providerRequestId) {
        await syncTryOnJobStatus(job.id, job.visitorSessionId);
        const fresh = await prisma.tryOnJob.findUnique({ where: { id: job.id } });
        if (fresh && (fresh.status === "PENDING" || fresh.status === "PROCESSING")) {
          await failJobAndRefund(
            job.id,
            TRY_ON_ERROR_CODES.PROVIDER_ERROR,
            "Stale job reconciliation"
          );
        }
      } else {
        await failJobAndRefund(
          job.id,
          TRY_ON_ERROR_CODES.PROVIDER_ERROR,
          "Stale job without provider request"
        );
      }
      handled += 1;
    } catch {
      // continue
    }
  }
  return handled;
}

export async function cleanupExpiredTryOnImages(): Promise<{
  personDeleted: number;
  resultDeleted: number;
}> {
  const inputHours = Number(process.env.TRY_ON_INPUT_RETENTION_HOURS ?? 24);
  // Results outlive inputs so shared KakoMiStoji links stay alive for a few days.
  const resultHours = Number(process.env.TRY_ON_RESULT_RETENTION_HOURS ?? 72);
  const inputCutoff = new Date(Date.now() - inputHours * 60 * 60 * 1000);
  const resultCutoff = new Date(Date.now() - resultHours * 60 * 60 * 1000);

  const { deleteStoredFiles } = await import("./storage");

  const personJobs = await prisma.tryOnJob.findMany({
    where: {
      personImageDeletedAt: null,
      createdAt: { lt: inputCutoff },
      status: { in: ["COMPLETED", "FAILED"] },
    },
    take: 100,
    select: { id: true, personImageKey: true },
  });

  let personDeleted = 0;
  for (const job of personJobs) {
    await deleteStoredFiles([job.personImageKey]);
    await prisma.tryOnJob.update({
      where: { id: job.id },
      data: { personImageDeletedAt: new Date() },
    });
    personDeleted += 1;
  }

  const resultJobs = await prisma.tryOnJob.findMany({
    where: {
      resultImageDeletedAt: null,
      resultImageKey: { not: null },
      completedAt: { lt: resultCutoff },
      status: "COMPLETED",
    },
    take: 100,
    select: { id: true, resultImageKey: true },
  });

  let resultDeleted = 0;
  for (const job of resultJobs) {
    if (job.resultImageKey) {
      await deleteStoredFiles([job.resultImageKey]);
    }
    await prisma.tryOnJob.update({
      where: { id: job.id },
      data: { resultImageDeletedAt: new Date() },
    });
    resultDeleted += 1;
  }

  return { personDeleted, resultDeleted };
}

export async function linkTryOnJobsToOrder(params: {
  shopId: string;
  orderId: string;
  visitorSessionId: string | null;
  productIds: string[];
}): Promise<void> {
  if (!params.visitorSessionId || params.productIds.length === 0) return;

  const jobs = await prisma.tryOnJob.findMany({
    where: {
      shopId: params.shopId,
      visitorSessionId: params.visitorSessionId,
      productId: { in: params.productIds },
      status: "COMPLETED",
      orderId: null,
    },
  });

  if (jobs.length === 0) return;

  await prisma.tryOnJob.updateMany({
    where: { id: { in: jobs.map((j) => j.id) } },
    data: { orderId: params.orderId },
  });

  for (const job of jobs) {
    await trackTryOnEvent({
      shopId: params.shopId,
      productId: job.productId,
      tryOnJobId: job.id,
      visitorSessionId: params.visitorSessionId,
      orderId: params.orderId,
      type: "ORDER_CREATED_AFTER_TRY_ON",
    });
  }
}

export async function getMerchantTryOnStats(shopId: string) {
  const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const shop = await prisma.shop.findUnique({
    where: { id: shopId },
    select: {
      aiCredits: true,
      virtualTryOnEnabled: true,
    },
  });

  const [completedTotal, completed30d, failedTotal, topProducts, ordersAfter] =
    await Promise.all([
      prisma.tryOnJob.count({
        where: { shopId, status: "COMPLETED" },
      }),
      prisma.tryOnJob.count({
        where: { shopId, status: "COMPLETED", completedAt: { gte: since30 } },
      }),
      prisma.tryOnJob.count({
        where: { shopId, status: "FAILED" },
      }),
      prisma.tryOnJob.groupBy({
        by: ["productId"],
        where: { shopId, status: "COMPLETED" },
        _count: { productId: true },
        orderBy: { _count: { productId: "desc" } },
        take: 5,
      }),
      prisma.tryOnJob.count({
        where: { shopId, status: "COMPLETED", orderId: { not: null } },
      }),
    ]);

  const productIds = topProducts.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const nameById = new Map(products.map((p) => [p.id, p.name]));

  return {
    virtualTryOnEnabled: shop?.virtualTryOnEnabled ?? false,
    aiCredits: shop?.aiCredits ?? 0,
    completedTotal,
    completed30d,
    failedTotal,
    ordersAfterTryOn: ordersAfter,
    topProducts: topProducts.map((p) => ({
      productId: p.productId,
      name: nameById.get(p.productId) ?? "—",
      count: p._count.productId,
    })),
  };
}
