import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getPublishedShop } from "@/lib/shop-public";
import { formatCurrency } from "@/lib/utils-app";
import { ArrowLeft } from "lucide-react";
import { ProductOrderForm } from "./product-order-form";
import { TryOnButton } from "@/components/try-on/try-on-modal";
import { productTryOnEligible } from "@/lib/try-on/eligibility";

type PageProps = {
  params: Promise<{ shopSlug: string; productSlug: string }>;
};

export default async function ProductPage({ params }: PageProps) {
  const { shopSlug, productSlug } = await params;
  const shop = await getPublishedShop(shopSlug);

  if (!shop) {
    notFound();
  }

  const product = await prisma.product.findFirst({
    where: {
      shopId: shop.id,
      slug: productSlug,
      status: { in: ["ACTIVE", "SOLD_OUT"] },
    },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!product) {
    notFound();
  }

  const t = await getTranslations("publicShop");
  const price = Number(product.price);
  const compareAtPrice = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const soldOut = product.status === "SOLD_OUT";

  return (
    <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-12">
      <Link
        href={`/${shop.slug}`}
        className="mb-8 inline-flex items-center gap-2 text-sm transition-opacity hover:opacity-70"
        style={{ color: "var(--shop-text-muted)" }}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("backToShop")}
      </Link>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <div className="space-y-3">
          {product.images.length > 0 ? (
            <>
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl bg-[var(--shop-card)] ring-1 ring-black/5">
                <Image
                  src={product.images[0].url}
                  alt={product.name}
                  fill
                  className={soldOut ? "object-cover grayscale" : "object-cover"}
                  priority
                  unoptimized
                />
                {soldOut && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <span className="rounded-full bg-white px-4 py-1.5 text-xs font-medium uppercase tracking-wide">
                      {t("soldOut")}
                    </span>
                  </div>
                )}
              </div>
              {product.images.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {product.images.slice(1).map((image) => (
                    <div
                      key={image.id}
                      className="relative aspect-square overflow-hidden rounded-lg bg-[var(--shop-card)] ring-1 ring-black/5"
                    >
                      <Image
                        src={image.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div
              className="flex aspect-[4/5] items-center justify-center rounded-xl bg-[var(--shop-card)] ring-1 ring-black/5"
              style={{ color: "var(--shop-text-muted)" }}
            >
              —
            </div>
          )}
        </div>

        <div className="space-y-8 lg:pt-4">
          <div>
            {product.category && (
              <p
                className="text-xs font-medium uppercase tracking-[0.16em]"
                style={{ color: "var(--shop-text-muted)" }}
              >
                {product.category}
              </p>
            )}
            <h1 className="mt-2 text-3xl font-medium tracking-tight sm:text-4xl">
              {product.name}
            </h1>
            <div className="mt-4 flex items-baseline gap-3">
              <span
                className={soldOut ? "text-xl font-medium line-through opacity-50" : "text-xl font-medium text-[var(--shop-primary)]"}
              >
                {formatCurrency(price)}
              </span>
              {compareAtPrice != null && !soldOut && (
                <span className="text-base line-through opacity-40">
                  {formatCurrency(compareAtPrice)}
                </span>
              )}
            </div>
            {product.description && (
              <p
                className="mt-5 text-sm leading-relaxed sm:text-base"
                style={{ color: "var(--shop-text-muted)" }}
              >
                {product.description}
              </p>
            )}
          </div>

          {shop.virtualTryOnEnabled &&
            productTryOnEligible(product) &&
            shop.aiCredits > 0 &&
            (() => {
              const garment =
                product.images.find(
                  (img) =>
                    img.id === product.tryOnGarmentImageKey ||
                    img.url === product.tryOnGarmentImageKey
                ) ?? product.images[0];
              if (!garment) return null;
              return (
                <TryOnButton
                  shopSlug={shop.slug}
                  productId={product.id}
                  productName={product.name}
                  garmentImageUrl={garment.url}
                  primaryColor={shop.primaryColor}
                />
              );
            })()}

          <div id="product-order-form">
          <ProductOrderForm
            shopSlug={shop.slug}
            shopName={shop.name}
            productId={product.id}
            productSlug={product.slug}
            productName={product.name}
            imageUrl={product.images[0]?.url}
            price={price}
            productStatus={product.status}
            variants={product.variants.map((v) => ({
              id: v.id,
              size: v.size,
              color: v.color,
              optionLabel: v.optionLabel,
              optionValue: v.optionValue,
              attributes: v.attributes,
              stock: v.stock,
              isAvailable: v.isAvailable,
            }))}
          />
          </div>
        </div>
      </div>
    </div>
  );
}
