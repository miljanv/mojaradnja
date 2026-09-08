"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { updateCustomerNote } from "@/lib/actions/exchanges";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export function CustomerNoteForm({
  shopId,
  customerId,
  note,
}: {
  shopId: string;
  customerId: string;
  note: string | null;
}) {
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateCustomerNote(
        shopId,
        customerId,
        form.get("note") as string
      );
      if (result.success) {
        toast.success(tCommon("save"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="note">{tCommon("note")}</Label>
        <Textarea id="note" name="note" rows={3} defaultValue={note ?? ""} />
      </div>
      <Button type="submit" variant="outline" size="sm" disabled={pending}>
        {tCommon("save")}
      </Button>
    </form>
  );
}
