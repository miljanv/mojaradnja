import { describe, expect, it } from "vitest";
import { productTryOnEligible } from "@/lib/try-on/eligibility";
import {
  TRY_ON_CATEGORIES,
  TRY_ON_ERROR_CODES,
  TRY_ON_PHOTO_TYPES,
} from "@/lib/try-on/types";

describe("productTryOnEligible", () => {
  const base = {
    tryOnEnabled: true,
    tryOnCategory: "tops" as const,
    tryOnPhotoType: "model" as const,
    tryOnGarmentImageKey: "img_1",
    status: "ACTIVE",
  };

  it("returns true when all conditions met", () => {
    expect(productTryOnEligible(base)).toBe(true);
  });

  it("rejects inactive shop product toggle off", () => {
    expect(productTryOnEligible({ ...base, tryOnEnabled: false })).toBe(false);
  });

  it("rejects non-active product", () => {
    expect(productTryOnEligible({ ...base, status: "DRAFT" })).toBe(false);
  });

  it("rejects missing category/photo/garment", () => {
    expect(productTryOnEligible({ ...base, tryOnCategory: null })).toBe(false);
    expect(productTryOnEligible({ ...base, tryOnPhotoType: null })).toBe(false);
    expect(productTryOnEligible({ ...base, tryOnGarmentImageKey: null })).toBe(false);
  });

  it("does not offer bottoms in MVP categories", () => {
    expect(TRY_ON_CATEGORIES).toEqual(["tops", "one-pieces"]);
    expect(TRY_ON_CATEGORIES).not.toContain("bottoms");
  });

  it("supports model and flat-lay photo types", () => {
    expect(TRY_ON_PHOTO_TYPES).toEqual(["model", "flat-lay"]);
  });
});

describe("error codes", () => {
  it("exposes AI_CREDITS_EXHAUSTED", () => {
    expect(TRY_ON_ERROR_CODES.AI_CREDITS_EXHAUSTED).toBe("AI_CREDITS_EXHAUSTED");
  });
});
