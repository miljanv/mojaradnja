"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/components/shop/cart-provider";
import { formatCurrency } from "@/lib/utils-app";
import { shopBtnPrimary } from "@/lib/shop-theme";
import { Button } from "@/components/ui/button";
import { CartCheckoutForm } from "./cart-checkout-form";
import { cn } from "@/lib/utils";

type CartPageClientProps = {
  shopSlug: string;
  shopName: string;
};

export function CartPageClient({ shopSlug, shopName }: CartPageClientProps) {
  const t = useTranslations("publicShop");
  const tc = useTranslations("common");
  const { items, total, updateQuantity, removeItem, clearCart } = useCart();
  const [showCheckout, setShowCheckout] = useState(false);

  const isEmpty = items.length === 0;

  if (isEmpty) {
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center sm:px-6">
        <div
          className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "var(--shop-primary-muted)" }}
        >
          <ShoppingBag className="h-10 w-10 text-[var(--shop-primary)]" />
        </div>
        <h1 className="text-2xl font-bold">{t("cartEmpty")}</h1>
        <p className="mt-2" style={{ color: "var(--shop-text-muted)" }}>
          {t("cartEmptyDesc")}
        </p>
        <Link href={`/${shopSlug}`} className="mt-8 inline-block">
          <Button className={cn("rounded-full px-8", shopBtnPrimary)}>
            {t("continueShopping")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="text-2xl font-bold sm:text-3xl">{t("cart")}</h1>
      <p className="mt-1" style={{ color: "var(--shop-text-muted)" }}>
        {items.length} {t("cartItems")}
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          {items.map((item) => {
            const key = `${item.productId}:${item.variantId ?? "default"}`;
            return (
              <div
                key={key}
                className="flex gap-4 rounded-2xl p-4"
                style={{ backgroundColor: "var(--shop-card)" }}
              >
                <div
                  className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl"
                  style={{ backgroundColor: "var(--shop-bg)" }}
                >
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.productName} fill className="object-cover" unoptimized />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm opacity-40">—</div>
                  )}
                </div>

                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/${shopSlug}/p/${item.productSlug}`}
                    className="font-semibold hover:text-[var(--shop-primary)]"
                  >
                    {item.productName}
                  </Link>
                  {item.variantInfo && (
                    <p className="mt-0.5 text-sm" style={{ color: "var(--shop-text-muted)" }}>
                      {item.variantInfo}
                    </p>
                  )}
                  <p className="mt-1 font-bold text-[var(--shop-primary)]">
                    {formatCurrency(item.price)}
                  </p>

                  <div className="mt-auto flex items-center justify-between pt-3">
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity - 1)
                        }
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        className="h-8 w-8 rounded-full"
                        onClick={() =>
                          updateQuantity(item.productId, item.variantId, item.quantity + 1)
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="lg:col-span-2">
          <div
            className="sticky top-24 rounded-2xl p-6"
            style={{ backgroundColor: "var(--shop-card)" }}
          >
            {!showCheckout ? (
              <>
                <div className="flex items-center justify-between text-lg font-bold">
                  <span>{tc("total")}</span>
                  <span className="text-[var(--shop-primary)]">{formatCurrency(total)}</span>
                </div>
                <p className="mt-2 text-xs" style={{ color: "var(--shop-text-muted)" }}>
                  {t("cashOnDelivery")}
                </p>
                <Button
                  className={cn("mt-6 w-full rounded-full py-6", shopBtnPrimary)}
                  onClick={() => setShowCheckout(true)}
                >
                  {t("checkout")}
                </Button>
                <Link href={`/${shopSlug}`} className="mt-3 block">
                  <Button variant="ghost" className="w-full">
                    {t("continueShopping")}
                  </Button>
                </Link>
              </>
            ) : (
              <CartCheckoutForm
                shopSlug={shopSlug}
                shopName={shopName}
                onSuccess={() => clearCart()}
                onBack={() => setShowCheckout(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
