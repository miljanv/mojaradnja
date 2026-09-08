"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  RefreshCw,
  AlertTriangle,
  MessageSquare,
  Settings,
  Sparkles,
  Store,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/logo";
import { SignOutButton } from "@clerk/nextjs";

type SidebarProps = {
  shopSlug?: string;
  shopName?: string;
  impersonating?: boolean;
  counts?: {
    newOrders?: number;
    exchanges?: number;
    complaints?: number;
  };
  onNavigate?: () => void;
  className?: string;
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "home" as const },
  {
    href: "/dashboard/orders",
    icon: ShoppingBag,
    labelKey: "orders" as const,
    countKey: "newOrders" as const,
  },
  { href: "/dashboard/products", icon: Package, labelKey: "products" as const },
  { href: "/dashboard/customers", icon: Users, labelKey: "customers" as const },
  {
    href: "/dashboard/exchanges",
    icon: RefreshCw,
    labelKey: "exchanges" as const,
    countKey: "exchanges" as const,
  },
  {
    href: "/dashboard/complaints",
    icon: AlertTriangle,
    labelKey: "complaints" as const,
    countKey: "complaints" as const,
  },
  {
    href: "/dashboard/templates",
    icon: MessageSquare,
    labelKey: "templates" as const,
  },
  {
    href: "/dashboard/kakomistoji",
    icon: Sparkles,
    labelKey: "kakomistoji" as const,
  },
  { href: "/dashboard/shop", icon: Settings, labelKey: "settings" as const },
];

export function DashboardSidebar({
  shopSlug,
  shopName,
  counts,
  impersonating,
  onNavigate,
  className,
}: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col bg-[#111111] text-white lg:w-64",
        className
      )}
    >
      <div className="hidden border-b border-white/10 p-5 lg:block lg:p-6">
        <Link href="/dashboard" className="block min-w-0" onClick={onNavigate}>
          <BrandLogo variant="light" iconClassName="h-8 w-8 rounded-lg" />
          {shopName && (
            <span className="mt-1.5 block truncate text-xs text-white/50">
              {shopName}
            </span>
          )}
        </Link>
        {impersonating && (
          <Badge className="mt-3 bg-amber-500 text-amber-950 hover:bg-amber-500">
            Admin podrška
          </Badge>
        )}
      </div>

      {impersonating && (
        <div className="border-b border-white/10 px-4 py-3 lg:hidden">
          <Badge className="bg-amber-500 text-amber-950 hover:bg-amber-500">
            Admin podrška
          </Badge>
        </div>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto overscroll-contain p-3 sm:p-4">
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          const count = item.countKey ? counts?.[item.countKey] : undefined;

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors active:scale-[0.99]",
                isActive
                  ? "bg-[#E85A6B]/20 text-[#E85A6B]"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1 font-medium">{t(item.labelKey)}</span>
              {count != null && count > 0 && (
                <Badge className="min-w-6 justify-center bg-[#E85A6B] text-white hover:bg-[#E85A6B]">
                  {count}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-white/10 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:p-4">
        {shopSlug && (
          <Link
            href={`/${shopSlug}`}
            target="_blank"
            onClick={onNavigate}
            className="flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <Store className="h-4 w-4" />
            {t("viewShop")}
          </Link>
        )}
        <SignOutButton>
          <button
            type="button"
            className="flex min-h-11 w-full items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-white/70 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
