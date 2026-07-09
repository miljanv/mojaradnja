"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { useCart } from "@/components/shop/cart-provider";
import { getInstagramUrl } from "@/lib/shop-public-client";
import { ShoppingBag, Store } from "lucide-react";

type ShopHeaderProps = {
  shop: {
    slug: string;
    name: string;
    logoUrl: string | null;
    instagramUsername: string | null;
  };
};

export function ShopHeader({ shop }: ShopHeaderProps) {
  const t = useTranslations("publicShop");
  const { count } = useCart();
  const instagramUrl = getInstagramUrl(shop.instagramUsername);

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{
        borderColor: "var(--shop-border)",
        backgroundColor: "color-mix(in srgb, var(--shop-bg) 92%, transparent)",
      }}
    >
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3.5 sm:px-8">
        <Link
          href={`/${shop.slug}`}
          className="flex min-w-0 items-center gap-2.5 transition-opacity hover:opacity-70"
        >
          {shop.logoUrl ? (
            <img
              src={shop.logoUrl}
              alt={shop.name}
              className="h-8 w-8 shrink-0 rounded-full object-cover"
            />
          ) : (
            <Store
              className="h-5 w-5 shrink-0"
              style={{ color: "var(--shop-primary)" }}
            />
          )}
          <span className="truncate text-sm font-medium tracking-wide sm:text-[15px]">
            {shop.name}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-1">
          {instagramUrl && (
            <Link
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden px-3 py-2 text-sm transition-opacity hover:opacity-70 sm:inline"
              style={{ color: "var(--shop-text-muted)" }}
            >
              Instagram
            </Link>
          )}
          <Link
            href={`/${shop.slug}/korpa`}
            className="relative flex items-center gap-2 rounded-full px-2.5 py-2 transition-opacity hover:opacity-70"
            aria-label={t("cart")}
          >
            <ShoppingBag className="h-5 w-5" />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--shop-primary)] px-1 text-[10px] font-medium text-white">
                {count}
              </span>
            )}
          </Link>
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}
