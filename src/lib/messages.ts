type MessageVars = Record<string, string | number | undefined | null>;

export function renderTemplate(template: string, vars: MessageVars): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => {
    const value = vars[key];
    return value != null ? String(value) : "";
  });
}

export const DEFAULT_TEMPLATES = {
  ORDER_CONFIRMATION: `Ćao {{customerName}}, tvoja porudžbina {{orderNumber}} je potvrđena.

Proizvod: {{productName}}
Veličina: {{size}}
Iznos: {{totalAmount}} RSD

Javićemo ti čim paket bude poslat. Hvala na porudžbini.`,

  ORDER_SHIPPED: `Ćao {{customerName}}, tvoja porudžbina {{orderNumber}} je poslata.

Iznos za plaćanje: {{totalAmount}} RSD
Kurir će te kontaktirati pre isporuke.

Hvala na kupovini.`,

  EXCHANGE_INSTRUCTIONS: `Ćao {{customerName}}, zamena za porudžbinu {{orderNumber}} je evidentirana.

Molimo te da paket pošalješ na adresu:
{{returnAddress}}

U paket ubaci papir sa brojem porudžbine: {{orderNumber}}

Kada primimo paket, šaljemo zamenski proizvod.`,

  COMPLAINT_RECEIVED: `Ćao {{customerName}}, primili smo tvoju reklamaciju za porudžbinu {{orderNumber}}.

Razlog: {{reason}}

Kontaktiraćemo te uskoro sa rešenjem. Hvala na strpljenju.`,

  CUSTOM: `Ćao {{customerName}},

{{content}}`,
};

export const DEFAULT_TEMPLATES_EN = {
  ORDER_CONFIRMATION: `Hi {{customerName}}, your order {{orderNumber}} is confirmed.

Product: {{productName}}
Size: {{size}}
Amount: {{totalAmount}} RSD

We will notify you when the package is shipped. Thank you for your order.`,

  ORDER_SHIPPED: `Hi {{customerName}}, your order {{orderNumber}} has been shipped.

Amount due: {{totalAmount}} RSD
The courier will contact you before delivery.

Thank you for your purchase.`,

  EXCHANGE_INSTRUCTIONS: `Hi {{customerName}}, the exchange for order {{orderNumber}} has been recorded.

Please send the package to:
{{returnAddress}}

Include a note with the order number: {{orderNumber}}

Once we receive it, we will send the replacement product.`,

  COMPLAINT_RECEIVED: `Hi {{customerName}}, we received your complaint for order {{orderNumber}}.

Reason: {{reason}}

We will contact you soon with a resolution. Thank you for your patience.`,

  CUSTOM: `Hi {{customerName}},

{{content}}`,
};

export function buildOrderMessage(
  template: string,
  order: {
    orderNumber: string;
    customerName: string;
    totalAmount: number | string;
    items: Array<{ productName: string; size?: string | null }>;
  },
  returnAddress?: string | null
) {
  const firstItem = order.items[0];
  return renderTemplate(template, {
    customerName: order.customerName,
    orderNumber: order.orderNumber,
    productName: firstItem?.productName ?? "",
    size: firstItem?.size ?? "-",
    totalAmount: order.totalAmount,
    returnAddress: returnAddress ?? "",
  });
}

export function buildMiniShopThankYouMessage(
  orderNumber: string,
  productName: string,
  shopName: string
) {
  return `Zdravo! Upravo sam poručila preko mini prodavnice.

Broj porudžbine: ${orderNumber}
Proizvod: ${productName}

Hvala! — ${shopName}`;
}

export function exportOrdersToCsv(
  orders: Array<{
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryCity: string | null;
    deliveryAddress: string | null;
    totalAmount: number | string;
    note: string | null;
    items: Array<{
      productName: string;
      size: string | null;
      color: string | null;
      quantity: number;
    }>;
  }>
): string {
  const headers = [
    "order number",
    "customer name",
    "phone",
    "city",
    "address",
    "product",
    "size",
    "color",
    "quantity",
    "total amount",
    "note",
  ];

  const rows = orders.flatMap((order) =>
    order.items.map((item) => [
      order.orderNumber,
      order.customerName,
      order.customerPhone,
      order.deliveryCity ?? "",
      order.deliveryAddress ?? "",
      item.productName,
      item.size ?? "",
      item.color ?? "",
      String(item.quantity),
      String(order.totalAmount),
      order.note ?? "",
    ])
  );

  const escape = (val: string) => `"${val.replace(/"/g, '""')}"`;
  return [headers, ...rows].map((row) => row.map(escape).join(",")).join("\n");
}

export function getCustomerRiskLevel(stats: {
  orderCount: number;
  exchangeCount: number;
  complaintCount: number;
}): "normal" | "frequent_returns" | "problematic" {
  if (stats.complaintCount >= 3 || (stats.orderCount > 0 && stats.complaintCount / stats.orderCount > 0.3)) {
    return "problematic";
  }
  if (stats.exchangeCount >= 2 || (stats.orderCount > 0 && stats.exchangeCount / stats.orderCount > 0.2)) {
    return "frequent_returns";
  }
  return "normal";
}
