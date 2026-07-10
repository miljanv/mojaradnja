import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils-app";
import { renderTemplate } from "@/lib/messages";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ExchangeDetailActions } from "./exchange-detail-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        title={`${t("title")} — ${exchange.order.orderNumber}`}
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

      <div className="p-4 sm:p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("original")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>{exchange.originalProductName}</strong></p>
              <p>Veličina: {exchange.originalSize ?? "—"}</p>
              <p>Boja: {exchange.originalColor ?? "—"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("requested")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-1">
              <p><strong>{exchange.requestedProductName ?? "—"}</strong></p>
              <p>Veličina: {exchange.requestedSize ?? "—"}</p>
              <p>Boja: {exchange.requestedColor ?? "—"}</p>
            </CardContent>
          </Card>

          {exchange.reason && (
            <Card>
              <CardHeader>
                <CardTitle>{t("reason")}</CardTitle>
              </CardHeader>
              <CardContent>{exchange.reason}</CardContent>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6 space-y-2">
              <StatusBadge status={exchange.status} type="exchange" />
              <p className="text-sm">
                {tOrders("customer")}:{" "}
                <Link href={`/dashboard/customers/${exchange.customer.id}`} className="text-[#E85A6B] hover:underline">
                  {exchange.customer.fullName}
                </Link>
              </p>
              <p className="text-sm">
                {tOrders("orderNumber")}:{" "}
                <Link href={`/dashboard/orders/${exchange.order.id}`} className="text-[#E85A6B] hover:underline">
                  {exchange.order.orderNumber}
                </Link>
              </p>
              <p className="text-sm">
                {t("shippingPaidBy")}: {t(`shippingOptions.${exchange.shippingPaidBy}`)}
              </p>
            </CardContent>
          </Card>

          <ExchangeDetailActions
            shopId={shop.id}
            exchangeId={exchange.id}
            status={exchange.status}
            note={exchange.note}
            internalNote={exchange.internalNote}
            message={message}
          />
        </div>
      </div>
    </div>
  );
}
