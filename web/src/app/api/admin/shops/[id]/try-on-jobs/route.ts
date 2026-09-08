import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdminAccess();
    const { id } = await params;
    const jobs = await prisma.tryOnJob.findMany({
      where: { shopId: id },
      orderBy: { createdAt: "desc" },
      take: 30,
      include: {
        product: { select: { id: true, name: true } },
      },
    });
    return NextResponse.json({
      jobs: jobs.map((j) => ({
        id: j.id,
        status: j.status,
        productName: j.product.name,
        productId: j.productId,
        createdAt: j.createdAt,
        completedAt: j.completedAt,
        failedAt: j.failedAt,
        errorCode: j.errorCode,
        errorMessage: j.errorMessage,
        creditConsumed: j.creditConsumed,
        creditRefunded: j.creditRefunded,
      })),
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
