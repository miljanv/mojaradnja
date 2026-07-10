"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { getInstagramUrl } from "@/lib/shop-public-client";
import { BRAND_NAME } from "@/components/brand/logo";

type ShopFooterProps = {
  shop: {
    slug: string;
    name: string;
    description: string | null;
    instagramUsername: string | null;
  };
};

export function ShopFooter({ shop }: ShopFooterProps) {
  const t = useTranslations("publicShop");
  const instagramUrl = getInstagramUrl(shop.instagramUsername);

  return (
    <footer className="mt-auto border-t" style={{ borderColor: "var(--shop-border)" }}>
      <div className="mx-auto max-w-5xl px-5 py-12 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-medium">{shop.name}</p>
            {shop.description && (
              <p
                className="mt-2 max-w-sm text-sm leading-relaxed"
                style={{ color: "var(--shop-text-muted)" }}
              >
                {shop.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm" style={{ color: "var(--shop-text-muted)" }}>
            {instagramUrl && (
              <Link
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-opacity hover:opacity-70"
              >
                Instagram
              </Link>
            )}
            <Link
              href={`/${shop.slug}/return`}
              className="transition-opacity hover:opacity-70"
            >
              {t("returnsAndComplaints")}
            </Link>
          </div>
        </div>

        <div
          className="mt-10 flex flex-wrap items-center justify-between gap-3 text-xs"
          style={{ color: "var(--shop-text-muted)" }}
        >
          <p>
            {t("poweredBy")}{" "}
            <Link href="/" className="font-medium underline-offset-2 hover:underline">
              {BRAND_NAME}
            </Link>
          </p>
          <Link
            href="/dashboard"
            className="underline-offset-2 hover:underline hover:text-[var(--shop-primary)]"
          >
            {t("manageShop")}
          </Link>
        </div>
      </div>
    </footer>
  );
}
