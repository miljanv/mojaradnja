import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { ExchangeForm } from "./exchange-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewExchangePage() {
  const { shop } = await requireShop();
  const t = await getTranslations("exchanges");
  const tCommon = await getTranslations("common");

  const orders = await prisma.order.findMany({
    where: { shopId: shop.id, status: { notIn: ["CANCELLED"] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <DashboardHeader
        title={t("new")}
        actions={
          <Link href="/dashboard/exchanges">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <ExchangeForm
          shopId={shop.id}
          orders={orders.map((o) => ({
            id: o.id,
            orderNumber: o.orderNumber,
            customerId: o.customerId,
            customerName: o.customerName,
            items: o.items,
          }))}
        />
      </div>
    </div>
  );
}
