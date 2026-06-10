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

import {
  buildCoverageMatrix,
  type CoverageMatrix,
  type CoverageMatrixSkillEntry,
  type CoverageMatrixCounts,
  type CoverageMatrixByModule,
  type CoverageStatus,
} from '../coverage-matrix'; // Intentional: non-existent module → Red.

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

  it('counts object sums to totalSkills (served + gap + new == 138)', () => {
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
// Task 1 — Enumerate the 138 IM1 skills.
// The matrix.skills array must be the exhaustive enumeration derived from
// `apps/integrated-math-1/curriculum/skill-graph/nodes.json` (kind === 'skill').
// ---------------------------------------------------------------------------

describe('Coverage matrix — skill enumeration (Phase 1, Task 1)', () => {
  it('enumerates exactly 138 IM1 skills from the rollout nodes artifact', () => {
    const matrix = buildCoverageMatrix();
    expect(matrix.totalSkills).toBe(138);
    expect(matrix.skills).toHaveLength(138);
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
// Integration: counts ↔ rollout-audit (test-strategy §1 row Phase 1).
// The audit claims 138 skills with 0/138 generator readiness.
// The matrix's totalSkills must equal 138 and initial counts must reflect
// 0 served / 138 gap / 0 newComponent.
// ---------------------------------------------------------------------------

describe('Coverage matrix — integration with rollout-audit (Phase 1, Task 1↔audit)', () => {
  it('audit.md declares totalSkills === 138 (live read of the source document)', () => {
    const audit = readFileSync(AUDIT_MD, 'utf-8');
    // The audit's "Total" row in the Module-by-Module Coverage table
    // is the canonical claim. We assert both the "| 138" token and
    // the "0/138" readiness ratio to be robust to wording drift.
    expect(audit).toMatch(/Total\s*\|\s*\d+\s*\|\s*138\s*\|\s*401/);
    expect(audit).toContain('0/138');
  });

  it('matrix totalSkills agrees with the rollout nodes.json (kind === "skill")', () => {
    const matrix = buildCoverageMatrix();
    const nodes = JSON.parse(readFileSync(NODES_JSON, 'utf-8')) as {
      nodes: Array<{ id: string; kind: string }>;
    };
    const skillCount = nodes.nodes.filter((n) => n.kind === 'skill').length;
    expect(skillCount).toBe(138);
    expect(matrix.totalSkills).toBe(skillCount);
  });

  it('matrix skills join exhaustively with generator-gap-queue (no orphan skills)', () => {
    const matrix = buildCoverageMatrix();
    const gap = JSON.parse(readFileSync(GENERATOR_GAP_QUEUE_JSON, 'utf-8')) as {
      queue: Array<{ nodeId: string }>;
    };
    const matrixIds = new Set(
      (matrix.skills as CoverageMatrixSkillEntry[]).map((s) => s.skillId),
    );
    for (const entry of gap.queue) {
      expect(matrixIds.has(entry.nodeId)).toBe(true);
    }
    expect(matrix.skills.length).toBe(gap.queue.length);
  });

  it('matrix skills join exhaustively with blueprints.json (138/138)', () => {
    const matrix = buildCoverageMatrix();
    const bp = JSON.parse(readFileSync(BLUEPRINTS_JSON, 'utf-8')) as {
      blueprints: Array<{ nodeId: string }>;
    };
    const matrixIds = new Set(
      (matrix.skills as CoverageMatrixSkillEntry[]).map((s) => s.skillId),
    );
    let matched = 0;
    for (const b of bp.blueprints) {
      if (matrixIds.has(b.nodeId)) matched += 1;
    }
    expect(matched).toBe(138);
  });

  it('initial matrix reflects 0% generator coverage (0 served, 138 gap, 0 newComponent)', () => {
    // Audit (2026-05-10) says all 138 IM1 skills have a "Generator not yet
    // implemented" exception. The initial matrix must mirror that.
    const matrix = buildCoverageMatrix();
    expect(matrix.counts.served).toBe(0);
    expect(matrix.counts.gap).toBe(138);
    expect(matrix.counts.newComponent).toBe(0);
  });

  it('every initial skill is classified as a gap with tier="none"', () => {
    const matrix = buildCoverageMatrix();
    for (const s of matrix.skills as CoverageMatrixSkillEntry[]) {
      expect(s.status as CoverageStatus).toBe('gap');
      expect(s.tier).toBe('none');
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3 — vertical-slice module choice must be locked into metadata.json
// before Phase 4 fixtures are authored (test-strategy §3).
// ---------------------------------------------------------------------------

describe('Coverage matrix — vertical-slice module lock (Phase 1, Task 3)', () => {
  it('metadata.json declares verticalSliceModule as a single module id', () => {
    const metaPath = resolve(
      PKG_ROOT,
      'measure/tracks/im1-practice-readiness_20260609/metadata.json',
    );
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as Record<
      string,
      unknown
    >;
    const vsm = meta.verticalSliceModule;
    expect(typeof vsm).toBe('string');
    expect(vsm).toMatch(/^[1-9]|1[0-4]$/);
  });

  it('vertical-slice module is one of the 14 IM1 modules in the matrix', () => {
    const metaPath = resolve(
      PKG_ROOT,
      'measure/tracks/im1-practice-readiness_20260609/metadata.json',
    );
    const meta = JSON.parse(readFileSync(metaPath, 'utf-8')) as Record<
      string,
      unknown
    >;
    const vsm = meta.verticalSliceModule as string;
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
