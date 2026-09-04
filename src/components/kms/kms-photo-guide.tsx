import Image from "next/image";

export function KmsPhotoGuide() {
  return (
    <div className="kms-card overflow-hidden">
      <div className="relative aspect-[3/4] w-full bg-[var(--kms-cream)]">
        <Image
          src="/kms/tip-full-body.jpg"
          alt="Primer fotografije celog tela, sprijeda"
          fill
          sizes="(max-width: 640px) 70vw, 220px"
          className="object-cover object-top"
        />
      </div>
      <div className="space-y-1.5 p-3.5">
        <p className="text-sm font-bold">Ovako treba da izgleda slika</p>
        <ul className="space-y-1 text-xs leading-relaxed text-[var(--kms-ink-soft)]">
          <li>Celo telo, od glave do stopala</li>
          <li>Stojiš sprijeda, ravno prema kameri</li>
          <li>Dobro osvetljenje, bez jakih senki</li>
          <li>Ruke pored tela, bez torbe i jakne preko</li>
        </ul>
      </div>
    </div>
  );
}
