/**
 * Public KakoMiStoji event names mapped onto the persisted
 * `TryOnAnalyticsEventType` enum. Client code only ever uses the public names,
 * so swapping in PostHog/GA later touches this file and nothing else.
 *
 * `try_on_generation_started`, `try_on_completed` and `try_on_failed` are not
 * listed here on purpose: they are emitted server-side from the job lifecycle,
 * where they cannot be spoofed.
 */
export const KMS_EVENT_MAP = {
  kako_mi_stoji_landing_view: "KMS_LANDING_VIEW",
  shop_view: "KMS_SHOP_VIEW",
  product_view: "KMS_PRODUCT_VIEW",
  try_on_started: "TRY_ON_OPENED",
  photo_uploaded: "KMS_PHOTO_UPLOADED",
  consent_given: "KMS_CONSENT_GIVEN",
  share_clicked: "KMS_SHARE_CLICKED",
  buy_clicked: "KMS_BUY_CLICKED",
  try_another_clicked: "KMS_TRY_ANOTHER_CLICKED",
} as const;

export type KmsEventName = keyof typeof KMS_EVENT_MAP;

export const KMS_EVENT_NAMES = Object.keys(KMS_EVENT_MAP) as [
  KmsEventName,
  ...KmsEventName[],
];

export const UTM_KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
] as const;

export type UtmParams = Partial<Record<(typeof UTM_KEYS)[number], string>>;
