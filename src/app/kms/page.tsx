import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Shirt, Sparkles } from "lucide-react";
import { KmsHeader } from "@/components/kms/kms-header";
import { KmsFooter } from "@/components/kms/kms-footer";
import { KmsTrack } from "@/components/kms/kms-track";
import { getKmsDemoShopSlug, getMojShopBaseUrl } from "@/lib/kms/config";
import { getKmsPrefix } from "@/lib/kms/links";

const STEPS = [
  {
    icon: Shirt,
    title: "Izaberi komad",
    text: "Otvori shop i pronađi haljinu, majicu ili sako koji ti se sviđa.",
  },
  {
    icon: Camera,
    title: "Dodaj fotografiju",
    text: "Slikaj se telefonom ili izaberi postojeću fotografiju.",
  },
  {
    icon: Sparkles,
    title: "Vidi kako ti stoji",
    text: "Za nekoliko sekundi dobijaš AI prikaz sebe u tom komadu.",
  },
];

export default async function KmsLandingPage() {
  const demoSlug = getKmsDemoShopSlug();
  const prefix = await getKmsPrefix();

  return (
    <div className="flex min-h-dvh flex-col">
      <KmsTrack event="kako_mi_stoji_landing_view" />
      <KmsHeader />

      <main className="flex-1">
        <section className="mx-auto max-w-5xl px-5 pb-14 pt-12 sm:pt-20">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--kms-ink-soft)]">
            AI proba odeće
          </p>

          <h1 className="mt-4 text-[2.6rem] font-extrabold leading-[1.03] tracking-[-0.035em] sm:text-6xl">
            Kako mi <span className="kms-gradient-text">stoji</span>?
          </h1>

          <p className="mt-5 max-w-md text-base leading-relaxed text-[var(--kms-ink-soft)] sm:text-lg">
            Izaberi komad. Dodaj svoju fotografiju. Pogledaj kako ti stoji — pre nego
            što naručiš.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:max-w-sm">
            <Link
              href={`${prefix}/shop/${demoSlug}`}
              className="kms-cta inline-flex h-13 items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-bold"
            >
              Probaj odmah
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href={`${getMojShopBaseUrl()}/sign-up`}
              className="inline-flex items-center justify-center rounded-full border border-[var(--kms-line)] bg-white px-7 py-3.5 text-sm font-semibold"
            >
              Imaš shop? Uključi KakoMiStoji
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:mt-16 sm:gap-4">
            <figure className="kms-card overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&h=1067&fit=crop"
                  alt="Fotografija komada odeće"
                  fill
                  sizes="(max-width: 640px) 46vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kms-ink-soft)]">
                Komad iz shopa
              </figcaption>
            </figure>

            <figure className="kms-card overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src="https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800&h=1067&fit=crop"
                  alt="AI prikaz kako komad stoji"
                  fill
                  sizes="(max-width: 640px) 46vw, 320px"
                  className="object-cover"
                />
                <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1 rounded-full bg-black/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur">
                  <Sparkles className="h-3 w-3" />
                  AI
                </span>
              </div>
              <figcaption className="px-3 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--kms-ink-soft)]">
                Kako tebi stoji
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-5 pb-16">
          <ol className="grid gap-3 sm:grid-cols-3 sm:gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="kms-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--kms-cream)]">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-[var(--kms-ink-soft)]">
                    0{i + 1}
                  </span>
                </div>
                <h2 className="mt-3.5 text-lg font-bold tracking-[-0.01em]">
                  {step.title}
                </h2>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--kms-ink-soft)]">
                  {step.text}
                </p>
              </li>
            ))}
          </ol>

          <p className="mt-6 text-center text-xs text-[var(--kms-ink-soft)]">
            Bez naloga i registracije. Fotografija se automatski briše nakon obrade.
          </p>
        </section>
      </main>

      <KmsFooter />
    </div>
  );
}
