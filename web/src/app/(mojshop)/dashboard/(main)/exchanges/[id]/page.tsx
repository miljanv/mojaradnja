import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils-app";
import { renderTemplate } from "@/lib/messages";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ExchangeEditForm } from "./exchange-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ id: string }>;

export default async function ExchangeDetailPage({ params }: { params: Params }) {
  const { shop } = await requireShop();
  const { id } = await params;
  const t = await getTranslations("exchanges");
  const tOrders = await getTranslations("orders");
  const tCommon = await getTranslations("common");

  const exchange = await prisma.exchangeRequest.findFirst({
    where: { id, shopId: shop.id },
    include: {
      order: true,
      customer: true,
    },
  });

  if (!exchange) notFound();

  const template = await prisma.messageTemplate.findUnique({
    where: { shopId_type: { shopId: shop.id, type: "EXCHANGE_INSTRUCTIONS" } },
  });

  const message = renderTemplate(template?.content ?? "", {
    customerName: exchange.customer.fullName,
    orderNumber: exchange.order.orderNumber,
    returnAddress: shop.returnAddress ?? "",
    reason: exchange.reason ?? "",
  });

  return (
    <div>
      <DashboardHeader
        title={`${t("edit")} — ${exchange.order.orderNumber}`}
        subtitle={formatDate(exchange.createdAt)}
        actions={
          <Link href="/dashboard/exchanges">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={exchange.status} type="exchange" />
          <span>
            {tOrders("customer")}:{" "}
            <Link
              href={`/dashboard/customers/${exchange.customer.id}`}
              className="text-[#E85A6B] hover:underline"
            >
              {exchange.customer.fullName}
            </Link>
          </span>
          <span>
            {tOrders("orderNumber")}:{" "}
            <Link
              href={`/dashboard/orders/${exchange.order.id}`}
              className="text-[#E85A6B] hover:underline"
            >
              {exchange.order.orderNumber}
            </Link>
          </span>
        </div>

        <ExchangeEditForm
          shopId={shop.id}
          exchangeId={exchange.id}
          status={exchange.status}
          shippingPaidBy={exchange.shippingPaidBy}
          originalProductName={exchange.originalProductName}
          originalSize={exchange.originalSize}
          originalColor={exchange.originalColor}
          requestedProductName={exchange.requestedProductName}
          requestedSize={exchange.requestedSize}
          requestedColor={exchange.requestedColor}
          reason={exchange.reason}
          note={exchange.note}
          internalNote={exchange.internalNote}
          message={message}
        />
      </div>
    </div>
  );
}
