"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { VARIANT_PRESETS, parseVariantAttributesFromDb, type VariantAttribute } from "@/lib/shop-theme";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductImagesInput } from "@/components/dashboard/product-images-input";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { ProductStatus } from "@/lib/prisma-client";

type Variant = {
  id?: string;
  attributes: VariantAttribute[];
  sku: string;
  stock: number;
  isAvailable: boolean;
};

type ProductData = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  compareAtPrice: number | null;
  category: string | null;
  status: ProductStatus;
  isFeatured: boolean;
  images: string[];
  variants: Variant[];
};

const emptyAttribute = (): VariantAttribute => ({ label: "", value: "" });

const emptyVariant = (): Variant => ({
  attributes: [emptyAttribute()],
  sku: "",
  stock: 0,
  isAvailable: true,
});

function parseVariantFromDb(v: {
  id: string;
  size: string | null;
  color: string | null;
  optionLabel: string | null;
  optionValue: string | null;
  attributes: unknown;
  sku: string | null;
  stock: number;
  isAvailable: boolean;
}): Variant {
  return {
    id: v.id,
    attributes: parseVariantAttributesFromDb(v),
    sku: v.sku ?? "",
    stock: v.stock,
    isAvailable: v.isAvailable,
  };
}

export function ProductForm({
  shopId,
  product,
  categories,
}: {
  shopId: string;
  product?: ProductData;
  categories: string[];
}) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const isEdit = !!product;

  const initialStatus: ProductStatus =
    product?.status === "SOLD_OUT"
      ? "SOLD_OUT"
      : product?.status === "ACTIVE"
        ? "ACTIVE"
        : "DRAFT";
  const [status, setStatus] = useState<ProductStatus>(initialStatus);
  const [isFeatured, setIsFeatured] = useState(product?.isFeatured ?? false);

  const statusItems = {
    ACTIVE: t("statuses.ACTIVE"),
    DRAFT: t("statuses.INACTIVE"),
    SOLD_OUT: t("statuses.SOLD_OUT"),
  } as const;
  const [categoryMode, setCategoryMode] = useState<"existing" | "new">(
    product?.category && !categories.includes(product.category) ? "new" : "existing"
  );
  const [selectedCategory, setSelectedCategory] = useState(
    product?.category && categories.includes(product.category)
      ? product.category
      : categories[0] ?? ""
  );
  const [newCategory, setNewCategory] = useState(
    product?.category && !categories.includes(product.category) ? product.category : ""
  );
  const [images, setImages] = useState<string[]>(product?.images ?? []);
  const [variants, setVariants] = useState<Variant[]>(
    product?.variants.length ? product.variants : [emptyVariant()]
  );

  function addVariant() {
    setVariants([...variants, emptyVariant()]);
  }

  function removeVariant(index: number) {
    setVariants(variants.filter((_, i) => i !== index));
  }

  function updateVariant(index: number, field: keyof Omit<Variant, "attributes">, value: string | number | boolean) {
    setVariants(variants.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  }

  function updateAttribute(variantIndex: number, attrIndex: number, field: keyof VariantAttribute, value: string) {
    setVariants(
      variants.map((v, i) =>
        i === variantIndex
          ? {
              ...v,
              attributes: v.attributes.map((a, j) =>
                j === attrIndex ? { ...a, [field]: value } : a
              ),
            }
          : v
      )
    );
  }

  function addAttribute(variantIndex: number) {
    setVariants(
      variants.map((v, i) =>
        i === variantIndex ? { ...v, attributes: [...v.attributes, emptyAttribute()] } : v
      )
    );
  }

  function removeAttribute(variantIndex: number, attrIndex: number) {
    setVariants(
      variants.map((v, i) =>
        i === variantIndex
          ? { ...v, attributes: v.attributes.filter((_, j) => j !== attrIndex) }
          : v
      )
    );
  }

  function applyPreset(variantIndex: number, attrIndex: number, presetLabel: string) {
    const preset = VARIANT_PRESETS.find((p) => p.label === presetLabel);
    if (!preset) return;
    updateAttribute(variantIndex, attrIndex, "label", preset.label);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    const category =
      categoryMode === "new"
        ? newCategory.trim()
        : selectedCategory || undefined;

    const data = {
      name: form.get("name") as string,
      description: (form.get("description") as string) || undefined,
      price: parseFloat(form.get("price") as string),
      compareAtPrice: form.get("compareAtPrice")
        ? parseFloat(form.get("compareAtPrice") as string)
        : undefined,
      category: category || undefined,
      status,
      isFeatured,
      images: images.filter((url) => url.trim()),
      variants: variants.map((v) => ({
        id: v.id,
        attributes: v.attributes.filter((a) => a.label.trim() && a.value.trim()),
        sku: v.sku || undefined,
        stock: Number(v.stock),
        isAvailable: v.isAvailable,
      })),
    };

    startTransition(async () => {
      const result = isEdit
        ? await updateProduct(shopId, product!.id, {
            ...data,
            compareAtPrice: data.compareAtPrice ?? null,
          })
        : await createProduct(shopId, data);

      if (result.success) {
        toast.success(isEdit ? tCommon("update") : tCommon("create"));
        router.push("/dashboard/products");
      } else {
        toast.error(result.error);
      }
    });
  }

  const presetLabels = VARIANT_PRESETS.map((p) => p.label) as string[];

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input id="name" name="name" defaultValue={product?.name ?? ""} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">{t("description")}</Label>
            <Textarea id="description" name="description" rows={3} defaultValue={product?.description ?? ""} />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">{tCommon("price")}</Label>
              <Input id="price" name="price" type="number" step="0.01" min="0" defaultValue={product?.price ?? ""} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="compareAtPrice">{t("compareAtPrice")}</Label>
              <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" min="0" defaultValue={product?.compareAtPrice ?? ""} />
            </div>
            <div className="space-y-2">
              <Label>{t("category")}</Label>
              <Select
                value={categoryMode === "new" ? "__new__" : selectedCategory || "__none__"}
                onValueChange={(v) => {
                  if (v === "__new__") {
                    setCategoryMode("new");
                  } else if (v === "__none__") {
                    setCategoryMode("existing");
                    setSelectedCategory("");
                  } else {
                    setCategoryMode("existing");
                    setSelectedCategory(v ?? "");
                  }
                }}
                items={{
                  __none__: t("noCategory"),
                  ...Object.fromEntries(categories.map((cat) => [cat, cat])),
                  __new__: t("newCategory"),
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={t("selectCategory")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">{t("noCategory")}</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="__new__">{t("newCategory")}</SelectItem>
                </SelectContent>
              </Select>
              {categoryMode === "new" && (
                <Input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder={t("categoryName")}
                  className="mt-2"
                />
              )}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>{tCommon("status")}</Label>
              <Select
                value={status === "ARCHIVED" ? "DRAFT" : status}
                onValueChange={(v) => v && setStatus(v as ProductStatus)}
                items={statusItems}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(statusItems) as Array<keyof typeof statusItems>).map((s) => (
                    <SelectItem key={s} value={s}>
                      {statusItems[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <Switch
                id="featured"
                checked={isFeatured}
                onCheckedChange={setIsFeatured}
              />
              <Label htmlFor="featured">{t("featured")}</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("image")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ProductImagesInput images={images} onChange={setImages} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("variants")}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">{t("variantsHint")}</p>
          </div>
          <Button type="button" variant="outline" size="sm" onClick={addVariant}>
            <Plus className="h-4 w-4 mr-2" />
            {tCommon("add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {variants.map((variant, vi) => (
            <div key={vi} className="space-y-4 rounded-xl border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{t("variant")} {vi + 1}</p>
                {variants.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => removeVariant(vi)}>
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <Label className="text-xs uppercase text-muted-foreground">{t("attributes")}</Label>
                {variant.attributes.map((attr, ai) => {
                  const preset = VARIANT_PRESETS.find((p) => p.label === attr.label);
                  return (
                    <div key={ai} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
                      <Select
                        value={presetLabels.includes(attr.label) ? attr.label : "__custom__"}
                        onValueChange={(v) => {
                          if (v === "__custom__") {
                            updateAttribute(vi, ai, "label", "");
                          } else if (v) {
                            applyPreset(vi, ai, v);
                          }
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder={t("attributeType")} />
                        </SelectTrigger>
                        <SelectContent>
                          {VARIANT_PRESETS.map((p) => (
                            <SelectItem key={p.label} value={p.label}>
                              {p.label}
                            </SelectItem>
                          ))}
                          <SelectItem value="__custom__">{t("customAttribute")}</SelectItem>
                        </SelectContent>
                      </Select>

                      {!presetLabels.includes(attr.label) ? (
                        <Input
                          value={attr.label}
                          onChange={(e) => updateAttribute(vi, ai, "label", e.target.value)}
                          placeholder={t("attributeName")}
                        />
                      ) : (
                        <div />
                      )}

                      {preset ? (
                        <Select
                          value={attr.value}
                          onValueChange={(v) => updateAttribute(vi, ai, "value", v ?? "")}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder={t("attributeValue")} />
                          </SelectTrigger>
                          <SelectContent>
                            {preset.values.map((val) => (
                              <SelectItem key={val} value={val}>
                                {val}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={attr.value}
                          onChange={(e) => updateAttribute(vi, ai, "value", e.target.value)}
                          placeholder={t("attributeValue")}
                        />
                      )}

                      {variant.attributes.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeAttribute(vi, ai)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
                <Button type="button" variant="outline" size="sm" onClick={() => addAttribute(vi)}>
                  <Plus className="h-3 w-3 mr-1" />
                  {t("addAttribute")}
                </Button>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="space-y-1">
                  <Label>{t("sku")}</Label>
                  <Input value={variant.sku} onChange={(e) => updateVariant(vi, "sku", e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label>{t("stock")}</Label>
                  <Input type="number" min="0" value={variant.stock} onChange={(e) => updateVariant(vi, "stock", parseInt(e.target.value) || 0)} />
                </div>
                <div className="flex items-center gap-2 pb-2 pt-6">
                  <Checkbox
                    id={`available-${vi}`}
                    checked={variant.isAvailable}
                    onCheckedChange={(checked) => updateVariant(vi, "isAvailable", !!checked)}
                  />
                  <Label htmlFor={`available-${vi}`} className="text-sm">{t("available")}</Label>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button type="submit" className="bg-pink-500 hover:bg-pink-600" disabled={pending}>
          {isEdit ? tCommon("update") : tCommon("create")}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          {tCommon("cancel")}
        </Button>
      </div>
    </form>
  );
}
