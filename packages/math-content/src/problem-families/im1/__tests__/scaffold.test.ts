// Phase 2 — Task 1: Scaffold `packages/math-content/src/problem-families/im1/`
// + registry wiring (no app imports). Red phase (TDD).
//
// Contract under test (per measure/tracks/im1-practice-readiness_20260609/
// {plan,spec}.md and test-strategy.md §4, §6):
//
//   spec.md FR2:
//     "Implement deterministic generators for IM1 skills under
//      `packages/math-content/src/problem-families/im1/`, reusing
//      T17–T19 mechanisms; each generator passes the Generated-Math
//      Correctness QA harness (golden-answer)."
//
//   test-strategy.md §4 Architecture Guardrails:
//     "`packages/math-content/src/problem-families/im1/` must not import
//      from `apps/*` or `convex/_generated/*` (boundary lint)."
//
//   test-strategy.md §6 (build-graph findings → Phase 2 handoff):
//     "new IM1_PROBLEM_FAMILIES must be wired explicitly in math-content
//      `index.ts` AND IM1 seed; static checks won't catch a miss."
//     "callers IM3_PROBLEM_FAMILIES → none — consumers bind dynamically
//      through seed scripts" — so the only static gate that catches a
//      missing wiring IS this test.
//
//   test-strategy.md §6 handoff to Implementer:
//     "(a) export IM1_PROBLEM_FAMILIES from
//      packages/math-content/src/problem-families/index.ts AND extend
//      packages/math-content/src/__tests__/exports.test.ts with an IM1
//      uniqueness case, and (b) add `exclude: ['**/_pending/**']` to
//      packages/math-content/vitest.config.ts before landing any Red
//      per-skill files."
//
// Red signal: this file imports from
//   `../index`                  → `packages/math-content/src/problem-families/im1/index.ts`
//   `../../index`               → `packages/math-content/src/problem-families/index.ts`
//                                 (must re-export `IM1_PROBLEM_FAMILIES`)
//   `../generators`             → `packages/math-content/src/problem-families/im1/generators.ts`
//                                 (per-skill generator registry — Task 2/3 target)
// None of these exports exist yet (only IM3/IM2/PRECALC are wired today).
// The value imports force a module-resolution failure, failing every
// assertion in this file at import time. When Task 1 Green lands the
// scaffolded files and the parent re-export, the imports resolve and
// the body asserts the live registry shape.
//
// Live-behavior proof (per test-strategy §7, Kind B):
//   The assertions here read the actual registry values, not a hand-
//   authored constant. The boundary-lint assertion grep-scans every
//   .ts file under `problem-families/im1/` for forbidden imports
//   against the real source tree at test time — the production
//   constraint is enforced by the test, not by a comment.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { resolve, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERTICAL_SLICE_MODULE } from '../vertical-slice';

// Intentional: these modules do not exist at HEAD → Red.
import { IM1_PROBLEM_FAMILIES as IM1_FROM_SUBDIR } from '../index';
import { IM1_PROBLEM_FAMILIES as IM1_FROM_PARENT } from '../../index';
import { IM1_GENERATORS, type IM1GeneratorEntry } from '../generators';

import type { ProblemFamilyInput } from '@math-platform/practice-core';

// ---------------------------------------------------------------------------
// Path resolution (mirrors coverage-matrix.test.ts convention)
// ---------------------------------------------------------------------------

const HERE = fileURLToPath(import.meta.url);
// __tests__/scaffold.test.ts → im1 → problem-families → src → math-content → packages → root
const PKG_ROOT = resolve(HERE, '../../../../../../..');
const IM1_DIR = resolve(
  PKG_ROOT,
  'packages/math-content/src/problem-families/im1',
);

// ---------------------------------------------------------------------------
// 1. Registry export shape (the scaffolding deliverable for Task 1)
// ---------------------------------------------------------------------------

describe('IM1 scaffold — IM1_PROBLEM_FAMILIES export (Phase 2 Task 1)', () => {
  it('exports IM1_PROBLEM_FAMILIES from problem-families/im1/index.ts', () => {
    expect(IM1_FROM_SUBDIR).toBeDefined();
    expect(Array.isArray(IM1_FROM_SUBDIR)).toBe(true);
  });

  it('re-exports IM1_PROBLEM_FAMILIES from problem-families/index.ts (parent barrel)', () => {
    // test-strategy §6: "new IM1_PROBLEM_FAMILIES must be wired explicitly
    // in math-content `index.ts`". Static checks otherwise miss the wire-up
    // because consumers bind dynamically through seed scripts.
    expect(IM1_FROM_PARENT).toBeDefined();
    expect(Array.isArray(IM1_FROM_PARENT)).toBe(true);
  });

  it('subdir export and parent re-export are the same identity (single source of truth)', () => {
    expect(IM1_FROM_PARENT).toBe(IM1_FROM_SUBDIR);
  });

  it('every entry conforms to ProblemFamilyInput (problemFamilyId + componentKey + objectiveIds)', () => {
    for (const entry of IM1_FROM_SUBDIR as ProblemFamilyInput[]) {
      expect(entry).toMatchObject({
        variantKey: expect.any(String),
        componentKey: expect.any(String),
        displayName: expect.any(String),
        objectiveIds: expect.any(Array),
      });
      expect((entry.objectiveIds ?? []).length).toBeGreaterThan(0);
    }
  });

  it('problemFamilyId values are unique within IM1', () => {
    const ids = (IM1_FROM_SUBDIR as ProblemFamilyInput[]).map(
      (f) => f.variantKey,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('every entry carries a metadata.module within {1..14} (IM1 module space)', () => {
    const allowed = new Set(
      Array.from({ length: 14 }, (_v, i) => i + 1),
    );
    for (const entry of IM1_FROM_SUBDIR as ProblemFamilyInput[]) {
      const meta = (entry.metadata ?? {}) as { module?: number | string };
      const mod =
        typeof meta.module === 'string' ? Number(meta.module) : meta.module;
      expect(typeof mod).toBe('number');
      expect(allowed.has(mod as number)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Vertical-slice module coverage (Phase 1 locked moduleId='1' in
//    metadata.json; Phase 2 Task 1 must scaffold its skills, per
//    plan.md "Implement deterministic generators for the prioritized
//    IM1 skills" + test-strategy §3 vertical-slice module lock).
// ---------------------------------------------------------------------------

describe('IM1 scaffold — vertical-slice module coverage (Phase 2 Task 1)', () => {
  it('IM1_PROBLEM_FAMILIES contains at least one entry for the locked vertical-slice module', () => {
    const vsm = Number(VERTICAL_SLICE_MODULE);
    const entries = (IM1_FROM_SUBDIR as ProblemFamilyInput[]).filter(
      (e) => {
        const m = (e.metadata ?? {}) as { module?: number | string };
        const mn = typeof m.module === 'string' ? Number(m.module) : m.module;
        return mn === vsm;
      },
    );
    expect(entries.length).toBeGreaterThan(0);
  });

  it('vertical-slice module entries cover every module-1 skill from the rollout gap queue', () => {
    // Reads the live rollout artifact to enforce that Phase 2 Task 1 wires
    // every Module 1 skill (not a partial subset that hides the long tail).
    const vsm = String(VERTICAL_SLICE_MODULE);
    const queuePath = resolve(
      PKG_ROOT,
      'apps/integrated-math-1/curriculum/skill-graph/generator-gap-queue.json',
    );
    const queue = JSON.parse(readFileSync(queuePath, 'utf-8')) as {
      queue: Array<{ nodeId: string; module: string }>;
    };
    const expectedSkillIds = queue.queue
      .filter((q) => q.module === vsm)
      .map((q) => q.nodeId);

    const generatorNodeIds = new Set<string>();
    for (const gen of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
      for (const nodeId of gen.nodeIds) {
        generatorNodeIds.add(nodeId);
      }
    }
    for (const skillId of expectedSkillIds) {
      expect(generatorNodeIds.has(skillId)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// 3. Per-skill generator registry shape (Task 2/3 wiring target).
//    Task 1 deliverable: the registry exists with the correct shape so
//    Task 2 per-skill generators can register here and Task 3 ci-gate
//    can iterate over it.
// ---------------------------------------------------------------------------

describe('IM1 scaffold — IM1_GENERATORS registry (Phase 2 Task 1)', () => {
  it('exports IM1_GENERATORS as an iterable collection', () => {
    expect(IM1_GENERATORS).toBeDefined();
    expect(typeof (IM1_GENERATORS as { [Symbol.iterator]?: unknown })[
      Symbol.iterator
    ]).toBe('function');
  });

  it('each generator entry exposes { skillIdKey, nodeIds, generate }', () => {
    for (const gen of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
      expect(gen).toMatchObject({
        skillIdKey: expect.any(String),
        nodeIds: expect.any(Array),
        generate: expect.any(Function),
      });
      expect(gen.nodeIds.length).toBeGreaterThan(0);
    }
  });

  it('skillIdKey values are unique across the IM1 registry', () => {
    const keys: string[] = [];
    for (const gen of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
      keys.push(gen.skillIdKey);
    }
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('every nodeId across all entries is a math.im1.skill.* identifier', () => {
    for (const gen of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
      for (const nodeId of gen.nodeIds) {
        expect(nodeId).toMatch(/^math\.im1\.skill\./);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 4. Boundary lint (test-strategy §4 Architecture Guardrails).
//    Live-behavior proof: grep every .ts file under
//    `packages/math-content/src/problem-families/im1/` for forbidden
//    imports. This is the production constraint, encoded as a test.
// ---------------------------------------------------------------------------

describe('IM1 scaffold — boundary lint (test-strategy §4)', () => {
  function collectTsFilesExcludingTests(dir: string): string[] {
    const out: string[] = [];
    function walk(current: string): void {
      const entries = readdirSync(current);
      for (const name of entries) {
        const full = join(current, name);
        const st = statSync(full);
        if (st.isDirectory()) {
          // Tests legitimately read app-tree JSON artifacts via fs;
          // production source under im1/ must not. We exclude __tests__
          // (and the conventional _pending/ subdir) from the lint scope.
          if (name === '__tests__' || name === '_pending') continue;
          walk(full);
        } else if (name.endsWith('.ts') && !name.endsWith('.d.ts')) {
          out.push(full);
        }
      }
    }
    walk(dir);
    return out;
  }

  it('no production .ts file under im1/ imports from apps/* or convex/_generated/*', () => {
    const productionFiles = collectTsFilesExcludingTests(IM1_DIR);
    // The directory must contain at least the Task 1 deliverable files
    // (index.ts + generators.ts at minimum). Phase 1 already lands
    // coverage-matrix.ts; we don't require more here.
    expect(productionFiles.length).toBeGreaterThan(0);

    const forbiddenPatterns = [
      /from\s+['"]\.{1,2}\/.*\/apps\//,           // relative climb into apps/
      /from\s+['"]@\/apps\//,                      // path-alias into apps/
      /from\s+['"]apps\//,                         // bare apps/ specifier
      /from\s+['"].*convex\/_generated/,           // generated convex types
    ];
    for (const file of productionFiles) {
      const src = readFileSync(file, 'utf-8');
      for (const pat of forbiddenPatterns) {
        expect(
          pat.test(src),
          `${file} contains a forbidden import matching ${pat}`,
        ).toBe(false);
      }
    }
  });

  it('production sources only depend on math-platform packages or relative siblings', () => {
    const productionFiles = collectTsFilesExcludingTests(IM1_DIR);
    // Allowed import specifier patterns:
    //   - relative (./ or ../)
    //   - @math-platform/* workspace packages
    //   - node: builtins
    //   - well-known third-party libs already in package.json (zod)
    const allowedPatterns: RegExp[] = [
      /^\.\.?\//,
      /^@math-platform\//,
      /^node:/,
      /^zod($|\/)/,
    ];

    const importLine = /from\s+['"]([^'"]+)['"]/g;
    for (const file of productionFiles) {
      const src = readFileSync(file, 'utf-8');
      let match: RegExpExecArray | null;
      while ((match = importLine.exec(src)) !== null) {
        const spec = match[1] ?? '';
        const ok = allowedPatterns.some((p) => p.test(spec));
        expect(
          ok,
          `${file} imports disallowed specifier "${spec}"`,
        ).toBe(true);
      }
    }
  });
});
