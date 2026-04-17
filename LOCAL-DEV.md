# Local development — see the full site on your Mac

Use this when you want **localhost** previews of everything we build before anything goes to production.

## What you get

| URL | What |
|-----|------|
| **http://localhost:3000** | Next.js donor site (home, map, schools, etc.) |
| **http://localhost:8080/api/v1/...** | Express API (same contract as production) |
| **MongoDB** | Local `mongodb://localhost:27017/pilgrim-protect` (or Atlas) |

## Prerequisites

- **Node.js** 20+ (22 matches the Dockerfiles)
- **MongoDB** running locally **or** a MongoDB Atlas URI in `api/.env`

### MongoDB on your machine (pick one)

**A. Homebrew**

```bash
brew services start mongodb-community@7
# or: mongod --config /opt/homebrew/etc/mongod.conf
```

**B. Docker (database only)**

```bash
cd /path/to/pilgrim-protect
docker compose up mongo -d
```

This exposes port **27017** — matches `MONGODB_URI=mongodb://localhost:27017/pilgrim-protect` in `api/.env.example`.

## One-time setup

### 1. API environment

```bash
cd api
cp .env.example .env
```

Edit `api/.env`:

- **`JWT_SECRET`** — any long random string (e.g. `openssl rand -hex 32`)
- **`MONGODB_URI`** — leave default for local Mongo, or paste Atlas
- **`PORT`** — default **8080** (must match `NEXT_PUBLIC_API_URL` in the web app)

### 2. Web environment

```bash
cd web
cp .env.local.example .env.local
```

Edit `web/.env.local`:

- **`NEXT_PUBLIC_MAPBOX_TOKEN`** — required for the map; from [Mapbox](https://account.mapbox.com/)
- **`NEXT_PUBLIC_MOCK=false`** — so the site uses the **real API** and database (recommended while we build)
- **`NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1`** — already correct if API is on 8080

### 3. Install dependencies

```bash
cd api && npm install
cd ../web && npm install
```

### 4. Seed the database (demo schools + test logins)

```bash
cd api && npm run seed
```

See `api/README.md` for test accounts (worker / admin / donor).

## Run everything

From the **repo root**:

```bash
chmod +x start-dev.sh   # once, if needed
./start-dev.sh
```

Or seed on first run:

```bash
./start-dev.sh --seed
```

Then open **http://localhost:3000**.

- **Homepage** — stats pull from `GET /api/v1/stats` when `NEXT_PUBLIC_MOCK=false`
- **Map** — loads GeoJSON from `GET /api/v1/stats/map`

Stop with **Ctrl+C** (stops API + web started by the script).

### Two terminals (alternative)

```bash
# Terminal 1
cd api && npm run dev

# Terminal 2
cd web && npm run dev
```

## Push to the repo (no hosting required)

```bash
git status
git add -p
git commit -m "Describe your change in a full sentence."
git push origin main
```

Production deploy (DigitalOcean, etc.) is separate — see [DEPLOYMENT.md](./DEPLOYMENT.md).

## Troubleshooting

| Issue | What to check |
|--------|----------------|
| Web shows empty stats / errors | API running? `curl http://localhost:8080/health`. `NEXT_PUBLIC_MOCK=false` and `NEXT_PUBLIC_API_URL` ends with `/api/v1` |
| Map is blank | `NEXT_PUBLIC_MAPBOX_TOKEN` set in `web/.env.local` |
| API connection refused | `PORT` in `api/.env` is **8080**, not 5000 |
| Mongo errors | Mongo running on 27017, or Atlas URI reachable from your network |
