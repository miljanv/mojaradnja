import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { startOfMonth, endOfMonth } from "date-fns";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils-app";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/dashboard/status-badge";
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
import {
  ShoppingBag,
  Package,
  Truck,
  RefreshCw,
  AlertTriangle,
  TrendingUp,
  Users,
  Plus,
} from "lucide-react";
import { MerchantTryOnStatsCard } from "@/components/dashboard/merchant-try-on-stats";

export default async function DashboardPage() {
  const { shop } = await requireShop();
  const t = await getTranslations("dashboard");
  const tNav = await getTranslations("nav");
  const tOrders = await getTranslations("orders");

  const monthStart = startOfMonth(new Date());
  const monthEnd = endOfMonth(new Date());

  const [
    totalOrders,
    newOrders,
    shippedOrders,
    exchangesInProgress,
    openComplaints,
    revenueAgg,
    monthOrders,
    monthRevenue,
    newCustomers,
    recentOrders,
    topProducts,
  ] = await Promise.all([
    prisma.order.count({ where: { shopId: shop.id } }),
    prisma.order.count({ where: { shopId: shop.id, status: "NEW" } }),
    prisma.order.count({ where: { shopId: shop.id, status: "SHIPPED" } }),
    prisma.exchangeRequest.count({
      where: {
        shopId: shop.id,
        status: { in: ["NEW", "WAITING_CUSTOMER_RETURN", "RECEIVED_RETURN", "NEW_ITEM_SENT"] },
      },
    }),
    prisma.complaintRequest.count({
      where: { shopId: shop.id, status: { in: ["NEW", "REVIEWING"] } },
    }),
    prisma.order.aggregate({
      where: { shopId: shop.id, status: { not: "CANCELLED" } },
      _sum: { totalAmount: true },
    }),
    prisma.order.count({
      where: { shopId: shop.id, createdAt: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.order.aggregate({
      where: {
        shopId: shop.id,
        createdAt: { gte: monthStart, lte: monthEnd },
        status: { not: "CANCELLED" },
      },
      _sum: { totalAmount: true },
    }),
    prisma.customer.count({
      where: { shopId: shop.id, createdAt: { gte: monthStart, lte: monthEnd } },
    }),
    prisma.order.findMany({
      where: { shopId: shop.id },
      include: { items: true },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.orderItem.groupBy({
      by: ["productName"],
      where: { order: { shopId: shop.id } },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    }),
  ]);

  const totalRevenue = Number(revenueAgg._sum.totalAmount ?? 0);
  const monthRev = Number(monthRevenue._sum.totalAmount ?? 0);

  return (
    <div>
      <DashboardHeader
        title={`${t("welcome")}, ${shop.name}! 👋`}
        actions={
          <div className="flex w-full gap-2 sm:w-auto">
            <Link href={`/${shop.slug}`} target="_blank" className="flex-1 sm:flex-initial">
              <Button variant="outline" className="w-full sm:w-auto">
                {tNav("viewShop")}
              </Button>
            </Link>
            <Link href="/dashboard/orders/new" className="flex-1 sm:flex-initial">
              <Button className="w-full bg-[#E85A6B] hover:bg-[#D44558] sm:w-auto">
                {tNav("newOrder")}
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-7xl">
        {/* Primary KPIs — fewer, wider cards so money never overflows */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            title={t("newOrders")}
            value={newOrders}
            icon={Package}
            accent="blue"
            subtitle={t("totalOrders") + `: ${totalOrders}`}
          />
          <StatCard
            title={t("ordersThisMonth")}
            value={monthOrders}
            icon={ShoppingBag}
            accent="pink"
            subtitle={t("thisMonth")}
          />
          <StatCard
            title={t("revenueThisMonth")}
            value={formatCurrency(monthRev)}
            icon={TrendingUp}
            accent="green"
            subtitle={t("thisMonth")}
            compactValue
          />
          <StatCard
            title={t("totalRevenue")}
            value={formatCurrency(totalRevenue)}
            icon={TrendingUp}
            accent="purple"
            compactValue
          />
        </div>

        {/* Secondary status chips — compact, no huge numbers */}
        <div className="grid gap-3 grid-cols-2 lg:grid-cols-4">
          <StatCard title={t("shippedOrders")} value={shippedOrders} icon={Truck} accent="green" />
          <StatCard title={t("exchangesInProgress")} value={exchangesInProgress} icon={RefreshCw} accent="amber" />
          <StatCard title={t("openComplaints")} value={openComplaints} icon={AlertTriangle} accent="purple" />
          <StatCard title={t("newCustomers")} value={newCustomers} icon={Users} accent="blue" subtitle={t("thisMonth")} />
        </div>

        <div className="flex flex-wrap gap-2">
          <Link href="/dashboard/products/new">
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" />{tNav("addProduct")}</Button>
          </Link>
          <Link href="/dashboard/orders/new">
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" />{tNav("newOrder")}</Button>
          </Link>
          <Link href="/dashboard/exchanges/new">
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" />{t("quickActions")} — {tNav("exchanges")}</Button>
          </Link>
          <Link href="/dashboard/complaints/new">
            <Button variant="outline"><Plus className="h-4 w-4 mr-2" />{tNav("complaints")}</Button>
          </Link>
        </div>

        <MerchantTryOnStatsCard shopId={shop.id} />

        <div className="grid lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 shadow-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle>{t("recentOrders")}</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tOrders("orderNumber")}</TableHead>
                    <TableHead>{tOrders("customer")}</TableHead>
                    <TableHead>{tOrders("status")}</TableHead>
                    <TableHead>{tOrders("amount")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell>
                        <Link href={`/dashboard/orders/${order.id}`} className="text-[#E85A6B] hover:underline font-medium">
                          {order.orderNumber}
                        </Link>
                      </TableCell>
                      <TableCell>{order.customerName}</TableCell>
                      <TableCell><StatusBadge status={order.status} /></TableCell>
                      <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="border-b bg-slate-50/50">
              <CardTitle>{t("topProducts")}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <ul className="space-y-4">
                {topProducts.map((p, i) => (
                  <li key={p.productName} className="flex items-center justify-between gap-3">
                    <span className="flex items-center gap-3 text-sm font-medium">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#E85A6B]/12 text-xs font-bold text-[#E85A6B]">
                        {i + 1}
                      </span>
                      {p.productName}
                    </span>
                    <span className="text-sm text-muted-foreground">{p._sum.quantity} kom</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
