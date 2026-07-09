"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createShop } from "@/lib/actions/shop";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { BrandLogo } from "@/components/brand/logo";

export function OnboardingForm() {
  const t = useTranslations("onboarding");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createShop({
        name: form.get("name") as string,
        slug: form.get("slug") as string,
        description: (form.get("description") as string) || undefined,
        instagramUsername: (form.get("instagram") as string) || undefined,
      });

      if (result.success) {
        toast.success("Prodavnica kreirana!");
        router.push("/dashboard");
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <BrandLogo className="mx-auto mb-4 justify-center" iconClassName="h-6 w-6" />
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Naziv prodavnice</Label>
              <Input id="name" name="name" required placeholder="Butik Mila" />
            </div>
            <div>
              <Label htmlFor="slug">URL slug</Label>
              <Input id="slug" name="slug" required placeholder="butik-mila" />
              <p className="mt-1 text-xs text-muted-foreground">
                Vaša prodavnica: domen.rs/butik-mila
              </p>
            </div>
            <div>
              <Label htmlFor="instagram">Instagram</Label>
              <Input id="instagram" name="instagram" placeholder="butik.mila" />
            </div>
            <div>
              <Label htmlFor="description">Opis</Label>
              <Textarea id="description" name="description" rows={3} />
            </div>
            <Button
              type="submit"
              className="w-full bg-pink-500 hover:bg-pink-600"
              disabled={pending}
            >
              {t("createShop")}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
