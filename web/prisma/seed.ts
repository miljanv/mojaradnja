import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { DEFAULT_TEMPLATES } from "../src/lib/messages";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  const user = await prisma.user.upsert({
    where: { clerkId: "demo_clerk_user" },
    create: {
      clerkId: "demo_clerk_user",
      email: "mila@butikmila.rs",
      name: "Mila Petrović",
    },
    update: {},
  });

  const shop = await prisma.shop.upsert({
    where: { slug: "butik-mila" },
    create: {
      ownerId: user.id,
      name: "Butik Mila",
      slug: "butik-mila",
      description: "Ženska garderoba, haljine, kompleti i jakne.",
      instagramUsername: "butik.mila",
      phone: "+381601234567",
      email: "mila@butikmila.rs",
      primaryColor: "#E85A6B",
      returnPolicy:
        "Reklamacije i zamene su moguće u roku od 14 dana od prijema pošiljke. Proizvod mora biti neoštećen, sa svim originalnim etiketama.",
      exchangePolicy:
        "Zamena veličine ili boje je moguća u skladu sa trenutnim stanjem lagera. Troškove poštarine snosi kupac, osim u slučaju greške prodavca.",
      returnAddress: "Butik Mila, Knez Mihailova 12, 11000 Beograd",
      isPublished: true,
      orderCounter: 1000,
    },
    update: { isPublished: true },
  });

  const templateTypes = [
    "ORDER_CONFIRMATION",
    "ORDER_SHIPPED",
    "EXCHANGE_INSTRUCTIONS",
    "COMPLAINT_RECEIVED",
    "CUSTOM",
  ] as const;

  for (const type of templateTypes) {
    await prisma.messageTemplate.upsert({
      where: { shopId_type: { shopId: shop.id, type } },
      create: {
        shopId: shop.id,
        type,
        title: type.replace(/_/g, " "),
        content: DEFAULT_TEMPLATES[type],
      },
      update: {},
    });
  }

  const productsData = [
    {
      name: "Crna haljina",
      slug: "crna-haljina",
      description: "Elegantna crna haljina, savršena za večernje prilike.",
      price: 3900,
      category: "Haljine",
      isFeatured: true,
      variants: [
        { size: "S", color: "Crna", stock: 3 },
        { size: "M", color: "Crna", stock: 5 },
        { size: "L", color: "Crna", stock: 2 },
      ],
      image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop",
    },
    {
      name: "Bež komplet",
      slug: "bez-komplet",
      description: "Udoban bež komplet od pamuka, idealan za svakodnevno nošenje.",
      price: 4500,
      category: "Kompleti",
      isFeatured: true,
      variants: [
        { size: "S", color: "Bež", stock: 4 },
        { size: "M", color: "Bež", stock: 3 },
      ],
      image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=600&h=800&fit=crop",
    },
    {
      name: "Oversize jakna",
      slug: "oversize-jakna",
      description: "Trendy oversize jakna u svetlo sivoj boji.",
      price: 5200,
      category: "Jakne",
      isFeatured: false,
      variants: [
        { size: "M", color: "Siva", stock: 2 },
        { size: "L", color: "Siva", stock: 3 },
      ],
      image: "https://images.unsplash.com/photo-1544022613-e87ca75a784a?w=600&h=800&fit=crop",
    },
    {
      name: "Bela košulja",
      slug: "bela-kosulja",
      description: "Klasična bela košulja od visokokvalitetnog pamuka.",
      price: 2800,
      category: "Košulje",
      isFeatured: false,
      variants: [
        { size: "S", color: "Bela", stock: 6 },
        { size: "M", color: "Bela", stock: 4 },
      ],
      image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600&h=800&fit=crop",
    },
    {
      name: "Letnja haljina",
      slug: "letnja-haljina",
      description: "Lagana letnja haljina sa cvetnim dezenom.",
      price: 3200,
      category: "Haljine",
      isFeatured: true,
      variants: [
        { size: "S", color: "Cvetni", stock: 3 },
        { size: "M", color: "Cvetni", stock: 2 },
      ],
      image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&h=800&fit=crop",
    },
  ];

  for (const p of productsData) {
    const product = await prisma.product.upsert({
      where: { shopId_slug: { shopId: shop.id, slug: p.slug } },
      create: {
        shopId: shop.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: p.price,
        category: p.category,
        status: "ACTIVE",
        isFeatured: p.isFeatured,
        images: { create: [{ url: p.image, sortOrder: 0 }] },
        variants: {
          create: p.variants.map((v) => ({
            size: v.size,
            color: v.color,
            stock: v.stock,
            isAvailable: true,
          })),
        },
      },
      update: { status: "ACTIVE" },
    });
  }

  const customersData = [
    { fullName: "Ana Jovanović", phone: "+381641112233", city: "Beograd", address: "Bulevar kralja Aleksandra 45" },
    { fullName: "Marija Nikolić", phone: "+381642223344", city: "Novi Sad", address: "Zmaj Jovina 12", instagramUsername: "marija_n" },
    { fullName: "Jelena Stojanović", phone: "+381643334455", city: "Niš", address: "Obrenovićeva 8" },
    { fullName: "Teodora Marković", phone: "+381644445566", city: "Beograd", address: "Kneza Miloša 23" },
  ];

  const customers = [];
  for (const c of customersData) {
    const customer = await prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: c.phone } },
      create: { shopId: shop.id, ...c },
      update: c,
    });
    customers.push(customer);
  }

  const products = await prisma.product.findMany({
    where: { shopId: shop.id },
    include: { variants: true },
  });

  const ordersData = [
    { customer: customers[0], product: products[0], variant: products[0].variants[1], status: "NEW" as const, source: "INSTAGRAM_DM" as const },
    { customer: customers[1], product: products[1], variant: products[1].variants[0], status: "SHIPPED" as const, source: "VIBER" as const },
    { customer: customers[2], product: products[2], variant: products[2].variants[0], status: "DELIVERED" as const, source: "WHATSAPP" as const },
    { customer: customers[3], product: products[4], variant: products[4].variants[0], status: "CONFIRMED" as const, source: "MINI_SHOP" as const },
    { customer: customers[0], product: products[3], variant: products[3].variants[0], status: "PACKED" as const, source: "PHONE" as const },
  ];

  let counter = 1001;
  for (const o of ordersData) {
    const orderNumber = `BUTI-${counter++}`;
    await prisma.order.upsert({
      where: { shopId_orderNumber: { shopId: shop.id, orderNumber } },
      create: {
        shopId: shop.id,
        customerId: o.customer.id,
        orderNumber,
        status: o.status,
        source: o.source,
        totalAmount: Number(o.product.price),
        deliveryAddress: o.customer.address,
        deliveryCity: o.customer.city,
        customerPhone: o.customer.phone,
        customerName: o.customer.fullName,
        items: {
          create: {
            productId: o.product.id,
            productName: o.product.name,
            variantId: o.variant.id,
            size: o.variant.size,
            color: o.variant.color,
            quantity: 1,
            unitPrice: Number(o.product.price),
            totalPrice: Number(o.product.price),
          },
        },
      },
      update: {},
    });
  }

  await prisma.shop.update({
    where: { id: shop.id },
    data: { orderCounter: counter - 1 },
  });

  await prisma.exchangeRequest.create({
    data: {
      shopId: shop.id,
      orderId: (await prisma.order.findFirst({ where: { shopId: shop.id } }))!.id,
      customerId: customers[0].id,
      status: "WAITING_CUSTOMER_RETURN",
      reason: "Pogrešna veličina",
      originalProductName: "Crna haljina",
      originalSize: "M",
      originalColor: "Crna",
      requestedSize: "L",
      requestedColor: "Crna",
      shippingPaidBy: "CUSTOMER",
    },
  });

  await prisma.complaintRequest.create({
    data: {
      shopId: shop.id,
      customerId: customers[1].id,
      status: "REVIEWING",
      reason: "Oštećen proizvod",
      description: "Haljina stigla sa mrljom na materijalu.",
    },
  });

  console.log("Seed completed!");
  console.log(`Demo shop: /${shop.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
