import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Store } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function ShopNotFound() {
  const t = await getTranslations("publicShop");

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-[#E85A6B]/12 text-[#E85A6B]">
        <Store className="h-8 w-8" />
      </div>
      <h1 className="text-2xl font-bold text-slate-900">{t("shopNotFound")}</h1>
      <p className="mt-2 max-w-md text-slate-500">{t("shopNotFoundDesc")}</p>
      <Link href="/" className="mt-8">
        <Button className="bg-[#E85A6B] hover:bg-[#D44558]">MojShop</Button>
      </Link>
    </div>
  );
}
