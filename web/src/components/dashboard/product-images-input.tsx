"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagePlus, Link2, Trash2, Upload } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "@uploadthing/react/styles.css";

type ProductImagesInputProps = {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
};

export function ProductImagesInput({
  images,
  onChange,
  maxImages = 10,
}: ProductImagesInputProps) {
  const t = useTranslations("products");
  const tCommon = useTranslations("common");
  const [urlDraft, setUrlDraft] = useState("");

  const filledImages = images.filter((url) => url.trim());
  const canAddMore = filledImages.length < maxImages;

  function removeImage(index: number) {
    onChange(filledImages.filter((_, i) => i !== index));
  }

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;

    try {
      new URL(url);
    } catch {
      toast.error(t("invalidImageUrl"));
      return;
    }

    if (filledImages.length >= maxImages) {
      toast.error(t("maxImages", { count: maxImages }));
      return;
    }

    onChange([...filledImages, url]);
    setUrlDraft("");
    toast.success(t("imageAdded"));
  }

  function handleUploadComplete(res: Array<{ url: string }>) {
    const newUrls = res.map((f) => f.url).filter(Boolean);
    if (!newUrls.length) return;

    const merged = [...filledImages, ...newUrls].slice(0, maxImages);
    onChange(merged);

    if (filledImages.length + newUrls.length > maxImages) {
      toast.warning(t("maxImages", { count: maxImages }));
    } else {
      toast.success(t("imagesUploaded", { count: newUrls.length }));
    }
  }

  return (
    <div className="space-y-4">
      {filledImages.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {filledImages.map((url, index) => (
            <div
              key={`${url}-${index}`}
              className="group relative aspect-square overflow-hidden rounded-xl border bg-muted"
            >
              <Image
                src={url}
                alt={`${t("image")} ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100"
                onClick={() => removeImage(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
              {index === 0 && (
                <span className="absolute bottom-2 left-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-medium text-white">
                  {t("mainImage")}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {canAddMore ? (
        <Tabs defaultValue="upload" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              {t("uploadImage")}
            </TabsTrigger>
            <TabsTrigger value="url" className="gap-2">
              <Link2 className="h-4 w-4" />
              {t("imageUrl")}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="mt-4">
            <div className="flex flex-col items-start gap-3 rounded-xl border border-dashed bg-muted/30 p-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <ImagePlus className="h-4 w-4" />
                {t("uploadHint")}
              </div>
              <UploadButton
                endpoint="productImage"
                onClientUploadComplete={handleUploadComplete}
                onUploadError={(error) => {
                  toast.error(error.message);
                }}
                appearance={{
                  button:
                    "bg-[#E85A6B] text-white text-sm font-medium px-4 py-2 rounded-md hover:bg-[#D44558] transition-colors ut-ready:bg-[#E85A6B] ut-uploading:bg-[#E85A6B]/80",
                  allowedContent: "text-xs text-muted-foreground mt-2",
                }}
                content={{
                  button({ ready, isUploading }) {
                    if (isUploading) return t("uploading");
                    if (ready) return t("chooseFiles");
                    return tCommon("loading");
                  },
                  allowedContent: t("uploadAllowed"),
                }}
              />
            </div>
          </TabsContent>

          <TabsContent value="url" className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label htmlFor="image-url">{t("pasteUrl")}</Label>
              <div className="flex gap-2">
                <Input
                  id="image-url"
                  type="url"
                  value={urlDraft}
                  onChange={(e) => setUrlDraft(e.target.value)}
                  placeholder="https://..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addUrl();
                    }
                  }}
                />
                <Button type="button" variant="outline" onClick={addUrl}>
                  {tCommon("add")}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <p className="text-sm text-muted-foreground">{t("maxImages", { count: maxImages })}</p>
      )}
    </div>
  );
}