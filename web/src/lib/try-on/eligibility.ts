import { TRY_ON_CATEGORIES, TRY_ON_PHOTO_TYPES } from "./types";

export function productTryOnEligible(product: {
  tryOnEnabled: boolean;
  tryOnCategory: string | null;
  tryOnPhotoType: string | null;
  tryOnGarmentImageKey: string | null;
  status: string;
}): boolean {
  return (
    product.tryOnEnabled &&
    product.status === "ACTIVE" &&
    !!product.tryOnCategory &&
    (TRY_ON_CATEGORIES as string[]).includes(product.tryOnCategory) &&
    !!product.tryOnPhotoType &&
    (TRY_ON_PHOTO_TYPES as string[]).includes(product.tryOnPhotoType) &&
    !!product.tryOnGarmentImageKey
  );
}
