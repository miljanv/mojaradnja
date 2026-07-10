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

export const PRIMARY_COLOR_PRESETS = [
  "#E85A6B",
  "#E91E8C",
  "#111111",
  "#2563EB",
  "#059669",
  "#7C3AED",
  "#C2410C",
  "#0F766E",
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

/** Filled CTA — overrides shadcn hover so text stays white */
export const shopBtnPrimary =
  "bg-[var(--shop-primary)] text-white hover:!bg-[var(--shop-primary-hover)] hover:!text-white focus-visible:ring-[var(--shop-primary)]/40";

/** Outline CTA — color via classes (not inline) so hover:text-white works */
export const shopBtnOutline =
  "border border-[var(--shop-primary)] bg-transparent text-[var(--shop-primary)] transition-colors hover:bg-[var(--shop-primary)] hover:!text-white hover:border-[var(--shop-primary)]";

export type VariantAttribute = { label: string; value: string };

function collectVariantAttributes(variant: {
  size?: string | null;
  color?: string | null;
  optionLabel?: string | null;
  optionValue?: string | null;
  attributes?: unknown;
}): VariantAttribute[] {
  const attrs: VariantAttribute[] = [];
  const seen = new Set<string>();

  function push(label: string, value: string) {
    const key = `${label.trim().toLowerCase()}::${value.trim().toLowerCase()}`;
    if (!label.trim() || !value.trim() || seen.has(key)) return;
    seen.add(key);
    attrs.push({ label: label.trim(), value: value.trim() });
  }

  if (variant.attributes && Array.isArray(variant.attributes)) {
    for (const a of variant.attributes as VariantAttribute[]) {
      if (a?.label && a?.value) push(a.label, a.value);
    }
  }

  // Legacy columns — only if not already present in attributes JSON
  if (variant.optionLabel && variant.optionValue) {
    push(variant.optionLabel, variant.optionValue);
  }
  if (variant.size) push("Veličina", variant.size);
  if (variant.color) push("Boja", variant.color);

  return attrs;
}

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
  return collectVariantAttributes(variant)
    .map((a) => `${a.label}: ${a.value}`)
    .join(" · ");
}

export function getVariantDisplayValue(variant: {
  optionLabel?: string | null;
  optionValue?: string | null;
  size?: string | null;
  color?: string | null;
  attributes?: unknown;
}): string {
  const attrs = collectVariantAttributes(variant);
  if (attrs.length === 0) return "Standard";
  // Short label for selects: prefer value when single attr, else "label: value"
  if (attrs.length === 1) {
    return attrs[0].value;
  }
  return attrs.map((a) => a.value).join(" / ");
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

export function normalizeHex(hex: string): string {
  const h = hex.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(h)) return h.toUpperCase();
  if (/^#[0-9A-Fa-f]{3}$/.test(h)) {
    const [, r, g, b] = h;
    return `#${r}${r}${g}${g}${b}${b}`.toUpperCase();
  }
  return h;
}

function hexToLuminance(hex: string): number {
  const c = normalizeHex(hex).replace("#", "");
  if (c.length !== 6) return 1;
  const r = parseInt(c.slice(0, 2), 16) / 255;
  const g = parseInt(c.slice(2, 4), 16) / 255;
  const b = parseInt(c.slice(4, 6), 16) / 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

export function isDarkBackground(color: string): boolean {
  return hexToLuminance(color) < 0.45;
}

export function darkenHex(hex: string, amount = 0.14): string {
  const c = normalizeHex(hex).replace("#", "");
  if (c.length !== 6) return hex;
  const channel = (start: number) =>
    Math.max(0, Math.round(parseInt(c.slice(start, start + 2), 16) * (1 - amount)))
      .toString(16)
      .padStart(2, "0");
  return `#${channel(0)}${channel(2)}${channel(4)}`.toUpperCase();
}

function withAlpha(hex: string, alpha = "22"): string {
  const n = normalizeHex(hex);
  return n.length === 7 ? `${n}${alpha}` : hex;
}

export type ShopThemeInput = {
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  fontFamily: string;
};

export function getShopThemeVars(shop: ShopThemeInput): Record<string, string> {
  const dark = isDarkBackground(shop.backgroundColor);
  const primary = normalizeHex(shop.primaryColor);
  return {
    "--shop-primary": primary,
    "--shop-primary-hover": darkenHex(primary),
    "--shop-primary-muted": withAlpha(primary, "22"),
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
  const attrs = collectVariantAttributes(v);
  return attrs.length ? attrs : [{ label: "", value: "" }];
}

/**
 * If a single variant row stores multiple values of the same attribute
 * (e.g. Zapremina 1L + 500ml), treat them as separate variants.
 */
export function expandCollapsedVariants<
  T extends {
    id?: string;
    attributes?: VariantAttribute[] | unknown;
    optionLabel?: string | null;
    optionValue?: string | null;
    size?: string | null;
    color?: string | null;
  },
>(variants: T[]): Array<Omit<T, "attributes" | "id"> & { id?: string; attributes: VariantAttribute[] }> {
  return variants.flatMap((variant) => {
    const attrs = collectVariantAttributes(variant);
    if (attrs.length <= 1) {
      return [
        {
          ...variant,
          id: variant.id,
          attributes: attrs.length ? attrs : [{ label: "", value: "" }],
        },
      ];
    }

    const labels = new Set(attrs.map((a) => a.label.toLowerCase()));
    if (labels.size !== 1) {
      return [{ ...variant, id: variant.id, attributes: attrs }];
    }

    return attrs.map((attr) => ({
      ...variant,
      // Force new DB rows on next save for split copies
      id: undefined,
      attributes: [attr],
      optionLabel: attr.label,
      optionValue: attr.value,
      size: null,
      color: null,
    }));
  });
}

export function variantNeedsExpand(variant: {
  attributes?: unknown;
  optionLabel?: string | null;
  optionValue?: string | null;
  size?: string | null;
  color?: string | null;
}): boolean {
  const attrs = collectVariantAttributes(variant);
  if (attrs.length <= 1) return false;
  return new Set(attrs.map((a) => a.label.toLowerCase())).size === 1;
}

export function getProductCardColor(index: number, fallback: string): string {
  return CARD_COLOR_PRESETS[index % CARD_COLOR_PRESETS.length] ?? fallback;
}
