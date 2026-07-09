import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils-app";
import { buildOrderMessage } from "@/lib/messages";
import { SOURCE_ICONS } from "@/lib/constants";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { OrderDetailActions } from "./order-detail-actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ id: string }>;

export default async function OrderDetailPage({ params }: { params: Params }) {
  const { shop } = await requireShop();
  const { id } = await params;
  const t = await getTranslations("orders");
  const tCommon = await getTranslations("common");

  const order = await prisma.order.findFirst({
    where: { id, shopId: shop.id },
    include: {
      items: true,
      customer: true,
    },
  });

  if (!order) notFound();

  const templates = await prisma.messageTemplate.findMany({
    where: {
      shopId: shop.id,
      type: { in: ["ORDER_CONFIRMATION", "ORDER_SHIPPED"] },
    },
  });

  const confirmationTemplate = templates.find((t) => t.type === "ORDER_CONFIRMATION")?.content ?? "";
  const shippedTemplate = templates.find((t) => t.type === "ORDER_SHIPPED")?.content ?? "";

  const orderData = {
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    totalAmount: Number(order.totalAmount),
    items: order.items.map((i) => ({
      productName: i.productName,
      size: i.size,
    })),
  };

  const confirmationMessage = buildOrderMessage(confirmationTemplate, orderData, shop.returnAddress);
  const shippedMessage = buildOrderMessage(shippedTemplate, orderData, shop.returnAddress);

  return (
    <div>
      <DashboardHeader
        title={`${t("details")} — ${order.orderNumber}`}
        subtitle={`${order.customerName} · ${formatDate(order.createdAt)}`}
        actions={
          <Link href="/dashboard/orders">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />

      <div className="p-6 grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("items")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tCommon("name")}</TableHead>
                    <TableHead>Veličina</TableHead>
                    <TableHead>Boja</TableHead>
                    <TableHead>{tCommon("quantity")}</TableHead>
                    <TableHead>{tCommon("price")}</TableHead>
                    <TableHead>{tCommon("total")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.productName}</TableCell>
                      <TableCell>{item.size ?? "—"}</TableCell>
                      <TableCell>{item.color ?? "—"}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{formatCurrency(Number(item.unitPrice))}</TableCell>
                      <TableCell>{formatCurrency(Number(item.totalPrice))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="mt-4 text-right font-bold text-lg">
                {tCommon("total")}: {formatCurrency(Number(order.totalAmount))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t("deliveryAddress")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><strong>{order.customerName}</strong></p>
              <p>{order.customerPhone}</p>
              <p>{order.deliveryAddress ?? order.customer.address ?? "—"}</p>
              <p>{order.deliveryCity ?? order.customer.city ?? "—"}</p>
              <p className="pt-2">
                {SOURCE_ICONS[order.source]} {t(`sources.${order.source}`)}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <StatusBadge status={order.status} />
            </CardContent>
          </Card>

          <OrderDetailActions
            shopId={shop.id}
            orderId={order.id}
            status={order.status}
            note={order.note}
            internalNote={order.internalNote}
            confirmationMessage={confirmationMessage}
            shippedMessage={shippedMessage}
          />

          {order.customer && (
            <Card>
              <CardHeader>
                <CardTitle>{t("customer")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Link href={`/dashboard/customers/${order.customer.id}`} className="text-pink-600 hover:underline">
                  {order.customer.fullName}
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
