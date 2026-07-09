import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { ComplaintForm } from "./complaint-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewComplaintPage() {
  const { shop } = await requireShop();
  const t = await getTranslations("complaints");
  const tCommon = await getTranslations("common");

  const [customers, orders] = await Promise.all([
    prisma.customer.findMany({
      where: { shopId: shop.id },
      orderBy: { fullName: "asc" },
    }),
    prisma.order.findMany({
      where: { shopId: shop.id },
      select: { id: true, orderNumber: true, customerId: true },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <div>
      <DashboardHeader
        title={t("new")}
        actions={
          <Link href="/dashboard/complaints">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <ComplaintForm shopId={shop.id} customers={customers} orders={orders} />
      </div>
    </div>
  );
}
