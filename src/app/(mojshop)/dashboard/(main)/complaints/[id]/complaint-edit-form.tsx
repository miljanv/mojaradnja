"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateComplaint } from "@/lib/actions/exchanges";
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
import type { ComplaintStatus } from "@/lib/prisma-client";

type ComplaintEditFormProps = {
  shopId: string;
  complaintId: string;
  status: ComplaintStatus;
  reason: string;
  description: string | null;
  resolution: string | null;
  note: string | null;
  internalNote: string | null;
  message: string;
};

export function ComplaintEditForm({
  shopId,
  complaintId,
  status: initialStatus,
  reason,
  description,
  resolution,
  note,
  internalNote,
  message,
}: ComplaintEditFormProps) {
  const t = useTranslations("complaints");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState(initialStatus);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateComplaint(shopId, complaintId, {
        status,
        reason: (form.get("reason") as string).trim(),
        description: (form.get("description") as string).trim() || null,
        resolution: (form.get("resolution") as string).trim() || null,
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
              <CardTitle>{t("reason")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reason">{t("reason")}</Label>
                <Input id="reason" name="reason" required defaultValue={reason} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea
                  id="description"
                  name="description"
                  rows={4}
                  defaultValue={description ?? ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="resolution">{t("resolution")}</Label>
                <Textarea
                  id="resolution"
                  name="resolution"
                  rows={3}
                  defaultValue={resolution ?? ""}
                />
              </div>
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
                onValueChange={(v) => v && setStatus(v as ComplaintStatus)}
                disabled={pending}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(
                    [
                      "NEW",
                      "REVIEWING",
                      "APPROVED",
                      "REJECTED",
                      "REFUNDED",
                      "REPLACED",
                      "CLOSED",
                    ] as ComplaintStatus[]
                  ).map((s) => (
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
