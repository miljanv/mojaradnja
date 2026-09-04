import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import { KMS_BRAND_NAME, KMS_TAGLINE, getKmsBaseUrl } from "@/lib/kms/config";
import "./kms.css";

const manrope = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "800"],
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

export default function KmsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${manrope.variable} kms-root`}>{children}</div>
  );
}
