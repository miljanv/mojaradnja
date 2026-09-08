import { fal } from "@fal-ai/client";
import {
  FAL_TRY_ON_MODEL,
  type SubmitTryOnInput,
  type SubmitTryOnResult,
  type TryOnProvider,
  type TryOnProviderStatus,
} from "./types";

function getFalKey(): string {
  const raw = process.env.FAL_KEY?.trim() ?? "";
  if (!raw) {
    throw new Error("FAL_KEY is not configured");
  }
  // Users sometimes paste "Key id:secret" or wrap value in quotes.
  return raw
    .replace(/^['"]|['"]$/g, "")
    .replace(/^Key\s+/i, "")
    .trim();
}

function ensureFalConfigured() {
  fal.config({ credentials: getFalKey() });
}

async function toFalHostedUrl(sourceUrl: string): Promise<string> {
  ensureFalConfigured();
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to fetch image for provider (${res.status})`);
  }
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  const ext = contentType.includes("png")
    ? "png"
    : contentType.includes("webp")
      ? "webp"
      : "jpg";
  const file = new File([new Uint8Array(buffer)], `tryon.${ext}`, {
    type: contentType,
  });
  return fal.storage.upload(file);
}

export class FalFashnTryOnProvider implements TryOnProvider {
  async submit(input: SubmitTryOnInput): Promise<SubmitTryOnResult> {
    ensureFalConfigured();

    // Host images on fal so the queue never depends on our CDN / private ACLs.
    const [modelImage, garmentImage] = await Promise.all([
      toFalHostedUrl(input.personImageUrl),
      toFalHostedUrl(input.garmentImageUrl),
    ]);

    const { request_id } = await fal.queue.submit(FAL_TRY_ON_MODEL, {
      input: {
        model_image: modelImage,
        garment_image: garmentImage,
        category: input.category,
        mode: "balanced",
        garment_photo_type: input.garmentPhotoType,
        moderation_level: "permissive",
        num_samples: 1,
        segmentation_free: input.segmentationFree,
        output_format: "jpeg",
      },
    });
    return { providerRequestId: request_id };
  }

  async getStatus(providerRequestId: string): Promise<TryOnProviderStatus> {
    ensureFalConfigured();
    try {
      const status = await fal.queue.status(FAL_TRY_ON_MODEL, {
        requestId: providerRequestId,
        logs: false,
      });

      const statusValue = String(
        (status as { status?: string }).status ?? ""
      );

      if (statusValue === "IN_QUEUE" || statusValue === "IN_PROGRESS") {
        return { status: "processing" };
      }

      if (statusValue === "COMPLETED") {
        const result = await fal.queue.result(FAL_TRY_ON_MODEL, {
          requestId: providerRequestId,
        });
        const data = result.data as {
          images?: Array<{ url?: string }>;
        };
        const resultImageUrl = data.images?.[0]?.url;
        if (!resultImageUrl) {
          return {
            status: "failed",
            error: "Provider returned no image",
          };
        }
        return { status: "completed", resultImageUrl };
      }

      return {
        status: "failed",
        error: `Provider status: ${statusValue || "unknown"}`,
      };
    } catch (e) {
      return {
        status: "failed",
        error: e instanceof Error ? e.message : "Provider status check failed",
      };
    }
  }
}
