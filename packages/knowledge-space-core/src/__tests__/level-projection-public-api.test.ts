// Phase 2 (Track 8 kst-lesser-holes_20260521) — Level Projection public API contract Red tests.
//
// kst-srs.v2 §11.2 (Level Projection):
//   "Domain-supplied monotonic function from knowledge state → display level.
//   Presentation-only; never feeds KST/SRS computation."
//
// Phase 1 added the TYPE contract (`knowledgeStateSchema`, `displayLevelSchema`,
// `LevelProjectionFn`) to the package's public API in two locations:
//   1. Package root re-export: @math-platform/knowledge-space-core
//   2. Subpath:                 @math-platform/knowledge-space-core/level-projection
//
// Phase 1 also added a `public-api-contract.test.ts` that asserts the *type
// contract* is reachable from both locations. Phase 2 must add the concrete
// `projectDisplayLevel(state, levels) → string` function and re-export it from
// both locations. This test file strengthens the Phase 1 contract by asserting
// the runtime export (not just the type) for the concrete function.
//
// At HEAD, `projectDisplayLevel` is not implemented yet, so these tests fail
// with the expected contract-gap signal:
//   - Root import resolves to `undefined` → `typeof undefined !== 'function'`
//   - Subpath import resolves to `undefined` → same failure
//
// Test count: 2 tests. Targeted Red command:
//   npx vitest run packages/knowledge-space-core/src/__tests__/level-projection-public-api.test.ts

import { describe, it, expect } from 'vitest';
import * as rootExports from '@math-platform/knowledge-space-core';
import * as subpathExports from '@math-platform/knowledge-space-core/level-projection';

// ---------------------------------------------------------------------------
// 1. Package root export
// ---------------------------------------------------------------------------

describe('Level Projection — public API contract: package root (kst-srs.v2 §11.2)', () => {
  it('re-exports projectDisplayLevel from @math-platform/knowledge-space-core', () => {
    // The Green phase must add a named `export { projectDisplayLevel }`
    // statement in `packages/knowledge-space-core/src/index.ts` that re-exports
    // the function from `./level-projection`. At HEAD the symbol is missing.
    const fn = (rootExports as Record<string, unknown>).projectDisplayLevel;
    expect(typeof fn).toBe('function');
  });
});

// ---------------------------------------------------------------------------
// 2. Subpath export
// ---------------------------------------------------------------------------

describe('Level Projection — public API contract: subpath (kst-srs.v2 §11.2)', () => {
  it('exports projectDisplayLevel from @math-platform/knowledge-space-core/level-projection', () => {
    // The subpath is wired in `package.json` exports, so the import resolves
    // to the level-projection.ts module directly. At HEAD, that module does
    // not export `projectDisplayLevel` (it only has the Phase 1 type contract).
    const fn = (subpathExports as Record<string, unknown>).projectDisplayLevel;
    expect(typeof fn).toBe('function');
  });
});
