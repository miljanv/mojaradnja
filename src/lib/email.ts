import { Resend } from "resend";
import { formatCurrency } from "@/lib/utils-app";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

type NewOrderEmailParams = {
  shopEmail: string;
  shopName: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryCity?: string | null;
  deliveryAddress?: string | null;
  totalAmount: number;
  source: string;
  note?: string | null;
  items: Array<{
    productName: string;
    size?: string | null;
    color?: string | null;
    quantity: number;
    totalPrice: number;
  }>;
  orderId: string;
};

const SOURCE_LABELS: Record<string, string> = {
  MINI_SHOP: "Mini prodavnica",
  INSTAGRAM_DM: "Instagram DM",
  VIBER: "Viber",
  WHATSAPP: "WhatsApp",
  PHONE: "Telefon",
  MANUAL: "Ručno",
};

function buildOrderEmailHtml(params: NewOrderEmailParams): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const orderUrl = `${appUrl}/dashboard/orders/${params.orderId}`;
  const sourceLabel = SOURCE_LABELS[params.source] ?? params.source;

  const itemsRows = params.items
    .map(
      (item) => `
      <tr>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.productName}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.size ?? "—"}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;">${item.color ?? "—"}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:center;">${item.quantity}</td>
        <td style="padding:8px 0;border-bottom:1px solid #eee;text-align:right;">${formatCurrency(item.totalPrice)}</td>
      </tr>`
    )
    .join("");

  return `
<!DOCTYPE html>
<html>
<body style="font-family:system-ui,sans-serif;color:#1e293b;max-width:560px;margin:0 auto;padding:24px;">
  <div style="background:linear-gradient(135deg,#E91E8C,#f472b6);color:white;padding:24px;border-radius:12px 12px 0 0;">
    <h1 style="margin:0;font-size:20px;">Nova porudžbina 🛍️</h1>
    <p style="margin:8px 0 0;opacity:0.9;">${params.shopName}</p>
  </div>
  <div style="border:1px solid #e2e8f0;border-top:none;padding:24px;border-radius:0 0 12px 12px;">
    <p style="font-size:18px;font-weight:bold;color:#E91E8C;margin-top:0;">${params.orderNumber}</p>
    <p style="color:#64748b;margin:0 0 16px;">Izvor: <strong>${sourceLabel}</strong></p>

    <h2 style="font-size:14px;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;">Kupac</h2>
    <p style="margin:0 0 4px;"><strong>${params.customerName}</strong></p>
    <p style="margin:0 0 4px;">📞 ${params.customerPhone}</p>
    ${params.deliveryCity ? `<p style="margin:0 0 4px;">📍 ${params.deliveryCity}${params.deliveryAddress ? `, ${params.deliveryAddress}` : ""}</p>` : ""}
    ${params.note ? `<p style="margin:8px 0 0;color:#64748b;">Napomena: ${params.note}</p>` : ""}

    <h2 style="font-size:14px;text-transform:uppercase;color:#64748b;letter-spacing:0.05em;margin-top:24px;">Proizvodi</h2>
    <table style="width:100%;border-collapse:collapse;font-size:14px;">
      <thead>
        <tr style="color:#64748b;font-size:12px;">
          <th style="text-align:left;padding:8px 0;">Proizvod</th>
          <th style="text-align:left;padding:8px 0;">Vel.</th>
          <th style="text-align:left;padding:8px 0;">Boja</th>
          <th style="text-align:center;padding:8px 0;">Kom</th>
          <th style="text-align:right;padding:8px 0;">Iznos</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>

    <p style="font-size:18px;font-weight:bold;text-align:right;margin-top:16px;">
      Ukupno: ${formatCurrency(params.totalAmount)}
    </p>

    <a href="${orderUrl}" style="display:inline-block;background:#E91E8C;color:white;text-decoration:none;padding:12px 24px;border-radius:8px;font-weight:600;margin-top:16px;">
      Otvori u dashboard-u
    </a>
  </div>
  <p style="text-align:center;color:#94a3b8;font-size:12px;margin-top:24px;">MojaRadnja — obaveštenje o novoj porudžbini</p>
</body>
</html>`;
}

export async function sendNewOrderNotification(
  params: NewOrderEmailParams
): Promise<{ sent: boolean; error?: string }> {
  if (!resend) {
    return { sent: false, error: "RESEND_API_KEY not configured" };
  }

  if (!params.shopEmail?.trim()) {
    return { sent: false, error: "Shop email not set" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL ?? "MojaRadnja <onboarding@resend.dev>";

  try {
    const { error } = await resend.emails.send({
      from,
      to: params.shopEmail.trim(),
      subject: `Nova porudžbina ${params.orderNumber} — ${params.shopName}`,
      html: buildOrderEmailHtml(params),
    });

    if (error) {
      console.error("[email] Failed to send new order notification:", error);
      return { sent: false, error: error.message };
    }

    return { sent: true };
  } catch (e) {
    console.error("[email] Unexpected error:", e);
    return {
      sent: false,
      error: e instanceof Error ? e.message : "Unknown error",
    };
  }
}
