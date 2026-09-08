import Link from "next/link";
import { notFound } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { getPublishedShop } from "@/lib/shop-public";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { ExchangeForm } from "./exchange-form";

type PageProps = {
  params: Promise<{ shopSlug: string }>;
};

export default async function ReturnPage({ params }: PageProps) {
  const { shopSlug } = await params;
  const shop = await getPublishedShop(shopSlug);

  if (!shop) {
    notFound();
  }

  const t = await getTranslations("publicShop");
  const ts = await getTranslations("shop");

  return (
    <div className="container mx-auto max-w-3xl px-4 py-6 sm:py-10">
      <Link href={`/${shop.slug}`}>
        <Button variant="ghost" size="sm" className="mb-6 -ml-2">
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("backToShop")}
        </Button>
      </Link>

      <div className="mb-8 text-center sm:text-left">
        <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
          {t("returnsAndComplaints")}
        </h1>
        <p className="mt-2 text-slate-600">{shop.name}</p>
      </div>

      <div className="space-y-6">
        {shop.returnPolicy && (
          <Card className="border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader>
              <CardTitle>{t("returnPolicyTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                {shop.returnPolicy}
              </p>
            </CardContent>
          </Card>
        )}

        {shop.exchangePolicy && (
          <Card className="border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader>
              <CardTitle>{t("exchangePolicyTitle")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                {shop.exchangePolicy}
              </p>
            </CardContent>
          </Card>
        )}

        {shop.returnAddress && (
          <Card className="border-0 shadow-sm ring-1 ring-slate-100">
            <CardHeader>
              <CardTitle>{ts("returnAddress")}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-slate-600">{shop.returnAddress}</p>
            </CardContent>
          </Card>
        )}

        <ExchangeForm shopSlug={shop.slug} />
      </div>
    </div>
  );
}
