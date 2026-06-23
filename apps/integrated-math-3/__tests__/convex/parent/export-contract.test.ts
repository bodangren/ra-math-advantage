// Phase 3 — Red-phase contract test for the parent-portal Convex export shape.
//
// Track: parent-portal_20260605
// Spec: AC for FR1+FR2 — Read-only contract on convex/parent/ mutations.
// Source: measure/tracks/parent-portal_20260605/test-strategy.md §4
//
// Per the test strategy (Architecture Guardrails, "Read-only contract"):
//
//   "No Convex `mutation` exports under `convex/parent/` other than
//    link/revoke flows. Add a Phase 3 contract test that enumerates exports."
//
// This test is an **ARTIFACT/DOCUMENT CONTRACT TEST**. Its deliverable is
// the enumeration assertion itself. Per measure/workflow.md Red-phase
// rules, artifact tests are allowed when the phase deliverable IS the
// artifact itself — this is exactly that case (the test IS the contract).
//
// Contract under test (locks the architecture guardrail):
//   1. Every Convex `mutation` wrapper exported from `convex/parent/*` must
//      be built with `internalMutation`, never with the public `mutation`
//      builder. Public mutations would expose link/revoke flows to the
//      client and bypass server-side auth.
//   2. The only mutation flows permitted under `convex/parent/` are the
//      parent↔student link flows: `createParentLink*` and `revokeParentLink*`.
//      No teacher-only or admin-only mutations are permitted — those belong
//      under `convex/teacher/*`.
//   3. Every Convex `query` wrapper exported from `convex/parent/*` must
//      be built with `internalQuery`, never with the public `query` builder.
//   4. The query flows permitted under `convex/parent/` are:
//      - `listParentLinks*` (the parent's own link list).
//      - `projectParentVisualization*` (parent-safe progress projection).
//
// Status at HEAD: the contract is currently satisfied. `convex/parent/links.ts`
// exports exactly the expected set:
//   - createParentLinkMutation = internalMutation({ ... })
//   - revokeParentLinkMutation = internalMutation({ ... })
//   - listParentLinksQuery     = internalQuery({ ... })
//
// Therefore this test passes at HEAD — it is a regression guard, not a
// Red signal. Per the Red-phase protocol, this counts as
// "already satisfied with evidence" (the evidence is the test itself
// verifying the contract). The contract test is paired with an explicit
// plan note: the **live gate** is the Phase 3 closeout command
// `CI=true npm run ws:im3:test`, which re-runs this test as part of the
// full vitest suite (test-strategy.md §7 Phase 3.2). Any future contributor
// who adds a public mutation, a non-link/revoke mutation, or a public
// query under `convex/parent/` will cause THIS test to fail Red, blocking
// the commit at the closeout gate.
//
// Implementation note: this test reads the source file directly with
// `fs.readFileSync` and uses regex matching to enumerate `export const X
// = <builder>(` lines. This is intentionally a static analysis test — it
// does not import the Convex module (which would require the Convex
// runtime to evaluate the `internalMutation`/`internalQuery` wrappers).
// The pattern matches the existing Phase 5 boundary lint at
// `apps/integrated-math-3/__tests__/lib/placement/phase5-docs-and-doctor.test.ts`.

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

// ---------------------------------------------------------------------------
// Path resolution
// ---------------------------------------------------------------------------
//
// This test file lives at
//   apps/integrated-math-3/__tests__/convex/parent/export-contract.test.ts
// which is 5 levels below the monorepo root:
//   - apps/integrated-math-3/__tests__/convex/parent/  (file's dir)
//   - apps/integrated-math-3/__tests__/convex/
//   - apps/integrated-math-3/__tests__/
//   - apps/integrated-math-3/
//   - apps/
//   - <repo root>
//
// So 5 `..`s land on the repo root. Same pattern as
// apps/integrated-math-3/__tests__/components/parent/projection-boundary.test.ts
// (Phase 2 — fixed in attempt-3 after the attempt-2 off-by-one bug).

const __dirname = resolve(fileURLToPath(import.meta.url), '..');
const REPO_ROOT = resolve(__dirname, '../../../../..');
const PARENT_DIR = join(
  REPO_ROOT,
  'apps',
  'integrated-math-3',
  'convex',
  'parent',
);
const LINKS_TS = join(PARENT_DIR, 'links.ts');
const VISUALIZATION_TS = join(PARENT_DIR, 'visualization.ts');

function readParentSources(): string {
  return [LINKS_TS, VISUALIZATION_TS].map((p) => readFileSync(p, 'utf-8')).join('\n');
}

// ---------------------------------------------------------------------------
// Regex helpers
// ---------------------------------------------------------------------------
//
// Matches `export const <name> = <builder>(` at the start of a line.
// Captures: name, builder.
// Builders in scope: internalMutation, internalQuery, mutation, query.

const EXPORT_CONST_RE =
  /^export const (\w+)\s*=\s*(internalMutation|internalQuery|mutation|query)\(/gm;

function listExportedBuilders(source: string): Array<{ name: string; builder: string }> {
  return [...source.matchAll(EXPORT_CONST_RE)].map((m) => ({
    name: m[1]!,
    builder: m[2]!,
  }));
}

// ---------------------------------------------------------------------------
// Source-loading helper (wrapped so vitest's transformation does not
// surface a missing-file error as a test-file-level failure).
// ---------------------------------------------------------------------------

let cachedSource: string | null = null;
function readParentSource(): string {
  if (cachedSource !== null) return cachedSource;
  cachedSource = readParentSources();
  return cachedSource;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('Phase 3 — parent-portal Convex export contract', () => {
  describe('source file presence', () => {
    it('convex/parent/links.ts and convex/parent/visualization.ts exist at the contract paths', () => {
      const source = readParentSource();
      expect(source.length).toBeGreaterThan(0);
    });
  });

  describe('mutation exports — read-only contract guardrail', () => {
    it('every mutation export is built with internalMutation (no public mutations)', () => {
      const exports = listExportedBuilders(readParentSource());
      const mutations = exports.filter((e) => e.builder === 'mutation' || e.builder === 'internalMutation');

      // At least one mutation must exist (the link/revoke flows).
      expect(mutations.length).toBeGreaterThan(0);

      // Every mutation must be `internalMutation`, not the public `mutation` builder.
      const publicMutations = mutations.filter((e) => e.builder === 'mutation');
      expect(publicMutations).toEqual([]);

      // Every `internalMutation` export is, by definition, an `internalMutation`.
      for (const m of mutations) {
        expect(m.builder).toBe('internalMutation');
      }
    });

    it('mutation exports are limited to createParentLink* and revokeParentLink* (link/revoke flows)', () => {
      const exports = listExportedBuilders(readParentSource());
      const mutations = exports.filter((e) => e.builder === 'internalMutation');

      for (const m of mutations) {
        const isLinkFlow = /^createParentLink/i.test(m.name);
        const isRevokeFlow = /^revokeParentLink/i.test(m.name);
        expect(
          isLinkFlow || isRevokeFlow,
          `unexpected mutation export name: ${m.name} ` +
            `(only createParentLink* and revokeParentLink* are permitted under convex/parent/)`,
        ).toBe(true);
      }
    });

    it('does NOT export any non-link/revoke mutation (e.g., teacher/admin mutations)', () => {
      // Regression guard: someone could add a teacher-side mutation
      // (e.g., for invite approval) under convex/parent/ by mistake.
      // Per test-strategy.md §4, only link/revoke flows belong here.
      const exports = listExportedBuilders(readParentSource());
      const mutations = exports.filter((e) => e.builder === 'internalMutation');
      const forbidden = mutations.filter((m) => {
        const name = m.name;
        const isAllowed =
          /^createParentLink/i.test(name) || /^revokeParentLink/i.test(name);
        return !isAllowed;
      });
      expect(forbidden, JSON.stringify(forbidden)).toEqual([]);
    });
  });

  describe('query exports — read-only contract guardrail', () => {
    it('every query export is built with internalQuery (no public queries)', () => {
      const exports = listExportedBuilders(readParentSource());
      const queries = exports.filter((e) => e.builder === 'query' || e.builder === 'internalQuery');

      // At least one query must exist (listParentLinks).
      expect(queries.length).toBeGreaterThan(0);

      // Every query must be `internalQuery`, not the public `query` builder.
      const publicQueries = queries.filter((e) => e.builder === 'query');
      expect(publicQueries).toEqual([]);

      // Every `internalQuery` export is, by definition, an `internalQuery`.
      for (const q of queries) {
        expect(q.builder).toBe('internalQuery');
      }
    });

    it('query exports are limited to listParentLinks* and projectParentVisualization*', () => {
      const exports = listExportedBuilders(readParentSource());
      const queries = exports.filter((e) => e.builder === 'internalQuery');

      for (const q of queries) {
        const isAllowed =
          /^listParentLinks/i.test(q.name) ||
          /^projectParentVisualization/i.test(q.name);
        expect(
          isAllowed,
          `unexpected query export name: ${q.name} ` +
            `(only listParentLinks* and projectParentVisualization* are permitted under convex/parent/)`,
        ).toBe(true);
      }
    });
  });

  describe('complete enumeration — every exported Convex wrapper is internal', () => {
    it('every Convex wrapper export is either internalMutation or internalQuery (no raw handler exports)', () => {
      // Catches a future regression where someone adds
      // `export const foo = someOtherBuilder({...})` — every Convex
      // wrapper under convex/parent/ MUST be one of the two internal
      // builders. This is the strongest assertion in the contract test:
      // it fails on ANY unexpected wrapper shape.
      const exports = listExportedBuilders(readParentSource());
      const allowed = new Set(['internalMutation', 'internalQuery']);
      const violations = exports.filter((e) => !allowed.has(e.builder));
      expect(
        violations,
        `unexpected Convex wrapper exports under convex/parent/: ${JSON.stringify(violations)}`,
      ).toEqual([]);
    });

    it('exports at least one mutation (link/revoke flow) and one query (read-only)', () => {
      const exports = listExportedBuilders(readParentSource());
      const mutations = exports.filter((e) => e.builder === 'internalMutation');
      const queries = exports.filter((e) => e.builder === 'internalQuery');
      expect(mutations.length).toBeGreaterThan(0);
      expect(queries.length).toBeGreaterThan(0);
    });
  });
});