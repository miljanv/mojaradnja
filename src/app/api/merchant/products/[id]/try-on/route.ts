import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyShopOwnership } from "@/lib/auth";
import { updateProductTryOn } from "@/lib/actions/merchant-try-on";
import { TRY_ON_CATEGORIES, TRY_ON_PHOTO_TYPES } from "@/lib/try-on/types";

type Params = { params: Promise<{ id: string }> };

const schema = z.object({
  shopId: z.string().min(1),
  tryOnEnabled: z.boolean(),
  tryOnCategory: z.enum(["tops", "one-pieces"]).nullable(),
  tryOnPhotoType: z.enum(["model", "flat-lay"]).nullable(),
  tryOnGarmentImageKey: z.string().nullable(),
});

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id: productId } = await params;
    const body = schema.safeParse(await req.json());
    if (!body.success) {
      return NextResponse.json({ error: "Validation error" }, { status: 400 });
    }

    await verifyShopOwnership(body.data.shopId);

    if (body.data.tryOnCategory && !(TRY_ON_CATEGORIES as string[]).includes(body.data.tryOnCategory)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }
    if (body.data.tryOnPhotoType && !(TRY_ON_PHOTO_TYPES as string[]).includes(body.data.tryOnPhotoType)) {
      return NextResponse.json({ error: "Invalid photo type" }, { status: 400 });
    }

    const result = await updateProductTryOn(body.data.shopId, productId, {
      tryOnEnabled: body.data.tryOnEnabled,
      tryOnCategory: body.data.tryOnCategory,
      tryOnPhotoType: body.data.tryOnPhotoType,
      tryOnGarmentImageKey: body.data.tryOnGarmentImageKey,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Failed" },
      { status: 500 }
    );
  }
}
