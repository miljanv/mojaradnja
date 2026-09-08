import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/header";
import { ShopSettingsForm } from "./shop-settings-form";

export default async function ShopSettingsPage() {
  const { shop } = await requireShop();
  const t = await getTranslations("shop");

  return (
    <div>
      <DashboardHeader title={t("settings")} />
      <div className="p-4 sm:p-6 max-w-6xl">
        <ShopSettingsForm shop={shop} />
      </div>
    </div>
  );
}
