"use client";

import { UTM_KEYS, type KmsEventName, type UtmParams } from "./events";

const UTM_STORAGE_KEY = "kms_utm";
const REFERRER_STORAGE_KEY = "kms_ref";

export type KmsEventPayload = {
  shopSlug?: string;
  productId?: string;
  tryOnJobId?: string;
};

/**
 * Captures UTM params on first landing and keeps them for the whole anonymous
 * session, so a `buy_clicked` three screens later still knows the campaign.
 */
export function captureCampaignContext(): void {
  if (typeof window === "undefined") return;

  try {
    const params = new URLSearchParams(window.location.search);
    const utm: UtmParams = {};
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) utm[key] = value.slice(0, 120);
    }

    if (Object.keys(utm).length > 0) {
      sessionStorage.setItem(UTM_STORAGE_KEY, JSON.stringify(utm));
    }

    if (!sessionStorage.getItem(REFERRER_STORAGE_KEY) && document.referrer) {
      sessionStorage.setItem(
        REFERRER_STORAGE_KEY,
        new URL(document.referrer).hostname.slice(0, 120)
      );
    }
  } catch {
    // sessionStorage can be unavailable in private mode — tracking is best effort.
  }
}

function readCampaignContext(): { utm: UtmParams; referrer?: string } {
  if (typeof window === "undefined") return { utm: {} };
  try {
    const raw = sessionStorage.getItem(UTM_STORAGE_KEY);
    return {
      utm: raw ? (JSON.parse(raw) as UtmParams) : {},
      referrer: sessionStorage.getItem(REFERRER_STORAGE_KEY) ?? undefined,
    };
  } catch {
    return { utm: {} };
  }
}

/** Fire-and-forget. Analytics must never block or break the try-on flow. */
export function kmsTrack(event: KmsEventName, payload: KmsEventPayload = {}): void {
  if (typeof window === "undefined") return;

  const body = JSON.stringify({ event, ...payload, ...readCampaignContext() });

  try {
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/kms/events",
        new Blob([body], { type: "application/json" })
      );
      return;
    }
  } catch {
    // fall through to fetch
  }

  void fetch("/api/kms/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body,
    keepalive: true,
  }).catch(() => {});
}
