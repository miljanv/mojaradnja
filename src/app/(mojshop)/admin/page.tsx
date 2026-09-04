import Link from "next/link";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { Package, ShoppingBag, Store, Users } from "lucide-react";
import { requireAdminAccess, listAllUsersForAdmin } from "@/lib/admin";
import { prisma } from "@/lib/db";
import { StatCard } from "@/components/dashboard/stat-card";
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
import { AdminInviteForm } from "./admin-invite-form";
import { AdminCreateUserForm } from "./admin-create-user-form";

export default async function AdminHomePage() {
  await requireAdminAccess();
  const t = await getTranslations("admin");

  const [users, shopCount, productCount, orderCount] = await Promise.all([
    listAllUsersForAdmin(),
    prisma.shop.count(),
    prisma.product.count(),
    prisma.order.count(),
  ]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("overview")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t("users")} value={users.length} icon={Users} accent="pink" />
        <StatCard title={t("shops")} value={shopCount} icon={Store} accent="blue" />
        <StatCard title={t("products")} value={productCount} icon={Package} accent="green" />
        <StatCard title={t("orders")} value={orderCount} icon={ShoppingBag} accent="amber" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <AdminInviteForm />
        <AdminCreateUserForm />
      </div>

      <div className="rounded-xl border bg-white shadow-sm">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <h2 className="font-semibold">{t("users")}</h2>
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              {t("view")}
            </Button>
          </Link>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("shops")}</TableHead>
              <TableHead>{t("trialEnds")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  {t("noUsers")}
                </TableCell>
              </TableRow>
            ) : (
              users.slice(0, 10).map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.subscriptionStatus}</Badge>
                  </TableCell>
                  <TableCell>{user.shops.length}</TableCell>
                  <TableCell>
                    {user.trialEndsAt
                      ? format(user.trialEndsAt, "dd.MM.yyyy")
                      : "—"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/users/${user.id}`}>
                      <Button variant="ghost" size="sm">
                        {t("view")}
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
