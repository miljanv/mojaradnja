export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export type CompressedImage = {
  contentType: "image/jpeg";
  dataBase64: string;
};

/**
 * Downscales and re-encodes in the browser so mobile users on slow 4G upload
 * a few hundred KB instead of a 6 MB camera original.
 */
export async function compressImage(file: File): Promise<CompressedImage> {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error("UNSUPPORTED_TYPE");
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error("TOO_LARGE");
  }

  const bitmap = await createImageBitmap(file);
  const maxDim = 1600;
  const scale = Math.min(1, maxDim / Math.max(bitmap.width, bitmap.height));
  const width = Math.round(bitmap.width * scale);
  const height = Math.round(bitmap.height * scale);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("CANVAS_UNAVAILABLE");
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob: Blob = await new Promise((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("COMPRESSION_FAILED"))),
      "image/jpeg",
      0.85
    );
  });

  const bytes = new Uint8Array(await blob.arrayBuffer());
  let binary = "";
  for (let i = 0; i < bytes.length; i += 1) {
    binary += String.fromCharCode(bytes[i]!);
  }

  return { contentType: "image/jpeg", dataBase64: btoa(binary) };
}
