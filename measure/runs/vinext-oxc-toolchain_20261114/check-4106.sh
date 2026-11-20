#!/usr/bin/env bash
# S1 Green: danielson dev status check on port 4106 (strategy 6.5).
set -u
cd /home/daniebo/Desktop/ra-math-advantage/apps/danielson || exit 1
LOG=/home/daniebo/Desktop/ra-math-advantage/measure/runs/vinext-oxc-toolchain_20261114/danielson-dev-4106-green.log
rm -f "$LOG"
setsid npx vinext dev --port 4106 > "$LOG" 2>&1 &
SRV=$!
code=000
url=""
for _ in $(seq 1 45); do
  sleep 2
  out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "http://localhost:4106/" 2>/dev/null || true)
  code=${out%% *}
  url=${out#* }
  [ "$code" != "000" ] && break
done
echo "STATUS=$code"
echo "REDIRECT=$url"
kill -TERM -- "-$SRV" 2>/dev/null || kill -TERM "$SRV" 2>/dev/null
sleep 3
kill -KILL -- "-$SRV" 2>/dev/null || true
pkill -f 'vinext dev --port 4106' 2>/dev/null || true
sleep 2
after=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://localhost:4106/" 2>/dev/null || true)
if [ "$after" = "000" ] || [ -z "$after" ]; then echo "PORT_FREE=yes"; else echo "PORT_FREE=no"; fi
ss -ltn 2>/dev/null | grep -q ':4106 ' && echo "SS_4106=listening" || echo "SS_4106=absent"
exit 0
