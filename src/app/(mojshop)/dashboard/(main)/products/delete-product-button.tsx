"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { deleteProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";

export function DeleteProductButton({ shopId, productId }: { shopId: string; productId: string }) {
  const t = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(t("confirm") + "?")) return;

    startTransition(async () => {
      const result = await deleteProduct(shopId, productId);
      if (result.success) {
        toast.success(t("delete"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleDelete} disabled={pending}>
      <Trash2 className="h-4 w-4 text-red-500" />
    </Button>
  );
}
