"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { X } from "lucide-react";
import { stopImpersonatingShop } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";

export function ImpersonationBanner({
  shopName,
  ownerEmail,
}: {
  shopName: string;
  ownerEmail: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleExit() {
    startTransition(async () => {
      const result = await stopImpersonatingShop();
      if (result.success) {
        toast.success("Izašao si iz butika");
        router.push("/admin/shops");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-amber-300 bg-amber-100 px-4 py-2.5 text-sm text-amber-950 sm:px-6">
      <p>
        <span className="font-semibold">Admin podrška:</span> upravljaš butikom{" "}
        <span className="font-bold">{shopName}</span>
        <span className="text-amber-800"> ({ownerEmail})</span>
      </p>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={pending}
        onClick={handleExit}
        className="border-amber-400 bg-white hover:bg-amber-50"
      >
        <X className="mr-1.5 h-3.5 w-3.5" />
        {pending ? "Izlazim..." : "Izađi iz butika"}
      </Button>
    </div>
  );
}
