"use client";

import { useEffect } from "react";
import { captureCampaignContext, kmsTrack } from "@/lib/kms/analytics-client";
import type { KmsEventName } from "@/lib/kms/events";

type Props = {
  event: KmsEventName;
  shopSlug?: string;
  productId?: string;
};

/** Records a single page-view style event. Renders nothing. */
export function KmsTrack({ event, shopSlug, productId }: Props) {
  useEffect(() => {
    captureCampaignContext();
    kmsTrack(event, { shopSlug, productId });
  }, [event, shopSlug, productId]);

  return null;
}
