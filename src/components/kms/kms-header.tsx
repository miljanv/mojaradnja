import Link from "next/link";
import { KmsWordmark } from "./kms-wordmark";
import { getKmsPrefix } from "@/lib/kms/links";

export async function KmsHeader() {
  const prefix = await getKmsPrefix();

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--kms-line)] bg-[var(--kms-cream)]/90 backdrop-blur-md">
      <div className="mx-auto flex max-w-5xl items-center px-4 py-3 sm:px-5">
        <Link href={prefix || "/"} aria-label="KakoMiStoji">
          <KmsWordmark />
        </Link>
      </div>
    </header>
  );
}
