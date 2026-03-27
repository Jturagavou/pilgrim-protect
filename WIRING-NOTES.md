# Pilgrim Protect — Wiring Notes

Integration report documenting how the three services connect and what changes were made during wiring.

## Architecture Overview

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Next.js    │     │   Express    │     │     Expo     │
│   Website    │────▶│     API      │◀────│  Mobile App  │
│  :3000       │     │   :5000      │     │  (Expo Go)   │
└──────────────┘     └──────┬───────┘     └──────────────┘
                            │
                     ┌──────▼───────┐
                     │   MongoDB    │
                     │   :27017     │
                     └──────────────┘
```

Both the website and mobile app connect to the same Express API independently. They share the same JWT-based auth system, the same Mongoose models, and the same data.

## Changes Made During Wiring

### 1. Mongoose 9 Pre-Save Hook Fix (Critical)

**Files:** `api/models/Worker.js`, `api/models/Donor.js`

**Problem:** Both models used the Mongoose 7-style `pre('save', async function(next) { ... next(); })` pattern. Mongoose 9 async pre-save hooks do not receive a `next` callback — calling `next()` throws `TypeError: next is not a function`.

**Fix:** Changed to `pre('save', async function() { ... return; })` — removed the `next` parameter and replaced `return next()` with `return`.

### 2. Environment Variables Created

**`api/.env`** — Created from `.env.example` with:
- `MONGO_URI=mongodb://127.0.0.1:27017/pilgrim-protect`
- `JWT_SECRET=pilgrim-protect-dev-secret-key-2026`
- `PORT=5000`, `CLIENT_URL=http://localhost:3000`
- Cloudinary and Stripe left as mock placeholders

**`web/.env.local`** — Updated:
- Changed `NEXT_PUBLIC_MOCK=true` → `NEXT_PUBLIC_MOCK=false` to connect to real backend
- `NEXT_PUBLIC_API_URL=http://localhost:5000/api` (was already correct)
- `NEXT_PUBLIC_MAPBOX_TOKEN=pk.placeholder` (needs a real token for map rendering)

**`mobile/.env`** — Created:
- `EXPO_PUBLIC_API_URL=http://localhost:5000/api`
- For physical device testing, replace `localhost` with your machine's local IP

### 3. Infrastructure Files Added

- `start-dev.sh` — Bash script that starts API + Web (and optionally Mobile) in parallel
- `docker-compose.yml` — Docker Compose with MongoDB, API, and Web services
- `api/Dockerfile` — Node 22 Alpine production image for the API
- `web/Dockerfile` — Node 22 Alpine production image for the website

## API Contract Verification

All three pieces were verified to follow the shared contract:

| Contract Point | Status | Notes |
|---|---|---|
| API on port 5000 | Verified | `server.js` listens on `PORT` env (default 5000) |
| Web on port 3000 | Verified | Next.js default port |
| Auth: JWT Bearer token | Verified | Both web (`lib/api.js` interceptor) and mobile (`src/lib/api.js` interceptor) attach `Authorization: Bearer <token>` |
| Token payload: `{ id, role }` | Verified | Generated in `routes/auth.js` → `jwt.sign({ id, role })` |
| Field names: camelCase | Verified | All Mongoose models use camelCase; all frontends match |
| GeoJSON FeatureCollection | Verified | `GET /api/stats/map` returns proper GeoJSON; web `MapView.js` and homepage consume `features` array |
| Photo upload flow | Verified | Mobile `uploadImage()` sends multipart `image` field → API `upload.single('image')` handler |
| Test accounts | Verified | All 4 accounts (worker1, worker2, admin, donor) seed correctly and login successfully |

## Endpoint Test Results

| Endpoint | Method | Auth | Result |
|---|---|---|---|
| `/api/health` | GET | No | `{ status: "ok" }` |
| `/api/stats/impact` | GET | No | Returns `totalSchools: 10, totalRoomsSprayed: 43, totalStudentsProtected: 2330, totalSprayReports: 5` |
| `/api/stats/map` | GET | No | Returns `FeatureCollection` with 10 Point features |
| `/api/stats/timeline` | GET | No | Returns monthly aggregation (2 entries) |
| `/api/schools` | GET | No | Returns 10 schools sorted by name |
| `/api/schools/:id` | GET | No | Returns school + populated `sprayReports` array + `sponsor` |
| `/api/auth/login` | POST | No | Returns `{ token, user: { _id, name, email, role } }` |
| `/api/auth/register` | POST | No | Creates user and returns token |
| `/api/auth/me` | GET | Yes | Returns current user object |
| `/api/spray-reports` | POST | Worker | Creates report, updates school `lastSprayDate` |
| `/api/spray-reports` | GET | No | Returns filtered reports with populated school/worker |
| `/api/spray-reports/mine` | GET | Worker | Returns worker's own reports |
| `/api/upload/image` | POST | Yes | Returns `{ url }` (mock Cloudinary URL in dev) |
| `/api/donations/checkout` | POST | Donor | Creates donation, returns mock `sessionUrl` |
| `/api/donations/mine` | GET | Donor | Returns donor's donation history |

## Data Flow: Spray Report Lifecycle

1. **Worker logs in** (mobile) → `POST /api/auth/login` → receives JWT
2. **Worker sees schools** (mobile) → `GET /api/schools` → shows list with color-coded status
3. **Worker submits report** (mobile) → `POST /api/spray-reports` with `{ school, date, roomsSprayed, photos, notes, gpsCoords }`
4. **API updates school** → sets `lastSprayDate` and `status: "active"` on the school
5. **Website shows updated map** → `GET /api/stats/map` → the school's marker turns green
6. **Donor views school profile** (web) → `GET /api/schools/:id` → sees the new spray report in timeline

## Data Flow: Donor Flow

1. **Donor registers** (web) → `POST /api/auth/register` with `role: "donor"`
2. **Donor logs in** (web) → `POST /api/auth/login` → token stored in localStorage
3. **Donor donates** (web) → `POST /api/donations/checkout` → receives mock Stripe session URL
4. **Donor portal** (web) → `GET /api/donations/mine` → sees donation history

## Known Limitations

1. **Mapbox Token**: The `NEXT_PUBLIC_MAPBOX_TOKEN` is set to `pk.placeholder`. The interactive map will not render tiles until a valid Mapbox access token is provided. Get one free at [mapbox.com](https://mapbox.com).

2. **Cloudinary Mock Mode**: Image uploads return mock URLs. Set `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, and `CLOUDINARY_API_SECRET` in `api/.env` for real uploads.

3. **Stripe Mock Mode**: Donations create records but use mock payment IDs. Set `STRIPE_SECRET_KEY` in `api/.env` for real payments.

4. **Mobile on Physical Device**: The `EXPO_PUBLIC_API_URL` must use your machine's local IP (not `localhost`) for the mobile app to reach the API when running on a physical device via Expo Go.

5. **Offline Queue**: The mobile app's offline queue (`src/lib/offlineQueue.js`) stores reports in AsyncStorage when offline and auto-syncs when connectivity returns. This works independently of the backend.

## How to Run

### Quick Start (local development)
```bash
# 1. Start MongoDB (must be running)
# 2. Seed the database
cd api && npm run seed

# 3. Start everything
cd .. && ./start-dev.sh
```

### With Docker
```bash
docker-compose up --build
# Then seed: docker exec pilgrim-api node seed/seed.js
```

### Mobile (Expo)
```bash
cd mobile
# Edit .env → set EXPO_PUBLIC_API_URL to your machine's IP
npx expo start
# Scan QR code with Expo Go app
```
