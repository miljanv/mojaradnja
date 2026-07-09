"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand/logo";

export default function InviteAcceptClient() {
  const { isLoaded, isSignedIn } = useAuth();
  const { user } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [busy, setBusy] = useState(false);

  const signUpHref = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("redirect_url", "/dashboard/onboarding");
    const qs = params.toString();
    return qs ? `/sign-up?${qs}` : "/sign-up?redirect_url=/dashboard/onboarding";
  }, [searchParams]);

  useEffect(() => {
    if (!isLoaded) return;
    if (!isSignedIn) {
      router.replace(signUpHref);
    }
  }, [isLoaded, isSignedIn, router, signUpHref]);

  async function continueAsNewUser() {
    setBusy(true);
    try {
      await signOut({ redirectUrl: signUpHref });
    } catch {
      setBusy(false);
      router.replace(signUpHref);
    }
  }

  if (!isLoaded) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Učitavanje...
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
        Preusmeravanje na registraciju...
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-sm">
        <div className="mb-4">
          <BrandLogo />
        </div>
        <h1 className="text-xl font-bold text-slate-900">Prihvatanje pozivnice</h1>
        <p className="mt-3 text-sm text-slate-600">
          Trenutno si ulogovan kao{" "}
          <span className="font-medium text-slate-900">
            {user?.primaryEmailAddress?.emailAddress ?? "postojeći nalog"}
          </span>
          . Za novi nalog iz invite-a moraš da se odjaviš, pa da završiš registraciju i
          kreiraš prodavnicu.
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <Button
            className="bg-pink-500 hover:bg-pink-600"
            disabled={busy}
            onClick={continueAsNewUser}
          >
            {busy ? "Odjavljivanje..." : "Nastavi kao novi korisnik"}
          </Button>
          <Button
            variant="outline"
            disabled={busy}
            onClick={() => router.push("/dashboard")}
          >
            Ostani na trenutnom nalogu
          </Button>
        </div>
      </div>
    </div>
  );
}
