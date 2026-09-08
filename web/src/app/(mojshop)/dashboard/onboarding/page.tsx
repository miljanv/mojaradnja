import { redirect } from "next/navigation";
import { getAuthUser } from "@/lib/auth";
import { OnboardingForm } from "./onboarding-form";

export default async function OnboardingPage() {
  const user = await getAuthUser();
  if (!user) redirect("/sign-in");

  // Already has a shop — go to dashboard (e.g. admin testing invite while logged in)
  if (user.shops.length > 0) {
    redirect("/dashboard");
  }

  return <OnboardingForm />;
}
