#!/usr/bin/env bash
# gates.sh <lint|test|checks-all> <label>
# Run from any working folder, WITHOUT a heavy-run.sh wrapper:
#   bash <path to the checkout>/measure/tracks/vinext-oxc-toolchain_20261114/gates.sh <gate> <label>
# The script resolves the repository root from its own location.
# This script calls heavy-run.sh itself: one job for each workspace script and one job for
# each step. Reason: heavy-run.sh caps a p2 job at 1800 s, and a whole gate needs more.
# Run a gate in the background and read its log. A gate takes a long time.
# Records each result under measure/runs/vinext-oxc-toolchain_20261114/gates/<label> (gitignored).
# The label "baseline" only records. Any other label compares with the baseline.
# GATES_RESUME=1 keeps the results of an earlier run with the same label and runs only the
# jobs that have no result (or an infrastructure exit code).
# Output names: <script>.exit, <script>-<workspace>.log, <gate>.steps, step-<name>.log,
# audit.txt, audit.json, timing.txt.
# Exit code: 0 no new failure (always 0 for baseline), 1 new failure, 2 usage, 3 infrastructure.
set -u

has_script() {
  node -e 'const s=require(process.argv[1]).scripts||{};process.exit(s[process.argv[2]]?0:1)' "$PWD/$1/package.json" "$2"
}

# Diagnostic keys of one log: line and column numbers and timings removed.
# S1 (vinext-oxc-toolchain_20261114) key refinement: tsc diagnostic lines collapse to
# the spec "New failure" key (file + TS code) instead of the full message text. The
# message text of an unchanged diagnostic drifts when a dependency bump changes an
# inferred type inside the message; the spec defines the key as workspace + file + code,
# so message drift must not count as a new failure. The `npm error code <n>` trailer is
# normalized to `npm error code` (the exit code itself is tracked in the .exit files).
# All other lines keep their full-text key. Success lines (vitest ✓ lines) are not
# diagnostics and are dropped: vitest 5 changed their trailing whitespace, which made
# passing tests look like new diagnostics. Trailing whitespace is stripped on all
# remaining lines for the same reason. The baseline logs are re-keyed with the same
# function at compare time, so both sides stay symmetric and no baseline re-run is needed.
# LC_ALL=C pins the collation: sort and comm must agree, or comm reports keys as new or
# absent at random (the source of the earlier "input is not in sorted order" warnings).
key() {
  grep -E 'TS[0-9]+|error|ERROR|FAIL|AssertionError|Failed to resolve|[0-9] (warning|error)' "$1" 2>/dev/null |
    grep -v '^[[:space:]]*✓' |
    LC_ALL=C sed -E 's/^([^ (]+)\([0-9]+,[0-9]+\): error (TS[0-9]+):.*/\1 \2/; s/^npm error code [0-9]+$/npm error code/; s/\([0-9]+,[0-9]+\)//g; s/:[0-9]+:[0-9]+//g; s/ in [0-9.]+ ?m?s//g; s/[0-9.]+ ?m?s( |$)/\1/g; s/[[:space:]]+$//' | LC_ALL=C sort -u
}

# A new failure: no baseline failure, or a diagnostic key that the baseline log lacks.
new_keys() { # $1 baseline log, $2 current log
  [ -f "$1" ] || return 0
  [ -n "$(comm -13 <(key "$1") <(key "$2"))" ]
}

# The last recorded code of a name in an exit file or a steps file.
base_code() { # $1 file, $2 name
  awk -v n="$2" '$1==n{v=$2} END{print v}' "$1" 2>/dev/null
}

is_infra() { [[ "$INFRA" == *" $1 "* ]]; }

# One heavy-run.sh job. Sets JOB_CODE.
run_job() { # $1 kind, $2 name, $3 log file, rest: command
  local kind=$1 name=$2 log=$3 t0 t1
  shift 3
  t0=$(date +%s)
  "$H" "$@" > "$log" 2>&1
  JOB_CODE=$?
  t1=$(date +%s)
  echo "$kind $name $((t1 - t0)) exit=$JOB_CODE" >> "$OUT/timing.txt"
}

sweep() { # $1 script name
  local s=$1 ws name code bc rec
  [ "$RESUME" = 1 ] || : > "$OUT/$s.exit"
  touch "$OUT/$s.exit"
  for ws in apps/* packages/*; do
    name=$(basename "$ws")
    rec=$(base_code "$OUT/$s.exit" "$ws")
    if [ "$RESUME" = 1 ] && [ -n "$rec" ] && ! is_infra "$rec"; then
      code=$rec
    else
      if has_script "$ws" "$s"; then
        run_job "$s" "$ws" "$OUT/$s-$name.log" npm run "$s" --workspace="$ws"
        code=$JOB_CODE
      else
        code=n/a
      fi
      echo "$ws $code" >> "$OUT/$s.exit"
    fi
    if is_infra "$code"; then
      echo "INFRA FAILURE: $s $ws exit $code"; infra=1; continue
    fi
    [ "$LABEL" = baseline ] && continue
    bc=$(base_code "$BASE/$s.exit" "$ws")
    if [ "$code" = n/a ] && [ -n "$bc" ] && [ "$bc" != n/a ]; then
      echo "NEW FAILURE: $s script removed in $ws"; newfail=1
    elif [ "$code" != 0 ] && [ "$code" != n/a ]; then
      if [ "${bc:-x}" = 0 ] || [ "${bc:-x}" = n/a ] || [ "${bc:-x}" = x ]; then
        echo "NEW FAILURE: $s $ws exit $code"; newfail=1
      elif new_keys "$BASE/$s-$name.log" "$OUT/$s-$name.log"; then
        echo "NEW FAILURE: $s $ws has a new diagnostic"; newfail=1
      fi
    fi
  done
  if [ "$(grep -vc ' n/a$' "$OUT/$s.exit")" -eq 0 ]; then
    echo "NEW FAILURE: $s ran in no workspace"; newfail=1
  fi
}

step() { # $1 name, rest: command
  local n=$1 c bc rec
  shift
  rec=$(base_code "$OUT/$GATE.steps" "$n")
  if [ "$RESUME" = 1 ] && [ -n "$rec" ] && ! is_infra "$rec"; then
    c=$rec
  else
    run_job step "$n" "$OUT/step-$n.log" "$@"
    c=$JOB_CODE
    echo "$n $c" >> "$OUT/$GATE.steps"
  fi
  if is_infra "$c"; then
    echo "INFRA FAILURE: step $n exit $c"; infra=1; return
  fi
  [ "$LABEL" = baseline ] && return
  bc=$(base_code "$BASE/$GATE.steps" "$n")
  if [ "$c" != 0 ]; then
    if [ "${bc:-x}" = 0 ] || [ "${bc:-x}" = x ] || [[ "$MUST_PASS" == *" $n "* ]]; then
      echo "NEW FAILURE: step $n exit $c"; newfail=1
    elif new_keys "$BASE/step-$n.log" "$OUT/step-$n.log"; then
      echo "NEW FAILURE: step $n has a new diagnostic"; newfail=1
    fi
  fi
}

# A valid advisory report parses as JSON, has no top-level "error" object, and has a
# numeric count for each severity. npm audit exits 1 when it finds advisories, so the
# exit status cannot tell an error response from a valid report. The JSON decides.
# An invalid response is an infrastructure failure and never writes audit.txt.
audit_step() {
  npm audit --json > "$OUT/audit.json" 2>/dev/null
  local reason
  reason=$(node -e '
    const fs = require("fs");
    let d;
    try { d = JSON.parse(fs.readFileSync(process.argv[1], "utf8")); }
    catch { console.log("response is not JSON"); process.exit(0); }
    if (d && typeof d === "object" && d.error) {
      const e = d.error;
      console.log(`error object: ${e.code || e.summary || "unknown"}`);
      process.exit(0);
    }
    const v = d && d.metadata && d.metadata.vulnerabilities;
    if (!v || typeof v !== "object" || Array.isArray(v)) { console.log("missing metadata.vulnerabilities"); process.exit(0); }
    for (const s of ["critical", "high", "moderate", "low"]) {
      if (typeof v[s] !== "number" || Number.isNaN(v[s])) { console.log(`non-numeric ${s} count`); process.exit(0); }
    }
  ' "$OUT/audit.json") || reason="report could not be validated"
  if [ -n "$reason" ]; then
    echo "INFRA FAILURE: audit $reason"
    infra=1
    return
  fi
  node -e 'const m=require(process.argv[1]).metadata.vulnerabilities;console.log(`critical=${m.critical} high=${m.high} moderate=${m.moderate} low=${m.low}`)' "$OUT/audit.json" > "$OUT/audit.txt"
  echo "audit: $(cat "$OUT/audit.txt")"
  [ "$LABEL" = baseline ] && return
  local f c b
  for f in critical high; do
    c=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$OUT/audit.txt")
    b=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$BASE/audit.txt")
    if [ -z "$c" ] || [ -z "$b" ]; then echo "NEW FAILURE: audit $f count not parsed"; newfail=1
    elif [ "$c" -gt "$b" ]; then echo "NEW FAILURE: audit $f $b -> $c"; newfail=1; fi
  done
}

main() {
# The repository root is three folders above this script (measure/tracks/<track>/).
local script_dir
script_dir=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd) || exit 2
REPO=$(cd "$script_dir/../../.." && pwd) || exit 2
[ -f "$REPO/package.json" ] || { echo "repository root not found: $REPO has no package.json"; exit 2; }
cd "$REPO" || exit 2
export CI=true
GATE=${1:?gate}
LABEL=${2:?label}
H=${HEAVY_RUN:-$HOME/Desktop/advantage-pr/scripts/jobs/heavy-run.sh}
[ -x "$H" ] || { echo "heavy-run.sh not found: $H"; exit 2; }
RESUME=${GATES_RESUME:-0}
GATES=$REPO/measure/runs/vinext-oxc-toolchain_20261114/gates
OUT=$GATES/$LABEL
BASE=$GATES/baseline
mkdir -p "$OUT"
MUST_PASS=" next-absent "
# Exit codes of heavy-run.sh itself (usage, deny list, temp file, memory, disk, time limit, lock).
INFRA=" 64 65 70 75 77 124 201 "
newfail=0
infra=0
JOB_CODE=0

case "$GATE" in
  lint) sweep lint ;;
  test)
    [ "$RESUME" = 1 ] || : > "$OUT/test.steps"
    touch "$OUT/test.steps"
    sweep test
    step scripts-suite npx vitest run --config scripts/vitest.config.ts
    step audit-suites npx vitest run scripts/audit/__tests__
    ;;
  checks-all)
    [ "$RESUME" = 1 ] || : > "$OUT/checks-all.steps"
    touch "$OUT/checks-all.steps"
    sweep typecheck
    if ! has_script apps/bus-math-v2 typecheck; then
      step typecheck-bm2 npx tsc --noEmit -p apps/bus-math-v2/tsconfig.json
    fi
    step boundary node scripts/check-monorepo-boundaries.mjs
    step ci-check node scripts/validate-ci.mjs
    step tree npm ls --workspaces --depth=0
    step next-absent bash -c "npm ls next --all 2>&1 | grep -q '(empty)'"
    step measure-contract bash tests/measure_orchestrator_audit.sh
    audit_step
    sweep build
    ;;
  *) echo "unknown gate $GATE"; exit 2 ;;
esac
echo "NEWFAIL=$newfail"
[ "$infra" = 0 ] || { echo "INFRA=1"; exit 3; }
[ "$LABEL" = baseline ] && exit 0
exit "$newfail"
}

# Run a gate only when the script is executed. Tests source this file and call the
# individual functions with their own folders.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then main "$@"; fi
