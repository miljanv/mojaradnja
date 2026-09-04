import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { KMS_BRAND_NAME, KMS_TAGLINE, getKmsBaseUrl } from "@/lib/kms/config";
import "../globals.css";
import "./kms.css";

/**
 * KakoMiStoji has its own root layout so Instagram traffic never downloads
 * Clerk, the i18n message payload or the MojShop font.
 *
 * No `weight` array: Manrope is a variable font, so this ships one file per
 * subset instead of one per weight.
 */
const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  display: "swap",
  variable: "--font-kms",
});

export const metadata: Metadata = {
  metadataBase: new URL(getKmsBaseUrl()),
  title: {
    default: `${KMS_BRAND_NAME} — ${KMS_TAGLINE}`,
    template: `%s | ${KMS_BRAND_NAME}`,
  },
  description:
    "Izaberi komad, dodaj svoju fotografiju i pogledaj kako ti stoji — pre nego što naručiš.",
  openGraph: {
    type: "website",
    siteName: KMS_BRAND_NAME,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf7f4",
};

export default function KmsRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="sr" className={manrope.variable}>
      <body>
        <div className="kms-root">{children}</div>
      </body>
    </html>
  );
}
