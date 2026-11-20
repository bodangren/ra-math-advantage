#!/bin/bash
# UX smoke for one app, meant to run INSIDE heavy-run.sh (one heavy lock, memory cap).
# Usage: ux-smoke.sh <app-name> <port> <link-selector>
# Starts the dev server detached, polls status, runs the captures, stops the server,
# and confirms the port is free. Saves ux-s1-<port>-* captures next to this script.
set -u
APP="$1"; PORT="$2"; LINK="$3"
HERE="$(cd "$(dirname "$0")" && pwd)"
ROOT="/home/daniebo/Desktop/ra-math-advantage"
APPDIR="$ROOT/apps/$APP"

cd "$APPDIR" || exit 1
setsid nohup npx vinext dev --port "$PORT" > "/tmp/opencode/ux-s1-${PORT}-dev.log" 2>&1 < /dev/null &
SERVER_PID=$!
echo "dev server started pid $SERVER_PID port $PORT"

# Poll status every 2 s for up to 90 s. 000 = no server.
STATUS=000
for i in $(seq 1 45); do
  sleep 2
  STATUS=$(curl -s -o /dev/null -w '%{http_code}' --max-time 4 "http://localhost:${PORT}/" 2>/dev/null)
  echo "poll $i: ${STATUS}"
  if [ "$STATUS" != "000" ]; then break; fi
done
LOCATION=$(curl -s -o /dev/null -w '%{redirect_url}' --max-time 4 "http://localhost:${PORT}/" 2>/dev/null)
echo "status ${STATUS} location ${LOCATION}"

cd "$HERE"
node ux-capture.mjs "http://localhost:${PORT}/" "ux-s1-${PORT}" "$LINK" "ux-s1-${PORT}-link"
node ux-responsive-check.mjs "http://localhost:${PORT}/" | tee "ux-s1-${PORT}-responsive.txt"

# Stop the process group of the dev server.
PGID=$(ps -o pgid= -p "$SERVER_PID" | tr -d ' ')
if [ -n "$PGID" ]; then kill -TERM "-$PGID" 2>/dev/null; fi
sleep 3
REMAIN=$(pgrep -f "vinext dev --port ${PORT}" | grep -v "^$$\$" | head -1 || true)
kill -KILL "-$PGID" 2>/dev/null
sleep 1
if ss -ltn "( sport = :${PORT} )" | grep -q "${PORT}"; then
  echo "PORT ${PORT} STILL BUSY (remain=${REMAIN})"
  exit 2
else
  echo "port ${PORT} free after stop (remain=${REMAIN:-none})"
fi
