import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils-app";
import { getCustomerRiskLevel } from "@/lib/messages";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { CustomerNoteForm } from "./customer-note-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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

export default async function CustomerDetailPage({ params }: { params: Params }) {
  const { shop } = await requireShop();
  const { id } = await params;
  const t = await getTranslations("customers");
  const tOrders = await getTranslations("orders");
  const tExchanges = await getTranslations("exchanges");
  const tComplaints = await getTranslations("complaints");
  const tCommon = await getTranslations("common");

  const customer = await prisma.customer.findFirst({
    where: { id, shopId: shop.id },
    include: {
      orders: { orderBy: { createdAt: "desc" } },
      exchangeRequests: { orderBy: { createdAt: "desc" } },
      complaintRequests: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!customer) notFound();

  const totalSpent = customer.orders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + Number(o.totalAmount), 0);

  const risk = getCustomerRiskLevel({
    orderCount: customer.orders.length,
    exchangeCount: customer.exchangeRequests.length,
    complaintCount: customer.complaintRequests.length,
  });

  const riskLabel = {
    normal: t("riskNormal"),
    frequent_returns: t("riskFrequentReturns"),
    problematic: t("riskProblematic"),
  }[risk];

  const riskColor = {
    normal: "bg-green-100 text-green-800",
    frequent_returns: "bg-yellow-100 text-yellow-800",
    problematic: "bg-red-100 text-red-800",
  }[risk];

  return (
    <div>
      <DashboardHeader
        title={customer.fullName}
        subtitle={customer.phone}
        actions={
          <Link href="/dashboard/customers">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 space-y-6">
        <div className="grid gap-4 sm:grid-cols-4">
          <StatCard title={t("totalOrders")} value={customer.orders.length} />
          <StatCard title={t("totalSpent")} value={formatCurrency(totalSpent)} />
          <StatCard title={tExchanges("title")} value={customer.exchangeRequests.length} />
          <StatCard title={tComplaints("title")} value={customer.complaintRequests.length} />
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>{t("profile")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-muted-foreground">{tCommon("email")}:</span>{" "}
                {customer.email ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">{t("instagram")}:</span>{" "}
                {customer.instagramUsername ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">{tCommon("address")}:</span>{" "}
                {customer.address ?? "—"}
              </div>
              <div>
                <span className="text-muted-foreground">{tCommon("city")}:</span>{" "}
                {customer.city ?? "—"}
              </div>
              <div className="pt-2">
                <span className="text-muted-foreground">{t("riskLevel")}:</span>{" "}
                <Badge variant="secondary" className={riskColor}>
                  {riskLabel}
                </Badge>
              </div>
              <div className="pt-4 border-t">
                <CustomerNoteForm shopId={shop.id} customerId={customer.id} note={customer.note} />
              </div>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>{t("orderHistory")}</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.orders.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{tCommon("noResults")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tOrders("orderNumber")}</TableHead>
                        <TableHead>{tCommon("status")}</TableHead>
                        <TableHead>{tOrders("amount")}</TableHead>
                        <TableHead>{tCommon("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.orders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Link href={`/dashboard/orders/${order.id}`} className="text-[#E85A6B] hover:underline">
                              {order.orderNumber}
                            </Link>
                          </TableCell>
                          <TableCell><StatusBadge status={order.status} /></TableCell>
                          <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                          <TableCell>{formatDate(order.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tExchanges("title")}</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.exchangeRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{tCommon("noResults")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tExchanges("original")}</TableHead>
                        <TableHead>{tCommon("status")}</TableHead>
                        <TableHead>{tCommon("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.exchangeRequests.map((ex) => (
                        <TableRow key={ex.id}>
                          <TableCell>
                            <Link href={`/dashboard/exchanges/${ex.id}`} className="text-[#E85A6B] hover:underline">
                              {ex.originalProductName}
                            </Link>
                          </TableCell>
                          <TableCell><StatusBadge status={ex.status} type="exchange" /></TableCell>
                          <TableCell>{formatDate(ex.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{tComplaints("title")}</CardTitle>
              </CardHeader>
              <CardContent>
                {customer.complaintRequests.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{tCommon("noResults")}</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>{tComplaints("reason")}</TableHead>
                        <TableHead>{tCommon("status")}</TableHead>
                        <TableHead>{tCommon("date")}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.complaintRequests.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.reason}</TableCell>
                          <TableCell><StatusBadge status={c.status} type="complaint" /></TableCell>
                          <TableCell>{formatDate(c.createdAt)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
