import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { Lock } from "lucide-react";
import { isAdminUnlocked, isClerkAdmin } from "@/lib/admin";
import { lockAdminPanel } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/logo";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAdmin = await isClerkAdmin();
  if (!isAdmin) redirect("/dashboard");

  const unlocked = await isAdminUnlocked();

  if (!unlocked) {
    return <>{children}</>;
  }

  const t = await getTranslations("admin");

  async function lockAction() {
    "use server";
    await lockAdminPanel();
    redirect("/admin/unlock");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-40 border-b bg-slate-900 text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-6">
            <Link href="/admin" className="flex items-center gap-2">
              <BrandLogo
                variant="light"
                iconClassName="h-5 w-5"
                wordmarkClassName="text-base"
              />
              <span className="hidden text-sm font-medium text-slate-400 sm:inline">
                {t("title")}
              </span>
            </Link>
            <nav className="hidden items-center gap-4 text-sm text-slate-300 sm:flex">
              <Link href="/admin" className="hover:text-white">
                {t("overview")}
              </Link>
              <Link href="/admin/users" className="hover:text-white">
                {t("users")}
              </Link>
              <Link href="/admin/shops" className="hover:text-white">
                {t("shops")}
              </Link>
              <Link href="/dashboard" className="hover:text-white">
                Dashboard
              </Link>
            </nav>
          </div>
          <form action={lockAction}>
            <Button
              type="submit"
              variant="outline"
              size="sm"
              className="border-slate-600 bg-transparent text-white hover:bg-slate-800"
            >
              <Lock className="mr-2 h-3.5 w-3.5" />
              {t("lock")}
            </Button>
          </form>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
