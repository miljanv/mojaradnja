import Link from "next/link";
import { KmsWordmark } from "./kms-wordmark";
import { getMojShopBaseUrl } from "@/lib/kms/config";
import { getKmsPrefix } from "@/lib/kms/links";

export async function KmsFooter() {
  const prefix = await getKmsPrefix();

  return (
    <footer className="border-t border-[var(--kms-line)] px-5 py-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <Link href={prefix || "/"}>
          <KmsWordmark />
        </Link>
        <p className="max-w-md text-xs leading-relaxed text-[var(--kms-ink-soft)]">
          AI prikaz je vizuelna simulacija i ne garantuje veličinu ni kroj. Tvoja
          fotografija se obrađuje privremeno i automatski briše.
        </p>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <Link
            href={`${prefix}/privatnost`}
            className="underline-offset-4 hover:underline"
          >
            Privatnost
          </Link>
          <a
            href={`${getMojShopBaseUrl()}/sign-up`}
            className="underline-offset-4 hover:underline"
          >
            Za shopove
          </a>
        </div>
      </div>
    </footer>
  );
}
