import Link from "next/link";
import { requireShop } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { DashboardHeader } from "@/components/dashboard/header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KmsSettingsForm } from "./kms-settings-form";
import { KmsPublicLink } from "./kms-public-link";
import { KmsFunnelCard } from "@/components/dashboard/kms-funnel-card";
import { kmsShopUrl } from "@/lib/kms/config";
import { productTryOnEligible } from "@/lib/try-on/eligibility";

export default async function KakoMiStojiSettingsPage() {
  const { shop } = await requireShop();

  const products = await prisma.product.findMany({
    where: { shopId: shop.id, status: "ACTIVE" },
    orderBy: { name: "asc" },
    select: {
      id: true,
      name: true,
      tryOnEnabled: true,
      tryOnCategory: true,
      tryOnPhotoType: true,
      tryOnGarmentImageKey: true,
      status: true,
    },
  });

  const ready = products.filter(productTryOnEligible);
  const publicUrl = kmsShopUrl(shop.slug);

  if (!shop.virtualTryOnEnabled) {
    return (
      <div>
        <DashboardHeader title="KakoMiStoji" />
        <div className="max-w-3xl p-4 sm:p-6">
          <div className="rounded-xl border border-black/5 bg-[#FDF8F5] p-6">
            <h2 className="text-lg font-semibold">
              KakoMiStoji još nije aktiviran za tvoj shop
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              KakoMiStoji je javna stranica na kojoj tvoje kupce čeka AI proba
              odeće — izaberu komad, dodaju svoju fotografiju i vide kako im stoji.
              Javi nam se da ti aktiviramo funkciju i dodelimo kredite.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <DashboardHeader title="KakoMiStoji" />

      <div className="max-w-3xl space-y-6 p-4 sm:p-6">
        <div className="rounded-xl border border-black/5 bg-[#FDF8F5] p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium">Status</p>
              <p className="text-sm text-muted-foreground">
                {shop.kmsPublicEnabled
                  ? "Javna stranica je aktivna"
                  : "Javna stranica je isključena"}
              </p>
            </div>
            <Badge variant="secondary">{shop.aiCredits} kredita</Badge>
          </div>

          <KmsPublicLink url={publicUrl} />

          <p className="mt-3 text-xs text-muted-foreground">
            Ovaj link stavi u Instagram bio ili Story. Podržava i UTM parametre,
            npr. <code>?utm_source=instagram&amp;utm_medium=story</code>.
          </p>
        </div>

        <KmsFunnelCard shopId={shop.id} />

        <KmsSettingsForm
          shopId={shop.id}
          kmsPublicEnabled={shop.kmsPublicEnabled}
          purchaseUrl={shop.purchaseUrl ?? ""}
          instagramUsername={shop.instagramUsername ?? ""}
        />

        <div className="rounded-xl border border-black/5 bg-white p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <h3 className="text-base font-semibold">Komadi za probu</h3>
              <p className="text-sm text-muted-foreground">
                {ready.length} od {products.length} aktivnih proizvoda je spremno za
                KakoMiStoji.
              </p>
            </div>
            <Link href="/dashboard/products">
              <Button variant="outline" size="sm">
                Podesi proizvode
              </Button>
            </Link>
          </div>

          {ready.length === 0 && (
            <p className="mt-4 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Nijedan proizvod još nije spreman. U izmeni proizvoda uključi
              &bdquo;Probaj na sebi&ldquo; i izaberi fotografiju, kategoriju i tip
              fotografije.
            </p>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Logo, naziv shopa i ostale vizuelne postavke menjaš u{" "}
          <Link href="/dashboard/shop" className="underline underline-offset-4">
            podešavanjima prodavnice
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
