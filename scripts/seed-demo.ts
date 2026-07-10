/**
 * Seeds a full public demo shop + Clerk login.
 *
 * Shop: Atelier Luna (/atelier-luna) — fictional boutique (replaces Svetofor)
 * Login: demo@mojshop.app / DemoMojShop2026!
 *
 * Usage: npx tsx scripts/seed-demo.ts
 */
import "dotenv/config";
import { createClerkClient } from "@clerk/backend";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { addDays } from "date-fns";
import { DEFAULT_TEMPLATES } from "../src/lib/messages";

const DEMO_EMAIL = process.env.DEMO_EMAIL ?? "demo@mojshop.app";
const DEMO_PASSWORD = process.env.DEMO_PASSWORD ?? "DemoMojShop2026!";
const DEMO_NAME = "Ana Demo";
const SHOP_NAME = "Atelier Luna";
const SHOP_SLUG = "atelier-luna";
/** Previous slug we migrate from (Svetofor test shop) */
const LEGACY_SLUGS = ["svetofor-zr", "atelier-luna"];

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });

async function ensureClerkDemoUser() {
  if (!process.env.CLERK_SECRET_KEY) {
    throw new Error("CLERK_SECRET_KEY is missing");
  }

  const list = await clerk.users.getUserList({
    emailAddress: [DEMO_EMAIL],
    limit: 1,
  });

  if (list.data[0]) {
    const user = list.data[0];
    await clerk.users.updateUser(user.id, {
      password: DEMO_PASSWORD,
      skipPasswordChecks: true,
      firstName: "Ana",
      lastName: "Demo",
    });
    console.log(`✓ Clerk user updated: ${DEMO_EMAIL} (${user.id})`);
    return user.id;
  }

  const created = await clerk.users.createUser({
    emailAddress: [DEMO_EMAIL],
    password: DEMO_PASSWORD,
    username: "atelier-luna-demo",
    firstName: "Ana",
    lastName: "Demo",
    skipPasswordChecks: true,
    skipPasswordRequirement: true,
  });
  console.log(`✓ Clerk user created: ${DEMO_EMAIL} (${created.id})`);
  return created.id;
}

async function clearShopData(shopId: string) {
  await prisma.complaintRequest.deleteMany({ where: { shopId } });
  await prisma.exchangeRequest.deleteMany({ where: { shopId } });
  await prisma.orderItem.deleteMany({
    where: { order: { shopId } },
  });
  await prisma.order.deleteMany({ where: { shopId } });
  await prisma.customer.deleteMany({ where: { shopId } });
  await prisma.productVariant.deleteMany({
    where: { product: { shopId } },
  });
  await prisma.productImage.deleteMany({
    where: { product: { shopId } },
  });
  await prisma.product.deleteMany({ where: { shopId } });
  await prisma.messageTemplate.deleteMany({ where: { shopId } });
  await prisma.shopCategory.deleteMany({ where: { shopId } });
}

async function main() {
  console.log("\n🌙 Seeding Atelier Luna demo…\n");

  const clerkId = await ensureClerkDemoUser();

  const demoUser = await prisma.user.upsert({
    where: { email: DEMO_EMAIL },
    create: {
      clerkId,
      email: DEMO_EMAIL,
      name: DEMO_NAME,
      subscriptionStatus: "ACTIVE",
      trialEndsAt: null,
      subscriptionEndsAt: addDays(new Date(), 3650),
    },
    update: {
      clerkId,
      name: DEMO_NAME,
      subscriptionStatus: "ACTIVE",
      trialEndsAt: null,
      subscriptionEndsAt: addDays(new Date(), 3650),
    },
  });
  console.log(`✓ DB user: ${demoUser.email} (${demoUser.id})`);

  // Prefer migrating Svetofor / existing demo slug; otherwise create fresh
  let shop = await prisma.shop.findFirst({
    where: { slug: { in: LEGACY_SLUGS } },
  });

  if (shop) {
    await clearShopData(shop.id);
    shop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        ownerId: demoUser.id,
        name: SHOP_NAME,
        slug: SHOP_SLUG,
        description:
          "Ručno birana ženska moda — haljine, kompleti i aksesoari za svaki dan.",
        instagramUsername: "atelier.luna",
        phone: "+381601112233",
        email: "hello@atelierluna.rs",
        logoUrl: null,
        coverImageUrl:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop",
        primaryColor: "#E85A6B",
        backgroundColor: "#FDF8F5",
        cardColor: "#F5F0EB",
        fontFamily: "dm-sans",
        heroTitle: "Atelier Luna",
        heroSubtitle: "Jedan link. Manje DM haosa. Više porudžbina.",
        returnPolicy:
          "Reklamacije i povraćaji su mogući u roku od 14 dana od prijema. Proizvod mora biti neoštećen, sa etiketama.",
        exchangePolicy:
          "Zamena veličine ili boje je moguća uz dostupnost na lageru. Poštarinu snosi kupac, osim u slučaju naše greške.",
        returnAddress: "Atelier Luna, Cara Dušana 18, 11000 Beograd",
        isPublished: true,
        orderCounter: 1000,
      },
    });
    console.log(`✓ Migrated shop → ${shop.name} (/${shop.slug})`);
  } else {
    shop = await prisma.shop.create({
      data: {
        ownerId: demoUser.id,
        name: SHOP_NAME,
        slug: SHOP_SLUG,
        description:
          "Ručno birana ženska moda — haljine, kompleti i aksesoari za svaki dan.",
        instagramUsername: "atelier.luna",
        phone: "+381601112233",
        email: "hello@atelierluna.rs",
        coverImageUrl:
          "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&h=900&fit=crop",
        primaryColor: "#E85A6B",
        backgroundColor: "#FDF8F5",
        cardColor: "#F5F0EB",
        fontFamily: "dm-sans",
        heroTitle: "Atelier Luna",
        heroSubtitle: "Jedan link. Manje DM haosa. Više porudžbina.",
        returnPolicy:
          "Reklamacije i povraćaji su mogući u roku od 14 dana od prijema. Proizvod mora biti neoštećen, sa etiketama.",
        exchangePolicy:
          "Zamena veličine ili boje je moguća uz dostupnost na lageru. Poštarinu snosi kupac, osim u slučaju naše greške.",
        returnAddress: "Atelier Luna, Cara Dušana 18, 11000 Beograd",
        isPublished: true,
        orderCounter: 1000,
      },
    });
    console.log(`✓ Created shop ${shop.name} (/${shop.slug})`);
  }

  const categories = ["Haljine", "Kompleti", "Jakne", "Košulje", "Aksesoari"];
  for (let i = 0; i < categories.length; i++) {
    await prisma.shopCategory.create({
      data: { shopId: shop.id, name: categories[i], sortOrder: i },
    });
  }

  const templateTypes = [
    "ORDER_CONFIRMATION",
    "ORDER_SHIPPED",
    "EXCHANGE_INSTRUCTIONS",
    "COMPLAINT_RECEIVED",
    "CUSTOM",
  ] as const;

  for (const type of templateTypes) {
    await prisma.messageTemplate.create({
      data: {
        shopId: shop.id,
        type,
        title: type.replace(/_/g, " "),
        content: DEFAULT_TEMPLATES[type],
      },
    });
  }

  const productsData = [
    {
      name: "Svilenkasta crna haljina",
      slug: "svilenkasta-crna-haljina",
      description: "Elegantna midi haljina sa diskretnim sjajem — idealna za večeru i proslave.",
      price: 5900,
      compareAtPrice: 7200,
      category: "Haljine",
      status: "ACTIVE" as const,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop",
      variants: [
        { optionLabel: "Veličina", optionValue: "S", stock: 4 },
        { optionLabel: "Veličina", optionValue: "M", stock: 6 },
        { optionLabel: "Veličina", optionValue: "L", stock: 2 },
      ],
    },
    {
      name: "Bež laneni komplet",
      slug: "bez-laneni-komplet",
      description: "Lagani laneni komplet u toploj bež nijansi — top i pantalone.",
      price: 6800,
      category: "Kompleti",
      status: "ACTIVE" as const,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=800&h=1000&fit=crop",
      variants: [
        { optionLabel: "Veličina", optionValue: "S", stock: 3 },
        { optionLabel: "Veličina", optionValue: "M", stock: 5 },
        { optionLabel: "Veličina", optionValue: "L", stock: 3 },
      ],
    },
    {
      name: "Oversize denim jakna",
      slug: "oversize-denim-jakna",
      description: "Klasična oversize farmerka sa blago pranjem — must-have sloj.",
      price: 7500,
      category: "Jakne",
      status: "ACTIVE" as const,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=800&h=1000&fit=crop",
      variants: [
        { optionLabel: "Veličina", optionValue: "M", stock: 4 },
        { optionLabel: "Veličina", optionValue: "L", stock: 3 },
        { optionLabel: "Veličina", optionValue: "XL", stock: 2 },
      ],
    },
    {
      name: "Bela pamučna košulja",
      slug: "bela-pamucna-kosulja",
      description: "Čista bela košulja od mekog pamuka — nosi se uz sve.",
      price: 3200,
      category: "Košulje",
      status: "ACTIVE" as const,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=800&h=1000&fit=crop",
      variants: [
        { optionLabel: "Veličina", optionValue: "S", stock: 8 },
        { optionLabel: "Veličina", optionValue: "M", stock: 7 },
        { optionLabel: "Veličina", optionValue: "L", stock: 4 },
      ],
    },
    {
      name: "Letnja cvetna haljina",
      slug: "letnja-cvetna-haljina",
      description: "Lagana cvetna haljina sa tankim bretelama — savršena za tople dane.",
      price: 4500,
      compareAtPrice: 5200,
      category: "Haljine",
      status: "ACTIVE" as const,
      isFeatured: true,
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=800&h=1000&fit=crop",
      variants: [
        { optionLabel: "Veličina", optionValue: "S", stock: 2 },
        { optionLabel: "Veličina", optionValue: "M", stock: 1 },
      ],
    },
    {
      name: "Zlatna ogrlica Luna",
      slug: "zlatna-ogrlica-luna",
      description: "Diskretna pozlaćena ogrlica sa mesečevim privjeskom.",
      price: 2100,
      category: "Aksesoari",
      status: "ACTIVE" as const,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=800&h=1000&fit=crop",
      variants: [{ optionLabel: "Model", optionValue: "Standard", stock: 15 }],
    },
    {
      name: "Bordo satenska suknja",
      slug: "bordo-satenska-suknja",
      description: "Midi suknja od satena u bogatoj bordo nijansi.",
      price: 4100,
      category: "Haljine",
      status: "SOLD_OUT" as const,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=800&h=1000&fit=crop",
      variants: [
        { optionLabel: "Veličina", optionValue: "S", stock: 0, isAvailable: false },
        { optionLabel: "Veličina", optionValue: "M", stock: 0, isAvailable: false },
      ],
    },
    {
      name: "Krem džemper (draft)",
      slug: "krem-dzemper-draft",
      description: "U pripremi — mekani krem džemper za jesen.",
      price: 4800,
      category: "Jakne",
      status: "DRAFT" as const,
      isFeatured: false,
      image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=800&h=1000&fit=crop",
      variants: [{ optionLabel: "Veličina", optionValue: "M", stock: 0 }],
    },
  ];

  const products = [];
  for (const p of productsData) {
    const product = await prisma.product.create({
      data: {
        shopId: shop.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        compareAtPrice: p.compareAtPrice ?? null,
        category: p.category,
        status: p.status,
        isFeatured: p.isFeatured,
        images: {
          create: [
            { url: p.image, sortOrder: 0 },
            ...(p.slug === "svilenkasta-crna-haljina"
              ? [
                  {
                    url: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?w=800&h=1000&fit=crop",
                    sortOrder: 1,
                  },
                ]
              : []),
          ],
        },
        variants: {
          create: p.variants.map((v) => ({
            optionLabel: v.optionLabel,
            optionValue: v.optionValue,
            attributes: [{ label: v.optionLabel, value: v.optionValue }],
            stock: v.stock,
            isAvailable: "isAvailable" in v ? Boolean(v.isAvailable) : v.stock > 0,
          })),
        },
      },
      include: { variants: true },
    });
    products.push(product);
  }
  console.log(`✓ ${products.length} products`);

  const customersData = [
    {
      fullName: "Ana Jovanović",
      phone: "+381641112233",
      email: "ana.j@email.com",
      city: "Beograd",
      address: "Bulevar kralja Aleksandra 45",
      instagramUsername: "ana.jovanovic",
      note: "Često naručuje preko IG",
    },
    {
      fullName: "Marija Nikolić",
      phone: "+381642223344",
      email: "marija.n@email.com",
      city: "Novi Sad",
      address: "Zmaj Jovina 12",
      instagramUsername: "marija_n",
    },
    {
      fullName: "Jelena Stojanović",
      phone: "+381643334455",
      city: "Niš",
      address: "Obrenovićeva 8",
    },
    {
      fullName: "Teodora Marković",
      phone: "+381644445566",
      email: "teo.markovic@email.com",
      city: "Beograd",
      address: "Kneza Miloša 23",
      instagramUsername: "teo.m",
    },
    {
      fullName: "Ivana Petrović",
      phone: "+381645556677",
      city: "Kragujevac",
      address: "Kralja Petra I 5",
    },
    {
      fullName: "Sara Đorđević",
      phone: "+381646667788",
      email: "sara.d@email.com",
      city: "Subotica",
      address: "Korzo 3",
      note: "Traži zamenu veličine",
    },
  ];

  const customers = [];
  for (const c of customersData) {
    customers.push(
      await prisma.customer.create({
        data: { shopId: shop.id, ...c },
      })
    );
  }
  console.log(`✓ ${customers.length} customers`);

  type OrderSeed = {
    customer: (typeof customers)[0];
    product: (typeof products)[0];
    variantIndex: number;
    status:
      | "NEW"
      | "CONFIRMED"
      | "WAITING_PAYMENT"
      | "PACKED"
      | "SHIPPED"
      | "DELIVERED"
      | "CANCELLED"
      | "RETURNED"
      | "EXCHANGE_IN_PROGRESS";
    source: "INSTAGRAM_DM" | "VIBER" | "WHATSAPP" | "PHONE" | "MINI_SHOP" | "MANUAL";
    note?: string;
    daysAgo: number;
  };

  const ordersSeed: OrderSeed[] = [
    {
      customer: customers[0],
      product: products[0],
      variantIndex: 1,
      status: "NEW",
      source: "INSTAGRAM_DM",
      daysAgo: 0,
    },
    {
      customer: customers[1],
      product: products[1],
      variantIndex: 0,
      status: "CONFIRMED",
      source: "VIBER",
      daysAgo: 1,
    },
    {
      customer: customers[2],
      product: products[2],
      variantIndex: 0,
      status: "PACKED",
      source: "WHATSAPP",
      daysAgo: 2,
    },
    {
      customer: customers[3],
      product: products[4],
      variantIndex: 0,
      status: "SHIPPED",
      source: "MINI_SHOP",
      daysAgo: 3,
    },
    {
      customer: customers[4],
      product: products[3],
      variantIndex: 1,
      status: "DELIVERED",
      source: "PHONE",
      daysAgo: 8,
    },
    {
      customer: customers[5],
      product: products[0],
      variantIndex: 0,
      status: "EXCHANGE_IN_PROGRESS",
      source: "INSTAGRAM_DM",
      note: "Želi veću veličinu",
      daysAgo: 5,
    },
    {
      customer: customers[0],
      product: products[5],
      variantIndex: 0,
      status: "WAITING_PAYMENT",
      source: "MANUAL",
      daysAgo: 1,
    },
    {
      customer: customers[1],
      product: products[1],
      variantIndex: 2,
      status: "CANCELLED",
      source: "MINI_SHOP",
      note: "Kupac odustao",
      daysAgo: 10,
    },
    {
      customer: customers[2],
      product: products[3],
      variantIndex: 0,
      status: "RETURNED",
      source: "VIBER",
      daysAgo: 14,
    },
    {
      customer: customers[3],
      product: products[2],
      variantIndex: 1,
      status: "DELIVERED",
      source: "MINI_SHOP",
      daysAgo: 20,
    },
  ];

  const orders = [];
  let counter = 1001;
  for (const o of ordersSeed) {
    const variant = o.product.variants[o.variantIndex] ?? o.product.variants[0];
    const price = Number(o.product.price);
    const createdAt = new Date();
    createdAt.setDate(createdAt.getDate() - o.daysAgo);

    const order = await prisma.order.create({
      data: {
        shopId: shop.id,
        customerId: o.customer.id,
        orderNumber: `LUNA-${counter++}`,
        status: o.status,
        source: o.source,
        totalAmount: price,
        deliveryAddress: o.customer.address,
        deliveryCity: o.customer.city,
        customerPhone: o.customer.phone,
        customerName: o.customer.fullName,
        note: o.note,
        createdAt,
        updatedAt: createdAt,
        items: {
          create: {
            productId: o.product.id,
            productName: o.product.name,
            variantId: variant.id,
            size: variant.optionValue,
            color: null,
            variantInfo: `${variant.optionLabel}: ${variant.optionValue}`,
            quantity: 1,
            unitPrice: price,
            totalPrice: price,
          },
        },
      },
    });
    orders.push(order);
  }

  await prisma.shop.update({
    where: { id: shop.id },
    data: { orderCounter: counter - 1 },
  });
  console.log(`✓ ${orders.length} orders`);

  await prisma.exchangeRequest.createMany({
    data: [
      {
        shopId: shop.id,
        orderId: orders[5].id,
        customerId: customers[5].id,
        status: "WAITING_CUSTOMER_RETURN",
        reason: "Pogrešna veličina",
        originalProductName: products[0].name,
        originalSize: "S",
        originalColor: null,
        requestedSize: "M",
        requestedColor: null,
        shippingPaidBy: "CUSTOMER",
        note: "Kupac šalje paket sutra",
      },
      {
        shopId: shop.id,
        orderId: orders[4].id,
        customerId: customers[4].id,
        status: "NEW",
        reason: "Želi drugu boju",
        originalProductName: products[3].name,
        originalSize: "M",
        requestedProductName: products[3].name,
        requestedSize: "M",
        shippingPaidBy: "UNKNOWN",
      },
      {
        shopId: shop.id,
        orderId: orders[9].id,
        customerId: customers[3].id,
        status: "COMPLETED",
        reason: "Zamena veličine",
        originalProductName: products[2].name,
        originalSize: "M",
        requestedSize: "L",
        shippingPaidBy: "SELLER",
      },
    ],
  });

  await prisma.complaintRequest.createMany({
    data: [
      {
        shopId: shop.id,
        orderId: orders[8].id,
        customerId: customers[2].id,
        status: "REVIEWING",
        reason: "Oštećen proizvod",
        description: "Košulja stigla sa mrljom na rukavu.",
      },
      {
        shopId: shop.id,
        orderId: orders[4].id,
        customerId: customers[4].id,
        status: "NEW",
        reason: "Kasna isporuka",
        description: "Paket kasnio 5 dana u odnosu na dogovor.",
      },
      {
        shopId: shop.id,
        customerId: customers[0].id,
        status: "APPROVED",
        reason: "Pogrešan artikal",
        description: "Poslata pogrešna veličina — odobren povraćaj.",
        resolution: "Refundiran iznos + besplatna zamena",
      },
    ],
  });
  console.log("✓ exchanges + complaints");

  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  DEMO SPREMAN
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Shop:     /${SHOP_SLUG}  (${SHOP_NAME})
  Email:    ${DEMO_EMAIL}
  Username: atelier-luna-demo
  Lozinka:  ${DEMO_PASSWORD}
  Auto:     /demo
  Dashboard: /sign-in → /dashboard
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);
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
