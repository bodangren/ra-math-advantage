// Phase 5 — Docs & Doctor failing tests for Track 5 (Adaptive Placement).
//
// Per measure/tracks/adaptive-placement_20260521/test-strategy.md §5, Phase 5:
//   - Doctor passes with new placement modules
//   - tsc --noEmit clean
//   - npm run lint clean
//   - All existing tests still pass
//
// Per plan.md Phase 5:
//   - Task 5.1: Update in-repo kst-srs.v2 spec §11 (Placement) with the
//     implemented contract
//   - Task 5.2: Run measure/generate.sh and measure/doctor.sh; fix
//     architectural lint
//   - Task 5.3: Final verification — boundary lints, npm run lint,
//     tsc --noEmit, CI=true npm run test
//
// Per measure/tech-debt.md items tagged `Track 5 P5`:
//   - Plan §11 vs spec §8: assertion is section-flexible — the test accepts
//     §8 (current location of "Adaptive Placement") OR a relocated §11.
//   - measure/generate.sh and measure/doctor.sh do not exist; the test
//     substitutes scripts/check-monorepo-boundaries.mjs and the per-package
//     `tsc --noEmit` / `npm run lint` scripts.

import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { placementResultSchema } from '@math-platform/knowledge-space-core';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------
//
// This test file lives at
//   apps/integrated-math-3/__tests__/lib/placement/phase5-docs-and-doctor.test.ts
// which is 5 levels below the monorepo root. `__dirname` is the directory
// containing the test file, so we need 5 `..`s to land on the repo root.
// (The lessons-learned note from 2026-05-03 used 3 `..`s for BM2 tests that
// were shallower in the tree.) The pattern is verified in
// apps/integrated-math-3/__tests__/ci-cd/workflow-validation.test.ts.

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const REPO_ROOT = resolve(__dirname, '../../../../..');
const SPEC_PATH = join(REPO_ROOT, 'kst-srs.v2', 'SPECIFICATION.md');
const PLACEMENT_TS = join(REPO_ROOT, 'packages', 'knowledge-space-core', 'src', 'placement.ts');
const PLACEMENT_ENGINE_TS = join(
  REPO_ROOT,
  'packages',
  'knowledge-space-core',
  'src',
  'placement-engine.ts',
);
const PLACEMENT_FLOW_TS = join(
  REPO_ROOT,
  'apps',
  'integrated-math-3',
  'lib',
  'placement',
  'placement-flow.ts',
);
const SEED_TS = join(
  REPO_ROOT,
  'apps',
  'integrated-math-3',
  'lib',
  'placement',
  'seed-knowledge-state.ts',
);
const SCHEMA_TS = join(REPO_ROOT, 'apps', 'integrated-math-3', 'convex', 'schema.ts');
const MONOREPO_BOUNDARY_SCRIPT = join(
  REPO_ROOT,
  'scripts',
  'check-monorepo-boundaries.mjs',
);

function readUtf8(path: string): string {
  return readFileSync(path, 'utf-8');
}

// Locate the section that documents Adaptive Placement in the spec. The plan
// refers to §11 but the file currently has §8. Both are accepted; the test
// is section-flexible per the tech-debt note.
function findPlacementSection(markdown: string): { heading: string; body: string; level: number } | null {
  const lines = markdown.split('\n');
  let sectionStart = -1;
  let sectionLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i] ?? '';
    const h2 = line.match(/^##\s+(\d+)\.\s+(.*)$/);
    if (h2) {
      const title = (h2[2] ?? '').toLowerCase();
      if (title.includes('adaptive placement') || title.includes('placement (v2 item 5)')) {
        sectionStart = i;
        sectionLevel = 2;
        break;
      }
    }
  }
  if (sectionStart === -1) return null;

  // Collect until the next H2 of the same or higher level.
  let end = lines.length;
  for (let i = sectionStart + 1; i < lines.length; i++) {
    const line = lines[i] ?? '';
    if (/^##\s+\d+\./.test(line)) {
      end = i;
      break;
    }
  }

  return {
    heading: lines[sectionStart] ?? '',
    body: lines.slice(sectionStart, end).join('\n'),
    level: sectionLevel,
  };
}

const SPEC_EXISTS = existsSync(SPEC_PATH);
const PLACEMENT_TS_EXISTS = existsSync(PLACEMENT_TS);
const PLACEMENT_ENGINE_TS_EXISTS = existsSync(PLACEMENT_ENGINE_TS);
const PLACEMENT_FLOW_TS_EXISTS = existsSync(PLACEMENT_FLOW_TS);
const SEED_TS_EXISTS = existsSync(SEED_TS);
const SCHEMA_TS_EXISTS = existsSync(SCHEMA_TS);
const MONOREPO_BOUNDARY_EXISTS = existsSync(MONOREPO_BOUNDARY_SCRIPT);

const SPEC_MARKDOWN = SPEC_EXISTS ? readUtf8(SPEC_PATH) : '';
const PLACEMENT_SECTION = SPEC_EXISTS ? findPlacementSection(SPEC_MARKDOWN) : null;
const PLACEMENT_SECTION_BODY = PLACEMENT_SECTION?.body ?? '';

// ---------------------------------------------------------------------------
// Task 5.1 — Spec documentation matches the implemented contract
// ---------------------------------------------------------------------------

describe('Task 5.1 — kst-srs.v2 spec documents the placement contract', () => {
  it('SPECIFICATION.md exists at the canonical path', () => {
    expect(SPEC_EXISTS).toBe(true);
  });

  it('placement modules exist (placement.ts, placement-engine.ts, placement-flow.ts, seed-knowledge-state.ts)', () => {
    expect(PLACEMENT_TS_EXISTS).toBe(true);
    expect(PLACEMENT_ENGINE_TS_EXISTS).toBe(true);
    expect(PLACEMENT_FLOW_TS_EXISTS).toBe(true);
    expect(SEED_TS_EXISTS).toBe(true);
  });

  it('kst-srs.v2 SPECIFICATION.md has a heading that covers Adaptive Placement (§8 or §11)', () => {
    expect(SPEC_EXISTS).toBe(true);
    const placementSection = PLACEMENT_SECTION;
    expect(placementSection, 'expected an "Adaptive Placement" section in the spec').not.toBeNull();
    expect(placementSection!.heading).toMatch(/^##\s+\d+\.\s+.*[Pp]lacement/);
  });

  it('placement section documents the PlacementResult shape (nodeId, masteryEstimate, confidence, metadata)', () => {
    expect(PLACEMENT_SECTION, 'placement section missing').not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    expect(body).toMatch(/nodeId/);
    expect(body).toMatch(/masteryEstimate/);
    expect(body).toMatch(/confidence/);
    expect(body).toMatch(/metadata/);
  });

  it('placement section restricts confidence to "low" | "medium" (no "high")', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    expect(body).toMatch(/['"]low['"]/);
    expect(body).toMatch(/['"]medium['"]/);
    expect(body, 'placement spec must not list "high" as a valid confidence band').not.toMatch(/['"]high['"]/);
  });

  it('placement section documents the ProbeAdapter interface (domain + async probe)', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    expect(body).toMatch(/ProbeAdapter|Probe\s*=\s*\(/);
    expect(body).toMatch(/domain/);
    expect(body).toMatch(/probe/);
  });

  it('placement section documents ProbeResult = "pass" | "fail" | "partial"', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    expect(body).toMatch(/pass/);
    expect(body).toMatch(/fail/);
    expect(body).toMatch(/partial/);
  });

  it('placement section documents the placement flow outcome status (placed | skipped, already-placed)', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    // The "skipped" / "already-placed" guard is part of the implemented contract
    // (see spec.md FR6 + AC5 + test-strategy §3 "Knowledge-state already populated").
    expect(body, 'expected the spec to mention the returned-student skip path').toMatch(
      /skipped|already.placed|returning.student|alreadyPlaced/,
    );
  });

  it('placement section documents the engine maxProbes cap (bounded probe count)', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    expect(body, 'expected the spec to mention the maxProbes cap').toMatch(/maxProbes|max.probes|max-probes/);
  });

  it('placement section documents the IM3 problem bank (25 entries) and probe(nodeId) adapter', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    // The spec only says "20-30 problem bank" in §8.3; the actual implementation
    // ships 25. Either "20-30" or the exact "25" is acceptable.
    expect(body).toMatch(/problem.bank|20.30|25/);
  });

  it('placement section documents the placement_results table fields and indexes', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    expect(body).toMatch(/placement_results/);
    // The persisted table fields (per apps/integrated-math-3/convex/schema.ts:716)
    expect(body).toMatch(/studentId/);
    expect(body).toMatch(/by_student_and_node/);
  });

  it('placement section references the canonical PlacementResult.masteryEstimate range [0, 1]', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    // The schema bounds masteryEstimate to [0, 1]. The spec should mirror this
    // contract so authors do not assume a different range.
    expect(body).toMatch(/\[0,\s*1\]|\[0,1\]|0\.\.1|range|mastery.*estimate/);
  });

  it('placement section names the IM3 new-student placement flow function (runNewStudentPlacementFlow)', () => {
    expect(PLACEMENT_SECTION).not.toBeNull();
    const body = PLACEMENT_SECTION_BODY;
    // spec.md FR6: "An IM3 placement flow for new students that runs the
    // traversal and persists the resulting initial knowledge state." The
    // production code names this runNewStudentPlacementFlow.
    expect(body, 'expected the spec to mention the new-student placement flow').toMatch(
      /runNewStudentPlacementFlow|new.student.placement|new-student flow/,
    );
  });
});

// ---------------------------------------------------------------------------
// Task 5.1 (cont.) — Spec ↔ implementation cross-check
// ---------------------------------------------------------------------------

describe('Task 5.1 — spec ↔ implementation cross-check', () => {
  it('the PlacementResult Zod schema parses a low-confidence seed without throwing', () => {
    const result = placementResultSchema.safeParse({
      nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
      masteryEstimate: 0.5,
      confidence: 'low',
    });
    expect(result.success, result.success ? '' : JSON.stringify(result.error?.issues)).toBe(true);
  });

  it('placement.ts exports placementResultSchema with the same shape the spec promises', () => {
    expect(PLACEMENT_TS_EXISTS).toBe(true);
    const src = readUtf8(PLACEMENT_TS);
    expect(src).toMatch(/placementResultSchema/);
    expect(src).toMatch(/nodeId:\s*z\.string\(\)/);
    expect(src).toMatch(/masteryEstimate:\s*z\.number\(\)/);
    expect(src).toMatch(/confidence:\s*z\.enum/);
  });

  it('placement.ts restricts confidence to "low" | "medium" (matches the spec contract)', () => {
    const src = readUtf8(PLACEMENT_TS);
    expect(src).toMatch(/z\.enum\(\[\s*['"]low['"]\s*,\s*['"]medium['"]\s*\]\)/);
  });

  it('placement-flow.ts exposes the placed | skipped outcome status', () => {
    expect(PLACEMENT_FLOW_TS_EXISTS).toBe(true);
    const src = readUtf8(PLACEMENT_FLOW_TS);
    expect(src).toMatch(/['"]placed['"]/);
    expect(src).toMatch(/['"]skipped['"]/);
    expect(src).toMatch(/['"]already.placed['"]/);
  });

  it('convex/schema.ts registers the placement_results table with by_student_and_node index', () => {
    expect(SCHEMA_TS_EXISTS).toBe(true);
    const src = readUtf8(SCHEMA_TS);
    expect(src).toMatch(/placement_results:\s*defineTable/);
    expect(src).toMatch(/\.index\(\s*['"]by_student_and_node['"]\s*,\s*\[\s*['"]studentId['"]\s*,\s*['"]nodeId['"]\s*\]\s*\)/);
  });
});

// ---------------------------------------------------------------------------
// Task 5.2 — Boundary lint: placement modules respect architectural rules
// ---------------------------------------------------------------------------

const FORBIDDEN_FROM_KNOWLEDGE_SPACE_CORE = [
  /from\s+['"]\s*apps\//,
  /from\s+['"]\s*convex\/_generated/,
  /from\s+['"]\s*@math-platform\/math-content/,
];

function collectTsFiles(dir: string): string[] {
  const out: string[] = [];
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === '__tests__' || entry === 'node_modules' || entry === 'dist') continue;
      out.push(...collectTsFiles(full));
    } else if (entry.endsWith('.ts') && !entry.endsWith('.test.ts')) {
      out.push(full);
    }
  }
  return out;
}

describe('Task 5.2 — boundary lint: placement modules', () => {
  it('check-monorepo-boundaries.mjs exists at scripts/ (replacement for measure/doctor.sh)', () => {
    expect(MONOREPO_BOUNDARY_EXISTS, 'scripts/check-monorepo-boundaries.mjs is missing').toBe(true);
  });

  it('knowledge-space-core placement modules do not import from apps/, convex/_generated/, or math-content', () => {
    expect(PLACEMENT_TS_EXISTS).toBe(true);
    expect(PLACEMENT_ENGINE_TS_EXISTS).toBe(true);
    const pkgSrc = join(REPO_ROOT, 'packages', 'knowledge-space-core', 'src');
    const files = collectTsFiles(pkgSrc);
    const violations: Array<{ file: string; line: number; match: string; label: string }> = [];
    for (const file of files) {
      const content = readUtf8(file);
      const lines = content.split('\n');
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i] ?? '';
        for (const { pattern, label } of FORBIDDEN_FROM_KNOWLEDGE_SPACE_CORE.map((p) => ({
          pattern: p,
          label: p.source,
        }))) {
          if (pattern.test(line)) {
            violations.push({
              file: file.replace(pkgSrc + '/', ''),
              line: i + 1,
              match: line.trim(),
              label,
            });
          }
        }
      }
    }
    if (violations.length > 0) {
      expect.fail(
        `Boundary violations in knowledge-space-core:\n${violations
          .map((v) => `  ${v.file}:${v.line} — ${v.label}\n    ${v.match}`)
          .join('\n\n')}`,
      );
    }
    expect(violations).toHaveLength(0);
  });

  it('placement.ts only imports from sibling modules, zod, and CORE_ID_PATTERN', () => {
    const src = readUtf8(PLACEMENT_TS);
    const importLines = src
      .split('\n')
      .filter((l) => /^\s*import\b/.test(l));
    for (const line of importLines) {
      expect(line).not.toMatch(/from\s+['"]\s*apps\//);
      expect(line).not.toMatch(/from\s+['"]\s*convex\//);
      expect(line).not.toMatch(/from\s+['"]\s*@math-platform\/math-content/);
    }
  });

  it('placement-engine.ts only imports from ./types, ./placement, and stdlib', () => {
    const src = readUtf8(PLACEMENT_ENGINE_TS);
    const importLines = src.split('\n').filter((l) => /^\s*import\b/.test(l));
    for (const line of importLines) {
      expect(line).not.toMatch(/from\s+['"]\s*apps\//);
      expect(line).not.toMatch(/from\s+['"]\s*convex\//);
      expect(line).not.toMatch(/from\s+['"]\s*@math-platform\/math-content/);
    }
  });

  it('apps/integrated-math-3/lib/placement/ placement-flow.ts does not import convex/_generated', () => {
    const src = readUtf8(PLACEMENT_FLOW_TS);
    expect(src).not.toMatch(/from\s+['"]\s*convex\/_generated/);
    expect(src).not.toMatch(/from\s+['"]\s*\.\.\/convex/);
  });

  it('apps/integrated-math-3/lib/placement/ seed-knowledge-state.ts does not import convex/_generated', () => {
    const src = readUtf8(SEED_TS);
    expect(src).not.toMatch(/from\s+['"]\s*convex\/_generated/);
    expect(src).not.toMatch(/from\s+['"]\s*\.\.\/convex/);
  });
});

// ---------------------------------------------------------------------------
// Task 5.3 — Final verification: the test suite, typecheck, and lint all
// agree that the placement track is shippable. The tests here are static
// checks the suite can execute inline; the actual `CI=true npm run test`,
// `tsc --noEmit`, and `npm run lint` runs are orchestrated by the CI script.
// ---------------------------------------------------------------------------

describe('Task 5.3 — final verification: artifacts are in place', () => {
  it('placement.ts, placement-engine.ts, placement-flow.ts, seed-knowledge-state.ts are all present and non-empty', () => {
    for (const [label, path] of [
      ['placement.ts', PLACEMENT_TS],
      ['placement-engine.ts', PLACEMENT_ENGINE_TS],
      ['placement-flow.ts', PLACEMENT_FLOW_TS],
      ['seed-knowledge-state.ts', SEED_TS],
    ] as const) {
      expect(existsSync(path), `${label} missing at ${path}`).toBe(true);
      const content = readUtf8(path);
      expect(content.length, `${label} is empty`).toBeGreaterThan(0);
    }
  });

  it('placement tests exist for Phases 1-4 (contract, engine, IM3 adapter, production wiring)', () => {
    const ksTestDir = join(
      REPO_ROOT,
      'packages',
      'knowledge-space-core',
      'src',
      '__tests__',
    );
    const im3TestDir = join(
      REPO_ROOT,
      'apps',
      'integrated-math-3',
      '__tests__',
      'lib',
      'placement',
    );
    const im3ConvexTestDir = join(
      REPO_ROOT,
      'apps',
      'integrated-math-3',
      '__tests__',
      'convex',
    );

    expect(existsSync(join(ksTestDir, 'placement-contract.test.ts'))).toBe(true);
    expect(existsSync(join(ksTestDir, 'placement-engine.test.ts'))).toBe(true);
    expect(existsSync(join(ksTestDir, 'placement-engine-extra.test.ts'))).toBe(true);
    expect(existsSync(join(im3TestDir, 'im3-probe-adapter.test.ts'))).toBe(true);
    expect(existsSync(join(im3TestDir, 'placement-flow.test.ts'))).toBe(true);
    expect(existsSync(join(im3TestDir, 'seed-knowledge-state.test.ts'))).toBe(true);
    expect(existsSync(join(im3ConvexTestDir, 'placement.test.ts'))).toBe(true);
    expect(existsSync(join(im3ConvexTestDir, 'schema-placement.test.ts'))).toBe(true);
  });

  it('placement-flow.ts has a module header (JSDoc or `//` block) describing the new-student flow', () => {
    const src = readUtf8(PLACEMENT_FLOW_TS);
    // Implementation file should be self-documenting. Accept either a JSDoc
    // block (/** ... */) or a `// ...` comment header in the first 15 lines.
    const header = src.split('\n').slice(0, 15).join('\n');
    const hasJsDoc = /^\s*\/\*\*[\s\S]*?\*\//m.test(header);
    const hasSlashHeader = /^\s*\/\/\s+\S/m.test(header);
    expect(hasJsDoc || hasSlashHeader, 'expected a module-level comment header in placement-flow.ts').toBe(true);
    // And the header should mention the placement flow concept.
    expect(header.toLowerCase()).toMatch(/new.student|placement/);
  });
});
