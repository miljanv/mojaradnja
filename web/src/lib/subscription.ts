import { addDays, isAfter } from "date-fns";
import { TRIAL_DAYS } from "@/lib/constants";
import type { SubscriptionStatus } from "@/lib/prisma-client";

export type SubscriptionFields = {
  subscriptionStatus: SubscriptionStatus;
  trialEndsAt: Date | null;
  subscriptionEndsAt: Date | null;
};

export function getDefaultTrialDates(from = new Date()) {
  return {
    subscriptionStatus: "TRIAL" as const,
    trialEndsAt: addDays(from, TRIAL_DAYS),
    subscriptionEndsAt: null as Date | null,
  };
}

export function getSubscriptionAccessEndsAt(user: SubscriptionFields): Date | null {
  if (user.subscriptionStatus === "ACTIVE" && user.subscriptionEndsAt) {
    return user.subscriptionEndsAt;
  }
  if (user.subscriptionStatus === "TRIAL" && user.trialEndsAt) {
    return user.trialEndsAt;
  }
  if (user.subscriptionEndsAt) return user.subscriptionEndsAt;
  if (user.trialEndsAt) return user.trialEndsAt;
  return null;
}

export function hasActiveSubscription(user: SubscriptionFields): boolean {
  if (user.subscriptionStatus === "CANCELLED" || user.subscriptionStatus === "EXPIRED") {
    const endsAt = getSubscriptionAccessEndsAt(user);
    return endsAt ? isAfter(endsAt, new Date()) : false;
  }

  const endsAt = getSubscriptionAccessEndsAt(user);
  if (!endsAt) return user.subscriptionStatus === "ACTIVE";
  return isAfter(endsAt, new Date());
}

export function getDaysRemaining(user: SubscriptionFields): number {
  const endsAt = getSubscriptionAccessEndsAt(user);
  if (!endsAt) return 0;
  const ms = endsAt.getTime() - Date.now();
  return Math.max(0, Math.ceil(ms / (1000 * 60 * 60 * 24)));
}
