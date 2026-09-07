import { Platform } from "react-native";
import { API_URL } from "./config";

export type MobileUser = { id: string; phone: string; credits: number };

export type PickedImage = {
  uri: string;
  mimeType?: string | null;
  fileName?: string | null;
};

async function json<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      (data as { message?: string }).message ||
      (data as { error?: string }).error ||
      `Greška (${res.status})`;
    throw new ApiError(message, (data as { error?: string }).error, res.status);
  }
  return data as T;
}

export class ApiError extends Error {
  code?: string;
  status: number;
  constructor(message: string, code: string | undefined, status: number) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export async function requestOtp(phone: string) {
  const res = await fetch(`${API_URL}/api/mobile/auth/request-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone }),
  });
  return json<{ ok: boolean; devCode?: string }>(res);
}

export async function verifyOtp(phone: string, code: string) {
  const res = await fetch(`${API_URL}/api/mobile/auth/verify-otp`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone, code }),
  });
  return json<{ token: string; user: MobileUser }>(res);
}

export async function fetchMe(token: string) {
  const res = await fetch(`${API_URL}/api/mobile/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return json<{ user: MobileUser }>(res);
}

export async function purchaseCredits(
  token: string,
  body: { productId?: string; credits?: number }
) {
  const res = await fetch(`${API_URL}/api/mobile/credits/purchase`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });
  return json<{ ok: boolean; added: number; credits: number }>(res);
}

/** Build a FormData part for an image that works on web + native. */
async function appendImage(
  form: FormData,
  field: string,
  image: PickedImage
) {
  const name = image.fileName || `${field}.jpg`;
  const type = image.mimeType || "image/jpeg";
  if (Platform.OS === "web") {
    const blob = await (await fetch(image.uri)).blob();
    form.append(field, blob, name);
  } else {
    // React Native FormData file shape.
    form.append(field, { uri: image.uri, name, type } as unknown as Blob);
  }
}

export async function runTryOn(
  token: string,
  args: {
    person: PickedImage;
    garment: PickedImage;
    category: string;
    garmentPhotoType?: string;
  }
) {
  const form = new FormData();
  await appendImage(form, "person", args.person);
  await appendImage(form, "garment", args.garment);
  form.append("category", args.category);
  form.append("garmentPhotoType", args.garmentPhotoType || "flat-lay");

  const res = await fetch(`${API_URL}/api/mobile/try-on`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  });
  return json<{
    id: string;
    status: string;
    provider: string;
    resultImageUrl: string;
    credits: number;
  }>(res);
}
