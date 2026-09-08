-- Per-product FASHN segmentation_free flag. Category "bottoms" is a string enum in app code.

ALTER TABLE "Product"
  ADD COLUMN IF NOT EXISTS "tryOnSegmentationFree" BOOLEAN NOT NULL DEFAULT true;
