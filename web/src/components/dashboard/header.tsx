"use client";

import { useTranslations } from "next-intl";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { UserButton } from "@clerk/nextjs";
import { cn } from "@/lib/utils";

type DashboardHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  className?: string;
};

export function DashboardHeader({
  title,
  subtitle,
  actions,
  className,
}: DashboardHeaderProps) {
  const t = useTranslations("dashboard");

  return (
    <header
      className={cn(
        "border-b border-[#EDE4DC] bg-white",
        "px-4 py-3 sm:px-6 sm:py-4",
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight text-[#111111] sm:text-2xl">
            {title ?? t("welcome")}
          </h1>
          {subtitle && (
            <p className="mt-0.5 text-sm text-[#6B7280] line-clamp-2">{subtitle}</p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 sm:justify-end sm:gap-3">
          {actions && (
            <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2 sm:flex-initial">
              {actions}
            </div>
          )}
          {/* Language + user live in mobile top bar; show here on desktop */}
          <div className="hidden items-center gap-3 lg:flex">
            <LanguageSwitcher />
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
