"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { extendUserSubscription } from "@/lib/actions/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function AdminExtendForm({ userId }: { userId: string }) {
  const t = useTranslations("admin");
  const router = useRouter();
  const [days, setDays] = useState("30");
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const result = await extendUserSubscription(userId, parseInt(days, 10));
      if (result.success) {
        toast.success(t("extended"));
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <Card className="w-full max-w-xs">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">{t("extend")}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="days">{t("days")}</Label>
            <Input
              id="days"
              type="number"
              min={1}
              max={3650}
              value={days}
              onChange={(e) => setDays(e.target.value)}
              className="w-24"
            />
          </div>
          <Button type="submit" disabled={pending} className="bg-pink-500 hover:bg-pink-600">
            {t("extend")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
