# Pilgrim Protect — Parallel Build Prompts

These are three prompts for three parallel Cowork conversations. Each builds one piece of the platform. A 4th conversation will wire them together. Every prompt contains the same shared contract so all pieces connect cleanly.

---
---

## PROMPT 1 — BACKEND API

```
You are building the backend API for Pilgrim Protect — a malaria prevention platform for Uganda. This API will be consumed by TWO other apps being built in parallel: a Next.js donor website and an Expo React Native worker app. You must follow the shared contract below EXACTLY so everything connects when wired together.

Save all files to the project folder under: /api/

## TECH STACK
- Node.js + Express
- MongoDB with Mongoose
- JWT auth (jsonwebtoken + bcryptjs)
- Cloudinary for image uploads (multer + cloudinary)
- CORS enabled for http://localhost:3000 (web) and all origins (mobile)

## FOLDER STRUCTURE (you must follow this exactly)
```
/api/
  server.js                 ← entry point, runs on port 5000
  .env.example              ← template for env vars
  /config/
    db.js                   ← MongoDB connection
    cloudinary.js           ← Cloudinary config
  /models/
    School.js
    SprayReport.js
    Worker.js
    Donor.js
    Donation.js
  /routes/
    auth.js                 ← /api/auth/*
    schools.js              ← /api/schools/*
    sprayReports.js         ← /api/spray-reports/*
    donations.js            ← /api/donations/*
    stats.js                ← /api/stats/*
    upload.js               ← /api/upload/*
  /middleware/
    auth.js                 ← JWT verification + role guard
    errorHandler.js
  /seed/
    seed.js                 ← populates DB with mock schools + workers
    schools.json            ← 10 real Uganda schools with coordinates
```

## SHARED DATA MODELS (Mongoose schemas — field names must match exactly)

### School
```json
{
  "_id": "ObjectId",
  "name": "String, required",
  "district": "String, required",
  "location": {
    "type": "Point",
    "coordinates": ["Number (longitude)", "Number (latitude)"]
  },
  "totalRooms": "Number",
  "studentCount": "Number",
  "photos": ["String — Cloudinary URLs"],
  "sponsor": "ObjectId ref → Donor | null",
  "status": "String enum: pending | active | completed",
  "lastSprayDate": "Date | null",
  "createdAt": "Date",
  "updatedAt": "Date"
}
```

### SprayReport
```json
{
  "_id": "ObjectId",
  "school": "ObjectId ref → School, required",
  "worker": "ObjectId ref → Worker, required",
  "date": "Date, required",
  "roomsSprayed": "Number, required",
  "photos": ["String — Cloudinary URLs"],
  "notes": "String",
  "gpsCoords": {
    "lat": "Number",
    "lng": "Number"
  },
  "verified": "Boolean, default: false",
  "createdAt": "Date"
}
```

### Worker
```json
{
  "_id": "ObjectId",
  "name": "String, required",
  "email": "String, required, unique",
  "phone": "String",
  "password": "String — bcrypt hashed",
  "assignedSchools": ["ObjectId ref → School"],
  "role": "String enum: worker | supervisor",
  "active": "Boolean, default: true",
  "createdAt": "Date"
}
```

### Donor
```json
{
  "_id": "ObjectId",
  "name": "String, required",
  "email": "String, required, unique",
  "password": "String — bcrypt hashed",
  "stripeCustomerId": "String",
  "sponsoredSchools": ["ObjectId ref → School"],
  "totalDonated": "Number, default: 0",
  "receiveUpdates": "Boolean, default: true",
  "createdAt": "Date"
}
```

### Donation
```json
{
  "_id": "ObjectId",
  "donor": "ObjectId ref → Donor, required",
  "school": "ObjectId ref → School | null (general fund)",
  "amount": "Number, required — in cents",
  "currency": "String, default: usd",
  "stripePaymentId": "String",
  "recurring": "Boolean, default: false",
  "status": "String enum: pending | completed | failed",
  "createdAt": "Date"
}
```

## API ENDPOINTS (exact paths — the website and mobile app will call these)

### Auth
POST   /api/auth/register     → body: { name, email, password, role: "worker"|"donor" } → returns: { token, user: { _id, name, email, role } }
POST   /api/auth/login        → body: { email, password } → returns: { token, user: { _id, name, email, role } }
GET    /api/auth/me           → header: Authorization: Bearer <token> → returns: { user }

### Schools
GET    /api/schools            → returns: [School] (populated with lastSprayDate)
GET    /api/schools/:id        → returns: School + populated sprayReports array
POST   /api/schools            → admin only → body: { name, district, location, totalRooms, studentCount } → returns: School
PUT    /api/schools/:id        → admin only → body: partial School → returns: updated School

### Spray Reports
POST   /api/spray-reports      → worker auth required → body: { school, date, roomsSprayed, photos, notes, gpsCoords } → returns: SprayReport (also updates School.lastSprayDate)
GET    /api/spray-reports      → query params: ?school=id&worker=id&startDate=&endDate= → returns: [SprayReport] populated with school.name and worker.name
GET    /api/spray-reports/mine → worker auth required → returns: [SprayReport] for the logged-in worker

### Stats (public — no auth needed)
GET    /api/stats/impact       → returns: { totalSchools, totalRoomsSprayed, totalStudentsProtected, totalSprayReports }
GET    /api/stats/map          → returns: GeoJSON FeatureCollection:
```json
{
  "type": "FeatureCollection",
  "features": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [lng, lat] },
      "properties": {
        "_id": "school_id",
        "name": "School Name",
        "district": "District",
        "studentCount": 450,
        "totalRooms": 12,
        "status": "active",
        "lastSprayDate": "2026-03-20T00:00:00Z",
        "totalSprayReports": 3,
        "thumbnailUrl": "https://res.cloudinary.com/..."
      }
    }
  ]
}
```
GET    /api/stats/timeline     → returns: [{ month: "2026-01", roomsSprayed: 45, reportsCount: 8 }]

### Upload
POST   /api/upload/image       → multipart form, field name: "image" → returns: { url: "https://res.cloudinary.com/..." }

### Donations (mock for now — Stripe integration later)
POST   /api/donations/checkout → body: { schoolId (optional), amount, recurring } → returns: { sessionUrl: "mock_stripe_url" }
GET    /api/donations/mine     → donor auth required → returns: [Donation]

## AUTH TOKEN FORMAT
JWT payload: { id: user._id, role: "worker"|"donor"|"admin" }
Header: Authorization: Bearer <token>
Token expiry: 30 days

## SEED DATA
Create seed.js that populates:
- 10 real Uganda schools with real GPS coordinates (look these up):
  - Schools in districts: Gulu, Lira, Soroti, Jinja, Mbale, Tororo, Iganga, Kamuli, Pallisa, Kumi
  - Each school: name, district, coordinates, totalRooms (8-20), studentCount (200-800)
- 2 test workers: worker1@test.com / password123, worker2@test.com / password123
- 1 test admin: admin@test.com / password123
- 1 test donor: donor@test.com / password123
- 5 sample spray reports across different schools

## WHAT CONNECTS TO THIS
- The WEBSITE (Next.js on port 3000) will call all /api/stats/*, /api/schools/*, /api/auth/* (donor), and /api/donations/* endpoints
- The WORKER APP (Expo) will call /api/auth/login, /api/schools, /api/spray-reports, /api/spray-reports/mine, and /api/upload/image
- Both will send Authorization: Bearer <token> in headers for protected routes

## WHAT TO BUILD
1. Full Express server with all routes, models, and middleware
2. Seed script with realistic mock data
3. .env.example with all required variables listed
4. README.md with setup instructions (npm install, env vars, npm run seed, npm start)
5. Use mock/placeholder for Cloudinary and Stripe (return fake URLs and session URLs) so it works without real API keys
6. Server must run on port 5000
7. All responses must follow the exact JSON shapes above
```

---
---

## PROMPT 2 — DONOR WEBSITE (Next.js)

```
You are building the donor-facing website for Pilgrim Protect — a malaria prevention platform for Uganda. This website consumes a backend API being built in parallel. You must follow the shared contract below EXACTLY so everything connects when wired together.

Save all files to the project folder under: /web/

## TECH STACK
- Next.js 15 (App Router)
- Tailwind CSS
- shadcn/ui components
- Mapbox GL JS via react-map-gl
- Chart.js via react-chartjs-2
- Axios for API calls

## FOLDER STRUCTURE (you must follow this exactly)
```
/web/
  next.config.js
  .env.local.example
  tailwind.config.js
  /app/
    layout.js               ← root layout with nav + footer
    page.js                 ← homepage
    /map/
      page.js               ← full interactive map
    /schools/
      [id]/
        page.js             ← individual school profile
    /dashboard/
      page.js               ← impact stats dashboard
    /donate/
      page.js               ← donation page
      success/
        page.js             ← post-donation thank you
    /stories/
      page.js               ← storytelling page
    /about/
      page.js               ← about Pilgrim Africa
    /auth/
      login/
        page.js             ← donor login
      register/
        page.js             ← donor registration
    /portal/
      page.js               ← donor portal (my sponsored schools, donation history)
  /components/
    Navbar.js
    Footer.js
    MapView.js              ← Mapbox map component
    SchoolMarker.js         ← marker + popup for map
    SchoolCard.js           ← card used in lists
    ImpactCounter.js        ← animated stat counter
    SprayTimeline.js        ← timeline of spray reports
    DonateButton.js
    PhotoGallery.js
  /lib/
    api.js                  ← axios instance, base URL, auth headers
    auth.js                 ← token storage, login/logout helpers
    formatters.js           ← date formatting, number formatting
  /public/
    /images/                ← static assets (logo, hero image placeholders)
```

## API BASE URL
The backend runs at: http://localhost:5000
All API calls go through /lib/api.js which creates an axios instance:
```js
const API = axios.create({ baseURL: "http://localhost:5000/api" });
```
For auth'd requests, attach: Authorization: Bearer <token from localStorage>

## ENDPOINTS THIS WEBSITE CALLS (exact paths and response shapes)

### Public (no auth)
GET /api/stats/map → response:
```json
{
  "type": "FeatureCollection",
  "features": [{
    "type": "Feature",
    "geometry": { "type": "Point", "coordinates": [32.29, 2.77] },
    "properties": {
      "_id": "abc123",
      "name": "Gulu Primary School",
      "district": "Gulu",
      "studentCount": 450,
      "totalRooms": 12,
      "status": "active",
      "lastSprayDate": "2026-03-20T00:00:00Z",
      "totalSprayReports": 3,
      "thumbnailUrl": "https://res.cloudinary.com/..."
    }
  }]
}
```

GET /api/stats/impact → response:
```json
{
  "totalSchools": 10,
  "totalRoomsSprayed": 87,
  "totalStudentsProtected": 4500,
  "totalSprayReports": 23
}
```

GET /api/stats/timeline → response:
```json
[{ "month": "2026-01", "roomsSprayed": 45, "reportsCount": 8 }]
```

GET /api/schools → response: array of School objects
GET /api/schools/:id → response: School object with sprayReports array:
```json
{
  "_id": "abc123",
  "name": "Gulu Primary School",
  "district": "Gulu",
  "location": { "type": "Point", "coordinates": [32.29, 2.77] },
  "totalRooms": 12,
  "studentCount": 450,
  "photos": ["https://res.cloudinary.com/..."],
  "sponsor": null,
  "status": "active",
  "lastSprayDate": "2026-03-20T00:00:00Z",
  "sprayReports": [
    {
      "_id": "def456",
      "date": "2026-03-20T00:00:00Z",
      "roomsSprayed": 6,
      "photos": ["url1", "url2"],
      "notes": "Sprayed 6 classrooms, headmaster present",
      "worker": { "name": "James Okello" },
      "verified": true
    }
  ]
}
```

### Auth (donor registration/login)
POST /api/auth/register → body: { name, email, password, role: "donor" } → response: { token, user: { _id, name, email, role } }
POST /api/auth/login → body: { email, password } → response: { token, user: { _id, name, email, role } }
GET /api/auth/me → header: Authorization: Bearer <token> → response: { user }

### Donations
POST /api/donations/checkout → body: { schoolId, amount, recurring } → response: { sessionUrl }
GET /api/donations/mine → auth required → response: [Donation]

## MAPBOX SETUP
- Use react-map-gl wrapper
- Access token from env: NEXT_PUBLIC_MAPBOX_TOKEN
- Default center: [32.29, 2.77] (Uganda)
- Default zoom: 7
- Use Mapbox Streets style (or custom style if token works)
- School markers: colored by status — green (active/recently sprayed), orange (pending), red (overdue >90 days)
- On marker click: popup with school name, district, student count, last spray date, thumbnail, "View Profile" link, "Sponsor" button
- flyTo animation on marker click

## MOCK MODE
Since the backend may not be running yet, create a mock mode:
- /lib/api.js should check: if process.env.NEXT_PUBLIC_MOCK === "true", return mock data instead of calling the API
- Create /lib/mockData.js with hardcoded responses matching the exact shapes above
- Use the same 10 Uganda schools the backend uses (Gulu, Lira, Soroti, Jinja, Mbale, Tororo, Iganga, Kamuli, Pallisa, Kumi)
- This way the website works standalone AND connects to the real backend when ready

## PAGES TO BUILD

1. Homepage — hero section, animated impact counters (from /api/stats/impact), mini map preview, "Explore the Map" CTA, "Sponsor a School" CTA
2. Map page — full-screen Mapbox map, school markers from /api/stats/map, click for popup, sidebar with school list filter
3. School profile — /schools/[id] — school name, district, location on mini map, photo gallery, spray history timeline, "Sponsor This School" button
4. Dashboard — impact numbers, Chart.js line chart (spray activity from /api/stats/timeline), bar chart (rooms per district)
5. Donate page — choose school or general fund, amount picker, Stripe checkout (mocked for now)
6. Stories page — grid of story cards with worker photos and narratives (hardcoded for prototype)
7. About page — mission statement, how spraying works, the team
8. Auth pages — simple login/register forms for donors
9. Donor portal — list of sponsored schools, donation history, total impact

## WHAT CONNECTS TO THIS
- The BACKEND API on port 5000 serves all data
- The WORKER APP (Expo) does NOT connect to this — it connects to the same backend independently
- When Conversation 4 wires everything: it will set the API base URL, add the real Mapbox token, and verify all data flows

## WHAT TO BUILD
1. Full Next.js app with all pages and components listed above
2. Working Mapbox map with markers (use placeholder token or mock if needed)
3. Mock data layer so the site works standalone
4. Responsive design — mobile-friendly
5. .env.local.example listing: NEXT_PUBLIC_API_URL, NEXT_PUBLIC_MAPBOX_TOKEN, NEXT_PUBLIC_MOCK
6. README.md with setup instructions
```

---
---

## PROMPT 3 — FIELD WORKER APP (Expo)

```
You are building the field worker mobile app for Pilgrim Protect — a malaria prevention platform for Uganda. This app consumes a backend API being built in parallel. You must follow the shared contract below EXACTLY so everything connects when wired together.

Save all files to the project folder under: /mobile/

## TECH STACK
- Expo (React Native, managed workflow)
- React Navigation (stack navigator)
- expo-secure-store (JWT storage)
- expo-camera (photo capture)
- expo-location (GPS)
- expo-image-picker (photo selection)
- AsyncStorage (offline queue)
- Axios for API calls

## FOLDER STRUCTURE (you must follow this exactly)
```
/mobile/
  App.js                    ← entry point, navigation setup
  app.json                  ← Expo config
  .env.example
  /src/
    /screens/
      LoginScreen.js
      SchoolListScreen.js
      SprayReportScreen.js
      MyReportsScreen.js
    /components/
      SchoolCard.js
      ReportCard.js
      PhotoPicker.js
      OfflineBanner.js      ← shows "1 report pending upload" banner
    /lib/
      api.js                ← axios instance, base URL, auth headers
      auth.js               ← store/retrieve JWT from SecureStore
      offlineQueue.js       ← AsyncStorage queue for offline submissions
      location.js           ← GPS helper
    /mock/
      mockData.js           ← mock API responses matching backend contract
  /assets/
    icon.png
    splash.png
```

## API BASE URL
The backend runs at: http://localhost:5000 (for dev, use your machine's local IP for Expo: http://192.168.x.x:5000)
All API calls go through /src/lib/api.js which creates an axios instance:
```js
const API = axios.create({ baseURL: "http://192.168.1.x:5000/api" });
// or use env var: process.env.EXPO_PUBLIC_API_URL
```
For auth'd requests, attach: Authorization: Bearer <token from SecureStore>

## ENDPOINTS THIS APP CALLS (exact paths and response shapes)

### Auth
POST /api/auth/login → body: { email, password } → response:
```json
{
  "token": "eyJhbG...",
  "user": { "_id": "abc123", "name": "James Okello", "email": "worker1@test.com", "role": "worker" }
}
```
Store the token in expo-secure-store under key: "auth_token"
Store the user object in expo-secure-store under key: "auth_user" (JSON.stringify)

GET /api/auth/me → header: Authorization: Bearer <token> → response: { user }

### Schools (worker sees their assigned schools)
GET /api/schools → response: array of School objects:
```json
[{
  "_id": "abc123",
  "name": "Gulu Primary School",
  "district": "Gulu",
  "location": { "type": "Point", "coordinates": [32.29, 2.77] },
  "totalRooms": 12,
  "studentCount": 450,
  "status": "active",
  "lastSprayDate": "2026-03-20T00:00:00Z"
}]
```
NOTE: For the prototype, show ALL schools. In the future, filter by worker.assignedSchools.

### Spray Reports
POST /api/spray-reports → auth required → body:
```json
{
  "school": "school_object_id",
  "date": "2026-03-25T00:00:00Z",
  "roomsSprayed": 6,
  "photos": ["https://res.cloudinary.com/...", "https://res.cloudinary.com/..."],
  "notes": "Sprayed 6 classrooms, headmaster was present",
  "gpsCoords": { "lat": 2.7747, "lng": 32.2990 }
}
```
Response: the created SprayReport object

GET /api/spray-reports/mine → auth required → response:
```json
[{
  "_id": "def456",
  "school": { "_id": "abc123", "name": "Gulu Primary School", "district": "Gulu" },
  "date": "2026-03-20T00:00:00Z",
  "roomsSprayed": 6,
  "photos": ["url1", "url2"],
  "notes": "Sprayed 6 classrooms",
  "verified": true,
  "createdAt": "2026-03-20T12:34:56Z"
}]
```

### Image Upload
POST /api/upload/image → multipart form data, field name: "image" → response:
```json
{ "url": "https://res.cloudinary.com/demo/image/upload/v12345/spray_photo.jpg" }
```
Upload photos BEFORE submitting the spray report. Collect the returned URLs, then include them in the spray report POST body.

## SCREENS TO BUILD (4 screens only — keep it simple)

### 1. LoginScreen
- Email + password fields
- "Login" button → POST /api/auth/login
- On success: store token + user in SecureStore, navigate to SchoolListScreen
- On error: show error message
- No registration — workers are created by admin via seed script
- Test credentials: worker1@test.com / password123

### 2. SchoolListScreen
- Fetch GET /api/schools on mount
- Display as scrollable list of SchoolCard components
- Each card shows: school name, district, room count, last spray date
- Color indicator: green if sprayed in last 30 days, orange if 30-90 days, red if >90 days or never
- Tap a school → navigate to SprayReportScreen with school data passed as param

### 3. SprayReportScreen
- Pre-filled school name at top (from navigation param)
- Date picker (default: today)
- Number input: rooms sprayed
- Photo section: "Add Photos" button → opens camera or gallery (expo-image-picker)
  - Show photo thumbnails after selection
  - On submit: upload each photo to POST /api/upload/image, collect URLs
- Notes text input (optional)
- Auto-capture GPS on screen load (expo-location)
- "Submit Report" button:
  1. Upload photos → get URLs
  2. POST /api/spray-reports with all data
  3. On success: navigate back to SchoolListScreen, show success toast
  4. On failure / no internet: save to offline queue

### 4. MyReportsScreen
- Fetch GET /api/spray-reports/mine on mount
- Display as scrollable list of ReportCard components
- Each card shows: school name, date, rooms sprayed, verified badge (checkmark if verified: true), photo count
- Pull-to-refresh

### Navigation Structure
```
Stack Navigator:
  LoginScreen (initial if no token)
  → SchoolListScreen (home — has tab bar or header buttons for "My Reports")
  → SprayReportScreen (push from SchoolListScreen)
  → MyReportsScreen (accessible from SchoolListScreen header)
```

## OFFLINE QUEUE (critical for Uganda field conditions)
/src/lib/offlineQueue.js must:
- Check navigator.onLine or NetInfo before submitting
- If offline: save the full report payload (including base64 photos) to AsyncStorage under key: "offline_queue"
- Show OfflineBanner component: "1 report waiting to upload"
- When connectivity returns: automatically attempt to upload photos and submit queued reports
- On successful sync: remove from queue, show success notification
- Queue is an array — multiple reports can be queued

## MOCK MODE
Since the backend may not be running yet, create a mock mode:
- /src/lib/api.js should check: if __DEV__ and no backend reachable, use mock responses
- /src/mock/mockData.js has hardcoded responses matching the exact shapes above
- Use the same 10 Uganda schools as the backend (Gulu, Lira, Soroti, Jinja, Mbale, Tororo, Iganga, Kamuli, Pallisa, Kumi)
- Mock login accepts worker1@test.com / password123

## WHAT CONNECTS TO THIS
- The BACKEND API on port 5000 serves all data and receives spray reports
- The WEBSITE (Next.js) does NOT connect to this — they both connect to the same backend independently
- When Conversation 4 wires everything: it will set the real API URL, test the full flow (login → select school → submit report → verify it appears on the website map)

## WHAT TO BUILD
1. Full Expo app with all 4 screens and components
2. Working camera/photo picker integration
3. GPS capture
4. Offline queue with AsyncStorage
5. Mock data layer so the app works standalone
6. Clean, simple UI — workers in Uganda will use this on low-end phones
7. .env.example listing: EXPO_PUBLIC_API_URL
8. README.md with setup instructions (npx expo start)
```

---
---

## PROMPT 4 — WIRING CONVERSATION (use after the other 3 are done)

```
You are the integration engineer for Pilgrim Protect. Three parallel conversations have built three pieces of the platform, all saved in the project folder:

- /api/    — Express + MongoDB backend (port 5000)
- /web/    — Next.js donor website (port 3000)
- /mobile/ — Expo React Native worker app

Your job is to wire them together and verify everything connects. Here's what to do:

1. READ all three README files and understand each piece
2. Verify folder structures match the spec
3. Set up environment variables:
   - /api/.env — MongoDB URI, JWT secret, Cloudinary (use test keys or mocks), port 5000
   - /web/.env.local — NEXT_PUBLIC_API_URL=http://localhost:5000, NEXT_PUBLIC_MAPBOX_TOKEN, NEXT_PUBLIC_MOCK=false
   - /mobile/.env — EXPO_PUBLIC_API_URL=http://localhost:5000
4. Start the backend, run the seed script, verify seed data in the API responses
5. Start the website, verify:
   - /api/stats/map returns GeoJSON → map shows 10 school markers
   - /api/stats/impact returns numbers → homepage counters work
   - School profile pages load with spray history
   - Donor auth flow works (register, login, see portal)
6. Test the mobile app flow:
   - Login as worker1@test.com
   - See school list
   - Submit a spray report
   - Verify the report appears in /api/spray-reports
   - Verify the school's lastSprayDate updated
   - Verify the website map reflects the new data
7. Fix any mismatches in field names, URLs, data shapes, or auth headers
8. Create a docker-compose.yml or a single start script that launches all three services
9. Write a WIRING-NOTES.md documenting any changes made and how the three pieces connect

The shared contract all three were built to:
- API runs on port 5000, web on port 3000
- Auth: JWT in Authorization: Bearer <token> header
- Token payload: { id, role }
- All field names match the Mongoose models (camelCase)
- GeoJSON format for map: FeatureCollection with Point features
- Photos: uploaded to /api/upload/image first, URLs included in spray report body
- Test accounts: worker1@test.com, donor@test.com, admin@test.com — all password123
```
