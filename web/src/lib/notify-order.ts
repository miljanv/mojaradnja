import { prisma } from "@/lib/db";
import { sendNewOrderNotification } from "@/lib/email";

export async function notifyShopNewOrder(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: true,
      shop: {
        select: {
          name: true,
          email: true,
          owner: { select: { email: true } },
        },
      },
    },
  });

  const shopEmail = order?.shop.email || order?.shop.owner.email;
  if (!order || !shopEmail) return;

  await sendNewOrderNotification({
    shopEmail,
    shopName: order.shop.name,
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    deliveryCity: order.deliveryCity,
    deliveryAddress: order.deliveryAddress,
    totalAmount: Number(order.totalAmount),
    source: order.source,
    note: order.note,
    orderId: order.id,
    items: order.items.map((item) => ({
      productName: item.productName,
      size: item.size,
      color: item.color,
      quantity: item.quantity,
      totalPrice: Number(item.totalPrice),
    })),
  });
}
