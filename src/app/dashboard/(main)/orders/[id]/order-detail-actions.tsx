"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateOrderStatus, updateOrderNotes } from "@/lib/actions/orders";
import { CopyButton } from "@/components/shared/copy-button";
import { Button } from "@/components/ui/button";
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
import type { OrderStatus } from "@/lib/prisma-client";

export function OrderDetailActions({
  shopId,
  orderId,
  status,
  note,
  internalNote,
  confirmationMessage,
  shippedMessage,
}: {
  shopId: string;
  orderId: string;
  status: OrderStatus;
  note: string | null;
  internalNote: string | null;
  confirmationMessage: string;
  shippedMessage: string;
}) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatusChange(newStatus: OrderStatus) {
    startTransition(async () => {
      const result = await updateOrderStatus(shopId, orderId, newStatus);
      if (result.success) {
        toast.success(t("changeStatus"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  function handleNotesSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateOrderNotes(shopId, orderId, {
        note: (form.get("note") as string) || undefined,
        internalNote: (form.get("internalNote") as string) || undefined,
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("changeStatus")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={status} onValueChange={(v) => v && handleStatusChange(v as OrderStatus)} disabled={pending}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {([
                "NEW", "CONFIRMED", "WAITING_PAYMENT", "PACKED", "SHIPPED",
                "DELIVERED", "CANCELLED", "RETURNED", "EXCHANGE_IN_PROGRESS",
              ] as OrderStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`statuses.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="flex flex-wrap gap-2">
            <CopyButton text={confirmationMessage} label={t("copyConfirmation")} />
            <CopyButton text={shippedMessage} label={t("copyShipped")} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{tCommon("note")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleNotesSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">{tCommon("note")}</Label>
              <Textarea id="note" name="note" rows={2} defaultValue={note ?? ""} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="internalNote">{tCommon("internalNote")}</Label>
              <Textarea id="internalNote" name="internalNote" rows={2} defaultValue={internalNote ?? ""} />
            </div>
            <Button type="submit" variant="outline" disabled={pending}>
              {tCommon("save")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
