#!/usr/bin/env bash
# S1 Verify: dev status of the 6 apps (strategy 6.5). Baseline codes:
# IM1 200, IM2 200, IM3 200, PreCalc 200, BM2 200, danielson 307.
set -u
ROOT=/home/daniebo/Desktop/ra-math-advantage
RUN=$ROOT/measure/runs/vinext-oxc-toolchain_20261114
check_one() { # $1 app folder, $2 port, $3 baseline code
  local app=$1 port=$2 base=$3
  local LOG=$RUN/dev-$port-verify.log
  rm -f "$LOG"
  ( cd "$ROOT/apps/$app" && setsid npx vinext dev --port "$port" > "$LOG" 2>&1 ) &
  local launcher=$!
  local code=000 url=""
  for _ in $(seq 1 45); do
    sleep 2
    local out
    out=$(curl -s -o /dev/null -w '%{http_code} %{redirect_url}' "http://localhost:$port/" 2>/dev/null || true)
    code=${out%% *}
    url=${out#* }
    [ "$code" != "000" ] && break
  done
  local verdict=match
  [ "$code" = "$base" ] || verdict=MISMATCH
  echo "PORT=$port APP=$app BASE=$base GOT=$code VERDICT=$verdict REDIRECT=$url"
  pkill -TERM -f "vinext dev --port $port" 2>/dev/null || true
  sleep 3
  pkill -KILL -f "vinext dev --port $port" 2>/dev/null || true
  sleep 2
  local after
  after=$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "http://localhost:$port/" 2>/dev/null || true)
  if [ "$after" = "000" ] || [ -z "$after" ]; then echo "PORT=$port FREE=yes"; else echo "PORT=$port FREE=no"; fi
  ss -ltn 2>/dev/null | grep -q ":$port " && echo "PORT=$port SS=listening" || echo "PORT=$port SS=absent"
}
check_one integrated-math-1 4101 200
check_one integrated-math-2 4102 200
check_one integrated-math-3 4103 200
check_one pre-calculus 4104 200
check_one bus-math-v2 4105 200
check_one danielson 4106 307
exit 0
