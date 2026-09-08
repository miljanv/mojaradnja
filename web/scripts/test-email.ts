import "dotenv/config";
import { sendNewOrderNotification } from "../src/lib/email";

async function main() {
  const to = process.argv[2] ?? "miljanzr@gmail.com";

  console.log("Sending test email to:", to);
  console.log("FROM:", process.env.RESEND_FROM_EMAIL);
  console.log("API key set:", !!process.env.RESEND_API_KEY);

  const result = await sendNewOrderNotification({
    shopEmail: to,
    shopName: "Butik Miljan",
    orderNumber: "TEST-1001",
    customerName: "Test Kupac",
    customerPhone: "+381601112233",
    deliveryCity: "Beograd",
    deliveryAddress: "Test ulica 1",
    totalAmount: 3900,
    source: "MINI_SHOP",
    note: "Test porudžbina",
    orderId: "test-order-id",
    items: [
      {
        productName: "Crna haljina",
        size: "M",
        color: "Crna",
        quantity: 1,
        totalPrice: 3900,
      },
    ],
  });

  console.log("Result:", result);
}

main().catch(console.error);
