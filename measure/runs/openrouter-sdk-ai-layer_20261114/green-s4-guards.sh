#!/usr/bin/env bash
# Green S4 guard driver: runs the S4.4 regression guards and the two package suites.
# Each guard runs one named filter. The log of each guard is a separate file.
# The exit code of each guard is written to guard-exit.txt.
set -u
OUT=/home/daniebo/Desktop/ra-math-advantage/measure/runs/openrouter-sdk-ai-layer_20261114/green-s4-guards
mkdir -p "$OUT"
cd /home/daniebo/Desktop/ra-math-advantage || exit 3
export CI=true

: > "$OUT/guard-exit.txt"

run() {
  local name=$1
  shift
  local log="$OUT/$name.log"
  "$@" > "$log" 2>&1
  local code=$?
  echo "$name $code" >> "$OUT/guard-exit.txt"
  echo "$name exit=$code" >> "$OUT/guard-summary.txt"
  return 0
}

run g-chat-im3 npm run test --workspace=apps/integrated-math-3 -- -t 'POST /api/student/lesson-chatbot'
run g-chat-bm2 npm run test --workspace=apps/bus-math-v2 -- -t 'POST /api/student/lesson-chatbot'
run g-sheet npm run test --workspace=apps/bus-math-v2 -- -t 'spreadsheet-feedback'
run g-teacher npm run test --workspace=apps/bus-math-v2 -- -t 'teacher AI error summary'
run g-teacher-route npm run test --workspace=apps/bus-math-v2 -- -t 'GET /api/teacher/ai-error-summary'
run g-no-pii-im3 npm run test --workspace=apps/integrated-math-3 -- -t 'no-PII'
run g-no-pii-bm2 npm run test --workspace=apps/bus-math-v2 -- -t 'no-PII'
run pkg-ai-tutoring npm run test --workspace=packages/ai-tutoring
run pkg-practice-core npm run test --workspace=packages/practice-core
run bm2-error-analysis npm run test --workspace=apps/bus-math-v2 -- __tests__/lib/practice/error-analysis.test.ts
run im3-error-analysis npm run test --workspace=apps/integrated-math-3 -- __tests__/lib/practice/error-analysis.test.ts

echo "ALL GUARDS DONE" >> "$OUT/guard-summary.txt"
exit 0
