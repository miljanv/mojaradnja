"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { updateKmsSettings } from "@/lib/actions/kms";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

type Props = {
  shopId: string;
  kmsPublicEnabled: boolean;
  purchaseUrl: string;
  instagramUsername: string;
};

export function KmsSettingsForm({ shopId, ...initial }: Props) {
  const [enabled, setEnabled] = useState(initial.kmsPublicEnabled);
  const [purchaseUrl, setPurchaseUrl] = useState(initial.purchaseUrl);
  const [instagram, setInstagram] = useState(initial.instagramUsername);
  const [pending, startTransition] = useTransition();

  function save() {
    startTransition(async () => {
      const result = await updateKmsSettings(shopId, {
        kmsPublicEnabled: enabled,
        purchaseUrl,
        instagramUsername: instagram,
      });
      if (!result.success) {
        toast.error(result.error);
        return;
      }
      toast.success("Podešavanja sačuvana");
    });
  }

  return (
    <div className="space-y-5 rounded-xl border border-black/5 bg-white p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Javna KakoMiStoji stranica</p>
          <p className="text-sm text-muted-foreground">
            Isključi ako privremeno ne želiš da primaš probe.
          </p>
        </div>
        <Switch checked={enabled} disabled={pending} onCheckedChange={setEnabled} />
      </div>

      <div>
        <Label htmlFor="kms-purchase-url">Link za kupovinu</Label>
        <Input
          id="kms-purchase-url"
          type="url"
          inputMode="url"
          placeholder="https://instagram.com/tvojshop ili link ka webshopu"
          value={purchaseUrl}
          onChange={(e) => setPurchaseUrl(e.target.value)}
        />
        <p className="mt-1.5 text-xs text-muted-foreground">
          Gde vodi dugme &bdquo;Kupi ovaj komad&ldquo;. Ako ostaviš prazno,
          koristi se tvoj Instagram profil.
        </p>
      </div>

      <div>
        <Label htmlFor="kms-instagram">Instagram korisničko ime</Label>
        <Input
          id="kms-instagram"
          placeholder="tvojshop"
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
        />
      </div>

      <Button type="button" disabled={pending} onClick={save}>
        Sačuvaj
      </Button>
    </div>
  );
}
