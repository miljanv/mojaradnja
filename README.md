# MojShop monorepo

Dva projekta u jednom repozitorijumu:

| Folder | Šta je | Stack |
| ------ | ------ | ----- |
| [`web/`](./web) | **MojShop** — CRM + mini prodavnica + KakoMiStoji virtual try-on | Next.js 16, Prisma, PostgreSQL, Clerk |
| [`mobile/`](./mobile) | **Probaj ✨** — mobilna virtual try-on aplikacija (telefon + AI proba + krediti) | React Native (Expo), RevenueCat |

Mobilna aplikacija koristi backend iz `web/` (rute `web/src/app/api/mobile/*`).

## Brzi start

```bash
# Web (Next.js) — backend + web app
cd web
npm install
cp .env.example .env      # popuni vrednosti (DATABASE_URL, Clerk, FAL_KEY, ...)
npm run dev               # http://localhost:3000

# Mobile (Expo) — u drugom terminalu
cd mobile
npm install
cp .env.example .env      # EXPO_PUBLIC_API_URL=http://localhost:3000
npm run web               # ili: npm run ios / npm run android
```

Detaljna uputstva: [`web/README.md`](./web/README.md) i [`mobile/README.md`](./mobile/README.md).

## Deploy

- **Web (Vercel):** pošto je Next.js aplikacija sada u `web/`, u Vercel projektu
  postavi **Root Directory = `web`** (Settings → General → Root Directory).
  Vercel će tada auto-detektovati Next.js i build/deploy radi normalno. Environment
  varijable ostaju iste (podešene u Vercel dashboard-u).
- **Mobile (Expo/EAS):** build iz `mobile/` foldera (`eas build`). Nije deo Vercel deploy-a.
