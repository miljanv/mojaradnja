# Monorepo

This repository contains two apps:

- **`web/`** — the MojShop Next.js app (CRM, storefront, KakoMiStoji try-on, and
  the mobile app's backend under `web/src/app/api/mobile/*`). See
  [`web/AGENTS.md`](./web/AGENTS.md) — **read it before editing anything in `web/`**
  (this Next.js version has breaking changes vs. what you may know).
- **`mobile/`** — the "Probaj" React Native (Expo) virtual try-on app. See
  [`mobile/README.md`](./mobile/README.md).

Run commands from inside the relevant app folder (`cd web` or `cd mobile`); each
has its own `package.json` and lockfile. They are intentionally NOT npm workspaces.

## Deploy

The web app lives in `web/`, so on Vercel set **Root Directory = `web`**.
