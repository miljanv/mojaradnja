"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createComplaint } from "@/lib/actions/exchanges";
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

type Customer = {
  id: string;
  fullName: string;
  phone: string;
};

type Order = {
  id: string;
  orderNumber: string;
  customerId: string;
};

export function ComplaintForm({
  shopId,
  customers,
  orders,
}: {
  shopId: string;
  customers: Customer[];
  orders: Order[];
}) {
  const t = useTranslations("complaints");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [customerId, setCustomerId] = useState("");
  const [orderId, setOrderId] = useState("none");

  const customerOrders = orders.filter((o) => o.customerId === customerId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (!customerId) {
      toast.error("Izaberite kupca");
      return;
    }

    startTransition(async () => {
      const result = await createComplaint(shopId, {
        customerId,
        orderId: orderId !== "none" ? orderId : undefined,
        reason: form.get("reason") as string,
        description: (form.get("description") as string) || undefined,
        resolution: (form.get("resolution") as string) || undefined,
        note: (form.get("note") as string) || undefined,
        internalNote: (form.get("internalNote") as string) || undefined,
      });

      if (result.success) {
        toast.success(t("new"));
        router.push("/dashboard/complaints");
      } else if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Kupac i porudžbina</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Kupac</Label>
            <Select value={customerId} onValueChange={(v) => { if (v) { setCustomerId(v); setOrderId("none"); } }} required>
              <SelectTrigger>
                <SelectValue placeholder="Izaberite kupca" />
              </SelectTrigger>
              <SelectContent>
                {customers.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.fullName} — {c.phone}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {customerId && customerOrders.length > 0 && (
            <div className="space-y-2">
              <Label>Porudžbina (opciono)</Label>
              <Select value={orderId} onValueChange={(v) => setOrderId(v ?? "none")}>
                <SelectTrigger>
                  <SelectValue placeholder="Bez porudžbine" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Bez porudžbine</SelectItem>
                  {customerOrders.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      {o.orderNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="reason">{t("reason")}</Label>
            <Input id="reason" name="reason" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea id="description" name="description" rows={3} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resolution">{t("resolution")}</Label>
            <Textarea id="resolution" name="resolution" rows={2} />
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
