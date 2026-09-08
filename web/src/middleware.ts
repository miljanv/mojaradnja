import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { KMS_PATH_PREFIX, isKmsHost } from "@/lib/kms/config";

const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)"]);

/** Paths that must never be rewritten onto the KakoMiStoji route tree. */
const PASSTHROUGH_PREFIXES = ["/api", "/_next", "/monitoring", KMS_PATH_PREFIX];

export default clerkMiddleware(async (auth, req) => {
  const { pathname } = req.nextUrl;

  if (
    isKmsHost(req.headers.get("host")) &&
    !PASSTHROUGH_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`))
  ) {
    const url = req.nextUrl.clone();
    url.pathname = pathname === "/" ? KMS_PATH_PREFIX : `${KMS_PATH_PREFIX}${pathname}`;
    return NextResponse.rewrite(url);
  }

  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
