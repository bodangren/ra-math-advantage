#!/usr/bin/env bash
# Run the three S2 gate sweeps one at a time and record each exit code.
set -u
cd /home/daniebo/Desktop/ra-math-advantage || exit 90
RUNS=measure/runs/openrouter-sdk-ai-layer_20261114
GATES=measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh
: > "$RUNS/s2-gates.exit"
for gate in lint test checks-all; do
  echo "START $gate $(date +%FT%T)" >> "$RUNS/s2-gates.exit"
  bash "$GATES" "$gate" s2 >> "$RUNS/s2-gates-$gate.log" 2>&1
  code=$?
  echo "$gate $code $(date +%FT%T)" >> "$RUNS/s2-gates.exit"
done
echo "DONE $(date +%FT%T)" >> "$RUNS/s2-gates.exit"
