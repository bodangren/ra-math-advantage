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
// Task 3.2.e — Returning-student guard
// ---------------------------------------------------------------------------
//
// Per test strategy §3: "Knowledge-state already populated → Skip placement
// for returning students."
//
// seedPlacementResultsIntoStore must expose a skip flag (or
// invocation of an existence check) so the caller can decide whether to
// run placement at all. The minimum surface area: if the student already
// has seeds, the function should report and (by default) not overwrite.

describe('seedPlacementResultsIntoStore — returning-student guard', () => {
  let store: InMemoryKnowledgeStateStore;

  beforeEach(() => {
    store = createInMemoryKnowledgeStateStore();
  });

  it('skips re-seeding by default when the student already has placement seeds', async () => {
    const initial: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.3,
        confidence: 'low',
      }),
    ];
    const wouldOverwrite: PlacementResult[] = [
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
      wouldOverwrite,
      { now: FIXED_NOW_MS + 10_000 },
    );

    expect(outcome.skipped).toBe(true);
    expect(outcome.reason).toBe('already-placed');

    const seeds = await store.getPlacementSeeds(STUDENT_A);
    expect(seeds[0]!.masteryEstimate).toBe(0.3);
  });

  it('allows force-reseed when { force: true } is passed', async () => {
    const initial = makeResults();
    await seedPlacementResultsIntoStore(store, STUDENT_A, initial, { now: FIXED_NOW_MS });

    const replacement: PlacementResult[] = [
      createMockIm3PlacementResult({
        nodeId: 'math.im3.skill.1.1.graph-quadratic-functions',
        masteryEstimate: 0.95,
        confidence: 'medium',
      }),
    ];
    const outcome = await seedPlacementResultsIntoStore(
      store,
      STUDENT_A,
      replacement,
      { now: FIXED_NOW_MS + 10_000, force: true },
    );

    expect(outcome.skipped).toBe(false);
    const seeds = await store.getPlacementSeeds(STUDENT_A);
    // Existing seeds are upserted, not wiped; replacement overrides the one shared nodeId.
    const updated = seeds.find(
      (s) => s.nodeId === 'math.im3.skill.1.1.graph-quadratic-functions',
    );
    expect(updated?.masteryEstimate).toBe(0.95);
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
