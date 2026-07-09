"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { UserButton } from "@clerk/nextjs";

type DashboardHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
};

export function DashboardHeader({ title, subtitle, actions }: DashboardHeaderProps) {
  const t = useTranslations("dashboard");

  return (
    <header className="flex flex-col gap-4 border-b bg-white px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          {title ?? t("welcome")}
        </h1>
        {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex items-center gap-3">
        {actions}
        <LanguageSwitcher />
        <UserButton />
      </div>
    </header>
  );
}
