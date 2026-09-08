# Probaj ✨ — Virtual Try‑On (mobilna aplikacija)

Jednostavna mobilna aplikacija: **registruj se brojem telefona → dodaj svoju
fotografiju i fotografiju odevnog predmeta → dobij AI rezultat probavanja.**
Naplata kredita je preko **RevenueCat** (1 kredit = 1 proba).

Napravljeno u **React Native (Expo)** — deli TypeScript ekosistem i backend sa
web aplikacijom (`MojShop` / `instacrm`) u root folderu ovog repo‑a.

## Zašto React Native (Expo), a ne Flutter?

- Isti jezik i ekosistem kao postojeći kod (TypeScript/React).
- **RevenueCat** ima prvoklasan Expo SDK (`react-native-purchases`).
- Ponovo koristi postojeći Next.js backend + `fal.ai` virtual try‑on.
- Expo Web omogućava brzo testiranje i demo.

## Arhitektura

```
mobile/                      Expo app (ovaj folder)
  src/app/                   expo-router ekrani
    phone.tsx  verify.tsx    registracija brojem telefona (SMS OTP)
    home.tsx                 upload 2 fotografije + pokretanje probe
    result.tsx               AI rezultat + before/after
    paywall.tsx              kupovina kredita (RevenueCat / demo)
  src/lib/                   api klijent, auth, purchases, theme

../src/app/api/mobile/       Backend rute u Next.js aplikaciji
  auth/request-otp           pošalji SMS kod
  auth/verify-otp            potvrdi kod -> token
  me                         profil + stanje kredita
  try-on                     upload + fal.ai probavanje (−1 kredit)
  credits/purchase           demo dodavanje kredita
  revenuecat/webhook         RevenueCat -> dodela kredita
```

## Pokretanje

1. Pokreni backend (root folder repo‑a):
   ```bash
   cd ..
   npm run dev            # Next.js na http://localhost:3000
   ```
2. Podesi okruženje aplikacije:
   ```bash
   cp .env.example .env   # podesi EXPO_PUBLIC_API_URL po potrebi
   ```
3. Pokreni aplikaciju:
   ```bash
   npm install
   npm run web            # ili: npm run ios / npm run android
   ```

> Na fizičkom telefonu, `localhost` je sam telefon — postavi
> `EXPO_PUBLIC_API_URL` na LAN IP tvog računara (npr. `http://192.168.1.20:3000`).

## Demo režim (bez tajnih ključeva)

Aplikacija je otporna — radi u potpunosti i bez eksternih ključeva:

| Integracija | Ako ključ postoji | Ako ne postoji |
| ----------- | ----------------- | -------------- |
| **SMS OTP** | šalje SMS (Twilio) | kod se vrati u odgovoru i auto‑popuni (demo) |
| **AI try‑on** | pravo `fal.ai` probavanje | vraća tvoju fotografiju uz "Demo" oznaku |
| **RevenueCat** | naplata preko App Store / Google Play | demo dodavanje kredita preko backenda |

## Konfiguracija (env)

| Var | Opis |
| --- | ---- |
| `EXPO_PUBLIC_API_URL` | Base URL backend‑a (Next.js) |
| `EXPO_PUBLIC_REVENUECAT_IOS_KEY` | RevenueCat public key (iOS) |
| `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` | RevenueCat public key (Android) |

Backend (root `.env`): `FAL_KEY`, `TRY_ON_PROVIDER`, `UPLOADTHING_TOKEN`,
`REVENUECAT_WEBHOOK_SECRET`, i (opciono) `TWILIO_AUTH_TOKEN` za pravi SMS.

## RevenueCat podešavanje (produkcija)

1. Napravi proizvode/paketa u RevenueCat‑u sa identifikatorima
   `credits_1`, `credits_5`, `credits_20`, `credits_50`.
2. Dodaj public SDK ključeve u `.env` (`EXPO_PUBLIC_REVENUECAT_*`).
3. U RevenueCat dashboard‑u podesi webhook na
   `POST {API_URL}/api/mobile/revenuecat/webhook` sa
   `Authorization: Bearer <REVENUECAT_WEBHOOK_SECRET>`.
4. Aplikacija postavlja RevenueCat `appUserID` na `MobileUser.id`, pa webhook
   automatski dodaje kredite tom korisniku.
