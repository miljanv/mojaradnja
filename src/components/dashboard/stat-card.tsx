import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  trend?: string;
  className?: string;
  accent?: "pink" | "blue" | "green" | "amber" | "purple" | "slate";
  /** Use for money / long values — smaller, wrapping-safe typography */
  compactValue?: boolean;
};

const accentStyles = {
  pink: "border-pink-100 bg-gradient-to-br from-pink-50 to-white",
  blue: "border-sky-100 bg-gradient-to-br from-sky-50 to-white",
  green: "border-emerald-100 bg-gradient-to-br from-emerald-50 to-white",
  amber: "border-amber-100 bg-gradient-to-br from-amber-50 to-white",
  purple: "border-violet-100 bg-gradient-to-br from-violet-50 to-white",
  slate: "border-slate-200 bg-gradient-to-br from-slate-50 to-white",
};

const iconStyles = {
  pink: "bg-pink-100 text-pink-600",
  blue: "bg-sky-100 text-sky-600",
  green: "bg-emerald-100 text-emerald-600",
  amber: "bg-amber-100 text-amber-600",
  purple: "bg-violet-100 text-violet-600",
  slate: "bg-slate-100 text-slate-600",
};

function valueSizeClass(value: string | number, compactValue?: boolean) {
  const text = String(value);
  if (compactValue || text.length > 10) {
    if (text.length > 16) return "text-lg sm:text-xl";
    return "text-xl sm:text-2xl";
  }
  if (text.length > 6) return "text-2xl";
  return "text-3xl";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  className,
  accent = "slate",
  compactValue,
}: StatCardProps) {
  return (
    <Card
      className={cn(
        "min-w-0 overflow-hidden border shadow-sm",
        accentStyles[accent],
        className
      )}
    >
      <CardContent className="flex h-full min-w-0 flex-col gap-3 p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <p className="min-w-0 text-sm font-medium leading-snug text-muted-foreground">
            {title}
          </p>
          {Icon && (
            <div className={cn("shrink-0 rounded-lg p-2", iconStyles[accent])}>
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>

        <div className="mt-auto min-w-0">
          <p
            title={String(value)}
            className={cn(
              "min-w-0 font-bold tracking-tight text-slate-900 break-words [overflow-wrap:anywhere] tabular-nums leading-tight",
              valueSizeClass(value, compactValue)
            )}
          >
            {value}
          </p>
          {(subtitle || trend) && (
            <p className="mt-1.5 text-xs text-muted-foreground">
              {trend && <span className="font-medium text-emerald-600">{trend} </span>}
              {subtitle}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
