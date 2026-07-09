import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  Camera,
  CheckCircle2,
  MessageSquare,
  Package,
  RefreshCw,
  ShoppingBag,
  Sparkles,
  Store,
  Users,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/shared/language-switcher";
import { LandingDashboardMock } from "@/components/landing/dashboard-mock";
import { Reveal } from "@/components/landing/reveal";
import { BrandLogo } from "@/components/brand/logo";

export default async function HomePage() {
  const t = await getTranslations("landing");
  const { userId } = await auth();

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#F7F4EF] text-slate-900">
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -left-32 top-0 h-[420px] w-[420px] rounded-full bg-rose-300/25 blur-3xl" />
        <div className="absolute right-0 top-40 h-[380px] w-[380px] rounded-full bg-orange-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-[300px] w-[300px] rounded-full bg-sky-200/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 1px 1px, #0f172a 1px, transparent 0)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <header className="sticky top-0 z-50 border-b border-slate-900/5 bg-[#F7F4EF]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/">
            <BrandLogo />
          </Link>

          <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
            <a href="#features" className="transition-colors hover:text-slate-900">
              {t("navFeatures")}
            </a>
            <a href="#how" className="transition-colors hover:text-slate-900">
              {t("navHow")}
            </a>
            <a href="#pricing" className="transition-colors hover:text-slate-900">
              {t("navPricing")}
            </a>
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <LanguageSwitcher />
            {!userId ? (
              <>
                <Link href="/sign-in">
                  <Button variant="ghost" className="hidden sm:inline-flex">
                    {t("signIn")}
                  </Button>
                </Link>
                <Link href="/sign-up">
                  <Button className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
                    {t("getStarted")}
                  </Button>
                </Link>
              </>
            ) : (
              <Link href="/dashboard">
                <Button className="rounded-full bg-slate-900 px-5 text-white hover:bg-slate-800">
                  Dashboard
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-4 pb-10 pt-14 sm:px-6 sm:pt-20">
          <Reveal>
            <div className="mx-auto max-w-3xl text-center">
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white/70 px-4 py-1.5 text-sm font-medium text-rose-700 shadow-sm">
                <Sparkles className="h-3.5 w-3.5" />
                {t("socialProof")}
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl md:text-6xl md:leading-[1.08]">
                {t("heroTitleBefore")}{" "}
                <span className="relative inline-block text-rose-600">
                  {t("heroHighlight")}
                  <svg
                    className="absolute -bottom-2 left-0 w-full text-orange-400"
                    viewBox="0 0 200 12"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M3 8c40-6 80-8 120-4s50 6 74 2"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="animate-[dash_1.2s_ease_forwards]"
                      style={{
                        strokeDasharray: 300,
                        strokeDashoffset: 0,
                      }}
                    />
                  </svg>
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base text-slate-600 sm:text-lg">
                {t("heroSubtitle")}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                {!userId ? (
                  <>
                    <Link href="/sign-up">
                      <Button
                        size="lg"
                        className="rounded-full bg-rose-600 px-8 text-white hover:bg-rose-500"
                      >
                        {t("ctaPrimary")}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                    <a href="#how">
                      <Button
                        size="lg"
                        variant="outline"
                        className="rounded-full border-slate-300 bg-white/70 px-8"
                      >
                        {t("ctaSecondary")}
                      </Button>
                    </a>
                  </>
                ) : (
                  <Link href="/dashboard">
                    <Button
                      size="lg"
                      className="rounded-full bg-rose-600 px-8 text-white hover:bg-rose-500"
                    >
                      {t("openDashboard")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                )}
              </div>
              <p className="mt-4 text-sm text-slate-500">{t("trialNote")}</p>
            </div>
          </Reveal>

          <div className="mt-14 sm:mt-16">
            <LandingDashboardMock />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("featuresTitle")}
              </h2>
              <p className="mt-3 text-slate-600">{t("featuresSubtitle")}</p>
            </div>
          </Reveal>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: ShoppingBag, title: t("f1Title"), desc: t("f1Desc"), tone: "bg-rose-100 text-rose-600" },
              { icon: Store, title: t("f2Title"), desc: t("f2Desc"), tone: "bg-orange-100 text-orange-600" },
              { icon: Users, title: t("f3Title"), desc: t("f3Desc"), tone: "bg-sky-100 text-sky-600" },
              { icon: RefreshCw, title: t("f4Title"), desc: t("f4Desc"), tone: "bg-amber-100 text-amber-600" },
              { icon: MessageSquare, title: t("f5Title"), desc: t("f5Desc"), tone: "bg-emerald-100 text-emerald-600" },
              { icon: Camera, title: t("f6Title"), desc: t("f6Desc"), tone: "bg-fuchsia-100 text-fuchsia-600" },
            ].map((item, i) => (
              <Reveal key={item.title} delay={i * 70}>
                <div className="group h-full rounded-2xl border border-slate-200/80 bg-white/80 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
                  <div className={`mb-4 inline-flex rounded-xl p-3 ${item.tone}`}>
                    <item.icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{item.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        <section id="how" className="border-y border-slate-200/70 bg-white/50 py-20">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <Reveal>
              <div className="mx-auto mb-12 max-w-2xl text-center">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                  {t("howTitle")}
                </h2>
                <p className="mt-3 text-slate-600">{t("howSubtitle")}</p>
              </div>
            </Reveal>

            <div className="grid gap-6 md:grid-cols-4">
              {[
                { step: "01", title: t("s1Title"), desc: t("s1Desc"), icon: Zap },
                { step: "02", title: t("s2Title"), desc: t("s2Desc"), icon: Package },
                { step: "03", title: t("s3Title"), desc: t("s3Desc"), icon: ShoppingBag },
                { step: "04", title: t("s4Title"), desc: t("s4Desc"), icon: Store },
              ].map((item, i) => (
                <Reveal key={item.step} delay={i * 80}>
                  <div className="relative h-full rounded-2xl border border-slate-200 bg-[#F7F4EF] p-5">
                    <span className="text-xs font-bold tracking-widest text-rose-500">
                      {item.step}
                    </span>
                    <div className="mt-4 mb-3 inline-flex rounded-xl bg-slate-900 p-2.5 text-white">
                      <item.icon className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 text-sm text-slate-600">{item.desc}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
          <Reveal>
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-slate-900 px-6 py-12 text-white shadow-xl sm:px-12">
              <div className="grid items-center gap-10 lg:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-wider text-rose-300">
                    {t("pricingBadge")}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                    {t("pricingTitle")}
                  </h2>
                  <p className="mt-4 text-slate-300">{t("pricingSubtitle")}</p>
                  <ul className="mt-6 space-y-3">
                    {[t("p1"), t("p2"), t("p3"), t("p4")].map((item) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-slate-200">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-rose-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-2xl bg-white p-8 text-slate-900 shadow-lg">
                  <p className="text-sm font-medium text-slate-500">{t("trialLabel")}</p>
                  <div className="mt-2 flex items-end gap-2">
                    <span className="text-5xl font-bold">30</span>
                    <span className="mb-2 text-lg text-slate-500">{t("daysFree")}</span>
                  </div>
                  <p className="mt-3 text-sm text-slate-600">{t("trialDesc")}</p>
                  {!userId ? (
                    <Link href="/sign-up" className="mt-6 block">
                      <Button className="w-full rounded-full bg-rose-600 py-6 text-white hover:bg-rose-500">
                        {t("ctaPrimary")}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="mt-6 block">
                      <Button className="w-full rounded-full bg-rose-600 py-6 text-white hover:bg-rose-500">
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
            <div className="rounded-[2rem] border border-rose-200 bg-gradient-to-br from-rose-50 to-orange-50 px-6 py-14 text-center sm:px-12">
              <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                {t("finalTitle")}
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-slate-600">{t("finalSubtitle")}</p>
              {!userId ? (
                <Link href="/sign-up">
                  <Button
                    size="lg"
                    className="mt-8 rounded-full bg-slate-900 px-8 text-white hover:bg-slate-800"
                  >
                    {t("getStarted")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              ) : (
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    className="mt-8 rounded-full bg-slate-900 px-8 text-white hover:bg-slate-800"
                  >
                    {t("openDashboard")}
                  </Button>
                </Link>
              )}
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-slate-200/80 py-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 text-sm text-slate-500 sm:flex-row sm:px-6">
          <BrandLogo iconClassName="h-4 w-4" wordmarkClassName="text-base" />
          <p>{t("footer")}</p>
        </div>
      </footer>
    </div>
  );
}
