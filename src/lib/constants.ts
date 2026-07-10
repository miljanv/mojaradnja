export const RESERVED_ROUTES = [
  "dashboard",
  "admin",
  "invite",
  "api",
  "sign-in",
  "sign-up",
  "en",
  "_next",
  "favicon.ico",
  "onboarding",
] as const;

export const TRIAL_DAYS = 30;

export const DEFAULT_PRIMARY_COLOR = "#E85A6B";

export const ORDER_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  CONFIRMED: "bg-indigo-100 text-indigo-800",
  WAITING_PAYMENT: "bg-yellow-100 text-yellow-800",
  PACKED: "bg-orange-100 text-orange-800",
  SHIPPED: "bg-cyan-100 text-cyan-800",
  DELIVERED: "bg-green-100 text-green-800",
  CANCELLED: "bg-gray-100 text-gray-800",
  RETURNED: "bg-red-100 text-red-800",
  EXCHANGE_IN_PROGRESS: "bg-purple-100 text-purple-800",
};

export const EXCHANGE_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  WAITING_CUSTOMER_RETURN: "bg-yellow-100 text-yellow-800",
  RECEIVED_RETURN: "bg-orange-100 text-orange-800",
  NEW_ITEM_SENT: "bg-cyan-100 text-cyan-800",
  COMPLETED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export const COMPLAINT_STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-100 text-blue-800",
  REVIEWING: "bg-yellow-100 text-yellow-800",
  APPROVED: "bg-green-100 text-green-800",
  REJECTED: "bg-red-100 text-red-800",
  REFUNDED: "bg-purple-100 text-purple-800",
  REPLACED: "bg-cyan-100 text-cyan-800",
  CLOSED: "bg-gray-100 text-gray-800",
};

export const SOURCE_ICONS: Record<string, string> = {
  INSTAGRAM_DM: "📸",
  VIBER: "💬",
  WHATSAPP: "📱",
  PHONE: "📞",
  MANUAL: "✏️",
  MINI_SHOP: "🛍️",
};
