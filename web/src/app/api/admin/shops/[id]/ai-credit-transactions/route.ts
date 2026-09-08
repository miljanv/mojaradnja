import { NextResponse } from "next/server";
import { requireAdminAccess } from "@/lib/admin";
import { prisma } from "@/lib/db";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    await requireAdminAccess();
    const { id } = await params;
    const transactions = await prisma.aiCreditTransaction.findMany({
      where: { shopId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
    return NextResponse.json({ transactions });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
