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
import { Plus, Pencil } from "lucide-react";
import type { ComplaintStatus } from "@/lib/prisma-client";

type SearchParams = Promise<{ search?: string; status?: string }>;

export default async function ComplaintsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { shop } = await requireShop();
  const params = await searchParams;
  const t = await getTranslations("complaints");
  const tOrders = await getTranslations("orders");
  const tCommon = await getTranslations("common");

  const search = params.search ?? "";
  const status = params.status ?? "all";

  const complaints = await prisma.complaintRequest.findMany({
    where: {
      shopId: shop.id,
      ...(status !== "all" ? { status: status as ComplaintStatus } : {}),
      ...(search
        ? {
            OR: [
              { reason: { contains: search, mode: "insensitive" } },
              { description: { contains: search, mode: "insensitive" } },
              { customer: { fullName: { contains: search, mode: "insensitive" } } },
              { order: { orderNumber: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      customer: true,
      order: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <DashboardHeader
        title={t("title")}
        actions={
          <Link href="/dashboard/complaints/new">
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
              "NEW", "REVIEWING", "APPROVED", "REJECTED",
              "REFUNDED", "REPLACED", "CLOSED",
            ] as ComplaintStatus[]).map((s) => (
              <option key={s} value={s}>
                {t(`statuses.${s}`)}
              </option>
            ))}
          </select>
          <Button type="submit" variant="outline">{tCommon("filter")}</Button>
        </form>

        {complaints.length === 0 ? (
          <EmptyState
            title={tCommon("noResults")}
            action={
              <Link href="/dashboard/complaints/new">
                <Button className="bg-[#E85A6B] hover:bg-[#D44558]">{t("new")}</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("reason")}</TableHead>
                  <TableHead>{tOrders("customer")}</TableHead>
                  <TableHead>{tOrders("orderNumber")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead>{tCommon("date")}</TableHead>
                  <TableHead className="text-right">{tCommon("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/complaints/${c.id}`} className="text-[#E85A6B] hover:underline">
                        {c.reason}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link href={`/dashboard/customers/${c.customer.id}`} className="text-[#E85A6B] hover:underline">
                        {c.customer.fullName}
                      </Link>
                    </TableCell>
                    <TableCell>
                      {c.order ? (
                        <Link href={`/dashboard/orders/${c.order.id}`} className="text-[#E85A6B] hover:underline">
                          {c.order.orderNumber}
                        </Link>
                      ) : "—"}
                    </TableCell>
                    <TableCell><StatusBadge status={c.status} type="complaint" /></TableCell>
                    <TableCell>{formatDate(c.createdAt)}</TableCell>
                    <TableCell className="text-right">
                      <Link href={`/dashboard/complaints/${c.id}`}>
                        <Button variant="ghost" size="sm" title={t("edit")}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </Link>
                    </TableCell>
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
