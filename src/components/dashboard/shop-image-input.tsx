"use client";

import Image from "next/image";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { ImagePlus, Link2, Trash2 } from "lucide-react";
import { UploadButton } from "@/lib/uploadthing";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import "@uploadthing/react/styles.css";

type ShopImageInputProps = {
  value: string;
  onChange: (url: string) => void;
  label: string;
  aspectClassName?: string;
  name?: string;
};

export function ShopImageInput({
  value,
  onChange,
  label,
  aspectClassName = "aspect-[21/9]",
  name = "coverImageUrl",
}: ShopImageInputProps) {
  const t = useTranslations("shop");
  const tProducts = useTranslations("products");
  const tCommon = useTranslations("common");
  const [urlDraft, setUrlDraft] = useState("");

  function addUrl() {
    const url = urlDraft.trim();
    if (!url) return;
    try {
      new URL(url);
    } catch {
      toast.error(tProducts("invalidImageUrl"));
      return;
    }
    onChange(url);
    setUrlDraft("");
    toast.success(tProducts("imageAdded"));
  }

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium">{label}</p>

      {value ? (
        <div
          className={`relative overflow-hidden rounded-xl border bg-muted ${aspectClassName}`}
        >
          <Image src={value} alt="" fill className="object-cover" unoptimized />
          <Button
            type="button"
            size="icon"
            variant="secondary"
            className="absolute right-2 top-2 h-8 w-8"
            onClick={() => onChange("")}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div
          className={`flex items-center justify-center rounded-xl border border-dashed bg-muted/40 ${aspectClassName}`}
        >
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImagePlus className="h-8 w-8 opacity-50" />
            <span className="text-xs">{t("coverHint")}</span>
          </div>
        </div>
      )}

      <Tabs defaultValue="upload">
        <TabsList>
          <TabsTrigger value="upload">{tProducts("uploadImage")}</TabsTrigger>
          <TabsTrigger value="url">URL</TabsTrigger>
        </TabsList>
        <TabsContent value="upload" className="pt-2">
          <UploadButton
            endpoint="shopImage"
            onClientUploadComplete={(res) => {
              const url = res?.[0]?.url;
              if (url) {
                onChange(url);
                toast.success(tProducts("imageAdded"));
              }
            }}
            onUploadError={(error) => {
              toast.error(error.message);
            }}
          />
        </TabsContent>
        <TabsContent value="url" className="pt-2">
          <div className="flex gap-2">
            <Input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              placeholder="https://..."
              type="url"
            />
            <Button type="button" variant="outline" onClick={addUrl}>
              <Link2 className="mr-1.5 h-4 w-4" />
              {tCommon("add")}
            </Button>
          </div>
        </TabsContent>
      </Tabs>

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
