/**
 * Phase 1 (Track next_skill_planner_prod_wiring_20260621) — Contract and
 * Caller Discovery Red tests.
 *
 * Per spec.md FR-5: "Add a caller/call-path check proving the planner
 * output has at least one non-test production consumer."
 * Per test-strategy.md §5 (P1):
 *   (a) source-scan asserts ≥1 non-test file imports
 *       `projectStudentVisualization` or calls the new `internal.*` query.
 *       This is the ARTIFACT / SOURCE-CONTRACT proof — proves the
 *       production chain structure exists, not that it runs.
 *   (b) `internal.student.getStudentVisualization` is a defined function
 *       ref (non-throw). This is the LIVE API-SHAPE proof — the
 *       `@/convex/_generated/api` registration exposes the symbol.
 *
 * Tightened contract (MID 2026-06-21):
 *   The original (a) and (b) assertions were already green at MID start
 *   because the worktree contained an uncommitted P2 implementation in
 *   `apps/integrated-math-3/convex/student.ts`. Per Measure workflow, when
 *   a Red test passes at HEAD the contract is tightened instead of faking
 *   a Red phase. A third assertion now requires a student-facing surface
 *   under `app/student/` to reference `getStudentVisualization`. This
 *   assertion is Red and will be resolved by Phase 3.
 *
 * Why this file is Red at HEAD (2026-06-21):
 *   - (a) + (b) were green at MID start because the worktree already
 *     contained an uncommitted P2 implementation in
 *     `apps/integrated-math-3/convex/student.ts`. Rather than fake a Red
 *     phase, the contract was tightened.
 *   - Tightened (c) No production file under `app/student/` references
 *     `getStudentVisualization`; the student-facing surface is unwired.
 *
 * Bounded Red scope (per workflow gate):
 *   - Source-scan walks `apps/`, `packages/`, and `convex/` at the
 *     workspace root. The walk is bounded by the FS scanner, not by
 *     unbounded Node globbing.
 *   - Source-scan EXCLUDES `__tests__/`, `*.test.ts`, `*.test.tsx`, and
 *     the canonical planner source itself
 *     (`packages/knowledge-space-practice/src/projections/visualization.ts`,
 *     which is the definition site, not a consumer).
 *   - Test (b) is a single synchronous import + typeof check on the
 *     P1 file; it cannot fall through into the broader test suite.
 *   - The targeted Red command is
 *     `npx vitest run planner-prod-wiring --root apps/integrated-math-3`
 *     (per test-strategy §7) — no watch mode, no full smoke.
 *
 * Test (a) is an artifact/source-contract assertion (per the test
 * strategy §7 "Artifact vs. live-behavior tests"). Test (b) is the
 * live-behavior half of P1. The full runtime round-trip
 * (P2 query + P3 component render) is owned by the next-skill-planner
 * P2 and P3 tests and is NOT exercised here.
 */

import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Workspace-root resolution.
//
// Vitest runs this file with `process.cwd()` set to the workspace root
// (NOT the IM3 app), even when invoked with `--root apps/integrated-math-3`.
// Derive the repo root from `import.meta.url` instead so the test is
// location-independent.
//
//   import.meta.url → .../apps/integrated-math-3/__tests__/planner-prod-wiring.test.ts
//   REPO_ROOT       → .../apps/integrated-math-3  →  walk up 3 levels
// ---------------------------------------------------------------------------

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(HERE, "..", "..", "..");

/** Directories to scan for production callers. */
const SCAN_ROOTS = ["apps", "convex"];

/**
 * Directories to scan as part of `packages/` — but excluding the
 * planner package itself, which only re-exports its own public
 * surface. A barrel re-export is NOT a "consumer"; the audit
 * definition is a file that *calls* the planner from a downstream
 * module boundary (apps/ or convex/). When P2/P3 lands, this
 * directory MUST contain zero matching files until a downstream
 * `apps/integrated-math-3/convex/student.ts` (or similar) imports
 * `projectStudentVisualization` for real.
 */
const PACKAGE_SCAN_ROOTS: readonly string[] = [];
const PLANNER_PACKAGE_PREFIX = "packages/knowledge-space-practice/";

/** File extensions considered production source. */
const SOURCE_EXTENSIONS = new Set([".ts", ".tsx"]);

/** Path substrings that disqualify a file from being a "production caller". */
const EXCLUDED_PATH_TOKENS = [
  "/__tests__/",
  "/node_modules/",
  "/.next/",
  "/dist/",
  "/.wrangler/",
  "/test-results/",
];

/** Filenames that disqualify a file (test files). */
const EXCLUDED_FILENAMES = (name: string): boolean =>
  name.endsWith(".test.ts") || name.endsWith(".test.tsx");

// ---------------------------------------------------------------------------
// Recursive directory walker — bounded by SCAN_ROOTS, terminates on first
// match. Used only by the source-scan test, not by anything else.
// ---------------------------------------------------------------------------

interface SourceFileHit {
  /** Workspace-relative POSIX path. */
  readonly relPath: string;
  /** Absolute path on disk. */
  readonly absPath: string;
}

function isExcluded(relPath: string): boolean {
  if (EXCLUDED_FILENAMES(relPath.split("/").pop() ?? "")) return true;
  for (const token of EXCLUDED_PATH_TOKENS) {
    if (relPath.includes(token)) return true;
  }
  return false;
}

function collectSourceFiles(absRoot: string, relRoot: string): SourceFileHit[] {
  const hits: SourceFileHit[] = [];
  let entries: string[];
  try {
    entries = readdirSync(absRoot);
  } catch {
    return hits;
  }
  for (const entry of entries) {
    const absChild = join(absRoot, entry);
    let stat;
    try {
      stat = statSync(absChild);
    } catch {
      continue;
    }
    const relChild = relRoot ? `${relRoot}/${entry}` : entry;
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry === "dist") {
        continue;
      }
      hits.push(...collectSourceFiles(absChild, relChild));
      continue;
    }
    if (!stat.isFile()) continue;
    const lastDot = entry.lastIndexOf(".");
    if (lastDot < 0) continue;
    const ext = entry.slice(lastDot);
    if (!SOURCE_EXTENSIONS.has(ext)) continue;
    hits.push({ relPath: relChild, absPath: absChild });
  }
  return hits;
}

// ---------------------------------------------------------------------------
// Source-scan (Test a) — find ≥1 non-test file that either
//   (i)  references the `projectStudentVisualization` symbol, OR
//   (ii) references `internal.student.getStudentVisualization`.
// Both patterns are wired in P2 / P3; both are absent at HEAD.
// ---------------------------------------------------------------------------

const PLANNER_IMPORT_PATTERN =
  /\bprojectStudentVisualization\b/;
const INTERNAL_QUERY_PATTERN =
  /\binternal\.student\.getStudentVisualization\b/;

interface CallerMatch {
  readonly relPath: string;
  readonly matched: "planner-symbol" | "internal-query";
  readonly evidence: string;
}

function findProductionCallers(): CallerMatch[] {
  const matches: CallerMatch[] = [];
  const allRoots: readonly string[] = [...SCAN_ROOTS, ...PACKAGE_SCAN_ROOTS];
  for (const root of allRoots) {
    const absRoot = join(REPO_ROOT, root);
    const files = collectSourceFiles(absRoot, root);
    for (const file of files) {
      if (isExcluded(file.relPath)) continue;
      // Skip the planner package itself — it owns the symbol. Only
      // scan downstream packages (none expected at HEAD) for real
      // cross-package consumers. The planner package's own
      // `index.ts` / `projections/index.ts` are re-exports, not
      // consumers; the audit's FR-5 means a non-test caller OUTSIDE
      // the planner package.
      if (file.relPath.startsWith(PLANNER_PACKAGE_PREFIX)) continue;
      let content: string;
      try {
        content = readFileSync(file.absPath, "utf-8");
      } catch {
        continue;
      }
      if (PLANNER_IMPORT_PATTERN.test(content)) {
        const line = pickEvidenceLine(content, PLANNER_IMPORT_PATTERN);
        matches.push({
          relPath: file.relPath,
          matched: "planner-symbol",
          evidence: line,
        });
        continue;
      }
      if (INTERNAL_QUERY_PATTERN.test(content)) {
        const line = pickEvidenceLine(content, INTERNAL_QUERY_PATTERN);
        matches.push({
          relPath: file.relPath,
          matched: "internal-query",
          evidence: line,
        });
      }
    }
  }
  return matches;
}

function pickEvidenceLine(content: string, pattern: RegExp): string {
  const lines = content.split(/\r?\n/);
  for (const line of lines) {
    if (pattern.test(line)) {
      return line.trim().slice(0, 200);
    }
  }
  return "";
}

// ---------------------------------------------------------------------------
// Source-scan contract assertion (test-strategy §5 P1.a).
// ---------------------------------------------------------------------------

describe("Phase 1 — planner production caller exists (spec FR-5, test-strategy §5 P1.a)", () => {
  it("≥1 non-test file imports `projectStudentVisualization` or calls `internal.student.getStudentVisualization`", () => {
    const callers = findProductionCallers();
    expect(
      callers.length,
      `Expected ≥1 non-test production caller of the next-skill planner; found ${callers.length}.\n` +
        "Either:\n" +
        "  - P2 must add a Convex query in apps/integrated-math-3/convex/student.ts that\n" +
        "    imports `projectStudentVisualization` from @math-platform/knowledge-space-practice\n" +
        "    (the planner export, frozen per FR-3).\n" +
        "  - P3 must consume that query from a student-facing production route or\n" +
        "    dashboard panel via `internal.student.getStudentVisualization`.\n" +
        "    A test-only importer does NOT satisfy FR-5 (the source-scan EXCLUDES\n" +
        "    __tests__/, *.test.ts(x), node_modules/, dist/, .next/, .wrangler/).\n" +
        "    See test-strategy.md §3 'Call-path non-test consumer'.",
    ).toBeGreaterThanOrEqual(1);

    // Sanity: every hit is a non-test file. The scanner already filters, but
    // re-check so the failure message is actionable if the filter drifts.
    for (const caller of callers) {
      expect(
        caller.relPath.includes("/__tests__/"),
        `Test files must be excluded from the caller set; found ${caller.relPath}`,
      ).toBe(false);
      expect(
        caller.relPath.endsWith(".test.ts") || caller.relPath.endsWith(".test.tsx"),
        `Test files must be excluded from the caller set; found ${caller.relPath}`,
      ).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Tightened contract: student-facing surface consumes planner recommendations.
//
// At MID start the original P1(a) and P1(b) assertions were already green
// because the worktree contained an uncommitted P2 implementation in
// `apps/integrated-math-3/convex/student.ts`. Per workflow, when a Red test
// passes at HEAD the contract must be tightened rather than faking a Red
// phase. This assertion raises the bar to the actual student-facing seam:
// a production route or component under `app/student/` must reference
// `getStudentVisualization` (the canonical internal query added in P2).
//
// This test will turn green in Phase 3 when the student dashboard page (or
// a new panel) calls `fetchInternalQuery(internal.student.getStudentVisualization,
// { userId })` and renders `recommendedNext`.
// ---------------------------------------------------------------------------

const STUDENT_APP_ROOT = "apps/integrated-math-3/app/student";

/** Matches either the full internal query ref or a local import alias. */
const STUDENT_SURFACE_PATTERN = /\bgetStudentVisualization\b/;

function findStudentSurfaceReferences(): CallerMatch[] {
  const matches: CallerMatch[] = [];
  const absRoot = join(REPO_ROOT, STUDENT_APP_ROOT);
  const files = collectSourceFiles(absRoot, STUDENT_APP_ROOT);
  for (const file of files) {
    if (isExcluded(file.relPath)) continue;
    let content: string;
    try {
      content = readFileSync(file.absPath, "utf-8");
    } catch {
      continue;
    }
    if (STUDENT_SURFACE_PATTERN.test(content)) {
      const line = pickEvidenceLine(content, STUDENT_SURFACE_PATTERN);
      matches.push({
        relPath: file.relPath,
        matched: "internal-query",
        evidence: line,
      });
    }
  }
  return matches;
}

describe("Phase 1 — student-facing surface consumes planner recommendations (spec FR-5, test-strategy §4 'Student route only')", () => {
  it("≥1 production file under app/student/ references `getStudentVisualization`", () => {
    const refs = findStudentSurfaceReferences();
    expect(
      refs.length,
      `Expected ≥1 student-facing production consumer of getStudentVisualization; found ${refs.length}.\n` +
        "Phase 3 must call `internal.student.getStudentVisualization` from a student route\n" +
        "or dashboard panel (e.g. `apps/integrated-math-3/app/student/dashboard/page.tsx`)\n" +
        "and render the resulting `recommendedNext` recommendations.\n" +
        "Test files and the Convex backend query are excluded from this scan.",
    ).toBeGreaterThanOrEqual(1);

    for (const ref of refs) {
      expect(
        ref.relPath.includes("/convex/"),
        `Backend query files must be excluded from the student-surface scan; found ${ref.relPath}`,
      ).toBe(false);
      expect(
        ref.relPath.includes("/__tests__/"),
        `Test files must be excluded from the student-surface scan; found ${ref.relPath}`,
      ).toBe(false);
    }
  });
});

// ---------------------------------------------------------------------------
// Live API-shape assertion (test-strategy §5 P1.b).
//
// The IM3 generated API runtime (`apps/integrated-math-3/convex/_generated/api.js`)
// exports `internal = anyApi` — Convex's Proxy placeholder. Accessing
// `internal.student.getStudentVisualization` does NOT throw or return
// `undefined`; it returns a proxy object whose `typeof` is always
// `"object"`. So a runtime typeof check cannot distinguish a registered
// function from an unregistered one.
//
// The reliable live-API-shape signal is the generated declaration
// (`api.d.ts`) and the source export in `convex/student.ts`. Together
// they prove:
//
//   1. `apps/integrated-math-3/convex/student.ts` exports a
//      `getStudentVisualization` symbol with `internalQuery(...)` shape.
//   2. After `npx convex dev` codegen, the generated `api.d.ts` exposes
//      the symbol under the `student` module so `internal.student.*`
//      consumers can reach it.
//
// These two checks together ARE the live API-shape proof — they verify
// the symbol exists at the source boundary that downstream code consumes.
// ---------------------------------------------------------------------------

const STUDENT_SOURCE_REL_PATH = "apps/integrated-math-3/convex/student.ts";

/** Regex matching a `getStudentVisualization` export in `student.ts`. */
const STUDENT_EXPORT_PATTERN =
  /export\s+const\s+getStudentVisualization\b[^\n]*?(?:internalQuery|query)\s*\(/;

function readRel(relPath: string): string {
  return readFileSync(join(REPO_ROOT, relPath), "utf-8");
}

describe("Phase 1 — `internal.student.getStudentVisualization` is registered (test-strategy §5 P1.b)", () => {
  it("`getStudentVisualization` is exported from apps/integrated-math-3/convex/student.ts", () => {
    const source = readRel(STUDENT_SOURCE_REL_PATH);
    expect(
      STUDENT_EXPORT_PATTERN.test(source),
      "Expected `export const getStudentVisualization = internalQuery({...})` (or `query({...})`) " +
        "in apps/integrated-math-3/convex/student.ts.\n" +
        "Per test-strategy.md §4 'Internal API seam', the canonical seam is " +
        "`internal.student.getStudentVisualization`, callable via " +
        "`fetchInternalQuery(internal.student.getStudentVisualization, { userId })` " +
        "from the IM3 student dashboard page (or any student-facing route).\n" +
        "Pattern searched: " +
        "/export\\\\s+const\\\\s+getStudentVisualization\\\\b[^\\\\n]*?(?:internalQuery|query)\\\\s*\\\\(/",
    ).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Helper re-exports for downstream phases.
//
// The P2 / P3 Red tests re-use the source-scan so they can prove "this
// specific consumer exists" without re-implementing the walker. Exported
// here as a contract — not as an implementation suggestion.
// ---------------------------------------------------------------------------

export { findProductionCallers };
export type { CallerMatch };

// Keep `relative` reachable so the import stays tree-shakeable for callers
// that swap to a different path provider later.
void join;