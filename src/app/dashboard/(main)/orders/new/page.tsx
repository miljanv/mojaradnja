import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { ManualOrderForm } from "./manual-order-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewOrderPage() {
  const { shop } = await requireShop();
  const t = await getTranslations("orders");
  const tCommon = await getTranslations("common");

  const [customers, products] = await Promise.all([
    prisma.customer.findMany({
      where: { shopId: shop.id },
      orderBy: { fullName: "asc" },
    }),
    prisma.product.findMany({
      where: { shopId: shop.id, status: "ACTIVE" },
      include: { variants: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <DashboardHeader
        title={t("manualOrder")}
        actions={
          <Link href="/dashboard/orders">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <ManualOrderForm
          shopId={shop.id}
          customers={customers}
          products={products.map((p) => ({
            id: p.id,
            name: p.name,
            price: Number(p.price),
            variants: p.variants,
          }))}
        />
      </div>
    </div>
  );
}
