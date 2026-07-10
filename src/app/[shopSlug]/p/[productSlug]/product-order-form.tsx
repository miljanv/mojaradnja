"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, ShoppingCart } from "lucide-react";
import { createMiniShopOrder } from "@/lib/actions/orders";
import { useCart } from "@/components/shop/cart-provider";
import { formatVariantAttributes, getVariantDisplayValue, shopBtnOutline, shopBtnPrimary } from "@/lib/shop-theme";
import { buildMiniShopThankYouMessage } from "@/lib/messages";
import { formatCurrency } from "@/lib/utils-app";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Variant = {
  id: string;
  size: string | null;
  color: string | null;
  optionLabel: string | null;
  optionValue: string | null;
  attributes: unknown;
  stock: number;
  isAvailable: boolean;
};

type ProductOrderFormProps = {
  shopSlug: string;
  shopName: string;
  productId: string;
  productSlug: string;
  productName: string;
  imageUrl?: string | null;
  price: number;
  productStatus: "ACTIVE" | "SOLD_OUT" | "DRAFT" | "ARCHIVED";
  variants: Variant[];
};

export function ProductOrderForm({
  shopSlug,
  shopName,
  productId,
  productSlug,
  productName,
  imageUrl,
  price,
  productStatus,
  variants,
}: ProductOrderFormProps) {
  const t = useTranslations("publicShop");
  const tc = useTranslations("common");
  const to = useTranslations("orders");
  const { addItem } = useCart();

  const hasVariants = variants.length > 0;
  const availableVariants = useMemo(
    () => variants.filter((v) => v.isAvailable),
    [variants]
  );

  const productSoldOut =
    productStatus === "SOLD_OUT" || (hasVariants && availableVariants.length === 0);

  const [selectedVariantId, setSelectedVariantId] = useState(
    availableVariants[0]?.id ?? ""
  );
  const [quantity, setQuantity] = useState(1);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [showDirectOrder, setShowDirectOrder] = useState(false);
  const [pending, startTransition] = useTransition();

  const selectedVariant = useMemo(
    () => variants.find((v) => v.id === selectedVariantId),
    [variants, selectedVariantId]
  );

  const selectedAvailable = selectedVariant && selectedVariant.isAvailable;

  const totalPrice = price * quantity;
  const variantInfo = selectedVariant ? formatVariantAttributes(selectedVariant) : undefined;

  const thankYouMessage =
    orderNumber != null
      ? buildMiniShopThankYouMessage(orderNumber, productName, shopName)
      : "";

  function handleAddToCart() {
    if (productSoldOut) return;
    if (hasVariants && !selectedAvailable) {
      toast.error(t("selectVariant"));
      return;
    }

    addItem({
      productId,
      productSlug,
      productName,
      imageUrl,
      price,
      variantId: selectedVariant?.id,
      variantInfo,
      quantity,
    });
    toast.success(t("addedToCart"));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (productSoldOut) return;
    if (hasVariants && !selectedAvailable) {
      toast.error(t("selectVariant"));
      return;
    }

    startTransition(async () => {
      const result = await createMiniShopOrder(shopSlug, {
        productId,
        variantId: selectedVariant?.id,
        variantInfo,
        quantity,
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        note: note.trim() || undefined,
      });

      if (result.success && result.data) {
        setOrderNumber(result.data.orderNumber);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  if (orderNumber) {
    return (
      <Card className="border-0 shadow-lg ring-1 ring-green-100">
        <CardContent className="space-y-6 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{t("thankYou")}</h2>
            <p className="mt-2 text-slate-600">
              {to("orderNumber")}: <span className="font-semibold">{orderNumber}</span>
            </p>
          </div>
          <div className="rounded-lg bg-slate-50 p-4 text-left">
            <p className="mb-2 text-sm font-medium text-slate-700">{t("instagramMessage")}</p>
            <p className="whitespace-pre-wrap text-sm text-slate-600">{thankYouMessage}</p>
            <div className="mt-3">
              <CopyButton text={thankYouMessage} label={t("copyMessage")} />
            </div>
          </div>
          <Link href={`/${shopSlug}`} className="block">
            <Button variant="outline" className="w-full rounded-full">
              {t("continueShopping")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  if (productSoldOut) {
    return (
      <div
        className="rounded-2xl border px-5 py-6"
        style={{ borderColor: "var(--shop-border)", backgroundColor: "var(--shop-card)" }}
      >
        <p className="text-sm font-medium uppercase tracking-wide">{t("soldOut")}</p>
        <p className="mt-2 text-sm" style={{ color: "var(--shop-text-muted)" }}>
          {t("soldOutHint")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        {hasVariants && (
          <div className="space-y-2">
            <Label>{t("variant")}</Label>
            <select
              className="w-full cursor-pointer rounded-lg border bg-transparent px-3 py-2.5 text-sm outline-none transition-colors hover:border-[var(--shop-primary)]"
              style={{ borderColor: "var(--shop-border)" }}
              value={selectedVariantId}
              onChange={(e) => setSelectedVariantId(e.target.value)}
            >
              <option value="">{t("selectVariant")}</option>
              {variants.map((v) => {
                const unavailable = !v.isAvailable;
                return (
                  <option key={v.id} value={v.id} disabled={unavailable}>
                    {getVariantDisplayValue(v)}
                    {unavailable ? ` (${t("soldOut")})` : ""}
                  </option>
                );
              })}
            </select>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="quantity">{tc("quantity")}</Label>
          <Input
            id="quantity"
            type="number"
            min={1}
            max={99}
            value={quantity}
            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
            required
          />
        </div>

        <div
          className="flex items-center justify-between rounded-xl px-4 py-3"
          style={{ backgroundColor: "var(--shop-primary-muted)" }}
        >
          <span className="text-sm font-medium">{t("totalPrice")}</span>
          <span className="text-lg font-bold text-[var(--shop-primary)]">
            {formatCurrency(totalPrice)}
          </span>
        </div>

        <p className="text-xs" style={{ color: "var(--shop-text-muted)" }}>
          {t("cashOnDelivery")}
        </p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={hasVariants && !selectedAvailable}
          onClick={handleAddToCart}
          className={cn(
            "inline-flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
            shopBtnOutline
          )}
        >
          <ShoppingCart className="h-4 w-4" />
          {t("addToCart")}
        </button>
        <Button
          type="button"
          size="lg"
          disabled={hasVariants && !selectedAvailable}
          className={cn("flex-1 cursor-pointer rounded-full", shopBtnPrimary)}
          onClick={() => setShowDirectOrder(true)}
        >
          {t("orderNow")}
        </Button>
      </div>

      {showDirectOrder && (
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="border-0 shadow-sm" style={{ backgroundColor: "var(--shop-card)" }}>
            <CardHeader>
              <CardTitle>{t("deliveryInfo")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{tc("name")}</Label>
                <Input id="fullName" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{tc("phone")}</Label>
                <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{tc("city")}</Label>
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{tc("address")}</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="note">{tc("note")}</Label>
                <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              className="cursor-pointer rounded-full"
              onClick={() => setShowDirectOrder(false)}
            >
              {tc("cancel")}
            </Button>
            <Button
              type="submit"
              size="lg"
              disabled={pending || (hasVariants && !selectedAvailable)}
              className={cn("flex-1 cursor-pointer rounded-full", shopBtnPrimary)}
            >
              {pending ? tc("loading") : t("confirmOrder")}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
