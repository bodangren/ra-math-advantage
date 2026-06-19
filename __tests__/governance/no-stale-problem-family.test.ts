/**
 * Phase 4 — Docs & Doctor (Track 7: Practice-Variant Rename)
 *
 * FR1 (spec §AC1): Rename is complete and consistent across all three packages
 *      — no `problemFamily*` identifiers remain in `practice-core`,
 *      `srs-engine`, or `knowledge-space-practice`.
 * FR1 (spec §AC5): Boundary lints, `tsc --noEmit`, and the full test suite pass.
 *
 * This is the Red-phase proof for Phase 4 — Docs & Doctor. Every assertion
 * below is expected to fail at HEAD because:
 *
 *   1. **§12.1 of `kst-srs.v2/SPECIFICATION.md` does not exist.** The current
 *      spec jumps from `### Domain/App` (line 461) directly to `### 12.9 FSRS
 *      Per-Card Limitation` (line 465). The P4 deliverable adds a §12.1
 *      documenting the practice-variant boundary.
 *
 *   2. **§13 of `kst-srs.v2/SPECIFICATION.md` does not reference
 *      `variantKey` / `PracticeVariant`.** The current §13 covers
 *      Core Determinism (§13.1), Persistence Isolation (§13.2), and
 *      Misconception Lifecycle Purity (§13.3) only. The P4 deliverable adds
 *      a §13.4 (or similar) for the practice-variant rename.
 *
 *   3. **practice-core still carries the legacy `problemFamilyId` in source
 *      files.** `packages/practice-core/src/practice/timing-baseline.ts` and
 *      `packages/practice-core/src/practice/problem-family.ts` reference the
 *      legacy identifier; they will be renamed in the P4 Green step.
 *
 * Strategy: `test-strategy.md` §5/§7, row "P4 lint". Targeted Red command:
 *   `./node_modules/.bin/vitest run __tests__/governance/no-stale-problem-family.test.ts`
 *
 * Repo root is resolved via `path.resolve(__dirname, '../..')` per
 * lessons-learned 2026-05-03 (governance-tests): never `process.cwd()`.
 *
 * The live-behavior proof (Task 2 — Run `measure/generate.sh` and
 * `measure/doctor.sh`; fix architectural lint) is the no-stale-name grep
 * below; the artifact assertions (Task 1 — spec §12.1 / §13) are paired with
 * this live proof per the directive ("Artifact or markdown assertions are
 * allowed only when the phase deliverable is that artifact, and they must
 * be paired with a live-behavior proof"). The full-repo
 * `npm run lint && npx tsc --noEmit && CI=true npm run test &&
 * bash measure/doctor.sh` close-out is owned by the Green step (Task 3).
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { spawnSync } from 'node:child_process';
import { resolve, dirname, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync, existsSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, '../..');

// Scope per spec FR1: practice-core, srs-engine, knowledge-space-practice.
const SCOPE_PACKAGES = [
  'packages/practice-core',
  'packages/srs-engine',
  'packages/knowledge-space-practice',
] as const;

// Out-of-scope per spec FR1 + test-strategy §6: bm2 (different app),
// math-content (domain curriculum), efficacy-core (out of scope).
const OUT_OF_SCOPE_PATH_FRAGMENTS = [
  'apps/bus-math-v2',
  'packages/math-content',
  'packages/efficacy-core',
] as const;

interface StaleMatch {
  pkg: string;
  file: string;
  line: string;
}

/**
 * Run grep over the in-scope packages and return `(pkg, file, line)` matches
 * for legacy `problemFamily*` / `minProblemFamilies` identifiers. Test
 * files (`__tests__/**`, `*.test.ts(x)`) are excluded — they intentionally
 * assert against the legacy names per the P1-P3 Red phases.
 */
function findStaleNameMatches(): StaleMatch[] {
  const pattern = '\\b(ProblemFamily|problemFamilyId|minProblemFamilies)\\b';
  const matches: StaleMatch[] = [];
  for (const pkg of SCOPE_PACKAGES) {
    const pkgPath = resolve(REPO_ROOT, pkg);
    if (!existsSync(pkgPath)) continue;
    const result = spawnSync('grep', [
      '-rnE',
      '--include=*.ts',
      '--include=*.tsx',
      '--exclude-dir=node_modules',
      '--exclude-dir=__tests__',
      '--exclude=*.test.ts',
      '--exclude=*.test.tsx',
      pattern,
      pkgPath,
    ], { encoding: 'utf-8' });
    if (result.status === 0 && result.stdout.trim()) {
      for (const rawLine of result.stdout.split('\n').filter(Boolean)) {
        const colonIdx = rawLine.indexOf(':');
        if (colonIdx === -1) continue;
        const file = rawLine.slice(0, colonIdx);
        const rest = rawLine.slice(colonIdx + 1);
        matches.push({ pkg, file: relative(REPO_ROOT, file), line: rest });
      }
    }
  }
  return matches;
}

describe('no-stale-problem-family (live grep, scope per spec FR1)', () => {
  it('practice-core, srs-engine, knowledge-space-practice have zero stale problemFamily* identifiers in source files', () => {
    const matches = findStaleNameMatches();
    if (matches.length > 0) {
      const summary = matches
        .map((m) => `  ${m.file}: ${m.line}`)
        .join('\n');
      throw new Error(
        `Found ${matches.length} stale problemFamily* identifier(s) in scope:\n${summary}\n` +
          `These must be renamed in the Phase 4 Green step. ` +
          `Test files are excluded (they intentionally assert against the legacy names).`,
      );
    }
    expect(matches).toEqual([]);
  });
});

describe('kst-srs.v2 spec §12.1 (artifact, Task 1 deliverable)', () => {
  const SPEC_PATH = resolve(REPO_ROOT, 'kst-srs.v2/SPECIFICATION.md');
  let spec: string;
  beforeAll(() => {
    spec = readFileSync(SPEC_PATH, 'utf-8');
  });

  it('contains a `### 12.1` heading', () => {
    // §12 currently jumps from `### Domain/App` to `### 12.9 FSRS Per-Card
    // Limitation` — §12.1 through §12.8 are missing. The P4 deliverable adds
    // §12.1 documenting the practice-variant boundary.
    expect(spec).toMatch(/^### 12\.1 /m);
  });

  it('§12.1 references practice variant / PracticeVariant / variantKey', () => {
    const match = spec.match(/^### 12\.1 [\s\S]*?(?=^### 12\.[0-9] |^## 1[3-9] )/m);
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/practice variant|PracticeVariant|variantKey/i);
  });
});

describe('kst-srs.v2 spec §13 (artifact, Task 1 deliverable)', () => {
  const SPEC_PATH = resolve(REPO_ROOT, 'kst-srs.v2/SPECIFICATION.md');
  let spec: string;
  beforeAll(() => {
    spec = readFileSync(SPEC_PATH, 'utf-8');
  });

  it('§13 references practice variant / PracticeVariant / variantKey', () => {
    // §13 is the Non-Functional Requirements section. It currently covers
    // Core Determinism (§13.1), Persistence Isolation (§13.2), and
    // Misconception Lifecycle Purity (§13.3). The P4 deliverable adds a
    // §13.x (e.g. §13.4) for the practice-variant rename contract.
    const match = spec.match(/^## 13\. [\s\S]*?(?=^## 1[4-9] |^## [2-9][0-9] )/m);
    expect(match).not.toBeNull();
    expect(match![0]).toMatch(/practice variant|PracticeVariant|variantKey/i);
  });
});
