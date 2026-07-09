"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useCart } from "@/components/shop/cart-provider";
import { formatCurrency } from "@/lib/utils-app";
import { cn } from "@/lib/utils";

export type ShopProduct = {
  id: string;
  name: string;
  slug: string;
  price: number;
  compareAtPrice: number | null;
  category: string | null;
  isFeatured: boolean;
  imageUrl: string | null;
  cardIndex: number;
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

  function handleAddToCart(product: ShopProduct) {
    addItem({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      imageUrl: product.imageUrl,
      price: product.price,
      quantity: 1,
    });
    toast.success(t("addedToCart"));
  }

  function ProductCard({ product }: { product: ShopProduct }) {
    return (
      <article className="group">
        <Link href={`/${shopSlug}/p/${product.slug}`} className="block">
          <div
            className="relative aspect-[4/5] overflow-hidden bg-[var(--shop-card)]"
            style={{ backgroundColor: cardColor }}
          >
            {product.imageUrl ? (
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
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
          </div>
        </Link>

        <div className="mt-3 space-y-1">
          <Link
            href={`/${shopSlug}/p/${product.slug}`}
            className="block text-sm font-medium leading-snug transition-opacity hover:opacity-70"
          >
            {product.name}
          </Link>
          <div className="flex items-baseline gap-2">
            <span className="text-sm" style={{ color: "var(--shop-text-muted)" }}>
              {formatCurrency(product.price)}
            </span>
            {product.compareAtPrice != null && (
              <span className="text-xs line-through opacity-40">
                {formatCurrency(product.compareAtPrice)}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => handleAddToCart(product)}
            className="mt-2 text-xs font-medium underline-offset-4 transition-opacity hover:underline hover:opacity-70"
            style={{ color: "var(--shop-primary)" }}
          >
            {t("addToCart")}
          </button>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-14">
      {featuredProducts.length > 0 && (
        <section>
          <h2 className="mb-8 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "var(--shop-text-muted)" }}>
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
        <div className="flex flex-wrap gap-x-5 gap-y-2 border-b pb-4" style={{ borderColor: "var(--shop-border)" }}>
          <button
            type="button"
            onClick={() => setActiveCategory(null)}
            className={cn(
              "text-sm transition-opacity",
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
                "text-sm transition-opacity",
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
          <h2 className="mb-8 text-xs font-medium uppercase tracking-[0.18em]" style={{ color: "var(--shop-text-muted)" }}>
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
