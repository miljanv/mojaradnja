"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { duplicateProduct } from "@/lib/actions/products";
import { Button } from "@/components/ui/button";

export function DuplicateProductButton({
  shopId,
  productId,
}: {
  shopId: string;
  productId: string;
}) {
  const t = useTranslations("products");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDuplicate() {
    startTransition(async () => {
      const result = await duplicateProduct(shopId, productId);
      if (result.success && result.data?.productId) {
        toast.success(t("duplicated"));
        router.push(`/dashboard/products/${result.data.productId}/edit`);
      } else {
        toast.error(result.success ? t("duplicateError") : result.error);
      }
    });
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleDuplicate}
      disabled={pending}
      title={t("duplicate")}
      aria-label={t("duplicate")}
    >
      <Copy className="h-4 w-4" />
    </Button>
  );
}
