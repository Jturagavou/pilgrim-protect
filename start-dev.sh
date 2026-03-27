#!/usr/bin/env bash
# ────────────────────────────────────────────────
# Pilgrim Protect — Dev Start Script
# Starts all three services: API (5000), Web (3000), Mobile (Expo)
# ────────────────────────────────────────────────
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"

# Colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}═══════════════════════════════════════════════${NC}"
echo -e "${GREEN}  Pilgrim Protect — Development Launcher${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════${NC}"

# ── Check prerequisites ──
command -v node >/dev/null 2>&1 || { echo "Node.js is required but not installed."; exit 1; }

# ── Check MongoDB ──
if ! nc -z localhost 27017 2>/dev/null; then
  echo -e "${YELLOW}⚠  MongoDB not detected on port 27017${NC}"
  echo "   Make sure MongoDB is running (local or Atlas)."
  echo "   Or set MONGO_URI in api/.env to your MongoDB Atlas connection string."
  echo ""
fi

# ── Install dependencies (if needed) ──
echo -e "${CYAN}Installing dependencies...${NC}"
(cd "$ROOT_DIR/api" && [ -d node_modules ] || npm install) &
(cd "$ROOT_DIR/web" && [ -d node_modules ] || npm install) &
(cd "$ROOT_DIR/mobile" && [ -d node_modules ] || npm install) &
wait

# ── Seed database (optional) ──
if [ "$1" = "--seed" ]; then
  echo -e "${CYAN}Seeding database...${NC}"
  (cd "$ROOT_DIR/api" && npm run seed)
fi

# ── Start services ──
echo ""
echo -e "${GREEN}Starting services...${NC}"
echo -e "  API:    ${CYAN}http://localhost:5000${NC}"
echo -e "  Web:    ${CYAN}http://localhost:3000${NC}"
echo -e "  Mobile: ${CYAN}Expo Dev Server${NC}"
echo ""

# Start API
(cd "$ROOT_DIR/api" && npm run dev) &
API_PID=$!

# Wait for API to be ready
sleep 3

# Start Web
(cd "$ROOT_DIR/web" && npm run dev) &
WEB_PID=$!

# Start Mobile (optional — only if --mobile flag is passed)
if [ "$1" = "--mobile" ] || [ "$2" = "--mobile" ]; then
  (cd "$ROOT_DIR/mobile" && npx expo start) &
  MOBILE_PID=$!
fi

echo -e "${GREEN}All services started. Press Ctrl+C to stop all.${NC}"

# Cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}Shutting down services...${NC}"
  kill $API_PID $WEB_PID ${MOBILE_PID:-} 2>/dev/null
  exit 0
}
trap cleanup SIGINT SIGTERM

# Wait for all background processes
wait
