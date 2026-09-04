import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Camera, Shirt, Sparkles } from "lucide-react";
import { KmsHeader } from "@/components/kms/kms-header";
import { KmsFooter } from "@/components/kms/kms-footer";
import { KmsTrack } from "@/components/kms/kms-track";
import { KmsPhotoGuide } from "@/components/kms/kms-photo-guide";
import { getKmsDemoShopSlug } from "@/lib/kms/config";
import { getKmsPrefix } from "@/lib/kms/links";

const STEPS = [
  {
    icon: Shirt,
    title: "Izaberi komad",
    text: "Otvori shop i pronađi haljinu, majicu ili sako.",
  },
  {
    icon: Camera,
    title: "Dodaj fotografiju",
    text: "Celo telo, sprijeda, uz dobro svetlo.",
  },
  {
    icon: Sparkles,
    title: "Vidi kako ti stoji",
    text: "Za nekoliko sekundi dobijaš AI prikaz.",
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
        <section className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-5 sm:pb-14 sm:pt-16">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--kms-ink-soft)]">
            AI proba odeće
          </p>

          <h1 className="mt-3 text-[2.35rem] font-extrabold leading-[1.05] tracking-[-0.04em] sm:text-6xl">
            Kako mi <span className="kms-gradient-text">stoji</span>?
          </h1>

          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-[var(--kms-ink-soft)] sm:text-lg">
            Izaberi komad. Dodaj svoju fotografiju. Pogledaj kako ti stoji — pre nego
            što naručiš.
          </p>

          <Link
            href={`${prefix}/shop/${demoSlug}`}
            className="kms-cta mt-7 flex min-h-12 w-full items-center justify-center gap-2 rounded-full px-7 py-3.5 text-base font-bold sm:max-w-sm"
          >
            Probaj odmah
            <ArrowRight className="h-4 w-4" />
          </Link>

          <div className="mt-10 grid grid-cols-2 gap-2.5 sm:mt-14 sm:gap-4">
            <figure className="kms-card overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src="/kms/landing-garment.jpg"
                  alt="Satenska haljina iz shopa"
                  fill
                  sizes="(max-width: 640px) 48vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--kms-ink-soft)] sm:px-3 sm:text-[11px]">
                Komad iz shopa
              </figcaption>
            </figure>

            <figure className="kms-card overflow-hidden">
              <div className="relative aspect-[3/4]">
                <Image
                  src="/kms/landing-result.jpg"
                  alt="Ista haljina na osobi"
                  fill
                  sizes="(max-width: 640px) 48vw, 320px"
                  className="object-cover"
                  priority
                />
              </div>
              <figcaption className="px-2.5 py-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--kms-ink-soft)] sm:px-3 sm:text-[11px]">
                Kako tebi stoji
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-10 sm:px-5">
          <h2 className="text-xl font-extrabold tracking-[-0.02em]">
            Kakva fotografija treba?
          </h2>
          <p className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--kms-ink-soft)]">
            Najbolji rezultat daje portret celog tela — stojiš sprijeda, vidi se
            od glave do stopala, uz dnevno svetlo.
          </p>
          <div className="mx-auto mt-5 max-w-[220px] sm:mx-0 sm:max-w-[240px]">
            <KmsPhotoGuide />
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-14 sm:px-5 sm:pb-16">
          <ol className="grid gap-2.5 sm:grid-cols-3 sm:gap-4">
            {STEPS.map((step, i) => (
              <li key={step.title} className="kms-card p-4 sm:p-5">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[var(--kms-cream)]">
                    <step.icon className="h-4 w-4" />
                  </span>
                  <span className="text-xs font-bold text-[var(--kms-ink-soft)]">
                    0{i + 1}
                  </span>
                </div>
                <h2 className="mt-3 text-base font-bold tracking-[-0.01em] sm:text-lg">
                  {step.title}
                </h2>
                <p className="mt-1 text-sm leading-relaxed text-[var(--kms-ink-soft)]">
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
