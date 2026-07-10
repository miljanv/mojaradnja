import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  CheckCircle2,
  Link2,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import {
  LandingDashboardMock,
  LandingOrderMock,
} from "@/components/landing/dashboard-mock";
import { Reveal } from "@/components/landing/reveal";
import { BrandLogo } from "@/components/brand/logo";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const { userId } = await auth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#FDF8F5] text-[#111111]">
      <header className="sticky top-0 z-50 border-b border-[#EDE4DC]/80 bg-[#FDF8F5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-[#6B7280] md:flex">
            <a href="#features" className="transition-colors hover:text-[#111111]">
              {t("navFeatures")}
            </a>
            <a href="#how" className="transition-colors hover:text-[#111111]">
              {t("navHow")}
            </a>
            <a href="#pricing" className="transition-colors hover:text-[#111111]">
              {t("navPricing")}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            {!userId ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="hidden text-[#111111] sm:inline-flex">
                    {t("signIn")}
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-full bg-[#111111] px-5 text-white hover:bg-[#111111]/90">
                    {t("getStarted")}
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button className="rounded-full bg-[#111111] px-5 text-white hover:bg-[#111111]/90">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        {/* Hero — matches "Jedan link / Manje DM haosa" visual language */}
        <section className="mx-auto max-w-6xl px-4 pb-8 pt-14 sm:px-6 sm:pt-20">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full bg-[#111111] px-4 py-1.5 text-sm font-medium text-white shadow-sm">
                <Sparkles className="h-3.5 w-3.5 text-[#E85A6B]" />
                {t("socialProof")}
              </p>
              <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl md:leading-[1.05]">
                Jedan link.{" "}
                <span className="text-[#E85A6B]">Manje DM haosa.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-[#6B7280] sm:text-lg">
                {t("heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {!userId ? (
                  <>
                    <Link href="/sign-up">
                      <Button
                        size="lg"
                        className="rounded-full bg-[#E85A6B] px-8 text-white hover:bg-[#D44558]"
                      >
                        {t("ctaPrimary")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <a href="#how">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-[#EDE4DC] bg-white px-8"
                      >
                        {t("ctaSecondary")}
                      </Button>
                    </a>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="rounded-full bg-[#E85A6B] px-8 text-white hover:bg-[#D44558]"
                    >
                      {t("openDashboard")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              <p className="mt-4 text-sm text-[#6B7280]">{t("trialNote")}</p>
            </div>
          </Reveal>

          <div className="mt-14 grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
            <Reveal>
              <div>
                <p className="text-sm font-bold uppercase tracking-wider text-[#E85A6B]">
                  Haos u DM-u?
                </p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                  Pretvori chat u jasnu porudžbinu
                </h2>
                <p className="mt-4 text-[#6B7280]">
                  Umesto Notes-a i izgubljenih poruka — jedna kartica sa kupcem, proizvodom,
                  adresom i statusom.
                </p>
                <ul className="mt-6 space-y-3">
                  {[
                    "Porudžbine iz DM-a za par sekundi",
                    "Mini shop link za Instagram bio",
                    "Gotove poruke za potvrdu i slanje",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm font-medium">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-[#E85A6B]" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
            <LandingOrderMock />
          </div>
        </section>

        {/* Before / After */}
        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
          <Reveal>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-[#EDE4DC] bg-white p-6 shadow-sm">
                <span className="rounded-full bg-[#111111] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Pre
                </span>
                <h3 className="mt-4 text-xl font-bold">“Ko je platio?”</h3>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Porudžbine u DM-u, brojevi u Notes-u, adrese u story reply-u.
                </p>
                <div className="mt-5 space-y-2">
                  {["Inbox prepun", "Excel tabela", "Izgubljene poruke"].map((x) => (
                    <div
                      key={x}
                      className="rounded-xl border border-dashed border-[#EDE4DC] bg-[#FDF8F5] px-4 py-3 text-sm text-[#6B7280] line-through"
                    >
                      {x}
                    </div>
                  ))}
                </div>
              </div>
              <div className="rounded-[1.5rem] border border-[#E85A6B]/30 bg-white p-6 shadow-[0_20px_50px_-24px_rgba(232,90,107,0.45)]">
                <span className="rounded-full bg-[#E85A6B] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Posle
                </span>
                <h3 className="mt-4 text-xl font-bold">
                  #1248 · Ana · <span className="text-[#E85A6B]">4.200 RSD</span>
                </h3>
                <p className="mt-2 text-sm text-[#6B7280]">
                  Status jasan. Kupac jasan. Dostava jasna.
                </p>
                <div className="mt-5 space-y-2">
                  {["Nova porudžbina", "Uplaćeno", "Dostava 2–3 dana"].map((x) => (
                    <div
                      key={x}
                      className="flex items-center gap-2 rounded-xl border border-[#EDE4DC] bg-[#FDF8F5] px-4 py-3 text-sm font-medium"
                    >
                      <CheckCircle2 className="h-4 w-4 text-[#E85A6B]" />
                      {x}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
          <LandingDashboardMock />
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("featuresTitle")}
              </h2>
              <p className="mt-3 text-[#6B7280]">{t("featuresSubtitle")}</p>
            </div>
          </Reveal>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShoppingBag, title: t("f1Title"), desc: t("f1Desc") },
              { icon: Store, title: t("f2Title"), desc: t("f2Desc") },
              { icon: Users, title: t("f3Title"), desc: t("f3Desc") },
              { icon: RefreshCw, title: t("f4Title"), desc: t("f4Desc") },
              { icon: MessageSquare, title: t("f5Title"), desc: t("f5Desc") },
              { icon: Link2, title: t("f6Title"), desc: t("f6Desc") },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 60}>
                <div className="group h-full rounded-[1.25rem] border border-[#EDE4DC] bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className="mb-4 inline-flex rounded-xl bg-[#E85A6B]/12 p-3 text-[#E85A6B]">
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* 4 steps — matches visual 06 */}
        <section id="how" className="border-y border-[#EDE4DC] bg-white/60 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("howTitle")}
                </h2>
                <p className="mt-3 text-[#6B7280]">{t("howSubtitle")}</p>
              </div>
            </Reveal>

            <div className="grid gap-4 md:grid-cols-4">
              {[
                { step: "01", title: t("s1Title"), desc: t("s1Desc") },
                { step: "02", title: t("s2Title"), desc: t("s2Desc") },
                { step: "03", title: t("s3Title"), desc: t("s3Desc") },
                { step: "04", title: t("s4Title"), desc: t("s4Desc") },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 70}>
                  <div className="relative h-full rounded-[1.25rem] border border-[#EDE4DC] bg-[#FDF8F5] p-5">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#E85A6B] text-xs font-bold text-white">
                      {item.step}
                    </span>
                    <h3 className="mt-4 font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-[#6B7280]">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing — dark like visual 02 */}
        <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] bg-[#111111] px-6 py-12 text-white shadow-xl sm:px-12">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-[#E85A6B]">
                    {t("pricingBadge")}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-5xl">
                    30 dana besplatno
                  </h2>
                  <p className="mt-3 text-[#E85A6B]">Bez kartice. Bez obaveze.</p>
                  <p className="mt-4 text-white/70">{t("pricingSubtitle")}</p>
                  <ul className="mt-6 space-y-3">
                    {[t("p1"), t("p2"), t("p3"), t("p4")].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-white/85">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#E85A6B]" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-[1.5rem] bg-white p-8 text-[#111111] shadow-lg">
                  <p className="text-sm font-medium text-[#6B7280]">{t("trialLabel")}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-5xl font-bold">30</span>
                    <span className="mb-2 text-lg text-[#6B7280]">{t("daysFree")}</span>
                  </div>
                  <p className="mt-3 text-sm text-[#6B7280]">{t("trialDesc")}</p>
                  {!userId ? (
                    <Link href="/sign-up" className="mt-6 block">
                      <Button className="w-full rounded-full bg-[#E85A6B] py-6 text-white hover:bg-[#D44558]">
                        Započni na mojshop.app
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="mt-6 block">
                      <Button className="w-full rounded-full bg-[#E85A6B] py-6 text-white hover:bg-[#D44558]">
                        {t("openDashboard")}
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </Reveal>
        </section>

        <section className="mx-auto max-w-6xl px-4 pb-24 sm:px-6">
          <Reveal>
            <div className="rounded-[2rem] border border-[#EDE4DC] bg-white px-6 py-14 text-center shadow-sm sm:px-12">
              <Package className="mx-auto mb-4 h-8 w-8 text-[#E85A6B]" />
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("finalTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-[#6B7280]">{t("finalSubtitle")}</p>
              {!userId ? (
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="mt-8 rounded-full bg-[#111111] px-8 text-white hover:bg-[#111111]/90"
                  >
                    {t("getStarted")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="mt-8 rounded-full bg-[#111111] px-8 text-white hover:bg-[#111111]/90"
                  >
                    {t("openDashboard")}
                  </Button>
                </Link>
              )}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="bg-[#111111] py-8 text-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm sm:flex-row sm:px-6">
          <BrandLogo variant="light" iconClassName="h-7 w-7 rounded-md" wordmarkClassName="text-base" />
          <p className="text-white/60">
            mojshop<span className="text-[#E85A6B]">.app</span> — {t("footer").replace("© MojShop — ", "")}
          </p>
        </div>
      </footer>
    </div>
  );
}
