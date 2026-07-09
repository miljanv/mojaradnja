export const SHOP_FONTS = [
  { id: "roboto", label: "Roboto", google: "Roboto" },
  { id: "inter", label: "Inter (moderno)", google: "Inter" },
  { id: "playfair", label: "Playfair Display (elegantno)", google: "Playfair+Display" },
  { id: "dm-sans", label: "DM Sans (čisto)", google: "DM+Sans" },
  { id: "montserrat", label: "Montserrat (bold)", google: "Montserrat" },
  { id: "poppins", label: "Poppins (friendly)", google: "Poppins" },
  { id: "lora", label: "Lora (klasično)", google: "Lora" },
  { id: "space-grotesk", label: "Space Grotesk (tech)", google: "Space+Grotesk" },
] as const;

export type ShopFontId = (typeof SHOP_FONTS)[number]["id"];

export const VARIANT_PRESETS = [
  {
    label: "Veličina",
    values: ["XS", "S", "M", "L", "XL", "XXL", "XXXL"],
  },
  {
    label: "Boja",
    values: ["Crna", "Bela", "Bež", "Siva", "Crvena", "Plava", "Zelena"],
  },
  {
    label: "Težina",
    values: ["50g", "100g", "250g", "500g", "750g", "1kg"],
  },
  {
    label: "Zapremina",
    values: ["50ml", "100ml", "250ml", "500ml", "750ml", "1L"],
  },
  {
    label: "Broj (obuća)",
    values: ["36", "37", "38", "39", "40", "41", "42", "43", "44"],
  },
  {
    label: "Pakovanje",
    values: ["1 kom", "3 kom", "5 kom", "10 kom"],
  },
] as const;

export const CARD_COLOR_PRESETS = [
  "#FEF9E7",
  "#FDF2F2",
  "#EFF6FF",
  "#F0FDF4",
  "#FAF5FF",
  "#FFF7ED",
  "#F5F5F4",
  "#FFFFFF",
] as const;

export const BACKGROUND_PRESETS = [
  "#FAFAFA",
  "#FFFFFF",
  "#FFF8F0",
  "#F8FAFC",
  "#FDF4FF",
  "#0F172A",
  "#18181B",
  "#1A1A2E",
] as const;

export type VariantAttribute = { label: string; value: string };

export function formatVariantAttributes(
  variant: {
    size?: string | null;
    color?: string | null;
    optionLabel?: string | null;
    optionValue?: string | null;
    attributes?: unknown;
  } | null | undefined
): string {
  if (!variant) return "";

  const attrs: VariantAttribute[] = [];

  if (variant.attributes && Array.isArray(variant.attributes)) {
    for (const a of variant.attributes as VariantAttribute[]) {
      if (a?.label && a?.value) attrs.push(a);
    }
  }

  if (variant.optionLabel && variant.optionValue) {
    attrs.push({ label: variant.optionLabel, value: variant.optionValue });
  }
  if (variant.size) attrs.push({ label: "Veličina", value: variant.size });
  if (variant.color) attrs.push({ label: "Boja", value: variant.color });

  return attrs.map((a) => `${a.label}: ${a.value}`).join(" · ");
}

export function getVariantDisplayValue(variant: {
  optionLabel?: string | null;
  optionValue?: string | null;
  size?: string | null;
  color?: string | null;
  attributes?: unknown;
}): string {
  const formatted = formatVariantAttributes(variant);
  return formatted || "Standard";
}

const FONT_CSS: Record<ShopFontId, string> = {
  roboto: "'Roboto', system-ui, sans-serif",
  inter: "'Inter', system-ui, sans-serif",
  playfair: "'Playfair Display', Georgia, serif",
  "dm-sans": "'DM Sans', system-ui, sans-serif",
  montserrat: "'Montserrat', system-ui, sans-serif",
  poppins: "'Poppins', system-ui, sans-serif",
  lora: "'Lora', Georgia, serif",
  "space-grotesk": "'Space Grotesk', system-ui, sans-serif",
};

export function getFontGoogleUrl(fontId: string): string | null {
  const font = SHOP_FONTS.find((f) => f.id === fontId);
  if (!font) return null;
  return `https://fonts.googleapis.com/css2?family=${font.google}:wght@400;500;600;700&display=swap`;
}

export function getFontCssFamily(fontId: string): string {
  return FONT_CSS[fontId as ShopFontId] ?? FONT_CSS.roboto;
}

function hexToLuminance(hex: string): number {
  const c = hex.replace("#", "");
  if (c.length !== 6) return 1;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isDarkBackground(color: string): boolean {
  return hexToLuminance(color) < 0.45;
}

export type ShopThemeInput = {
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  fontFamily: string;
};

export function getShopThemeVars(shop: ShopThemeInput): Record<string, string> {
  const dark = isDarkBackground(shop.backgroundColor);
  return {
    "--shop-primary": shop.primaryColor,
    "--shop-primary-muted": `${shop.primaryColor}22`,
    "--shop-bg": shop.backgroundColor,
    "--shop-card": shop.cardColor,
    "--shop-text": dark ? "#F8FAFC" : "#0F172A",
    "--shop-text-muted": dark ? "#94A3B8" : "#64748B",
    "--shop-border": dark ? "#334155" : "#E2E8F0",
    "--shop-font": getFontCssFamily(shop.fontFamily),
  };
}

export function parseVariantAttributesFromDb(v: {
  size?: string | null;
  color?: string | null;
  optionLabel?: string | null;
  optionValue?: string | null;
  attributes?: unknown;
}): VariantAttribute[] {
  const attrs: VariantAttribute[] = [];

  if (v.attributes && Array.isArray(v.attributes)) {
    for (const a of v.attributes as VariantAttribute[]) {
      if (a?.label || a?.value) attrs.push({ label: a.label ?? "", value: a.value ?? "" });
    }
  }
  if (v.optionLabel || v.optionValue) {
    attrs.push({ label: v.optionLabel ?? "", value: v.optionValue ?? "" });
  }
  if (v.size) attrs.push({ label: "Veličina", value: v.size });
  if (v.color) attrs.push({ label: "Boja", value: v.color });

  return attrs.length ? attrs : [{ label: "", value: "" }];
}

export function getProductCardColor(index: number, fallback: string): string {
  return CARD_COLOR_PRESETS[index % CARD_COLOR_PRESETS.length] ?? fallback;
}
