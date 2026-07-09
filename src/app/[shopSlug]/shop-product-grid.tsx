"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import { getVariantDisplayValue } from "@/lib/shop-theme";
import { formatCurrency } from "@/lib/utils-app";
import { cn } from "@/lib/utils";

export type ShopProductVariant = {
  id: string;
  size: string | null;
  color: string | null;
  optionLabel: string | null;
  optionValue: string | null;
  attributes: unknown;
  stock: number;
  isAvailable: boolean;
};

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  category: string | null;
  status: "ACTIVE" | "SOLD_OUT" | "DRAFT" | "ARCHIVED";
  isFeatured: boolean;
  imageUrl: string | null;
  cardIndex: number;
  variants: ShopProductVariant[];
};

type ShopProductGridProps = {
  shopSlug: string;
  cardColor: string;
  products: ShopProduct[];
  featuredProducts: ShopProduct[];
};

export function ShopProductGrid({
  shopSlug,
  cardColor,
  products,
  featuredProducts,
}: ShopProductGridProps) {
  const t = useTranslations("publicShop");
  const { addItem } = useCart();
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort();
  }, [products]);

  const filteredProducts = useMemo(() => {
    if (!activeCategory) return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  function isSoldOut(product: ShopProduct) {
    if (product.status === "SOLD_OUT") return true;
    if (product.variants.length === 0) return false;
    return product.variants.every((v) => !v.isAvailable || v.stock <= 0);
  }

  function handleAddToCart(product: ShopProduct) {
    if (isSoldOut(product)) return;

    const hasVariants = product.variants.length > 0;
    const variantId = selectedVariants[product.id];
    const variant = product.variants.find((v) => v.id === variantId);

    if (hasVariants && !variant) {
      toast.error(t("selectVariantFirst"));
      return;
    }

    if (variant && (!variant.isAvailable || variant.stock <= 0)) {
      toast.error(t("outOfStock"));
      return;
    }

    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      variantId: variant?.id,
      variantInfo: variant ? getVariantDisplayValue(variant) : undefined,
      quantity: 1,
    });
    toast.success(t("addedToCart"));
  }

  function ProductCard({ product }: { product: ShopProduct }) {
    const soldOut = isSoldOut(product);
    const hasVariants = product.variants.length > 0;

    return (
      <article className={cn("group", soldOut && "opacity-80")}>
        <Link href={`/${shopSlug}/p/${product.slug}`} className="block">
          <div
            className="relative aspect-[4/5] overflow-hidden"
            style={{ backgroundColor: cardColor }}
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className={cn(
                  "object-cover transition-transform duration-500 group-hover:scale-[1.03]",
                  soldOut && "grayscale"
                )}
                unoptimized
              />
            ) : (
              <div
                className="flex h-full items-center justify-center text-sm"
                style={{ color: "var(--shop-text-muted)" }}
              >
                —
              </div>
            )}
            {soldOut && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/35">
                <span className="rounded-full bg-white/95 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-900">
                  {t("soldOut")}
                </span>
              </div>
            )}
          </div>
        </Link>

        <div className="mt-3 space-y-2">
          <Link
            href={`/${shopSlug}/p/${product.slug}`}
            className="block text-sm font-medium leading-snug transition-opacity hover:opacity-70"
          >
            {product.name}
          </Link>
          <div className="flex items-baseline gap-2">
            <span
              className={cn("text-sm", soldOut && "line-through opacity-50")}
              style={{ color: "var(--shop-text-muted)" }}
            >
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice != null && !soldOut && (
              <span className="text-xs line-through opacity-40">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>

          {hasVariants && !soldOut && (
            <select
              className="w-full cursor-pointer rounded-md border bg-transparent px-2 py-1.5 text-xs outline-none transition-colors hover:border-[var(--shop-primary)]"
              style={{ borderColor: "var(--shop-border)", color: "var(--shop-text)" }}
              value={selectedVariants[product.id] ?? ""}
              onChange={(e) =>
                setSelectedVariants((prev) => ({
                  ...prev,
                  [product.id]: e.target.value,
                }))
              }
            >
              <option value="">{t("selectVariant")}</option>
              {product.variants.map((v) => {
                const unavailable = !v.isAvailable || v.stock <= 0;
                return (
                  <option key={v.id} value={v.id} disabled={unavailable}>
                    {getVariantDisplayValue(v)}
                    {unavailable ? ` (${t("soldOut")})` : ""}
                  </option>
                );
              })}
            </select>
          )}

          {soldOut ? (
            <p className="text-xs font-medium" style={{ color: "var(--shop-text-muted)" }}>
              {t("soldOutHint")}
            </p>
          ) : (
            <button
              type="button"
              onClick={() => handleAddToCart(product)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-md border px-3 py-2 text-xs font-medium transition-colors hover:bg-[var(--shop-primary)] hover:text-white"
              style={{
                borderColor: "var(--shop-primary)",
                color: "var(--shop-primary)",
              }}
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              {t("addToCart")}
            </button>
          )}
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-14">
      {featuredProducts.length > 0 && (
        <section>
          <h2
            className="mb-8 text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--shop-text-muted)" }}
          >
            {t("featured")}
          </h2>
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {featuredProducts.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {categories.length > 0 && (
        <div
          className="flex flex-wrap gap-x-5 gap-y-2 border-b pb-4"
          style={{ borderColor: "var(--shop-border)" }}
        >
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "cursor-pointer text-sm transition-opacity",
              activeCategory === null ? "font-medium" : "opacity-50 hover:opacity-80"
            )}
          >
            {t("allProducts")}
          </button>
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "cursor-pointer text-sm transition-opacity",
                activeCategory === category ? "font-medium" : "opacity-50 hover:opacity-80"
              )}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      <section>
        {categories.length === 0 && (
          <h2
            className="mb-8 text-xs font-medium uppercase tracking-[0.18em]"
            style={{ color: "var(--shop-text-muted)" }}
          >
            {t("allProducts")}
          </h2>
        )}
        {filteredProducts.length === 0 ? (
          <p className="py-20 text-center text-sm" style={{ color: "var(--shop-text-muted)" }}>
            {t("noProducts")}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
