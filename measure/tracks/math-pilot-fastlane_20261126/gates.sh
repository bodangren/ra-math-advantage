#!/usr/bin/env bash
# Usage: gates.sh <lint|checks-all|test> green
# The caller supplies the heavy-run wrapper and the additional workspace paths.
# Compare exact failure keys against the existing S4 and D2 gate logs.
# Exits: 0 no new failure, 1 new failure, 2 usage, 3 infrastructure.
set -u

cd "$(dirname "${BASH_SOURCE[0]}")/../../.." || exit 2
REPO=$PWD
GATE=${1:-}
[[ $# = 2 && $2 = green ]] || exit 2
case "$GATE" in lint|checks-all|test) ;; *) exit 2 ;; esac
export CI=true

IM3=apps/integrated-math-3
PILOT_APP=$IM3
if [[ -f apps/math/package.json ]]; then PILOT_APP=apps/math; fi
if [[ "$PILOT_APP" = apps/math && "$GATE" != lint && -z "${GATES_IM3_BASE:-}" ]]; then
  echo "Set GATES_IM3_BASE to the accepted P1 IM3 baseline." >&2
  exit 2
fi
S4="$REPO/measure/runs/openrouter-sdk-ai-layer_20261114/gates/s4"
D2="$REPO/measure/runs/dependency-refresh_20261121/gates/d2-green"
ROOT="$REPO/measure/runs/math-pilot-fastlane_20261126/gates/green/$GATE"
mkdir -p "$ROOT" || exit 3
OUT=$(mktemp -d "$ROOT/run.XXXXXXXX") || exit 3
echo "Gate logs: $OUT"
git rev-parse HEAD > "$OUT/head" || exit 3

read -r -a extras <<< "${GATES_WORKSPACES:-}"
workspaces=("$PILOT_APP")
for ws in "${extras[@]}"; do
  if [[ ! "$ws" =~ ^(apps|packages)/[a-zA-Z0-9_-]+$ || ! -f "$ws/package.json" ]]; then
    echo "Invalid workspace: $ws" >&2
    exit 2
  fi
  duplicate=0
  for existing in "${workspaces[@]}"; do
    if [[ "$existing" = "$ws" ]]; then duplicate=1; fi
  done
  if [[ "$duplicate" = 0 ]]; then workspaces+=("$ws"); fi
done
printf '%s\n' "${workspaces[@]}" > "$OUT/workspaces.txt"

base_code() {
  awk -v n="$2" '$1==n{v=$2} END{print v}' "$1"
}

has_script() {
  node -e 'const s=require(process.argv[1]).scripts||{};process.exit(s[process.argv[2]]?0:1)' "$REPO/$1/package.json" "$2"
}

# Keep file and complete test title keys. Keep file, TS code, and diagnostic text.
# Do not compare totals, runner timings, or incidental console output.
# Treat a missing report or an unattributed exit as a failure.
compare_keys() {
  python3 - "$@" <<'PY'
import re
import sys
from pathlib import Path

kind, workspace, old_path, new_path, old_code, new_code, allow_flake = sys.argv[1:]
ansi = re.compile(r"\x1b\[[0-?]*[ -/]*[@-~]")
infra = re.compile(
    r"ENOSPC: no space left on device|EDQUOT: disk quota exceeded|"
    r"Error: (?:ENOSPC|EDQUOT)|errno: -(?:28|122)|"
    r"^npm error code (?:EAI_AGAIN|ENOTFOUND|ECONNRESET|ETIMEDOUT)$", re.M
)
flakes = {
    "resumes existing active session when one exists for today",
    "enforces daily session limit - cannot start second session on same day",
    "returns current day active session and queue",
}


def log(path):
    text = ansi.sub("", Path(path).read_text(errors="replace"))
    if workspace == "apps/math":
        text = text.replace("apps/integrated-math-3/", "apps/math/")
    return text


def keys(text):
    found = set()
    ignored = set()
    if kind == "test":
        if not re.search(r"^\s*Test Files\s+", text, re.M):
            raise ValueError("missing Vitest summary")
        for match in re.finditer(r"^\s*FAIL[ \t]+(.+)$", text, re.M):
            title = match.group(1).strip()
            if (
                workspace in {"apps/integrated-math-3", "apps/math"}
                and title.startswith("__tests__/convex/queue/sessions.test.ts > ")
                and title.rsplit(" > ", 1)[-1] in flakes
                and allow_flake == "1"
            ):
                ignored.add(title)
                continue
            found.add(title)
        unhandled = list(re.finditer(
            r"^⎯+ (Unhandled (?:Rejection|Exception|Error)) ⎯+[ \t]*$", text, re.M
        ))
        if re.search(r"^Vitest caught .*unhandled", text, re.M) and not unhandled:
            raise ValueError("unattributed unhandled error")
        for match in unhandled:
            block = text[match.end():].split("\n⎯", 1)[0]
            lines = block.strip().splitlines()
            origin = re.search(r'This error originated in "([^"]+)"', block)
            latest = re.search(r'The latest test that might\'ve caused the error is "([^"]+)"', block)
            if not lines or not origin:
                raise ValueError("unattributed unhandled error")
            title = latest.group(1) if latest else ""
            found.add(f"{match.group(1)} {origin.group(1)} > {title}: {lines[0]}")
    elif kind == "typecheck":
        for match in re.finditer(
            r"^(.+?)\(\d+,\d+\): error (TS\d+: .+)$", text, re.M
        ):
            found.add(f"{match.group(1)} {match.group(2)}")
    return found, ignored


try:
    old = log(old_path)
    new = log(new_path)
    if infra.search(old) or infra.search(new):
        print("INFRA FAILURE: incomplete command due to infrastructure")
        sys.exit(3)
    if new_code == "0":
        if kind == "test":
            current, ignored = keys(new)
            if current or ignored:
                raise ValueError("passing exit with failure keys")
        sys.exit(0)
    if new_code != "1" or old_code not in {"0", "1"}:
        raise ValueError("unexpected command exit")
    if kind not in {"test", "typecheck"}:
        raise ValueError("command did not pass")
    current, ignored = keys(new)
    baseline = keys(old)[0] if old_code == "1" else set()
    if old_code == "1" and not baseline:
        raise ValueError("nonzero baseline without failure keys")
    if not current and not ignored:
        raise ValueError("nonzero command without failure keys")
    for item in sorted(ignored):
        print(f"Known UTC-day flake: {item}")
    extra = current - baseline
    for item in sorted(extra):
        print(f"NEW FAILURE: {workspace} {item}")
    sys.exit(1 if extra else 0)
except (OSError, ValueError) as error:
    print(f"FAIL: {workspace}: {error}")
    sys.exit(1)
PY
}

# Do not accept a missing baseline, a missing script, or infrastructure exits.
result=0
record_result() {
  if [[ "$1" = 3 ]]; then result=3
  elif [[ "$1" != 0 && "$result" = 0 ]]; then result=1
  fi
}

run_workspace() {
  local kind=$1 ws=$2 name base old_log old_exit bc log code start end flake=0 base_ws
  name=${ws//\//-}
  base_ws=$ws
  base="$D2/$kind"
  old_log="$base/$kind-$name.log"
  old_exit="$base/$kind.exit"
  if [[ "$ws" = "$PILOT_APP" ]]; then
    base_ws=$IM3
    base="$S4"
    old_log="$base/$kind-${IM3##*/}.log"
    old_exit="$base/$kind.exit"
    if [[ -n "${GATES_IM3_BASE:-}" && ( "$kind" = test || "$kind" = typecheck ) ]]; then
      base="$GATES_IM3_BASE"
      old_log="$base/$kind-${IM3//\//-}.log"
      old_exit="$base/$kind.exit"
    fi
  fi
  if [[ ! -s "$old_exit" ]]; then
    echo "FAIL: $kind $ws missing baseline exit: $old_exit"
    record_result 1
    return
  fi
  bc=$(base_code "$old_exit" "$base_ws")
  if [[ "$bc" = n/a && "$kind" = build ]] && ! has_script "$ws" "$kind"; then
    printf '%s n/a\n' "$ws" >> "$OUT/$kind.exit"
    return
  fi
  if [[ ! "$bc" =~ ^[01]$ || ! -s "$old_log" ]] || ! has_script "$ws" "$kind"; then
    echo "FAIL: $kind $ws missing script or valid baseline log: $old_log"
    record_result 1
    return
  fi

  log="$OUT/$kind-$name.log"
  printf '%q ' npm run "$kind" --workspace="$ws" > "$log.command"
  printf '\n' >> "$log.command"
  start=$(date -u +%s)
  npm run "$kind" --workspace="$ws" > "$log" 2>&1
  code=$?
  end=$(date -u +%s)
  printf '%s %s\n' "$ws" "$code" >> "$OUT/$kind.exit"
  printf '%s %s %s exit=%s\n' "$kind" "$ws" "$((end - start))" "$code" >> "$OUT/timing.txt"
  echo "$kind $ws exit=$code"
  # The known flake can occur only if the run overlaps 00:00-01:00 UTC.
  if (( start % 86400 < 3600 || end / 86400 > start / 86400 )); then flake=1; fi
  case "$code" in
    64|65|70|75|77|124|137|143|201)
      echo "INFRA FAILURE: $kind $ws exit $code"
      record_result 3
      return ;;
  esac
  compare_keys "$kind" "$ws" "$old_log" "$log" "$bc" "$code" "$flake"
  record_result "$?"
}

if [[ "$GATE" = checks-all ]]; then
  npm run format:check > "$OUT/format.log" 2>&1
  code=$?
  echo "format:check exit=$code"
  case "$code" in
    0) ;;
    64|65|70|75|77|124|137|143|201) record_result 3 ;;
    *) record_result 1 ;;
  esac
  groups=(typecheck build)
else
  groups=("$GATE")
fi

for kind in "${groups[@]}"; do
  for ws in "${workspaces[@]}"; do
    run_workspace "$kind" "$ws"
  done
done

if [[ "$result" = 3 ]]; then echo "INFRA=1"
elif [[ "$result" = 0 ]]; then echo "NEWFAIL=0"
else echo "NEWFAIL=1"
fi
exit "$result"
