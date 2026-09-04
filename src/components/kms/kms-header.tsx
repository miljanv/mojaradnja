import Link from "next/link";
import { KmsWordmark } from "./kms-wordmark";
import { getMojShopBaseUrl } from "@/lib/kms/config";
import { getKmsPrefix } from "@/lib/kms/links";

export async function KmsHeader() {
  const prefix = await getKmsPrefix();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--kms-line)] bg-[var(--kms-cream)]/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-5 py-3.5">
        <Link href={prefix || "/"} aria-label="KakoMiStoji">
          <KmsWordmark />
        </Link>
        <a
          href={`${getMojShopBaseUrl()}/sign-up`}
          className="rounded-full border border-[var(--kms-line)] px-3.5 py-1.5 text-xs font-semibold text-[var(--kms-ink)]"
        >
          Imaš shop?
        </a>
      </div>
    </header>
  );
}
