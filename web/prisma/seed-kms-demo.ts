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

const PRODUCTS: Array<{
  name: string;
  slug: string;
  price: number;
  category: string;
  tryOnCategory: "tops" | "bottoms" | "one-pieces";
  tryOnPhotoType: "model" | "flat-lay";
  imageUrl: string;
  isFeatured?: boolean;
}> = [
  {
    name: "Satenska midi",
    slug: "satenska-midi-osoba",
    price: 6900,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "model",
    imageUrl: "/kms/demo/model-crna-midi.jpg",
    isFeatured: true,
  },
  {
    name: "Cvetna midi",
    slug: "cvetna-midi-osoba",
    price: 5900,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "model",
    imageUrl: "/kms/demo/model-cvetna-haljina.jpg",
    isFeatured: true,
  },
  {
    name: "Bež lanena košulja",
    slug: "bez-lanena-kosulja-osoba",
    price: 3900,
    category: "Košulje",
    tryOnCategory: "tops",
    tryOnPhotoType: "model",
    imageUrl: "/kms/demo/model-lanena-kosulja.jpg",
    isFeatured: true,
  },
  {
    name: "Crni oversize sako",
    slug: "crni-oversize-sako-osoba",
    price: 8900,
    category: "Sakoi",
    tryOnCategory: "tops",
    tryOnPhotoType: "model",
    imageUrl: "/kms/demo/model-oversize-sako.jpg",
    isFeatured: true,
  },
  {
    name: "Lanena midi suknja",
    slug: "lanena-midi-suknja-osoba",
    price: 4200,
    category: "Suknje",
    tryOnCategory: "bottoms",
    tryOnPhotoType: "model",
    imageUrl: "/kms/demo/model-lanena-suknja.jpg",
    isFeatured: true,
  },
  {
    name: "Crna midi suknja",
    slug: "crna-midi-suknja",
    price: 4800,
    category: "Suknje",
    tryOnCategory: "bottoms",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/crna-midi-suknja.jpg",
    isFeatured: true,
  },
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
    name: "Crna koktel haljina",
    slug: "crna-koktel-haljina",
    price: 8900,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/crna-koktel-haljina.jpg",
  },
  {
    name: "Cvetna letnja haljina",
    slug: "cvetna-letnja-haljina",
    price: 5900,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/cvetna-letnja-haljina.jpg",
  },
  {
    name: "Lanena midi haljina",
    slug: "lanena-midi-haljina",
    price: 6400,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/lanena-midi-haljina.jpg",
  },
  {
    name: "Wrap haljina",
    slug: "wrap-haljina",
    price: 7200,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/wrap-haljina.jpg",
  },
  {
    name: "Košulja-haljina",
    slug: "kosulja-haljina",
    price: 4900,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/kosulja-haljina.jpg",
  },
  {
    name: "Crvena mini haljina",
    slug: "crvena-mini-haljina",
    price: 4500,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/crvena-mini-haljina.jpg",
  },
  {
    name: "Pletena midi haljina",
    slug: "pletena-midi-haljina",
    price: 7800,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/pletena-midi-haljina.jpg",
  },
  {
    name: "Prugasta haljina",
    slug: "prugasta-haljina",
    price: 5200,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/prugasta-haljina.jpg",
  },
  {
    name: "Satenska maxi haljina",
    slug: "satenska-maxi-haljina",
    price: 9800,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/satenska-maxi-haljina.jpg",
  },
  {
    name: "Farmer haljina",
    slug: "denim-haljina",
    price: 6700,
    category: "Haljine",
    tryOnCategory: "one-pieces",
    tryOnPhotoType: "flat-lay",
    imageUrl: "/kms/demo/denim-haljina.jpg",
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
        isFeatured: item.isFeatured ?? false,
      },
      update: {
        status: "ACTIVE",
        tryOnEnabled: true,
        tryOnCategory: item.tryOnCategory,
        tryOnPhotoType: item.tryOnPhotoType,
        isFeatured: item.isFeatured ?? false,
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
