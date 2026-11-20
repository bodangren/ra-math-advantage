#!/bin/bash
# UX smoke launcher: starts one vinext dev server detached, prints its pid.
# Usage: ux-start.sh <app-folder> <port>
APP="$1"
PORT="$2"
cd "$APP" || exit 1
setsid nohup npx vinext dev --port "$PORT" > "/tmp/opencode/ux-s1-${PORT}-dev.log" 2>&1 < /dev/null &
echo "started port ${PORT} pid $!"
