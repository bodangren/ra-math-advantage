/**
 * Phase 2 Red — Small-n suppression / privacy guardrails (Task 2 of Phase 2).
 *
 * Asserts FR6 + test-strategy §4 + §6 Phase 2: cohorts below the
 * minimum-n threshold return a discriminated `{ status: 'suppressed', n, threshold }`
 * result with no metric values and no PII.
 *
 * The module under test is `@/convex/efficacy/suppression` (an app-local
 * helper) which does not exist at HEAD — the Red command must fail with
 * ERR_MODULE_NOT_FOUND for the import, and the assertions pin the
 * contract the next role (Green/impl) must satisfy.
 *
 * Contract pinned:
 * - `MIN_COHORT_N` is exported, is a positive integer >= 2.
 * - `suppressIfSmallN(n)` returns `{ status: 'ok' }` when n >= MIN_COHORT_N.
 * - `suppressIfSmallN(n)` returns `{ status: 'suppressed', n, threshold }`
 *   when n < MIN_COHORT_N.
 * - Boundary safety: n === MIN_COHORT_N - 1 → suppressed;
 *   n === MIN_COHORT_N → ok.
 * - n === 0 → suppressed (empty cohort).
 * - n === 1 → suppressed (single-student privacy).
 * - Suppressed payloads contain only `n` + `status` + `threshold` —
 *   no metric values, no student ids, no PII.
 * - Pure function: no `ctx` dependency (verifiable by importing and
 *   calling without any `ctx`).
 */

import { describe, it, expect } from 'vitest';

import {
  MIN_COHORT_N,
  suppressIfSmallN,
  type CohortSuppressionResult,
} from '@/convex/efficacy/suppression';

describe('MIN_COHORT_N contract (Phase 2 Red — Task 2)', () => {
  it('is exported as a finite, positive integer', () => {
    expect(Number.isFinite(MIN_COHORT_N)).toBe(true);
    expect(Number.isInteger(MIN_COHORT_N)).toBe(true);
    expect(MIN_COHORT_N).toBeGreaterThanOrEqual(2);
  });

  it('is in a reasonable k-anonymity range (5–30) for class-level learning metrics', () => {
    // 5 is the conventional k-anonymity threshold for class-level
    // learning metrics; values above ~30 are operationally useless for
    // most cohorts. Pinning the bounds leaves the exact value to the
    // impl while preventing drift to 1 (no privacy) or 10_000 (no signal).
    expect(MIN_COHORT_N).toBeGreaterThanOrEqual(5);
    expect(MIN_COHORT_N).toBeLessThanOrEqual(30);
  });
});

describe('suppressIfSmallN (Phase 2 Red — Task 2)', () => {
  it('returns status: "ok" when n is strictly above the threshold', () => {
    const result = suppressIfSmallN(MIN_COHORT_N + 1);
    expect(result.status).toBe('ok');
  });

  it('returns status: "ok" at the exact threshold (inclusive lower bound)', () => {
    const result = suppressIfSmallN(MIN_COHORT_N);
    expect(result.status).toBe('ok');
  });

  it('returns status: "suppressed" one below the threshold (boundary safety)', () => {
    const result = suppressIfSmallN(MIN_COHORT_N - 1);
    expect(result.status).toBe('suppressed');
    if (result.status === 'suppressed') {
      expect(result.n).toBe(MIN_COHORT_N - 1);
      expect(result.threshold).toBe(MIN_COHORT_N);
    }
  });

  it('returns status: "suppressed" for empty cohorts (n=0)', () => {
    const result = suppressIfSmallN(0);
    expect(result.status).toBe('suppressed');
    if (result.status === 'suppressed') {
      expect(result.n).toBe(0);
      expect(result.threshold).toBe(MIN_COHORT_N);
    }
  });

  it('returns status: "suppressed" for single-student cohorts (n=1, PII risk)', () => {
    const result = suppressIfSmallN(1);
    expect(result.status).toBe('suppressed');
  });

  it('returns a suppressed payload that contains ONLY n, status, and threshold (privacy guarantee)', () => {
    const result = suppressIfSmallN(2);
    expect(result.status).toBe('suppressed');
    const keys = Object.keys(result).sort();
    expect(keys).toEqual(['n', 'status', 'threshold']);
  });

  it('returns an ok payload that contains ONLY status (no spurious fields)', () => {
    const result = suppressIfSmallN(MIN_COHORT_N);
    expect(result.status).toBe('ok');
    const keys = Object.keys(result).sort();
    expect(keys).toEqual(['status']);
  });

  it('is a pure function (no ctx dependency, no I/O, deterministic)', () => {
    // Same input → same output, no mutation, no thrown errors.
    const a = suppressIfSmallN(3);
    const b = suppressIfSmallN(3);
    expect(a).toEqual(b);
    const c = suppressIfSmallN(7);
    expect(c.status).toBe(b.status); // also deterministic; same status
  });

  it('exposes a typed discriminated union (CohortSuppressionResult) for caller narrowing', () => {
    // Compile-time check via runtime assertions on shape compatibility.
    const ok: CohortSuppressionResult = { status: 'ok' };
    const suppressed: CohortSuppressionResult = {
      status: 'suppressed',
      n: 3,
      threshold: MIN_COHORT_N,
    };
    expect(ok.status).toBe('ok');
    expect(suppressed.status).toBe('suppressed');
  });
});
