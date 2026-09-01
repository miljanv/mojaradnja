"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { updateProductTryOn } from "@/lib/actions/merchant-try-on";
import type { TryOnCategory, TryOnPhotoType } from "@/lib/try-on/types";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ImageOption = { id: string; url: string };

export function ProductTryOnSettings({
  shopId,
  productId,
  shopEnabled,
  aiCredits,
  initial,
  images,
}: {
  shopId: string;
  productId: string;
  shopEnabled: boolean;
  aiCredits: number;
  images: ImageOption[];
  initial: {
    tryOnEnabled: boolean;
    tryOnCategory: string | null;
    tryOnPhotoType: string | null;
    tryOnGarmentImageKey: string | null;
  };
}) {
  const [pending, startTransition] = useTransition();
  const [enabled, setEnabled] = useState(initial.tryOnEnabled);
  const [category, setCategory] = useState<TryOnCategory | "">(
    (initial.tryOnCategory as TryOnCategory) || ""
  );
  const [photoType, setPhotoType] = useState<TryOnPhotoType | "">(
    (initial.tryOnPhotoType as TryOnPhotoType) || ""
  );
  const [garmentKey, setGarmentKey] = useState(initial.tryOnGarmentImageKey ?? "");

  if (!shopEnabled) {
    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Virtualno probavanje</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Virtual Try-On nije omogućen za ovu prodavnicu. Kontaktirajte MojShop podršku
          ako želite aktivaciju.
        </CardContent>
      </Card>
    );
  }

  function save() {
    if (enabled) {
      if (!garmentKey) {
        toast.error("Izaberite fotografiju proizvoda za AI.");
        return;
      }
      if (!category) {
        toast.error("Izaberite AI kategoriju odeće.");
        return;
      }
      if (!photoType) {
        toast.error("Izaberite tip fotografije.");
        return;
      }
    }

    startTransition(async () => {
      const result = await updateProductTryOn(shopId, productId, {
        tryOnEnabled: enabled,
        tryOnCategory: enabled ? (category as TryOnCategory) : null,
        tryOnPhotoType: enabled ? (photoType as TryOnPhotoType) : null,
        tryOnGarmentImageKey: enabled ? garmentKey : null,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Podešavanja sačuvana");
    });
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Virtualno probavanje</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {aiCredits <= 0 && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
            Virtual Try-On je pauziran jer trenutno nema dostupnih AI kredita.
          </p>
        )}

        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium">Omogući „Probaj na sebi”</p>
            <p className="text-xs text-muted-foreground">
              Preostalo AI kredita: {aiCredits}
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} disabled={pending} />
        </div>

        <div className="space-y-2">
          <Label>Fotografija proizvoda za AI</Label>
          {images.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Prvo dodajte fotografije proizvoda.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {images.map((img) => (
                <button
                  key={img.id}
                  type="button"
                  onClick={() => setGarmentKey(img.id)}
                  className={cn(
                    "relative aspect-square overflow-hidden rounded-lg border-2",
                    garmentKey === img.id
                      ? "border-[#E85A6B]"
                      : "border-transparent ring-1 ring-black/10"
                  )}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-2">
          <Label>Kategorija</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <OptionButton
              selected={category === "tops"}
              onClick={() => setCategory("tops")}
              label="Majica, bluza ili sako"
            />
            <OptionButton
              selected={category === "one-pieces"}
              onClick={() => setCategory("one-pieces")}
              label="Haljina ili kombinezon"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Tip fotografije</Label>
          <div className="grid gap-2 sm:grid-cols-2">
            <OptionButton
              selected={photoType === "model"}
              onClick={() => setPhotoType("model")}
              label="Proizvod je na modelu"
            />
            <OptionButton
              selected={photoType === "flat-lay"}
              onClick={() => setPhotoType("flat-lay")}
              label="Flat-lay / proizvod je fotografisan samostalno"
            />
          </div>
        </div>

        <Button type="button" onClick={save} disabled={pending}>
          Sačuvaj Virtual Try-On
        </Button>
      </CardContent>
    </Card>
  );
}

function OptionButton({
  selected,
  onClick,
  label,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
        selected
          ? "border-[#E85A6B] bg-[#E85A6B]/10"
          : "border-black/10 hover:bg-black/[0.02]"
      )}
    >
      {label}
    </button>
  );
}
