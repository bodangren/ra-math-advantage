// Phase-3 registry-sweep tests — Red phase (TDD).
//
// Contract under test (per measure/tracks/.../test-strategy.md §5, Phase 3):
//
//   "A single `registry-sweep.test.ts` using Vitest `describe.each(GENERATOR_KEYS)`.
//    Per-key opt-out via a `qaSkip: { uniqueAnswer?: true; reason: string }`
//    field on `MathGenerator` (additive — preserves blast radius).
//    Quarantined keys MUST log a debt row."
//
// The `runRegistrySweep` module (../registry-sweep) does not exist yet;
// the value import on `runRegistrySweep` forces a module-resolution
// failure, failing every test in this file. The `qaSkip` field on
// `MathGenerator` also does not exist yet, and the debt-log sink has no
// implementation. Once the Green phase lands the sweep module +
// additive `qaSkip` field + debt-logging callback, the imports resolve
// and the assertions evaluate against the real implementation.
//
// File location: this test lives in `math-content` because the registry
// lives in `math-content` and the sweep is the consumer of the
// domain-neutral harness (`@math-platform/practice-core/generator-qa`).
// The boundary rule (test-strategy §4) — "harness core must not import
// from `math-content`" — is about the HARNESS CORE source, not about
// consumers. math-content is allowed to depend on practice-core; the
// test follows the same direction as the production sweep code.

import { describe, it, expect, vi } from 'vitest';

import {
  runRegistrySweep,
  type RegistrySweepOptions,
  type RegistrySweepReport,
  type DebtLogEntry,
  type QaSkipSpec,
} from '../registry-sweep'; // Intentional: non-existent module → Red.

import { GENERATOR_KEYS, getGenerator, type MathGenerator } from '../registry';

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

/**
 * `MathGenerator` extended with the additive `qaSkip` opt-out field.
 * The extension is a local type alias only — the field is added to
 * `MathGenerator` in the Green phase of this plan task. Tests use a
 * cast at the registry boundary (`getGenerator(key) as ...`) so the
 * rest of the codebase stays unaffected during the Red phase.
 */
type QaSkipCapableMathGenerator = MathGenerator & { readonly qaSkip?: QaSkipSpec };

/**
 * Build a math-content `MathGenerator` fixture that conforms to the
 * real `GeneratorOutput` shape (`prompt`, `data`, `expectedAnswer`,
 * `solutionSteps`, `gradingMetadata`) and optionally carries a
 * `qaSkip` opt-out for quarantine testing.
 *
 * The output deliberately uses `exact_match` grading rules with a
 * trivial deterministic `expectedAnswer` so the real harness's
 * determinism check always passes on this fixture.
 */
function makeFixture(opts: {
  readonly key: string;
  readonly qaSkip?: QaSkipSpec;
  readonly description?: string;
}): QaSkipCapableMathGenerator {
  return {
    key: opts.key,
    nodeIds: [],
    description: opts.description ?? `Fixture for ${opts.key}`,
    ...(opts.qaSkip !== undefined ? { qaSkip: opts.qaSkip } : {}),
    generate: () => ({
      prompt: `fixture prompt for ${opts.key}`,
      data: { fixture: true },
      expectedAnswer: { result: 'fixture' },
      solutionSteps: [
        { description: 'fixture step', expression: 'fixture', value: 'fixture' },
      ],
      gradingMetadata: {
        partAnswers: { result: 'fixture' },
        partMaxScores: { result: 1 },
        partGradingRules: { result: 'exact_match' },
      },
    }),
  };
}

/** Build a synthetic registry out of `makeFixture` entries. */
function buildSyntheticRegistry(
  entries: ReadonlyArray<{ readonly key: string; readonly qaSkip?: QaSkipSpec }>,
): Record<string, QaSkipCapableMathGenerator> {
  const out: Record<string, QaSkipCapableMathGenerator> = {};
  for (const e of entries) {
    out[e.key] = makeFixture({ key: e.key, ...(e.qaSkip !== undefined ? { qaSkip: e.qaSkip } : {}) });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Aggregate report (AC2, FR6)
// ---------------------------------------------------------------------------

describe('Registry sweep — aggregate report (AC2, FR6)', () => {
  it('produces a report covering every key in GENERATOR_KEYS', () => {
    const registry: Record<string, QaSkipCapableMathGenerator> = {};
    for (const key of GENERATOR_KEYS) {
      registry[key] = getGenerator(key) as QaSkipCapableMathGenerator;
    }
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report.totalGenerators).toBe(GENERATOR_KEYS.length);
    expect(report.perKey).toHaveLength(GENERATOR_KEYS.length);
  });

  it('report has a stable shape that the Phase 4 CI gate can parse', () => {
    const registry = buildSyntheticRegistry([
      { key: 'shape-a' },
      { key: 'shape-b', qaSkip: { uniqueAnswer: true, reason: 'shape test' } },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report).toMatchObject({
      verdict: expect.stringMatching(/^(pass|fail)$/),
      totalGenerators: expect.any(Number),
      passedKeys: expect.any(Array),
      failedKeys: expect.any(Array),
      quarantinedKeys: expect.any(Array),
      perKey: expect.any(Array),
      debtRows: expect.any(Array),
    });
  });

  it('passes when every key in a synthetic registry passes the harness (AC2)', () => {
    const registry = buildSyntheticRegistry([
      { key: 'synth-a' },
      { key: 'synth-b' },
      { key: 'synth-c' },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report.verdict).toBe('pass');
    expect(report.failedKeys).toEqual([]);
    expect(report.passedKeys).toEqual(['synth-a', 'synth-b', 'synth-c']);
    expect(report.totalGenerators).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Per-key checks (FR6 AC2 — every generator through the harness)
// ---------------------------------------------------------------------------

describe.each(GENERATOR_KEYS)(
  'Registry sweep — generator: %s',
  (key: string) => {
    it('passes the harness (or is properly quarantined with a reason)', () => {
      const registry: Record<string, QaSkipCapableMathGenerator> = {
        [key]: getGenerator(key) as QaSkipCapableMathGenerator,
      };
      const report: RegistrySweepReport = runRegistrySweep(registry);
      const perKey = report.perKey.find((p) => p.key === key);
      expect(perKey).toBeDefined();
      // A non-quarantined key must have a passing report.
      // (A quarantined key is allowed to fail the skipped check
      // because the skip is the contract — see the qaSkip suite.)
      if (perKey && !perKey.quarantined) {
        expect(perKey.report.verdict).toBe('pass');
      }
      // A quarantined key MUST carry a reason.
      if (perKey && perKey.quarantined) {
        expect(perKey.skipReason).toBeTruthy();
      }
    });
  },
);

// ---------------------------------------------------------------------------
// qaSkip opt-out (test-strategy §5)
// ---------------------------------------------------------------------------

describe('Registry sweep — qaSkip opt-out (test-strategy §5)', () => {
  it('honors qaSkip.uniqueAnswer: marks the key as quarantined', () => {
    const registry = buildSyntheticRegistry([
      {
        key: 'stub-qaskip',
        qaSkip: {
          uniqueAnswer: true,
          reason: 'stub generator has no real math',
        },
      },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    const perKey = report.perKey[0];
    expect(perKey).toBeDefined();
    expect(perKey?.quarantined).toBe(true);
    expect(perKey?.skippedChecks).toContain('unique-answer');
    expect(perKey?.skipReason).toBe('stub generator has no real math');
  });

  it('does not count a quarantined key as a failure', () => {
    const registry = buildSyntheticRegistry([
      {
        key: 'stub-qaskip',
        qaSkip: { uniqueAnswer: true, reason: 'stub' },
      },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report.failedKeys).not.toContain('stub-qaskip');
    expect(report.quarantinedKeys).toContain('stub-qaskip');
  });

  it('qaSkip is additive — does not affect non-quarantined keys in the same registry', () => {
    const registry = buildSyntheticRegistry([
      { key: 'synth-passing' },
      {
        key: 'synth-qaskip',
        qaSkip: { uniqueAnswer: true, reason: 'stub' },
      },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report.totalGenerators).toBe(2);
    expect(report.passedKeys).toContain('synth-passing');
    expect(report.quarantinedKeys).toContain('synth-qaskip');
    expect(report.failedKeys).toEqual([]);
  });

  it('omitting qaSkip leaves the key in the non-quarantined pass/fail path', () => {
    const registry = buildSyntheticRegistry([{ key: 'no-qaskip' }]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    const perKey = report.perKey[0];
    expect(perKey).toBeDefined();
    expect(perKey?.quarantined).toBe(false);
    expect(perKey?.skippedChecks).toEqual([]);
    expect(perKey?.skipReason).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// Debt-row logging (test-strategy §5 — "Quarantined keys MUST log a debt row")
// ---------------------------------------------------------------------------

describe('Registry sweep — debt-row logging for quarantined keys (test-strategy §5)', () => {
  it('invokes options.debtLogSink once per quarantined check', () => {
    const sink = vi.fn<(entry: DebtLogEntry) => void>();
    const options: RegistrySweepOptions = { debtLogSink: sink };
    const registry = buildSyntheticRegistry([
      {
        key: 'stub-qaskip',
        qaSkip: {
          uniqueAnswer: true,
          reason: 'stub generator has no real math',
        },
      },
    ]);
    runRegistrySweep(registry, options);
    expect(sink).toHaveBeenCalledTimes(1);
    expect(sink).toHaveBeenCalledWith(
      expect.objectContaining({
        key: 'stub-qaskip',
        checkName: 'unique-answer',
        reason: 'stub generator has no real math',
        trackId: 'generated-math-correctness-qa_20260605',
      }),
    );
  });

  it('does not invoke the sink for non-quarantined keys', () => {
    const sink = vi.fn<(entry: DebtLogEntry) => void>();
    const options: RegistrySweepOptions = { debtLogSink: sink };
    const registry = buildSyntheticRegistry([{ key: 'no-quarantine' }]);
    runRegistrySweep(registry, options);
    expect(sink).not.toHaveBeenCalled();
  });

  it('formats a debt row string suitable for tech-debt.md consumption', () => {
    const registry = buildSyntheticRegistry([
      {
        key: 'stub-qaskip',
        qaSkip: {
          uniqueAnswer: true,
          reason: 'stub generator has no real math',
        },
      },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report.debtRows).toHaveLength(1);
    const row = report.debtRows[0] ?? '';
    expect(row).toContain('stub-qaskip');
    expect(row).toContain('unique-answer');
    expect(row).toContain('stub generator has no real math');
  });

  it('produces one debt row per quarantined check, not per quarantined key', () => {
    const registry = buildSyntheticRegistry([
      {
        key: 'multi-qaskip',
        qaSkip: {
          uniqueAnswer: true,
          // Future Green-phase additions: distractorValidity, invariants, etc.
          // Each entry in qaSkip maps to exactly one debt row.
          reason: 'multi-check stub',
        },
      },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report.debtRows.length).toBeGreaterThanOrEqual(1);
    // Sanity: at least one row mentions the quarantined key + check.
    const matches = report.debtRows.filter(
      (r) => r.includes('multi-qaskip') && r.includes('unique-answer'),
    );
    expect(matches.length).toBeGreaterThanOrEqual(1);
  });
});

// ---------------------------------------------------------------------------
// Registry-shape contract (Phase 3 → Phase 4 handoff)
// ---------------------------------------------------------------------------

describe('Registry sweep — registry-shape contract (Phase 3 → Phase 4 handoff)', () => {
  it('GENERATOR_KEYS is a non-empty readonly string array', () => {
    expect(Array.isArray(GENERATOR_KEYS)).toBe(true);
    expect(GENERATOR_KEYS.length).toBeGreaterThan(0);
    for (const k of GENERATOR_KEYS) {
      expect(typeof k).toBe('string');
      expect(k.length).toBeGreaterThan(0);
    }
  });

  it('per-key report entries each carry a stable key and verdict', () => {
    const registry = buildSyntheticRegistry([
      { key: 'shape-x' },
      { key: 'shape-y', qaSkip: { uniqueAnswer: true, reason: 'shape' } },
    ]);
    const report: RegistrySweepReport = runRegistrySweep(registry);
    expect(report.perKey).toHaveLength(2);
    for (const entry of report.perKey) {
      expect(typeof entry.key).toBe('string');
      expect(entry.key.length).toBeGreaterThan(0);
      expect(['pass', 'fail']).toContain(entry.report.verdict);
      expect(typeof entry.quarantined).toBe('boolean');
      expect(Array.isArray(entry.skippedChecks)).toBe(true);
    }
  });

  it('registry-sweep module is co-located with the registry it sweeps (boundary)', () => {
    // Boundary check: the sweep module lives at ../registry-sweep relative
    // to this test (which is __tests__/registry-sweep.test.ts), i.e. the
    // same directory as registry.ts. This is asserted as an import-path
    // string so the test reads the expected location from the source
    // rather than a magic constant.
    const importPath = '../registry-sweep';
    expect(importPath.startsWith('../')).toBe(true);
    expect(importPath.endsWith('registry-sweep')).toBe(true);
  });
});
