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
    tryOnSegmentationFree: boolean;
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
  const [segmentationFree, setSegmentationFree] = useState(
    initial.tryOnSegmentationFree
  );

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
        tryOnSegmentationFree: segmentationFree,
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
          <Label>Fotografija koju AI koristi</Label>
          <p className="text-xs text-muted-foreground">
            Izaberi jednu jasnu sliku komada. Ako imaš i sliku na osobi i sliku
            samog komada, bolje je slika na osobi.
          </p>
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
          <Label>Šta je na toj fotografiji?</Label>
          <p className="text-xs text-muted-foreground">
            Ovo je najvažnije za kvalitet. Ako kažeš da ima osoba, a nema je, AI
            često padne. Ako kažeš da je samo komad, a na slici je osoba, kroj
            može da se iskrivi.
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            <OptionButton
              selected={photoType === "model"}
              onClick={() => setPhotoType("model")}
              label="Osoba nosi komad"
              hint="Model, lookbook, Instagram slika sa telom. Celu odeću treba da se vidi."
            />
            <OptionButton
              selected={photoType === "flat-lay"}
              onClick={() => setPhotoType("flat-lay")}
              label="Samo komad, bez osobe"
              hint="Flat-lay, hanger ili ghost mannequin. Čista pozadina, bez etikete na vratu ako može."
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Koji deo tela pokriva?</Label>
          <p className="text-xs text-muted-foreground">
            AI mora da zna šta da zameni na kupčevoj fotografiji.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            <OptionButton
              selected={category === "tops"}
              onClick={() => setCategory("tops")}
              label="Gornji deo"
              hint="Majica, bluza, sako, duks"
            />
            <OptionButton
              selected={category === "bottoms"}
              onClick={() => setCategory("bottoms")}
              label="Donji deo"
              hint="Suknja, pantalone, šorts"
            />
            <OptionButton
              selected={category === "one-pieces"}
              onClick={() => setCategory("one-pieces")}
              label="Ceo komad"
              hint="Haljina, kombinezon"
            />
          </div>
        </div>

        <div className="flex items-start justify-between gap-3 rounded-lg border border-black/10 px-3 py-3">
          <div>
            <p className="text-sm font-medium">Prirodnije uklapanje</p>
            <p className="text-xs text-muted-foreground">
              Uključeno je bolje za sako, duks i obimniji kroj. Isključi samo ako
              na rezultatu ostane odeća koju kupac već nosi.
            </p>
          </div>
          <Switch
            checked={segmentationFree}
            onCheckedChange={setSegmentationFree}
            disabled={pending}
          />
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
  hint,
}: {
  selected: boolean;
  onClick: () => void;
  label: string;
  hint?: string;
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
      <span className="font-medium">{label}</span>
      {hint ? (
        <span className="mt-0.5 block text-xs text-muted-foreground">{hint}</span>
      ) : null}
    </button>
  );
}
