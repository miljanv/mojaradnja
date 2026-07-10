import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { requireAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
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
import { AdminExtendForm } from "./extend-form";
import { ImpersonateShopButton } from "@/components/admin/impersonate-shop-button";

type Params = Promise<{ id: string }>;

export default async function AdminUserDetailPage({ params }: { params: Params }) {
  await requireAdminAccess();
  const { id } = await params;
  const t = await getTranslations("admin");

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      shops: {
        include: {
          products: {
            include: { images: { take: 1 } },
            orderBy: { createdAt: "desc" },
            take: 20,
          },
          _count: {
            select: { products: true, orders: true, customers: true },
          },
        },
      },
    },
  });

  if (!user) notFound();

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link href="/admin/users" className="text-sm text-[#E85A6B] hover:underline">
            ← {t("users")}
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{user.email}</h1>
          <p className="text-muted-foreground">{user.name || "—"}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge>{user.subscriptionStatus}</Badge>
            {user.trialEndsAt && (
              <Badge variant="secondary">
                {t("trialEnds")}: {format(user.trialEndsAt, "dd.MM.yyyy")}
              </Badge>
            )}
            {user.subscriptionEndsAt && (
              <Badge variant="secondary">
                {t("subEnds")}: {format(user.subscriptionEndsAt, "dd.MM.yyyy")}
              </Badge>
            )}
          </div>
        </div>
        <AdminExtendForm userId={user.id} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("shops")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{user.shops.length}</CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("products")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {user.shops.reduce((s, shop) => s + shop._count.products, 0)}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("orders")}</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {user.shops.reduce((s, shop) => s + shop._count.orders, 0)}
          </CardContent>
        </Card>
      </div>

      {user.shops.map((shop) => (
        <Card key={shop.id}>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>{shop.name}</CardTitle>
              <p className="text-sm text-muted-foreground">/{shop.slug}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant={shop.isPublished ? "default" : "secondary"}>
                {shop.isPublished ? "Published" : "Draft"}
              </Badge>
              <ImpersonateShopButton shopId={shop.id} shopName={shop.name} />
              <Link href={`/${shop.slug}`} target="_blank">
                <Button variant="outline" size="sm">
                  Shop
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="mb-3 text-sm text-muted-foreground">
              {shop._count.products} proizvoda · {shop._count.orders} porudžbina ·{" "}
              {shop._count.customers} kupaca
            </p>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("products")}</TableHead>
                  <TableHead>Cena</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shop.products.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-muted-foreground">
                      Nema proizvoda
                    </TableCell>
                  </TableRow>
                ) : (
                  shop.products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{Number(product.price).toLocaleString("sr-RS")} RSD</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{product.status}</Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
