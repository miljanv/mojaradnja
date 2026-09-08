import { notFound } from "next/navigation";
import { getPublishedShop } from "@/lib/shop-public";
import { CartPageClient } from "./cart-page-client";

type PageProps = {
  params: Promise<{ shopSlug: string }>;
};

export default async function CartPage({ params }: PageProps) {
  const { shopSlug } = await params;
  const shop = await getPublishedShop(shopSlug);

  if (!shop) {
    notFound();
  }

  return <CartPageClient shopSlug={shop.slug} shopName={shop.name} />;
}
