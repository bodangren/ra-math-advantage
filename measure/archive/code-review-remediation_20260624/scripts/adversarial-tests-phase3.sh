#!/usr/bin/env bash
# Adversarial test runner for Phase 3 (Cluster C — advanced-math-generators
# correctness & quality). Five probes, each a structural or behavioral
# stress-test independent of the in-tree vitest assertions.
#
# Probes:
#   (a) HA variation: rational-analyzer produces ≥ 2 distinct ratios across
#       seeds {1..50} AND at least one non-unit ratio (re-verifies the FR-7
#       fix end-to-end at runtime).
#   (b) seededRandom spy: vi.spyOn(seededRandom) is called exactly once per
#       generateExpLogProblem invocation (re-verifies the FR-8 single-pass
#       fix; runs the test file directly so it is not just static).
#   (c) Call-site discipline: zero local definitions of seededRandom /
#       generateCoefficients / formatPolynomial across packages/math-content/src
#       outside utils/. All callers import from '../utils/...' or
#       './utils/...'. (FR-9.)
#   (d) formatPolynomial edge cases: zero-coefficient padding, leading
#       negative, and fractional coefficients all format without throwing
#       and yield expected canonical forms.
#   (e) Flat registry deleted AND name-resolution still works for all four
#       advanced adapters (polynomial-operations, polynomial-division,
#       rational-analyzer, exp-log-solver) via getGenerator(key).
#
# Exit codes:
#   0 = all probes pass
#   1 = at least one probe failed (behavioural regression or bypass)
#   2 = runner-plumbing error (missing file, tsx/node missing, etc.)
#
# Output:
#   measure/tracks/code-review-remediation_20260624/_artifacts/adversarial-run-phase3.txt

set -uo pipefail

REPO="$(git rev-parse --show-toplevel)"
ART="$REPO/measure/tracks/code-review-remediation_20260624/_artifacts"
OUT="$ART/adversarial-run-phase3.txt"
PKG="$REPO/packages/math-content"

mkdir -p "$ART"
: > "$OUT"

log() { echo "$@" | tee -a "$OUT"; }

log "Phase 3 Adversarial Test Runner — code-review-remediation_20260624"
log "Started: $(date -Iseconds)"
log "Repo: $REPO"
log "===================================================================="
log ""

failures=0

# ---------------------------------------------------------------------------
# (a) HA variation across ≥5 distinct seeds (in fact, 50)
# ---------------------------------------------------------------------------
log "[PROBE A] rational-analyzer HA varies across 50 seeds (≥5 distinct ratios)"
ha_test="$PKG/src/__tests__/__adversarial-phase3-ha.test.ts"
cat > "$ha_test" <<'TS'
import { describe, it, expect } from 'vitest';
import { generateRationalProblem } from '../rational-analyzer';

describe('[adversarial-phase3-a] rational-analyzer HA varies across 50 seeds', () => {
  it('yields at least 5 distinct HA ratios and at least one non-unit ratio', () => {
    const ratios = new Set<number>();
    let nonUnit = 0;
    for (let s = 1; s <= 50; s++) {
      const p = generateRationalProblem({ seed: s });
      const r = p.horizontalAsymptote?.ratio;
      if (typeof r === 'number' && Number.isFinite(r)) {
        ratios.add(Number(r.toFixed(4)));
        if (Math.abs(r - 1) > 1e-9) nonUnit++;
      }
    }
    expect(ratios.size).toBeGreaterThanOrEqual(5);
    expect(nonUnit).toBeGreaterThanOrEqual(1);
  });
});
TS

( cd "$PKG" && npx vitest run src/__tests__/__adversarial-phase3-ha.test.ts ) 2>&1 | tee -a "$OUT"
rc=${PIPESTATUS[0]}
rm -f "$ha_test"
if [ "$rc" -eq 0 ]; then
  log "[PROBE A] PASS"
else
  log "[PROBE A] FAIL (rc=$rc)"
  failures=$((failures+1))
fi
log ""

# ---------------------------------------------------------------------------
# (b) seededRandom spy called exactly once per generateExpLogProblem
# ---------------------------------------------------------------------------
log "[PROBE B] exp-log-solver: seededRandom spy called exactly once per generation"
spy_test="$PKG/src/__tests__/__adversarial-phase3-spy.test.ts"
cat > "$spy_test" <<'TS'
import { describe, it, expect, vi } from 'vitest';
import * as prng from '../utils/prng';
import { generateExpLogProblem } from '../exp-log-solver';

describe('[adversarial-phase3-b] seededRandom is called exactly once per generation', () => {
  it('5 distinct seeds → exactly 5 invocations total, 1 each', () => {
    const spy = vi.spyOn(prng, 'seededRandom');
    let total = 0;
    for (let s of [1, 7, 42, 101, 523]) {
      const before = spy.mock.calls.length;
      generateExpLogProblem({ seed: s });
      const delta = spy.mock.calls.length - before;
      expect(delta).toBe(1);
      total += delta;
    }
    expect(total).toBe(5);
    spy.mockRestore();
  });
});
TS

( cd "$PKG" && npx vitest run src/__tests__/__adversarial-phase3-spy.test.ts ) 2>&1 | tee -a "$OUT"
rc=${PIPESTATUS[0]}
rm -f "$spy_test"
if [ "$rc" -eq 0 ]; then
  log "[PROBE B] PASS"
else
  log "[PROBE B] FAIL (rc=$rc)"
  failures=$((failures+1))
fi
log ""

# ---------------------------------------------------------------------------
# (c) Call-site discipline: no local copies of seededRandom/generateCoefficients/formatPolynomial
# ---------------------------------------------------------------------------
log "[PROBE C] Call-site discipline: single source of truth for shared utils"
seed_defs=$(rg -c "^(export )?function seededRandom" "$PKG/src" --type ts 2>/dev/null | wc -l)
coef_defs=$(rg -c "^(export )?function generateCoefficients" "$PKG/src" --type ts 2>/dev/null | wc -l)
fmt_defs=$(rg -c "^(export )?function formatPolynomial" "$PKG/src" --type ts 2>/dev/null | wc -l)
log "  seededRandom definitions: $seed_defs (expected 1)"
log "  generateCoefficients definitions: $coef_defs (expected 1)"
log "  formatPolynomial definitions: $fmt_defs (expected 1)"

# Detailed file lists
rg -n "^(export )?function seededRandom" "$PKG/src" --type ts | tee -a "$OUT"
rg -n "^(export )?function generateCoefficients" "$PKG/src" --type ts | tee -a "$OUT"
rg -n "^(export )?function formatPolynomial" "$PKG/src" --type ts | tee -a "$OUT"

# Importers of utils
log "  Importers of utils/prng:"
rg -l "from .*utils/prng" "$PKG/src" --type ts | tee -a "$OUT"

if [ "$seed_defs" -eq 1 ] && [ "$coef_defs" -eq 1 ] && [ "$fmt_defs" -eq 1 ]; then
  log "[PROBE C] PASS"
else
  log "[PROBE C] FAIL: extra local copies remain"
  failures=$((failures+1))
fi
log ""

# ---------------------------------------------------------------------------
# (d) formatPolynomial edge cases
# ---------------------------------------------------------------------------
log "[PROBE D] formatPolynomial edge cases (zeros, leading negative, fractions)"
edge_test="$PKG/src/__tests__/__adversarial-phase3-format.test.ts"
cat > "$edge_test" <<'TS'
import { describe, it, expect } from 'vitest';
import { formatPolynomial } from '../utils/polynomial-format';

describe('[adversarial-phase3-d] formatPolynomial edge cases', () => {
  it('handles all-zero array', () => {
    expect(formatPolynomial([0, 0, 0])).toBe('0');
  });

  it('handles empty array', () => {
    expect(formatPolynomial([])).toBe('0');
  });

  it('handles single constant', () => {
    expect(formatPolynomial([5])).toBe('5');
  });

  it('handles zero coefficients in middle (skips them)', () => {
    // x^2 + 7   (no x term)
    const out = formatPolynomial([7, 0, 1]);
    expect(out).toContain('x²');
    expect(out).toContain('7');
    expect(out).not.toMatch(/x[^²³⁰¹⁴⁵⁶⁷⁸⁹]/); // no bare x
  });

  it('handles leading negative coefficient', () => {
    // -x^2 + 3   →  "−x² + 3"
    const out = formatPolynomial([3, 0, -1]);
    expect(out.startsWith('−')).toBe(true);
    expect(out).toContain('x²');
    expect(out).toContain('+ 3');
  });

  it('handles fractional coefficients without throwing', () => {
    const out = formatPolynomial([0.5, -1.25, 2]);
    // sanity: returns a non-empty string
    expect(typeof out).toBe('string');
    expect(out.length).toBeGreaterThan(0);
  });

  it('handles all-negative polynomial', () => {
    const out = formatPolynomial([-3, -2, -1]);
    expect(out.startsWith('−')).toBe(true);
    // both subsequent terms must use "− " separator
    expect((out.match(/−/g) || []).length).toBeGreaterThanOrEqual(3);
  });

  it('handles coefficient = 1 with x^1 (no "1" prefix)', () => {
    expect(formatPolynomial([0, 1])).toBe('x');
  });

  it('handles coefficient = -1 with x^1 (just "−x")', () => {
    expect(formatPolynomial([0, -1])).toBe('−x');
  });
});
TS

( cd "$PKG" && npx vitest run src/__tests__/__adversarial-phase3-format.test.ts ) 2>&1 | tee -a "$OUT"
rc=${PIPESTATUS[0]}
rm -f "$edge_test"
if [ "$rc" -eq 0 ]; then
  log "[PROBE D] PASS"
else
  log "[PROBE D] FAIL (rc=$rc)"
  failures=$((failures+1))
fi
log ""

# ---------------------------------------------------------------------------
# (e) Flat registry deleted + name resolution still works for all 4 adapters
# ---------------------------------------------------------------------------
log "[PROBE E] Flat generator-registry.ts deleted + name resolution works"
if [ -f "$PKG/src/generator-registry.ts" ]; then
  log "  generator-registry.ts STILL EXISTS — FAIL"
  failures=$((failures+1))
else
  log "  generator-registry.ts deleted: confirmed"
fi

reg_test="$PKG/src/knowledge-space/__tests__/__adversarial-phase3-registry.test.ts"
cat > "$reg_test" <<'TS'
import { describe, it, expect } from 'vitest';
import { getGenerator } from '../generators/registry';

describe('[adversarial-phase3-e] registry resolves all 4 advanced adapters by name', () => {
  it.each([
    'polynomial-operations',
    'polynomial-division',
    'rational-analyzer',
    'exp-log-solver',
  ])('resolves %s with non-empty nodeIds and produces output for seed 1', (key) => {
    const gen = getGenerator(key);
    expect(gen).toBeDefined();
    expect(gen!.key).toBe(key);
    expect(Array.isArray(gen!.nodeIds)).toBe(true);
    expect(gen!.nodeIds.length).toBeGreaterThan(0);
    for (const id of gen!.nodeIds) {
      expect(id).toMatch(/^math\.im3\.skill\./);
    }

    const out = gen!.generate({ seed: 1, nodeId: gen!.nodeIds[0]!, difficulty: 'standard' });
    expect(out).toBeDefined();
    expect(typeof out.prompt).toBe('string');
    expect(out.prompt.length).toBeGreaterThan(0);
  });

  it('throws on unknown key (no silent fallback)', () => {
    expect(() => getGenerator('nonexistent-key')).toThrow(/Unknown generator key/);
  });
});
TS

( cd "$PKG" && npx vitest run src/knowledge-space/__tests__/__adversarial-phase3-registry.test.ts ) 2>&1 | tee -a "$OUT"
rc=${PIPESTATUS[0]}
rm -f "$reg_test"
if [ "$rc" -eq 0 ]; then
  log "[PROBE E] registry-resolution PASS"
else
  log "[PROBE E] registry-resolution FAIL (rc=$rc)"
  failures=$((failures+1))
fi
log ""

# ---------------------------------------------------------------------------
# Verdict
# ---------------------------------------------------------------------------
log "===================================================================="
log "Adversarial Phase 3: $failures probe(s) failed."
if [ "$failures" -eq 0 ]; then
  log "VERDICT: PASS"
  exit 0
else
  log "VERDICT: FAIL"
  exit 1
fi
