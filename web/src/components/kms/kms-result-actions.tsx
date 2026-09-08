"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { kmsTrack } from "@/lib/kms/analytics-client";

type Props = {
  shopSlug: string;
  productId: string;
  purchaseUrl: string | null;
  shareUrl: string;
};

export function KmsResultActions({
  shopSlug,
  productId,
  purchaseUrl,
  shareUrl,
}: Props) {
  const [feedback, setFeedback] = useState("");

  async function share() {
    kmsTrack("share_clicked", { shopSlug, productId });

    const data = {
      title: "Kako mi stoji? ✨",
      text: "Vidi kako mi stoji ovaj komad!",
      url: shareUrl,
    };

    if (typeof navigator.share === "function") {
      try {
        await navigator.share(data);
        return;
      } catch {
        // dismissed or blocked — fall through to copy
      }
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setFeedback("Link je kopiran.");
    } catch {
      setFeedback(shareUrl);
    }
  }

  return (
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

      <button
        type="button"
        onClick={() => void share()}
        className="w-full rounded-full border border-[var(--kms-line)] bg-white px-6 py-3 text-sm font-semibold"
      >
        Podeli rezultat
      </button>

      {feedback && (
        <p className="flex items-center justify-center gap-1.5 pt-1 text-center text-xs text-[var(--kms-ink-soft)]">
          <Check className="h-3.5 w-3.5" />
          {feedback}
        </p>
      )}
    </div>
  );
}
