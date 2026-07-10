"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { UserButton } from "@clerk/nextjs";
import { BrandLogo } from "@/components/brand/logo";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  shopSlug?: string;
  shopName?: string;
  impersonating?: boolean;
  counts?: {
    newOrders?: number;
    exchanges?: number;
    complaints?: number;
  };
  children: React.ReactNode;
};

export function DashboardShell({
  shopSlug,
  shopName,
  impersonating,
  counts,
  children,
}: DashboardShellProps) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const t = useTranslations("nav");

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const sidebarProps = {
    shopSlug,
    shopName,
    impersonating,
    counts,
  };

  return (
    <div className="flex h-dvh overflow-hidden bg-[#FDF8F5]">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:h-full lg:w-64 lg:shrink-0">
        <DashboardSidebar {...sidebarProps} />
      </div>

      {/* Mobile drawer */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          showCloseButton={false}
          className={cn(
            "w-[min(100vw-3rem,18rem)] gap-0 border-0 bg-[#111111] p-0 text-white shadow-2xl sm:max-w-[18rem]"
          )}
        >
          <SheetTitle className="sr-only">{t("menu")}</SheetTitle>
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-end border-b border-white/10 px-3 py-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-white/70 hover:bg-white/10 hover:text-white"
                onClick={() => setOpen(false)}
                aria-label={t("closeMenu")}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <DashboardSidebar
              {...sidebarProps}
              onNavigate={() => setOpen(false)}
              className="min-h-0 flex-1"
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <div className="sticky top-0 z-40 flex items-center gap-2 border-b border-[#EDE4DC] bg-white/95 px-3 py-2.5 backdrop-blur-md lg:hidden supports-[padding:max(0px)]:pt-[max(0.625rem,env(safe-area-inset-top))]">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="shrink-0 text-[#111111]"
            onClick={() => setOpen(true)}
            aria-label={t("openMenu")}
          >
            <Menu className="h-5 w-5" />
          </Button>

          <Link href="/dashboard" className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
              <BrandLogo
                showWordmark={false}
                iconClassName="h-8 w-8 rounded-lg"
              />
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-[#111111]">
                  Moj<span className="text-[#E85A6B]">Shop</span>
                </p>
                {shopName && (
                  <p className="truncate text-[11px] text-[#6B7280]">{shopName}</p>
                )}
              </div>
            </div>
          </Link>

          <div className="flex shrink-0 items-center gap-1.5">
            <LanguageSwitcher />
            <UserButton />
          </div>
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          {children}
        </main>
      </div>
    </div>
  );
}
