/**
 * Phase 1 — Contract & Schema (Track 7: Practice-Variant Rename)
 *
 * FR4: Convex schema rename + data migration. The `srs_cards` table must
 * rename `problemFamilyId` to `variantKey` and the data migration must be
 * reversible so the rename can be rolled back if needed.
 *
 * This test is the Red-phase proof that the migration module does not yet
 * exist (or does not implement the rename). It is expected to fail at HEAD
 * with a missing module import, then turn Green once the migration script
 * is added in Phase 1's second task.
 *
 * Strategy: `test-strategy.md` §2 (Convex migration mock) and §7 row "P1 mig".
 * Targeted Red command:
 *   `npx vitest run apps/integrated-math-3/convex/migrations/__tests__/rename-problem-family.test.ts`
 *
 * The MemoryDb helper is in-test (per strategy) and is intentionally
 * limited to the migration's read/patch surface. It MUST NOT replace the
 * production `npx convex run` gate for live data — that gate lives in
 * Phase 3 (test-strategy.md §7 row "P3 exec").
 */
import { describe, it, expect, vi } from 'vitest';
import type { Id } from '../../_generated/dataModel';

type SrsCardRow = {
  _id: Id<'srs_cards'>;
  studentId: Id<'profiles'>;
  objectiveId: string;
  problemFamilyId: string;
  variantKey?: string;
  stability: number;
  difficulty: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  dueDate: string;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview?: string;
  createdAt: number;
  updatedAt: number;
};

/**
 * Tiny in-test fake that replays `srs_cards` rows through the migration.
 * This is a fake harness for migration plumbing only — it does NOT cover
 * the production `npx convex run` gate. The live gate is owned by the P3
 * task `Execute and verify the Convex data migration on existing card data`.
 */
function makeMemoryDb(initial: SrsCardRow[]) {
  const rows: SrsCardRow[] = initial.map((row) => ({ ...row }));
  const patches: Record<string, Partial<SrsCardRow>> = {};

  return {
    query: vi.fn((table: string) => {
      if (table !== 'srs_cards') {
        throw new Error(`MemoryDb: unexpected table ${table}`);
      }
      return {
        collect: vi.fn(async () => [...rows]),
      };
    }),
    patch: vi.fn(async (id: Id<'srs_cards'>, updates: Partial<SrsCardRow>) => {
      const idx = rows.findIndex((r) => r._id === id);
      if (idx === -1) {
        throw new Error(`MemoryDb: row ${id} not found`);
      }
      rows[idx] = { ...rows[idx], ...updates };
      patches[id] = { ...(patches[id] ?? {}), ...updates };
    }),
    _rows: rows,
    _patches: patches,
  };
}

const SAMPLE_CARDS: SrsCardRow[] = [
  {
    _id: 'srs_cards_1' as Id<'srs_cards'>,
    studentId: 'profiles_1' as Id<'profiles'>,
    objectiveId: 'obj-ccss-hsa-rei-b4',
    problemFamilyId: 'family:graphing-explorer:quadratic-transformations',
    stability: 1.2,
    difficulty: 5.0,
    state: 'review',
    dueDate: '2026-06-21T00:00:00.000Z',
    elapsedDays: 3,
    scheduledDays: 5,
    reps: 4,
    lapses: 1,
    lastReview: '2026-06-18T00:00:00.000Z',
    createdAt: 1_700_000_000_000,
    updatedAt: 1_700_000_000_000,
  },
  {
    _id: 'srs_cards_2' as Id<'srs_cards'>,
    studentId: 'profiles_1' as Id<'profiles'>,
    objectiveId: 'obj-ccss-hsa-sse-a1',
    problemFamilyId: 'family:step-by-step-solver:linear-equations',
    stability: 2.0,
    difficulty: 4.0,
    state: 'learning',
    dueDate: '2026-06-20T00:00:00.000Z',
    elapsedDays: 1,
    scheduledDays: 1,
    reps: 2,
    lapses: 0,
    createdAt: 1_700_000_001_000,
    updatedAt: 1_700_000_001_000,
  },
];

describe('renameProblemFamilyToVariantKey (migrate)', () => {
  it('renames problemFamilyId to variantKey on every srs_cards row', async () => {
    const { renameProblemFamilyToVariantKey } = await import(
      '../rename-problem-family'
    );
    const db = makeMemoryDb(SAMPLE_CARDS);

    await renameProblemFamilyToVariantKey(db as unknown as never);

    const updated = db._rows;
    expect(updated).toHaveLength(2);
    for (const row of updated) {
      expect(row.variantKey).toBeDefined();
      // Round-trip property from test-strategy.md §3: every post-migration
      // row's variantKey equals the original problemFamilyId value.
      expect(row.variantKey).toBe(row.problemFamilyId);
    }
  });

  it('preserves the original problemFamilyId field during the migration', async () => {
    const { renameProblemFamilyToVariantKey } = await import(
      '../rename-problem-family'
    );
    const db = makeMemoryDb(SAMPLE_CARDS);
    const before = SAMPLE_CARDS.map((c) => c.problemFamilyId);

    await renameProblemFamilyToVariantKey(db as unknown as never);

    const after = db._rows.map((c) => c.problemFamilyId);
    expect(after).toEqual(before);
  });

  it('queries only the srs_cards table (no other tables touched)', async () => {
    const { renameProblemFamilyToVariantKey } = await import(
      '../rename-problem-family'
    );
    const db = makeMemoryDb(SAMPLE_CARDS);

    await renameProblemFamilyToVariantKey(db as unknown as never);

    expect(db.query).toHaveBeenCalledWith('srs_cards');
    expect(db.query).toHaveBeenCalledTimes(1);
  });
});

describe('renameProblemFamilyToVariantKey (rollback)', () => {
  it('restores problemFamilyId from variantKey on every row', async () => {
    const { renameProblemFamilyToVariantKey } = await import(
      '../rename-problem-family'
    );
    const migrated = SAMPLE_CARDS.map((row) => ({
      ...row,
      variantKey: row.problemFamilyId,
    }));
    const db = makeMemoryDb(migrated);

    await renameProblemFamilyToVariantKey.rollback(db as unknown as never);

    const after = db._rows;
    for (const row of after) {
      expect(row.problemFamilyId).toBeDefined();
      // Inverse round-trip: post-rollback problemFamilyId equals the
      // original variantKey value.
      expect(row.problemFamilyId).toBe(row.variantKey);
    }
  });
});
