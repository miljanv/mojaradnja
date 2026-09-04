"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Check, Sparkles, X } from "lucide-react";
import { ALLOWED_IMAGE_TYPES, compressImage } from "@/lib/try-on/compress-image";
import { kmsTrack } from "@/lib/kms/analytics-client";

type Step = "photo" | "consent" | "working" | "result" | "error" | "no-credits";

type Props = {
  shopSlug: string;
  shopName: string;
  instagramUsername: string | null;
  productId: string;
  productName: string;
  garmentImageUrl: string;
  purchaseUrl: string | null;
  shareBaseUrl: string;
  shopHref: string;
  privacyHref: string;
};

const POLL_INTERVAL_MS = 2500;
const GENERATION_TIMEOUT_MS = 150_000;

const WORKING_COPY = [
  "Spremamo tvoj look ✨",
  "Uklapamo komad na tvoju fotografiju…",
  "Još samo koji trenutak…",
];

/** Never surface provider internals — everything maps to a friendly line. */
function friendlyError(code: unknown): string {
  switch (code) {
    case "RATE_LIMITED":
      return "Malo si brza za nas 🙂 Probaj ponovo za koji minut.";
    case "ACTIVE_JOB_EXISTS":
      return "Već pravimo tvoj look za ovaj komad. Sačekaj trenutak.";
    case "INVALID_IMAGE":
    case "UNSUPPORTED_TYPE":
      return "Ta fotografija nije podržana. Izaberi JPG, PNG ili WebP.";
    case "TOO_LARGE":
      return "Fotografija je prevelika. Izaberi neku do 10 MB.";
    case "TRY_ON_DISABLED":
    case "PRODUCT_NOT_ELIGIBLE":
      return "Ovaj komad trenutno nije dostupan za probu.";
    default:
      return "Nešto nije uspelo. Pokušaj ponovo — nije ti ništa naplaćeno.";
  }
}

export function KmsTryOnFlow(props: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => {
          kmsTrack("try_on_started", {
            shopSlug: props.shopSlug,
            productId: props.productId,
          });
          setOpen(true);
        }}
        className="kms-cta flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold"
      >
        <Sparkles className="h-4 w-4" />
        Probaj na sebi
      </button>

      {open && <TryOnSheet {...props} onClose={() => setOpen(false)} />}
    </>
  );
}

function TryOnSheet({
  shopSlug,
  shopName,
  instagramUsername,
  productId,
  productName,
  garmentImageUrl,
  purchaseUrl,
  shareBaseUrl,
  shopHref,
  privacyHref,
  onClose,
}: Props & { onClose: () => void }) {
  const [step, setStep] = useState<Step>("photo");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [consent, setConsent] = useState(false);
  const [copyIndex, setCopyIndex] = useState(0);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [shareToken, setShareToken] = useState<string | null>(null);
  const [errorText, setErrorText] = useState("");
  const [shareFeedback, setShareFeedback] = useState("");

  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const poll = useRef<ReturnType<typeof setInterval> | null>(null);
  const idempotency = useRef("");

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    if (poll.current) clearInterval(poll.current);
    poll.current = null;
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    const original = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = original;
    };
  }, []);

  function pickFile(next: File | null) {
    if (!next) return;
    if (!ALLOWED_IMAGE_TYPES.includes(next.type)) {
      setErrorText(friendlyError("INVALID_IMAGE"));
      setStep("error");
      return;
    }
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setFile(next);
    setPreviewUrl(URL.createObjectURL(next));
    setStep("consent");
    kmsTrack("photo_uploaded", { shopSlug, productId });
  }

  function fail(code: unknown) {
    clearTimers();
    setErrorText(friendlyError(code));
    setStep("error");
  }

  async function generate() {
    if (!file || !consent) return;

    kmsTrack("consent_given", { shopSlug, productId });
    setStep("working");
    setCopyIndex(0);
    idempotency.current =
      idempotency.current ||
      `kms_${productId}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

    timers.current.push(setTimeout(() => setCopyIndex(1), 12_000));
    timers.current.push(setTimeout(() => setCopyIndex(2), 35_000));
    timers.current.push(
      setTimeout(() => fail("TIMEOUT"), GENERATION_TIMEOUT_MS)
    );

    try {
      const compressed = await compressImage(file);

      const uploadRes = await fetch("/api/try-on/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...compressed, fileName: "person.jpg" }),
      });
      const uploadJson = await uploadRes.json();
      if (!uploadRes.ok) return fail(uploadJson.error);

      const jobRes = await fetch("/api/try-on/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shopSlug,
          productId,
          personImageKey: uploadJson.personImageKey,
          idempotencyKey: idempotency.current,
          consent: true,
        }),
      });
      const jobJson = await jobRes.json();
      if (!jobRes.ok) {
        if (jobJson.error === "AI_CREDITS_EXHAUSTED") {
          clearTimers();
          setStep("no-credits");
          return;
        }
        return fail(jobJson.error);
      }

      const jobId = jobJson.jobId as string;
      poll.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/try-on/jobs/${jobId}`);
          const json = await res.json();
          if (!res.ok) return fail(json.error);

          if (json.status === "COMPLETED") {
            clearTimers();
            setResultUrl(json.resultImageUrl);
            setShareToken(json.shareToken ?? null);
            setStep("result");
          } else if (json.status === "FAILED") {
            fail(json.errorCode);
          }
        } catch {
          fail("NETWORK");
        }
      }, POLL_INTERVAL_MS);
    } catch (e) {
      fail(e instanceof Error ? e.message : "UNKNOWN");
    }
  }

  const shareUrl = shareToken ? `${shareBaseUrl}/r/${shareToken}` : null;

  async function share(text: string) {
    if (!shareUrl) return;
    kmsTrack("share_clicked", { shopSlug, productId });

    const data = { title: "Kako mi stoji? ✨", text, url: shareUrl };
    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
        return;
      } catch {
        // user dismissed the sheet, or share is blocked — fall back to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareFeedback("Link je kopiran — nalepi ga gde želiš.");
    } catch {
      setShareFeedback(shareUrl);
    }
  }

  function tryAnother() {
    kmsTrack("try_another_clicked", { shopSlug, productId });
    window.location.href = shopHref;
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[var(--kms-cream)]">
      <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-5 pb-10 pt-4">
        <div className="flex items-center justify-between">
          <p className="truncate pr-3 text-sm font-semibold text-[var(--kms-ink-soft)]">
            {productName}
          </p>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvori"
            className="rounded-full bg-white p-2 ring-1 ring-[var(--kms-line)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {step === "photo" && (
          <div className="mt-6">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em]">
              Dodaj svoju fotografiju
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[var(--kms-ink-soft)]">
              Za najbolji rezultat koristi fotografiju celog tela, sprijeda, uz dobro
              osvetljenje.
            </p>

            <label className="kms-card mt-6 flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-2 border-dashed text-center">
              <Sparkles className="h-6 w-6 text-[var(--kms-accent)]" />
              <span className="text-sm font-semibold">Izaberi ili slikaj</span>
              <span className="px-6 text-xs text-[var(--kms-ink-soft)]">
                JPG, PNG ili WebP, do 10 MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                capture="user"
                className="sr-only"
                onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
              />
            </label>
          </div>
        )}

        {step === "consent" && previewUrl && (
          <div className="mt-6">
            <h2 className="text-2xl font-extrabold tracking-[-0.02em]">
              Sve spremno?
            </h2>

            <div className="mt-5 grid grid-cols-2 gap-3">
              <div className="kms-card relative aspect-[3/4] overflow-hidden">
                <Image
                  src={previewUrl}
                  alt="Tvoja fotografija"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="kms-card relative aspect-[3/4] overflow-hidden">
                <Image
                  src={garmentImageUrl}
                  alt={productName}
                  fill
                  sizes="200px"
                  className="object-cover"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setStep("photo")}
              className="mt-3 text-sm font-semibold underline underline-offset-4"
            >
              Zameni fotografiju
            </button>

            <label className="mt-6 flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--kms-accent-deep)]"
              />
              <span className="text-xs leading-relaxed text-[var(--kms-ink-soft)]">
                Potvrđujem da imam pravo da koristim ovu fotografiju i saglasan/na sam
                da se privremeno obradi radi kreiranja AI prikaza. Fotografija se
                automatski briše nakon obrade.
              </span>
            </label>

            <a
              href={privacyHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block text-xs font-semibold text-[var(--kms-ink-soft)] underline underline-offset-4"
            >
              Kako čuvamo tvoju fotografiju
            </a>

            <button
              type="button"
              disabled={!consent}
              onClick={() => void generate()}
              className="kms-cta mt-5 flex w-full items-center justify-center gap-2 rounded-full px-6 py-3.5 text-base font-bold disabled:opacity-40"
            >
              <Sparkles className="h-4 w-4" />
              Vidi kako mi stoji
            </button>
          </div>
        )}

        {step === "working" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6 py-16 text-center">
            <div className="relative h-24 w-24">
              <span className="absolute inset-0 animate-ping rounded-full bg-[var(--kms-accent)]/25" />
              <span className="kms-cta absolute inset-0 flex items-center justify-center rounded-full">
                <Sparkles className="h-8 w-8" />
              </span>
            </div>
            <p className="text-lg font-bold">{WORKING_COPY[copyIndex]}</p>
            <p className="max-w-xs text-sm text-[var(--kms-ink-soft)]">
              Obično traje 15–30 sekundi. Ne zatvaraj stranicu.
            </p>
          </div>
        )}

        {step === "result" && resultUrl && (
          <div className="mt-4">
            <h2 className="text-center text-2xl font-extrabold tracking-[-0.02em]">
              Kako ti stoji? ✨
            </h2>

            <div className="kms-card relative mx-auto mt-4 aspect-[3/4] w-full max-w-sm overflow-hidden">
              <Image
                src={resultUrl}
                alt="Tvoj AI prikaz"
                fill
                sizes="(max-width: 640px) 90vw, 384px"
                className="object-cover"
                unoptimized
                priority
              />
              <span className="absolute bottom-2.5 left-2.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-semibold text-white backdrop-blur">
                KakoMiStoji.app
                {instagramUsername ? ` × @${instagramUsername.replace(/^@/, "")}` : ""}
              </span>
            </div>

            <p className="mt-3 text-center text-sm text-[var(--kms-ink-soft)]">
              {productName} · {shopName}
            </p>

            <div className="mt-6 space-y-2.5">
              {purchaseUrl && (
                <a
                  href={purchaseUrl}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  onClick={() => kmsTrack("buy_clicked", { shopSlug, productId })}
                  className="kms-cta flex w-full items-center justify-center rounded-full px-6 py-3.5 text-base font-bold"
                >
                  Kupi ovaj komad
                </a>
              )}

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => void share("Vidi kako mi stoji ovaj komad!")}
                  className="rounded-full border border-[var(--kms-line)] bg-white px-4 py-3 text-sm font-semibold"
                >
                  Podeli rezultat
                </button>
                <button
                  type="button"
                  onClick={() => void share("Šta kažeš, kako mi stoji? 😍")}
                  className="rounded-full border border-[var(--kms-line)] bg-white px-4 py-3 text-sm font-semibold"
                >
                  Pošalji prijateljici
                </button>
              </div>

              <button
                type="button"
                onClick={tryAnother}
                className="w-full py-2 text-sm font-semibold underline underline-offset-4"
              >
                Probaj drugi komad
              </button>
            </div>

            {shareFeedback && (
              <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-[var(--kms-ink-soft)]">
                <Check className="h-3.5 w-3.5" />
                {shareFeedback}
              </p>
            )}

            <p className="mt-5 text-center text-[11px] leading-relaxed text-[var(--kms-ink-soft)]">
              AI prikaz je vizuelna simulacija i ne garantuje veličinu ni kroj.
            </p>
          </div>
        )}

        {step === "no-credits" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-lg font-bold">Proba je trenutno pauzirana</p>
            <p className="max-w-xs text-sm text-[var(--kms-ink-soft)]">
              {shopName} je privremeno potrošio dostupne probe. Svrati ponovo uskoro.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-[var(--kms-line)] bg-white px-6 py-3 text-sm font-semibold"
            >
              Nazad na komade
            </button>
          </div>
        )}

        {step === "error" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 py-16 text-center">
            <p className="text-lg font-bold">Ups</p>
            <p className="max-w-xs text-sm text-[var(--kms-ink-soft)]">{errorText}</p>
            <button
              type="button"
              onClick={() => {
                idempotency.current = "";
                setErrorText("");
                setStep("photo");
              }}
              className="kms-cta rounded-full px-6 py-3 text-sm font-bold"
            >
              Pokušaj ponovo
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
