import { getTranslations } from "next-intl/server";

export async function TrialBanner({ days }: { days: number }) {
  const t = await getTranslations("subscription");

  return (
    <div className="border-b border-amber-200 bg-amber-50 px-6 py-2.5 text-center text-sm text-amber-900">
      {t("daysLeft", { days })}
    </div>
  );
}
