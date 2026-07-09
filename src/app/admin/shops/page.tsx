import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ImpersonateShopButton } from "@/components/admin/impersonate-shop-button";

export default async function AdminShopsPage() {
  await requireAdminAccess();
  const t = await getTranslations("admin");

  const shops = await prisma.shop.findMany({
    include: {
      owner: true,
      _count: {
        select: { products: true, orders: true, customers: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("shops")}</h1>
      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Naziv</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Vlasnik</TableHead>
              <TableHead>{t("products")}</TableHead>
              <TableHead>{t("orders")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {shops.map((shop) => (
              <TableRow key={shop.id}>
                <TableCell className="font-medium">{shop.name}</TableCell>
                <TableCell>/{shop.slug}</TableCell>
                <TableCell>
                  <Link
                    href={`/admin/users/${shop.ownerId}`}
                    className="text-pink-600 hover:underline"
                  >
                    {shop.owner.email}
                  </Link>
                </TableCell>
                <TableCell>{shop._count.products}</TableCell>
                <TableCell>{shop._count.orders}</TableCell>
                <TableCell>
                  <Badge variant={shop.isPublished ? "default" : "secondary"}>
                    {shop.isPublished ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap items-center gap-2">
                    <ImpersonateShopButton
                      shopId={shop.id}
                      shopName={shop.name}
                      variant="outline"
                    />
                    <Link href={`/${shop.slug}`} target="_blank">
                      <Button variant="ghost" size="sm">
                        Shop
                      </Button>
                    </Link>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
