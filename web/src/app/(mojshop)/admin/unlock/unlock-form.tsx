"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { unlockAdminPanel } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AdminUnlockForm() {
  const t = useTranslations("admin");
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await unlockAdminPanel(password);
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-slate-300">
          {t("password")}
        </Label>
        <Input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="border-slate-700 bg-slate-950 text-white"
          autoFocus
          required
        />
      </div>
      <Button
        type="submit"
        disabled={pending}
        className="w-full bg-rose-600 hover:bg-rose-500"
      >
        {t("unlock")}
      </Button>
    </form>
  );
}
