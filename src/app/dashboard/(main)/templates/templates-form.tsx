"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { updateTemplate } from "@/lib/actions/exchanges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

type Template = {
  id: string;
  type: string;
  title: string;
  content: string;
};

const TEMPLATE_LABELS: Record<string, string> = {
  ORDER_CONFIRMATION: "orderConfirmation",
  ORDER_SHIPPED: "orderShipped",
  EXCHANGE_INSTRUCTIONS: "exchangeInstructions",
  COMPLAINT_RECEIVED: "complaintReceived",
  CUSTOM: "custom",
};

export function TemplatesForm({
  shopId,
  templates,
}: {
  shopId: string;
  templates: Template[];
}) {
  const t = useTranslations("templates");
  const tCommon = useTranslations("common");
  const [pending, startTransition] = useTransition();

  function handleSubmit(type: string, e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateTemplate(shopId, type, {
        title: form.get("title") as string,
        content: form.get("content") as string,
      });

      if (result.success) {
        toast.success(tCommon("save"));
      } else {
        toast.error(result.error);
      }
    });
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <p className="text-sm text-muted-foreground">
        Dostupne promenljive: {"{{customerName}}"}, {"{{orderNumber}}"}, {"{{productName}}"}, {"{{size}}"}, {"{{totalAmount}}"}, {"{{returnAddress}}"}, {"{{reason}}"}, {"{{content}}"}
      </p>

      {templates.map((template) => {
        const labelKey = TEMPLATE_LABELS[template.type];
        const title = labelKey ? t(labelKey as "orderConfirmation") : template.title;

        return (
          <Card key={template.id}>
            <CardHeader>
              <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={(e) => handleSubmit(template.type, e)}
                className="space-y-4"
              >
                <div className="space-y-2">
                  <Label htmlFor={`title-${template.type}`}>Naslov</Label>
                  <Input
                    id={`title-${template.type}`}
                    name="title"
                    defaultValue={template.title}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`content-${template.type}`}>Sadržaj</Label>
                  <Textarea
                    id={`content-${template.type}`}
                    name="content"
                    rows={8}
                    defaultValue={template.content}
                    required
                    className="font-mono text-sm"
                  />
                </div>
                <Button type="submit" variant="outline" disabled={pending}>
                  {tCommon("save")}
                </Button>
              </form>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
