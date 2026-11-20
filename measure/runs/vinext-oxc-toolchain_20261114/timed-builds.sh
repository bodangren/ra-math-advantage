#!/usr/bin/env bash
# S1 Verify: time npm run build for each app on vinext 1.x (median of 3, plan section 5 method).
set -u
ROOT=/home/daniebo/Desktop/ra-math-advantage
OUT=$ROOT/measure/runs/vinext-oxc-toolchain_20261114/build-times-verify.txt
: > "$OUT"
for app in integrated-math-1 integrated-math-2 integrated-math-3 pre-calculus bus-math-v2 danielson; do
  for run in 1 2 3; do
    t0=$(date +%s%3N)
    ( cd "$ROOT" && npm run build --workspace="apps/$app" ) > "$ROOT/measure/runs/vinext-oxc-toolchain_20261114/build-$app-run$run.log" 2>&1
    code=$?
    t1=$(date +%s%3N)
    ms=$((t1 - t0))
    echo "$app run$run exit=$code ms=$ms" >> "$OUT"
  done
done
echo DONE >> "$OUT"
exit 0
