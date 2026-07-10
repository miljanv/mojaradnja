"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { LogIn } from "lucide-react";
import { startImpersonatingShop } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ImpersonateShopButton({
  shopId,
  shopName,
  variant = "default",
  size = "sm",
}: {
  shopId: string;
  shopName: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg" | "icon";
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleClick() {
    startTransition(async () => {
      const result = await startImpersonatingShop(shopId);
      if (result.success) {
        toast.success(`Ušao si u butik: ${shopName}`);
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={pending}
      onClick={handleClick}
      className={variant === "default" ? "bg-[#E85A6B] hover:bg-[#D44558]" : undefined}
    >
      <LogIn className="mr-1.5 h-3.5 w-3.5" />
      {pending ? "Ulazim..." : "Upravljaj butikom"}
    </Button>
  );
}
