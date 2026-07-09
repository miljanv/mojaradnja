import Image from "next/image";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { prisma } from "@/lib/db";
import { getPublishedShop } from "@/lib/shop-public";
import { ShopProductGrid, type ShopProduct } from "./shop-product-grid";

type PageProps = {
  params: Promise<{ shopSlug: string }>;
};

function mapProduct(
  product: {
    id: string;
    name: string;
    slug: string;
    price: { toString(): string };
    compareAtPrice: { toString(): string } | null;
    category: string | null;
    status: string;
    isFeatured: boolean;
    images: Array<{ url: string }>;
    variants: Array<{
      id: string;
      size: string | null;
      color: string | null;
      optionLabel: string | null;
      optionValue: string | null;
      attributes: unknown;
      stock: number;
      isAvailable: boolean;
    }>;
  },
  index: number
): ShopProduct {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: Number(product.price),
    compareAtPrice: product.compareAtPrice ? Number(product.compareAtPrice) : null,
    category: product.category,
    status: product.status as ShopProduct["status"],
    isFeatured: product.isFeatured,
    imageUrl: product.images[0]?.url ?? null,
    cardIndex: index,
    variants: product.variants.map((v) => ({
      id: v.id,
      size: v.size,
      color: v.color,
      optionLabel: v.optionLabel,
      optionValue: v.optionValue,
      attributes: v.attributes,
      stock: v.stock,
      isAvailable: v.isAvailable,
    })),
  };
}

export default async function ShopHomePage({ params }: PageProps) {
  const { shopSlug } = await params;
  const shop = await getPublishedShop(shopSlug);

  if (!shop) {
    notFound();
  }

  const t = await getTranslations("publicShop");

  const products = await prisma.product.findMany({
    where: { shopId: shop.id, status: { in: ["ACTIVE", "SOLD_OUT"] } },
    include: {
      images: { orderBy: { sortOrder: "asc" }, take: 1 },
      variants: { orderBy: { createdAt: "asc" } },
    },
    orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
  });

  const mappedProducts = products.map(mapProduct);
  const featuredProducts = mappedProducts.filter(
    (p) => p.isFeatured && p.status !== "SOLD_OUT"
  );
  const heroTitle = shop.heroTitle?.trim() || shop.name;
  const heroSubtitle =
    shop.heroSubtitle?.trim() || shop.description?.trim() || t("heroDefaultSubtitle");

  return (
    <div>
      <section className="relative">
        <div className="relative min-h-[52vh] w-full overflow-hidden bg-slate-900 sm:min-h-[58vh]">
          {shop.coverImageUrl ? (
            <Image
              src={shop.coverImageUrl}
              alt={shop.name}
              fill
              className="object-contain"
              priority
              unoptimized
            />
          ) : (
            <div
              className="absolute inset-0"
              style={{
                background: `linear-gradient(160deg, var(--shop-primary) 0%, color-mix(in srgb, var(--shop-primary) 35%, #0f172a) 100%)`,
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/40 to-black/25" />

          <div className="relative mx-auto flex min-h-[52vh] max-w-5xl flex-col justify-end px-5 pb-12 pt-24 sm:min-h-[58vh] sm:px-8 sm:pb-16">
            <h1 className="max-w-2xl text-4xl font-medium tracking-tight text-white sm:text-5xl md:text-6xl">
              {heroTitle}
            </h1>
            {heroSubtitle && (
              <p className="mt-4 max-w-xl text-base leading-relaxed text-white/85 sm:text-lg">
                {heroSubtitle}
              </p>
            )}
            <div className="mt-8">
              <a
                href="#products"
                className="inline-flex items-center rounded-full bg-white px-7 py-3 text-sm font-medium text-slate-900 transition-opacity hover:opacity-90"
              >
                {t("shopNow")}
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-5xl px-5 py-14 sm:px-8 sm:py-20">
        <ShopProductGrid
          shopSlug={shop.slug}
          cardColor={shop.cardColor}
          products={mappedProducts}
          featuredProducts={featuredProducts}
        />
      </section>
    </div>
  );
}
