import { UTApi } from "uploadthing/server";

const utapi = new UTApi();

function decodeUploadThingAppId(): string | null {
  const explicit = process.env.NEXT_PUBLIC_UPLOADTHING_APP_ID?.trim();
  if (explicit) return explicit;

  const token = process.env.UPLOADTHING_TOKEN?.trim();
  if (!token) return null;
  try {
    const json = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8")
    ) as { appId?: string };
    return json.appId ?? null;
  } catch {
    try {
      const json = JSON.parse(
        Buffer.from(token, "base64").toString("utf8")
      ) as { appId?: string };
      return json.appId ?? null;
    } catch {
      return null;
    }
  }
}

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
  const appId = decodeUploadThingAppId();
  if (appId) {
    return `https://${appId}.ufs.sh/f/${key}`;
  }
  // Legacy fallback
  return `https://utfs.io/f/${key}`;
}

/** Public CDN URL usable by fal.ai to fetch the image. */
export function getPublicImageUrl(keyOrUrl: string): string {
  return uploadThingUrlFromKey(keyOrUrl);
}

/**
 * Prefer a short-lived signed URL when files are private;
 * fall back to public CDN URL.
 */
export async function getFetchableImageUrl(keyOrUrl: string): Promise<string> {
  if (keyOrUrl.startsWith("http://") || keyOrUrl.startsWith("https://")) {
    return keyOrUrl;
  }

  const key = extractUploadThingKey(keyOrUrl);
  try {
    if (typeof utapi.generateSignedURL === "function") {
      const signed = await utapi.generateSignedURL(key, {
        expiresIn: 60 * 30,
      });
      if (typeof signed === "string") return signed;
      if (signed && typeof signed === "object") {
        const url =
          (signed as { ufsUrl?: string; url?: string }).ufsUrl ??
          (signed as { url?: string }).url;
        if (url) return url;
      }
    }
  } catch {
    // Fall through to public URL
  }

  return uploadThingUrlFromKey(key);
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
