"use client";

import { useEffect, useState } from "react";
import {
  CreditCard,
  MapPin,
  Package,
  Shirt,
  ShoppingBag,
  Truck,
} from "lucide-react";
import { BrandLogo } from "@/components/brand/logo";

export function LandingOrderMock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`relative mx-auto w-full max-w-lg transition-all duration-1000 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="absolute -inset-6 rounded-[2rem] bg-[#E85A6B]/15 blur-2xl" />
      <div className="relative overflow-hidden rounded-[1.5rem] border border-[#EDE4DC] bg-white p-5 shadow-[0_25px_60px_-20px_rgba(17,17,17,0.25)] sm:p-6">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E85A6B]/12">
            <ShoppingBag className="h-5 w-5 text-[#E85A6B]" />
          </div>
          <span className="rounded-full bg-[#E85A6B] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
            Nova porudžbina
          </span>
        </div>

        <h3 className="text-xl font-bold tracking-tight text-[#111111] sm:text-2xl">
          #1248 · Ana · <span className="text-[#E85A6B]">4.200 RSD</span>
        </h3>

        <div className="mt-5 divide-y divide-[#EDE4DC]">
          {[
            { icon: Shirt, label: "Crna majica", value: "Veličina: S" },
            { icon: MapPin, label: "Adresa dostave", value: "Novi Sad" },
            { icon: CreditCard, label: "Plaćanje", value: "Uplaćeno", accent: true },
            { icon: Truck, label: "Dostava", value: "2–3 dana", accent: true },
          ].map((row) => (
            <div key={row.label} className="flex items-center gap-3 py-3.5">
              <row.icon className="h-4 w-4 shrink-0 text-[#E85A6B]" strokeWidth={2} />
              <span className="flex-1 text-sm font-medium text-[#111111]">{row.label}</span>
              <span
                className={`text-sm font-semibold ${
                  row.accent ? "text-[#E85A6B]" : "text-[#6B7280]"
                }`}
              >
                {row.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingDashboardMock() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 180);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`relative mx-auto w-full max-w-5xl transition-all duration-1000 ease-out ${
        visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
      }`}
    >
      <div className="absolute -inset-4 rounded-[2rem] bg-[#E85A6B]/10 blur-2xl" />
      <div className="relative overflow-hidden rounded-2xl border border-[#EDE4DC] bg-white shadow-[0_25px_80px_-20px_rgba(17,17,17,0.3)]">
        <div className="flex items-center gap-2 border-b border-[#EDE4DC] bg-[#FDF8F5] px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E85A6B]" />
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          </div>
          <div className="mx-auto rounded-md bg-white px-3 py-1 text-[11px] text-[#6B7280] ring-1 ring-[#EDE4DC]">
            mojshop.app/dashboard
          </div>
        </div>

        <div className="grid md:grid-cols-[168px_1fr]">
          <aside className="hidden border-r border-[#EDE4DC] bg-[#111111] p-4 text-white md:block">
            <BrandLogo
              variant="light"
              iconClassName="h-7 w-7 rounded-md"
              wordmarkClassName="text-sm"
              className="mb-1"
            />
            <p className="mb-5 truncate text-[10px] text-white/50">Butik Mila</p>
            <div className="space-y-1.5 text-xs text-white/70">
              {["Pregled", "Porudžbine", "Proizvodi", "Kupci", "Zamene", "Prodavnica"].map(
                (item, i) => (
                  <div
                    key={item}
                    className={`rounded-lg px-3 py-2 ${
                      i === 0 ? "bg-[#E85A6B]/25 text-[#E85A6B]" : ""
                    }`}
                  >
                    {item}
                  </div>
                )
              )}
            </div>
          </aside>

          <div className="bg-[#FDF8F5]/60 p-4 sm:p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-medium text-[#E85A6B]">Butik Mila</p>
                <h3 className="truncate text-base font-bold text-[#111111] sm:text-lg">
                  Dobrodošli, Butik Mila!
                </h3>
              </div>
              <span className="hidden rounded-full bg-[#E85A6B] px-3 py-1.5 text-[11px] font-semibold text-white sm:inline">
                + Nova porudžbina
              </span>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Nove", value: "18" },
                { label: "Ovog meseca", value: "42" },
                { label: "Prihod", value: "186k" },
                { label: "Kupci", value: "27" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border border-[#EDE4DC] bg-white p-3 shadow-sm"
                >
                  <p className="text-[10px] text-[#6B7280]">{s.label}</p>
                  <p className="mt-1 text-lg font-bold text-[#111111]">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#EDE4DC] bg-white p-3 shadow-sm">
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold text-[#111111]">
                <Package className="h-3.5 w-3.5 text-[#E85A6B]" />
                Nedavne porudžbine
              </div>
              <div className="space-y-2">
                {[
                  { id: "#1248", name: "Ana Jovanović", amount: "4.200 RSD", status: "Nova" },
                  { id: "#1247", name: "Marko Petrović", amount: "7.800 RSD", status: "Poslata" },
                  { id: "#1246", name: "Jelena Nikolić", amount: "3.150 RSD", status: "Spakovana" },
                ].map((o) => (
                  <div
                    key={o.id}
                    className="flex items-center justify-between gap-2 rounded-lg bg-[#FDF8F5] px-2.5 py-2 text-[11px]"
                  >
                    <span className="font-semibold text-[#111111]">{o.id}</span>
                    <span className="min-w-0 flex-1 truncate text-[#6B7280]">{o.name}</span>
                    <span className="font-semibold text-[#E85A6B]">{o.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
