import { Platform } from "react-native";

/**
 * Base URL of the "Probaj" backend (the MojShop Next.js app).
 * Override with EXPO_PUBLIC_API_URL for physical devices / production.
 * On a physical device, localhost points at the phone, so set your LAN IP.
 */
export const API_URL =
  process.env.EXPO_PUBLIC_API_URL?.replace(/\/$/, "") ||
  (Platform.OS === "android" ? "http://10.0.2.2:3000" : "http://localhost:3000");

/**
 * RevenueCat public SDK keys. When absent, the app falls back to a demo
 * purchase flow so the "1 credit = 1 try" loop works without native billing.
 */
export const REVENUECAT_IOS_KEY = process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || "";
export const REVENUECAT_ANDROID_KEY =
  process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || "";

export const CREDIT_PACKS = [
  { id: "credits_1", credits: 1, price: "149 RSD", label: "1 proba" },
  { id: "credits_5", credits: 5, price: "599 RSD", label: "5 proba", best: false },
  { id: "credits_20", credits: 20, price: "1.999 RSD", label: "20 proba", best: true },
  { id: "credits_50", credits: 50, price: "3.999 RSD", label: "50 proba" },
] as const;
