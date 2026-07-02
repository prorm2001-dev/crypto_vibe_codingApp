# Crypto Derby

Multiplayer crypto prediction game built with **Next.js**, **Instant DB**, and **CoinGecko API**.

## Features

- JWT auth (register / login / logout)
- Real-time dashboard via Instant DB
- Create & join challenges with virtual wallet ($10,000 starting balance)
- Pick 1 of 8 top cryptocurrencies before race starts
- Live price tracking during active races
- Automatic challenge lifecycle (OPEN → ACTIVE → COMPLETED)
- Winner calculation with precise decimal math
- Challenge history & profile stats

## Local setup

```bash
npm install
cp .env.example .env
```

Fill in `.env`:

| Variable | Description |
|----------|-------------|
| `COINGECKO_API_KEY` | Free key from [CoinGecko API](https://www.coingecko.com/en/api) |
| `JWT_SECRET` | Long random string (required in production) |
| `NEXT_PUBLIC_INSTANT_APP_ID` | Instant DB app ID |
| `INSTANT_APP_ADMIN_TOKEN` | Instant DB admin token (server-only) |

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Scripts

```bash
npm run dev      # development
npm run build    # production build
npm test         # unit tests
```

## Deploy to Vercel

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import `prorm2001-dev/crypto_vibe_codingApp`.
3. **Framework preset:** Next.js (auto-detected).
4. **Root directory:** `.` (repo root — no subdirectory).
5. Add **Environment Variables** (same as `.env`):

   - `COINGECKO_API_KEY`
   - `JWT_SECRET` — use a strong random value (e.g. `openssl rand -base64 32`)
   - `NEXT_PUBLIC_INSTANT_APP_ID`
   - `INSTANT_APP_ADMIN_TOKEN`

6. Deploy. Vercel will run `npm run build` and host at `https://your-app.vercel.app`.

> **Note:** `NEXT_PUBLIC_*` vars are exposed to the browser. Never put `INSTANT_APP_ADMIN_TOKEN` or `JWT_SECRET` in a `NEXT_PUBLIC_` variable.

## Stack

- Next.js 16 + React 19 + Tailwind CSS 4
- Instant DB (real-time backend)
- CoinGecko API (market data, 30s cache)
- JWT + bcrypt auth
- Framer Motion animations
- Vitest unit tests
