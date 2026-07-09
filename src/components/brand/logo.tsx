import { Store } from "lucide-react";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  className?: string;
  iconClassName?: string;
  showWordmark?: boolean;
  wordmarkClassName?: string;
  /** dark = for light backgrounds, light = for dark sidebars */
  variant?: "dark" | "light";
};

export function BrandLogo({
  className,
  iconClassName,
  showWordmark = true,
  wordmarkClassName,
  variant = "dark",
}: BrandLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Store
        className={cn(
          "h-5 w-5 shrink-0",
          variant === "light" ? "text-rose-400" : "text-rose-500",
          iconClassName
        )}
        aria-hidden
      />
      {showWordmark && (
        <span
          className={cn(
            "text-lg font-bold tracking-tight",
            variant === "light" ? "text-white" : "text-slate-900",
            wordmarkClassName
          )}
        >
          Moja<span className="text-rose-500">Radnja</span>
        </span>
      )}
    </span>
  );
}

export const BRAND_NAME = "MojaRadnja";
