/**
 * Phase 3 Red — Experiment registry (Task 1 of Phase 3, second half).
 *
 * Asserts FR3 registry behavior per test-strategy §6 Phase 3:
 *   "Registry test enforces uniqueness, status lifecycle, guardrail caps."
 *
 * The registry is the in-memory store of active experiments; assignment
 * is sticky across re-runs (test-strategy §4: "Sticky assignment must
 * survive (a) re-running with same inputs, (b) registry reorder, (c)
 * variant weight rebalance for *new* enrollees only — existing
 * assignments are frozen.")
 *
 * The registry is the in-process data structure. The Convex persistence
 * wrapper (if any in Phase 4) is a separate concern.
 *
 * Imports `../../src/experiment/registry` which does not yet exist at
 * HEAD — Red command must fail with ERR_MODULE_NOT_FOUND for at least
 * the import line, then surface the missing-impl state on every assertion.
 */

import { describe, it, expect } from 'vitest';

import {
  createExperimentRegistry,
  type ExperimentEntry,
  type ExperimentStatus,
} from '../../src/experiment/registry';

function makeEntry(overrides: Partial<ExperimentEntry> = {}): ExperimentEntry {
  return {
    id: 'exp_default',
    name: 'Default experiment',
    status: 'active',
    variants: [
      { id: 'control', weight: 1 },
      { id: 'treatment', weight: 1 },
    ],
    createdAtMs: Date.UTC(2026, 0, 1),
    ...overrides,
  };
}

describe('createExperimentRegistry (Phase 3 Red — Task 1)', () => {
  it('returns a fresh empty registry', () => {
    const reg = createExperimentRegistry();
    expect(reg.list().size).toBe(0);
    expect(reg.get('nope')).toBeUndefined();
  });

  it('adds an experiment and retrieves it by id', () => {
    const reg = createExperimentRegistry();
    reg.add(makeEntry({ id: 'exp_a' }));
    expect(reg.get('exp_a')?.id).toBe('exp_a');
    expect(reg.list().size).toBe(1);
  });

  it('rejects duplicate experiment ids (uniqueness contract)', () => {
    const reg = createExperimentRegistry();
    reg.add(makeEntry({ id: 'exp_dup' }));
    expect(() => reg.add(makeEntry({ id: 'exp_dup' }))).toThrow(/duplicate|exists|already/i);
  });

  it('exposes listActive() returning only active (non-archived) experiments', () => {
    const reg = createExperimentRegistry();
    reg.add(makeEntry({ id: 'exp_active_1', status: 'active' }));
    reg.add(makeEntry({ id: 'exp_draft_1', status: 'draft' }));
    reg.add(makeEntry({ id: 'exp_arch_1', status: 'archived' }));
    const activeIds = [...reg.listActive()].map((e) => e.id);
    expect(activeIds).toContain('exp_active_1');
    expect(activeIds).not.toContain('exp_draft_1');
    expect(activeIds).not.toContain('exp_arch_1');
  });

  it('archives an experiment by id (status → archived)', () => {
    const reg = createExperimentRegistry();
    reg.add(makeEntry({ id: 'exp_to_arch' }));
    reg.archive('exp_to_arch');
    expect(reg.get('exp_to_arch')?.status).toBe<ExperimentStatus>('archived');
    expect([...reg.listActive()].some((e) => e.id === 'exp_to_arch')).toBe(false);
  });

  it('throws when archiving an unknown experiment id', () => {
    const reg = createExperimentRegistry();
    expect(() => reg.archive('exp_ghost')).toThrow(/not found|unknown/i);
  });

  it('rejects adding a new entry with a duplicate id even across active + archived', () => {
    const reg = createExperimentRegistry();
    reg.add(makeEntry({ id: 'exp_once' }));
    reg.archive('exp_once');
    expect(() => reg.add(makeEntry({ id: 'exp_once' }))).toThrow(/duplicate|exists|already/i);
  });

  it('enforces guardrail cap: more than MAX_VARIANTS variants is rejected', () => {
    const reg = createExperimentRegistry();
    const tooMany = Array.from({ length: 9 }, (_, i) => ({ id: `v${i}`, weight: 1 }));
    expect(() => reg.add(makeEntry({ id: 'exp_too_many', variants: tooMany }))).toThrow(
      /variants|too many|limit|cap/i,
    );
  });

  it('enforces guardrail cap: a single variant weight above MAX_WEIGHT is rejected', () => {
    const reg = createExperimentRegistry();
    expect(() =>
      reg.add(
        makeEntry({
          id: 'exp_heavy',
          variants: [{ id: 'a', weight: 10_000_000 }],
        }),
      ),
    ).toThrow(/weight|too large|cap/i);
  });

  it('enforces guardrail cap: zero-weight variants are rejected', () => {
    const reg = createExperimentRegistry();
    expect(() =>
      reg.add(
        makeEntry({
          id: 'exp_zero',
          variants: [
            { id: 'a', weight: 1 },
            { id: 'b', weight: 0 },
          ],
        }),
      ),
    ).toThrow(/weight|positive|non-zero/i);
  });
});
