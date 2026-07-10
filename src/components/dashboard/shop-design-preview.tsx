"use client";

import { useEffect } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { ShoppingBag, Store } from "lucide-react";
import {
  getFontGoogleUrl,
  getShopThemeVars,
} from "@/lib/shop-theme";

export type ShopDesignPreviewProps = {
  shopName: string;
  logoUrl: string;
  coverImageUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  fontFamily: string;
};

const MOCK_PRODUCTS = [
  { name: "Proizvod 1", price: "4.200 RSD" },
  { name: "Proizvod 2", price: "3.500 RSD" },
  { name: "Proizvod 3", price: "6.900 RSD" },
  { name: "Proizvod 4", price: "2.800 RSD" },
];

export function ShopDesignPreview({
  shopName,
  logoUrl,
  coverImageUrl,
  heroTitle,
  heroSubtitle,
  primaryColor,
  backgroundColor,
  cardColor,
  fontFamily,
}: ShopDesignPreviewProps) {
  const t = useTranslations("shop");
  const tShop = useTranslations("publicShop");

  const themeVars = getShopThemeVars({
    primaryColor,
    backgroundColor,
    cardColor,
    fontFamily,
  });

  const fontUrl = getFontGoogleUrl(fontFamily);
  const displayHeroTitle = heroTitle.trim() || shopName || t("shopName");
  const displayHeroSubtitle =
    heroSubtitle.trim() || tShop("heroDefaultSubtitle");

  useEffect(() => {
    if (!fontUrl) return;
    const id = `shop-preview-font-${fontFamily}`;
    if (document.getElementById(id)) return;

    const link = document.createElement("link");
    link.id = id;
    link.rel = "stylesheet";
    link.href = fontUrl;
    document.head.appendChild(link);
  }, [fontFamily, fontUrl]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-muted-foreground">{t("livePreview")}</p>
        <span
          className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
          style={{
            backgroundColor: "var(--shop-primary-muted)",
            color: "var(--shop-primary)",
          }}
        >
          Live
        </span>
      </div>

      <div
        className="overflow-hidden rounded-2xl border shadow-lg ring-1 ring-black/5"
        style={{
          ...themeVars,
          backgroundColor: "var(--shop-bg)",
          color: "var(--shop-text)",
          fontFamily: "var(--shop-font)",
        }}
      >
        <header
          className="flex items-center justify-between border-b px-4 py-3"
          style={{ borderColor: "var(--shop-border)" }}
        >
          <div className="flex min-w-0 items-center gap-2">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="h-7 w-7 rounded-md object-contain"
              />
            ) : (
              <Store className="h-4 w-4" style={{ color: "var(--shop-primary)" }} />
            )}
            <span className="truncate text-xs font-medium">
              {shopName || t("shopName")}
            </span>
          </div>
          <ShoppingBag className="h-4 w-4" />
        </header>

        <div className="relative min-h-[150px]">
          {coverImageUrl ? (
            <Image
              src={coverImageUrl}
              alt=""
              fill
              className="object-cover"
              unoptimized
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, var(--shop-primary), color-mix(in srgb, var(--shop-primary) 40%, #0f172a))`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
          <div className="relative flex min-h-[150px] flex-col justify-end px-4 pb-4 pt-10">
            <h2 className="text-sm font-medium leading-tight text-white line-clamp-2">
              {displayHeroTitle}
            </h2>
            <p className="mt-1.5 text-[10px] leading-relaxed text-white/80 line-clamp-2">
              {displayHeroSubtitle}
            </p>
            <span className="mt-3 inline-flex w-fit rounded-full bg-white px-3 py-1 text-[10px] font-medium text-slate-900">
              {tShop("shopNow")}
            </span>
          </div>
        </div>

        <div className="px-3 py-4">
          <p
            className="mb-3 text-[10px] font-medium uppercase tracking-[0.16em]"
            style={{ color: "var(--shop-text-muted)" }}
          >
            {tShop("allProducts")}
          </p>
          <div className="grid grid-cols-2 gap-3">
            {MOCK_PRODUCTS.map((product) => (
              <div key={product.name}>
                <div
                  className="aspect-[4/5] rounded-xl ring-1 ring-black/5"
                  style={{ backgroundColor: cardColor }}
                />
                <p className="mt-1.5 truncate text-[10px] font-medium">{product.name}</p>
                <p
                  className="text-[10px] font-medium"
                  style={{ color: "var(--shop-primary)" }}
                >
                  {product.price}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
