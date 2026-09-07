import { getMobileUserFromRequest } from "@/lib/mobile/auth";
import { corsPreflight, mobileError, mobileJson } from "@/lib/mobile/http";

export const runtime = "nodejs";

export function OPTIONS() {
  return corsPreflight();
}

export async function GET(req: Request) {
  const user = await getMobileUserFromRequest(req);
  if (!user) {
    return mobileError("UNAUTHORIZED", "Niste prijavljeni.", 401);
  }
  return mobileJson({
    user: { id: user.id, phone: user.phone, credits: user.credits },
  });
}
