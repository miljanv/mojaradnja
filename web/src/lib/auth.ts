import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getDefaultTrialDates, hasActiveSubscription } from "@/lib/subscription";
import { getImpersonatedShop, isClerkAdmin } from "@/lib/admin";

export async function getAuthUser() {
  const { userId } = await auth();
  if (!userId) return null;

  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const email = clerkUser.emailAddresses[0]?.emailAddress ?? "";
  const name = clerkUser.fullName ?? clerkUser.firstName ?? null;

  const include = { shops: true } as const;

  let user = await prisma.user.findUnique({
    where: { clerkId: userId },
    include,
  });

  if (user) {
    if (!user.trialEndsAt && user.subscriptionStatus === "TRIAL") {
      const trial = getDefaultTrialDates(user.createdAt);
      user = await prisma.user.update({
        where: { id: user.id },
        data: trial,
        include,
      });
    }
    return user;
  }

  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email },
      include,
    });

    if (byEmail) {
      const trial =
        !byEmail.trialEndsAt && byEmail.subscriptionStatus === "TRIAL"
          ? getDefaultTrialDates(byEmail.createdAt)
          : {};
      return prisma.user.update({
        where: { id: byEmail.id },
        data: { clerkId: userId, name: name ?? byEmail.name, ...trial },
        include,
      });
    }
  }

  try {
    return await prisma.user.create({
      data: {
        clerkId: userId,
        email: email || `user-${userId}@instacrm.local`,
        name,
        ...getDefaultTrialDates(),
      },
      include,
    });
  } catch {
    user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include,
    });

    if (user) return user;
    throw new Error("Failed to sync user account");
  }
}

export async function requireAuthUser() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");
  return user;
}

export async function requireActiveSubscription() {
  const user = await requireAuthUser();
  const admin = await isClerkAdmin();
  if (admin) return user;

  if (!hasActiveSubscription(user)) {
    redirect("/dashboard/subscription-expired");
  }
  return user;
}

export async function getShopForUser(shopId?: string) {
  const user = await requireAuthUser();

  // Admin support mode: manage another boutique's shop
  const impersonated = await getImpersonatedShop();
  if (impersonated) {
    if (shopId && shopId !== impersonated.id) {
      return {
        user,
        shop: null,
        impersonating: true as const,
        impersonatedOwner: impersonated.owner,
      };
    }
    const { owner, ...shop } = impersonated;
    return {
      user,
      shop,
      impersonating: true as const,
      impersonatedOwner: owner,
    };
  }

  const shop = shopId
    ? user.shops.find((s) => s.id === shopId)
    : user.shops[0];

  if (!shop) {
    return {
      user,
      shop: null,
      impersonating: false as const,
      impersonatedOwner: null,
    };
  }
  return {
    user,
    shop,
    impersonating: false as const,
    impersonatedOwner: null,
  };
}

export async function requireShop(shopId?: string) {
  await requireActiveSubscription();
  const result = await getShopForUser(shopId);
  if (!result.shop) redirect("/dashboard/onboarding");
  return result;
}

export async function verifyShopOwnership(shopId: string) {
  const { shop } = await requireShop(shopId);
  if (shop.id !== shopId) {
    throw new Error("Unauthorized");
  }
  return shop;
}
