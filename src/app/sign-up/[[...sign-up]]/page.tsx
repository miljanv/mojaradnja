import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <SignUp
        forceRedirectUrl="/dashboard/onboarding"
        fallbackRedirectUrl="/dashboard/onboarding"
        signInUrl="/sign-in"
      />
    </div>
  );
}
