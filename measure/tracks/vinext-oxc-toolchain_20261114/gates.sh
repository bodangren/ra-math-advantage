#!/usr/bin/env bash
# gates.sh <lint|test|checks-all> <label>
# Run from the repository root: bash measure/tracks/vinext-oxc-toolchain_20261114/gates.sh <gate> <label>
# Records each result under measure/runs/vinext-oxc-toolchain_20261114/gates/<label> (gitignored).
# The label "baseline" only records. Any other label compares with the baseline.
set -u
REPO=/home/daniebo/Desktop/ra-math-advantage
cd "$REPO" || exit 2
export CI=true
GATE=${1:?gate}
LABEL=${2:?label}
GATES=$REPO/measure/runs/vinext-oxc-toolchain_20261114/gates
OUT=$GATES/$LABEL
BASE=$GATES/baseline
mkdir -p "$OUT"
MUST_PASS=" next-absent "
newfail=0

has_script() {
  node -e 'const s=require(process.argv[1]).scripts||{};process.exit(s[process.argv[2]]?0:1)' "$PWD/$1/package.json" "$2"
}

# Diagnostic keys of one log: line and column numbers and timings removed.
key() {
  grep -E 'TS[0-9]+|error|ERROR|FAIL|AssertionError|Failed to resolve|[0-9] (warning|error)' "$1" 2>/dev/null |
    sed -E 's/\([0-9]+,[0-9]+\)//g; s/:[0-9]+:[0-9]+//g; s/ in [0-9.]+ ?m?s//g; s/[0-9.]+ ?m?s( |$)/\1/g' | sort -u
}

# A new failure: no baseline failure, or a diagnostic key that the baseline log lacks.
new_keys() { # $1 baseline log, $2 current log
  [ -f "$1" ] || return 0
  [ -n "$(comm -13 <(key "$1") <(key "$2"))" ]
}

base_code() { # $1 exit file, $2 name
  awk -v n="$2" '$1==n{print $2}' "$1" 2>/dev/null
}

sweep() { # $1 script name
  local s=$1 ws name code bc
  : > "$OUT/$s.exit"
  for ws in apps/* packages/*; do
    name=$(basename "$ws")
    if has_script "$ws" "$s"; then
      npm run "$s" --workspace="$ws" > "$OUT/$s-$name.log" 2>&1
      code=$?
    else
      code=n/a
    fi
    echo "$ws $code" >> "$OUT/$s.exit"
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
  local n=$1 c bc
  shift
  "$@" > "$OUT/step-$n.log" 2>&1
  c=$?
  echo "$n $c" >> "$OUT/$GATE.steps"
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

audit_step() {
  npm audit --json > "$OUT/audit.json" 2>/dev/null
  node -e 'const m=(require(process.argv[1]).metadata||{}).vulnerabilities||{};console.log(`critical=${m.critical||0} high=${m.high||0} moderate=${m.moderate||0} low=${m.low||0}`)' "$OUT/audit.json" > "$OUT/audit.txt" 2>&1
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

case "$GATE" in
  lint) sweep lint ;;
  test)
    sweep test
    : > "$OUT/test.steps"
    step scripts-suite npx vitest run --config scripts/vitest.config.ts
    step audit-suites npx vitest run scripts/audit/__tests__
    ;;
  checks-all)
    : > "$OUT/checks-all.steps"
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
[ "$LABEL" = baseline ] && exit 0
exit "$newfail"
