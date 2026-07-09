import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { TemplatesForm } from "./templates-form";

export default async function TemplatesPage() {
  const { shop } = await requireShop();
  const t = await getTranslations("templates");

  const templates = await prisma.messageTemplate.findMany({
    where: { shopId: shop.id },
    orderBy: { type: "asc" },
  });

  return (
    <div>
      <DashboardHeader title={t("title")} />
      <div className="p-6">
        <TemplatesForm shopId={shop.id} templates={templates} />
      </div>
    </div>
  );
}
