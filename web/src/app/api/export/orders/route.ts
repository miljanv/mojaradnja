import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { exportOrdersToCsv } from "@/lib/messages";
import { requireShop } from "@/lib/auth";

export async function GET(request: NextRequest) {
  try {
    const { shop } = await requireShop();
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const source = searchParams.get("source");
    const search = searchParams.get("search");

    const orders = await prisma.order.findMany({
      where: {
        shopId: shop.id,
        ...(status && status !== "all" ? { status: status as never } : {}),
        ...(source && source !== "all" ? { source: source as never } : {}),
        ...(search
          ? {
              OR: [
                { orderNumber: { contains: search, mode: "insensitive" } },
                { customerName: { contains: search, mode: "insensitive" } },
                { customerPhone: { contains: search } },
              ],
            }
          : {}),
      },
      include: { items: true },
      orderBy: { createdAt: "desc" },
    });

    const csv = exportOrdersToCsv(
      orders.map((o) => ({
        orderNumber: o.orderNumber,
        customerName: o.customerName,
        customerPhone: o.customerPhone,
        deliveryCity: o.deliveryCity,
        deliveryAddress: o.deliveryAddress,
        totalAmount: Number(o.totalAmount),
        note: o.note,
        items: o.items.map((i) => ({
          productName: i.productName,
          size: i.size,
          color: i.color,
          quantity: i.quantity,
        })),
      }))
    );

    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="orders-${shop.slug}.csv"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
