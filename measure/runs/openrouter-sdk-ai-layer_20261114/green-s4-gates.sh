#!/usr/bin/env bash
# Green S4 gate driver: runs the three S4.3 gate sweeps in order and writes the
# exit code of each sweep to a driver exit file.
set -u
cd /home/daniebo/Desktop/ra-math-advantage || exit 3
RUNS=measure/runs/openrouter-sdk-ai-layer_20261114
export GATES_BASE=s3
: > "$RUNS/green-s4-gates.exit"
for gate in lint test checks-all; do
  bash measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh "$gate" s4 \
    > "$RUNS/gates/s4/driver-$gate.log" 2>&1
  echo "$gate $?" >> "$RUNS/green-s4-gates.exit"
done
echo "GATES DONE" >> "$RUNS/green-s4-gates.exit"
exit 0
