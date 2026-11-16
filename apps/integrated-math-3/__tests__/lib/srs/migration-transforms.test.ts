import { describe, expect, it } from 'vitest';
import {
  planCardMigrationBatch,
  transformLegacyCard,
  verifyCardMigrationBatch,
} from '@/lib/srs/migration-transforms';

const legacyCard = {
  id: 'card-a',
  problemFamilyId: 'linear.solve.v1',
  createdAt: 1_700_000_000_000,
};

describe('transformLegacyCard', () => {
  it('widens an old-only document without overwriting its learner history', () => {
    expect(transformLegacyCard(legacyCard)).toEqual({
      variantKey: 'linear.solve.v1',
      legacyProblemFamilyId: 'linear.solve.v1',
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 1_700_000_000_000,
    });
  });

  it('is idempotent for an already migrated card', () => {
    expect(transformLegacyCard({
      ...legacyCard,
      variantKey: 'linear.solve.v1',
      legacyProblemFamilyId: 'linear.solve.v1',
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 1_700_000_000_000,
    })).toBeNull();
  });

  it('rejects contradictory mixed documents instead of choosing one identity', () => {
    expect(() => transformLegacyCard({
      ...legacyCard,
      variantKey: 'quadratic.graph.v1',
    })).toThrow('contradictory variant identity');
  });

  it('rejects malformed legacy identities before a batch can persist them', () => {
    expect(() => transformLegacyCard({
      ...legacyCard,
      problemFamilyId: ' linear.solve.v1 ',
    })).toThrow('must be non-blank');
  });
});

describe('planCardMigrationBatch', () => {
  it('supports a dry run without mutating caller-owned rows', () => {
    const cards = [legacyCard];
    const result = planCardMigrationBatch(cards, { batchSize: 1, dryRun: true });

    expect(result).toMatchObject({
      processed: 1,
      changed: 1,
      dryRun: true,
      nextCursor: null,
    });
    expect(cards).toEqual([legacyCard]);
    expect(result.patches).toHaveLength(1);
  });

  it('is resumable from a cursor and does not produce duplicate patches', () => {
    const cards = [
      legacyCard,
      { id: 'card-b', problemFamilyId: 'quadratic.graph.v1', createdAt: 1_700_000_000_001 },
    ];

    const first = planCardMigrationBatch(cards, { batchSize: 1 });
    const second = planCardMigrationBatch(cards, { batchSize: 1, cursor: first.nextCursor });

    expect(first.patches.map((patch) => patch.id)).toEqual(['card-a']);
    expect(second.patches.map((patch) => patch.id)).toEqual(['card-b']);
    expect(second.nextCursor).toBeNull();
  });

  it('includes a document created after a prior batch when resuming', () => {
    const alreadyMigrated = {
      id: 'card-existing',
      variantKey: 'existing.card.v1',
      legacyProblemFamilyId: 'existing.card.v1',
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 1_700_000_000_001,
      createdAt: 1_700_000_000_001,
    };
    const first = planCardMigrationBatch([legacyCard, alreadyMigrated], { batchSize: 1 });
    const withConcurrentInsert = [
      legacyCard,
      alreadyMigrated,
      { id: 'card-new', problemFamilyId: 'new.card.v1', createdAt: 1_700_000_000_002 },
    ];

    const resumed = planCardMigrationBatch(withConcurrentInsert, {
      batchSize: 2,
      cursor: first.nextCursor,
    });

    expect(resumed.patches.map((patch) => patch.id)).toEqual(['card-new']);
  });
});

describe('verifyCardMigrationBatch', () => {
  it('reports unmigrated and contradictory documents without treating them as complete', () => {
    expect(verifyCardMigrationBatch([
      legacyCard,
      { ...legacyCard, id: 'card-b', variantKey: 'different.v1' },
    ])).toEqual({
      complete: false,
      unmigratedIds: ['card-a'],
      conflictingIds: ['card-b'],
    });
  });

  it('reports complete only after every inspected document has the canonical shape', () => {
    expect(verifyCardMigrationBatch([{
      ...legacyCard,
      variantKey: 'linear.solve.v1',
      legacyProblemFamilyId: 'linear.solve.v1',
      migrationVersion: 'kst-srs.v3.2',
      sourceTimestamp: 1_700_000_000_000,
    }])).toEqual({
      complete: true,
      unmigratedIds: [],
      conflictingIds: [],
    });
  });
});
