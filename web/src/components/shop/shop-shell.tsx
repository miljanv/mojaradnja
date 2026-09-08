"use client";

import { getFontGoogleUrl, getShopThemeVars, type ShopThemeInput } from "@/lib/shop-theme";
import { CartProvider } from "@/components/shop/cart-provider";
import { ShopHeader } from "@/components/shop/shop-header";
import { ShopFooter } from "@/components/shop/shop-footer";

type ShopShellProps = {
  shop: ShopThemeInput & {
    slug: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    instagramUsername: string | null;
  };
  children: React.ReactNode;
};

export function ShopShell({ shop, children }: ShopShellProps) {
  const themeVars = getShopThemeVars(shop);
  const fontUrl = getFontGoogleUrl(shop.fontFamily);

  return (
    <>
      {fontUrl && <link rel="stylesheet" href={fontUrl} />}
      <CartProvider shopSlug={shop.slug}>
        <div
          className="min-h-screen flex flex-col"
          style={{
            ...themeVars,
            backgroundColor: "var(--shop-bg)",
            color: "var(--shop-text)",
            fontFamily: "var(--shop-font)",
          }}
        >
          <ShopHeader shop={shop} />
          <main className="flex-1">{children}</main>
          <ShopFooter shop={shop} />
        </div>
      </CartProvider>
    </>
  );
}
