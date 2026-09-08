import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils-app";
import { renderTemplate } from "@/lib/messages";
import { DashboardHeader } from "@/components/dashboard/header";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { ComplaintEditForm } from "./complaint-edit-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Params = Promise<{ id: string }>;

export default async function ComplaintDetailPage({ params }: { params: Params }) {
  const { shop } = await requireShop();
  const { id } = await params;
  const t = await getTranslations("complaints");
  const tOrders = await getTranslations("orders");
  const tCommon = await getTranslations("common");

  const complaint = await prisma.complaintRequest.findFirst({
    where: { id, shopId: shop.id },
    include: {
      order: true,
      customer: true,
    },
  });

  if (!complaint) notFound();

  const template = await prisma.messageTemplate.findUnique({
    where: { shopId_type: { shopId: shop.id, type: "COMPLAINT_RECEIVED" } },
  });

  const message = renderTemplate(template?.content ?? "", {
    customerName: complaint.customer.fullName,
    orderNumber: complaint.order?.orderNumber ?? "",
    reason: complaint.reason,
  });

  return (
    <div>
      <DashboardHeader
        title={`${t("edit")} — ${complaint.reason}`}
        subtitle={formatDate(complaint.createdAt)}
        actions={
          <Link href="/dashboard/complaints">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />

      <div className="space-y-4 p-4 sm:p-6">
        <div className="flex flex-wrap items-center gap-3 text-sm">
          <StatusBadge status={complaint.status} type="complaint" />
          <span>
            {tOrders("customer")}:{" "}
            <Link
              href={`/dashboard/customers/${complaint.customer.id}`}
              className="text-[#E85A6B] hover:underline"
            >
              {complaint.customer.fullName}
            </Link>
          </span>
          {complaint.order && (
            <span>
              {tOrders("orderNumber")}:{" "}
              <Link
                href={`/dashboard/orders/${complaint.order.id}`}
                className="text-[#E85A6B] hover:underline"
              >
                {complaint.order.orderNumber}
              </Link>
            </span>
          )}
        </div>

        <ComplaintEditForm
          shopId={shop.id}
          complaintId={complaint.id}
          status={complaint.status}
          reason={complaint.reason}
          description={complaint.description}
          resolution={complaint.resolution}
          note={complaint.note}
          internalNote={complaint.internalNote}
          message={message}
        />
      </div>
    </div>
  );
}
