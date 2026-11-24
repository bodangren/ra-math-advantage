#!/usr/bin/env bash
set -u
cd /home/daniebo/Desktop/ra-math-advantage || exit 90
RUNS=measure/runs/openrouter-sdk-ai-layer_20261114
GATES=measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh
: > "$RUNS/green-s2-r3-gates.exit"
for gate in lint test checks-all; do
  echo "START $gate $(date +%FT%T)" >> "$RUNS/green-s2-r3-gates.exit"
  bash "$GATES" "$gate" s2 >> "$RUNS/green-s2-r3-gates-$gate.log" 2>&1
  code=$?
  echo "$gate $code $(date +%FT%T)" >> "$RUNS/green-s2-r3-gates.exit"
done
echo "DONE $(date +%FT%T)" >> "$RUNS/green-s2-r3-gates.exit"
