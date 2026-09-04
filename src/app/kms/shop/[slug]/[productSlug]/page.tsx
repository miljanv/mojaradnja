import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { KmsHeader } from "@/components/kms/kms-header";
import { KmsFooter } from "@/components/kms/kms-footer";
import { KmsTryOnFlow } from "@/components/kms/kms-try-on-flow";
import { KmsTrack } from "@/components/kms/kms-track";
import { getKmsProduct, getKmsShop } from "@/lib/kms/shop";
import { getKmsPrefix } from "@/lib/kms/links";
import { getKmsBaseUrl, kmsProductUrl } from "@/lib/kms/config";
import { resolvePurchaseUrl } from "@/lib/kms/urls";
import { formatCurrency } from "@/lib/utils-app";

type PageProps = {
  params: Promise<{ slug: string; productSlug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug, productSlug } = await params;
  const shop = await getKmsShop(slug);
  if (!shop) return { title: "Nije dostupno" };

  const product = await getKmsProduct(shop.id, productSlug);
  if (!product) return { title: "Nije dostupno" };

  const title = `${product.name} — kako mi stoji? | ${shop.name}`;
  const description = `Probaj ${product.name} iz ${shop.name} na sebi uz AI.`;

  return {
    title,
    description,
    alternates: { canonical: kmsProductUrl(shop.slug, product.slug) },
    openGraph: {
      title,
      description,
      url: kmsProductUrl(shop.slug, product.slug),
      images: [{ url: product.garmentImageUrl }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [product.garmentImageUrl],
    },
  };
}

export default async function KmsProductPage({ params }: PageProps) {
  const { slug, productSlug } = await params;
  const shop = await getKmsShop(slug);
  if (!shop) notFound();

  const [product, prefix] = await Promise.all([
    getKmsProduct(shop.id, productSlug),
    getKmsPrefix(),
  ]);
  if (!product) notFound();

  const outOfCredits = shop.aiCredits <= 0;
  const purchaseUrl = resolvePurchaseUrl({
    productPurchaseUrl: product.purchaseUrl,
    shopPurchaseUrl: shop.purchaseUrl,
    instagramUsername: shop.instagramUsername,
  });

  return (
    <div className="flex min-h-dvh flex-col">
      <KmsTrack event="product_view" shopSlug={shop.slug} productId={product.id} />
      <KmsHeader />

      <main className="mx-auto w-full max-w-3xl flex-1 px-5 pb-16 pt-6">
        <Link
          href={`${prefix}/shop/${shop.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-[var(--kms-ink-soft)]"
        >
          <ArrowLeft className="h-4 w-4" />
          {shop.name}
        </Link>

        <div className="mt-4 grid gap-6 sm:grid-cols-2">
          <div className="kms-card relative aspect-[3/4] overflow-hidden">
            <Image
              src={product.garmentImageUrl}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 90vw, 360px"
              className="object-cover"
              priority
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl font-extrabold leading-tight tracking-[-0.02em]">
              {product.name}
            </h1>
            <p className="mt-1.5 text-lg font-semibold text-[var(--kms-ink-soft)]">
              {formatCurrency(product.price)}
            </p>

            {product.description && (
              <p className="mt-4 text-sm leading-relaxed text-[var(--kms-ink-soft)]">
                {product.description}
              </p>
            )}

            <div className="mt-6">
              {outOfCredits ? (
                <p className="rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  Proba je trenutno pauzirana za ovaj shop. Pokušaj ponovo kasnije.
                </p>
              ) : (
                <KmsTryOnFlow
                  shopSlug={shop.slug}
                  shopName={shop.name}
                  instagramUsername={shop.instagramUsername}
                  productId={product.id}
                  productName={product.name}
                  garmentImageUrl={product.garmentImageUrl}
                  purchaseUrl={purchaseUrl}
                  shareBaseUrl={getKmsBaseUrl()}
                  shopHref={`${prefix}/shop/${shop.slug}`}
                />
              )}
            </div>

            <p className="mt-3 text-xs leading-relaxed text-[var(--kms-ink-soft)]">
              AI prikaz je vizuelna simulacija i ne garantuje veličinu, kroj ni fizičko
              pristajanje odeće.
            </p>
          </div>
        </div>
      </main>

      <KmsFooter />
    </div>
  );
}
