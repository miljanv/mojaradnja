import { KMS_BRAND_NAME } from "@/lib/kms/config";

export function KmsWordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`text-[17px] font-extrabold tracking-[-0.02em] ${className}`}>
      Kako<span className="kms-gradient-text">MiStoji</span>
      <span className="sr-only"> — {KMS_BRAND_NAME}</span>
    </span>
  );
}
