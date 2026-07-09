import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils-app";
import { SOURCE_ICONS } from "@/lib/constants";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Download } from "lucide-react";
import type { OrderStatus, OrderSource } from "@/lib/prisma-client";

type SearchParams = Promise<{ search?: string; status?: string; source?: string }>;

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { shop } = await requireShop();
  const params = await searchParams;
  const t = await getTranslations("orders");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  const search = params.search ?? "";
  const status = params.status ?? "all";
  const source = params.source ?? "all";

  const orders = await prisma.order.findMany({
    where: {
      shopId: shop.id,
      ...(status !== "all" ? { status: status as OrderStatus } : {}),
      ...(source !== "all" ? { source: source as OrderSource } : {}),
      ...(search
        ? {
            OR: [
              { orderNumber: { contains: search, mode: "insensitive" } },
              { customerName: { contains: search, mode: "insensitive" } },
              { customerPhone: { contains: search } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
  });

  const exportParams = new URLSearchParams();
  if (search) exportParams.set("search", search);
  if (status !== "all") exportParams.set("status", status);
  if (source !== "all") exportParams.set("source", source);
  const exportHref = `/api/export/orders${exportParams.toString() ? `?${exportParams}` : ""}`;

  return (
    <div>
      <DashboardHeader
        title={t("title")}
        actions={
          <div className="flex gap-2">
            <a href={exportHref}>
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                {tCommon("export")} CSV
              </Button>
            </a>
            <Link href="/dashboard/orders/new">
              <Button className="bg-pink-500 hover:bg-pink-600">
                <Plus className="h-4 w-4 mr-2" />
                {tNav("newOrder")}
              </Button>
            </Link>
          </div>
        }
      />

      <div className="p-6 space-y-4">
        <form className="flex flex-wrap gap-3">
          <Input
            name="search"
            placeholder={tCommon("search")}
            defaultValue={search}
            className="max-w-xs"
          />
          <select
            name="status"
            defaultValue={status}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">{tCommon("all")}</option>
            {([
              "NEW", "CONFIRMED", "WAITING_PAYMENT", "PACKED", "SHIPPED",
              "DELIVERED", "CANCELLED", "RETURNED", "EXCHANGE_IN_PROGRESS",
            ] as OrderStatus[]).map((s) => (
              <option key={s} value={s}>
                {t(`statuses.${s}`)}
              </option>
            ))}
          </select>
          <select
            name="source"
            defaultValue={source}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">{tCommon("all")}</option>
            {(["MANUAL", "MINI_SHOP", "INSTAGRAM_DM", "VIBER", "WHATSAPP", "PHONE"] as OrderSource[]).map((s) => (
              <option key={s} value={s}>
                {t(`sources.${s}`)}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">
            {tCommon("filter")}
          </Button>
        </form>

        {orders.length === 0 ? (
          <EmptyState
            title={tCommon("noResults")}
            action={
              <Link href="/dashboard/orders/new">
                <Button className="bg-pink-500 hover:bg-pink-600">{t("new")}</Button>
              </Link>
            }
          />
        ) : (
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("orderNumber")}</TableHead>
                  <TableHead>{t("customer")}</TableHead>
                  <TableHead>{t("source")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead>{t("amount")}</TableHead>
                  <TableHead>{tCommon("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Link href={`/dashboard/orders/${order.id}`} className="text-pink-600 hover:underline font-medium">
                        {order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <div>{order.customerName}</div>
                      <div className="text-xs text-muted-foreground">{order.customerPhone}</div>
                    </TableCell>
                    <TableCell>
                      <span title={t(`sources.${order.source}`)}>
                        {SOURCE_ICONS[order.source]} {t(`sources.${order.source}`)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                    <TableCell>{formatCurrency(Number(order.totalAmount))}</TableCell>
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
