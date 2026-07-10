"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { CheckCircle2 } from "lucide-react";
import { createPublicExchangeRequest } from "@/lib/actions/exchanges";
import { shopBtnPrimary } from "@/lib/shop-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ExchangeFormProps = {
  shopSlug: string;
};

export function ExchangeForm({ shopSlug }: ExchangeFormProps) {
  const t = useTranslations("publicShop");
  const tc = useTranslations("common");
  const te = useTranslations("exchanges");
  const to = useTranslations("orders");

  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [requestedSize, setRequestedSize] = useState("");
  const [requestedColor, setRequestedColor] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    startTransition(async () => {
      const result = await createPublicExchangeRequest(shopSlug, {
        orderNumber: orderNumber.trim(),
        phone: phone.trim(),
        reason: reason.trim(),
        requestedSize: requestedSize.trim() || undefined,
        requestedColor: requestedColor.trim() || undefined,
        note: note.trim() || undefined,
      });

      if (result.success) {
        setSubmitted(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        toast.error(!result.success ? result.error : tc("loading"));
      }
    });
  }

  if (submitted) {
    return (
      <Card className="border-0 shadow-lg ring-1 ring-green-100">
        <CardContent className="space-y-4 p-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{t("exchangeSuccess")}</h2>
          <p className="text-slate-600">{t("exchangeSuccessDesc")}</p>
          <Link href={`/${shopSlug}`} className="block">
            <Button variant="outline" className="w-full">
              {t("backToShop")}
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="border-0 shadow-sm ring-1 ring-slate-100">
        <CardHeader>
          <CardTitle>{t("submitExchange")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderNumber">{to("orderNumber")}</Label>
            <Input
              id="orderNumber"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              placeholder="MILA-1001"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangePhone">{tc("phone")}</Label>
            <Input
              id="exchangePhone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              autoComplete="tel"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">{te("reason")}</Label>
            <Textarea
              id="reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              required
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="requestedSize">{t("requestedSize")}</Label>
              <Input
                id="requestedSize"
                value={requestedSize}
                onChange={(e) => setRequestedSize(e.target.value)}
                placeholder="M"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="requestedColor">{t("requestedColor")}</Label>
              <Input
                id="requestedColor"
                value={requestedColor}
                onChange={(e) => setRequestedColor(e.target.value)}
                placeholder="Crna"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="exchangeNote">{tc("note")}</Label>
            <Textarea
              id="exchangeNote"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          <Button
            type="submit"
            disabled={pending}
            className={cn("w-full rounded-lg", shopBtnPrimary)}
          >
            {pending ? tc("loading") : t("sendRequest")}
          </Button>
        </CardContent>
      </Card>
    </form>
  );
}
