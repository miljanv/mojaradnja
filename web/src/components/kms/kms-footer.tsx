import Link from "next/link";
import { KmsWordmark } from "./kms-wordmark";
import { getKmsPrefix } from "@/lib/kms/links";

export async function KmsFooter() {
  const prefix = await getKmsPrefix();

  return (
    <footer className="border-t border-[var(--kms-line)] px-4 py-8 sm:px-5 sm:py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-3">
        <Link href={prefix || "/"}>
          <KmsWordmark />
        </Link>
        <p className="max-w-md text-xs leading-relaxed text-[var(--kms-ink-soft)]">
          AI prikaz je vizuelna simulacija i ne garantuje veličinu ni kroj. Tvoja
          fotografija se obrađuje privremeno i automatski briše.
        </p>
        <Link
          href={`${prefix}/privatnost`}
          className="text-xs font-semibold underline-offset-4 hover:underline"
        >
          Privatnost fotografija
        </Link>
      </div>
    </footer>
  );
}
