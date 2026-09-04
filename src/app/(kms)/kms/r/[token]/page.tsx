import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import { KmsHeader } from "@/components/kms/kms-header";
import { KmsFooter } from "@/components/kms/kms-footer";
import { KmsResultActions } from "@/components/kms/kms-result-actions";
import { getSharedResult } from "@/lib/kms/result";
import { getKmsPrefix } from "@/lib/kms/links";
import { getKmsBaseUrl } from "@/lib/kms/config";
import { formatCurrency } from "@/lib/utils-app";

type PageProps = { params: Promise<{ token: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const result = await getSharedResult(token);
  if (!result) return { title: "Rezultat nije dostupan", robots: { index: false } };

  const title = `Kako mi stoji? | ${result.shop.name}`;
  const description = `${result.product.name} iz ${result.shop.name} — probano uz AI na KakoMiStoji.`;

  return {
    title,
    description,
    // Shared results are personal; keep them out of search indexes.
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      images: [{ url: result.resultImageUrl }],
    },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function KmsSharedResultPage({ params }: PageProps) {
  const { token } = await params;
  const [result, prefix] = await Promise.all([
    getSharedResult(token),
    getKmsPrefix(),
  ]);
  if (!result) notFound();

  const { shop, product } = result;
  const igHandle = shop.instagramUsername?.replace(/^@/, "");

  return (
    <div className="flex min-h-dvh flex-col">
      <KmsHeader />

      <main className="mx-auto w-full max-w-md flex-1 px-5 pb-14 pt-6">
        <h1 className="text-center text-2xl font-extrabold tracking-[-0.02em]">
          Kako ti stoji? ✨
        </h1>

        <div className="kms-card relative mt-4 aspect-[3/4] overflow-hidden">
          <Image
            src={result.resultImageUrl}
            alt={`AI prikaz — ${product.name}`}
            fill
            sizes="(max-width: 640px) 90vw, 420px"
            className="object-cover"
            priority
          />
          <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
            KakoMiStoji.app{igHandle ? ` × @${igHandle}` : ""}
          </span>
        </div>

        <p className="mt-3 text-center text-sm text-[var(--kms-ink-soft)]">
          {product.name} · {formatCurrency(product.price)} ·{" "}
          <Link href={`${prefix}/shop/${shop.slug}`} className="font-semibold underline underline-offset-4">
            {shop.name}
          </Link>
        </p>

        <KmsResultActions
          shopSlug={shop.slug}
          productId={product.id}
          purchaseUrl={result.purchaseUrl}
          shareUrl={`${getKmsBaseUrl()}/r/${token}`}
        />

        <Link
          href={`${prefix}/shop/${shop.slug}/${product.slug}`}
          className="mt-6 flex items-center justify-center gap-2 rounded-full border border-[var(--kms-line)] bg-white px-6 py-3 text-sm font-bold"
        >
          <Sparkles className="h-4 w-4" />
          Probaj i ti na sebi
        </Link>

        <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--kms-ink-soft)]">
          AI prikaz je vizuelna simulacija i ne garantuje veličinu ni kroj.
        </p>
      </main>

      <KmsFooter />
    </div>
  );
}
