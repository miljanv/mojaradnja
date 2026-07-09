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
  Store,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { BrandLogo } from "@/components/brand/logo";
import { SignOutButton } from "@clerk/nextjs";

type SidebarProps = {
  shopSlug?: string;
  shopName?: string;
  isAdmin?: boolean;
  impersonating?: boolean;
  counts?: {
    newOrders?: number;
    exchanges?: number;
    complaints?: number;
  };
};

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, labelKey: "home" as const },
  { href: "/dashboard/orders", icon: ShoppingBag, labelKey: "orders" as const, countKey: "newOrders" as const },
  { href: "/dashboard/products", icon: Package, labelKey: "products" as const },
  { href: "/dashboard/customers", icon: Users, labelKey: "customers" as const },
  { href: "/dashboard/exchanges", icon: RefreshCw, labelKey: "exchanges" as const, countKey: "exchanges" as const },
  { href: "/dashboard/complaints", icon: AlertTriangle, labelKey: "complaints" as const, countKey: "complaints" as const },
  { href: "/dashboard/templates", icon: MessageSquare, labelKey: "templates" as const },
  { href: "/dashboard/shop", icon: Settings, labelKey: "settings" as const },
];

export function DashboardSidebar({
  shopSlug,
  shopName,
  counts,
  isAdmin,
  impersonating,
}: SidebarProps) {
  const pathname = usePathname();
  const t = useTranslations("nav");

  return (
    <aside className="flex h-full w-64 flex-col bg-slate-900 text-white">
      <div className="border-b border-slate-700 p-6">
        <Link href="/dashboard" className="block min-w-0">
          <BrandLogo variant="light" iconClassName="h-5 w-5" />
          {shopName && (
            <span className="mt-1.5 block truncate text-xs text-slate-400">
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

      <nav className="flex-1 space-y-1 p-4">
        {isAdmin && (
          <Link
            href="/admin"
            className="mb-2 flex items-center gap-3 rounded-lg bg-rose-500/15 px-3 py-2.5 text-sm text-rose-300 transition-colors hover:bg-rose-500/25"
          >
            <Shield className="h-4 w-4 shrink-0" />
            <span className="flex-1">Admin</span>
          </Link>
        )}
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
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isActive
                  ? "bg-pink-500/20 text-pink-300"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white"
              )}
            >
              <item.icon className="h-4 w-4 shrink-0" />
              <span className="flex-1">{t(item.labelKey)}</span>
              {count != null && count > 0 && (
                <Badge className="bg-pink-500 text-white hover:bg-pink-500">
                  {count}
                </Badge>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-2 border-t border-slate-700 p-4">
        {shopSlug && (
          <Link
            href={`/${shopSlug}`}
            target="_blank"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white"
          >
            <Store className="h-4 w-4" />
            {t("viewShop")}
          </Link>
        )}
        <SignOutButton>
          <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-300 hover:bg-slate-800 hover:text-white">
            <LogOut className="h-4 w-4" />
            {t("logout")}
          </button>
        </SignOutButton>
      </div>
    </aside>
  );
}
