#!/usr/bin/env bash
# gates.sh <lint|checks-all|test> <label>
# Run from any working folder, WITHOUT a heavy-run.sh wrapper:
#   bash <path to the checkout>/measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh <gate> <label>
# The script resolves the repository root from its own location.
# This script calls heavy-run.sh itself: one job for each workspace script and one job for
# each step. Reason: heavy-run.sh caps a job at 1800 s, and a whole gate needs more.
# Run a gate in the background and read its log. A gate takes a long time.
# Records each result under measure/runs/openrouter-sdk-ai-layer_20261114/gates/<label> (gitignored).
# A label that starts with "baseline" only records (for example "baseline").
# Any other label compares with the folder that GATES_BASE names (default "baseline").
# A compare also fails when the workspace set of a script differs from the set of the base.
# GATES_RESUME=1 keeps the results of an earlier run with the same label and runs only the
# jobs that have no result (or an infrastructure exit code).
# Output names: <script>.exit, <script>-<workspace>.log, <gate>.steps, step-<name>.log,
# audit.txt, audit.json, timing.txt, sizes-<app>.txt.
# Exit code: 0 no new failure (always 0 for baseline), 1 new failure, 2 usage, 3 infrastructure.
set -u

WS="packages/ai-tutoring packages/practice-core apps/integrated-math-3 apps/bus-math-v2"

has_script() {
  node -e 'const s=require(process.argv[1]).scripts||{};process.exit(s[process.argv[2]]?0:1)' "$PWD/$1/package.json" "$2"
}

# A real disk-full system message. A job log that only names the errno word (a failing
# test title, a quoted line) is a normal diagnostic, not an infrastructure failure. Only
# the system message forms count: the libuv/Node text ("ENOSPC: no space left on device"),
# the errno name after "Error:", and the Node error fields (`errno: -28`, `code: 'ENOSPC'`).
# -28 is ENOSPC and -122 is EDQUOT on Linux.
DISK_FULL_RE="ENOSPC: no space left on device|EDQUOT: disk quota exceeded|Error: (ENOSPC|EDQUOT)|errno: -(28|122)|code: ['\"]?(ENOSPC|EDQUOT)['\"]?|^No space left on device \\(os error 28\\)$|^Error: spawn (ENOSPC|EDQUOT)$"

# A job log that holds a real disk-full message is an infrastructure failure,
# not a diagnostic.
has_infra_output() { grep -qE "$DISK_FULL_RE" "$1" 2>/dev/null; }

# Diagnostic keys of one log: line and column numbers and timings removed.
# A TypeScript diagnostic line collapses to file + TS code. The `npm error code <n>`
# trailer is normalized to `npm error code`. A line that holds a real disk-full system
# message is dropped (it is an infrastructure failure), but a line that only names the
# errno word stays a normal diagnostic key. Success lines (vitest ✓ lines) are not
# diagnostics and are dropped. Diff lines (`+`/`-`), code-frame lines (`<line>|`),
# and received values inside assertion messages are echoes of files, not diagnostics,
# so they are dropped or normalized. The failing test title and file stay in the key.
# LC_ALL=C pins the collation: sort and comm must agree.
key() {
  grep -E 'TS[0-9]+|error|ERROR|FAIL|AssertionError|Failed to resolve|[0-9] (warning|error)' "$1" 2>/dev/null |
    grep -vE "$DISK_FULL_RE" |
    grep -v '^[[:space:]]*✓' |
    grep -vE '^[[:space:]]*[+-]' |
    grep -vE '^[[:space:]]*[0-9]+\|' |
    LC_ALL=C sed -E "s/^(AssertionError: expected )'.*'( to )/\1'<value>'\2/" |
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

# A label that starts with "baseline" records only.
is_record_only() { case "$LABEL" in baseline*) return 0 ;; *) return 1 ;; esac; }

# One heavy-run.sh job. Sets JOB_CODE. A log that names ENOSPC or EDQUOT gets
# code 290 (infrastructure), even when the tool exited normally.
run_job() { # $1 kind, $2 name, $3 log file, rest: command
  local kind=$1 name=$2 log=$3 t0 t1
  shift 3
  t0=$(date +%s)
  "$H" "$@" > "$log" 2>&1
  JOB_CODE=$?
  if has_infra_output "$log"; then JOB_CODE=290; fi
  t1=$(date +%s)
  echo "$kind $name $((t1 - t0)) exit=$JOB_CODE" >> "$OUT/timing.txt"
}

sweep() { # $1 script name
  local s=$1 ws name code bc rec
  [ "$RESUME" = 1 ] || : > "$OUT/$s.exit"
  touch "$OUT/$s.exit"
  for ws in $WS; do
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
    if is_record_only; then continue; fi
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
  # A workspace that the base lists and this run lacks (or the reverse) is a new failure.
  if ! is_record_only && [ -f "$BASE/$s.exit" ]; then
    diffnames=$(LC_ALL=C comm -3 <(awk '{print $1}' "$BASE/$s.exit" | LC_ALL=C sort -u) \
      <(awk '{print $1}' "$OUT/$s.exit" | LC_ALL=C sort -u) | tr -d '\t' | tr '\n' ' ')
    if [ -n "$diffnames" ]; then
      echo "NEW FAILURE: $s workspace set differs from the baseline: $diffnames"; newfail=1
    fi
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
  if is_record_only; then return; fi
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
  if is_record_only; then return; fi
  local f c b
  for f in critical high; do
    c=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$OUT/audit.txt")
    b=$(sed -n "s/.*$f=\([0-9][0-9]*\).*/\1/p" "$BASE/audit.txt")
    if [ -z "$c" ] || [ -z "$b" ]; then echo "NEW FAILURE: audit $f count not parsed"; newfail=1
    elif [ "$c" -gt "$b" ]; then echo "NEW FAILURE: audit $f $b -> $c"; newfail=1; fi
  done
}

# Record the size of each .js file under dist/server, raw and gzip, plus totals.
# Writes sizes-<app>.txt. A missing dist folder is a normal diagnostic, not infra.
sizes_step() { # $1 app folder
  local app=$1
  local out="$OUT/sizes-$(basename "$app").txt"
  if [ ! -d "$app/dist/server" ]; then
    echo "missing $app/dist/server" > "$out"
    echo "SIZE FAILURE: $app has no dist/server" ; newfail=1
    return
  fi
  : > "$out"
  find "$app/dist/server" -type f -name '*.js' | LC_ALL=C sort | while read -r f; do
    raw=$(wc -c < "$f")
    gz=$(gzip -c "$f" | wc -c)
    echo "raw=$raw gzip=$gz $f"
  done >> "$out"
  awk '{a=$1; b=$2; sub(/raw=/,"",a); sub(/gzip=/,"",b); r+=a; g+=b} END{print "TOTAL raw="r" gzip="g}' "$out" >> "$out"
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
GATES=$REPO/measure/runs/openrouter-sdk-ai-layer_20261114/gates
OUT=$GATES/$LABEL
BASE=$GATES/${GATES_BASE:-baseline}
mkdir -p "$OUT"
MUST_PASS=" "
# Exit codes of heavy-run.sh itself (usage, deny list, temp file, memory, disk, time limit, lock).
INFRA=" 64 65 70 75 77 124 201 290 "
newfail=0
infra=0
JOB_CODE=0

case "$GATE" in
  lint)
    [ "$RESUME" = 1 ] || : > "$OUT/$GATE.steps"
    touch "$OUT/$GATE.steps"
    step format-check npm run format:check
    sweep lint
    ;;
  test)
    [ "$RESUME" = 1 ] || : > "$OUT/$GATE.steps"
    touch "$OUT/$GATE.steps"
    sweep test
    step scripts-suite npx vitest run --config scripts/vitest.config.ts
    step audit-suites npx vitest run scripts/audit/__tests__
    ;;
  checks-all)
    [ "$RESUME" = 1 ] || : > "$OUT/$GATE.steps"
    touch "$OUT/$GATE.steps"
    sweep typecheck
    step boundary node scripts/check-monorepo-boundaries.mjs
    step ci-check node scripts/validate-ci.mjs
    step tree npm ls --workspaces --depth=0
    audit_step
    sweep build
    step bundle-size-im3 npm run bundle-size:audit --prefix apps/integrated-math-3
    step bundle-bm2 npm run bundle:audit --workspace=apps/bus-math-v2
    step sizes-im3 bash -c "bash measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh sizes-helper-im3 $LABEL"
    step sizes-bm2 bash -c "bash measure/tracks/openrouter-sdk-ai-layer_20261114/gates.sh sizes-helper-bm2 $LABEL"
    if has_script packages/ai-tutoring test:workerd; then
      step workerd-probe npm run test:workerd --workspace=packages/ai-tutoring
    else
      echo "pending: the test:workerd script does not exist yet (F2)" > "$OUT/step-workerd-probe.log"
      echo "workerd-probe pending" >> "$OUT/$GATE.steps"
    fi
    ;;
  sizes-helper-im3)
    sizes_step apps/integrated-math-3
    ;;
  sizes-helper-bm2)
    sizes_step apps/bus-math-v2
    ;;
  *) echo "unknown gate $GATE"; exit 2 ;;
esac
echo "NEWFAIL=$newfail"
[ "$infra" = 0 ] || { echo "INFRA=1"; exit 3; }
if is_record_only; then exit 0; fi
exit "$newfail"
}

# Run a gate only when the script is executed. Tests source this file and call the
# individual functions with their own folders.
if [[ "${BASH_SOURCE[0]}" == "$0" ]]; then main "$@"; fi
