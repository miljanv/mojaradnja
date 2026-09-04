import Image from "next/image";
import Link from "next/link";
import { Sparkles } from "lucide-react";
import { formatCurrency } from "@/lib/utils-app";

type Props = {
  href: string;
  name: string;
  price: number;
  imageUrl: string | null;
  priority?: boolean;
};

export function KmsProductCard({ href, name, price, imageUrl, priority }: Props) {
  return (
    <Link href={href} className="kms-card group block overflow-hidden">
      <div className="relative aspect-[3/4] bg-[var(--kms-cream)]">
        {imageUrl && (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 640px) 47vw, (max-width: 1024px) 30vw, 240px"
            className="object-cover"
            priority={priority}
          />
        )}
      </div>

      <div className="p-3">
        <p className="truncate text-sm font-semibold">{name}</p>
        <p className="mt-0.5 text-sm text-[var(--kms-ink-soft)]">
          {formatCurrency(price)}
        </p>
        <span className="kms-cta mt-3 flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-[13px] font-bold">
          <Sparkles className="h-3.5 w-3.5" />
          Probaj na sebi
        </span>
      </div>
    </Link>
  );
}
