"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateExchange } from "@/lib/actions/exchanges";
import { CopyButton } from "@/components/shared/copy-button";
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
import type { ExchangeStatus, ShippingPaidBy } from "@/lib/prisma-client";

type ExchangeEditFormProps = {
  shopId: string;
  exchangeId: string;
  status: ExchangeStatus;
  shippingPaidBy: ShippingPaidBy;
  originalProductName: string;
  originalSize: string | null;
  originalColor: string | null;
  requestedProductName: string | null;
  requestedSize: string | null;
  requestedColor: string | null;
  reason: string | null;
  note: string | null;
  internalNote: string | null;
  message: string;
};

export function ExchangeEditForm({
  shopId,
  exchangeId,
  status: initialStatus,
  shippingPaidBy: initialShipping,
  originalProductName,
  originalSize,
  originalColor,
  requestedProductName,
  requestedSize,
  requestedColor,
  reason,
  note,
  internalNote,
  message,
}: ExchangeEditFormProps) {
  const t = useTranslations("exchanges");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(initialStatus);
  const [shippingPaidBy, setShippingPaidBy] = useState(initialShipping);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateExchange(shopId, exchangeId, {
        status,
        shippingPaidBy,
        originalProductName: (form.get("originalProductName") as string).trim(),
        originalSize: (form.get("originalSize") as string).trim() || null,
        originalColor: (form.get("originalColor") as string).trim() || null,
        requestedProductName: (form.get("requestedProductName") as string).trim() || null,
        requestedSize: (form.get("requestedSize") as string).trim() || null,
        requestedColor: (form.get("requestedColor") as string).trim() || null,
        reason: (form.get("reason") as string).trim() || null,
        note: (form.get("note") as string).trim() || null,
        internalNote: (form.get("internalNote") as string).trim() || null,
      });

      if (result.success) {
        toast.success(tCommon("save"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>{t("original")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="originalProductName">{tCommon("name")}</Label>
                <Input
                  id="originalProductName"
                  name="originalProductName"
                  required
                  defaultValue={originalProductName}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalSize">{t("size")}</Label>
                <Input id="originalSize" name="originalSize" defaultValue={originalSize ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="originalColor">{t("color")}</Label>
                <Input id="originalColor" name="originalColor" defaultValue={originalColor ?? ""} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("requested")}</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2 sm:col-span-3">
                <Label htmlFor="requestedProductName">{tCommon("name")}</Label>
                <Input
                  id="requestedProductName"
                  name="requestedProductName"
                  defaultValue={requestedProductName ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedSize">{t("size")}</Label>
                <Input id="requestedSize" name="requestedSize" defaultValue={requestedSize ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="requestedColor">{t("color")}</Label>
                <Input
                  id="requestedColor"
                  name="requestedColor"
                  defaultValue={requestedColor ?? ""}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("reason")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea id="reason" name="reason" rows={3} defaultValue={reason ?? ""} />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{tCommon("status")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Select
                value={status}
                onValueChange={(v) => v && setStatus(v as ExchangeStatus)}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "NEW",
                      "WAITING_CUSTOMER_RETURN",
                      "RECEIVED_RETURN",
                      "NEW_ITEM_SENT",
                      "COMPLETED",
                      "REJECTED",
                      "CANCELLED",
                    ] as ExchangeStatus[]
                  ).map((s) => (
                    <SelectItem key={s} value={s}>
                      {t(`statuses.${s}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="space-y-2">
                <Label>{t("shippingPaidBy")}</Label>
                <Select
                  value={shippingPaidBy}
                  onValueChange={(v) => v && setShippingPaidBy(v as ShippingPaidBy)}
                  disabled={pending}
                >
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

              <CopyButton text={message} label={t("copyMessage")} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{tCommon("note")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="note">{tCommon("note")}</Label>
                <Textarea id="note" name="note" rows={2} defaultValue={note ?? ""} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="internalNote">{tCommon("internalNote")}</Label>
                <Textarea
                  id="internalNote"
                  name="internalNote"
                  rows={2}
                  defaultValue={internalNote ?? ""}
                />
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full bg-[#E85A6B] hover:bg-[#D44558]"
            disabled={pending}
          >
            {pending ? tCommon("loading") : tCommon("save")}
          </Button>
        </div>
      </div>
    </form>
  );
}
