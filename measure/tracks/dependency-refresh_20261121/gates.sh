#!/usr/bin/env bash
# Run one group at a time. This script calls heavy-run.sh for each job.
# Usage: bash measure/tracks/dependency-refresh_20261121/gates.sh <group> <label>
# Raw failures require the baseline comparison in test-strategy.md.
set -u

ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/../../.." && pwd) || exit 2
cd "$ROOT" || exit 2
GROUP=${1:-}
LABEL=${2:-}
case "$GROUP" in format|lint|typecheck|test|build|support|docs) ;; *) exit 2 ;; esac
[[ "$LABEL" =~ ^[a-zA-Z0-9_-]+$ ]] || exit 2
OUT="$ROOT/measure/runs/dependency-refresh_20261121/gates/$LABEL/$GROUP"
if [ -e "$OUT" ]; then
  echo "Results already exist: $OUT. Use a new retry label." >&2
  exit 2
fi
H="$HOME/Desktop/advantage-pr/scripts/jobs/heavy-run.sh"
[ -x "$H" ] || exit 2
mkdir -p "$OUT" || exit 2
export CI=true
FAILED=0

run() {
  local name=$1 code
  shift
  printf '%q ' "$@" > "$OUT/$name.command"
  printf '\n' >> "$OUT/$name.command"
  "$H" "$@" > "$OUT/$name.log" 2> "$OUT/$name.stderr"
  code=$?
  printf '%s\n' "$code" > "$OUT/$name.exit"
  echo "$name exit=$code"
  if [ "$code" -ne 0 ]; then FAILED=1; fi
}

case "$GROUP" in
  format) run format npm run format:check ;;
  lint|typecheck|test|build)
    WORKSPACES=$(node -e '
      const fs = require("node:fs");
      const m = JSON.parse(fs.readFileSync("scripts/architecture/architecture.manifest.json", "utf8"));
      if (!m.workspaces.length) process.exit(2);
      for (const w of m.workspaces) console.log(w.path);
    ') || exit 2
    printf '%s\n' "$WORKSPACES" > "$OUT/workspaces.txt"
    while IFS= read -r ws; do
      if node -e '
        const p = require(process.cwd() + "/" + process.argv[1] + "/package.json");
        process.exit(p.scripts?.[process.argv[2]] ? 0 : 1);
      ' "$ws" "$GROUP"; then
        run "${ws//\//-}" npm run "$GROUP" --workspace="$ws"
      else
        echo "ABSENT $ws $GROUP" | tee -a "$OUT/absent.txt"
      fi
    done <<< "$WORKSPACES"
    if [ "$GROUP" = test ]; then
      run scripts-suite npx --no-install vitest run --config scripts/vitest.config.ts
      run audit-suites npx --no-install vitest run scripts/audit/__tests__
    fi
    ;;
  support)
    run boundary node scripts/check-monorepo-boundaries.mjs
    run ci-check node scripts/validate-ci.mjs
    run tree npm ls --workspaces --depth=0
    run audit-json npm audit --json
    run audit-high npm audit --audit-level=high
    run sdk npm run test --workspace=packages/ai-tutoring
    run s1-bm2 npm run test --workspace=apps/bus-math-v2 -- __tests__/lib/ai/providers.test.ts __tests__/app/api/student/lesson-chatbot __tests__/api/student/lesson-chatbot.test.ts
    run s1-im3 npm run test --workspace=apps/integrated-math-3 -- __tests__/app/api/student/lesson-chatbot
    run workerd npm run test:workerd --workspace=packages/ai-tutoring
    run bundle-im3 npm run bundle-size:audit --prefix apps/integrated-math-3
    run bundle-bm2 npm run bundle:audit --workspace=apps/bus-math-v2
    ;;
  docs)
    run generate npm run generate
    run doctor npm run doctor
    ;;
esac
echo "RAW_FAILURE=$FAILED"
exit "$FAILED"
