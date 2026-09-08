// Phase 1 — Coverage Matrix (Contract-First) — Red phase (TDD).
//
// Contract under test (per measure/tracks/.../test-strategy.md §5 Phase 1 and
// measure/tracks/im1-practice-readiness_20260609/{plan,spec}.md):
//
//   "im1-coverage-matrix.json is the one source consumed by Phase 1 snapshot,
//    Phase 5 audit-diff, and doctor." — test-strategy §2.
//
//   Phase 1 deliverable (P1 in test-strategy §5):
//     "Pure-data: parse rollout artifacts → emit matrix → snapshot;
//      assert served + gap + new == 138."
//
//   The matrix file is the single source of truth for downstream phases.
//   The test enforces the matrix shape, uniqueness, sum-to-138 invariant,
//   and the counts ↔ rollout-audit integration check.
//
// Red-phase design:
//   The coverage-matrix builder module (`../coverage-matrix`) does not
//   exist yet. The value import on `buildCoverageMatrix` and
//   `CoverageMatrix` forces a module-resolution failure, failing every
//   test in this file at import time. The matrix file
//   `im1-coverage-matrix.json` is also not written yet. When the Green
//   phase lands the builder module, the matrix JSON, and the snapshot,
//   the imports resolve and the assertions evaluate against the real
//   implementation.
//
// File location: this test lives in
//   `packages/math-content/src/problem-families/im1/__tests__/` per
//   test-strategy §2: "Real IM1 generators register through a single
//   `packages/math-content/src/problem-families/im1/__tests__/ci-gate.test.ts`."
//   Phase 1's coverage matrix shares that directory and runs in the
//   aggregate `npm run -w packages/math-content test`.
//
// Boundary: this test reads rollout artifacts (JSON data) from
// `apps/integrated-math-1/curriculum/skill-graph/`. The boundary rule
// (test-strategy §4) prohibits `packages/math-content/src/problem-families/im1/`
// from importing from `apps/*` or `convex/_generated/*`. Test files
// inside `__tests__/` reading data files via `fs` are accepted —
// see the existing precedent in
// `packages/math-content/src/__tests__/exports.test.ts` ("IM3 local
// re-export shims") which reads
// `apps/integrated-math-3/convex/seed/problem_families/*.ts`.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { VERTICAL_SLICE_MODULE } from '../vertical-slice';

import {
  buildCoverageMatrix,
  type CoverageMatrix,
  type CoverageMatrixSkillEntry,
  type CoverageMatrixCounts,
  type CoverageMatrixByModule,
  type CoverageStatus,
} from '../coverage-matrix'; // Intentional: non-existent module → Red.
import { IM1_GENERATORS } from '../generators';
import {
  guidedPracticeSpecSchema,
  independentPracticeSpecSchema,
  workedExampleSpecSchema,
} from '@math-platform/knowledge-space-practice';

// ---------------------------------------------------------------------------
// Resolve the IM1 rollout-artifact directory and the matrix-file path.
// The matrix file path is the *only* file this test writes through its
// assertions (it does not write — it asserts presence + shape). The
// data files are the rollout inputs that the Green-phase builder reads.
// ---------------------------------------------------------------------------

const HERE = fileURLToPath(import.meta.url);
const PKG_ROOT = resolve(HERE, '../../../../../../..');
const IM1_ROLLOUT_DIR = resolve(
  PKG_ROOT,
  'apps/integrated-math-1/curriculum/skill-graph',
);
const NODES_JSON = resolve(IM1_ROLLOUT_DIR, 'nodes.json');
const GENERATOR_GAP_QUEUE_JSON = resolve(
  IM1_ROLLOUT_DIR,
  'generator-gap-queue.json',
);
const BLUEPRINTS_JSON = resolve(IM1_ROLLOUT_DIR, 'blueprints.json');
const MATRIX_JSON = resolve(IM1_ROLLOUT_DIR, 'im1-coverage-matrix.json');
const AUDIT_MD = resolve(PKG_ROOT, 'measure/skill-graph-im1-rollout-audit.md');

// ---------------------------------------------------------------------------
// Live-behavior proof (test-strategy §7 "Artifact or markdown assertions
// are allowed only when the phase deliverable is that artifact, and they
// must be paired with a live-behavior proof…")
//
// The matrix file IS the Phase 1 deliverable. The live-behavior proof
// is the builder reading the rollout JSON, joining it to the audit's
// claimed 138-skill count, and emitting a typed matrix object. The
// snapshot/integration tests below assert against `buildCoverageMatrix`,
// not against a hand-written constant.
// ---------------------------------------------------------------------------

describe('Coverage matrix — shape contract (Phase 1, Task 2)', () => {
  it('buildCoverageMatrix returns a CoverageMatrix with the required top-level fields', () => {
    const matrix: CoverageMatrix = buildCoverageMatrix();
    expect(matrix).toMatchObject({
      version: expect.any(Number),
      course: 'im1',
      totalSkills: expect.any(Number),
      counts: expect.objectContaining({
        served: expect.any(Number),
        gap: expect.any(Number),
        newComponent: expect.any(Number),
      }),
      byModule: expect.any(Array),
      skills: expect.any(Array),
    });
  });

  it('matrix version is a positive integer (snapshot stability)', () => {
    const matrix = buildCoverageMatrix();
    expect(Number.isInteger(matrix.version)).toBe(true);
    expect(matrix.version).toBeGreaterThan(0);
  });

  it('counts object sums to the current totalSkills', () => {
    const matrix = buildCoverageMatrix();
    const c: CoverageMatrixCounts = matrix.counts;
    expect(c.served + c.gap + c.newComponent).toBe(matrix.totalSkills);
  });

  it('byModule entries each carry module id, totals, and counts', () => {
    const matrix = buildCoverageMatrix();
    for (const mod of matrix.byModule as CoverageMatrixByModule[]) {
      expect(mod).toMatchObject({
        module: expect.any(String),
        totalSkills: expect.any(Number),
        served: expect.any(Number),
        gap: expect.any(Number),
        newComponent: expect.any(Number),
      });
      expect(
        mod.served + mod.gap + mod.newComponent,
      ).toBe(mod.totalSkills);
    }
  });

  it('every per-module count contributes to the global counts (integration)', () => {
    const matrix = buildCoverageMatrix();
    const sums = (matrix.byModule as CoverageMatrixByModule[]).reduce(
      (acc, m) => ({
        served: acc.served + m.served,
        gap: acc.gap + m.gap,
        newComponent: acc.newComponent + m.newComponent,
        total: acc.total + m.totalSkills,
      }),
      { served: 0, gap: 0, newComponent: 0, total: 0 },
    );
    expect(sums.served).toBe(matrix.counts.served);
    expect(sums.gap).toBe(matrix.counts.gap);
    expect(sums.newComponent).toBe(matrix.counts.newComponent);
    expect(sums.total).toBe(matrix.totalSkills);
  });
});

// ---------------------------------------------------------------------------
// Task 1 — Enumerate the current IM1 skills.
// The matrix.skills array must be the exhaustive enumeration derived from
// `apps/integrated-math-1/curriculum/skill-graph/nodes.json` (kind === 'skill').
// ---------------------------------------------------------------------------

describe('Coverage matrix — skill enumeration (Phase 1, Task 1)', () => {
  it('enumerates the exact current IM1 skill set from the rollout nodes artifact', () => {
    const matrix = buildCoverageMatrix();
    const nodes = JSON.parse(readFileSync(NODES_JSON, 'utf-8')) as { nodes: Array<{ id: string; kind: string; reviewStatus?: string }> };
    const expected = nodes.nodes.filter((node) => node.kind === 'skill' && node.reviewStatus !== 'rejected').map((node) => node.id).sort();
    expect(matrix.totalSkills).toBe(expected.length);
    expect(matrix.skills.map((skill) => skill.skillId).sort()).toEqual(expected);
  });

  it('excludes rejected historical skill identities from current authoring coverage', () => {
    const matrix = buildCoverageMatrix();
    expect(matrix.skills.some((skill) => skill.skillId === 'math.im1.skill.7.5.solve-real-world-optimization-problems-by-defining-variables')).toBe(false);
  });

  it('every skill entry carries the required fields (skillId, module, status, tier)', () => {
    const matrix = buildCoverageMatrix();
    for (const s of matrix.skills as CoverageMatrixSkillEntry[]) {
      expect(s).toMatchObject({
        skillId: expect.stringMatching(/^math\.im1\.skill\./),
        module: expect.any(String),
        status: expect.stringMatching(/^(served|gap|newComponent)$/),
        tier: expect.stringMatching(/^(t17|t18|t19|none)$/),
        rendererKey: expect.any(String),
        priority: expect.stringMatching(/^(high|medium|standard)$/),
      });
    }
  });

  it('skillIds are unique across the matrix (no duplicates from a bad join)', () => {
    const matrix = buildCoverageMatrix();
    const ids = (matrix.skills as CoverageMatrixSkillEntry[]).map(
      (s) => s.skillId,
    );
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('module ids in matrix.skills are a stable subset of {1..14}', () => {
    const matrix = buildCoverageMatrix();
    const allowed = new Set(
      Array.from({ length: 14 }, (_v, i) => String(i + 1)),
    );
    for (const s of matrix.skills as CoverageMatrixSkillEntry[]) {
      expect(allowed.has(s.module)).toBe(true);
    }
  });
});

// ---------------------------------------------------------------------------
// Integration: current graph counts and the frozen audit baseline.
// ---------------------------------------------------------------------------

describe('Coverage matrix — integration with rollout-audit (Phase 1, Task 1↔audit)', () => {
  it('audit.md preserves the explicit frozen 138-skill baseline', () => {
    const audit = readFileSync(AUDIT_MD, 'utf-8');
    // The audit's "Total" row in the Module-by-Module Coverage table
    // is the canonical claim. We assert both the "| 138" token and
    // a readiness ratio over 138 skills (Phase 5 refreshes the
    // ratio from 0/138 to reflect implemented generators; FR5/AC4).
    expect(audit).toMatch(/Total\s*\|\s*\d+\s*\|\s*138\s*\|\s*401/);
    expect(audit).toMatch(/\d+\/138/);
  });

  it('matrix totalSkills agrees with the rollout nodes.json (kind === "skill")', () => {
    const matrix = buildCoverageMatrix();
    const nodes = JSON.parse(readFileSync(NODES_JSON, 'utf-8')) as {
      nodes: Array<{ id: string; kind: string; reviewStatus?: string }>;
    };
    const skillCount = nodes.nodes.filter((n) => n.kind === 'skill' && n.reviewStatus !== 'rejected').length;
    expect(matrix.totalSkills).toBe(skillCount);
  });

  it('gap skills join exhaustively with generator-gap-queue (no orphan or served skills)', () => {
    const matrix = buildCoverageMatrix();
    const gap = JSON.parse(readFileSync(GENERATOR_GAP_QUEUE_JSON, 'utf-8')) as {
      queue: Array<{ nodeId: string }>;
    };
    const gapSkillIds = new Set(
      (matrix.skills as CoverageMatrixSkillEntry[])
        .filter((s) => s.status === 'gap')
        .map((s) => s.skillId),
    );
    expect(gap.queue).toHaveLength(gapSkillIds.size);
    for (const entry of gap.queue) {
      expect(gapSkillIds.has(entry.nodeId)).toBe(true);
    }
  });

  it('reports exact missing blueprint IDs and mode-spec schema results', () => {
    const matrix = buildCoverageMatrix();
    const bp = JSON.parse(readFileSync(BLUEPRINTS_JSON, 'utf-8')) as {
      blueprints: Array<{
        nodeId: string;
        workedExampleSpec?: unknown;
        guidedPracticeSpec?: unknown;
        independentPracticeSpec?: unknown;
      }>;
    };
    const matrixIds = new Set(
      (matrix.skills as CoverageMatrixSkillEntry[]).map((s) => s.skillId),
    );
    const blueprintIds = new Set(bp.blueprints.map((row) => row.nodeId));
    const missingBlueprintIds = [...matrixIds]
      .filter((nodeId) => !blueprintIds.has(nodeId))
      .sort();
    const schemaValid = bp.blueprints.filter((row) =>
      workedExampleSpecSchema.safeParse(row.workedExampleSpec).success
      && guidedPracticeSpecSchema.safeParse(row.guidedPracticeSpec).success
      && independentPracticeSpecSchema.safeParse(row.independentPracticeSpec).success
    );
    const empty = bp.blueprints.filter((row) =>
      JSON.stringify(row.workedExampleSpec) === '{}'
      && JSON.stringify(row.guidedPracticeSpec) === '{}'
      && JSON.stringify(row.independentPracticeSpec) === '{}'
    );
    const sourceOnly = bp.blueprints.filter((row) =>
      row.workedExampleSpec === undefined
      && row.guidedPracticeSpec === undefined
      && row.independentPracticeSpec === undefined
    );

    expect(missingBlueprintIds).toEqual([
      'math.im1.skill.1.1.evaluate-numerical-expressions-accurately-using-the-order-of',
      'math.im1.skill.1.2.evaluate-algebraic-expressions-by-substituting-given-values',
      'math.im1.skill.1.3.use-the-commutative-associative-identity-and-inverse-propert',
      'math.im1.skill.1.6.determine-a-reasonable-level-of-accuracy-when-performing-mul',
    ]);
    expect(schemaValid.map((row) => row.nodeId).sort()).toEqual(
      IM1_GENERATORS.flatMap((entry) => entry.nodeIds).sort(),
    );
    expect(empty.length + sourceOnly.length + schemaValid.length).toBe(bp.blueprints.length);
    expect(sourceOnly.filter((row) => row.nodeId.startsWith('math.im1.skill.3.')).map((row) => row.nodeId).sort()).toEqual(
      bp.blueprints.filter((row) => row.nodeId.startsWith('math.im1.skill.3.')).map((row) => row.nodeId).sort(),
    );

    const audit = readFileSync(AUDIT_MD, 'utf-8');
    expect(audit).toMatch(/Blueprint rows with three schema-valid mode specifications: 6\./);
    expect(audit).toContain(`Blueprint rows with three empty mode specifications: ${empty.length}.`);
    expect(audit).toContain(`Source-only blueprint rows without mode specifications: ${sourceOnly.length}.`);
    expect(audit).toMatch(/Skills without a blueprint row: 4\./);
  });

  it('reports generator bindings separately from all current gaps', () => {
    const matrix = buildCoverageMatrix();
    expect(matrix.counts.served).toBe(6);
    expect(matrix.counts.gap).toBe(matrix.totalSkills - matrix.counts.served);
    expect(matrix.counts.newComponent).toBe(0);
  });

  it('served skills are exactly Module 1 vertical-slice skills with generator tier assigned', () => {
    const matrix = buildCoverageMatrix();
    const served = (matrix.skills as CoverageMatrixSkillEntry[]).filter(
      (s) => s.status === 'served',
    );
    expect(served).toHaveLength(6);
    for (const s of served) {
      expect(s.module).toBe('1');
      expect(s.tier).not.toBe('none');
    }
    const registered = IM1_GENERATORS.flatMap((entry) => entry.nodeIds).sort();
    expect(served.map((entry) => entry.skillId).sort()).toEqual(registered);
  });

  it('stored matrix equals the current derived report', () => {
    const stored = JSON.parse(readFileSync(MATRIX_JSON, 'utf-8'));
    expect(stored).toEqual(buildCoverageMatrix());
  });

  it('gap skills remain explicitly tracked with tier="none"', () => {
    const matrix = buildCoverageMatrix();
    const gaps = (matrix.skills as CoverageMatrixSkillEntry[]).filter(
      (s) => s.status === 'gap',
    );
    expect(gaps).toHaveLength(matrix.totalSkills - matrix.counts.served);
    for (const s of gaps) {
      expect(s.tier).toBe('none');
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3 — vertical-slice module choice must be locked into metadata.json
// before Phase 4 fixtures are authored (test-strategy §3).
// ---------------------------------------------------------------------------

describe('Coverage matrix — vertical-slice module lock (Phase 1, Task 3)', () => {
  it('VERTICAL_SLICE_MODULE is a single module id', () => {
    const vsm = VERTICAL_SLICE_MODULE;
    expect(typeof vsm).toBe('string');
    expect(vsm).toMatch(/^[1-9]|1[0-4]$/);
  });

  it('vertical-slice module is one of the 14 IM1 modules in the matrix', () => {
    const vsm = VERTICAL_SLICE_MODULE;
    const matrix = buildCoverageMatrix();
    const moduleIds = new Set(
      (matrix.byModule as CoverageMatrixByModule[]).map((m) => m.module),
    );
    expect(moduleIds.has(vsm)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Boundary guardrail: the matrix file is written under the IM1 rollout dir
// (apps/integrated-math-1/curriculum/skill-graph/) — NOT under
// packages/math-content — because Phase 5 audit-diff and `doctor` consume
// it from there (test-strategy §2, "one source consumed by Phase 1
// snapshot, Phase 5 audit-diff, and doctor").
// ---------------------------------------------------------------------------

describe('Coverage matrix — file location contract (boundary)', () => {
  it('matrix file lives under the IM1 rollout directory, not under math-content', () => {
    expect(MATRIX_JSON).toContain(
      'apps/integrated-math-1/curriculum/skill-graph/',
    );
    expect(MATRIX_JSON.endsWith('im1-coverage-matrix.json')).toBe(true);
  });
});
