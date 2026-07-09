import { requireShop } from "@/lib/auth";
import { isClerkAdmin } from "@/lib/admin";
import { getDaysRemaining, hasActiveSubscription } from "@/lib/subscription";
import { prisma } from "@/lib/db";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { TrialBanner } from "@/components/dashboard/trial-banner";
import { ImpersonationBanner } from "@/components/dashboard/impersonation-banner";

export default async function DashboardMainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, shop, impersonating, impersonatedOwner } = await requireShop();
  const admin = await isClerkAdmin();

  const [newOrders, exchanges, complaints] = await Promise.all([
    prisma.order.count({ where: { shopId: shop.id, status: "NEW" } }),
    prisma.exchangeRequest.count({
      where: {
        shopId: shop.id,
        status: { in: ["NEW", "WAITING_CUSTOMER_RETURN", "RECEIVED_RETURN", "NEW_ITEM_SENT"] },
      },
    }),
    prisma.complaintRequest.count({
      where: { shopId: shop.id, status: { in: ["NEW", "REVIEWING"] } },
    }),
  ]);

  const daysLeft =
    !impersonating &&
    user.subscriptionStatus === "TRIAL" &&
    hasActiveSubscription(user)
      ? getDaysRemaining(user)
      : null;

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <DashboardSidebar
        shopSlug={shop.slug}
        shopName={shop.name}
        counts={{ newOrders, exchanges, complaints }}
        isAdmin={admin}
        impersonating={!!impersonating}
      />
      <main className="flex-1 overflow-y-auto">
        {impersonating && impersonatedOwner && (
          <ImpersonationBanner
            shopName={shop.name}
            ownerEmail={impersonatedOwner.email}
          />
        )}
        {daysLeft != null && daysLeft <= 14 && <TrialBanner days={daysLeft} />}
        {children}
      </main>
    </div>
  );
}
