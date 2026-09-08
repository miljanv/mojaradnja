import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import Link from "next/link";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { ShopShell } from "@/components/shop/shop-shell";
import { getShopBySlug } from "@/lib/shop-public";
import { Button } from "@/components/ui/button";
import { Store } from "lucide-react";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ shopSlug: string }>;
};

export default async function ShopLayout({ children, params }: LayoutProps) {
  const { shopSlug } = await params;
  const shop = await getShopBySlug(shopSlug);

  if (!shop) {
    notFound();
  }

  if (!shop.isPublished) {
    const t = await getTranslations("publicShop");

    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-pink-50/80 to-white px-4">
        <div className="absolute top-4 right-4">
          <LanguageSwitcher />
        </div>
        <Store className="h-12 w-12 text-[#E85A6B] mb-4" />
        <h1 className="text-2xl font-bold text-slate-900">{shop.name}</h1>
        <p className="mt-2 text-slate-500 text-center max-w-md">{t("shopUnpublished")}</p>
        <Link href="/dashboard/shop" className="mt-6">
          <Button className="bg-[#E85A6B] hover:bg-[#D44558]">{t("publishShop")}</Button>
        </Link>
      </div>
    );
  }

  return <ShopShell shop={shop}>{children}</ShopShell>;
}
