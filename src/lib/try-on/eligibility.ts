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
    (product.tryOnCategory === "tops" || product.tryOnCategory === "one-pieces") &&
    (product.tryOnPhotoType === "model" || product.tryOnPhotoType === "flat-lay") &&
    !!product.tryOnGarmentImageKey
  );
}
