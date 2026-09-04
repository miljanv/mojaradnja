import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

/**
 * Seeds the KakoMiStoji demo shop reachable at kakomistoji.app/shop/demo.
 * Run with: npm run seed:kms-demo
 */

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

const DEMO_SLUG = "demo";
const DEMO_CREDITS = 50;

const PRODUCTS = [
  {
    name: "Satenska haljina",
    slug: "satenska-haljina",
    price: 6900,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/satenska-haljina.jpg",
  },
  {
    name: "Lanena košulja",
    slug: "lanena-kosulja",
    price: 3900,
    category: "Košulje",
    tryOnCategory: "tops",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/lanena-kosulja.jpg",
  },
  {
    name: "Oversize sako",
    slug: "oversize-sako",
    price: 8900,
    category: "Sakoi",
    tryOnCategory: "tops",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/oversize-sako.jpg",
  },
  {
    name: "Pletena majica",
    slug: "pletena-majica",
    price: 3200,
    category: "Majice",
    tryOnCategory: "tops",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/pletena-majica.jpg",
  },
];

async function main() {
  console.log("Seeding KakoMiStoji demo shop…");

  const owner = await prisma.user.upsert({
    where: { clerkId: "kms_demo_owner" },
    create: {
      clerkId: "kms_demo_owner",
      email: "demo@kakomistoji.app",
      name: "KakoMiStoji Demo",
    },
    update: {},
  });

  const shop = await prisma.shop.upsert({
    where: { slug: DEMO_SLUG },
    create: {
      ownerId: owner.id,
      name: "Atelier Demo",
      slug: DEMO_SLUG,
      description: "Demo kolekcija za prikaz KakoMiStoji iskustva.",
      instagramUsername: "kakomistoji",
      primaryColor: "#FF5F8F",
      isPublished: true,
      virtualTryOnEnabled: true,
      kmsPublicEnabled: true,
      aiCredits: DEMO_CREDITS,
      purchaseUrl: "https://instagram.com/kakomistoji",
    },
    update: {
      isPublished: true,
      virtualTryOnEnabled: true,
      kmsPublicEnabled: true,
      aiCredits: DEMO_CREDITS,
    },
  });

  for (const item of PRODUCTS) {
    const product = await prisma.product.upsert({
      where: { shopId_slug: { shopId: shop.id, slug: item.slug } },
      create: {
        shopId: shop.id,
        name: item.name,
        slug: item.slug,
        price: item.price,
        category: item.category,
        status: "ACTIVE",
        tryOnEnabled: true,
        tryOnCategory: item.tryOnCategory,
        tryOnPhotoType: item.tryOnPhotoType,
      },
      update: {
        status: "ACTIVE",
        tryOnEnabled: true,
        tryOnCategory: item.tryOnCategory,
        tryOnPhotoType: item.tryOnPhotoType,
      },
    });

    await prisma.productImage.deleteMany({
      where: { productId: product.id, url: { not: item.imageUrl } },
    });

    const image =
      (await prisma.productImage.findFirst({
        where: { productId: product.id, url: item.imageUrl },
      })) ??
      (await prisma.productImage.create({
        data: { productId: product.id, url: item.imageUrl, sortOrder: 0 },
      }));

    await prisma.product.update({
      where: { id: product.id },
      data: { tryOnGarmentImageKey: image.id },
    });
  }

  console.log(`Done. Demo shop ready at /shop/${DEMO_SLUG}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
