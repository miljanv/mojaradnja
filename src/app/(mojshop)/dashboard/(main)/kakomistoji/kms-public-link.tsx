"use client";

import { useState } from "react";
import { Check, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function KmsPublicLink({ url }: { url: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard blocked — the URL is visible on screen anyway
    }
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <code className="min-w-0 flex-1 truncate rounded-lg bg-white px-3 py-2 text-sm">
        {url}
      </code>
      <Button type="button" variant="outline" size="sm" onClick={() => void copy()}>
        {copied ? (
          <Check className="mr-1.5 h-3.5 w-3.5" />
        ) : (
          <Copy className="mr-1.5 h-3.5 w-3.5" />
        )}
        {copied ? "Kopirano" : "Kopiraj link"}
      </Button>
      <a href={url} target="_blank" rel="noopener noreferrer">
        <Button type="button" size="sm">
          <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
          Otvori
        </Button>
      </a>
    </div>
  );
}
