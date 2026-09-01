import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin";
import { getAuthUser } from "@/lib/auth";
import { adminAdjustCredits, TryOnServiceError } from "@/lib/try-on/credits";

type Params = { params: Promise<{ id: string }> };

const creditSchema = z.object({
  amount: z.number().int().refine((n) => n !== 0),
  note: z.string().min(1).max(500),
});

export async function POST(req: Request, { params }: Params) {
  try {
    await requireAdminAccess();
    const user = await getAuthUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = creditSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    const result = await adminAdjustCredits({
      shopId: id,
      amount: body.data.amount,
      note: body.data.note,
      createdByUserId: user.id,
    });
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof TryOnServiceError) {
      return NextResponse.json({ error: e.code, message: e.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
