// Phase 2 — Parent Portal test fixtures: Convex mock helpers.
//
// Builds the `vi.mock` factory payload for `@/lib/convex/server` so each
// parent-portal test can mock the convex bridge in one line. The factory
// exposes a typed `internal.parent.*` namespace so tests reference the same
// symbol the real guard uses, keeping the mock aligned with the production
// import path. The mock is also wired to return the per-student parent
// projection payload keyed by `studentId`, mirroring the page-level
// server-component pattern (page calls `listParentLinks`, picks a student,
// then calls a `projectParentVisualization` query — both end up here).
//
// Pattern reference: `__tests__/lib/auth/parent-role-guard.test.ts` mocks
// `@math-platform/core-auth` and `@/lib/convex/server` in the same way.
//
// No global `vi.mock` in `vitest.setup.ts` — these helpers are kept per-suite
// (per test-strategy §2) so unrelated tests do not see parent-portal mocks.

import { vi } from 'vitest';
import type { ParentLinkFixture } from './parentLinks';
import type { ParentVisualizationV1 } from './parentProjection';

export interface ConvexMocksOptions {
  links?: ParentLinkFixture[];
  /** Map from studentId to a `parentVisualizationV1Schema`-valid payload. */
  projectionsByStudentId?: Record<string, ParentVisualizationV1>;
  /** Optional default projection returned when the test does not care which student. */
  defaultProjection?: ParentVisualizationV1 | null;
  /** Optional rejection of `fetchInternalQuery` for fail-closed tests. */
  rejectWith?: Error;
}

export function buildConvexMocks(options: ConvexMocksOptions = {}) {
  const fetchInternalQuery = vi.fn(async (ref: unknown, args: Record<string, unknown> = {}) => {
    if (options.rejectWith) throw options.rejectWith;

    // Mock by the ref name string so the parent code can pass either a
    // typed `FunctionReference` (which the test harness serializes to its
    // internal `parent:links:listParentLinksQuery` string) or the bare
    // string from the parent-role-guard test pattern.
    const refName = String(ref);

    if (refName.includes('listParentLinksQuery')) {
      return options.links ?? [];
    }

    if (refName.includes('projectParentVisualization') || refName.includes('parentVisualization')) {
      const studentId = typeof args.studentId === 'string' ? args.studentId : undefined;
      if (studentId && options.projectionsByStudentId) {
        return options.projectionsByStudentId[studentId] ?? null;
      }
      return options.defaultProjection ?? null;
    }

    return null;
  });

  return {
    fetchInternalQuery,
    internal: {
      parent: {
        links: {
          listParentLinksQuery: 'parent:links:listParentLinksQuery',
        },
        visualization: {
          projectParentVisualizationQuery: 'parent:visualization:projectParentVisualizationQuery',
        },
      },
    },
  };
}

export function buildParentAuthMocks() {
  return {
    requireParentServerSessionClaims: vi.fn(),
    requireParentRequestClaims: vi.fn(),
  };
}
