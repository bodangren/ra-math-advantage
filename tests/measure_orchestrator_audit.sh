#!/usr/bin/env bash
set -euo pipefail

repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repo_root"

fail() {
  printf 'FAIL: %s\n' "$1" >&2
  exit 1
}

shopt -s nullglob
test_scripts=(tests/*.sh)
if (( ${#test_scripts[@]} == 0 )); then
  fail "Measure contract-test suite is absent; expected at least one tests/*.sh guard"
fi

if ! grep -qi "automation-supervisor" AGENTS.md || ! grep -qi "peer-reviewed" AGENTS.md; then
  fail "A12 regression: AGENTS.md must document automation-supervisor.py as a peer-reviewed component"
fi

python3 - <<'PY'
import re
from pathlib import Path

src = Path("measure/automation-supervisor.py").read_text(encoding="utf-8")
code = re.sub(r'""".*?"""', '', src, flags=re.DOTALL)
code = re.sub(r"'''.*?'''", '', code, flags=re.DOTALL)

if re.search(r'"deferred"\s+in\s+task\.lower\(\)', code):
    raise SystemExit('A1 regression: free-text deferred substring check found')
if 'def is_task_structurally_blocked' not in code:
    raise SystemExit('A1 regression: is_task_structurally_blocked helper missing')
if 'r"^- \\[([~xb])\\] (.+)"' not in code:
    raise SystemExit('A8 regression: structured [~xb] task regex missing')
if 'r"^- \\[([ ~x])\\] (.+)"' in code:
    raise SystemExit('A8 regression: legacy [ ~x] task regex found')
PY

printf 'PASS: Measure orchestrator audit guard suite is present and supervisor A1/A8 checks are clean\n'
