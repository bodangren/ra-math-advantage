// Phase 2 — Task 2 (Module-1 vertical-slice): per-skill Red test.
//
// Skill ID: math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista
// Skill title: "1i: Write absolute value expressions that model real-
//   world distances and accuracy as positive differences"
// Renderer key: comprehension-quiz
// Priority: medium
// Source: apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json
//
// Contract under test, Red signal, live-behavior proof, and boundary
// rules: see sibling 1-1-verbal-to-numerical.pending.test.ts for the
// full contract block — all module-1 per-skill files share it
// verbatim (one task ↔ one file, test-strategy §8).

import { describe, it, expect } from 'vitest';

import {
  verifyGenerator,
  type GeneratorLike,
} from '@math-platform/practice-core/generator-qa';

// Intentional: non-existent module → Red.
import { IM1_GENERATORS, type IM1GeneratorEntry } from '../generators';

import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

const SKILL_ID =
  'math.im1.skill.1.5.write-absolute-value-expressions-that-model-real-world-dista' as const;
const RENDERER_KEY = 'comprehension-quiz' as const;

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
    expect(entry.skillIdKey).toMatch(/^1[._-]5[._-]/);
  });

  it('passes verifyGenerator with numSeeds = 50 (FR2 determinism + FR3/4/5)', () => {
    const entry = findEntryForSkill();
    const report = verifyGenerator(adapt(entry), { numSeeds: 50 });
    expect(report.verdict).toBe('pass');
    expect(report.errors).toEqual([]);
    expect(report.summary.failedChecks).toBe(0);
  });

  it('produces deterministic output for (nodeId, seed, difficulty) byte-identity', () => {
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
    const entry = findEntryForSkill();
    expect(RENDERER_KEY).toBe('comprehension-quiz');
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
