"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { requireActiveSubscription, requireAuthUser, verifyShopOwnership } from "@/lib/auth";
import { slugify } from "@/lib/utils-app";
import { DEFAULT_TEMPLATES } from "@/lib/messages";
import type { MessageTemplateType } from "@/lib/prisma-client";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

async function createDefaultTemplates(shopId: string) {
  const types: MessageTemplateType[] = [
    "ORDER_CONFIRMATION",
    "ORDER_SHIPPED",
    "EXCHANGE_INSTRUCTIONS",
    "COMPLAINT_RECEIVED",
    "CUSTOM",
  ];

  await Promise.all(
    types.map((type) =>
      prisma.messageTemplate.create({
        data: {
          shopId,
          type,
          title: type.replace(/_/g, " "),
          content: DEFAULT_TEMPLATES[type],
        },
      })
    )
  );
}

export async function createShop(data: {
  name: string;
  slug: string;
  description?: string;
  instagramUsername?: string;
}): Promise<ActionResult<{ shopId: string }>> {
  try {
    const user = await requireActiveSubscription();
    const slug = slugify(data.slug || data.name);

    const existing = await prisma.shop.findUnique({ where: { slug } });
    if (existing) {
      return { success: false, error: "Slug already taken" };
    }

    const shop = await prisma.shop.create({
      data: {
        ownerId: user.id,
        name: data.name,
        slug,
        description: data.description,
        instagramUsername: data.instagramUsername,
        isPublished: true,
      },
    });

    await createDefaultTemplates(shop.id);
    revalidatePath("/dashboard");
    return { success: true, data: { shopId: shop.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create shop" };
  }
}

export async function updateShop(
  shopId: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    instagramUsername?: string;
    phone?: string;
    email?: string;
    returnAddress?: string | null;
    returnPolicy?: string | null;
    exchangePolicy?: string | null;
    logoUrl?: string | null;
    coverImageUrl?: string | null;
    primaryColor?: string;
    backgroundColor?: string;
    cardColor?: string;
    fontFamily?: string;
    heroTitle?: string | null;
    heroSubtitle?: string | null;
    isPublished?: boolean;
  }
): Promise<ActionResult> {
  try {
    const shop = await verifyShopOwnership(shopId);
    const nextSlug = data.slug?.trim() ? slugify(data.slug.trim()) : shop.slug;

    if (nextSlug !== shop.slug) {
      const existing = await prisma.shop.findFirst({
        where: { slug: nextSlug, NOT: { id: shopId } },
      });
      if (existing) return { success: false, error: "Slug already taken" };
    }

    await prisma.shop.update({
      where: { id: shopId },
      data: {
        name: data.name?.trim() || shop.name,
        slug: nextSlug,
        description: data.description,
        instagramUsername: data.instagramUsername,
        phone: data.phone,
        email: data.email,
        returnAddress:
          data.returnAddress === undefined ? undefined : data.returnAddress || null,
        returnPolicy:
          data.returnPolicy === undefined ? undefined : data.returnPolicy || null,
        exchangePolicy:
          data.exchangePolicy === undefined ? undefined : data.exchangePolicy || null,
        logoUrl: data.logoUrl === undefined ? undefined : data.logoUrl || null,
        coverImageUrl:
          data.coverImageUrl === undefined ? undefined : data.coverImageUrl || null,
        primaryColor: data.primaryColor,
        backgroundColor: data.backgroundColor,
        cardColor: data.cardColor,
        fontFamily: data.fontFamily,
        heroTitle: data.heroTitle === undefined ? undefined : data.heroTitle || null,
        heroSubtitle:
          data.heroSubtitle === undefined ? undefined : data.heroSubtitle || null,
        isPublished: data.isPublished,
      },
    });

    revalidatePath("/dashboard/shop");
    revalidatePath(`/${shop.slug}`);
    revalidatePath(`/${shop.slug}/return`);
    if (nextSlug !== shop.slug) {
      revalidatePath(`/${nextSlug}`);
      revalidatePath(`/${nextSlug}/return`);
    }
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update shop" };
  }
}

export async function setLocale(locale: string) {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  cookieStore.set("locale", locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  return { success: true };
}
