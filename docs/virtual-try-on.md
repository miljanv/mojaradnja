# Virtual Try-On (Probaj na sebi)

## Pregled

Native MojShop funkcija koja koristi fal.ai model `fal-ai/fashn/tryon/v1.6`.
Kredite i pristup kontroliše isključivo superadmin. Nema kupovine paketa u aplikaciji.

## Environment

1. Napravi nalog na [fal.ai](https://fal.ai) i kreiraj API key.
2. U `.env` dodaj:

```env
FAL_KEY=fal_...
TRY_ON_PROVIDER=fal-fashn-v1.6
TRY_ON_INPUT_RETENTION_HOURS=24
TRY_ON_RESULT_RETENTION_HOURS=24
CRON_SECRET=dugačak-nasumičan-string
```

`FAL_KEY` sme da postoji samo na serveru. Nikada ne stavljaj u `NEXT_PUBLIC_*`.

## Lokalno pokretanje

```bash
npm install
npx prisma migrate deploy   # ili db:migrate
npm run dev
```

## Superadmin: omogućavanje shopa

1. Otvori `/admin` (Clerk `isAdmin` + admin lozinka).
2. Idi na korisnika → shop karticu.
3. U sekciji **Virtual Try-On** uključi status.
4. Dodaj kredite (+10 / +30 / +50 / +200 ili custom) uz **obaveznu napomenu**.
5. Svaka korekcija kreira `AiCreditTransaction` zapis.

## Merchant: uključivanje proizvoda

1. Dashboard → Proizvodi → Izmena.
2. Sekcija **Virtualno probavanje** (vidljiva samo ako je shop omogućen).
3. Toggle, fotografija za AI, kategorija (tops / one-pieces), tip fotografije.
4. Sačuvaj.

Dashboard prikazuje preostale kredite i osnovnu statistiku.

## Testiranje uspešnog joba

1. Shop: `virtualTryOnEnabled=true`, `aiCredits >= 1`.
2. Proizvod ACTIVE + try-on podešen.
3. Javna product stranica → **✨ Probaj na sebi**.
4. Upload JPEG/PNG/WebP, saglasnost, Generiši.
5. Frontend polluje `GET /api/try-on/jobs/:id` dok status ne bude `COMPLETED`.
6. Rezultat se kopira u UploadThing; kredit −1.

## Testiranje neuspešnog joba

- Bez `FAL_KEY` ili sa nevažećim ključem: job `FAILED`, `TRY_ON_REFUND`, kredit vraćen.
- Bez kredita: `AI_CREDITS_EXHAUSTED`.
- Ponovljeni refund je idempotentan (unique index + `creditRefunded`).

## Cleanup

Pozovi periodično (npr. Vercel Cron / spoljni cron):

```bash
curl -H "Authorization: Bearer $CRON_SECRET" \
  "$NEXT_PUBLIC_APP_URL/api/cron/try-on-cleanup"
```

Proces:

- rekonciliira stare `PROCESSING` jobove (refund ako treba);
- briše person slike nakon `TRY_ON_INPUT_RETENTION_HOURS`;
- briše result slike nakon `TRY_ON_RESULT_RETENTION_HOURS`.

## Privatnost

Korisničke fotografije se ne prikazuju merchantu, ne koriste za trening, i brišu se automatski.
Storage: postojeći UploadThing (nema R2 u ovom projektu).
