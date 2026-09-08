import { Suspense } from "react";
import InviteAcceptClient from "./invite-client";

export default function InvitePage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-500">
          Učitavanje...
        </div>
      }
    >
      <InviteAcceptClient />
    </Suspense>
  );
}
