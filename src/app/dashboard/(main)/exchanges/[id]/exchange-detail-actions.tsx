"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateExchangeStatus, updateExchangeNotes } from "@/lib/actions/exchanges";
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
import type { ExchangeStatus } from "@/lib/prisma-client";

export function ExchangeDetailActions({
  shopId,
  exchangeId,
  status,
  note,
  internalNote,
  message,
}: {
  shopId: string;
  exchangeId: string;
  status: ExchangeStatus;
  note: string | null;
  internalNote: string | null;
  message: string;
}) {
  const t = useTranslations("exchanges");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleStatusChange(newStatus: ExchangeStatus) {
    startTransition(async () => {
      const result = await updateExchangeStatus(shopId, exchangeId, newStatus);
      if (result.success) {
        toast.success(tCommon("update"));
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
      const result = await updateExchangeNotes(shopId, exchangeId, {
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
          <CardTitle>{tCommon("status")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={status} onValueChange={(v) => v && handleStatusChange(v as ExchangeStatus)} disabled={pending}>
            <SelectTrigger className="max-w-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {([
                "NEW", "WAITING_CUSTOMER_RETURN", "RECEIVED_RETURN",
                "NEW_ITEM_SENT", "COMPLETED", "REJECTED", "CANCELLED",
              ] as ExchangeStatus[]).map((s) => (
                <SelectItem key={s} value={s}>
                  {t(`statuses.${s}`)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <CopyButton text={message} label={t("copyMessage")} />
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
