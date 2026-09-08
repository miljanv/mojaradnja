import { getTryOnProvider } from "@/lib/try-on/provider";
import {
  uploadImageBuffer,
  uploadImageFromUrl,
} from "@/lib/try-on/storage";
import type { TryOnCategory, TryOnPhotoType } from "@/lib/try-on/types";
import { isFalConfigured, isUploadThingConfigured } from "./config";

export type MobileTryOnInput = {
  person: { buffer: Buffer; contentType: string };
  garment: { buffer: Buffer; contentType: string };
  category: TryOnCategory;
  garmentPhotoType: TryOnPhotoType;
};

export type MobileTryOnOutput = {
  provider: string;
  personImageUrl: string;
  garmentImageUrl: string;
  resultImageUrl: string;
};

const POLL_INTERVAL_MS = 2500;
const MAX_WAIT_MS = 90_000;

function extFor(contentType: string): string {
  if (contentType.includes("png")) return "png";
  if (contentType.includes("webp")) return "webp";
  return "jpg";
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Real virtual try-on when fal.ai + UploadThing are configured, otherwise a
 * self-contained mock so the mobile app remains fully functional in demo mode.
 */
export async function runMobileTryOn(
  input: MobileTryOnInput
): Promise<MobileTryOnOutput> {
  const realMode = isFalConfigured() && isUploadThingConfigured();

  // Persist both inputs to durable, publicly-fetchable storage.
  const [person, garment] = await Promise.all([
    uploadImageBuffer(
      input.person.buffer,
      `person.${extFor(input.person.contentType)}`,
      input.person.contentType
    ),
    uploadImageBuffer(
      input.garment.buffer,
      `garment.${extFor(input.garment.contentType)}`,
      input.garment.contentType
    ),
  ]);

  if (!realMode) {
    // Demo mode: echo the person photo as the "result" (clearly labelled in UI).
    return {
      provider: "mock",
      personImageUrl: person.url,
      garmentImageUrl: garment.url,
      resultImageUrl: person.url,
    };
  }

  const provider = getTryOnProvider();
  const { providerRequestId } = await provider.submit({
    personImageUrl: person.url,
    garmentImageUrl: garment.url,
    category: input.category,
    garmentPhotoType: input.garmentPhotoType,
    segmentationFree: false,
  });

  const deadline = Date.now() + MAX_WAIT_MS;
  while (Date.now() < deadline) {
    const status = await provider.getStatus(providerRequestId);
    if (status.status === "completed" && status.resultImageUrl) {
      const stored = await uploadImageFromUrl(
        status.resultImageUrl,
        "tryon-result.jpg"
      );
      return {
        provider: process.env.TRY_ON_PROVIDER ?? "fal-fashn-v1.6",
        personImageUrl: person.url,
        garmentImageUrl: garment.url,
        resultImageUrl: stored.url,
      };
    }
    if (status.status === "failed") {
      throw new Error(status.error ?? "Try-on provider failed");
    }
    await sleep(POLL_INTERVAL_MS);
  }

  throw new Error("Try-on timed out");
}
