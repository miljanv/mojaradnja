"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { addDays } from "date-fns";
import { clerkClient } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import {
  ADMIN_UNLOCK_COOKIE,
  IMPERSONATE_SHOP_COOKIE,
  createAdminUnlockToken,
  inviteUserByEmail,
  requireAdminAccess,
  requireClerkAdmin,
  verifyAdminPanelPassword,
} from "@/lib/admin";
import { getDefaultTrialDates } from "@/lib/subscription";
import type { ActionResult } from "@/lib/actions/shop";
import type { SubscriptionStatus } from "@/lib/prisma-client";

export async function unlockAdminPanel(password: string): Promise<ActionResult> {
  try {
    await requireClerkAdmin();
    if (!verifyAdminPanelPassword(password)) {
      return { success: false, error: "Pogrešna šifra" };
    }

    const cookieStore = await cookies();
    cookieStore.set(ADMIN_UNLOCK_COOKIE, createAdminUnlockToken(), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Greška" };
  }
}

export async function lockAdminPanel(): Promise<ActionResult> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_UNLOCK_COOKIE);
  cookieStore.delete(IMPERSONATE_SHOP_COOKIE);
  return { success: true };
}

export async function startImpersonatingShop(
  shopId: string
): Promise<ActionResult<{ shopName: string }>> {
  try {
    await requireAdminAccess();

    const shop = await prisma.shop.findUnique({
      where: { id: shopId },
      select: { id: true, name: true },
    });
    if (!shop) return { success: false, error: "Prodavnica nije pronađena" };

    const cookieStore = await cookies();
    cookieStore.set(IMPERSONATE_SHOP_COOKIE, shop.id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 4,
    });

    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true, data: { shopName: shop.name } };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Greška" };
  }
}

export async function stopImpersonatingShop(): Promise<ActionResult> {
  try {
    await requireClerkAdmin();
    const cookieStore = await cookies();
    cookieStore.delete(IMPERSONATE_SHOP_COOKIE);
    revalidatePath("/dashboard");
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Greška" };
  }
}

export async function extendUserSubscription(
  userId: string,
  days: number
): Promise<ActionResult> {
  try {
    await requireAdminAccess();
    if (!Number.isFinite(days) || days < 1 || days > 3650) {
      return { success: false, error: "Neispravan broj dana" };
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return { success: false, error: "Korisnik nije pronađen" };

    const base =
      user.subscriptionEndsAt && user.subscriptionEndsAt > new Date()
        ? user.subscriptionEndsAt
        : user.trialEndsAt && user.trialEndsAt > new Date()
          ? user.trialEndsAt
          : new Date();

    const subscriptionEndsAt = addDays(base, days);

    await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: "ACTIVE",
        subscriptionEndsAt,
      },
    });

    revalidatePath("/admin");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Greška" };
  }
}

export async function setUserSubscriptionStatus(
  userId: string,
  status: SubscriptionStatus
): Promise<ActionResult> {
  try {
    await requireAdminAccess();
    await prisma.user.update({
      where: { id: userId },
      data: { subscriptionStatus: status },
    });
    revalidatePath("/admin");
    revalidatePath(`/admin/users/${userId}`);
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Greška" };
  }
}

export async function adminInviteUser(email: string): Promise<ActionResult> {
  try {
    await requireAdminAccess();
    const trimmed = email.trim().toLowerCase();
    if (!trimmed.includes("@")) {
      return { success: false, error: "Neispravan email" };
    }

    await inviteUserByEmail(trimmed);
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Slanje invite-a nije uspelo",
    };
  }
}

export async function adminCreateUser(data: {
  email: string;
  name?: string;
  password?: string;
}): Promise<ActionResult<{ userId: string }>> {
  try {
    await requireAdminAccess();
    const email = data.email.trim().toLowerCase();
    if (!email.includes("@")) {
      return { success: false, error: "Neispravan email" };
    }

    const client = await clerkClient();
    const password =
      data.password?.trim() ||
      `Temp${Math.random().toString(36).slice(2, 10)}!A1`;

    const clerkUser = await client.users.createUser({
      emailAddress: [email],
      password,
      firstName: data.name?.split(" ")[0],
      lastName: data.name?.split(" ").slice(1).join(" ") || undefined,
      skipPasswordChecks: true,
    });

    const user = await prisma.user.create({
      data: {
        clerkId: clerkUser.id,
        email,
        name: data.name?.trim() || null,
        ...getDefaultTrialDates(),
      },
    });

    revalidatePath("/admin");
    return { success: true, data: { userId: user.id } };
  } catch (e) {
    return {
      success: false,
      error: e instanceof Error ? e.message : "Kreiranje korisnika nije uspelo",
    };
  }
}

export async function adminDeleteShop(shopId: string): Promise<ActionResult> {
  try {
    await requireAdminAccess();
    await prisma.shop.delete({ where: { id: shopId } });
    revalidatePath("/admin");
    return { success: true };
  } catch (e) {
    return { success: false, error: e instanceof Error ? e.message : "Greška" };
  }
}
