#!/usr/bin/env bash
# Final acceptance run 3 detached launcher (vinext-oxc-toolchain_20261114, HEAD ff7f005a).
# Writes the role-gate output to final-acceptance-ff7f005a-gate.out and its exit code to final-acceptance-ff7f005a-gate.exit.
cd /home/daniebo/Desktop/ra-math-advantage || exit 99
env HEAVY_HANG_NOTIFY_CMD=true PROJECT_GATE_TIMEOUT_SECONDS=14400 \
  PROJECT_LINT="GATES_BASE=baseline-m2 bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh lint final" \
  PROJECT_CHECKS="GATES_BASE=baseline-m2 bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh checks-all final" \
  PROJECT_TESTS="GATES_BASE=baseline-m2 bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh test final" \
  python3 -u /home/daniebo/Desktop/measure/skills/measure-orchestrator/scripts/measure_interphase_checks.py role-gate \
  --repo . --role measure-final-acceptance --track vinext-oxc-toolchain_20261114 \
  --baseline d475273969aee1e1248d4aa3b13e55fb3726b63f \
  --log-file measure/runs/vinext-oxc-toolchain_20261114/final-acceptance-ff7f005a.log \
  --result-file measure/runs/vinext-oxc-toolchain_20261114/final-acceptance-ff7f005a.json \
  > measure/runs/vinext-oxc-toolchain_20261114/final-acceptance-ff7f005a-gate.out 2>&1
echo $? > measure/runs/vinext-oxc-toolchain_20261114/final-acceptance-ff7f005a-gate.exit
