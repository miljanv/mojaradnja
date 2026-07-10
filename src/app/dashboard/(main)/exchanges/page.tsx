import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils-app";
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
import { Plus } from "lucide-react";
import type { ExchangeStatus } from "@/lib/prisma-client";

type SearchParams = Promise<{ search?: string; status?: string }>;

export default async function ExchangesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { shop } = await requireShop();
  const params = await searchParams;
  const t = await getTranslations("exchanges");
  const tOrders = await getTranslations("orders");
  const tCommon = await getTranslations("common");

  const search = params.search ?? "";
  const status = params.status ?? "all";

  const exchanges = await prisma.exchangeRequest.findMany({
    where: {
      shopId: shop.id,
      ...(status !== "all" ? { status: status as ExchangeStatus } : {}),
      ...(search
        ? {
            OR: [
              { originalProductName: { contains: search, mode: "insensitive" } },
              { requestedProductName: { contains: search, mode: "insensitive" } },
              { order: { orderNumber: { contains: search, mode: "insensitive" } } },
              { customer: { fullName: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      order: true,
      customer: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <DashboardHeader
        title={t("title")}
        actions={
          <Link href="/dashboard/exchanges/new">
            <Button className="bg-[#E85A6B] hover:bg-[#D44558]">
              <Plus className="h-4 w-4 mr-2" />
              {t("new")}
            </Button>
          </Link>
        }
      />

      <div className="p-4 sm:p-6 space-y-4">
        <form className="flex flex-wrap gap-3">
          <Input name="search" placeholder={tCommon("search")} defaultValue={search} className="max-w-xs" />
          <select
            name="status"
            defaultValue={status}
            className="h-9 rounded-md border border-input bg-transparent px-3 text-sm"
          >
            <option value="all">{tCommon("all")}</option>
            {([
              "NEW", "WAITING_CUSTOMER_RETURN", "RECEIVED_RETURN",
              "NEW_ITEM_SENT", "COMPLETED", "REJECTED", "CANCELLED",
            ] as ExchangeStatus[]).map((s) => (
              <option key={s} value={s}>
                {t(`statuses.${s}`)}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">{tCommon("filter")}</Button>
        </form>

        {exchanges.length === 0 ? (
          <EmptyState
            title={tCommon("noResults")}
            action={
              <Link href="/dashboard/exchanges/new">
                <Button className="bg-[#E85A6B] hover:bg-[#D44558]">{t("new")}</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tOrders("orderNumber")}</TableHead>
                  <TableHead>{tOrders("customer")}</TableHead>
                  <TableHead>{t("original")}</TableHead>
                  <TableHead>{t("requested")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead>{tCommon("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchanges.map((ex) => (
                  <TableRow key={ex.id}>
                    <TableCell>
                      <Link href={`/dashboard/exchanges/${ex.id}`} className="text-[#E85A6B] hover:underline font-medium">
                        {ex.order.orderNumber}
                      </Link>
                    </TableCell>
                    <TableCell>{ex.customer.fullName}</TableCell>
                    <TableCell>{ex.originalProductName}</TableCell>
                    <TableCell>{ex.requestedProductName ?? "—"}</TableCell>
                    <TableCell><StatusBadge status={ex.status} type="exchange" /></TableCell>
                    <TableCell>{formatDate(ex.createdAt)}</TableCell>
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
