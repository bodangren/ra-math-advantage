"""Phase acceptance r4: read-only plan marker checks at HEAD.

Run with: python3 -I measure/runs/openrouter-sdk-ai-layer_20261114/acceptance4-plan-check.py
"""
import importlib.util
import json
import re
import subprocess
import sys
from pathlib import Path

REPO = Path("/home/daniebo/Desktop/ra-math-advantage")
SCRIPT = Path("/home/daniebo/Desktop/measure/skills/measure-orchestrator/scripts/measure_interphase_checks.py")
TRACK = "openrouter-sdk-ai-layer_20261114"
PLAN = REPO / "measure" / "tracks" / TRACK / "plan.md"

spec = importlib.util.spec_from_file_location("mic", SCRIPT)
mic = importlib.util.module_from_spec(spec)
sys.modules["mic"] = mic
spec.loader.exec_module(mic)

# Part 1: the closeout marker check of the framework.
feedback = mic.plan_closeout_feedback(PLAN)
no_sha = [f for f in feedback if f.startswith("completed plan task lacks commit SHA")]
not_complete = [f for f in feedback if f.startswith("plan task is not complete")]
other = [f for f in feedback if f not in no_sha and f not in not_complete]
print(f"plan_closeout_feedback items: {len(feedback)}")
print(f"  completed [x] lines without SHA: {len(no_sha)}")
print(f"  not complete ([ ] or [~]) lines: {len(not_complete)}")
print(f"  other: {len(other)}")
for line in no_sha + other:
    print("  >", line[:160])

# Part 2: split the not-complete lines by parent kind.
text = PLAN.read_text(encoding="utf-8")
top_levels = re.findall(r"^- \[([ ~xb])\] (.+)$", text, re.MULTILINE)
counts = {}
for status, _ in top_levels:
    counts[status] = counts.get(status, 0) + 1
print(f"top-level task markers: {counts}")
deferred = [t for s, t in top_levels if s == "b"]
for task in deferred:
    print("  [b]:", task[:140])
print("open top-level tasks:", [t[:100] for s, t in top_levels if s in (" ", "~")])

# Part 3: the S4 phase block.
start = text.index("## Phase S4:")
s4 = text[start:]
s4_top = re.findall(r"^- \[([ ~xb])\] (.+)$", s4, re.MULTILINE)
s4_counts = {}
for status, _ in s4_top:
    s4_counts[status] = s4_counts.get(status, 0) + 1
print(f"S4 top-level markers: {s4_counts}")
for status, task in s4_top:
    has_sha = re.search(r"\b[0-9a-f]{7,40}\b", task) is not None
    print(f"  [{status}] sha={has_sha} {task[:110]}")

# Part 3b: nested [ ] sub-boxes grouped by the status of their top-level parent.
nested = {}
parent_status = None
parent_task = None
for raw in text.splitlines():
    top = re.match(r"^- \[([ ~xb])\] (.+)$", raw)
    if top:
        parent_status, parent_task = top.group(1), top.group(2)
        continue
    sub = re.match(r"^\s+- \[([ ~xb])\] ", raw)
    if sub and sub.group(1) == " ":
        key = (parent_status, (parent_task or "")[:60])
        nested[key] = nested.get(key, 0) + 1
by_parent_status = {}
for (status, _task), n in nested.items():
    by_parent_status[status] = by_parent_status.get(status, 0) + n
print(f"nested [ ] sub-boxes by top-level parent status: {by_parent_status} (total {sum(by_parent_status.values())})")
for (status, task), n in nested.items():
    if status == "b":
        print(f"  under [b] {task}: {n}")
s4_nested = sum(
    1 for raw in text[start:].splitlines() if re.match(r"^\s+- \[ \] ", raw)
)
print(f"nested [ ] sub-boxes inside the S4 block: {s4_nested}")

# Part 4: the PM release gate line.
gate_line = PLAN.read_text(encoding="utf-8").splitlines()[59]
print("plan.md:60 =", gate_line)
diff = subprocess.run(
    ["git", "diff", "-U0", "8283f9fa192be2afc78a2e731fac1e267c3535b5", "HEAD", "--", str(PLAN.relative_to(REPO))],
    cwd=REPO, capture_output=True, text=True, check=True,
).stdout
hunks = re.findall(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@", diff, re.MULTILINE)
touches_60 = False
for old_start, old_len, _ns, _nl in hunks:
    o = int(old_start)
    n = int(old_len) if old_len != "" else 1
    if o <= 60 < o + max(n, 1):
        touches_60 = True
print(f"hunks in phase diff: {len(hunks)}; any hunk covers old line 60: {touches_60}")

# Part 5: metadata.json parses.
meta = json.loads((REPO / "measure" / "tracks" / TRACK / "metadata.json").read_text(encoding="utf-8"))
print("metadata.json parses; keys:", sorted(meta.keys()))
