# MojShop

**Ne gubi porudžbine u Instagram DM-ovima.** Jednostavan CRM + mini prodavnica za male Instagram/TikTok prodavce.

## Tech stack

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- PostgreSQL + Prisma ORM
- Clerk authentication
- UploadThing (slike proizvoda)
- next-intl (SR default, EN)
- Zod + React Hook Form + Server Actions
- Resend (opciono, nije obavezno za MVP)

## Brzi start

### 1. Instalacija

```bash
npm install
```

### 2. Environment varijable

Kopiraj `.env.example` u `.env` i popuni vrednosti:

```bash
cp .env.example .env
```

| Varijabla | Opis |
|-----------|------|
| `DATABASE_URL` | PostgreSQL connection string |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Clerk publishable key |
| `CLERK_SECRET_KEY` | Clerk secret key |
| `UPLOADTHING_TOKEN` | UploadThing token (slike) |
| `NEXT_PUBLIC_UPLOADTHING_APP_ID` | UploadThing app ID |
| `NEXT_PUBLIC_APP_URL` | npr. `http://localhost:3000` |
| `RESEND_API_KEY` | Opciono — email notifikacije |
| `ADMIN_PANEL_PASSWORD` | Šifra za admin panel (default: `Petrovaradin1!`) |

### Admin pristup

1. U Clerk Dashboard → Users → tvoj user → **Public metadata**:
   ```json
   { "isAdmin": true }
   ```
2. Otvori `/admin` → unesi šifru iz `ADMIN_PANEL_PASSWORD`
3. U panelu: svi korisnici, shopovi, proizvodi, produženje pretplate, invite i kreiranje korisnika

Novi korisnici dobijaju **30 dana trial** od registracije.

**Invite tok:** invite link vodi na `/invite` → ako si već ulogovan (npr. kao admin), odjavi se → registracija → `/dashboard/onboarding` (kreiranje shopa).

**Upravljaj tuđim butikom:** Admin → Prodavnice / Korisnik → **Upravljaj butikom**. Otvara se njihov dashboard (proizvodi, porudžbine…) sa žutim bannerom. **Izađi iz butika** vraća te u admin.

### 3. Baza podataka

```bash
# Generiši Prisma klijent
npm run db:generate

# Primeni migracije (ili db push za brzi dev)
npm run db:migrate
# ili: npm run db:push

# Seed demo podataka (Butik Mila — lokalni seed bez Clerk logina)
npm run db:seed

# Pun demo nalog + shop (Atelier Luna) sa Clerk loginom
npm run db:seed:demo
```

### 4. Pokretanje

```bash
npm run dev
```

Otvori [http://localhost:3000](http://localhost:3000)

## Demo nalog (živ prikaz)

`npm run db:seed:demo` kreira:

| | |
|--|--|
| **Email** | `demo@mojshop.app` |
| **Lozinka** | `DemoMojShop2026!` |
| **Shop** | Atelier Luna → `/atelier-luna` |
| **Sadržaj** | 8 proizvoda, 6 kupaca, 10 porudžbina, zamene, reklamacije, šabloni, kategorije |

Prijavi se na `/sign-in`, pa otvori dashboard — nalog ima ACTIVE pretplatu (ne ističe).

> Stari test shop **Svetofor** (`/svetofor-zr`) se migrira u Atelier Luna.

## Rute

### Javna mini prodavnica (`domen.rs/[shopSlug]`)

| Ruta | Opis |
|------|------|
| `/[shopSlug]` | Početna stranica prodavnice |
| `/[shopSlug]/p/[productSlug]` | Detalj proizvoda + forma za porudžbinu |
| `/[shopSlug]/return` | Zamene i reklamacije (forma) |

Primer: `http://localhost:3000/butik-mila`

### Dashboard (zaštićeno — Clerk)

| Ruta | Opis |
|------|------|
| `/dashboard` | Pregled (statistika, brze akcije) |
| `/dashboard/onboarding` | Kreiranje prodavnice (prvi put) |
| `/dashboard/shop` | Podešavanja prodavnice |
| `/dashboard/products` | Lista proizvoda |
| `/dashboard/products/new` | Novi proizvod |
| `/dashboard/products/[id]/edit` | Izmena proizvoda |
| `/dashboard/orders` | Lista porudžbina + CSV export |
| `/dashboard/orders/new` | **Ručna porudžbina** (iz DM-a) |
| `/dashboard/orders/[id]` | Detalj + kopiraj poruke |
| `/dashboard/customers` | Kupci |
| `/dashboard/customers/[id]` | Profil kupca + rizik |
| `/dashboard/exchanges` | Zamene |
| `/dashboard/exchanges/new` | Nova zamena |
| `/dashboard/exchanges/[id]` | Detalj zamene |
| `/dashboard/complaints` | Reklamacije |
| `/dashboard/complaints/new` | Nova reklamacija |
| `/dashboard/templates` | Šabloni poruka |

### API

| Ruta | Opis |
|------|------|
| `/api/uploadthing` | Upload slika |
| `/api/export/orders` | CSV export porudžbina |

## Višejezičnost

- **Podrazumevani jezik:** Srpski (SR)
- **Dodatni jezik:** English (EN)
- Prekidač jezika u header-u (cookie `locale`)
- UI prevodi u `messages/sr.json` i `messages/en.json`

## Ključne MVP funkcije

1. **Ručni unos porudžbina** — glavni flow za Instagram DM prodavce
2. **Kopiraj poruku** — potvrda, poslato, zamena (šabloni na srpskom)
3. **Mini prodavnica** — `/butik-mila` bez online plaćanja
4. **CSV export** — porudžbine za kurira
5. **Multi-tenant** — svaki seller vidi samo svoju prodavnicu

## Skripte

```bash
npm run dev          # Dev server
npm run build        # Production build
npm run start        # Production server
npm run db:migrate   # Migracije
npm run db:seed      # Demo podaci
npm run db:studio    # Prisma Studio
```

## Buduće verzije (NIJE implementirano)

- Instagram / WhatsApp / Viber API integracije
- Kurirske integracije
- Online plaćanja i subscription billing
- AI generator opisa i caption-a
- Custom domeni po prodavnici
- Timski pristup i multi-shop
- Mobilna aplikacija
- Fiskalni računi

## Licenca

Private — MojShop MVP (mojshop.app)
