export type TryOnCategory = "tops" | "bottoms" | "one-pieces";

export type TryOnPhotoType = "model" | "flat-lay";

export const TRY_ON_CATEGORIES: TryOnCategory[] = ["tops", "bottoms", "one-pieces"];
export const TRY_ON_PHOTO_TYPES: TryOnPhotoType[] = ["model", "flat-lay"];

export type SubmitTryOnInput = {
  personImageUrl: string;
  garmentImageUrl: string;
  category: TryOnCategory;
  garmentPhotoType: TryOnPhotoType;
  /** FASHN: true = bulkier garments / natural body; false = strip leftover clothes. */
  segmentationFree: boolean;
};

export type SubmitTryOnResult = {
  providerRequestId: string;
};

export type TryOnProviderStatus = {
  status: "processing" | "completed" | "failed";
  resultImageUrl?: string;
  error?: string;
};

export interface TryOnProvider {
  submit(input: SubmitTryOnInput): Promise<SubmitTryOnResult>;
  getStatus(providerRequestId: string): Promise<TryOnProviderStatus>;
}

export const TRY_ON_ERROR_CODES = {
  AI_CREDITS_EXHAUSTED: "AI_CREDITS_EXHAUSTED",
  TRY_ON_DISABLED: "TRY_ON_DISABLED",
  PRODUCT_NOT_ELIGIBLE: "PRODUCT_NOT_ELIGIBLE",
  RATE_LIMITED: "RATE_LIMITED",
  ACTIVE_JOB_EXISTS: "ACTIVE_JOB_EXISTS",
  INVALID_IMAGE: "INVALID_IMAGE",
  INVALID_GARMENT: "INVALID_GARMENT",
  PROVIDER_ERROR: "PROVIDER_ERROR",
  JOB_NOT_FOUND: "JOB_NOT_FOUND",
  UNAUTHORIZED: "UNAUTHORIZED",
} as const;

export type TryOnErrorCode =
  (typeof TRY_ON_ERROR_CODES)[keyof typeof TRY_ON_ERROR_CODES];

export const FAL_TRY_ON_MODEL = "fal-ai/fashn/tryon/v1.6";
export const TRY_ON_PROVIDER_ID = "fal-fashn-v1.6";

export const VISITOR_COOKIE_NAME = "ms_visitor_id";
/** Granted automatically the first time an admin enables KakoMiStoji for a shop. */
export const FREE_TRY_ON_CREDITS = 10;
export const MAX_ACTIVE_JOBS_PER_PRODUCT = 1;
export const JOB_POLL_INTERVAL_MS = 2500;
export const STALE_PROCESSING_HOURS = 1;
