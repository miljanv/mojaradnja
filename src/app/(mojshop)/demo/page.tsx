"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { BrandLogo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";

export default function DemoLoginPage() {
  const router = useRouter();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { signIn } = useSignIn();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(true);
  const started = useRef(false);

  useEffect(() => {
    if (!authLoaded) return;
    if (isSignedIn) {
      router.replace("/dashboard");
      return;
    }
    if (!signIn || started.current) return;
    started.current = true;

    let cancelled = false;

    async function run() {
      setPending(true);
      setError(null);
      try {
        const res = await fetch("/api/demo-login", { method: "POST" });
        const data = (await res.json()) as { token?: string; error?: string };
        if (!res.ok || !data.token) {
          throw new Error(data.error || "Demo nalog nije dostupan");
        }

        const { error: ticketError } = await signIn.ticket({
          ticket: data.token,
        });
        if (cancelled) return;
        if (ticketError) {
          throw new Error(ticketError.message || "Ticket prijava nije uspela");
        }

        if (signIn.status === "complete") {
          const { error: finalizeError } = await signIn.finalize({
            navigate: async () => {
              router.replace("/dashboard");
            },
          });
          if (finalizeError) {
            throw new Error(finalizeError.message || "Finalizacija nije uspela");
          }
          return;
        }

        throw new Error(
          "Automatska prijava nije završena. Probaj ručno sa username-om atelier-luna-demo."
        );
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Greška pri prijavi");
          setPending(false);
        }
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [authLoaded, isSignedIn, signIn, router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-[#FDF8F5] px-4">
      <div className="w-full max-w-md rounded-2xl border border-[#EDE4DC] bg-white p-8 text-center shadow-sm">
        <div className="mb-6 flex justify-center">
          <BrandLogo />
        </div>
        <h1 className="text-xl font-bold text-[#111111]">Demo nalog</h1>
        <p className="mt-2 text-sm text-[#6B7280]">
          {pending && !error
            ? "Prijavljujemo te u Atelier Luna…"
            : "Jedan klik do napunjenog dashboarda."}
        </p>

        {pending && !error && (
          <div className="mx-auto mt-8 h-8 w-8 animate-spin rounded-full border-2 border-[#E85A6B] border-t-transparent" />
        )}

        {error && (
          <div className="mt-6 space-y-4 text-left">
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">
              {error}
            </p>
            <div className="rounded-lg bg-[#FDF8F5] px-3 py-3 text-sm text-[#111111]">
              <p className="font-medium">Ručna prijava</p>
              <p className="mt-1 text-[#6B7280]">
                Username:{" "}
                <span className="font-mono text-[#111111]">atelier-luna-demo</span>
              </p>
              <p className="text-[#6B7280]">
                Lozinka:{" "}
                <span className="font-mono text-[#111111]">DemoMojShop2026!</span>
              </p>
            </div>
            <Link href="/sign-in" className="block">
              <Button className="w-full bg-[#E85A6B] hover:bg-[#D44558]">
                Idi na prijavu
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
