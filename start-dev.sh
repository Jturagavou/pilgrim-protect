#!/usr/bin/env bash
# ────────────────────────────────────────────────
# Pilgrim Protect — Dev Start Script
# Starts API (default PORT from api/.env, usually 8080) + Web (3000).
# Optional: --seed (seed DB first), --mobile (Expo).
# See LOCAL-DEV.md
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
  echo "   Start Mongo (brew), or: docker compose up mongo -d"
  echo "   Or set MONGODB_URI in api/.env to Atlas."
  echo ""
fi

if [ ! -f "$ROOT_DIR/web/.env.local" ]; then
  echo -e "${YELLOW}⚠  web/.env.local missing${NC}"
  echo "   cp web/.env.local.example web/.env.local  (add Mapbox token for /map)"
  echo ""
fi

RUN_SEED=false
RUN_MOBILE=false
for arg in "$@"; do
  case "$arg" in
    --seed) RUN_SEED=true ;;
    --mobile) RUN_MOBILE=true ;;
  esac
done

# ── Install dependencies (if needed) ──
echo -e "${CYAN}Installing dependencies...${NC}"
(cd "$ROOT_DIR/api" && [ -d node_modules ] || npm install) &
(cd "$ROOT_DIR/web" && [ -d node_modules ] || npm install) &
(cd "$ROOT_DIR/mobile" && [ -d node_modules ] || npm install) &
wait

# ── Seed database (optional) ──
if [ "$RUN_SEED" = true ]; then
  echo -e "${CYAN}Seeding database...${NC}"
  (cd "$ROOT_DIR/api" && npm run seed)
fi

# ── Start services ──
echo ""
echo -e "${GREEN}Starting services...${NC}"
echo -e "  API:    ${CYAN}http://localhost:8080${NC}  (set PORT in api/.env if different)"
echo -e "  Web:    ${CYAN}http://localhost:3000${NC}"
echo -e "  Health: ${CYAN}curl http://localhost:8080/health${NC}"
echo ""

# Start API
(cd "$ROOT_DIR/api" && npm run dev) &
API_PID=$!

# Wait for API to be ready
sleep 3

# Start Web
(cd "$ROOT_DIR/web" && npm run dev) &
WEB_PID=$!

# Start Mobile (optional)
if [ "$RUN_MOBILE" = true ]; then
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
