import { auth, currentUser, clerkClient } from "@clerk/nextjs/server";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, timingSafeEqual } from "crypto";
import { prisma } from "@/lib/db";

export const ADMIN_UNLOCK_COOKIE = "instacrm_admin_unlock";
export const IMPERSONATE_SHOP_COOKIE = "instacrm_impersonate_shop";

function hashPassword(password: string) {
  return createHash("sha256").update(password).digest("hex");
}

export function getAdminPanelPassword() {
  return process.env.ADMIN_PANEL_PASSWORD || "Petrovaradin1!";
}

export function verifyAdminPanelPassword(password: string) {
  const expected = hashPassword(getAdminPanelPassword());
  const actual = hashPassword(password);
  try {
    return timingSafeEqual(Buffer.from(expected), Buffer.from(actual));
  } catch {
    return false;
  }
}

export function createAdminUnlockToken() {
  const secret = process.env.CLERK_SECRET_KEY || "instacrm-admin";
  return createHash("sha256")
    .update(`${getAdminPanelPassword()}:${secret}:unlocked`)
    .digest("hex");
}

export async function isAdminUnlocked() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_UNLOCK_COOKIE)?.value;
  if (!token) return false;
  return token === createAdminUnlockToken();
}

export async function isClerkAdmin() {
  const user = await currentUser();
  if (!user) return false;
  const meta = user.publicMetadata as Record<string, unknown> | undefined;
  return meta?.isAdmin === true;
}

export async function requireClerkAdmin() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");
  const ok = await isClerkAdmin();
  if (!ok) redirect("/dashboard");
  return userId;
}

export async function requireAdminAccess() {
  await requireClerkAdmin();
  const unlocked = await isAdminUnlocked();
  if (!unlocked) redirect("/admin/unlock");
}

export async function inviteUserByEmail(email: string, redirectUrl?: string) {
  const client = await clerkClient();
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000").replace(
    /\/$/,
    ""
  );
  // Land on /invite first so an already-signed-in admin can switch accounts,
  // then complete signup and create a shop on /dashboard/onboarding.
  const invitation = await client.invitations.createInvitation({
    emailAddress: email,
    redirectUrl: redirectUrl || `${appUrl}/invite`,
    publicMetadata: {},
  });
  return invitation;
}

export async function listAllUsersForAdmin() {
  return prisma.user.findMany({
    include: {
      shops: {
        include: {
          _count: {
            select: {
              products: true,
              orders: true,
              customers: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getImpersonatedShopId(): Promise<string | null> {
  const admin = await isClerkAdmin();
  if (!admin) return null;
  const unlocked = await isAdminUnlocked();
  if (!unlocked) return null;

  const cookieStore = await cookies();
  const shopId = cookieStore.get(IMPERSONATE_SHOP_COOKIE)?.value;
  return shopId || null;
}

export async function getImpersonatedShop() {
  const shopId = await getImpersonatedShopId();
  if (!shopId) return null;

  return prisma.shop.findUnique({
    where: { id: shopId },
    include: {
      owner: {
        select: { id: true, email: true, name: true },
      },
    },
  });
}
