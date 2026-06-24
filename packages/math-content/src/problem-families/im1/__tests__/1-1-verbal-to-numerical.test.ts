// Phase 2 — Task 2 (Module-1 vertical-slice): per-skill Red test.
//
// Skill ID: math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express
// Skill title: "1a: Translate verbal descriptions into correct numerical
//   expressions using operation symbols and grouping"
// Renderer key: step-by-step-solver
// Priority: medium
// Source: apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json
//
// Contract under test (per measure/tracks/im1-practice-readiness_20260609/
// {plan,spec,test-strategy}.md):
//
//   plan.md Phase 2 Task 2:
//     "Implement deterministic generators for the prioritized IM1 skills,
//      reusing T17–T19 mechanisms (TDD)."
//
//   spec.md FR2:
//     "Implement deterministic generators for IM1 skills under
//      `packages/math-content/src/problem-families/im1/`, reusing
//      T17–T19 mechanisms; each generator passes the Generated-Math
//      Correctness QA harness (golden-answer)."
//
//   test-strategy.md §1 row Phase 2:
//     "per-generator pure | determinism + invariants + distractor-
//      validity (≥50 seeds) | GeneratorCorrectnessContract via
//      runGeneratorGate"
//
//   test-strategy.md §8 Intentionally-Red ownership rule:
//     "Per-skill Red tests live in
//      `__tests__/_pending/<skill-id>.pending.test.ts`."
//     "Promoting a Phase 2 sub-task from `[ ]`/`[~]` to `[x]` MOVES its
//      file out of `_pending/` in the same commit — one task ↔ one file."
//     "`describe.skip` / `it.skip` are forbidden — they register as green
//      and hide ownership."
//
// Red signal: this file imports `IM1_GENERATORS` from
// `../../generators`. That module does not exist at HEAD. The value
// import forces a module-resolution failure, failing every assertion
// here at import time. When the Green phase lands the registry plus
// the per-skill generator (and the Implementer moves this file out
// of `_pending/` in the same commit per §8), the registry lookup
// resolves and the harness call evaluates the real generator.
//
// Live-behavior proof (test-strategy §7, Kind B):
// `verifyGenerator(adapter(gen), { numSeeds: 50 })` executes the real
// production generator 50× through the domain-neutral correctness
// harness — same call path as `runGeneratorGate`. Not a fixture; not
// a stub. Per test-strategy §6 handoff: "real generators (not
// stubGenerator) must back every entry in the IM1 ci-gate
// registration."
//
// Boundary: tests under `__tests__/_pending/` are EXCLUDED from
// `npm run -w packages/math-content test` once Task 1 Green adds
// `exclude: ['**/_pending/**']` to vitest.config.ts (test-strategy
// §6 handoff). Until then, the file runs in the aggregate and stays
// red until its Green sibling lands.

import { describe, it, expect } from 'vitest';

import {
  verifyGenerator,
  type GeneratorLike,
} from '@math-platform/practice-core/generator-qa';

// Intentional: non-existent module → Red.
import { IM1_GENERATORS, type IM1GeneratorEntry } from '../generators';

import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

const SKILL_ID =
  'math.im1.skill.1.1.translate-verbal-descriptions-into-correct-numerical-express' as const;
const RENDERER_KEY = 'step-by-step-solver' as const;

// Adapter aligned with packages/math-content/src/knowledge-space/generators/
// registry-sweep.ts:adaptToGeneratorLike — same direction (math-content
// generator → domain-neutral GeneratorLike) so the harness's checks
// (determinism, unique-answer, distractor-validity, invariants) run on
// real generator output.
/**
 * Adapt an IM1 generator entry to the GeneratorLike interface for the QA harness.
 * @param {IM1GeneratorEntry} entry - IM1 generator entry to adapt
 * @returns {GeneratorLike} - GeneratorLike-compatible object
 */
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

/**
 * Find the IM1 generator entry registered for the target skill ID.
 * @returns {IM1GeneratorEntry} - Matching IM1 generator entry
 * @throws Error if no generator is registered for the skill
 */
function findEntryForSkill(): IM1GeneratorEntry {
  for (const gen of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
    if (gen.nodeIds.includes(SKILL_ID)) return gen;
  }
  throw new Error(`No IM1 generator registered for ${SKILL_ID}`);
}

describe(`IM1 generator — ${SKILL_ID} (Phase 2 Task 2)`, () => {
  it('is registered in IM1_GENERATORS with the correct nodeId', () => {
    const entry = findEntryForSkill();
    expect(entry.nodeIds).toContain(SKILL_ID);
  });

  it('skillIdKey matches the file-level ownership convention', () => {
    const entry = findEntryForSkill();
    expect(entry.skillIdKey).toMatch(/^1[._-]1[._-]/);
  });

  it('passes verifyGenerator with numSeeds = 50 (FR2 determinism + FR3/4/5)', () => {
    const entry = findEntryForSkill();
    const report = verifyGenerator(adapt(entry), { numSeeds: 50 });
    expect(report.verdict).toBe('pass');
    expect(report.errors).toEqual([]);
    expect(report.summary.failedChecks).toBe(0);
  });

  it('produces deterministic output for (nodeId, seed, difficulty) byte-identity', () => {
    // Direct re-execution of the production generator without the
    // adapter — guards against the adapter accidentally hiding non-
    // determinism in the wrapped output fields.
    const entry = findEntryForSkill();
    for (let seed = 0; seed < 25; seed += 1) {
      const a = JSON.stringify(
        entry.generate({ nodeId: SKILL_ID, seed, difficulty: 0.5 }),
      );
      const b = JSON.stringify(
        entry.generate({ nodeId: SKILL_ID, seed, difficulty: 0.5 }),
      );
      expect(a).toBe(b);
    }
  });

  it('every seed yields the documented renderer key componentry shape', () => {
    // The gap queue assigns this skill to `${RENDERER_KEY}`. Per the
    // practice contract, the generator's output must shape correctly
    // for that renderer (prompt + expectedAnswer + solutionSteps).
    const entry = findEntryForSkill();
    expect(RENDERER_KEY).toBe('step-by-step-solver');
    for (let seed = 0; seed < 10; seed += 1) {
      const out = entry.generate({
        nodeId: SKILL_ID,
        seed,
        difficulty: 0.5,
      }) as GeneratorOutput;
      expect(typeof out.prompt).toBe('string');
      expect(out.prompt.length).toBeGreaterThan(0);
      expect(out.expectedAnswer).toBeDefined();
      expect(Array.isArray(out.solutionSteps)).toBe(true);
      expect((out.solutionSteps ?? []).length).toBeGreaterThan(0);
    }
  });
});
