#!/bin/bash
# S2 lint timing: 1 warm run + 3 timed runs per workspace, median recorded.
# Usage: bash measure/runs/vinext-oxc-toolchain_20261114/s2-lint-timing.sh
cd /home/daniebo/Desktop/ra-math-advantage || exit 1
WS="apps/bus-math-v2 apps/danielson apps/integrated-math-1 apps/integrated-math-2 apps/integrated-math-3 apps/pre-calculus packages/activity-components packages/activity-runtime packages/ai-tutoring packages/app-shell packages/component-approval packages/core-auth packages/core-convex packages/efficacy-core packages/graphing-core packages/knowledge-space-core packages/knowledge-space-practice packages/lesson-renderer packages/math-content packages/practice-core packages/practice-test-engine packages/rate-limiter packages/srs-engine packages/study-hub-core packages/teacher-reporting-core packages/workbook-pipeline"
for w in $WS; do
  npm run lint --workspace="$w" --silent >/dev/null 2>&1
  t1=$(TIMEFORMAT=%R; { time npm run lint --workspace="$w" --silent >/dev/null 2>&1; } 2>&1)
  t2=$(TIMEFORMAT=%R; { time npm run lint --workspace="$w" --silent >/dev/null 2>&1; } 2>&1)
  t3=$(TIMEFORMAT=%R; { time npm run lint --workspace="$w" --silent >/dev/null 2>&1; } 2>&1)
  echo "$w warm=done t1=$t1 t2=$t2 t3=$t3"
done
