"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Sparkles, Loader2, X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ALLOWED_IMAGE_TYPES, compressImage } from "@/lib/try-on/compress-image";

type Step =
  | "INSTRUCTIONS"
  | "SELECT_PHOTO"
  | "CONFIRM"
  | "UPLOADING"
  | "PROCESSING"
  | "COMPLETED"
  | "ERROR"
  | "NO_CREDITS";

type Props = {
  shopSlug: string;
  productId: string;
  productName: string;
  garmentImageUrl: string;
  primaryColor?: string;
};

const ALLOWED = ALLOWED_IMAGE_TYPES;

/** The shared compressor throws stable codes; this modal shows Serbian copy. */
function compressErrorMessage(code: string): string {
  switch (code) {
    case "UNSUPPORTED_TYPE":
      return "Fotografija nije podržana. Izaberite JPEG, PNG ili WebP.";
    case "TOO_LARGE":
      return "Fotografija je prevelika (max 10 MB).";
    default:
      return "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije.";
  }
}

export function TryOnButton({
  shopSlug,
  productId,
  productName,
  garmentImageUrl,
  primaryColor = "#E85A6B",
}: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        variant="outline"
        className="w-full border-[var(--shop-primary)] text-[var(--shop-primary)] hover:bg-[var(--shop-primary)] hover:text-white"
        style={{ borderColor: primaryColor, color: primaryColor }}
        onClick={() => setOpen(true)}
      >
        <Sparkles className="mr-2 h-4 w-4" />
        Probaj na sebi
      </Button>
      <TryOnModal
        open={open}
        onOpenChange={setOpen}
        shopSlug={shopSlug}
        productId={productId}
        productName={productName}
        garmentImageUrl={garmentImageUrl}
      />
    </>
  );
}

function TryOnModal({
  open,
  onOpenChange,
  shopSlug,
  productId,
  productName,
  garmentImageUrl,
}: Props & { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [step, setStep] = useState<Step>("INSTRUCTIONS");
  const [consent, setConsent] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [slowHint, setSlowHint] = useState(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const slowRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idempotencyRef = useRef<string>("");

  const reset = useCallback(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (slowRef.current) clearTimeout(slowRef.current);
    setStep("INSTRUCTIONS");
    setConsent(false);
    setPreviewUrl(null);
    setFile(null);
    setResultUrl(null);
    setErrorMessage("");
    setSlowHint(false);
    idempotencyRef.current = "";
  }, []);

  useEffect(() => {
    if (!open) return;
    void fetch("/api/try-on/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopSlug,
        productId,
        type: "TRY_ON_OPENED",
      }),
    });
  }, [open, shopSlug, productId]);

  function handleOpenChange(next: boolean) {
    if (!next) reset();
    onOpenChange(next);
  }

  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (slowRef.current) clearTimeout(slowRef.current);
    };
  }, []);

  function onPickFile(f: File | null) {
    if (!f) return;
    if (!ALLOWED.includes(f.type)) {
      setErrorMessage("Fotografija nije podržana. Izaberite JPEG, PNG ili WebP.");
      setStep("ERROR");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
    setStep("CONFIRM");
  }

  async function startGeneration() {
    if (!file || !consent) return;
    setStep("UPLOADING");
    setErrorMessage("");
    idempotencyRef.current =
      idempotencyRef.current ||
      `ito_${productId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    let compressed: Awaited<ReturnType<typeof compressImage>>;
    try {
      compressed = await compressImage(file);
    } catch (e) {
      setErrorMessage(compressErrorMessage(e instanceof Error ? e.message : ""));
      setStep("ERROR");
      return;
    }

    try {
      const uploadRes = await fetch("/api/try-on/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contentType: compressed.contentType,
          dataBase64: compressed.dataBase64,
          fileName: "person.jpg",
        }),
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) {
        if (uploadJson.error === "AI_CREDITS_EXHAUSTED") {
          setStep("NO_CREDITS");
          return;
        }
        throw new Error(uploadJson.message || "Upload nije uspeo");
      }

      setStep("PROCESSING");
      setSlowHint(false);
      slowRef.current = setTimeout(() => setSlowHint(true), 45_000);

      const jobRes = await fetch("/api/try-on/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopSlug,
          productId,
          personImageKey: uploadJson.personImageKey,
          idempotencyKey: idempotencyRef.current,
          consent: true,
        }),
      });
      const jobJson = await jobRes.json();
      if (!jobRes.ok) {
        if (jobJson.error === "AI_CREDITS_EXHAUSTED") {
          setStep("NO_CREDITS");
          return;
        }
        throw new Error(jobJson.message || "Kreiranje posla nije uspelo");
      }

      const jobId = jobJson.jobId as string;
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await fetch(`/api/try-on/jobs/${jobId}`);
          const statusJson = await statusRes.json();
          if (!statusRes.ok) {
            throw new Error(statusJson.message || "Status check failed");
          }
          if (statusJson.status === "COMPLETED") {
            if (pollRef.current) clearInterval(pollRef.current);
            if (slowRef.current) clearTimeout(slowRef.current);
            setResultUrl(statusJson.resultImageUrl);
            setStep("COMPLETED");
          } else if (statusJson.status === "FAILED") {
            if (pollRef.current) clearInterval(pollRef.current);
            if (slowRef.current) clearTimeout(slowRef.current);
            setErrorMessage(
              statusJson.errorMessage ||
                "Generisanje nije uspelo. Kredit nije potrošen."
            );
            setStep("ERROR");
          }
        } catch (e) {
          if (pollRef.current) clearInterval(pollRef.current);
          setErrorMessage(
            e instanceof Error
              ? e.message
              : "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije."
          );
          setStep("ERROR");
        }
      }, 2500);
    } catch (e) {
      setErrorMessage(
        e instanceof Error
          ? e.message
          : "Virtualno probavanje trenutno nije dostupno. Pokušajte ponovo kasnije."
      );
      setStep("ERROR");
    }
  }

  function continueOrder() {
    void fetch("/api/try-on/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        shopSlug,
        productId,
        type: "ORDER_STARTED_AFTER_TRY_ON",
      }),
    });
    handleOpenChange(false);
    document
      .getElementById("product-order-form")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#E85A6B]" />
            Probaj na sebi
          </DialogTitle>
        </DialogHeader>

        <p className="text-sm text-muted-foreground">{productName}</p>

        {step === "INSTRUCTIONS" && (
          <div className="space-y-4">
            <p className="text-sm font-medium">Za najbolji rezultat:</p>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              <li>fotografišite se spreda;</li>
              <li>za haljinu koristite fotografiju celog tela;</li>
              <li>za majicu ili sako koristite fotografiju najmanje do kukova;</li>
              <li>koristite dobro osvetljenje;</li>
              <li>ruke neka ne prekrivaju odeću;</li>
              <li>izbegavajte široku postojeću odeću, torbe i jakne.</li>
            </ul>
            <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">
              AI rezultat je vizuelna simulacija i ne predstavlja garanciju veličine,
              kroja ili fizičkog pristajanja odeće.
            </p>
            <Button className="w-full" onClick={() => setStep("SELECT_PHOTO")}>
              Nastavi
            </Button>
          </div>
        )}

        {step === "SELECT_PHOTO" && (
          <div className="space-y-4">
            <Label htmlFor="try-on-file">Uploadujte svoju fotografiju</Label>
            <input
              id="try-on-file"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="block w-full text-sm"
              onChange={(e) => onPickFile(e.target.files?.[0] ?? null)}
            />
            <Button variant="outline" className="w-full" onClick={() => setStep("INSTRUCTIONS")}>
              Nazad
            </Button>
          </div>
        )}

        {step === "CONFIRM" && (
          <div className="space-y-4">
            {previewUrl && (
              <div className="relative mx-auto aspect-[3/4] w-48 overflow-hidden rounded-lg ring-1 ring-black/10">
                <Image src={previewUrl} alt="Pregled" fill className="object-cover" unoptimized />
              </div>
            )}
            <div className="flex items-start gap-2">
              <Checkbox
                id="consent"
                checked={consent}
                onCheckedChange={(v) => setConsent(v === true)}
              />
              <Label htmlFor="consent" className="text-xs leading-relaxed font-normal">
                Saglasan/na sam da se moja fotografija privremeno obradi radi kreiranja AI
                prikaza. Fotografija se automatski briše nakon završetka definisanog perioda
                čuvanja.
              </Label>
            </div>
            <p className="text-xs text-muted-foreground">
              AI rezultat je vizuelna simulacija i ne predstavlja garanciju veličine, kroja
              ili fizičkog pristajanja odeće.
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep("SELECT_PHOTO")}
              >
                Nazad
              </Button>
              <Button
                className="flex-1"
                disabled={!consent}
                onClick={() => void startGeneration()}
              >
                Generiši
              </Button>
            </div>
          </div>
        )}

        {(step === "UPLOADING" || step === "PROCESSING") && (
          <div className="flex flex-col items-center gap-3 py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#E85A6B]" />
            <p className="text-sm font-medium">
              {step === "UPLOADING" ? "Pripremamo fotografiju…" : "AI obrađuje prikaz…"}
            </p>
            {slowHint && (
              <p className="text-xs text-muted-foreground">
                Obrada traje malo duže nego obično. Možete sačekati ili zatvoriti prozor.
              </p>
            )}
          </div>
        )}

        {step === "COMPLETED" && resultUrl && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-1 text-xs text-muted-foreground">Proizvod</p>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-black/10">
                  <Image
                    src={garmentImageUrl}
                    alt="Proizvod"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
              <div>
                <p className="mb-1 text-xs text-muted-foreground">AI rezultat</p>
                <div className="relative aspect-[3/4] overflow-hidden rounded-lg ring-1 ring-black/10">
                  <Image
                    src={resultUrl}
                    alt="Rezultat"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
              </div>
            </div>
            <Button className="w-full" onClick={continueOrder}>
              Nastavi sa porudžbinom
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => handleOpenChange(false)}>
              Zatvori
            </Button>
          </div>
        )}

        {step === "NO_CREDITS" && (
          <div className="space-y-3 py-4 text-center">
            <p className="text-sm">Shop trenutno nema dostupnih AI kredita.</p>
            <Button variant="outline" onClick={() => handleOpenChange(false)}>
              Zatvori
            </Button>
          </div>
        )}

        {step === "ERROR" && (
          <div className="space-y-3 py-4 text-center">
            <X className="mx-auto h-8 w-8 text-red-500" />
            <p className="text-sm">{errorMessage}</p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setStep("SELECT_PHOTO");
                  setErrorMessage("");
                  idempotencyRef.current = "";
                }}
              >
                Pokušaj ponovo
              </Button>
              <Button className="flex-1" onClick={() => handleOpenChange(false)}>
                Zatvori
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function tryOnEligibleClient(flags: {
  shopEnabled: boolean;
  productEnabled: boolean;
  aiCredits: number;
  category: string | null;
  photoType: string | null;
  garmentKey: string | null;
  isActive: boolean;
}) {
  return (
    flags.shopEnabled &&
    flags.productEnabled &&
    flags.aiCredits > 0 &&
    !!flags.category &&
    !!flags.photoType &&
    !!flags.garmentKey &&
    flags.isActive
  );
}
