import { NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminAccess } from "@/lib/admin";
import {
  setShopVirtualTryOnEnabled,
} from "@/lib/try-on/credits";

type Params = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  virtualTryOnEnabled: z.boolean(),
});

export async function PATCH(req: Request, { params }: Params) {
  try {
    await requireAdminAccess();
    const { id } = await params;
    const body = patchSchema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }
    await setShopVirtualTryOnEnabled(id, body.data.virtualTryOnEnabled);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
