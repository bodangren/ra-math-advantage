#!/usr/bin/env bash
# Green S4 role gate driver: runs the measure-jr-green role gate with the
# track's gate commands. The gate values come from the environment, so
# measure/gates.json stays unchanged.
set -u
cd /home/daniebo/Desktop/ra-math-advantage || exit 3
RUNS=measure/runs/openrouter-sdk-ai-layer_20261114

export HEAVY_PRIORITY=p1
export HEAVY_MIN_AVAIL_MB=1500
export PROJECT_LINT="GATES_BASE=s3 bash measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh lint s4"
export PROJECT_CHECKS="GATES_BASE=s3 bash measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh checks-all s4"
export PROJECT_TESTS="GATES_BASE=s3 bash measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh test s4"
export GREEN_TEST_COMMAND="CI=true npm run test --workspace=packages/ai-tutoring && CI=true npm run test --workspace=packages/practice-core && CI=true npm run test --workspace=apps/bus-math-v2 -- __tests__/lib/practice/error-analysis.test.ts __tests__/lib/ai/spreadsheet-feedback.test.ts __tests__/lib/teacher/ai-error-summary.test.ts __tests__/api/teacher/ai-error-summary.test.ts __tests__/api/teacher/ai-error-summary.no-pii.test.ts __tests__/app/api/student/lesson-chatbot/route.no-pii.test.ts __tests__/app/api/activities/spreadsheet/submit.no-pii.test.ts && CI=true npm run test --workspace=apps/integrated-math-3 -- __tests__/lib/practice/error-analysis.test.ts __tests__/app/api/student/lesson-chatbot/route.no-pii.test.ts && npx vitest run --config scripts/vitest.config.ts -t 'openrouter-only'"

python3 /home/daniebo/.agents/skills/measure-orchestrator/scripts/measure_interphase_checks.py \
  role-gate \
  --repo /home/daniebo/Desktop/ra-math-advantage \
  --role measure-jr-green \
  --track openrouter-sdk-ai-layer_20261114 \
  --phase "Phase S4: Remove the OpenAI paths and document the roles" \
  --baseline 15087532 \
  --log-file "$RUNS/green-s4-89946220.log" \
  --runner "$HOME/Desktop/advantage-pr/scripts/jobs/heavy-run.sh" \
  > "$RUNS/green-s4-role-gate.log" 2>&1
echo "role-gate exit=$?" >> "$RUNS/green-s4-role-gate.exit"
exit 0
