import type { Metadata } from "next";
import { KmsHeader } from "@/components/kms/kms-header";
import { KmsFooter } from "@/components/kms/kms-footer";

export const metadata: Metadata = {
  title: "Privatnost fotografija",
  description:
    "Kako KakoMiStoji obrađuje i briše fotografije koje korisnici dodaju za AI probu odeće.",
};

const SECTIONS = [
  {
    title: "Šta se dešava sa tvojom fotografijom",
    body: "Fotografiju koju dodaš koristimo isključivo da bismo generisali prikaz izabranog komada na tebi. Ne koristimo je za treniranje modela, ne prodajemo je i ne prikazujemo je drugim korisnicima.",
  },
  {
    title: "Koliko dugo je čuvamo",
    body: "Originalna fotografija se automatski briše nedugo nakon obrade. Generisani rezultat se briše po isteku roka čuvanja, nakon čega i podeljeni link prestaje da radi.",
  },
  {
    title: "Deljenje rezultata",
    body: "Rezultat je privatan dok ga ti ne podeliš. Link za deljenje sadrži nasumičan, negađljiv kod i nije indeksiran u pretraživačima. Ako ga podeliš, svako ko ima link može ga videti dok ne istekne.",
  },
  {
    title: "Tvoja saglasnost",
    body: "Pre generisanja potvrđuješ da imaš pravo da koristiš fotografiju koju dodaješ i da si saglasan/na sa privremenom obradom. Ne dodavaj fotografije drugih osoba bez njihove dozvole.",
  },
  {
    title: "Šta AI prikaz jeste, a šta nije",
    body: "Rezultat je vizuelna simulacija. Ne predstavlja garanciju veličine, kroja ni fizičkog pristajanja odeće. Za tačne mere obrati se prodavcu.",
  },
];

export default function KmsPrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col">
      <KmsHeader />

      <main className="mx-auto w-full max-w-2xl flex-1 px-5 pb-16 pt-8">
        <h1 className="text-3xl font-extrabold tracking-[-0.03em]">
          Privatnost fotografija
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-[var(--kms-ink-soft)]">
          KakoMiStoji radi bez naloga i registracije. Evo tačno šta se dešava sa
          fotografijom koju dodaš.
        </p>

        <div className="mt-8 space-y-5">
          {SECTIONS.map((section) => (
            <section key={section.title} className="kms-card p-5">
              <h2 className="text-base font-bold">{section.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-[var(--kms-ink-soft)]">
                {section.body}
              </p>
            </section>
          ))}
        </div>
      </main>

      <KmsFooter />
    </div>
  );
}
