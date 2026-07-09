import Link from "next/link";
import { format } from "date-fns";
import { getTranslations } from "next-intl/server";
import { requireAdminAccess, listAllUsersForAdmin } from "@/lib/admin";
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

export default async function AdminUsersPage() {
  await requireAdminAccess();
  const t = await getTranslations("admin");
  const users = await listAllUsersForAdmin();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">{t("users")}</h1>
      <div className="rounded-xl border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead>{t("shops")}</TableHead>
              <TableHead>{t("products")}</TableHead>
              <TableHead>{t("orders")}</TableHead>
              <TableHead>{t("trialEnds")}</TableHead>
              <TableHead>{t("subEnds")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => {
              const products = user.shops.reduce(
                (sum, s) => sum + s._count.products,
                0
              );
              const orders = user.shops.reduce(
                (sum, s) => sum + s._count.orders,
                0
              );
              return (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>{user.name || "—"}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{user.subscriptionStatus}</Badge>
                  </TableCell>
                  <TableCell>{user.shops.length}</TableCell>
                  <TableCell>{products}</TableCell>
                  <TableCell>{orders}</TableCell>
                  <TableCell>
                    {user.trialEndsAt ? format(user.trialEndsAt, "dd.MM.yyyy") : "—"}
                  </TableCell>
                  <TableCell>
                    {user.subscriptionEndsAt
                      ? format(user.subscriptionEndsAt, "dd.MM.yyyy")
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
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
