// Failing tests for Phase 3 — Task 2: Seed placement results into the knowledge state.
//
// Per measure/tracks/adaptive-placement_20260521/test-strategy.md §5, Phase 3:
//   - Confidence values are all 'low' or 'medium'
//   - Placement results enter the knowledge state as seeds
//   - Idempotent re-runs yield the same seeded state
// Per §3 (cross-phase edge cases):
//   - Confidence seeding consistency P3→P4: must not override high-confidence
//     SRS data
//   - Knowledge-state already populated: skip placement for returning students
//
// Per spec.md FR5: placement results enter the knowledge state as
// low-to-medium-confidence mastery estimates, refined by subsequent practice.

import { describe, it, expect, beforeEach } from 'vitest';
import type { PlacementResult } from '@math-platform/knowledge-space-core';

// Production module — does not exist yet (Red phase).
// The Green-phase implementer creates `apps/integrated-math-3/lib/placement/seed-knowledge-state.ts`
// exporting buildPlacementKnowledgeStateSeed and seedPlacementResultsIntoStore.
import {
  buildPlacementKnowledgeStateSeed,
  seedPlacementResultsIntoStore,
  PLACEMENT_SOURCE_TAG,
} from '@/lib/placement/seed-knowledge-state';

import {
  createInMemoryKnowledgeStateStore,
  createMockIm3PlacementResult,
  type InMemoryKnowledgeStateStore,
  type PlacementKnowledgeStateSeed,
} from './fixtures';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const STUDENT_A = 'student-im3-a';
const STUDENT_B = 'student-im3-b';
const FIXED_NOW_MS = 1_780_000_000_000; // 2026-05-21-ish

function makeResults(): PlacementResult[] {
  return [
    createMockIm3PlacementResult({
      nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
      masteryEstimate: 0.85,
      confidence: 'medium',
    }),
    createMockIm3PlacementResult({
      nodeId: 'math.im3.skill.1.4.solve-quadratic-equations-by-factoring',
      masteryEstimate: 0.15,
      confidence: 'low',
    }),
    createMockIm3PlacementResult({
      nodeId: 'math.im3.skill.2.3.multiply-polynomials',
      masteryEstimate: 0.4,
      confidence: 'low',
    }),
  ];
}

// ---------------------------------------------------------------------------
// Task 3.2.a — PLACEMENT_SOURCE_TAG constant
// ---------------------------------------------------------------------------

describe('PLACEMENT_SOURCE_TAG', () => {
  it('exposes the canonical "placement" source tag', () => {
    expect(PLACEMENT_SOURCE_TAG).toBe('placement');
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.b — buildPlacementKnowledgeStateSeed: pure conversion
// ---------------------------------------------------------------------------

describe('buildPlacementKnowledgeStateSeed — pure conversion', () => {
  it('returns an empty array for an empty PlacementResult[]', () => {
    const seeds = buildPlacementKnowledgeStateSeed([], { now: FIXED_NOW_MS });
    expect(seeds).toEqual([]);
  });

  it('produces one seed per PlacementResult, preserving order', () => {
    const results = makeResults();
    const seeds = buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    expect(seeds).toHaveLength(results.length);
    for (let i = 0; i < results.length; i++) {
      expect(seeds[i]!.nodeId).toBe(results[i]!.nodeId);
    }
  });

  it('preserves the masteryEstimate from each PlacementResult', () => {
    const results = makeResults();
    const seeds = buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    for (let i = 0; i < results.length; i++) {
      expect(seeds[i]!.masteryEstimate).toBe(results[i]!.masteryEstimate);
    }
  });

  it('preserves the confidence from each PlacementResult (low/medium only)', () => {
    const results = makeResults();
    const seeds = buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    for (let i = 0; i < results.length; i++) {
      expect(seeds[i]!.confidence).toBe(results[i]!.confidence);
      expect(['low', 'medium']).toContain(seeds[i]!.confidence);
    }
  });

  it('tags every seed with source="placement"', () => {
    const results = makeResults();
    const seeds = buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    for (const seed of seeds) {
      expect(seed.source).toBe('placement');
    }
  });

  it('stamps every seed with the provided "now" timestamp', () => {
    const results = makeResults();
    const seeds = buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    for (const seed of seeds) {
      expect(seed.seededAt).toBe(FIXED_NOW_MS);
    }
  });

  it('defaults seededAt to Date.now() when "now" is not provided', () => {
    const before = Date.now();
    const seeds = buildPlacementKnowledgeStateSeed(makeResults());
    const after = Date.now();

    for (const seed of seeds) {
      expect(seed.seededAt).toBeGreaterThanOrEqual(before);
      expect(seed.seededAt).toBeLessThanOrEqual(after);
    }
  });

  it('does not mutate the input PlacementResult[]', () => {
    const results = makeResults();
    const snapshot = JSON.parse(JSON.stringify(results));

    buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    expect(JSON.parse(JSON.stringify(results))).toEqual(snapshot);
  });

  it('refuses to widen confidence to "high" even if caller smuggles it in', () => {
    // Defense-in-depth: even if a malformed PlacementResult slipped past
    // placementResultSchema upstream, the seed must clamp to low/medium.
    const sneaky = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.9,
        confidence: 'high' as unknown as PlacementResult['confidence'],
      },
    ] as PlacementResult[];

    expect(() => buildPlacementKnowledgeStateSeed(sneaky, { now: FIXED_NOW_MS })).toThrowError(
      /confidence/i,
    );
  });

  it('clamps masteryEstimate to [0, 1] (rejects out-of-range)', () => {
    const oob = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 1.5,
        confidence: 'low' as const,
      },
    ];

    expect(() => buildPlacementKnowledgeStateSeed(oob, { now: FIXED_NOW_MS })).toThrowError(
      /masteryEstimate/i,
    );
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.c — seedPlacementResultsIntoStore: persistence
// ---------------------------------------------------------------------------

describe('seedPlacementResultsIntoStore — persistence into the knowledge-state store', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('upserts one seed per PlacementResult for the given student', async () => {
    const results = makeResults();
    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    expect(seeds).toHaveLength(results.length);
  });

  it('persisted seeds carry the expected shape (PlacementKnowledgeStateSeed)', async () => {
    const results = makeResults();
    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    for (const seed of seeds) {
      expect(seed.nodeId).toMatch(/^math\.im3\./);
      expect(seed.masteryEstimate).toBeGreaterThanOrEqual(0);
      expect(seed.masteryEstimate).toBeLessThanOrEqual(1);
      expect(['low', 'medium']).toContain(seed.confidence);
      expect(seed.source).toBe('placement');
      expect(seed.seededAt).toBe(FIXED_NOW_MS);
    }
  });

  it('isolates seeds by studentId', async () => {
    await seedPlacementResultsIntoStore(store, STUDENT_A, makeResults(), { now: FIXED_NOW_MS });
    await seedPlacementResultsIntoStore(store, STUDENT_B, [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.9.1.use-the-unit-circle',
        masteryEstimate: 0.6,
        confidence: 'medium',
      }),
    ], { now: FIXED_NOW_MS });

    const seedsA = await store.getPlacementSeeds(STUDENT_A);
    const seedsB = await store.getPlacementSeeds(STUDENT_B);
    expect(seedsA).toHaveLength(3);
    expect(seedsB).toHaveLength(1);
    expect(seedsB[0]!.nodeId).toBe('math.im3.skill.9.1.use-the-unit-circle');
  });

  it('returns an empty array for a student with no seeded placement', async () => {
    const seeds = await store.getPlacementSeeds('student-never-placed');
    expect(seeds).toEqual([]);
  });

  it('does not mutate the input PlacementResult[]', async () => {
    const results = makeResults();
    const snapshot = JSON.parse(JSON.stringify(results));

    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });

    expect(JSON.parse(JSON.stringify(results))).toEqual(snapshot);
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.d — Idempotency
// ---------------------------------------------------------------------------

describe('seedPlacementResultsIntoStore — idempotency', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('re-running with the same inputs yields the same persisted seeds (no duplicates)', async () => {
    const results = makeResults();

    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });
    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    expect(seeds).toHaveLength(results.length);
  });

  it('upsert semantics: the same (studentId, nodeId) tuple is replaced, not appended', async () => {
    const initial: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.3,
        confidence: 'low',
      }),
    ];
    const updated: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.7,
        confidence: 'medium',
      }),
    ];

    await seedPlacementResultsIntoStore(store, STUDENT_A, initial, { now: FIXED_NOW_MS });
    await seedPlacementResultsIntoStore(store, STUDENT_A, updated, { now: FIXED_NOW_MS + 10_000 });

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    expect(seeds).toHaveLength(1);
    expect(seeds[0]!.masteryEstimate).toBe(0.7);
    expect(seeds[0]!.confidence).toBe('medium');
    expect(seeds[0]!.seededAt).toBe(FIXED_NOW_MS + 10_000);
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.e — Always-upsert contract (no returning-student guard in seed)
// ---------------------------------------------------------------------------
//
// Per plan.md "Resolved (Phase 4)": "seedPlacementResultsIntoStore
// returning-student guard test conflicted with upsert semantics. Always-upsert
// implemented; guard logic now lives in the Phase 4 caller
// runNewStudentPlacementFlow."
//
// This block is the Red-phase replacement for the older "returning-student
// guard" describe block. The new contract locks in:
//   1. seedPlacementResultsIntoStore ALWAYS upserts (never skips).
//   2. The function does NOT call store.getPlacementSeeds — there is no
//      existence pre-check, so the guard cannot creep back in.
//   3. The { force: true } option is a no-op (kept for source compatibility
//      with the resolved design).
// The returning-student guard itself is exercised by
//   __tests__/lib/placement/placement-flow.test.ts > "returning-student guard".

describe('seedPlacementResultsIntoStore — always-upsert contract (no guard)', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('always upserts when re-seeding a student who already has seeds (no skip)', async () => {
    const initial: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.3,
        confidence: 'low',
      }),
    ];
    const overwrite: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.9,
        confidence: 'medium',
      }),
    ];

    await seedPlacementResultsIntoStore(store, STUDENT_A, initial, { now: FIXED_NOW_MS });
    const outcome = await seedPlacementResultsIntoStore(
      store,
      STUDENT_A,
      overwrite,
      { now: FIXED_NOW_MS + 10_000 },
    );

    expect(outcome.skipped).toBe(false);
    expect(outcome.reason).toBeUndefined();
    expect(outcome.seedsWritten).toBe(1);

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    expect(seeds).toHaveLength(1);
    expect(seeds[0]!.masteryEstimate).toBe(0.9);
    expect(seeds[0]!.confidence).toBe('medium');
    expect(seeds[0]!.seededAt).toBe(FIXED_NOW_MS + 10_000);
  });

  it('does NOT call store.getPlacementSeeds (no existence pre-check → no guard)', async () => {
    // Wraps the in-memory store to count getPlacementSeeds calls. The seed
    // helper MUST NOT consult the store to decide whether to skip — the
    // returning-student guard is the caller's responsibility.
    const inner = createInMemoryKnowledgeStateStore();
    let getCalls = 0;
    const trackingStore: InMemoryKnowledgeStateStore = {
      ...inner,
      async getPlacementSeeds(studentId) {
        getCalls++;
        return inner.getPlacementSeeds(studentId);
      },
    };

    await seedPlacementResultsIntoStore(
      trackingStore,
      STUDENT_A,
      makeResults(),
      { now: FIXED_NOW_MS },
    );

    expect(getCalls).toBe(0);
  });

  it('force option is a no-op (force:true and force:false are equivalent)', async () => {
    // Per resolved design, seedPlacementResultsIntoStore always upserts. The
    // { force: true } option is preserved on the type for caller compatibility
    // but is intentionally ignored by the implementation.
    const initial: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.5,
        confidence: 'low',
      }),
    ];
    const replacement: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.7,
        confidence: 'medium',
      }),
    ];

    // First upsert (no force).
    await seedPlacementResultsIntoStore(store, STUDENT_A, initial, { now: FIXED_NOW_MS });
    // Second upsert without force — must also overwrite (no guard).
    const noForce = await seedPlacementResultsIntoStore(
      store,
      STUDENT_A,
      replacement,
      { now: FIXED_NOW_MS + 5_000 },
    );
    // Third upsert with force — must produce the same observable outcome.
    const withForce = await seedPlacementResultsIntoStore(
      store,
      STUDENT_A,
      replacement,
      { now: FIXED_NOW_MS + 10_000, force: true },
    );

    expect(noForce.skipped).toBe(false);
    expect(withForce.skipped).toBe(false);
    expect(noForce.seedsWritten).toBe(withForce.seedsWritten);

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    expect(seeds).toHaveLength(1);
    expect(seeds[0]!.masteryEstimate).toBe(0.7);
  });

  it('reports seedsWritten count when the student is new', async () => {
    const results = makeResults();
    const outcome = await seedPlacementResultsIntoStore(store, STUDENT_A, results, {
      now: FIXED_NOW_MS,
    });

    expect(outcome.skipped).toBe(false);
    expect(outcome.seedsWritten).toBe(results.length);
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.f — Confidence preservation contract (low/medium only)
// ---------------------------------------------------------------------------
//
// Per anti-pattern in test strategy §4:
// "No high-confidence placement estimates — placement seeds are low/medium only;
//  never `high`."

describe('seedPlacementResultsIntoStore — confidence contract', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('persists only low/medium confidence values', async () => {
    const results = makeResults();
    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    for (const seed of seeds) {
      expect(['low', 'medium']).toContain(seed.confidence);
      expect(seed.confidence).not.toBe('high');
    }
  });

  it('every persisted seed carries source="placement" (provenance tag)', async () => {
    const results = makeResults();
    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });

    const seeds: PlacementKnowledgeStateSeed[] = await store.getPlacementSeeds(STUDENT_A);
    for (const seed of seeds) {
      expect(seed.source).toBe('placement');
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.g — Multiple placement results round-trip
// ---------------------------------------------------------------------------

describe('seedPlacementResultsIntoStore — round-trip', () => {
  it('what we write equals what we read (key/values preserved)', async () => {
    const store = createInMemoryKnowledgeStateStore();
    const results = makeResults();

    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    const byNode = new Map(seeds.map((s) => [s.nodeId, s] as const));

    for (const r of results) {
      const seed = byNode.get(r.nodeId);
      expect(seed).toBeDefined();
      expect(seed!.masteryEstimate).toBe(r.masteryEstimate);
      expect(seed!.confidence).toBe(r.confidence);
      expect(seed!.source).toBe('placement');
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.h — Pure factory + edge cases
// ---------------------------------------------------------------------------
//
// Per test strategy §4 anti-patterns, the seeding pipeline must be pure and
// must not mutate inputs. The existing tests cover the "no input mutation"
// property for makeResults() — this section adds coverage for:
//   - buildPlacementKnowledgeStateSeed returns a NEW array (not the same
//     reference) so callers can safely mutate the result
//   - the store can be created multiple times with independent state
//   - empty input is a no-op (zero seeds, but no error)
//   - calling the seed functions in a different order does not affect the
//     persisted shape (idempotency under reordering)

describe('buildPlacementKnowledgeStateSeed — pure factory semantics', () => {
  it('returns a new array, not the same reference as the input', () => {
    const results = makeResults();
    const seeds = buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    expect(seeds).not.toBe(results);
    expect(Array.isArray(seeds)).toBe(true);
  });

  it('does not deep-mutate nested fields on the input PlacementResult[]', () => {
    const results = makeResults();
    const snapshot = JSON.parse(JSON.stringify(results));

    buildPlacementKnowledgeStateSeed(results, { now: FIXED_NOW_MS });

    for (let i = 0; i < results.length; i++) {
      expect(results[i]).toEqual(snapshot[i]);
    }
  });
});

describe('createInMemoryKnowledgeStateStore — factory semantics', () => {
  it('two stores created independently do not share state', async () => {
    const storeA = createInMemoryKnowledgeStateStore();
    const storeB = createInMemoryKnowledgeStateStore();

    await seedPlacementResultsIntoStore(storeA, STUDENT_A, makeResults(), { now: FIXED_NOW_MS });

    const seedsA = await storeA.getPlacementSeeds(STUDENT_A);
    const seedsB = await storeB.getPlacementSeeds(STUDENT_A);

    expect(seedsA).toHaveLength(makeResults().length);
    expect(seedsB).toEqual([]);
    expect(storeA.size).toBeGreaterThan(0);
    expect(storeB.size).toBe(0);
  });

  it('clear() on one store does not affect another', async () => {
    const storeA = createInMemoryKnowledgeStateStore();
    const storeB = createInMemoryKnowledgeStateStore();
    await seedPlacementResultsIntoStore(storeA, STUDENT_A, makeResults(), { now: FIXED_NOW_MS });
    await seedPlacementResultsIntoStore(storeB, STUDENT_B, makeResults(), { now: FIXED_NOW_MS });

    storeA.clear();

    expect(storeA.size).toBe(0);
    expect(storeB.size).toBeGreaterThan(0);
    const seedsB = await storeB.getPlacementSeeds(STUDENT_B);
    expect(seedsB.length).toBeGreaterThan(0);
  });
});

describe('seedPlacementResultsIntoStore — edge cases', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('empty PlacementResult[] is a no-op (writes 0 seeds)', async () => {
    const outcome = await seedPlacementResultsIntoStore(store, STUDENT_A, [], {
      now: FIXED_NOW_MS,
    });

    expect(outcome.skipped).toBe(false);
    expect(outcome.seedsWritten).toBe(0);

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    expect(seeds).toEqual([]);
  });

  it('buildPlacementKnowledgeStateSeed with empty input returns an empty array', () => {
    const seeds = buildPlacementKnowledgeStateSeed([], { now: FIXED_NOW_MS });
    expect(seeds).toEqual([]);
  });

  it('re-running with the same studentId+nodeId and same now is byte-identical', async () => {
    const results = makeResults();
    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });
    const first = await store.getPlacementSeeds(STUDENT_A);
    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });
    const second = await store.getPlacementSeeds(STUDENT_A);

    expect(first).toEqual(second);
  });

  it('re-running with the same inputs in a different order produces the same final state', async () => {
    const results = makeResults();
    const reordered = [results[2]!, results[0]!, results[1]!];

    await seedPlacementResultsIntoStore(store, STUDENT_A, results, { now: FIXED_NOW_MS });
    const first = new Map(
      (await store.getPlacementSeeds(STUDENT_A)).map((s) => [s.nodeId, s] as const),
    );

    await store.clear();
    await seedPlacementResultsIntoStore(store, STUDENT_A, reordered, { now: FIXED_NOW_MS });
    const second = new Map(
      (await store.getPlacementSeeds(STUDENT_A)).map((s) => [s.nodeId, s] as const),
    );

    expect(first.size).toBe(second.size);
    for (const [nodeId, seed] of first) {
      expect(second.get(nodeId)).toEqual(seed);
    }
  });
});

// ---------------------------------------------------------------------------
// Task 3.2.i — Non-finite masteryEstimate rejection (Phase 3 Red phase)
// ---------------------------------------------------------------------------
//
// Per test strategy §3 cross-phase edge cases: "maxProbes <= 0, bounded
// traversal, and max-probe non-convergence must remain explicit." The same
// "explicit edge case" spirit applies to the seed builder's masteryEstimate
// range check. The current implementation
//
//     if (r.masteryEstimate < 0 || r.masteryEstimate > 1) { throw … }
//
// returns false for NaN (all NaN comparisons are false), so a NaN value would
// slip through and produce a corrupted seed with masteryEstimate=NaN. The
// same gap affects non-numeric values (strings, objects) that bypass the
// comparison. +Infinity and -Infinity already throw under the current check,
// but they are locked in here as regression coverage so future refactors
// cannot silently remove the rejection.
//
// Red-phase status as of 2026-06-05:
//   - "rejects NaN masteryEstimate" — FAILS in current implementation.
//   - "rejects non-numeric masteryEstimate values" — FAILS in current
//     implementation (string "0.5" slips through the range comparison).
//   - The remaining tests are regression locks (currently pass).
// The Green-phase fix belongs to a future iteration; this Red-phase test
// commit locks the contract.

describe('buildPlacementKnowledgeStateSeed — non-finite masteryEstimate rejection (Red)', () => {
  it('rejects NaN masteryEstimate (current code accepts — Red)', () => {
    const nan = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: Number.NaN,
        confidence: 'low' as const,
      },
    ];

    expect(() => buildPlacementKnowledgeStateSeed(nan, { now: FIXED_NOW_MS })).toThrowError(
      /masteryEstimate/i,
    );
  });

  it('rejects +Infinity masteryEstimate (regression lock)', () => {
    const posInf = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: Number.POSITIVE_INFINITY,
        confidence: 'low' as const,
      },
    ];

    expect(() => buildPlacementKnowledgeStateSeed(posInf, { now: FIXED_NOW_MS })).toThrowError(
      /masteryEstimate/i,
    );
  });

  it('rejects -Infinity masteryEstimate (regression lock)', () => {
    const negInf = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: Number.NEGATIVE_INFINITY,
        confidence: 'low' as const,
      },
    ];

    expect(() => buildPlacementKnowledgeStateSeed(negInf, { now: FIXED_NOW_MS })).toThrowError(
      /masteryEstimate/i,
    );
  });

  it('rejects non-numeric masteryEstimate values (current code accepts — Red)', () => {
    const stringy = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: '0.5' as unknown as number,
        confidence: 'low' as const,
      },
    ];

    expect(() => buildPlacementKnowledgeStateSeed(stringy, { now: FIXED_NOW_MS })).toThrowError(
      /masteryEstimate/i,
    );
  });

  it('accepts boundary masteryEstimate values 0 and 1 (regression lock)', () => {
    const lowerBound = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0,
        confidence: 'low' as const,
      },
    ];
    const upperBound = [
      {
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 1,
        confidence: 'low' as const,
      },
    ];

    expect(() => buildPlacementKnowledgeStateSeed(lowerBound, { now: FIXED_NOW_MS })).not.toThrow();
    expect(() => buildPlacementKnowledgeStateSeed(upperBound, { now: FIXED_NOW_MS })).not.toThrow();
  });
});
