"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyShopOwnership } from "@/lib/auth";
import { slugify } from "@/lib/utils-app";
import { ensureShopCategory } from "@/lib/actions/categories";
import type { ProductStatus } from "@/lib/prisma-client";
import type { ActionResult } from "./shop";
import {
  expandCollapsedVariants,
  variantNeedsExpand,
  type VariantAttribute,
} from "@/lib/shop-theme";

type VariantInput = {
  id?: string;
  size?: string;
  color?: string;
  optionLabel?: string;
  optionValue?: string;
  attributes?: VariantAttribute[];
  sku?: string;
  stock: number;
  isAvailable: boolean;
};

function expandVariantInputs(variants: VariantInput[]): VariantInput[] {
  return expandCollapsedVariants(
    variants.map((v) => ({
      ...v,
      attributes: v.attributes?.filter((a) => a.label?.trim() && a.value?.trim()) ?? [],
    }))
  ).map((v) => ({
    ...v,
    attributes: (v.attributes as VariantAttribute[]).filter(
      (a) => a.label?.trim() && a.value?.trim()
    ),
  }));
}

function mapVariantToDb(v: VariantInput) {
  const attrs = v.attributes?.filter((a) => a.label && a.value) ?? [];
  const primary = attrs[0];

  return {
    size: undefined,
    color: undefined,
    optionLabel: primary?.label ?? v.optionLabel ?? undefined,
    optionValue: primary?.value ?? v.optionValue ?? undefined,
    attributes: attrs.length ? attrs : undefined,
    sku: v.sku || undefined,
    stock: v.stock,
    isAvailable: v.isAvailable,
  };
}

/** Fix products where multiple option values were saved as one variant. */
export async function repairCollapsedVariants(productId: string): Promise<boolean> {
  const variants = await prisma.productVariant.findMany({ where: { productId } });
  if (!variants.some(variantNeedsExpand)) return false;

  const expanded = expandVariantInputs(
    variants.map((v) => ({
      attributes: Array.isArray(v.attributes)
        ? (v.attributes as VariantAttribute[])
        : [],
      optionLabel: v.optionLabel ?? undefined,
      optionValue: v.optionValue ?? undefined,
      size: v.size ?? undefined,
      color: v.color ?? undefined,
      sku: v.sku ?? undefined,
      stock: v.stock,
      isAvailable: v.isAvailable,
    }))
  );

  await prisma.productVariant.deleteMany({ where: { productId } });
  await prisma.productVariant.createMany({
    data: expanded.map((v) => ({
      productId,
      ...mapVariantToDb(v),
    })),
  });

  return true;
}

export async function createProduct(
  shopId: string,
  data: {
    name: string;
    description?: string;
    price: number;
    compareAtPrice?: number;
    category?: string;
    status: ProductStatus;
    isFeatured: boolean;
    images: string[];
    variants: VariantInput[];
  }
): Promise<ActionResult<{ productId: string }>> {
  try {
    await verifyShopOwnership(shopId);
    const slug = slugify(data.name);

    const existing = await prisma.product.findFirst({
      where: { shopId, slug },
    });
    const finalSlug = existing ? `${slug}-${Date.now()}` : slug;

    if (data.category) {
      await ensureShopCategory(shopId, data.category);
    }

    const product = await prisma.product.create({
      data: {
        shopId,
        name: data.name,
        slug: finalSlug,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        category: data.category,
        status: data.status,
        isFeatured: data.isFeatured,
        images: {
          create: data.images.map((url, i) => ({ url, sortOrder: i })),
        },
        variants: {
          create: data.variants.length
            ? expandVariantInputs(data.variants).map(mapVariantToDb)
            : [{ stock: 100, isAvailable: true }],
        },
      },
    });

    revalidatePath("/dashboard/products");
    return { success: true, data: { productId: product.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create product" };
  }
}

export async function updateProduct(
  shopId: string,
  productId: string,
  data: {
    name?: string;
    description?: string;
    price?: number;
    compareAtPrice?: number | null;
    category?: string;
    status?: ProductStatus;
    isFeatured?: boolean;
    images?: string[];
    variants?: VariantInput[];
  }
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);

    if (data.category) {
      await ensureShopCategory(shopId, data.category);
    }

    if (data.images) {
      await prisma.productImage.deleteMany({ where: { productId } });
      await prisma.productImage.createMany({
        data: data.images.map((url, i) => ({ productId, url, sortOrder: i })),
      });
    }

    if (data.variants) {
      await prisma.productVariant.deleteMany({ where: { productId } });
      await prisma.productVariant.createMany({
        data: expandVariantInputs(data.variants).map((v) => ({
          productId,
          ...mapVariantToDb(v),
        })),
      });
    }

    await prisma.product.update({
      where: { id: productId, shopId },
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        compareAtPrice: data.compareAtPrice,
        category: data.category,
        status: data.status,
        isFeatured: data.isFeatured,
      },
    });

    revalidatePath("/dashboard/products");
    revalidatePath(`/dashboard/products/${productId}/edit`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update product" };
  }
}

export async function deleteProduct(shopId: string, productId: string): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.product.update({
      where: { id: productId, shopId },
      data: { status: "ARCHIVED" },
    });
    revalidatePath("/dashboard/products");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to delete product" };
  }
}
