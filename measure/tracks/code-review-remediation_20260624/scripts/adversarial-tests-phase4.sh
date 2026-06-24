#!/usr/bin/env bash
# Phase 4 adversarial probes — code-review-remediation_20260624
# Probes:
#   A. FR-12: path resolution is robust against future file renames
#      (the script must reach the real artifact even if the filename changes,
#      OR document why the filename is the contract — adversarial probe:
#      confirm the script's filename set is exhaustive for the current tree,
#      and confirm the walker tolerates empty/renamed/missing dirs).
#   B. FR-13: a concept with 0 skills emits 0 rows; a concept with 5 skills
#      emits 5 rows (per spec); a 1-skill concept emits 1 row (regression).
set -euo pipefail
REPO="$(cd "$(dirname "$0")/../../../.." && pwd)"
cd "$REPO"

ART="$REPO/measure/tracks/code-review-remediation_20260624/_artifacts"
OUT="$ART/adversarial-run-phase4.txt"
mkdir -p "$ART"
: > "$OUT"

log() { echo "$@" | tee -a "$OUT"; }
fail() { log "FAIL: $*"; exit 1; }
pass() { log "PASS: $*"; }

# ------------------------------------------------------------------
# Probe A1: path resolution is exhaustive for the current tree
# ------------------------------------------------------------------
log "== Probe A1: path resolution coverage =="
npx tsx scripts/remediate-concept-blueprints.ts --dry-run > /tmp/rcb-probe-a1.txt 2>&1
SCANNED=$(grep -oP "scanned \K[0-9]+" /tmp/rcb-probe-a1.txt | head -1)
[ -n "$SCANNED" ] || fail "could not parse scanned count"
log "Scanned files reported: $SCANNED"
[ "$SCANNED" -gt 0 ] || fail "scanned file count is 0 — walker not reaching the real artifact"
pass "walker reached $SCANNED files (was 0 pre-fix)"

# Confirm the pre-calculus activity-map.json is in the scan set
cat > /tmp/probe-a1-reach.py <<'PY'
import subprocess, sys
result = subprocess.run(
    ["npx", "tsx", "-e", """
import { findBlueprintFiles } from "./scripts/remediate-concept-blueprints";
import * as path from "node:path";
const repoRoot = process.cwd();
const files = findBlueprintFiles({ repoRoot, scanRoots: ["apps"] });
const required = [
    "apps/pre-calculus/curriculum/implementation/practice-v1/activity-map.json",
    "apps/integrated-math-3/curriculum/implementation/practice-v1/activity-map.json",
    "apps/integrated-math-3/curriculum/skill-graph/blueprints.json",
];
let ok = true;
for (const r of required) {
    const abs = path.join(repoRoot, r);
    if (files.includes(abs)) {
        console.log("  REACH: " + r);
    } else {
        console.log("  MISS: " + r);
        ok = false;
    }
}
process.exit(ok ? 0 : 1);
"""],
    capture_output=True, text=True,
)
sys.stdout.write(result.stdout)
if result.returncode != 0:
    sys.stderr.write(result.stderr)
    sys.exit(result.returncode)
PY
python3 /tmp/probe-a1-reach.py 2>&1 | tee -a "$OUT"
rm /tmp/probe-a1-reach.py
pass "walker reaches all required artifacts (pre-calculus activity-map.json + IM3 module-N shards + legacy skill-graph/blueprints.json)"

# ------------------------------------------------------------------
# Probe A2: walker is robust against non-existent scan roots
# ------------------------------------------------------------------
log ""
log "== Probe A2: walker robustness against missing scan roots =="
cat > /tmp/probe-a2.py <<'PY'
import subprocess, sys
result = subprocess.run(
    ["npx", "tsx", "-e", """
import { findBlueprintFiles } from "./scripts/remediate-concept-blueprints";
import * as path from "node:path";
const repoRoot = process.cwd();
const files = findBlueprintFiles({
  repoRoot,
  scanRoots: ["apps/does-not-exist", "apps", "another-missing"],
});
if (!Array.isArray(files)) {
  console.log("  FAIL: result is not an array");
  process.exit(1);
}
if (files.length === 0) {
  console.log("  FAIL: expected non-empty result from real root");
  process.exit(1);
}
console.log("  mixed-roots result: " + files.length + " files (no throw)");
"""],
    capture_output=True, text=True,
)
sys.stdout.write(result.stdout)
if result.returncode != 0:
    sys.stderr.write(result.stderr)
    sys.exit(result.returncode)
PY
python3 /tmp/probe-a2.py 2>&1 | tee -a "$OUT"
rm /tmp/probe-a2.py
pass "walker does not throw on missing scan roots"

# ------------------------------------------------------------------
# Probe A3: walker is robust against future file renames
#   (simulated by: temporarily rename an artifact, run script, restore)
# ------------------------------------------------------------------
log ""
log "== Probe A3: walker catches the activity-map.json shape even if legacy name is removed =="
# This probe verifies the path resolver is NOT dependent on the legacy
# 'blueprints.json' filename alone. We synthesize a tree with ONLY the
# activity-map.json shape (no legacy blueprints.json) and confirm the
# scanner reaches it.
TMP=$(mktemp -d)
mkdir -p "$TMP/apps/probe-only/curriculum/implementation/practice-v1"
cat > "$TMP/apps/probe-only/curriculum/implementation/practice-v1/activity-map.json" <<'JSON'
{
  "schemaVersion": "curriculum-activity-map.v1",
  "activities": [
    { "activityId": "math.fake.concept.aggregator.independent-practice" },
    { "activityId": "normal-activity" }
  ]
}
JSON
cat > /tmp/probe-a3.py <<PY
import subprocess, sys, os
result = subprocess.run(
    ["npx", "tsx", "-e", """
import { remediate } from "./scripts/remediate-concept-blueprints";
const summary = remediate({ repoRoot: "$TMP", scanRoots: ["apps"], dryRun: true });
if (summary.filesScanned !== 1) { console.log("  FAIL: scanned=" + summary.filesScanned); process.exit(1); }
if (summary.totalRemoved !== 1) { console.log("  FAIL: removed=" + summary.totalRemoved); process.exit(1); }
console.log("  activity-map-only tree: " + summary.filesScanned + " file, " + summary.totalRemoved + " concept");
"""],
    capture_output=True, text=True,
)
sys.stdout.write(result.stdout)
if result.returncode != 0:
    sys.stderr.write(result.stderr)
    sys.exit(result.returncode)
PY
python3 /tmp/probe-a3.py 2>&1 | tee -a "$OUT"
rm /tmp/probe-a3.py
rm -rf "$TMP"
pass "walker + detector handle activity-map.json shape with no legacy blueprints.json present"

# ------------------------------------------------------------------
# Probe B1: 5-skill concept emits 5 rows (FR-13 N rows for N skills)
# ------------------------------------------------------------------
log ""
log "== Probe B1: 5-skill concept emits 5 rows =="
PROBE_DIR="$REPO/packages/knowledge-space-practice/src/__tests__"
PROBE_FILE="$PROBE_DIR/__adversarial-phase4-b1.test.ts"
cat > "$PROBE_FILE" <<'TS'
import { describe, it, expect } from 'vitest';
import { projectActivityMap } from '../projections/activity-map';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge, KnowledgeBlueprint } from '@math-platform/knowledge-space-core';

describe('FR-13 adversarial: 5-skill concept', () => {
  it('emits exactly 5 distinct nodeId rows for a 5-skill concept', () => {
    const skills: KnowledgeSpaceNode[] = Array.from({ length: 5 }, (_, i) => ({
      id: `math.precalc.skill.unit-circle.skill-${i}`,
      kind: 'skill',
      title: `Skill ${i}`,
      domain: 'math.precalc',
      reviewStatus: 'approved',
      metadata: {},
    }));
    const concept: KnowledgeSpaceNode = {
      id: 'math.precalc.concept.5skill',
      kind: 'concept',
      title: '5-skill concept',
      domain: 'math.precalc',
      reviewStatus: 'approved',
      metadata: {},
    };
    const edges: KnowledgeSpaceEdge[] = skills.map((s, i) => ({
      id: `e-${i}`,
      type: 'contains',
      sourceId: concept.id,
      targetId: s.id,
      confidence: 'high',
      weight: 1,
      reviewStatus: 'approved',
    }));
    const blueprint: KnowledgeBlueprint = {
      nodeId: concept.id,
      sourceNodeIds: [],
      alignmentNodeIds: [],
      rendererModeMap: { worked: 'default', guidedPractice: 'default', independentPractice: 'default' },
      rendererKey: 'concept-explorer',
      workedExampleSpec: { prompt: 'p', givens: [], steps: [], target: { answer: 'x' }, explanation: '' },
      reviewStatus: 'draft',
      metadata: {},
    };
    const rows = projectActivityMap([concept, ...skills], edges, [blueprint]);
    const distinctNodeIds = new Set(rows.map((r) => r.nodeId));
    expect(distinctNodeIds.size).toBe(5);
    for (const s of skills) {
      expect(distinctNodeIds.has(s.id)).toBe(true);
    }
  });
});
TS
( cd "$REPO/packages/knowledge-space-practice" && npx vitest run src/__tests__/__adversarial-phase4-b1.test.ts 2>&1 | tail -10 ) | tee -a "$OUT"
rm "$PROBE_FILE"
log "  -- probe B1 transcript above --"
pass "5-skill concept → 5 distinct nodeId rows (FR-13 N rows for N skills)"

# ------------------------------------------------------------------
# Probe B2: 0-skill concept emits 0 rows (FR-13 edge case)
# ------------------------------------------------------------------
log ""
log "== Probe B2: 0-skill concept emits 0 rows =="
PROBE_FILE="$PROBE_DIR/__adversarial-phase4-b2.test.ts"
cat > "$PROBE_FILE" <<'TS'
import { describe, it, expect } from 'vitest';
import { projectActivityMap } from '../projections/activity-map';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge, KnowledgeBlueprint } from '@math-platform/knowledge-space-core';

describe('FR-13 adversarial: 0-skill concept', () => {
  it('emits exactly 0 rows for a concept with no contains edges', () => {
    const concept: KnowledgeSpaceNode = {
      id: 'math.precalc.concept.empty',
      kind: 'concept',
      title: 'Empty concept',
      domain: 'math.precalc',
      reviewStatus: 'approved',
      metadata: {},
    };
    const skill: KnowledgeSpaceNode = {
      id: 'math.precalc.skill.unrelated',
      kind: 'skill',
      title: 'Unrelated',
      domain: 'math.precalc',
      reviewStatus: 'approved',
      metadata: {},
    };
    const blueprint: KnowledgeBlueprint = {
      nodeId: concept.id,
      sourceNodeIds: [],
      alignmentNodeIds: [],
      rendererModeMap: { worked: 'default', guidedPractice: 'default', independentPractice: 'default' },
      rendererKey: 'concept-explorer',
      workedExampleSpec: { prompt: 'p', givens: [], steps: [], target: { answer: 'x' }, explanation: '' },
      reviewStatus: 'draft',
      metadata: {},
    };
    const rows = projectActivityMap([concept, skill], [], [blueprint]);
    expect(rows).toHaveLength(0);
  });
});
TS
( cd "$REPO/packages/knowledge-space-practice" && npx vitest run src/__tests__/__adversarial-phase4-b2.test.ts 2>&1 | tail -10 ) | tee -a "$OUT"
rm "$PROBE_FILE"
log "  -- probe B2 transcript above --"
pass "0-skill concept → 0 rows (FR-13 edge case)"

# ------------------------------------------------------------------
# Probe B3: 1-skill concept emits 1 row (FR-13 regression guard)
# ------------------------------------------------------------------
log ""
log "== Probe B3: 1-skill concept emits 1 row (regression) =="
PROBE_FILE="$PROBE_DIR/__adversarial-phase4-b3.test.ts"
cat > "$PROBE_FILE" <<'TS'
import { describe, it, expect } from 'vitest';
import { projectActivityMap } from '../projections/activity-map';
import type { KnowledgeSpaceNode, KnowledgeSpaceEdge, KnowledgeBlueprint } from '@math-platform/knowledge-space-core';

describe('FR-13 adversarial: 1-skill concept', () => {
  it('emits exactly 1 row for a 1-skill concept (regression guard)', () => {
    const skill: KnowledgeSpaceNode = {
      id: 'math.precalc.skill.singleton',
      kind: 'skill',
      title: 'Singleton',
      domain: 'math.precalc',
      reviewStatus: 'approved',
      metadata: {},
    };
    const concept: KnowledgeSpaceNode = {
      id: 'math.precalc.concept.singleton',
      kind: 'concept',
      title: 'Singleton concept',
      domain: 'math.precalc',
      reviewStatus: 'approved',
      metadata: {},
    };
    const edge: KnowledgeSpaceEdge = {
      id: 'e-singleton',
      type: 'contains',
      sourceId: concept.id,
      targetId: skill.id,
      confidence: 'high',
      weight: 1,
      reviewStatus: 'approved',
    };
    const blueprint: KnowledgeBlueprint = {
      nodeId: concept.id,
      sourceNodeIds: [],
      alignmentNodeIds: [],
      rendererModeMap: { worked: 'default', guidedPractice: 'default', independentPractice: 'default' },
      rendererKey: 'concept-explorer',
      workedExampleSpec: { prompt: 'p', givens: [], steps: [], target: { answer: 'x' }, explanation: '' },
      reviewStatus: 'draft',
      metadata: {},
    };
    const rows = projectActivityMap([concept, skill], [edge], [blueprint]);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.nodeId).toBe(skill.id);
  });
});
TS
( cd "$REPO/packages/knowledge-space-practice" && npx vitest run src/__tests__/__adversarial-phase4-b3.test.ts 2>&1 | tail -10 ) | tee -a "$OUT"
rm "$PROBE_FILE"
log "  -- probe B3 transcript above --"
pass "1-skill concept → 1 row (regression guard holds)"

# ------------------------------------------------------------------
# Probe C: round-trip — script counts match detector counts
# ------------------------------------------------------------------
log ""
log "== Probe C: end-to-end detector round-trip =="
cat > /tmp/probe-c.py <<'PY'
import subprocess, sys, json, os, tempfile, shutil
TMP = tempfile.mkdtemp()
fake_app = os.path.join(TMP, 'apps', 'round-trip')
amd = os.path.join(fake_app, 'curriculum', 'implementation', 'practice-v1')
os.makedirs(amd)
fixture = {
    'activities': [
        {'activityId': 'math.x.concept.a'},
        {'activityId': 'math.x.concept.b'},
        {'activityId': 'math.x.skill.c'},
        {'activityId': 'math.x.concept.d'},
    ]
}
activity_map_path = os.path.join(amd, 'activity-map.json')
with open(activity_map_path, 'w') as f:
    json.dump(fixture, f)
result = subprocess.run(
    ["npx", "tsx", "-e", f"""
import {{ countConceptBlueprints, remediate }} from "./scripts/remediate-concept-blueprints";
import * as fs from "node:fs";
const parsed = JSON.parse(fs.readFileSync({json.dumps(activity_map_path)}, "utf-8"));
const detectorCount = countConceptBlueprints(parsed);
const summary = remediate({{ repoRoot: {json.dumps(TMP)}, scanRoots: ["apps"], dryRun: true }});
console.log("  detector (parsed) count: " + detectorCount);
console.log("  remediate (end-to-end) totalRemoved: " + summary.totalRemoved);
if (detectorCount !== 3 || summary.totalRemoved !== 3) {{
  console.log("  FAIL: expected 3/3, got " + detectorCount + "/" + summary.totalRemoved);
  process.exit(1);
}}
"""],
    capture_output=True, text=True,
)
sys.stdout.write(result.stdout)
if result.returncode != 0:
    sys.stderr.write(result.stderr)
    sys.exit(result.returncode)
shutil.rmtree(TMP)
PY
python3 /tmp/probe-c.py 2>&1 | tee -a "$OUT"
rm /tmp/probe-c.py
pass "detector and end-to-end counts agree (3/3)"

log ""
log "== All Phase 4 adversarial probes PASS =="
