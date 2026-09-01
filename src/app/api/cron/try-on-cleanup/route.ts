import { NextResponse } from "next/server";
import {
  cleanupExpiredTryOnImages,
  reconcileStaleJobs,
} from "@/lib/try-on/jobs";

/**
 * Protected cleanup / reconciliation endpoint.
 * Call via cron with header: Authorization: Bearer $CRON_SECRET
 * or ?secret=$CRON_SECRET
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 503 });
  }

  const auth = req.headers.get("authorization");
  const url = new URL(req.url);
  const querySecret = url.searchParams.get("secret");
  const ok =
    auth === `Bearer ${secret}` || querySecret === secret;

  if (!ok) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const reconciled = await reconcileStaleJobs();
  const cleaned = await cleanupExpiredTryOnImages();

  return NextResponse.json({
    ok: true,
    reconciled,
    cleaned,
  });
}
