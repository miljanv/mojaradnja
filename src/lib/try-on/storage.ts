import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

export function extractUploadThingKey(urlOrKey: string): string {
  if (!urlOrKey.includes("/")) return urlOrKey;
  try {
    const u = new URL(urlOrKey);
    const parts = u.pathname.split("/").filter(Boolean);
    const fIdx = parts.indexOf("f");
    if (fIdx >= 0 && parts[fIdx + 1]) return parts[fIdx + 1];
    return parts[parts.length - 1] ?? urlOrKey;
  } catch {
    return urlOrKey;
  }
}

export function uploadThingUrlFromKey(key: string): string {
  if (key.startsWith("http://") || key.startsWith("https://")) return key;
  const appId = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID;
  if (appId) {
    return `https://${appId}.ufs.sh/f/${key}`;
  }
  return key;
}

/** Public CDN URL usable by fal.ai to fetch the image. */
export function getPublicImageUrl(keyOrUrl: string): string {
  return uploadThingUrlFromKey(keyOrUrl);
}

export async function uploadImageFromUrl(
  sourceUrl: string,
  fileName = "try-on-result.jpg"
): Promise<{ key: string; url: string }> {
  const res = await fetch(sourceUrl);
  if (!res.ok) {
    throw new Error(`Failed to download result image (${res.status})`);
  }
  const contentType = res.headers.get("content-type") ?? "image/jpeg";
  const buffer = Buffer.from(await res.arrayBuffer());
  const file = new File([new Uint8Array(buffer)], fileName, { type: contentType });
  const uploaded = await utapi.uploadFiles(file);
  if (uploaded.error || !uploaded.data) {
    throw new Error(uploaded.error?.message ?? "Failed to upload result image");
  }
  return {
    key: uploaded.data.key,
    url: uploaded.data.ufsUrl ?? uploaded.data.url,
  };
}

export async function uploadImageBuffer(
  buffer: Buffer,
  fileName: string,
  contentType: string
): Promise<{ key: string; url: string }> {
  const file = new File([new Uint8Array(buffer)], fileName, { type: contentType });
  const uploaded = await utapi.uploadFiles(file);
  if (uploaded.error || !uploaded.data) {
    throw new Error(uploaded.error?.message ?? "Failed to upload image");
  }
  return {
    key: uploaded.data.key,
    url: uploaded.data.ufsUrl ?? uploaded.data.url,
  };
}

export async function deleteStoredFiles(keys: string[]): Promise<void> {
  const clean = keys
    .filter(Boolean)
    .map(extractUploadThingKey)
    .filter((k) => k.length > 0);
  if (clean.length === 0) return;
  try {
    await utapi.deleteFiles(clean);
  } catch {
    // Best-effort cleanup; reconciliation can retry.
  }
}
