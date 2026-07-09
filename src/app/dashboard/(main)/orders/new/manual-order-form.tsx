"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { createManualOrder } from "@/lib/actions/orders";
import { formatCurrency } from "@/lib/utils-app";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import type { OrderSource } from "@/lib/prisma-client";

type Customer = {
  id: string;
  fullName: string;
  phone: string;
  email: string | null;
  instagramUsername: string | null;
  address: string | null;
  city: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  variants: Array<{
    id: string;
    size: string | null;
    color: string | null;
    stock: number;
  }>;
};

type OrderItem = {
  productId?: string;
  productName: string;
  variantId?: string;
  size?: string;
  color?: string;
  quantity: number;
  unitPrice: number;
};

const emptyItem = (): OrderItem => ({
  productName: "",
  quantity: 1,
  unitPrice: 0,
});

export function ManualOrderForm({
  shopId,
  customers,
  products,
}: {
  shopId: string;
  customers: Customer[];
  products: Product[];
}) {
  const t = useTranslations("orders");
  const tCommon = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const [customerMode, setCustomerMode] = useState<"existing" | "new">("existing");
  const [customerId, setCustomerId] = useState("");
  const [source, setSource] = useState<OrderSource>("MANUAL");
  const [items, setItems] = useState<OrderItem[]>([emptyItem()]);

  const total = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  function addItem() {
    setItems([...items, emptyItem()]);
  }

  function removeItem(index: number) {
    setItems(items.filter((_, i) => i !== index));
  }

  function updateItem(index: number, field: keyof OrderItem, value: string | number) {
    setItems(items.map((item, i) => (i === index ? { ...item, [field]: value } : item)));
  }

  function selectProduct(index: number, productId: string) {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setItems(
      items.map((item, i) =>
        i === index
          ? {
              ...item,
              productId: product.id,
              productName: product.name,
              unitPrice: product.price,
              variantId: undefined,
              size: undefined,
              color: undefined,
            }
          : item
      )
    );
  }

  function selectVariant(index: number, variantId: string) {
    const item = items[index];
    const product = products.find((p) => p.id === item.productId);
    const variant = product?.variants.find((v) => v.id === variantId);
    if (!variant) return;

    setItems(
      items.map((it, i) =>
        i === index
          ? {
              ...it,
              variantId: variant.id,
              size: variant.size ?? undefined,
              color: variant.color ?? undefined,
            }
          : it
      )
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    if (customerMode === "existing" && !customerId) {
      toast.error("Izaberite kupca");
      return;
    }

    const validItems = items.filter((item) => item.productName.trim() && item.quantity > 0);
    if (validItems.length === 0) {
      toast.error("Dodajte bar jednu stavku");
      return;
    }

    startTransition(async () => {
      const result = await createManualOrder(shopId, {
        ...(customerMode === "existing"
          ? { customerId }
          : {
              newCustomer: {
                fullName: form.get("fullName") as string,
                phone: form.get("phone") as string,
                email: (form.get("email") as string) || undefined,
                instagramUsername: (form.get("instagramUsername") as string) || undefined,
                address: (form.get("address") as string) || undefined,
                city: (form.get("city") as string) || undefined,
              },
            }),
        items: validItems,
        deliveryAddress: (form.get("deliveryAddress") as string) || undefined,
        deliveryCity: (form.get("deliveryCity") as string) || undefined,
        source,
        note: (form.get("note") as string) || undefined,
        internalNote: (form.get("internalNote") as string) || undefined,
      });

      if (result.success && result.data) {
        toast.success(`Porudžbina ${result.data.orderNumber} kreirana`);
        router.push(`/dashboard/orders/${result.data.orderId}`);
      } else if (!result.success) {
        toast.error(result.error);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      <Card>
        <CardHeader>
          <CardTitle>{t("customer")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={customerMode} onValueChange={(v) => v && setCustomerMode(v as "existing" | "new")}>
            <TabsList>
              <TabsTrigger value="existing">Postojeći kupac</TabsTrigger>
              <TabsTrigger value="new">Novi kupac</TabsTrigger>
            </TabsList>

            <TabsContent value="existing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label>{t("customer")}</Label>
                <Select value={customerId} onValueChange={(v) => v && setCustomerId(v)} required={customerMode === "existing"}>
                  <SelectTrigger>
                    <SelectValue placeholder="Izaberite kupca" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.fullName} — {c.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </TabsContent>

            <TabsContent value="new" className="space-y-4 mt-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">{tCommon("name")}</Label>
                  <Input id="fullName" name="fullName" required={customerMode === "new"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{tCommon("phone")}</Label>
                  <Input id="phone" name="phone" required={customerMode === "new"} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">{tCommon("email")}</Label>
                  <Input id="email" name="email" type="email" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="instagramUsername">Instagram</Label>
                  <Input id="instagramUsername" name="instagramUsername" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">{tCommon("address")}</Label>
                  <Input id="address" name="address" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">{tCommon("city")}</Label>
                  <Input id="city" name="city" />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t("items")}</CardTitle>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-4 w-4 mr-2" />
            {tCommon("add")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {items.map((item, i) => {
            const product = products.find((p) => p.id === item.productId);

            return (
              <div key={i} className="grid gap-3 border rounded-lg p-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Proizvod</Label>
                    <Select
                      value={item.productId ?? ""}
                      onValueChange={(v) => v && selectProduct(i, v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Izaberite proizvod" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} — {formatCurrency(p.price)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {product && product.variants.length > 0 && (
                    <div className="space-y-2">
                      <Label>Varijanta</Label>
                      <Select
                        value={item.variantId ?? ""}
                        onValueChange={(v) => v && selectVariant(i, v)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Veličina / boja" />
                        </SelectTrigger>
                        <SelectContent>
                          {product.variants.map((v) => (
                            <SelectItem key={v.id} value={v.id}>
                              {[v.size, v.color].filter(Boolean).join(" / ") || "Standard"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <div className="space-y-2">
                    <Label>Naziv</Label>
                    <Input
                      value={item.productName}
                      onChange={(e) => updateItem(i, "productName", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{tCommon("quantity")}</Label>
                    <Input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => updateItem(i, "quantity", parseInt(e.target.value) || 1)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{tCommon("price")}</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={item.unitPrice}
                      onChange={(e) => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)}
                    />
                  </div>
                  <div className="flex items-end">
                    {items.length > 1 && (
                      <Button type="button" variant="ghost" onClick={() => removeItem(i)}>
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
          <p className="text-right font-semibold">{tCommon("total")}: {formatCurrency(total)}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("deliveryAddress")}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="deliveryAddress">{tCommon("address")}</Label>
            <Input id="deliveryAddress" name="deliveryAddress" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="deliveryCity">{tCommon("city")}</Label>
            <Input id="deliveryCity" name="deliveryCity" />
          </div>
          <div className="space-y-2">
            <Label>{t("source")}</Label>
            <Select value={source} onValueChange={(v) => v && setSource(v as OrderSource)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(["MANUAL", "INSTAGRAM_DM", "VIBER", "WHATSAPP", "PHONE", "MINI_SHOP"] as OrderSource[]).map((s) => (
                  <SelectItem key={s} value={s}>
                    {t(`sources.${s}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="note">{tCommon("note")}</Label>
            <Textarea id="note" name="note" rows={2} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="internalNote">{tCommon("internalNote")}</Label>
            <Textarea id="internalNote" name="internalNote" rows={2} />
          </div>
        </CardContent>
      </Card>

      <Button type="submit" className="bg-pink-500 hover:bg-pink-600" disabled={pending}>
        {t("manualOrder")}
      </Button>
    </form>
  );
}
