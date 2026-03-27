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
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/pilgrim-protect` |
| `JWT_SECRET` | Secret key for JWT signing | *(must set)* |
| `JWT_EXPIRE` | Token expiry duration | `30d` |
| `CLIENT_URL` | Next.js frontend URL for CORS | `http://localhost:3000` |

Optional (mock mode used if not set):

| Variable | Description |
|---|---|
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `STRIPE_SECRET_KEY` | Stripe secret key |

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

The API runs at `http://localhost:5000`.

## Test Accounts

| Role | Email | Password |
|---|---|---|
| Worker | worker1@test.com | password123 |
| Worker | worker2@test.com | password123 |
| Admin | admin@test.com | password123 |
| Donor | donor@test.com | password123 |

## API Endpoints

### Auth
- `POST /api/auth/register` — Register (worker or donor)
- `POST /api/auth/login` — Login
- `GET /api/auth/me` — Get current user (auth required)

### Schools
- `GET /api/schools` — List all schools
- `GET /api/schools/:id` — Get school + spray reports
- `POST /api/schools` — Create school (admin)
- `PUT /api/schools/:id` — Update school (admin)

### Spray Reports
- `POST /api/spray-reports` — Submit report (worker)
- `GET /api/spray-reports` — List reports (filterable)
- `GET /api/spray-reports/mine` — Worker's own reports

### Stats (public)
- `GET /api/stats/impact` — Aggregate impact numbers
- `GET /api/stats/map` — GeoJSON FeatureCollection for map
- `GET /api/stats/timeline` — Monthly spray data

### Upload
- `POST /api/upload/image` — Upload image (auth required)

### Donations
- `POST /api/donations/checkout` — Mock Stripe checkout (donor)
- `GET /api/donations/mine` — Donor's donations

### Health
- `GET /api/health` — Server health check
