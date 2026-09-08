import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProductForm } from "../../product-form";
import { ProductTryOnSettings } from "@/components/dashboard/product-try-on-settings";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { parseVariantAttributesFromDb } from "@/lib/shop-theme";
import { getShopProductCategories } from "@/lib/shop-categories";
import { repairCollapsedVariants } from "@/lib/actions/products";

type Params = Promise<{ id: string }>;

export default async function EditProductPage({ params }: { params: Params }) {
  const { shop } = await requireShop();
  const { id } = await params;
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");

  await repairCollapsedVariants(id);

  const product = await prisma.product.findFirst({
    where: { id, shopId: shop.id },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: true,
    },
  });

  if (!product) notFound();

  const categories = await getShopProductCategories(shop.id);

  return (
    <div>
      <DashboardHeader
        title={t("edit")}
        actions={
          <Link href="/dashboard/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />
      <div className="p-4 sm:p-6">
        <ProductForm
          shopId={shop.id}
          product={{
            id: product.id,
            name: product.name,
            description: product.description,
            price: Number(product.price),
            compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
            category: product.category,
            status: product.status,
            isFeatured: product.isFeatured,
            images: product.images.map((img) => img.url),
            variants: product.variants.map((v) => ({
              id: v.id,
              attributes: parseVariantAttributesFromDb(v),
              sku: v.sku ?? "",
              stock: v.stock,
              isAvailable: v.isAvailable,
            })),
          }}
          categories={categories}
        />
        <ProductTryOnSettings
          shopId={shop.id}
          productId={product.id}
          shopEnabled={shop.virtualTryOnEnabled}
          aiCredits={shop.aiCredits}
          images={product.images.map((img) => ({ id: img.id, url: img.url }))}
          initial={{
            tryOnEnabled: product.tryOnEnabled,
            tryOnCategory: product.tryOnCategory,
            tryOnPhotoType: product.tryOnPhotoType,
            tryOnGarmentImageKey: product.tryOnGarmentImageKey,
            tryOnSegmentationFree: product.tryOnSegmentationFree,
          }}
        />
      </div>
    </div>
  );
}
