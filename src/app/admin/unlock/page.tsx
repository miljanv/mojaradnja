import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { isClerkAdmin, isAdminUnlocked } from "@/lib/admin";
import { AdminUnlockForm } from "./unlock-form";
import { BrandLogo } from "@/components/brand/logo";

export default async function AdminUnlockPage() {
  const isAdmin = await isClerkAdmin();
  if (!isAdmin) redirect("/dashboard");

  const unlocked = await isAdminUnlocked();
  if (unlocked) redirect("/admin");

  const t = await getTranslations("admin");

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8 text-white shadow-xl">
        <div className="mb-6">
          <BrandLogo variant="light" />
        </div>
        <h1 className="text-2xl font-bold">{t("unlockTitle")}</h1>
        <p className="mt-2 text-sm text-slate-400">{t("unlockDesc")}</p>
        <div className="mt-6">
          <AdminUnlockForm />
        </div>
      </div>
    </div>
  );
}
