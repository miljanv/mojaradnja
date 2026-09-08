export const KMS_BRAND_NAME = "KakoMiStoji";
export const KMS_TAGLINE = "Vidi kako ti stoji pre nego što naručiš.";

/** Physical route prefix that the KakoMiStoji host is rewritten onto. */
export const KMS_PATH_PREFIX = "/kms";

function parseHosts(raw: string | undefined, fallback: string): string[] {
  return (raw ?? fallback)
    .split(",")
    .map((h) => h.trim().toLowerCase())
    .filter(Boolean);
}

export function getKmsHosts(): string[] {
  return parseHosts(process.env.NEXT_PUBLIC_KMS_HOSTS, "kakomistoji.app");
}

/** True when the request host belongs to the KakoMiStoji brand. */
export function isKmsHost(host: string | null | undefined): boolean {
  if (!host) return false;
  const hostname = host.split(":")[0]!.toLowerCase();
  return getKmsHosts().some(
    (h) => hostname === h || hostname === `www.${h}` || hostname.endsWith(`.${h}`)
  );
}

export function getKmsBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_KMS_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return `https://${getKmsHosts()[0] ?? "kakomistoji.app"}`;
}

export function getMojShopBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");
  return "https://mojshop.app";
}

/** Public KakoMiStoji URL for a shop, safe to share on Instagram. */
export function kmsShopUrl(slug: string): string {
  return `${getKmsBaseUrl()}/shop/${slug}`;
}

export function kmsProductUrl(slug: string, productSlug: string): string {
  return `${kmsShopUrl(slug)}/${productSlug}`;
}

export function getKmsDemoShopSlug(): string {
  return process.env.NEXT_PUBLIC_KMS_DEMO_SHOP_SLUG?.trim() || "demo";
}
