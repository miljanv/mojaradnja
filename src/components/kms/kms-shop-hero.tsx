import Image from "next/image";
import { getInstagramUrl } from "@/lib/shop-public-client";

type Props = {
  name: string;
  logoUrl: string | null;
  instagramUsername: string | null;
};

function InstagramGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="h-3.5 w-3.5"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function KmsShopHero({ name, logoUrl, instagramUsername }: Props) {
  const instagramUrl = getInstagramUrl(instagramUsername);
  const igHandle = instagramUsername?.replace(/^@/, "");

  return (
    <section className="mx-auto max-w-5xl px-5 pb-6 pt-8">
      <div className="flex items-center gap-3.5">
        {logoUrl ? (
          <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full ring-1 ring-[var(--kms-line)]">
            <Image
              src={logoUrl}
              alt={name}
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </span>
        ) : (
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-white text-lg font-extrabold ring-1 ring-[var(--kms-line)]">
            {name.charAt(0).toUpperCase()}
          </span>
        )}

        <div className="min-w-0">
          <p className="truncate text-lg font-bold tracking-[-0.01em]">{name}</p>
          {instagramUrl && (
            <a
              href={instagramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-0.5 inline-flex items-center gap-1.5 text-sm text-[var(--kms-ink-soft)]"
            >
              <InstagramGlyph />@{igHandle}
            </a>
          )}
        </div>
      </div>

      <h1 className="mt-6 text-[1.85rem] font-extrabold leading-[1.1] tracking-[-0.03em] sm:text-4xl">
        Kako ti stoji kolekcija iz{" "}
        <span className="kms-gradient-text">{name}</span>?
      </h1>
      <p className="mt-2.5 text-sm text-[var(--kms-ink-soft)] sm:text-base">
        Izaberi komad i dodaj svoju fotografiju — bez naloga i registracije.
      </p>
    </section>
  );
}
