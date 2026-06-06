# ✈️ RunwayRadar

> AI-powered flight deal finder for cheap direct flights from Edinburgh Airport (EDI).  
> Private — just for Kieran & Isla. 🌸

[![Deploy](https://img.shields.io/badge/Deployed-GitHub%20Pages-222?logo=github)](https://kieranpatton01.github.io/RunwayRadar/)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8)](https://kieranpatton01.github.io/RunwayRadar/)

---

## What it does

RunwayRadar is a private AI travel assistant. Instead of a traditional search form, you chat:

- *"Cheap weekend in June"*
- *"Direct flights to Italy under £150 for 2"*
- *"Somewhere sunny next month, 4 days"*

Gemini parses what you mean → Travelpayouts finds real flight prices → AI rates deals and generates a full destination guide when you tap a card.

---

## Tech stack

| Layer | Tool | Notes |
|---|---|---|
| Frontend | React + Vite | |
| Styling | Tailwind CSS + CSS modules | |
| AI | Gemini 1.5 Flash | Intent parsing, deal rating, guides |
| Flights | Travelpayouts (Aviasales) Data API | Free, token-based, no business required |
| Map | Mapbox GL JS | Destination map in modal |
| Auth | Firebase Authentication | Email + password, invite-only |
| Proxy | Cloudflare Worker | All secrets live here |
| Hosting | GitHub Pages | |
| PWA | vite-plugin-pwa + Workbox | Installable on iOS + Android |

---

## Architecture

```
You & Isla → PWA (GitHub Pages)
                 ↕  Firebase ID token on every request
             Cloudflare Worker
               ├── Travelpayouts Data API  (real flight prices)
               ├── Gemini 1.5 Flash        (AI features only)
               └── Firebase token verify   (blocks everyone else)

Mapbox GL JS → called directly from PWA (public token, URL-restricted)
```

**Security model:** Cloudflare Worker verifies your Firebase login token and checks your email against an allowlist before touching any paid API. Even if someone found the Worker URL, they'd need a valid Firebase account with an approved email.

---

## Project structure

```
RunwayRadar/
├── public/icons/               ← PWA icons (replace with real PNGs)
├── src/
│   ├── components/
│   │   ├── Auth/               ← Login page (email + password)
│   │   ├── Chat/               ← AI chat interface
│   │   ├── DestinationModal/   ← Full guide + Mapbox map
│   │   ├── FlightCard/         ← Result cards + deal badge
│   │   ├── Layout/             ← Header + bottom nav
│   │   └── SavedDeals/         ← Saved flights + searches
│   ├── context/AppContext.jsx  ← Auth, theme, saved state
│   ├── data/mockFlights.js     ← 11 real EDI routes for dev
│   ├── hooks/
│   │   ├── useFlights.js       ← Travelpayouts + Gemini orchestration
│   │   ├── useGemini.js        ← Chat state + intent parsing
│   │   └── useLocalStorage.js
│   ├── services/
│   │   ├── amadeus.js          ← Flight service (uses Travelpayouts under the hood)
│   │   ├── firebase.js         ← Auth helpers
│   │   ├── gemini.js           ← AI API calls
│   │   └── mapbox.js           ← Map helpers + coords lookup
│   ├── styles/                 ← Three themes: dark / light / pink 🌸
│   └── utils/                  ← Date, price, flight formatters
├── worker/
│   ├── index.js                ← Cloudflare Worker (proxy + auth)
│   └── wrangler.toml
├── .env.example
└── README.md
```

---

## First-time setup

### 1. Clone and install

```bash
git clone https://github.com/kieranpatton01/RunwayRadar.git
cd RunwayRadar
npm install
cp .env.example .env
```

### 2. Firebase (~5 mins)

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Create project** → call it `RunwayRadar`
2. **Build → Authentication → Get started → Email/Password → Enable**
3. **Authentication → Users → Add user** — add Kieran's email + password, then Isla's
   *(No sign-up form in the app — all account creation happens here)*
4. **Project Settings → Your apps → Add app (Web)**
5. Copy the config values into your `.env`:
   ```
   VITE_FIREBASE_API_KEY=AIza...
   VITE_FIREBASE_AUTH_DOMAIN=runwayradar-xxxx.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=runwayradar-xxxx
   VITE_FIREBASE_APP_ID=1:000000000000:web:000000
   ```

### 3. Travelpayouts token (~2 mins)

1. Go to [travelpayouts.com](https://www.travelpayouts.com) and **sign up free** (affiliate account — no business required)
2. Join the **Aviasales** programme when prompted (it's free)
3. Go to **Profile → API token** and copy your token
4. This token goes into the Cloudflare Worker secret (next step) — **not** into `.env`

> **What is Travelpayouts Data API?**  
> It's a free cache of real flight prices from actual user searches, updated every 2–7 days.  
> Unlike real-time booking APIs, it shows recent market prices rather than live seat availability.  
> Perfect for deal discovery — you click through to book via Aviasales/Skyscanner.

### 4. Cloudflare Worker (~10 mins)

```bash
# Install Wrangler if you don't have it
npm install -g wrangler

cd worker
npx wrangler login   # opens browser to authenticate

# Deploy the Worker (you'll get a URL like runway-radar-api.yourname.workers.dev)
npx wrangler deploy

# Add secrets one by one (you'll be prompted to type each value)
npx wrangler secret put TRAVELPAYOUTS_TOKEN   # from travelpayouts.com profile
npx wrangler secret put GEMINI_API_KEY        # from aistudio.google.com/app/apikey
npx wrangler secret put FIREBASE_WEB_API_KEY  # same as VITE_FIREBASE_API_KEY
npx wrangler secret put ALLOWED_EMAILS        # type: kieran@email.com,isla@email.com
```

Copy your Worker URL into `.env`:
```
VITE_WORKER_URL=https://runway-radar-api.yourname.workers.dev
```

### 5. Mapbox (~3 mins)

1. Sign up free at [account.mapbox.com](https://account.mapbox.com)
2. Create a **public token**
3. Under **Token restrictions**, add your GitHub Pages URL: `https://kieranpatton01.github.io`
4. Add to `.env`:
   ```
   VITE_MAPBOX_TOKEN=pk.eyJ1...
   ```

> ⚠️ **Reminder:** The `.env` file has `VITE_MAPBOX_TOKEN=REPLACE_WITH_YOUR_MAPBOX_TOKEN` — don't forget this or the destination map won't load.

### 6. Run locally

```bash
cd ..   # back to project root
npm run dev
```

Open [http://localhost:5173/RunwayRadar/](http://localhost:5173/RunwayRadar/)

Mock data is on by default (`VITE_USE_MOCK_DATA=true`) — you'll see 11 realistic Edinburgh routes immediately with no API calls needed.

---

## Deploy to GitHub Pages

```bash
npm run deploy
```

**First time:**
1. GitHub repo → **Settings → Pages**
2. Source: **Deploy from a branch → `gh-pages` → `/ (root)`**
3. Live at `https://kieranpatton01.github.io/RunwayRadar/`

---

## PWA installation

### iPhone (Safari only)
1. Open the app in **Safari** (not Chrome)
2. Tap **Share →  Add to Home Screen → Add**

### Android (Chrome)
1. Open in Chrome → tap **⋮ → Add to Home Screen**

---

## Themes

Tap the icon in the header to cycle:

| Theme | Aesthetic |
|---|---|
| 🌙 Dark | Deep navy + gold (default) |
| ☀️ Light | Clean white + navy |
| 🌸 Pink | Rose tones + floral pattern (Isla's) |

Saved to localStorage automatically.

---

## How the AI works

**Gemini is allowed to:**
- Parse natural language into structured search params
- Rate real Travelpayouts prices with context (season, destination value)
- Write destination travel guides
- Answer conversational follow-up questions

**Gemini is never:**
- Shown flight prices before Travelpayouts returns them
- Asked to generate, estimate, or modify any price
- Trusted with booking decisions

---

## Switching to real flight data

When you're ready to turn on live Travelpayouts data:

1. In `.env`, set:
   ```
   VITE_USE_MOCK_DATA=false
   ```
2. Rebuild and redeploy:
   ```bash
   npm run deploy
   ```

That's it — no Worker changes needed. The Worker already talks to Travelpayouts.

---

## Feature log

### v1.0.0
- [x] AI chat interface (Gemini intent parsing)
- [x] Travelpayouts flight search (replaces Amadeus — free, no business required)
- [x] Mock Edinburgh flight data (11 real routes) for dev/offline
- [x] Flight cards with AI deal ratings (1–5 stars + Gemini summaries)
- [x] Destination modal: Mapbox map + full AI travel guide
- [x] Themes: dark / light / pink with floral background
- [x] Firebase Authentication — invite-only, no public registration
- [x] Cloudflare Worker proxy (all API keys server-side)
- [x] Saved flights + search history
- [x] PWA — installable on iOS + Android
- [x] Suggested chat prompts on landing
- [x] Booking deep-link to Aviasales for each result

### Planned
- [ ] Price drop notifications (browser push)
- [ ] Price calendar — cheapest dates in a month view
- [ ] Isla's destination wishlist
- [ ] Share a deal via link

---

## Pre-launch checklist

- [ ] Real Mapbox token added to `.env` and restricted to your domain
- [ ] Firebase users created (Kieran + Isla) in Firebase Console
- [ ] All 4 Worker secrets set via `wrangler secret put`
- [ ] Worker deployed and URL in `VITE_WORKER_URL`
- [ ] `VITE_USE_MOCK_DATA=false` when ready for real data
- [ ] CORS `Access-Control-Allow-Origin` in `worker/index.js` locked to your Pages domain
- [ ] Real PWA icons (`icon-192.png` + `icon-512.png`) added to `public/icons/`

---

*RunwayRadar — built with ❤️ for Kieran & Isla. Edinburgh → everywhere.*
