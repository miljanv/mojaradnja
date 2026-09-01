import { NextResponse } from "next/server";
import { syncTryOnJobStatus } from "@/lib/try-on/jobs";
import { TryOnServiceError } from "@/lib/try-on/credits";
import { getVisitorSessionId } from "@/lib/try-on/visitor";
import { TRY_ON_ERROR_CODES } from "@/lib/try-on/types";

type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const visitorSessionId = await getVisitorSessionId();
    const result = await syncTryOnJobStatus(id, visitorSessionId);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof TryOnServiceError) {
      const status =
        e.code === TRY_ON_ERROR_CODES.UNAUTHORIZED
          ? 403
          : e.code === TRY_ON_ERROR_CODES.JOB_NOT_FOUND
            ? 404
            : 400;
      return NextResponse.json(
        { error: e.code, message: e.message },
        { status }
      );
    }
    return NextResponse.json(
      {
        error: TRY_ON_ERROR_CODES.PROVIDER_ERROR,
        message: "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije.",
      },
      { status: 500 }
    );
  }
}
