"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import { createMiniShopCartOrder } from "@/lib/actions/orders";
import { useCart } from "@/components/shop/cart-provider";
import { buildMiniShopThankYouMessage } from "@/lib/messages";
import { formatCurrency } from "@/lib/utils-app";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type CartCheckoutFormProps = {
  shopSlug: string;
  shopName: string;
  onSuccess: () => void;
  onBack: () => void;
};

export function CartCheckoutForm({
  shopSlug,
  shopName,
  onSuccess,
  onBack,
}: CartCheckoutFormProps) {
  const t = useTranslations("publicShop");
  const tc = useTranslations("common");
  const to = useTranslations("orders");
  const { items, total } = useCart();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const productSummary = items.map((i) => i.productName).join(", ");
  const thankYouMessage =
    orderNumber != null
      ? buildMiniShopThankYouMessage(orderNumber, productSummary, shopName)
      : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await createMiniShopCartOrder(shopSlug, {
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          variantInfo: i.variantInfo,
          quantity: i.quantity,
        })),
        fullName: fullName.trim(),
        phone: phone.trim(),
        city: city.trim(),
        address: address.trim(),
        note: note.trim() || undefined,
      });

      if (result.success && result.data) {
        setOrderNumber(result.data.orderNumber);
        onSuccess();
      } else if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  if (orderNumber) {
    return (
      <div className="space-y-6 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold">{t("thankYou")}</h2>
          <p className="mt-2" style={{ color: "var(--shop-text-muted)" }}>
            {to("orderNumber")}: <span className="font-semibold">{orderNumber}</span>
          </p>
        </div>
        <div
          className="rounded-xl p-4 text-left"
          style={{ backgroundColor: "var(--shop-bg)" }}
        >
          <p className="mb-2 text-sm font-medium">{t("instagramMessage")}</p>
          <p className="whitespace-pre-wrap text-sm" style={{ color: "var(--shop-text-muted)" }}>
            {thankYouMessage}
          </p>
          <div className="mt-3">
            <CopyButton text={thankYouMessage} label={t("copyMessage")} />
          </div>
        </div>
        <Link href={`/${shopSlug}`}>
          <Button variant="outline" className="w-full rounded-full">
            {t("continueShopping")}
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Button type="button" variant="ghost" size="sm" className="-ml-2" onClick={onBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        {t("backToCart")}
      </Button>

      <h2 className="text-lg font-bold">{t("deliveryInfo")}</h2>

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
        <Textarea id="note" value={note} onChange={(e) => setNote(e.target.value)} rows={2} />
      </div>

      <div className="flex items-center justify-between border-t pt-4 font-bold" style={{ borderColor: "var(--shop-border)" }}>
        <span>{tc("total")}</span>
        <span className="text-[var(--shop-primary)]">{formatCurrency(total)}</span>
      </div>

      <Button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-[var(--shop-primary)] py-6 text-white hover:opacity-90"
      >
        {pending ? tc("loading") : t("confirmOrder")}
      </Button>
    </form>
  );
}
