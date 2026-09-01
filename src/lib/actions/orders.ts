"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyShopOwnership } from "@/lib/auth";
import { generateOrderNumber } from "@/lib/order-number";
import type { OrderSource, OrderStatus } from "@/lib/prisma-client";
import type { ActionResult } from "./shop";
import { formatVariantAttributes } from "@/lib/shop-theme";
import { notifyShopNewOrder } from "@/lib/notify-order";

export async function createManualOrder(
  shopId: string,
  data: {
    customerId?: string;
    newCustomer?: {
      fullName: string;
      phone: string;
      email?: string;
      instagramUsername?: string;
      address?: string;
      city?: string;
    };
    items: Array<{
      productId?: string;
      productName: string;
      variantId?: string;
      size?: string;
      color?: string;
      variantInfo?: string;
      quantity: number;
      unitPrice: number;
    }>;
    deliveryAddress?: string;
    deliveryCity?: string;
    customerPhone?: string;
    customerName?: string;
    source: OrderSource;
    note?: string;
    internalNote?: string;
  }
): Promise<ActionResult<{ orderId: string; orderNumber: string }>> {
  try {
    await verifyShopOwnership(shopId);

    let customerId = data.customerId;
    if (!customerId && data.newCustomer) {
      const customer = await prisma.customer.upsert({
        where: {
          shopId_phone: { shopId, phone: data.newCustomer.phone },
        },
        create: {
          shopId,
          fullName: data.newCustomer.fullName,
          phone: data.newCustomer.phone,
          email: data.newCustomer.email,
          instagramUsername: data.newCustomer.instagramUsername,
          address: data.newCustomer.address,
          city: data.newCustomer.city,
        },
        update: {
          fullName: data.newCustomer.fullName,
          email: data.newCustomer.email,
          instagramUsername: data.newCustomer.instagramUsername,
          address: data.newCustomer.address,
          city: data.newCustomer.city,
        },
      });
      customerId = customer.id;
    }

    if (!customerId) {
      return { success: false, error: "Customer required" };
    }

    const customer = await prisma.customer.findUnique({ where: { id: customerId } });
    if (!customer) return { success: false, error: "Customer not found" };

    const orderNumber = await generateOrderNumber(shopId);
    const totalAmount = data.items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        shopId,
        customerId,
        orderNumber,
        source: data.source,
        totalAmount,
        deliveryAddress: data.deliveryAddress ?? customer.address,
        deliveryCity: data.deliveryCity ?? customer.city,
        customerPhone: data.customerPhone ?? customer.phone,
        customerName: data.customerName ?? customer.fullName,
        note: data.note,
        internalNote: data.internalNote,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            size: item.size,
            color: item.color,
            variantInfo: item.variantInfo,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.unitPrice * item.quantity,
          })),
        },
      },
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard");
    return { success: true, data: { orderId: order.id, orderNumber } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create order" };
  }
}

export async function createMiniShopOrder(
  shopSlug: string,
  data: {
    productId: string;
    variantId?: string;
    size?: string;
    color?: string;
    variantInfo?: string;
    quantity: number;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    note?: string;
  }
): Promise<ActionResult<{ orderNumber: string; orderId: string }>> {
  return createMiniShopCartOrder(shopSlug, {
    items: [
      {
        productId: data.productId,
        variantId: data.variantId,
        size: data.size,
        color: data.color,
        variantInfo: data.variantInfo,
        quantity: data.quantity,
      },
    ],
    fullName: data.fullName,
    phone: data.phone,
    city: data.city,
    address: data.address,
    note: data.note,
  });
}

export async function createMiniShopCartOrder(
  shopSlug: string,
  data: {
    items: Array<{
      productId: string;
      variantId?: string;
      size?: string;
      color?: string;
      variantInfo?: string;
      quantity: number;
    }>;
    fullName: string;
    phone: string;
    city: string;
    address: string;
    note?: string;
  }
): Promise<ActionResult<{ orderNumber: string; orderId: string }>> {
  try {
    if (!data.items.length) {
      return { success: false, error: "Cart is empty" };
    }

    const shop = await prisma.shop.findUnique({
      where: { slug: shopSlug, isPublished: true },
    });
    if (!shop) return { success: false, error: "Shop not found" };

    const productIds = [...new Set(data.items.map((i) => i.productId))];
    const products = await prisma.product.findMany({
      where: { id: { in: productIds }, shopId: shop.id, status: "ACTIVE" },
      include: { variants: true },
    });

    const productMap = new Map(products.map((p) => [p.id, p]));
    const orderItems: Array<{
      productId: string;
      productName: string;
      variantId?: string;
      size?: string;
      color?: string;
      variantInfo?: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
    }> = [];

    for (const item of data.items) {
      const product = productMap.get(item.productId);
      if (!product) return { success: false, error: "Product not found" };

      const variant = item.variantId
        ? product.variants.find((v) => v.id === item.variantId)
        : undefined;

      if (item.variantId && !variant) {
        return { success: false, error: "Variant not found" };
      }

      if (variant && (!variant.isAvailable || variant.stock < item.quantity)) {
        return { success: false, error: `${product.name} nije dostupan u traženoj količini` };
      }

      const unitPrice = Number(product.price);
      const variantInfo =
        item.variantInfo ??
        (variant ? formatVariantAttributes(variant) : undefined);

      orderItems.push({
        productId: product.id,
        productName: product.name,
        variantId: variant?.id,
        size: variant?.size ?? item.size,
        color: variant?.color ?? item.color,
        variantInfo: variantInfo || undefined,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
      });
    }

    const customer = await prisma.customer.upsert({
      where: { shopId_phone: { shopId: shop.id, phone: data.phone } },
      create: {
        shopId: shop.id,
        fullName: data.fullName,
        phone: data.phone,
        address: data.address,
        city: data.city,
      },
      update: {
        fullName: data.fullName,
        address: data.address,
        city: data.city,
      },
    });

    const orderNumber = await generateOrderNumber(shop.id);
    const totalAmount = orderItems.reduce((sum, i) => sum + i.totalPrice, 0);

    const order = await prisma.order.create({
      data: {
        shopId: shop.id,
        customerId: customer.id,
        orderNumber,
        source: "MINI_SHOP",
        totalAmount,
        deliveryAddress: data.address,
        deliveryCity: data.city,
        customerPhone: data.phone,
        customerName: data.fullName,
        note: data.note,
        items: {
          create: orderItems.map((item) => ({
            productId: item.productId,
            productName: item.productName,
            variantId: item.variantId,
            size: item.size,
            color: item.color,
            variantInfo: item.variantInfo,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
          })),
        },
      },
      include: { items: true },
    });

    void notifyShopNewOrder(order.id);

    try {
      const { getVisitorSessionId } = await import("@/lib/try-on/visitor");
      const { linkTryOnJobsToOrder } = await import("@/lib/try-on/jobs");
      const visitorSessionId = await getVisitorSessionId();
      await linkTryOnJobsToOrder({
        shopId: shop.id,
        orderId: order.id,
        visitorSessionId,
        productIds,
      });
    } catch {
      // Non-blocking analytics link
    }

    return { success: true, data: { orderNumber, orderId: order.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create order" };
  }
}

export async function updateOrderStatus(
  shopId: string,
  orderId: string,
  status: OrderStatus
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.order.update({
      where: { id: orderId, shopId },
      data: { status },
    });
    revalidatePath("/dashboard/orders");
    revalidatePath(`/dashboard/orders/${orderId}`);
    revalidatePath("/dashboard");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update status" };
  }
}

export async function updateOrderNotes(
  shopId: string,
  orderId: string,
  data: { note?: string; internalNote?: string }
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.order.update({
      where: { id: orderId, shopId },
      data,
    });
    revalidatePath(`/dashboard/orders/${orderId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update notes" };
  }
}
