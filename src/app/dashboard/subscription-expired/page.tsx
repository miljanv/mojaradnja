import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireAuthUser } from "@/lib/auth";
import { isClerkAdmin } from "@/lib/admin";
import { hasActiveSubscription } from "@/lib/subscription";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

export default async function SubscriptionExpiredPage() {
  const user = await requireAuthUser();
  const admin = await isClerkAdmin();

  if (admin || hasActiveSubscription(user)) {
    redirect("/dashboard");
  }

  const t = await getTranslations("subscription");

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-bold">{t("expiredTitle")}</h1>
        <p className="mt-3 text-slate-600">{t("expiredDesc")}</p>
        <div className="mt-6 flex flex-col gap-2">
          <a href="mailto:support@mojshop.app">
            <Button className="w-full bg-pink-500 hover:bg-pink-600">
              {t("contactSupport")}
            </Button>
          </a>
          <Link href="/">
            <Button variant="outline" className="w-full">
              Početna
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
