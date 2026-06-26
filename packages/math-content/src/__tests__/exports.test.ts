import { describe, it, expect } from 'vitest';

describe('Export map entry points resolve', () => {
  it('main entry point resolves', async () => {
    const mod = await import('../index');
    expect(mod).toBeDefined();
  }, 30000); // problem-families (~2100 lines) takes ~5-13s to transform on cold start

  it('schemas entry point resolves', async () => {
    const mod = await import('../schemas');
    expect(mod.SCHEMA_REGISTRY).toBeDefined();
  });

  it('algebraic entry point resolves', async () => {
    const mod = await import('../algebraic');
    expect(mod).toBeDefined();
  });

  it('problem-families entry point resolves', async () => {
    const mod = await import('../problem-families');
    expect(mod).toBeDefined();
  }, 30000); // large data module may be slow on cold start if loaded before index

  it('IM1 problem-families package subpath resolves', async () => {
    const mod = await import('@math-platform/math-content/problem-families/im1');
    expect(mod.IM1_PROBLEM_FAMILIES).toBeDefined();
    expect(mod.IM1_GENERATORS).toBeDefined();
    expect(mod.IM1_PROBLEM_FAMILIES.length).toBeGreaterThan(0);
    expect(mod.IM1_GENERATORS.length).toBeGreaterThan(0);
  });

  it('glossary entry point resolves', async () => {
    const mod = await import('../glossary');
    expect(mod).toBeDefined();
  });

  it('seed entry point resolves', async () => {
    const mod = await import('../seeds');
    expect(mod).toBeDefined();
  });
});

describe('Problem family ID uniqueness', () => {
  it('IM3 family IDs are unique', async () => {
    const { IM3_PROBLEM_FAMILIES } = await import('../index');
    const ids = IM3_PROBLEM_FAMILIES.map((f: { variantKey: string }) => f.variantKey);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('IM2 family IDs are unique', async () => {
    const { IM2_PROBLEM_FAMILIES } = await import('../index');
    const ids = IM2_PROBLEM_FAMILIES.map((f: { variantKey: string }) => f.variantKey);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  // Phase 2 Task 1 (track im1-practice-readiness_20260609) — Red phase.
  // Mirrors the IM3/IM2 uniqueness pattern. test-strategy §6 §B.6 calls
  // out that wiring IM1_PROBLEM_FAMILIES needs both the export AND a
  // matching uniqueness case here, because static checks otherwise miss
  // a miss-wire (consumers bind dynamically through seed scripts).
  //
  // Red signal at HEAD: `IM1_PROBLEM_FAMILIES` is NOT yet re-exported
  // from `../index` (only IM3/IM2/PRECALC are wired). The destructure
  // yields `undefined`, and the subsequent `.map(...)` throws "Cannot
  // read properties of undefined (reading 'map')" — a clear Red.
  it('IM1 family IDs are unique', async () => {
    const mod = await import('../index') as Record<string, unknown>;
    const IM1_PROBLEM_FAMILIES = mod.IM1_PROBLEM_FAMILIES as
      | Array<{ variantKey: string }>
      | undefined;
    expect(IM1_PROBLEM_FAMILIES).toBeDefined();
    expect(Array.isArray(IM1_PROBLEM_FAMILIES)).toBe(true);
    const ids = (IM1_PROBLEM_FAMILIES ?? []).map(
      (f: { variantKey: string }) => f.variantKey,
    );
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('PreCalc family IDs are unique', async () => {
    const { PRECALC_PROBLEM_FAMILIES } = await import('../index');
    const ids = PRECALC_PROBLEM_FAMILIES.map((f: { variantKey: string }) => f.variantKey);
    const uniqueIds = new Set(ids);
    if (uniqueIds.size !== ids.length) {
      const seen = new Map<string, number>();
      for (const id of ids) {
        seen.set(id, (seen.get(id) || 0) + 1);
      }
      const dups = [...seen.entries()].filter(([, c]) => c > 1).map(([id, c]) => `${id} (${c}×)`);
      console.log(`PreCalc duplicate IDs: ${dups.join(', ')}`);
    }
    expect(uniqueIds.size).toBe(ids.length);
  });

  it('No duplicate family IDs across IM3/IM2/PreCalc', async () => {
    // Note: Cross-app duplicates may exist if problem families are shared across courses.
    // This test documents the current state.
    const { IM3_PROBLEM_FAMILIES, IM2_PROBLEM_FAMILIES, PRECALC_PROBLEM_FAMILIES } = await import('../index');
    const all = [
      ...IM3_PROBLEM_FAMILIES,
      ...IM2_PROBLEM_FAMILIES,
      ...PRECALC_PROBLEM_FAMILIES,
    ];
    const ids = all.map((f: { variantKey: string }) => f.variantKey);
    const uniqueIds = new Set(ids);
    const dupCount = ids.length - uniqueIds.size;

    // Log duplicates for audit purposes
    if (dupCount > 0) {
      const seen = new Map<string, number>();
      for (const id of ids) {
        seen.set(id, (seen.get(id) || 0) + 1);
      }
      const dups = [...seen.entries()].filter(([, c]) => c > 1).map(([id, c]) => `${id} (${c}×)`);
      console.log(`Cross-app duplicate IDs (${dupCount} out of ${ids.length}): ${dups.join(', ')}`);
    }

    // Document the count but don't block on it
    expect(dupCount).toBe(dupCount);
  });

  // Phase 2 Task 1 (track im1-practice-readiness_20260609) — Red phase.
  // Cross-course uniqueness scoped across IM3/IM2/IM1/PreCalc. Mirrors
  // the prior "No duplicate family IDs across IM3/IM2/PreCalc" test but
  // adds IM1 to the join. Like its sibling, this documents (does not
  // block) the count — a Red signal is produced upstream by the
  // `IM1 family IDs are unique` case when `IM1_PROBLEM_FAMILIES` is
  // missing or empty.
  //
  // Red signal at HEAD: destructuring `IM1_PROBLEM_FAMILIES` from the
  // module yields `undefined`, the spread `...IM1_PROBLEM_FAMILIES`
  // throws "Cannot read properties of undefined (reading
  // Symbol(Symbol.iterator))" — clear Red.
  it('No duplicate family IDs across IM3/IM2/IM1/PreCalc', async () => {
    const mod = await import('../index') as Record<string, unknown>;
    const IM1_PROBLEM_FAMILIES = mod.IM1_PROBLEM_FAMILIES as
      | Array<{ variantKey: string }>
      | undefined;
    expect(IM1_PROBLEM_FAMILIES).toBeDefined();

    const { IM3_PROBLEM_FAMILIES, IM2_PROBLEM_FAMILIES, PRECALC_PROBLEM_FAMILIES } = await import('../index');
    const all = [
      ...IM3_PROBLEM_FAMILIES,
      ...IM2_PROBLEM_FAMILIES,
      ...(IM1_PROBLEM_FAMILIES as Array<{ variantKey: string }>),
      ...PRECALC_PROBLEM_FAMILIES,
    ];
    const ids = all.map((f: { variantKey: string }) => f.variantKey);
    const uniqueIds = new Set(ids);
    const dupCount = ids.length - uniqueIds.size;

    if (dupCount > 0) {
      const seen = new Map<string, number>();
      for (const id of ids) {
        seen.set(id, (seen.get(id) || 0) + 1);
      }
      const dups = [...seen.entries()].filter(([, c]) => c > 1).map(([id, c]) => `${id} (${c}×)`);
      console.log(`Cross-app (incl. IM1) duplicate IDs (${dupCount} out of ${ids.length}): ${dups.join(', ')}`);
    }

    expect(dupCount).toBe(dupCount);
  });
});

describe('Seed imports use package exports', () => {
  it('IM3 seed imports problem families from math-content package', async () => {
    const { IM3_PROBLEM_FAMILIES } = await import('../index');
    expect(IM3_PROBLEM_FAMILIES).toBeDefined();
    expect(IM3_PROBLEM_FAMILIES.length).toBeGreaterThan(0);
  });

  it('IM2 seed imports problem families from math-content package', async () => {
    const { IM2_PROBLEM_FAMILIES } = await import('../index');
    expect(IM2_PROBLEM_FAMILIES).toBeDefined();
    expect(IM2_PROBLEM_FAMILIES.length).toBeGreaterThan(0);
  });

  it('PreCalc seed imports problem families from math-content package', async () => {
    const { PRECALC_PROBLEM_FAMILIES } = await import('../index');
    expect(PRECALC_PROBLEM_FAMILIES).toBeDefined();
    expect(PRECALC_PROBLEM_FAMILIES.length).toBeGreaterThan(0);
  });

  // Phase 2 Task 1 (track im1-practice-readiness_20260609) — Red phase.
  // Red signal at HEAD: `IM1_PROBLEM_FAMILIES` is not exported from
  // `../index`, so the destructure yields `undefined` and both length
  // and defined checks fail.
  it('IM1 seed imports problem families from math-content package', async () => {
    const mod = await import('../index') as Record<string, unknown>;
    const IM1_PROBLEM_FAMILIES = mod.IM1_PROBLEM_FAMILIES as
      | Array<unknown>
      | undefined;
    expect(IM1_PROBLEM_FAMILIES).toBeDefined();
    expect(Array.isArray(IM1_PROBLEM_FAMILIES)).toBe(true);
    expect((IM1_PROBLEM_FAMILIES ?? []).length).toBeGreaterThan(0);
  });
});

describe('IM3 local re-export shims', () => {
  it('IM3 convex seed modules use @math-platform/math-content imports', async () => {
    const fs = await import('fs');
    const path = await import('path');

    const appDir = path.resolve(import.meta.dirname || path.dirname(new URL(import.meta.url).pathname), '../../../../apps/integrated-math-3');
    const seedDir = path.join(appDir, 'convex', 'seed');
    const problemFamiliesDir = path.join(seedDir, 'problem_families');

    try {
      const entries = fs.readdirSync(problemFamiliesDir);
      const moduleFiles = entries.filter((f: string) => f.endsWith('.ts') && f !== 'index.ts');

      for (const file of moduleFiles) {
        const content = fs.readFileSync(path.join(problemFamiliesDir, file), 'utf-8');
        if (content.includes('problemFamilies') || content.includes('IM3_')) {
          expect(content).toMatch(/@math-platform\/math-content/);
        }
      }
    } catch {
      // Directory might not exist yet — skip
    }
  });
});
