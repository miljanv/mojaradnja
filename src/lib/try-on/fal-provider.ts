import { fal } from "@fal-ai/client";
import {
  FAL_TRY_ON_MODEL,
  type SubmitTryOnInput,
  type SubmitTryOnResult,
  type TryOnProvider,
  type TryOnProviderStatus,
} from "./types";

function ensureFalConfigured() {
  const key = process.env.FAL_KEY;
  if (!key) {
    throw new Error("FAL_KEY is not configured");
  }
  fal.config({ credentials: key });
}

export class FalFashnTryOnProvider implements TryOnProvider {
  async submit(input: SubmitTryOnInput): Promise<SubmitTryOnResult> {
    ensureFalConfigured();
    const { request_id } = await fal.queue.submit(FAL_TRY_ON_MODEL, {
      input: {
        model_image: input.personImageUrl,
        garment_image: input.garmentImageUrl,
        category: input.category,
        mode: "balanced",
        garment_photo_type: input.garmentPhotoType,
        moderation_level: "permissive",
        num_samples: 1,
        segmentation_free: true,
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
