import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatCurrency } from "@/lib/utils-app";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteProductButton } from "./delete-product-button";
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
import type { ProductStatus } from "@/lib/prisma-client";

type SearchParams = Promise<{ search?: string; status?: string }>;

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { shop } = await requireShop();
  const params = await searchParams;
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");
  const tNav = await getTranslations("nav");

  const search = params.search ?? "";
  const status = params.status ?? "all";

  const products = await prisma.product.findMany({
    where: {
      shopId: shop.id,
      status:
        status !== "all"
          ? status === "INACTIVE"
            ? { in: ["DRAFT", "ARCHIVED"] as ProductStatus[] }
            : (status as ProductStatus)
          : { in: ["ACTIVE", "DRAFT", "SOLD_OUT", "ARCHIVED"] as ProductStatus[] },
      ...(search
        ? {
            OR: [
              { name: { contains: search, mode: "insensitive" } },
              { category: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <DashboardHeader
        title={t("title")}
        actions={
          <Link href="/dashboard/products/new">
            <Button className="bg-pink-500 hover:bg-pink-600">
              <Plus className="h-4 w-4 mr-2" />
              {tNav("addProduct")}
            </Button>
          </Link>
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
            <option value="ACTIVE">{t("statuses.ACTIVE")}</option>
            <option value="INACTIVE">{t("statuses.INACTIVE")}</option>
            <option value="SOLD_OUT">{t("statuses.SOLD_OUT")}</option>
          </select>
          <Button type="submit" variant="outline">
            {tCommon("filter")}
          </Button>
        </form>

        {products.length === 0 ? (
          <EmptyState
            title={tCommon("noResults")}
            action={
              <Link href="/dashboard/products/new">
                <Button className="bg-pink-500 hover:bg-pink-600">{t("add")}</Button>
              </Link>
            }
          />
        ) : (
          <div className="rounded-lg border bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("image")}</TableHead>
                  <TableHead>{t("name")}</TableHead>
                  <TableHead>{tCommon("price")}</TableHead>
                  <TableHead>{tCommon("status")}</TableHead>
                  <TableHead>{t("stock")}</TableHead>
                  <TableHead className="text-right">{tCommon("actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const totalStock = product.variants.reduce((sum, v) => sum + v.stock, 0);
                  const imageUrl = product.images[0]?.url;

                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        {imageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={imageUrl}
                            alt={product.name}
                            className="rounded object-cover h-10 w-10"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded bg-slate-100" />
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{formatCurrency(Number(product.price))}</TableCell>
                      <TableCell>
                        <StatusBadge status={product.status} type="product" />
                      </TableCell>
                      <TableCell>{totalStock}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Link href={`/dashboard/products/${product.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <DeleteProductButton shopId={shop.id} productId={product.id} />
                        </div>
                      </TableCell>
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
