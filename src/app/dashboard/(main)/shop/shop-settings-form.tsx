"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateShop } from "@/lib/actions/shop";
import {
  BACKGROUND_PRESETS,
  CARD_COLOR_PRESETS,
  SHOP_FONTS,
} from "@/lib/shop-theme";
import { ShopDesignPreview } from "@/components/dashboard/shop-design-preview";
import { ShopImageInput } from "@/components/dashboard/shop-image-input";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Shop = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  instagramUsername: string | null;
  phone: string | null;
  email: string | null;
  returnAddress: string | null;
  returnPolicy: string | null;
  exchangePolicy: string | null;
  logoUrl: string | null;
  coverImageUrl: string | null;
  primaryColor: string;
  backgroundColor: string;
  cardColor: string;
  fontFamily: string;
  heroTitle: string | null;
  heroSubtitle: string | null;
  isPublished: boolean;
};

export function ShopSettingsForm({ shop }: { shop: Shop }) {
  const t = useTranslations("shop");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();
  const [activeTab, setActiveTab] = useState("general");

  const [isPublished, setIsPublished] = useState(shop.isPublished);
  const [shopName, setShopName] = useState(shop.name);
  const [logoUrl, setLogoUrl] = useState(shop.logoUrl ?? "");
  const [coverImageUrl, setCoverImageUrl] = useState(shop.coverImageUrl ?? "");
  const [backgroundColor, setBackgroundColor] = useState(shop.backgroundColor);
  const [cardColor, setCardColor] = useState(shop.cardColor);
  const [fontFamily, setFontFamily] = useState(shop.fontFamily);
  const [primaryColor, setPrimaryColor] = useState(shop.primaryColor);
  const [heroTitle, setHeroTitle] = useState(shop.heroTitle ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(shop.heroSubtitle ?? "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const getString = (key: string) => {
        const value = form.get(key);
        return typeof value === "string" ? value : "";
      };

      const result = await updateShop(shop.id, {
        name: getString("name").trim() || shop.name,
        slug: getString("slug").trim() || shop.slug,
        description: getString("description").trim() || undefined,
        instagramUsername: getString("instagramUsername").trim() || undefined,
        phone: getString("phone").trim() || undefined,
        email: getString("email").trim() || undefined,
        returnAddress: getString("returnAddress").trim() || null,
        returnPolicy: getString("returnPolicy").trim() || null,
        exchangePolicy: getString("exchangePolicy").trim() || null,
        logoUrl: logoUrl.trim() || null,
        coverImageUrl: coverImageUrl.trim() || null,
        primaryColor,
        backgroundColor,
        cardColor,
        fontFamily,
        heroTitle: heroTitle.trim() || null,
        heroSubtitle: heroSubtitle.trim() || null,
        isPublished,
      });

      if (result.success) {
        toast.success(tCommon("save"));
      } else {
        toast.error(result.error);
      }
    });
  }

  const previewProps = {
    shopName,
    logoUrl,
    coverImageUrl,
    heroTitle,
    heroSubtitle,
    primaryColor,
    backgroundColor,
    cardColor,
    fontFamily,
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="general">{t("tabGeneral")}</TabsTrigger>
              <TabsTrigger value="design">{t("tabDesign")}</TabsTrigger>
              <TabsTrigger value="policies">{t("tabPolicies")}</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 max-w-3xl" keepMounted>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">{t("shopName")}</Label>
                  <Input
                    id="name"
                    name="name"
                    value={shopName}
                    onChange={(e) => setShopName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">{t("slug")}</Label>
                  <Input id="slug" name="slug" defaultValue={shop.slug} required />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">{t("description")}</Label>
                <Textarea id="description" name="description" rows={3} defaultValue={shop.description ?? ""} />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="instagramUsername">{t("instagram")}</Label>
                  <Input id="instagramUsername" name="instagramUsername" defaultValue={shop.instagramUsername ?? ""} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">{tCommon("phone")}</Label>
                  <Input id="phone" name="phone" defaultValue={shop.phone ?? ""} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{tCommon("email")}</Label>
                <Input id="email" name="email" type="email" defaultValue={shop.email ?? ""} placeholder="prodavnica@email.rs" />
                <p className="text-xs text-muted-foreground">{t("emailNotificationsHint")}</p>
              </div>

              <div className="flex items-center gap-3">
                <Switch id="isPublished" checked={isPublished} onCheckedChange={setIsPublished} />
                <Label htmlFor="isPublished">{t("published")}</Label>
              </div>
            </TabsContent>

            <TabsContent value="design" keepMounted>
              <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_380px]">
                <div className="space-y-6 max-w-xl">
                  <ShopImageInput
                    label={t("logo")}
                    hint={t("logoHint")}
                    value={logoUrl}
                    onChange={setLogoUrl}
                    name="logoUrl"
                    aspectClassName="aspect-square max-w-[160px]"
                    objectFit="contain"
                  />

                  <ShopImageInput
                    label={t("cover")}
                    value={coverImageUrl}
                    onChange={setCoverImageUrl}
                    objectFit="cover"
                  />

                  <div className="space-y-2">
                    <Label htmlFor="heroTitle">{t("heroTitle")}</Label>
                    <Input
                      id="heroTitle"
                      name="heroTitle"
                      value={heroTitle}
                      onChange={(e) => setHeroTitle(e.target.value)}
                      placeholder={t("heroTitlePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="heroSubtitle">{t("heroSubtitle")}</Label>
                    <Textarea
                      id="heroSubtitle"
                      name="heroSubtitle"
                      rows={2}
                      value={heroSubtitle}
                      onChange={(e) => setHeroSubtitle(e.target.value)}
                      placeholder={t("heroSubtitlePlaceholder")}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("fontFamily")}</Label>
                    <Select
                      value={fontFamily}
                      onValueChange={(v) => v && setFontFamily(v)}
                      items={Object.fromEntries(SHOP_FONTS.map((f) => [f.id, f.label]))}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {SHOP_FONTS.map((font) => (
                          <SelectItem key={font.id} value={font.id}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("primaryColor")}</Label>
                    <div className="flex items-center gap-3">
                      <Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="h-10 w-16" />
                      <Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="max-w-[140px]" />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>{t("backgroundColor")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {BACKGROUND_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setBackgroundColor(color)}
                          className={cn(
                            "h-10 w-10 rounded-full border-2 transition-transform hover:scale-110",
                            backgroundColor === color ? "border-[#E85A6B] ring-2 ring-[#E85A6B]/30" : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <Input value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="max-w-[140px] mt-2" />
                  </div>

                  <div className="space-y-2">
                    <Label>{t("cardColor")}</Label>
                    <div className="flex flex-wrap gap-2">
                      {CARD_COLOR_PRESETS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => setCardColor(color)}
                          className={cn(
                            "h-10 w-10 rounded-full border-2 transition-transform hover:scale-110",
                            cardColor === color ? "border-[#E85A6B] ring-2 ring-[#E85A6B]/30" : "border-transparent"
                          )}
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <Input value={cardColor} onChange={(e) => setCardColor(e.target.value)} className="max-w-[140px] mt-2" />
                  </div>
                </div>

                <div className="hidden xl:block">
                  <div className="sticky top-6">
                    <ShopDesignPreview {...previewProps} />
                  </div>
                </div>
              </div>

              <div className="mt-8 xl:hidden">
                <ShopDesignPreview {...previewProps} />
              </div>
            </TabsContent>

            <TabsContent value="policies" className="space-y-6 max-w-3xl" keepMounted>
              <div className="space-y-2">
                <Label htmlFor="returnAddress">{t("returnAddress")}</Label>
                <Textarea id="returnAddress" name="returnAddress" rows={2} defaultValue={shop.returnAddress ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="returnPolicy">{t("returnPolicy")}</Label>
                <Textarea id="returnPolicy" name="returnPolicy" rows={3} defaultValue={shop.returnPolicy ?? ""} />
              </div>

              <div className="space-y-2">
                <Label htmlFor="exchangePolicy">{t("exchangePolicy")}</Label>
                <Textarea id="exchangePolicy" name="exchangePolicy" rows={3} defaultValue={shop.exchangePolicy ?? ""} />
              </div>
            </TabsContent>
          </Tabs>

          <Button type="submit" className="bg-[#E85A6B] hover:bg-[#D44558]" disabled={pending}>
            {tCommon("save")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
