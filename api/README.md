# Pilgrim Protect API

Backend API for the Pilgrim Protect malaria prevention platform. This Express server provides data to both the Next.js donor website and the Expo React Native worker app.

## Quick Start

### 1. Install dependencies

```bash
cd api
npm install
```

### 2. Set up environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable | Description | Default |
|---|---|---|
| `PORT` | Server port | `8080` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/pilgrim-protect` |
| `JWT_SECRET` | Secret key for JWT signing | *(must set)* |
| `JWT_EXPIRE` | Token expiry duration | `30d` |
| `ALLOWED_ORIGINS` | Comma-separated browser origins allowed by CORS | `http://localhost:3000` |
| `CLIENT_URL` | Legacy single-origin fallback for CORS | `http://localhost:3000` |

Optional (mock mode used if not set):

| Variable | Description |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Legacy placeholder only — v1 does not use in-app Stripe |

Production on DigitalOcean reads most settings from [`../.do/app.yaml`](../.do/app.yaml).
For browser traffic, the important pairing is:

- web service sets `NEXT_PUBLIC_API_URL`
- api service allows the deployed web origin via `ALLOWED_ORIGINS`

### 3. Seed the database

Make sure MongoDB is running, then:

```bash
npm run seed
```

This creates 10 Uganda schools, 2 test workers, 1 admin, 1 donor, and 5 spray reports.

### 4. Start the server

```bash
npm start
```

Or with auto-reload for development:

```bash
npm run dev
```

The API runs at `http://localhost:8080`.

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Worker | worker1@test.com | password123 |
| Worker | worker2@test.com | password123 |
| Admin | admin@test.com | password123 |
| Donor | donor@test.com | password123 |

## API Endpoints

### Auth
- `POST /api/v1/auth/register` — Register (worker or donor)
- `POST /api/v1/auth/login` — Login
- `GET /api/v1/auth/me` — Get current user (auth required)

### Schools
- `GET /api/v1/schools` — List all schools
- `GET /api/v1/schools/:id` — Get school + spray reports
- `POST /api/v1/schools` — Create school (admin)
- `PUT /api/v1/schools/:id` — Update school (admin)

### Spray Reports
- `POST /api/v1/spray-reports` — Submit report (worker)
- `GET /api/v1/spray-reports` — List reports (filterable)
- `GET /api/v1/spray-reports/mine` — Worker's own reports

### Stats (public)
- `GET /api/v1/stats` — Homepage summary stats
- `GET /api/v1/stats/impact` — Aggregate impact numbers
- `GET /api/v1/stats/map` — GeoJSON FeatureCollection for map
- `GET /api/v1/stats/timeline` — Monthly spray data

### Upload
- `POST /api/v1/upload/image` — Upload image (auth required)

### Donations
- `POST /api/v1/donations/checkout` — Disabled for v1 pilot (returns a not-enabled response)
- `GET /api/v1/donations/mine` — Donor's donation records

### Health
- `GET /health` — Server health check
