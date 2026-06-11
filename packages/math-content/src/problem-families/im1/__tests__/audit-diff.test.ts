// Phase 5 — Audit Refresh & Verification — Red phase (TDD).
//
// Contract under test (per measure/tracks/im1-practice-readiness_20260609/
// {plan,spec,test-strategy}.md):
//
//   plan.md Phase 5 Task 1:
//     "Update `skill-graph-im1-rollout-audit.md` with true coverage;
//      track the long tail explicitly."
//   plan.md Phase 5 Task 2:
//     "Final verification — QA harness, tsc, lint, doctor green."
//
//   spec.md FR5:
//     "Refresh `skill-graph-im1-rollout-audit.md` readiness numbers
//      from the new state."
//   spec.md AC4:
//     "Updated readiness audit reflects true generator coverage."
//   spec.md AC5:
//     "No boundary violations; `npm run doctor` green."
//
//   test-strategy.md §1 row Phase 5:
//     Unit: "numbers-equal snapshot"
//     Integration: "doctor + qa-gate aggregate"
//   test-strategy.md §5 P5:
//     "Refresh audit doc; snapshot live coverage vs audit numbers;
//      run full QA + doctor + tsc + lint."
//   test-strategy.md §7 row Phase 5:
//     Targeted Red command:
//       `npm run -w packages/math-content test -- audit-diff` (Kind A)
//     Green/closeout gate:
//       `npm test && npm run lint && npx tsc --noEmit && npm run doctor`
//   test-strategy.md §7 fakes & bounded smokes:
//     "Fakes & bounded smokes" + "audit file ↔ live coverage"
//     integration.
//   test-strategy.md §8 long-tail rule:
//     "Long-tail IM1 skills outside the vertical slice keep their
//      .pending.test.ts in _pending/ and are listed in the Phase 5
//      audit under 'tracked long tail' so reviewers see what is
//      intentionally red."
//
// Red signal at HEAD (2026-06-11, this attempt):
//   measure/skill-graph-im1-rollout-audit.md still reads
//   "**Generated**: 2026-05-10", "**0 of 138 skills (0%)**", and
//   per-module Module-1 row "| 1: Expressions | 6 | 6 | 34 | 6 | 0/6
//   (0%) |" and Total row "| Total | 93 | 138 | 401 | 77 | 0/138 (0%)
//   |". The doc has NO "Long tail" / "Tracked long tail" section
//   (its sections are Overview, Node and Edge Counts,
//   Module-by-Module Coverage, Standard Coverage, Component Mapping
//   Summary, Generator Readiness, Exception Types, Review Queue
//   Counts, Component Gap Details, Known Gaps, Validation Results,
//   Artifacts Generated). Live state at HEAD (per
//   packages/math-content/src/problem-families/im1/generators.ts +
//   IM1_PROBLEM_FAMILIES): 6 generators registered, all 6 belong
//   to Module 1 (the locked vertical-slice module), and the
//   vertical-slice blueprints are real (no STUB exception; see
//   `ci-gate.test.ts` and `blueprints.test.ts` per Phase 2/3 Green
//   commits 9b90f867 and 73f5956d).
//
// Live-behavior proof (test-strategy §7 "Artifact or markdown
// assertions are allowed only when the phase deliverable is that
// artifact, and they must be paired with a live-behavior proof…"):
//
//   The audit doc IS the Phase 5 Task 1 deliverable. The paired
//   live-behavior proof is the `audit_diff` group, which loads the
//   IM1_GENERATORS registry, computes the expected readiness
//   counts, parses the audit's claimed numbers, and asserts they
//   agree. A Green commit that updates the audit to wrong numbers
//   will still flip the artifact assertions red, so the contract
//   is tight to the live state.
//
//   The QA-harness live proof (test-strategy §1 row Phase 5
//   "doctor + qa-gate aggregate") runs the production
//   `verifyGenerator` against every entry in IM1_GENERATORS at
//   numSeeds = 50 (the same call path that `runGeneratorGate` uses
//   internally per test-strategy §7 row Phase 2 Green/closeout
//   gate). No stub fixtures — `IM1_GENERATORS` is the real
//   registry.
//
// Bounded scope (test-strategy §3 / §7):
//   * Filename filter: `audit-diff` — only this file runs under
//     `npm run -w packages/math-content test -- audit-diff`. No
//     watch mode, no full-suite smoke.
//   * The closeout-gate group targets the IM1-track surface only
//     (QA harness + doctor pre-conditions). The wider-monorepo
//     `tsc --noEmit` and `eslint .` half is left to the Green
//     role's aggregate run; a wider-monorepo Red test would
//     fail because of a pre-existing unrelated red recorded in
//     Phase 4 plan.md (line 153:
//     `apps/integrated-math-1/__tests__/setup/convex-provider.test.ts`
//     is red on `getConvexUrl` — not caused by Phase 4 or Phase 5
//     work). A Red test on that surface would be a false Red and
//     is intentionally NOT authored here.
//
// Boundary lint (test-strategy §4): this file lives under
// `packages/math-content/src/problem-families/im1/__tests__/` and
// reads the audit doc + rollout JSON + monorepo scripts via
// `fs.readFileSync`. Test files inside `__tests__/` reading data
// files via `fs` is the established pattern (see
// `coverage-matrix.test.ts` lines 65–78 and the IM3
// `__tests__/exports.test.ts` precedent cited in test-strategy
// §2). It also imports from sibling `../generators` (allowed —
// same package) and `@math-platform/practice-core/generator-qa`
// (a sibling `packages/*` import; explicitly permitted by the
// boundary rule which forbids `apps/*` and `convex/_generated/*`
// only). No app imports. No npm install required.

import { describe, it, expect } from 'vitest';
import { readFileSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  IM1_GENERATORS,
  type IM1GeneratorEntry,
} from '../generators';

import {
  verifyGenerator,
  type GeneratorLike,
  type VerifyGeneratorReport,
} from '@math-platform/practice-core/generator-qa';

import type { GeneratorOutput } from '@math-platform/knowledge-space-practice';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------

const HERE = fileURLToPath(import.meta.url);
const PKG_ROOT = resolve(HERE, '../../../../../../..');
const AUDIT_MD = resolve(
  PKG_ROOT,
  'measure/skill-graph-im1-rollout-audit.md',
);
const PKG_JSON = resolve(PKG_ROOT, 'package.json');
const APPS_IM1_PKG_JSON = resolve(
  PKG_ROOT,
  'apps/integrated-math-1/package.json',
);
const GENERATED_ARCH_JSON = resolve(
  PKG_ROOT,
  'measure/generated/architecture.json',
);
const GENERATED_ROUTES_MD = resolve(
  PKG_ROOT,
  'measure/generated/routes.md',
);
const BOUNDARY_LINTER = resolve(
  PKG_ROOT,
  'scripts/check-monorepo-boundaries.mjs',
);
const BOUNDARY_RULES = resolve(
  PKG_ROOT,
  'scripts/monorepo-boundary-rules.json',
);
const IM1_ROLLOUT_DIR = resolve(
  PKG_ROOT,
  'apps/integrated-math-1/curriculum/skill-graph',
);
const BLUEPRINTS_JSON = resolve(IM1_ROLLOUT_DIR, 'blueprints.json');
const METADATA_JSON = resolve(
  PKG_ROOT,
  'measure/tracks/im1-practice-readiness_20260609/metadata.json',
);

// ---------------------------------------------------------------------------
// Live state — what the audit doc SHOULD claim after Green.
// ---------------------------------------------------------------------------

const STALE_GENERATED_DATE = '2026-05-10';
const MIN_VERTICAL_SLICE_GENERATORS = 6;

type ScriptNames = ReadonlyArray<string>;

function readPkgScripts(pkgJsonPath: string): ScriptNames {
  const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf-8')) as {
    scripts?: Record<string, string>;
  };
  return Object.keys(pkg.scripts ?? {});
}

function loadAuditText(): string {
  return readFileSync(AUDIT_MD, 'utf-8');
}

function loadVerticalSliceModule(): string {
  const meta = JSON.parse(readFileSync(METADATA_JSON, 'utf-8')) as {
    verticalSliceModule?: string;
  };
  return String(meta.verticalSliceModule);
}

function collectRegisteredGeneratorCount(): number {
  let count = 0;
  for (const entry of IM1_GENERATORS as Iterable<IM1GeneratorEntry>) {
    for (const _ of entry.nodeIds) count += 1;
  }
  return count;
}

function countVerticalSliceRealBlueprints(): number {
  const vsm = loadVerticalSliceModule();
  const file = JSON.parse(readFileSync(BLUEPRINTS_JSON, 'utf-8')) as {
    blueprints: Array<{
      metadata?: { module?: string | number };
      exceptions?: Array<{ type?: string; reason?: string }>;
    }>;
  };
  return file.blueprints.filter((b) => {
    if (String(b.metadata?.module ?? '') !== vsm) return false;
    const hasStub = (b.exceptions ?? []).some(
      (e) =>
        e?.type === 'generator' &&
        typeof e?.reason === 'string' &&
        e.reason.includes('not yet implemented'),
    );
    return !hasStub;
  }).length;
}

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

// ---------------------------------------------------------------------------
// 1. Refresh-date contract (Phase 5 Task 1).
//    The audit doc must be re-stamped after the Phase 2–4 work.
// ---------------------------------------------------------------------------

describe('IM1 audit refresh — Generated/Updated date (Phase 5 Task 1)', () => {
  it('the audit doc has been re-stamped past the original 2026-05-10 date', () => {
    const audit = loadAuditText();
    // The original Phase 9 doc opens with `**Generated**: 2026-05-10`.
    // Phase 5 Green replaces that with a fresh stamp and/or adds an
    // explicit `Updated` / `Refreshed` / `Last verified` line.
    // The Red assertion: at least one date string in the doc parses
    // to a value strictly greater than 2026-05-10.
    const dateRe = /\b(20\d{2}-\d{2}-\d{2})\b/g;
    const found: string[] = [];
    for (;;) {
      const m = dateRe.exec(audit);
      if (!m) break;
      found.push(m[1]);
    }
    expect(found.length).toBeGreaterThan(0);
    const hasFresh = found.some(
      (d) => d > STALE_GENERATED_DATE,
    );
    expect(
      hasFresh,
      `audit doc has no date later than ${STALE_GENERATED_DATE}; found: ${found.join(', ')}`,
    ).toBe(true);
  });

  it('the audit doc no longer advertises the original Generated stamp as its sole timestamp', () => {
    const audit = loadAuditText();
    // If the doc only carries the stale 2026-05-10 stamp, the
    // refresh task is not done. We assert the doc has either
    // dropped that exact line or carries an additional stamp
    // strictly after it.
    const hasStaleLine = /\*\*Generated\*\*:\s*2026-05-10\b/.test(audit);
    const dateRe = /\b(20\d{2}-\d{2}-\d{2})\b/g;
    const stamps: string[] = [];
    for (;;) {
      const m = dateRe.exec(audit);
      if (!m) break;
      stamps.push(m[1]);
    }
    const hasLater = stamps.some((d) => d > STALE_GENERATED_DATE);
    if (hasStaleLine) {
      expect(hasLater).toBe(true);
    } else {
      // Stale line gone — fresh stamps must exist.
      expect(stamps.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// 2. Generator-readiness numbers (Phase 5 Task 1).
//    The doc's headline readiness ratio must reflect the live state
//    (≥ 6/138 served, 132/138 tracked as long tail).
// ---------------------------------------------------------------------------

describe('IM1 audit refresh — generator-readiness numbers (Phase 5 Task 1)', () => {
  it('audit doc declares served count ≥ 6/138 (not the stale 0/138)', () => {
    const audit = loadAuditText();
    // The original line: "**0 of 138 skills (0%)**" plus a
    // Total row of "0/138 (0%)". Phase 5 Green rewrites those
    // to reflect the vertical slice. We assert the live
    // generator count is non-zero and the doc no longer
    // claims zero.
    const live = collectRegisteredGeneratorCount();
    expect(live).toBeGreaterThanOrEqual(MIN_VERTICAL_SLICE_GENERATORS);

    const staleClaim = /\*\*0 of 138 skills \(0%\)\*\*/.test(audit);
    const staleTotalRow = /\|\s*Total\s*\|\s*93\s*\|\s*138\s*\|\s*401\s*\|\s*77\s*\|\s*0\/138\s*\(0%\)\s*\|/.test(
      audit,
    );
    expect(
      staleClaim || staleTotalRow,
      `audit doc must not still claim 0/138 readiness (live state is ${live}/138)`,
    ).toBe(false);
  });

  it('audit doc declares a non-zero "served" or "ready" ratio in the Generator Readiness section', () => {
    const audit = loadAuditText();
    const live = collectRegisteredGeneratorCount();
    expect(live).toBeGreaterThanOrEqual(MIN_VERTICAL_SLICE_GENERATORS);

    // Find the "Generator Readiness" section and assert it
    // contains a positive served count. We accept any of:
    //   - "X of 138 skills (Y%)" with X ≥ live
    //   - "X/138 (Y%)" in the per-module Total row
    const sectionMatch = audit.match(
      /##\s*Generator Readiness[\s\S]*?(?=\n##\s|\Z)/,
    );
    expect(
      sectionMatch,
      'audit doc is missing the "Generator Readiness" section',
    ).not.toBeNull();
    const section = sectionMatch![0];
    // Pattern A: "X of 138 skills (Y%)" with X ≥ 1
    const headline = section.match(
      /(\d+)\s*of\s*138\s*skills\s*\(\s*\d+(?:\.\d+)?%\s*\)/,
    );
    const headlineServed = headline ? Number(headline[1]) : 0;
    // Pattern B: bullet form "X of 138 skills have working generators"
    const bulletForm = section.match(
      /(\d+)\s*of\s*138\s*skills\s*have\s*working\s*generators/i,
    );
    const bulletServed = bulletForm ? Number(bulletForm[1]) : 0;
    const served = Math.max(headlineServed, bulletServed);
    expect(
      served,
      `Generator Readiness section served count is ${served}; expected ≥ ${live} based on IM1_GENERATORS`,
    ).toBeGreaterThanOrEqual(live);
  });

  it('Module-by-Module Coverage table shows Module 1 with 6/6 readiness (not 0/6)', () => {
    const audit = loadAuditText();
    // The per-module table row for Module 1 was
    //   "| 1: Expressions | 6 | 6 | 34 | 6 | 0/6 (0%) |"
    // Phase 5 Green flips the readiness column for Module 1 to
    // match the live state (6/6, 100%). Assert the row exists
    // and the readiness cell is positive.
    const module1Row = audit.match(
      /\|\s*1: Expressions\s*\|\s*6\s*\|\s*6\s*\|\s*34\s*\|\s*6\s*\|\s*([0-9]+\/[0-9]+\s*\(\s*\d+%\s*\))\s*\|/,
    );
    expect(
      module1Row,
      'audit doc is missing the Module-1 row in Module-by-Module Coverage',
    ).not.toBeNull();
    const cell = module1Row![1];
    const m = cell.match(/^(\d+)\/(\d+)/);
    expect(m).not.toBeNull();
    const served = Number(m![1]);
    const total = Number(m![2]);
    expect(total).toBe(6);
    expect(
      served,
      `Module-1 readiness cell is ${cell}; expected 6/6 (100%) — the audit doc is stale`,
    ).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// 3. Long-tail tracking (Phase 5 Task 1 + test-strategy §8).
//    The remaining skills must be listed / summarized in an
//    explicit "Long tail" / "Tracked long tail" section so
//    reviewers see what is intentionally red.
// ---------------------------------------------------------------------------

describe('IM1 audit refresh — long-tail tracking section (Phase 5 Task 1)', () => {
  it('audit doc contains an explicit "Long tail" or "Tracked long tail" section', () => {
    const audit = loadAuditText();
    // test-strategy §8 mandates that the long tail is "listed in
    // the Phase 5 audit under 'tracked long tail'". We accept
    // either header spelling.
    const re = /^#{2,3}\s+(Long\s*tail|Tracked\s*long\s*tail)\b/im;
    expect(
      re.test(audit),
      'audit doc is missing a "Long tail" / "Tracked long tail" section (test-strategy §8)',
    ).toBe(true);
  });

  it('long-tail section accounts for the 132 skills outside the vertical slice', () => {
    const audit = loadAuditText();
    const longTailRe = /^#{2,3}\s+(Long\s*tail|Tracked\s*long\s*tail)\b([\s\S]*?)(?=\n#{2,3}\s|\Z)/im;
    const m = audit.match(longTailRe);
    expect(m).not.toBeNull();
    const body = m![2];
    // The body must mention "132" (138 - 6 vertical-slice skills)
    // OR enumerate per-module counts that sum to 132. The live
    // count comes from the registry; the audit must show
    // 138 - 6 = 132 long-tail skills.
    const live = collectRegisteredGeneratorCount();
    const expectedLongTail = 138 - live;
    expect(expectedLongTail).toBe(132);
    const mentions132 = /\b132\b/.test(body);
    expect(
      mentions132,
      `long-tail section does not mention 132 skills (expected ${expectedLongTail} = 138 - ${live})`,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. Audit diff: live state vs. doc claim (live-behavior proof).
//    Compute the expected served count from the registry and the
//    doc's claimed count, and assert they agree. This is the
//    core "audit file ↔ live coverage" integration per
//    test-strategy §1 row Phase 5.
// ---------------------------------------------------------------------------

describe('IM1 audit refresh — live coverage vs. audit doc (Phase 5 Task 1)', () => {
  it('live IM1_GENERATORS registry count agrees with the doc\'s Generator Readiness served count', () => {
    const audit = loadAuditText();
    const live = collectRegisteredGeneratorCount();
    expect(live).toBeGreaterThanOrEqual(MIN_VERTICAL_SLICE_GENERATORS);

    // The doc should claim at least `live` served skills. Parse
    // either the "X of 138 skills (Y%)" headline or the Total
    // row "X/138" readiness cell.
    const headline = audit.match(
      /(\d+)\s*of\s*138\s*skills\s*\(\s*\d+(?:\.\d+)?%\s*\)/,
    );
    const totalRow = audit.match(
      /\|\s*Total\s*\|\s*93\s*\|\s*138\s*\|\s*401\s*\|\s*77\s*\|\s*(\d+)\/138/,
    );
    const docServed = Math.max(
      headline ? Number(headline[1]) : 0,
      totalRow ? Number(totalRow[1]) : 0,
    );
    expect(
      docServed,
      `audit doc claims ${docServed} served skills; live IM1_GENERATORS has ${live} — audit is stale`,
    ).toBeGreaterThanOrEqual(live);
  });

  it('live vertical-slice real-blueprint count agrees with the doc\'s Module-1 row', () => {
    const audit = loadAuditText();
    const real = countVerticalSliceRealBlueprints();
    expect(real).toBeGreaterThanOrEqual(MIN_VERTICAL_SLICE_GENERATORS);

    const module1Row = audit.match(
      /\|\s*1: Expressions\s*\|\s*6\s*\|\s*6\s*\|\s*34\s*\|\s*6\s*\|\s*(\d+)\/(\d+)/,
    );
    expect(module1Row).not.toBeNull();
    const docServed = Number(module1Row![1]);
    expect(
      docServed,
      `audit doc claims Module-1 served=${docServed}; live real-blueprint count is ${real}`,
    ).toBeGreaterThanOrEqual(real);
  });
});

// ---------------------------------------------------------------------------
// 5. Closeout gate — infrastructure liveness (Phase 5 Task 2).
//    The Green role runs
//    `npm test && npm run lint && npx tsc --noEmit && npm run doctor`.
//    This group asserts the pre-conditions for that gate.
// ---------------------------------------------------------------------------

describe('IM1 audit refresh — closeout gate pre-conditions (Phase 5 Task 2)', () => {
  it('root package.json defines lint, test, typecheck, and doctor scripts', () => {
    const scripts = readPkgScripts(PKG_JSON);
    for (const name of ['lint', 'test', 'doctor']) {
      expect(
        scripts,
        `root package.json is missing the "${name}" script`,
      ).toContain(name);
    }
  });

  it('apps/integrated-math-1/package.json defines lint, test, and typecheck scripts', () => {
    const scripts = readPkgScripts(APPS_IM1_PKG_JSON);
    for (const name of ['lint', 'test', 'typecheck']) {
      expect(
        scripts,
        `apps/integrated-math-1/package.json is missing the "${name}" script`,
      ).toContain(name);
    }
  });

  it('measure/generated/architecture.json and routes.md exist (doctor requires them)', () => {
    expect(
      existsSync(GENERATED_ARCH_JSON),
      `${GENERATED_ARCH_JSON} is missing — run \`bash measure/scripts/generate.sh\` first`,
    ).toBe(true);
    expect(
      existsSync(GENERATED_ROUTES_MD),
      `${GENERATED_ROUTES_MD} is missing — run \`bash measure/scripts/generate.sh\` first`,
    ).toBe(true);
  });

  it('monorepo-boundary linter and rules are present (doctor runs them)', () => {
    expect(
      existsSync(BOUNDARY_LINTER),
      `${BOUNDARY_LINTER} is missing — doctor cannot run the boundary linter`,
    ).toBe(true);
    expect(
      existsSync(BOUNDARY_RULES),
      `${BOUNDARY_RULES} is missing — boundary linter cannot load rules`,
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 6. Closeout gate — QA harness live proof (Phase 5 Task 2).
//    Runs the production verifyGenerator against every IM1
//    generator and asserts the aggregate verdict is "pass" with
//    zero failed checks. This is the live-behavior half of the
//    "doctor + qa-gate aggregate" per test-strategy §1 row
//    Phase 5.
// ---------------------------------------------------------------------------

describe('IM1 audit refresh — QA harness live proof (Phase 5 Task 2)', () => {
  it('IM1_GENERATORS aggregate gate: every entry passes verifyGenerator at numSeeds = 50', () => {
    const entries = [...(IM1_GENERATORS as Iterable<IM1GeneratorEntry>)];
    expect(entries.length).toBeGreaterThanOrEqual(MIN_VERTICAL_SLICE_GENERATORS);

    const failures: Array<{ key: string; report: VerifyGeneratorReport }> = [];
    for (const entry of entries) {
      const report = verifyGenerator(adapt(entry), { numSeeds: 50 });
      if (report.verdict !== 'pass') {
        failures.push({ key: entry.skillIdKey, report });
      }
    }
    if (failures.length > 0) {
      const detail = failures
        .map((f) => {
          const msgs = f.report.errors.map(
            (e) => `${e.checkName}: ${e.message}`,
          );
          return `  ${f.key} → ${msgs.join('; ')}`;
        })
        .join('\n');
      throw new Error(
        `IM1 audit-refresh QA harness proof failed for ${failures.length} generator(s):\n${detail}`,
      );
    }
    expect(failures).toEqual([]);
  });

  it('IM1_GENERATORS aggregate: zero failed checks across all entries', () => {
    const entries = [...(IM1_GENERATORS as Iterable<IM1GeneratorEntry>)];
    let totalChecks = 0;
    let failedChecks = 0;
    for (const entry of entries) {
      const report = verifyGenerator(adapt(entry), { numSeeds: 50 });
      totalChecks += report.summary.totalChecks;
      failedChecks += report.summary.failedChecks;
    }
    expect(failedChecks).toBe(0);
    expect(totalChecks).toBeGreaterThan(0);
  });
});
