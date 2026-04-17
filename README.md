# Pilgrim Protect

Donor website (`web/`) + Express API (`api/`) + optional Expo app (`mobile/`).

**→ [SPEC_STATUS.md](./SPEC_STATUS.md)** — v1 pilot scope (locked), what shipped vs OM planning docs.

## See it on your machine (local)

**→ [LOCAL-DEV.md](./LOCAL-DEV.md)** — MongoDB, env files, seed, and `./start-dev.sh` so you can open **http://localhost:3000** while we build.

Quick version:

```bash
cp api/.env.example api/.env
cp web/.env.local.example web/.env.local   # add Mapbox token for the map
cd api && npm install && npm run seed
cd .. && ./start-dev.sh
```

## Deploy to production

**→ [DEPLOYMENT.md](./DEPLOYMENT.md)** (DigitalOcean App Platform).

## Reference data

**→ [data/osm/README.md](./data/osm/README.md)** — OSM-derived school subset for prototyping (not auto-loaded into the DB).

**→ [data/real-schools/README.md](./data/real-schools/README.md)** — CSV template + import path for real school lists (e.g. Agre’s spreadsheet).

## Repo layout

| Path | Purpose |
|------|---------|
| `web/` | Next.js 16 donor site |
| `api/` | Express API (`/api/v1/*`) |
| `mobile/` | Expo field app |
| `.do/app.yaml` | DigitalOcean app spec |
