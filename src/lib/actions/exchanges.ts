"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { verifyShopOwnership } from "@/lib/auth";
import type { ExchangeStatus, ShippingPaidBy, ComplaintStatus } from "@/lib/prisma-client";
import type { ActionResult } from "./shop";

export async function createExchange(
  shopId: string,
  data: {
    orderId: string;
    customerId: string;
    originalProductName: string;
    originalSize?: string;
    originalColor?: string;
    requestedProductName?: string;
    requestedSize?: string;
    requestedColor?: string;
    reason?: string;
    shippingPaidBy: ShippingPaidBy;
    note?: string;
    internalNote?: string;
  }
): Promise<ActionResult<{ exchangeId: string }>> {
  try {
    await verifyShopOwnership(shopId);

    const exchange = await prisma.exchangeRequest.create({
      data: { shopId, ...data },
    });

    await prisma.order.update({
      where: { id: data.orderId },
      data: { status: "EXCHANGE_IN_PROGRESS" },
    });

    revalidatePath("/dashboard/exchanges");
    revalidatePath("/dashboard/orders");
    return { success: true, data: { exchangeId: exchange.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create exchange" };
  }
}

export async function updateExchangeStatus(
  shopId: string,
  exchangeId: string,
  status: ExchangeStatus
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.exchangeRequest.update({
      where: { id: exchangeId, shopId },
      data: { status },
    });
    revalidatePath("/dashboard/exchanges");
    revalidatePath(`/dashboard/exchanges/${exchangeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update status" };
  }
}

export async function createPublicExchangeRequest(
  shopSlug: string,
  data: {
    orderNumber: string;
    phone: string;
    reason: string;
    requestedSize?: string;
    requestedColor?: string;
    note?: string;
  }
): Promise<ActionResult> {
  try {
    const shop = await prisma.shop.findUnique({
      where: { slug: shopSlug, isPublished: true },
    });
    if (!shop) return { success: false, error: "Shop not found" };

    const order = await prisma.order.findFirst({
      where: { shopId: shop.id, orderNumber: data.orderNumber, customerPhone: data.phone },
      include: { customer: true, items: true },
    });
    if (!order) return { success: false, error: "Order not found" };

    const firstItem = order.items[0];
    await prisma.exchangeRequest.create({
      data: {
        shopId: shop.id,
        orderId: order.id,
        customerId: order.customerId,
        reason: data.reason,
        originalProductName: firstItem?.productName ?? "Unknown",
        originalSize: firstItem?.size,
        originalColor: firstItem?.color,
        requestedSize: data.requestedSize,
        requestedColor: data.requestedColor,
        note: data.note,
      },
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to submit request" };
  }
}

export async function createComplaint(
  shopId: string,
  data: {
    orderId?: string;
    customerId: string;
    reason: string;
    description?: string;
    resolution?: string;
    note?: string;
    internalNote?: string;
  }
): Promise<ActionResult<{ complaintId: string }>> {
  try {
    await verifyShopOwnership(shopId);

    const complaint = await prisma.complaintRequest.create({
      data: { shopId, ...data },
    });

    revalidatePath("/dashboard/complaints");
    return { success: true, data: { complaintId: complaint.id } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to create complaint" };
  }
}

export async function updateComplaintStatus(
  shopId: string,
  complaintId: string,
  status: ComplaintStatus
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.complaintRequest.update({
      where: { id: complaintId, shopId },
      data: { status },
    });
    revalidatePath("/dashboard/complaints");
    revalidatePath(`/dashboard/complaints/${complaintId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update status" };
  }
}

export async function updateComplaint(
  shopId: string,
  complaintId: string,
  data: {
    reason?: string;
    description?: string;
    resolution?: string;
    note?: string;
    internalNote?: string;
  }
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.complaintRequest.update({
      where: { id: complaintId, shopId },
      data,
    });
    revalidatePath(`/dashboard/complaints/${complaintId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update complaint" };
  }
}

export async function updateExchangeNotes(
  shopId: string,
  exchangeId: string,
  data: { note?: string; internalNote?: string }
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.exchangeRequest.update({
      where: { id: exchangeId, shopId },
      data,
    });
    revalidatePath(`/dashboard/exchanges/${exchangeId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update notes" };
  }
}

export async function updateTemplate(
  shopId: string,
  type: string,
  data: { title: string; content: string }
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.messageTemplate.update({
      where: { shopId_type: { shopId, type: type as "ORDER_CONFIRMATION" | "ORDER_SHIPPED" | "EXCHANGE_INSTRUCTIONS" | "COMPLAINT_RECEIVED" | "CUSTOM" } },
      data,
    });
    revalidatePath("/dashboard/templates");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update template" };
  }
}

export async function updateCustomerNote(
  shopId: string,
  customerId: string,
  note: string
): Promise<ActionResult> {
  try {
    await verifyShopOwnership(shopId);
    await prisma.customer.update({
      where: { id: customerId, shopId },
      data: { note },
    });
    revalidatePath(`/dashboard/customers/${customerId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Failed to update customer" };
  }
}
