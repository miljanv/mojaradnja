import { ShoppingBag } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  /** dark = for light backgrounds, light = for dark sidebars */
  variant?: "dark" | "light";
};

export function BrandMark({
  className,
  variant = "dark",
}: {
  className?: string;
  variant?: "dark" | "light";
}) {
  return (
    <span
      className={cn(
        "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl",
        variant === "light" ? "bg-[#E85A6B]" : "bg-[#E85A6B]",
        className
      )}
      aria-hidden
    >
      <ShoppingBag className="h-[55%] w-[55%] text-white" strokeWidth={2.25} />
    </span>
  );
}

export function BrandLogo({
  className,
  iconClassName,
  showWordmark = true,
  wordmarkClassName,
  variant = "dark",
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <BrandMark
        variant={variant}
        className={cn("h-8 w-8 rounded-lg", iconClassName)}
      />
      {showWordmark && (
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            variant === "light" ? "text-white" : "text-[#111111]",
            wordmarkClassName
          )}
        >
          Moj<span className="text-[#E85A6B]">Shop</span>
        </span>
      )}
    </span>
  );
}

export const BRAND_NAME = "MojShop";
export const BRAND_DOMAIN = "mojshop.app";
export const BRAND = {
  cream: "#FDF8F5",
  creamDark: "#F7F0EA",
  coral: "#E85A6B",
  coralDark: "#D44558",
  ink: "#111111",
  muted: "#6B7280",
} as const;
