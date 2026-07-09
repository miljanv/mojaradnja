"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createExchange } from "@/lib/actions/exchanges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import type { ShippingPaidBy } from "@/lib/prisma-client";

type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  items: Array<{
    productName: string;
    size: string | null;
    color: string | null;
  }>;
};

export function ExchangeForm({
  shopId,
  orders,
}: {
  shopId: string;
  orders: Order[];
}) {
  const t = useTranslations("exchanges");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [orderId, setOrderId] = useState("");
  const [shippingPaidBy, setShippingPaidBy] = useState<ShippingPaidBy>("UNKNOWN");

  const selectedOrder = orders.find((o) => o.id === orderId);
  const firstItem = selectedOrder?.items[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (!selectedOrder) {
      toast.error("Izaberite porudžbinu");
      return;
    }

    startTransition(async () => {
      const result = await createExchange(shopId, {
        orderId: selectedOrder.id,
        customerId: selectedOrder.customerId,
        originalProductName: (form.get("originalProductName") as string) || firstItem?.productName || "",
        originalSize: (form.get("originalSize") as string) || firstItem?.size || undefined,
        originalColor: (form.get("originalColor") as string) || firstItem?.color || undefined,
        requestedProductName: (form.get("requestedProductName") as string) || undefined,
        requestedSize: (form.get("requestedSize") as string) || undefined,
        requestedColor: (form.get("requestedColor") as string) || undefined,
        reason: (form.get("reason") as string) || undefined,
        shippingPaidBy,
        note: (form.get("note") as string) || undefined,
        internalNote: (form.get("internalNote") as string) || undefined,
      });

      if (result.success && result.data) {
        toast.success(t("new"));
        router.push(`/dashboard/exchanges/${result.data.exchangeId}`);
      } else if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Porudžbina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Porudžbina</Label>
            <Select value={orderId} onValueChange={(v) => v && setOrderId(v)} required>
              <SelectTrigger>
                <SelectValue placeholder="Izaberite porudžbinu" />
              </SelectTrigger>
              <SelectContent>
                {orders.map((o) => (
                  <SelectItem key={o.id} value={o.id}>
                    {o.orderNumber} — {o.customerName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("original")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="originalProductName">{tCommon("name")}</Label>
            <Input
              id="originalProductName"
              name="originalProductName"
              defaultValue={firstItem?.productName ?? ""}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalSize">Veličina</Label>
            <Input id="originalSize" name="originalSize" defaultValue={firstItem?.size ?? ""} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalColor">Boja</Label>
            <Input id="originalColor" name="originalColor" defaultValue={firstItem?.color ?? ""} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("requested")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="requestedProductName">{tCommon("name")}</Label>
            <Input id="requestedProductName" name="requestedProductName" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestedSize">Veličina</Label>
            <Input id="requestedSize" name="requestedSize" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="requestedColor">Boja</Label>
            <Input id="requestedColor" name="requestedColor" />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Textarea id="reason" name="reason" rows={2} />
          </div>
          <div className="space-y-2">
            <Label>{t("shippingPaidBy")}</Label>
            <Select value={shippingPaidBy} onValueChange={(v) => v && setShippingPaidBy(v as ShippingPaidBy)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["CUSTOMER", "SELLER", "SPLIT", "UNKNOWN"] as ShippingPaidBy[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`shippingOptions.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="note">{tCommon("note")}</Label>
              <Textarea id="note" name="note" rows={2} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNote">{tCommon("internalNote")}</Label>
              <Textarea id="internalNote" name="internalNote" rows={2} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="bg-pink-500 hover:bg-pink-600" disabled={pending}>
        {t("new")}
      </Button>
    </form>
  );
}
