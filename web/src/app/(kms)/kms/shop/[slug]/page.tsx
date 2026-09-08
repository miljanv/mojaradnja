import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { KmsHeader } from "@/components/kms/kms-header";
import { KmsFooter } from "@/components/kms/kms-footer";
import { KmsShopHero } from "@/components/kms/kms-shop-hero";
import { KmsProductCard } from "@/components/kms/kms-product-card";
import { KmsTrack } from "@/components/kms/kms-track";
import { getKmsProducts, getKmsShop } from "@/lib/kms/shop";
import { getKmsPrefix } from "@/lib/kms/links";
import { kmsShopUrl } from "@/lib/kms/config";

type PageProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const shop = await getKmsShop(slug);
  if (!shop) return { title: "Shop nije dostupan" };

  const title = `Kako mi stoji? | ${shop.name}`;
  const description = `Probaj proizvode iz ${shop.name} kolekcije na sebi uz AI.`;
  const products = await getKmsProducts(shop.id);
  const preview = products.find((p) => p.imageUrl)?.imageUrl;

  return {
    title,
    description,
    alternates: { canonical: kmsShopUrl(shop.slug) },
    openGraph: {
      title,
      description,
      url: kmsShopUrl(shop.slug),
      images: preview ? [{ url: preview }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: preview ? [preview] : undefined,
    },
  };
}

export default async function KmsShopPage({ params }: PageProps) {
  const { slug } = await params;
  const shop = await getKmsShop(slug);
  if (!shop) notFound();

  const [products, prefix] = await Promise.all([
    getKmsProducts(shop.id),
    getKmsPrefix(),
  ]);

  return (
    <div className="flex min-h-dvh flex-col">
      <KmsTrack event="shop_view" shopSlug={shop.slug} />
      <KmsHeader />

      <main className="flex-1">
        <KmsShopHero
          name={shop.name}
          logoUrl={shop.logoUrl}
          instagramUsername={shop.instagramUsername}
        />

        <section className="mx-auto max-w-5xl px-4 pb-12 sm:px-5 sm:pb-14">
          {products.length === 0 ? (
            <p className="kms-card p-6 text-sm text-[var(--kms-ink-soft)]">
              Ovaj shop trenutno nema komada dostupnih za probu. Svrati ponovo uskoro.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 lg:grid-cols-4">
              {products.map((product, i) => (
                <KmsProductCard
                  key={product.id}
                  href={`${prefix}/shop/${shop.slug}/${product.slug}`}
                  name={product.name}
                  price={product.price}
                  imageUrl={product.imageUrl}
                  priority={i < 2}
                />
              ))}
            </div>
          )}

          {shop.aiCredits <= 0 && products.length > 0 && (
            <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-xs text-amber-900">
              Proba je trenutno pauzirana za ovaj shop. Pokušaj ponovo kasnije.
            </p>
          )}
        </section>
      </main>

      <KmsFooter />
    </div>
  );
}
