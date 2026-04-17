# Pilgrim Protect — Field Worker App

Mobile app for field workers to log malaria prevention spray reports at Ugandan schools.

## Tech Stack

- **Expo** (React Native, managed workflow)
- **React Navigation** (native stack)
- **expo-secure-store** (JWT storage)
- **expo-camera** + **expo-image-picker** (photo capture)
- **expo-location** (GPS)
- **AsyncStorage** (offline queue)
- **Axios** (API calls)

## Setup

### Prerequisites
- Node.js 18+
- Expo CLI: `npm install -g expo-cli` (or use `npx expo`)
- Expo Go app on your phone (iOS App Store / Google Play)

### Install & Run

```bash
cd mobile
npm install
npx expo start
```

Scan the QR code with Expo Go (Android) or Camera app (iOS).

### Environment

Copy `.env.example` to `.env` and set your backend IP:

```bash
cp .env.example .env
# Edit EXPO_PUBLIC_API_URL to your machine's LAN IP + API port + /api/v1
# e.g. EXPO_PUBLIC_API_URL=http://192.168.1.42:8080/api/v1
```

### Mock Mode

If the backend is not running, the app automatically uses mock data in development mode. No configuration needed — just start the app.

**Test credentials:** `worker1@test.com` / `password123`

## Screens

1. **LoginScreen** — Email/password login, stores JWT securely
2. **SchoolListScreen** — Lists all schools with spray status colors (green/orange/red)
3. **SprayReportScreen** — Submit a spray report with photos, GPS, and room count
4. **MyReportsScreen** — View your submitted reports with verification badges

## Offline Support

Reports are automatically saved locally when there's no internet connection. A banner shows how many reports are pending upload. When connectivity returns, queued reports are automatically synced.

## Connecting to Backend

This app connects to the same Pilgrim Protect Express API as the web app (`/api/v1`, default port **8080**). Point `EXPO_PUBLIC_API_URL` at your machine’s LAN address so Expo Go on a phone can reach it.

## Project Structure

```
mobile/
  App.js                    # Entry point + navigation
  app.json                  # Expo config
  package.json
  .env.example
  src/
    screens/
      LoginScreen.js
      SchoolListScreen.js
      SprayReportScreen.js
      MyReportsScreen.js
    components/
      SchoolCard.js         # School list item with status color
      ReportCard.js         # Report list item with verified badge
      PhotoPicker.js        # Camera/gallery photo selector
      OfflineBanner.js      # "X reports pending upload" banner
    lib/
      api.js                # Axios instance + API functions
      auth.js               # SecureStore JWT helpers
      offlineQueue.js       # AsyncStorage offline queue + auto-sync
      location.js           # GPS helper
    mock/
      mockData.js           # Mock API responses for standalone dev
```
