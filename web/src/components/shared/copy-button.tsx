"use client";

import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

type CopyButtonProps = {
  text: string;
  label?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
};

export function CopyButton({ text, label, variant = "outline" }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);
  const t = useTranslations("common");

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t("copied"));
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Button variant={variant} size="sm" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
      {label ?? t("copy")}
    </Button>
  );
}
