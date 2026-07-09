"use client";

import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ORDER_STATUS_COLORS,
  EXCHANGE_STATUS_COLORS,
  COMPLAINT_STATUS_COLORS,
} from "@/lib/constants";

type StatusBadgeProps = {
  status: string;
  type?: "order" | "exchange" | "complaint" | "product";
};

export function StatusBadge({ status, type = "order" }: StatusBadgeProps) {
  const tOrders = useTranslations("orders.statuses");
  const tExchanges = useTranslations("exchanges.statuses");
  const tComplaints = useTranslations("complaints.statuses");
  const tProducts = useTranslations("products.statuses");

  const colorMap: Record<string, Record<string, string>> = {
    order: ORDER_STATUS_COLORS,
    exchange: EXCHANGE_STATUS_COLORS,
    complaint: COMPLAINT_STATUS_COLORS,
    product: {
      ACTIVE: "bg-green-100 text-green-800",
      DRAFT: "bg-gray-100 text-gray-800",
      ARCHIVED: "bg-red-100 text-red-800",
      SOLD_OUT: "bg-orange-100 text-orange-800",
    },
  };

  const labelMap = {
    order: tOrders,
    exchange: tExchanges,
    complaint: tComplaints,
    product: tProducts,
  };

  const colors = colorMap[type];
  const label = labelMap[type];

  return (
    <Badge variant="secondary" className={cn("font-normal", colors[status])}>
      {label(status as never)}
    </Badge>
  );
}
