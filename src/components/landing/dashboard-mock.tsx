"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  Package,
  Plus,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Truck,
  Users,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";

const primaryStats = [
  {
    label: "Nove porudžbine",
    value: "18",
    subtitle: "Ukupno: 248",
    icon: Package,
    tone: "from-sky-50 to-white border-sky-100",
    iconTone: "bg-sky-100 text-sky-600",
  },
  {
    label: "Porudžbine ovog meseca",
    value: "42",
    subtitle: "Ovog meseca",
    icon: ShoppingBag,
    tone: "from-pink-50 to-white border-pink-100",
    iconTone: "bg-pink-100 text-pink-600",
  },
  {
    label: "Prihod ovog meseca",
    value: "186.400 RSD",
    subtitle: "Ovog meseca",
    icon: TrendingUp,
    tone: "from-emerald-50 to-white border-emerald-100",
    iconTone: "bg-emerald-100 text-emerald-600",
  },
  {
    label: "Ukupan prihod",
    value: "1.245.800 RSD",
    subtitle: "Sve vreme",
    icon: TrendingUp,
    tone: "from-violet-50 to-white border-violet-100",
    iconTone: "bg-violet-100 text-violet-600",
  },
];

const secondaryStats = [
  { label: "Poslate", value: "64", icon: Truck, tone: "from-emerald-50 to-white border-emerald-100", iconTone: "bg-emerald-100 text-emerald-600" },
  { label: "Zamene u toku", value: "3", icon: RefreshCw, tone: "from-amber-50 to-white border-amber-100", iconTone: "bg-amber-100 text-amber-600" },
  { label: "Reklamacije", value: "1", icon: AlertTriangle, tone: "from-violet-50 to-white border-violet-100", iconTone: "bg-violet-100 text-violet-600" },
  { label: "Novi kupci", value: "27", icon: Users, tone: "from-sky-50 to-white border-sky-100", iconTone: "bg-sky-100 text-sky-600" },
];

const orders = [
  { id: "#1248", customer: "Ana Jovanović", status: "Nova", amount: "4.200 RSD", statusColor: "bg-sky-100 text-sky-700" },
  { id: "#1247", customer: "Marko Petrović", status: "Poslata", amount: "7.800 RSD", statusColor: "bg-emerald-100 text-emerald-700" },
  { id: "#1246", customer: "Jelena Nikolić", status: "Spakovana", amount: "3.150 RSD", statusColor: "bg-amber-100 text-amber-700" },
  { id: "#1245", customer: "Ivana Đorđević", status: "Isporučena", amount: "5.900 RSD", statusColor: "bg-violet-100 text-violet-700" },
];

const products = [
  { name: "Haljina Luna", sold: 42 },
  { name: "Torba Milano", sold: 31 },
  { name: "Duks Soft", sold: 28 },
  { name: "Sandale Aria", sold: 19 },
];

export function LandingDashboardMock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 120);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`relative mx-auto w-full max-w-5xl transition-all duration-1000 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-gradient-to-br from-rose-200/40 via-orange-100/30 to-sky-200/40 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_25px_80px_-20px_rgba(15,23,42,0.35)]">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/80 px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto rounded-md bg-white px-3 py-1 text-[11px] text-slate-400 ring-1 ring-slate-200">
            mojshop.app/dashboard
          </div>
        </div>

        <div className="grid md:grid-cols-[168px_1fr]">
          <aside className="hidden border-r border-slate-100 bg-slate-900 p-4 text-white md:block">
            <BrandLogo
              variant="light"
              iconClassName="h-4 w-4"
              wordmarkClassName="text-sm"
              className="mb-1"
            />
            <p className="mb-5 truncate text-[10px] text-slate-400">Butik Mila</p>
            <div className="space-y-1.5 text-xs text-slate-300">
              {["Pregled", "Porudžbine", "Proizvodi", "Kupci", "Zamene", "Prodavnica"].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`rounded-lg px-3 py-2 ${
                      i === 0 ? "bg-rose-500/20 text-rose-300" : ""
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </aside>

          <div className="bg-slate-50/40 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-rose-500">Butik Mila</p>
                <h3 className="truncate text-base font-bold text-slate-900 sm:text-lg">
                  Dobrodošli, Butik Mila! 👋
                </h3>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="hidden rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-[10px] font-medium text-slate-600 sm:inline">
                  Pogledaj prodavnicu
                </span>
                <span className="inline-flex items-center rounded-lg bg-rose-500 px-2.5 py-1.5 text-[10px] font-semibold text-white">
                  <Plus className="mr-1 h-3 w-3" />
                  Nova porudžbina
                </span>
              </div>
            </div>

            {/* Primary KPIs — matches new dashboard */}
            <div className="grid grid-cols-2 gap-2 sm:gap-3 xl:grid-cols-4">
              {primaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`min-w-0 rounded-xl border bg-gradient-to-br p-3 shadow-sm ${stat.tone}`}
                >
                  <div className="mb-2 flex items-start justify-between gap-2">
                    <p className="min-w-0 text-[10px] font-medium leading-snug text-slate-500">
                      {stat.label}
                    </p>
                    <div className={`shrink-0 rounded-lg p-1.5 ${stat.iconTone}`}>
                      <stat.icon className="h-3 w-3" />
                    </div>
                  </div>
                  <p
                    className="break-words font-bold leading-tight text-slate-900 [overflow-wrap:anywhere] tabular-nums text-sm sm:text-base"
                    title={stat.value}
                  >
                    {stat.value}
                  </p>
                  <p className="mt-1 text-[10px] text-slate-400">{stat.subtitle}</p>
                </div>
              ))}
            </div>

            {/* Secondary status row */}
            <div className="mt-2 grid grid-cols-2 gap-2 sm:mt-3 sm:gap-3 lg:grid-cols-4">
              {secondaryStats.map((stat) => (
                <div
                  key={stat.label}
                  className={`min-w-0 rounded-xl border bg-gradient-to-br p-2.5 shadow-sm ${stat.tone}`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-[10px] font-medium text-slate-500">{stat.label}</p>
                    <div className={`shrink-0 rounded-md p-1 ${stat.iconTone}`}>
                      <stat.icon className="h-3 w-3" />
                    </div>
                  </div>
                  <p className="mt-1 text-lg font-bold tabular-nums text-slate-900">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 flex flex-wrap gap-1.5">
              {["+ Dodaj proizvod", "+ Nova porudžbina", "+ Zamena"].map((label) => (
                <span
                  key={label}
                  className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[10px] font-medium text-slate-600"
                >
                  {label}
                </span>
              ))}
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1.35fr_1fr]">
              <div className="overflow-hidden rounded-xl border border-slate-100 bg-white">
                <div className="border-b border-slate-100 bg-slate-50/80 px-3 py-2 text-xs font-semibold text-slate-700">
                  Nedavne porudžbine
                </div>
                <div className="divide-y divide-slate-50">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="grid grid-cols-[auto_1fr_auto_auto] items-center gap-2 px-3 py-2 text-[11px]"
                    >
                      <span className="font-semibold text-rose-600">{order.id}</span>
                      <span className="truncate text-slate-700">{order.customer}</span>
                      <span className={`rounded-full px-2 py-0.5 font-medium ${order.statusColor}`}>
                        {order.status}
                      </span>
                      <span className="font-medium tabular-nums text-slate-900">{order.amount}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 bg-white p-3">
                <p className="mb-3 text-xs font-semibold text-slate-700">Najprodavaniji proizvodi</p>
                <div className="space-y-3">
                  {products.map((p, i) => (
                    <div key={p.name} className="flex items-center gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-pink-100 text-[10px] font-bold text-pink-600">
                        {i + 1}
                      </span>
                      <div className="min-w-0 flex-1">
                        <div className="mb-1 flex justify-between gap-2 text-[11px]">
                          <span className="truncate font-medium text-slate-700">{p.name}</span>
                          <span className="shrink-0 text-slate-500">{p.sold} kom</span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-rose-500 to-orange-400"
                            style={{ width: `${Math.min(100, p.sold * 2.2)}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
