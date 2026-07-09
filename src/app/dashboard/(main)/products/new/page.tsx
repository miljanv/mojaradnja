import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { requireShop } from "@/lib/auth";
import { getShopProductCategories } from "@/lib/shop-categories";
import { DashboardHeader } from "@/components/dashboard/header";
import { ProductForm } from "../product-form";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default async function NewProductPage() {
  const { shop } = await requireShop();
  const t = await getTranslations("products");
  const tCommon = await getTranslations("common");

  const categories = await getShopProductCategories(shop.id);

  return (
    <div>
      <DashboardHeader
        title={t("add")}
        actions={
          <Link href="/dashboard/products">
            <Button variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              {tCommon("back")}
            </Button>
          </Link>
        }
      />
      <div className="p-6">
        <ProductForm shopId={shop.id} categories={categories} />
      </div>
    </div>
  );
}
