import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency, formatDate } from "@/lib/utils-app";
import { DashboardHeader } from "@/components/dashboard/header";
import { EmptyState } from "@/components/shared/empty-state";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
type SearchParams = Promise<{ search?: string }>;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { shop } = await requireShop();
  const params = await searchParams;
  const t = await getTranslations("customers");
  const tCommon = await getTranslations("common");

  const search = params.search ?? "";

  const customers = await prisma.customer.findMany({
    where: {
      shopId: shop.id,
      ...(search
        ? {
            OR: [
              { fullName: { contains: search, mode: "insensitive" } },
              { phone: { contains: search } },
              { email: { contains: search, mode: "insensitive" } },
              { instagramUsername: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      _count: { select: { orders: true } },
      orders: {
        where: { status: { not: "CANCELLED" } },
        select: { totalAmount: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <DashboardHeader title={t("title")} />

      <div className="p-6 space-y-4">
        <form className="flex gap-3">
          <Input
            name="search"
            placeholder={tCommon("search")}
            defaultValue={search}
            className="max-w-xs"
          />
          <Button type="submit" variant="outline">
            {tCommon("filter")}
          </Button>
        </form>

        {customers.length === 0 ? (
          <EmptyState title={tCommon("noResults")} />
        ) : (
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{tCommon("name")}</TableHead>
                  <TableHead>{tCommon("phone")}</TableHead>
                  <TableHead>{tCommon("email")}</TableHead>
                  <TableHead>{t("totalOrders")}</TableHead>
                  <TableHead>{t("totalSpent")}</TableHead>
                  <TableHead>{tCommon("date")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => {
                  const totalSpent = customer.orders.reduce(
                    (sum, o) => sum + Number(o.totalAmount),
                    0
                  );

                  return (
                    <TableRow key={customer.id}>
                      <TableCell>
                        <Link href={`/dashboard/customers/${customer.id}`} className="text-pink-600 hover:underline font-medium">
                          {customer.fullName}
                        </Link>
                      </TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.email ?? "—"}</TableCell>
                      <TableCell>{customer._count.orders}</TableCell>
                      <TableCell>{formatCurrency(totalSpent)}</TableCell>
                      <TableCell>{formatDate(customer.createdAt)}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
