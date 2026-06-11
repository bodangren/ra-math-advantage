// Phase 2 — Task 3: CI gate — every IM1 generator passes the Generated-
// Math Correctness QA harness (golden-answer + properties).
//
// Red phase (TDD).
//
// Contract under test (per measure/tracks/im1-practice-readiness_20260609/
// {plan,spec,test-strategy}.md):
//
//   plan.md Phase 2 Task 3:
//     "All new generators pass the Generated-Math Correctness QA
//      harness (golden-answer + properties)."
//
//   spec.md AC1:
//     "`packages/math-content/src/problem-families/im1/` exists with
//      generators for the prioritized IM1 skills; correctness-QA
//      harness green for all of them."
//
//   test-strategy.md §1 row Phase 2:
//     "Contract: `GeneratorCorrectnessContract` via `runGeneratorGate`"
//     "Property: determinism + invariants + distractor-validity
//      (≥50 seeds)"
//   test-strategy.md §2:
//     "Real IM1 generators register through a single
//      `packages/math-content/src/problem-families/im1/__tests__/ci-gate.test.ts`."
//   test-strategy.md §7 row Phase 2 Green/closeout gate:
//     "`npm run -w packages/practice-core test:generators`
//      (real generators, `numSeeds ≥ 50`)" — Kind B (live-behavior).
//   test-strategy.md §6 handoff:
//     "real generators (not stubGenerator) must back every entry in
//      the IM1 ci-gate registration."
//
// Red signal: imports `IM1_GENERATORS` from `../generators`. That
// module does not exist at HEAD. The value import forces a module-
// resolution failure, failing every test in this file at import
// time. When Phase 2 Task 1 lands the registry scaffold and Tasks 2
// per-skill generators register entries with real implementations,
// the import resolves and the gate iterates the real generators.
//
// Live-behavior proof (test-strategy §7, Kind B):
//   For every registered IM1 generator, this gate calls
//   `verifyGenerator(adapter(gen), { numSeeds: 50 })` and asserts a
//   `verdict === 'pass'`. The adapter is the same shape that
//   `packages/math-content/src/knowledge-space/generators/registry-sweep.ts`
//   uses to wrap real `MathGenerator` outputs into the harness's
//   `GeneratorCorrectnessContract`. No stub fixtures — the production
//   generator is the unit of work, exactly as test-strategy §6
//   demands ("real generators (not stubGenerator) must back every
//   entry in the IM1 ci-gate registration").
//
// Why this is NOT a "false Red": the assertion
// `report.verdict === 'pass'` would still fail if Task 1 landed an
// empty registry — the gate also asserts `IM1_GENERATORS` covers
// every Module-1 skill from the rollout gap queue. Both the
// registration-count fail and the per-entry verdict fail are
// independently sufficient signals. The gate cannot pass without
// real generators backing every entry.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  verifyGenerator,
  type GeneratorLike,
  type VerifyGeneratorReport,
} from '@math-platform/practice-core/generator-qa';

// Intentional: non-existent module → Red.
import { IM1_GENERATORS, type IM1GeneratorEntry } from '../generators';

import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

// ---------------------------------------------------------------------------
// Constants & helpers
// ---------------------------------------------------------------------------

const HERE = fileURLToPath(import.meta.url);
const PKG_ROOT = resolve(HERE, '../../../../../../..');
const NODES_JSON = resolve(
  PKG_ROOT,
  'apps/integrated-math-1/curriculum/skill-graph/nodes.json',
);
const METADATA_JSON = resolve(
  PKG_ROOT,
  'measure/tracks/im1-practice-readiness_20260609/metadata.json',
);

const REQUIRED_SEEDS = 50;

function adapt(entry: IM1GeneratorEntry): GeneratorLike {
  return {
    generate: (input) => {
      const out = entry.generate({
        nodeId: input.nodeId,
        seed: input.seed,
        difficulty: input.difficulty,
        learnerContext: input.learnerContext as
          | Record<string, unknown>
          | undefined,
      }) as GeneratorOutput;
      return {
        problem: out.prompt,
        correctAnswer: out.expectedAnswer,
        distractors: [],
        solutionSteps: out.solutionSteps,
      };
    },
  };
}

function collectRegisteredEntries(): IM1GeneratorEntry[] {
  const entries: IM1GeneratorEntry[] = [];
  for (const gen of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
    entries.push(gen);
  }
  return entries;
}

function loadVerticalSliceSkillIds(): string[] {
  const meta = JSON.parse(readFileSync(METADATA_JSON, 'utf-8')) as {
    verticalSliceModule?: string;
  };
  const vsm = String(meta.verticalSliceModule);
  const nodes = JSON.parse(readFileSync(NODES_JSON, 'utf-8')) as {
    nodes: Array<{ id: string; kind: string; metadata?: { module?: string } }>;
  };
  return nodes.nodes
    .filter((n) => n.kind === 'skill' && n.metadata?.module === vsm)
    .map((n) => n.id);
}

// ---------------------------------------------------------------------------
// 1. Registration coverage (AC1 + AC2 + test-strategy §3 vertical-slice lock).
// ---------------------------------------------------------------------------

describe('IM1 CI gate — registration coverage (Phase 2 Task 3, AC1)', () => {
  it('IM1_GENERATORS registers at least one generator for every locked vertical-slice skill', () => {
    const expectedSkillIds = loadVerticalSliceSkillIds();
    expect(expectedSkillIds.length).toBeGreaterThan(0);

    const registeredNodeIds = new Set<string>();
    for (const entry of collectRegisteredEntries()) {
      for (const nodeId of entry.nodeIds) registeredNodeIds.add(nodeId);
    }

    for (const skillId of expectedSkillIds) {
      expect(
        registeredNodeIds.has(skillId),
        `IM1_GENERATORS missing entry for vertical-slice skill ${skillId}`,
      ).toBe(true);
    }
  });

  it('every registered IM1 generator nodeId is a math.im1.skill.* identifier (no cross-app leakage)', () => {
    for (const entry of collectRegisteredEntries()) {
      for (const nodeId of entry.nodeIds) {
        expect(nodeId).toMatch(/^math\.im1\.skill\./);
      }
    }
  });

  it('skillIdKey values are unique across IM1 registrations (no double-registration)', () => {
    const seen = new Set<string>();
    for (const entry of collectRegisteredEntries()) {
      expect(seen.has(entry.skillIdKey)).toBe(false);
      seen.add(entry.skillIdKey);
    }
    expect(seen.size).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 2. Per-entry harness verdict (the live-behavior gate).
// ---------------------------------------------------------------------------

describe('IM1 CI gate — per-entry verifyGenerator verdict (Phase 2 Task 3, AC1)', () => {
  it('every IM1 generator entry passes verifyGenerator at numSeeds = 50', () => {
    const entries = collectRegisteredEntries();
    expect(entries.length).toBeGreaterThan(0);

    const failures: Array<{ key: string; report: VerifyGeneratorReport }> = [];
    for (const entry of entries) {
      const report = verifyGenerator(adapt(entry), {
        numSeeds: REQUIRED_SEEDS,
      });
      if (report.verdict !== 'pass') failures.push({ key: entry.skillIdKey, report });
    }

    if (failures.length > 0) {
      const messages = failures.map((f) => {
        const errorMessages = f.report.errors.map((e) => `${e.checkName}: ${e.message}`);
        return `  ${f.key} → ${errorMessages.join('; ')}`;
      });
      throw new Error(
        `IM1 CI gate failed for ${failures.length} generator(s):\n${messages.join('\n')}`,
      );
    }
    expect(failures).toEqual([]);
  });

  it('aggregate gate verdict is "pass" with zero failed entries', () => {
    const entries = collectRegisteredEntries();
    let totalChecks = 0;
    let failedChecks = 0;
    for (const entry of entries) {
      const report = verifyGenerator(adapt(entry), {
        numSeeds: REQUIRED_SEEDS,
      });
      totalChecks += report.summary.totalChecks;
      failedChecks += report.summary.failedChecks;
    }
    expect(failedChecks).toBe(0);
    expect(totalChecks).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// 3. Anti-stub guard (test-strategy §6: "real generators (not
//    stubGenerator) must back every entry in the IM1 ci-gate
//    registration").
// ---------------------------------------------------------------------------

describe('IM1 CI gate — anti-stub guard (test-strategy §6 handoff)', () => {
  it('no IM1 generator entry uses the practice-core stub-generator pattern', () => {
    // The practice-core `createStubGenerator` returns a constant
    // structural object regardless of seed. A real generator must
    // produce seed-dependent output (different seeds → different
    // `problem` strings or `expectedAnswer` values). This test
    // proves no entry was wired via the stub fixture by mistake.
    for (const entry of collectRegisteredEntries()) {
      const a = entry.generate({
        nodeId: entry.nodeIds[0] ?? 'unknown',
        seed: 0,
        difficulty: 0.5,
      }) as GeneratorOutput;
      const b = entry.generate({
        nodeId: entry.nodeIds[0] ?? 'unknown',
        seed: 1,
        difficulty: 0.5,
      }) as GeneratorOutput;

      const aJson = JSON.stringify({
        prompt: a.prompt,
        expectedAnswer: a.expectedAnswer,
      });
      const bJson = JSON.stringify({
        prompt: b.prompt,
        expectedAnswer: b.expectedAnswer,
      });
      expect(
        aJson !== bJson,
        `IM1 generator "${entry.skillIdKey}" produced identical output for seeds 0 and 1 — looks like a stub`,
      ).toBe(true);
    }
  });
});
