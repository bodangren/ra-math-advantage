import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  amendObservation,
  createObservationDraft,
  discardObservationDraft,
  listMyObservationDrafts,
  readObservationDraft,
  readPublishedObservation,
  readRankedTeacherQueue,
  saveObservationDraft,
  submitObservation,
} from '../../convex/observations';
import { buildDanielsonGraph } from '../../lib/proficiency/graph';
import {
  COMPONENT_1E,
  OBSERVATION_NOW,
  OBSERVATION_NOW_MS,
  OBSERVER_ACCOUNT_ID,
  ORGANIZATION_A,
  TEACHER_PROFILE_ID,
  priority,
} from '../observations/fixtures';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>> = (
  ctx: { db: MemoryDb },
  args: TArgs,
) => Promise<TResult>;

function handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>>(
  value: unknown,
): Handler<TArgs, TResult> {
  return (value as { _handler: Handler<TArgs, TResult> })._handler;
}

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string): StoredDocument[] {
    return [...this.table(table).values()];
  }

  allRows(): StoredDocument[] {
    return [...this.tables.values()].flatMap((table) => [...table.values()]);
  }

  async get(id: unknown) {
    if (typeof id !== 'string') return null;
    for (const table of this.tables.values()) {
      const document = table.get(id);
      if (document) return document;
    }
    return null;
  }

  normalizeId(table: string, id: string) {
    return this.table(table).has(id) ? id : null;
  }

  async insert(table: string, document: Record<string, unknown>) {
    const id = `${table}:${++this.sequence}`;
    this.seed(table, id, document);
    return id;
  }

  async patch(id: string, patch: Record<string, unknown>) {
    for (const table of this.tables.values()) {
      const document = table.get(id);
      if (document) {
        table.set(id, { ...document, ...patch });
        return;
      }
    }
    throw new Error(`Missing document ${id}`);
  }

  async delete(id: string) {
    for (const table of this.tables.values()) {
      if (table.delete(id)) return;
    }
    throw new Error(`Missing document ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
    let descending = false;
    const query = {
      withIndex: (
        _name: string,
        configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        const equalities: Array<[string, unknown]> = [];
        const builder = {
          eq: (field: string, value: unknown) => {
            equalities.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((document) => (
          equalities.every(([field, value]) => document[field] === value)
        ));
        return query;
      },
      order: (direction: 'asc' | 'desc') => {
        descending = direction === 'desc';
        return query;
      },
      unique: async () => {
        if (matches.length > 1) throw new Error(`Expected one ${tableName} row`);
        return matches[0] ?? null;
      },
      take: async (count: number) => {
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered.slice(0, count);
      },
      paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
        const start = cursor === null ? 0 : Number(cursor);
        const ordered = descending ? [...matches].reverse() : matches;
        const page = ordered.slice(start, start + numItems);
        const next = start + page.length;
        return {
          page,
          isDone: next >= ordered.length,
          continueCursor: next >= ordered.length ? '' : String(next),
        };
      },
    };
    return query;
  }

  context() {
    return { db: this };
  }

  private table(table: string) {
    let rows = this.tables.get(table);
    if (!rows) {
      rows = new Map();
      this.tables.set(table, rows);
    }
    return rows;
  }
}

const SECOND_OBSERVER = 'accounts:second-observer';

function seedFoundation(db: MemoryDb) {
  db.seed('organizations', ORGANIZATION_A, {
    slug: 'school-a',
    name: 'School A',
    isActive: true,
  });
  db.seed('accounts', OBSERVER_ACCOUNT_ID, {
    organizationId: ORGANIZATION_A,
    username: 'observer',
    displayName: 'Observer',
    sharedSessionRole: 'admin',
    isActive: true,
  });
  db.seed('accounts', SECOND_OBSERVER, {
    organizationId: ORGANIZATION_A,
    username: 'second-observer',
    displayName: 'Second Observer',
    sharedSessionRole: 'admin',
    isActive: true,
  });
  db.seed('accounts', 'accounts:teacher', {
    organizationId: ORGANIZATION_A,
    username: 'teacher',
    displayName: 'Teacher One',
    sharedSessionRole: 'teacher',
    isActive: true,
  });
  db.seed('teacher_profiles', TEACHER_PROFILE_ID, {
    organizationId: ORGANIZATION_A,
    accountId: 'accounts:teacher',
    isActive: true,
  });
  for (const accountId of [OBSERVER_ACCOUNT_ID, SECOND_OBSERVER]) {
    db.seed('role_assignments', `role_assignments:${accountId}:school-head`, {
      organizationId: ORGANIZATION_A,
      accountId,
      role: 'school_head',
      status: 'active',
    });
  }
}

function track2ScoringSnapshot(db: MemoryDb) {
  return {
    cards: structuredClone(db.rows('teacher_srs_cards')),
    proficiency: structuredClone(db.rows('teacher_proficiency')),
    reviews: structuredClone(db.rows('teacher_srs_reviews')),
    knowledgeState: structuredClone(db.rows('teacher_knowledge_state')),
    priority: structuredClone(db.rows('teacher_priority')),
  };
}

function expectKind<T extends Record<string, unknown>>(result: T, kind: string): T {
  expect(result).toMatchObject({ kind });
  if (result.kind !== kind) throw new Error(`Expected ${kind}`);
  return result;
}

async function createDraft(
  db: MemoryDb,
  input: {
    actorAccountId?: string;
    observationType?: 'walkthrough' | 'formal_q1' | 'formal_q4';
    schoolYear?: string;
    observedAt?: string;
  } = {},
) {
  const create = handler(createObservationDraft);
  return create(db.context(), {
    actorAccountId: input.actorAccountId ?? OBSERVER_ACCOUNT_ID,
    teacherProfileId: TEACHER_PROFILE_ID,
    observationType: input.observationType ?? 'walkthrough',
    schoolYear: input.schoolYear ?? '2026-2027',
    observedAt: input.observedAt ?? '2026-09-15T07:45:00.000Z',
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    ...(input.observationType && input.observationType !== 'walkthrough'
      ? { componentIds: [COMPONENT_1E] }
      : {}),
    now: OBSERVATION_NOW_MS,
  });
}

async function completeDraft(
  db: MemoryDb,
  draft: Record<string, unknown>,
  outcomes: 'all_ne' | 'first_rated',
) {
  const save = handler(saveObservationDraft);
  const items = draft.items as Array<Record<string, unknown>>;
  return save(db.context(), {
    actorAccountId: OBSERVER_ACCOUNT_ID,
    draftId: draft.draftId,
    expectedRevision: draft.revision,
    items: items.map((item, index) => ({
      itemId: item.itemId,
      outcome: outcomes === 'first_rated' && index === 0
        ? { kind: 'rated', rating: 2 }
        : { kind: 'not_enough_evidence' },
      evidenceNote: index === 0 ? 'Observed evidence.' : null,
    })),
    now: OBSERVATION_NOW_MS + 1_000,
  });
}

async function completeDraftWithFirstRating(
  db: MemoryDb,
  draft: Record<string, unknown>,
  rating: 1 | 2 | 3 | 4,
) {
  const save = handler(saveObservationDraft);
  const items = draft.items as Array<Record<string, unknown>>;
  return save(db.context(), {
    actorAccountId: OBSERVER_ACCOUNT_ID,
    draftId: draft.draftId,
    expectedRevision: draft.revision,
    items: items.map((item, index) => ({
      itemId: item.itemId,
      outcome: index === 0
        ? { kind: 'rated', rating }
        : { kind: 'not_enough_evidence' },
      evidenceNote: null,
    })),
    now: OBSERVATION_NOW_MS + 1_000,
  });
}

async function createCompletedDraft(
  db: MemoryDb,
  outcomes: 'all_ne' | 'first_rated',
  input: Parameters<typeof createDraft>[1] = {},
) {
  const created = expectKind(await createDraft(db, input), 'created');
  const saved = expectKind(
    await completeDraft(db, created.draft as Record<string, unknown>, outcomes),
    'saved',
  );
  return saved.draft as Record<string, unknown>;
}

async function submitRatedWalkthrough(input: {
  db: MemoryDb;
  submissionKey: string;
  rating: 1 | 2 | 3 | 4;
  observedAt: string;
  now: number;
}) {
  const created = expectKind(await createDraft(input.db, { observedAt: input.observedAt }), 'created');
  const saved = expectKind(await completeDraftWithFirstRating(
    input.db,
    created.draft as Record<string, unknown>,
    input.rating,
  ), 'saved');
  const submit = handler(submitObservation);
  return expectKind(await submit(input.db.context(), {
    actorAccountId: OBSERVER_ACCOUNT_ID,
    draftId: (saved.draft as Record<string, unknown>).draftId,
    expectedRevision: (saved.draft as Record<string, unknown>).revision,
    submissionKey: input.submissionKey,
    now: input.now,
  }), 'submitted');
}

function firstSubmittedItem(result: Record<string, unknown>) {
  return (result.record as { items: Array<Record<string, unknown>> }).items[0];
}

function effectiveReviewTimeline(
  rows: StoredDocument[],
  supersessions: StoredDocument[] = [],
) {
  const supersededEvidenceKeys = new Set(
    supersessions.map((row) => String(row.supersededEvidenceKey)),
  );
  const latest = new Map<string, StoredDocument>();
  for (const row of [...rows].sort((left, right) => left._creationTime - right._creationTime)) {
    const logicalReviewId = String(row.logicalReviewId ?? row.reviewId);
    const isSuperseded = [...supersededEvidenceKeys].some((evidenceKey) => (
      logicalReviewId.startsWith(`teacher_srs_reviews:${evidenceKey}:`)
    ));
    if (!isSuperseded) latest.set(logicalReviewId, row);
  }
  return [...latest.values()]
    .map((row) => {
      const review = row.review as Record<string, unknown>;
      return {
        reviewedAt: review.reviewedAt,
        rating: review.rating,
        stateBefore: review.stateBefore,
        stateAfter: review.stateAfter,
      };
    })
    .sort((left, right) => String(left.reviewedAt).localeCompare(String(right.reviewedAt)));
}

describe('Danielson observation Convex boundary', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('denies a missing actor and a draft-owner mismatch before any write', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const beforeMissingActor = db.allRows().length;
    expectKind(await createDraft(db, { actorAccountId: 'accounts:missing' }), 'denied');
    expect(db.allRows()).toHaveLength(beforeMissingActor);

    const created = expectKind(await createDraft(db), 'created');
    const beforeMismatch = structuredClone(db.allRows());
    const save = handler(saveObservationDraft);
    const result = await save(db.context(), {
      actorAccountId: SECOND_OBSERVER,
      draftId: (created.draft as Record<string, unknown>).draftId,
      expectedRevision: (created.draft as Record<string, unknown>).revision,
      items: [],
      now: OBSERVATION_NOW_MS + 1,
    });

    expect(result).toMatchObject({ kind: 'denied', reason: 'target_out_of_scope' });
    expect(db.allRows()).toEqual(beforeMismatch);
  });

  it('keeps a draft private from Track 2 and submits an all-no-evidence visit without scoring writes', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const draft = await createCompletedDraft(db, 'all_ne');
    expect(track2ScoringSnapshot(db)).toEqual({
      cards: [], proficiency: [], reviews: [], knowledgeState: [], priority: [],
    });

    const submit = handler(submitObservation);
    const result = expectKind(await submit(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      submissionKey: 'all-ne-submission',
      now: OBSERVATION_NOW_MS + 2_000,
    }), 'submitted');
    const receipt = result.receipt as Record<string, unknown>;

    expect(await db.get(receipt.observationId)).toMatchObject({
      status: 'submitted',
      submittedAt: OBSERVATION_NOW_MS + 2_000,
      publishedAt: OBSERVATION_NOW_MS + 2_000,
    });
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(3);
    expect(track2ScoringSnapshot(db)).toEqual({
      cards: [], proficiency: [], reviews: [], knowledgeState: [], priority: [],
    });
  });

  it('returns the first receipt on equal submission replay and conflicts before a changed write', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submit = handler(submitObservation);
    const firstDraft = await createCompletedDraft(db, 'all_ne');
    const args = {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: firstDraft.draftId,
      expectedRevision: firstDraft.revision,
      submissionKey: 'replayed-submission',
      now: OBSERVATION_NOW_MS + 2_000,
    };
    const first = expectKind(await submit(db.context(), args), 'submitted');
    const beforeReplay = structuredClone(db.allRows());
    expect(await submit(db.context(), args)).toEqual({ ...first, kind: 'replayed' });
    expect(db.allRows()).toEqual(beforeReplay);

    const changedDraft = await createCompletedDraft(db, 'first_rated');
    const beforeConflict = structuredClone(db.allRows());
    expectKind(await submit(db.context(), {
      ...args,
      draftId: changedDraft.draftId,
      expectedRevision: changedDraft.revision,
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'idempotency_conflict');
    expect(db.allRows()).toEqual(beforeConflict);
  });

  it('rejects a draft save after submission and keeps the submitted row byte-immutable', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submit = handler(submitObservation);
    const save = handler(saveObservationDraft);
    const draft = await createCompletedDraft(db, 'all_ne');
    const submitted = expectKind(await submit(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      submissionKey: 'immutable-submission',
      now: OBSERVATION_NOW_MS + 2_000,
    }), 'submitted');
    const observationId = (submitted.receipt as Record<string, unknown>).observationId;
    const before = structuredClone(await db.get(observationId));

    expectKind(await save(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      items: [],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'submitted_immutable');
    expect(await db.get(observationId)).toEqual(before);
  });

  it('reads and discards only the owner draft with the current revision', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const created = expectKind(await createDraft(db), 'created');
    const draft = created.draft as Record<string, unknown>;
    const read = handler(readObservationDraft);
    const discard = handler(discardObservationDraft);

    expectKind(await read(db.context(), {
      actorAccountId: SECOND_OBSERVER,
      draftId: draft.draftId,
    }), 'denied');
    expectKind(await discard(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: Number(draft.revision) + 1,
      confirmed: true,
    }), 'revision_conflict');
    expectKind(await read(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
    }), 'allowed');
    expectKind(await discard(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      confirmed: true,
    }), 'discarded');
    expect(await db.get(draft.draftId)).toBeNull();
  });

  it('rejects a stale submission revision before evidence writes', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const draft = await createCompletedDraft(db, 'all_ne');
    const before = structuredClone(db.allRows());

    expectKind(await handler(submitObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: Number(draft.revision) - 1,
      submissionKey: 'stale-revision',
      now: OBSERVATION_NOW_MS + 2_000,
    }), 'revision_conflict');
    expect(db.allRows()).toEqual(before);
  });

  it('lets the teacher read a published record but never a draft', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    db.seed('role_assignments', 'role_assignments:teacher', {
      organizationId: ORGANIZATION_A,
      accountId: 'accounts:teacher',
      role: 'teacher',
      status: 'active',
    });
    const draft = await createCompletedDraft(db, 'all_ne');
    const read = handler(readPublishedObservation);
    expectKind(await read(db.context(), {
      actorAccountId: 'accounts:teacher',
      observationId: draft.draftId,
    }), 'not_found');

    const submitted = expectKind(await handler(submitObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      submissionKey: 'teacher-visible-record',
      now: OBSERVATION_NOW_MS + 2_000,
    }), 'submitted');
    expectKind(await read(db.context(), {
      actorAccountId: 'accounts:teacher',
      observationId: (submitted.receipt as Record<string, unknown>).observationId,
    }), 'allowed');
  });

  it('preserves the original during a scoring amendment and rebuilds one effective review', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submit = handler(submitObservation);
    const amend = handler(amendObservation);
    const draft = await createCompletedDraft(db, 'first_rated');
    const submitted = expectKind(await submit(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      submissionKey: 'rated-submission',
      now: OBSERVATION_NOW_MS + 2_000,
    }), 'submitted');
    const receipt = submitted.receipt as Record<string, unknown>;
    const observationId = receipt.observationId;
    const original = structuredClone(await db.get(observationId));
    const firstItem = (submitted.record as { items: Array<Record<string, unknown>> }).items[0];

    expectKind(await amend(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId,
      idempotencyKey: 'rating-amendment',
      expectedVersion: 0,
      reason: 'Correct the rating.',
      changedItems: [{ itemId: firstItem.itemId, outcome: { kind: 'rated', rating: 4 } }],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'amended');

    expect(await db.get(observationId)).toEqual(original);
    expect(db.rows('teacher_srs_cards')).toEqual([
      expect.objectContaining({ card: expect.objectContaining({ reps: 1 }) }),
    ]);
    expect(db.rows('teacher_proficiency')).toEqual([
      expect.objectContaining({ projection: expect.objectContaining({ rawRating: 4 }) }),
    ]);
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(4);
    expect(db.rows('teacher_evidence_supersessions')).toHaveLength(1);
    expect(db.rows('teacher_srs_reviews').length).toBeGreaterThanOrEqual(1);
  });

  it('rejects one amendment idempotency key reused for another observation', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const amend = handler(amendObservation);
    const first = await submitRatedWalkthrough({
      db,
      submissionKey: 'first-for-shared-amendment-key',
      rating: 2,
      observedAt: '2026-09-10T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const second = await submitRatedWalkthrough({
      db,
      submissionKey: 'second-for-shared-amendment-key',
      rating: 2,
      observedAt: '2026-09-11T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 3_000,
    });
    const firstItem = firstSubmittedItem(first);
    const secondItem = firstSubmittedItem(second);
    const command = {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      idempotencyKey: 'one-amendment-command',
      expectedVersion: 0,
      reason: 'Correct the rating.',
      now: OBSERVATION_NOW_MS + 4_000,
    };
    expectKind(await amend(db.context(), {
      ...command,
      observationId: (first.receipt as Record<string, unknown>).observationId,
      changedItems: [{ itemId: firstItem.itemId, outcome: { kind: 'rated', rating: 3 } }],
    }), 'amended');
    const before = structuredClone(db.allRows());

    expectKind(await amend(db.context(), {
      ...command,
      observationId: (second.receipt as Record<string, unknown>).observationId,
      changedItems: [{ itemId: secondItem.itemId, outcome: { kind: 'rated', rating: 4 } }],
    }), 'idempotency_conflict');
    expect(db.allRows()).toEqual(before);
  });

  it('removes stale scoring state when an amendment changes rated evidence to no evidence', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const amend = handler(amendObservation);
    const submitted = await submitRatedWalkthrough({
      db,
      submissionKey: 'rated-to-ne',
      rating: 2,
      observedAt: '2026-09-10T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const item = firstSubmittedItem(submitted);
    const skillId = String(item.skillId);

    expectKind(await amend(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId: (submitted.receipt as Record<string, unknown>).observationId,
      idempotencyKey: 'rated-to-ne-amendment',
      expectedVersion: 0,
      reason: 'The visit did not contain enough evidence.',
      changedItems: [{ itemId: item.itemId, outcome: { kind: 'not_enough_evidence' } }],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'amended');

    expect(db.rows('teacher_srs_cards').filter((row) => row.skillId === skillId)).toEqual([]);
    expect(db.rows('teacher_proficiency').filter((row) => row.skillId === skillId)).toEqual([]);
    expect(db.rows('teacher_knowledge_state').filter((row) => row.nodeId === skillId)).toEqual([]);
    expect(db.rows('teacher_priority').filter((row) => row.skillId === skillId)).toEqual([
      expect.objectContaining({
        projection: expect.objectContaining({
          skillId,
          due: true,
          evidenceGaps: ['no_valid_rated_evidence'],
        }),
      }),
    ]);
    const summary = db.rows('teacher_attention_summaries').find(
      (row) => row.teacherProfileId === TEACHER_PROFILE_ID,
    );
    const target = (summary?.targets as Array<Record<string, unknown>> | undefined)
      ?.find((candidate) => candidate.skillId === skillId);
    expect(target).toMatchObject({
      skillId,
      due: true,
      evidenceGaps: ['no_valid_rated_evidence'],
    });
    expect(db.rows('teacher_srs_reviews')).toHaveLength(1);
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(4);
    expect(db.rows('teacher_evidence_supersessions')).toHaveLength(1);
  });

  it('creates one effective review when an amendment changes no evidence to rated evidence', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const amend = handler(amendObservation);
    const draft = await createCompletedDraft(db, 'all_ne');
    const submit = handler(submitObservation);
    const submitted = expectKind(await submit(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      submissionKey: 'ne-to-rated',
      now: OBSERVATION_NOW_MS + 2_000,
    }), 'submitted');
    const item = firstSubmittedItem(submitted);
    const skillId = String(item.skillId);
    expect(db.rows('teacher_srs_reviews')).toEqual([]);

    expectKind(await amend(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId: (submitted.receipt as Record<string, unknown>).observationId,
      idempotencyKey: 'ne-to-rated-amendment',
      expectedVersion: 0,
      reason: 'The recorded evidence supports a rating.',
      changedItems: [{ itemId: item.itemId, outcome: { kind: 'rated', rating: 3 } }],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'amended');

    expect(db.rows('teacher_srs_cards')).toEqual([
      expect.objectContaining({ skillId, card: expect.objectContaining({ reps: 1 }) }),
    ]);
    expect(db.rows('teacher_proficiency')).toEqual([
      expect.objectContaining({ skillId, projection: expect.objectContaining({ rawRating: 3 }) }),
    ]);
    expect(effectiveReviewTimeline(
      db.rows('teacher_srs_reviews'),
      db.rows('teacher_evidence_supersessions'),
    )).toHaveLength(1);
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(4);
    expect(db.rows('teacher_evidence_supersessions')).toHaveLength(1);
  });

  it('keeps only the latest replacement effective after two amendments to one item', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const amend = handler(amendObservation);
    const submitted = await submitRatedWalkthrough({
      db,
      submissionKey: 'two-amendments',
      rating: 2,
      observedAt: '2026-09-10T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const item = firstSubmittedItem(submitted);
    const observationId = (submitted.receipt as Record<string, unknown>).observationId;

    expectKind(await amend(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId,
      idempotencyKey: 'first-replacement',
      expectedVersion: 0,
      reason: 'First correction.',
      changedItems: [{ itemId: item.itemId, outcome: { kind: 'rated', rating: 3 } }],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'amended');
    expectKind(await amend(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId,
      idempotencyKey: 'second-replacement',
      expectedVersion: 1,
      reason: 'Final correction.',
      changedItems: [{ itemId: item.itemId, outcome: { kind: 'rated', rating: 4 } }],
      now: OBSERVATION_NOW_MS + 4_000,
    }), 'amended');

    expect(db.rows('teacher_srs_cards')).toEqual([
      expect.objectContaining({ card: expect.objectContaining({ reps: 1 }) }),
    ]);
    expect(db.rows('teacher_proficiency')).toEqual([
      expect.objectContaining({ projection: expect.objectContaining({ rawRating: 4 }) }),
    ]);
    expect(effectiveReviewTimeline(
      db.rows('teacher_srs_reviews'),
      db.rows('teacher_evidence_supersessions'),
    )).toHaveLength(1);
    const supersessions = db.rows('teacher_evidence_supersessions');
    expect(supersessions).toHaveLength(2);
    expect(supersessions[1].supersededEvidenceKey).toBe(supersessions[0].replacementEvidenceKey);
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(5);
  });

  it('rebuilds a later transition after an early-event amendment to clean-replay equivalence', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const amend = handler(amendObservation);
    const early = await submitRatedWalkthrough({
      db,
      submissionKey: 'early-observation',
      rating: 2,
      observedAt: '2026-09-10T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const later = await submitRatedWalkthrough({
      db,
      submissionKey: 'later-observation',
      rating: 4,
      observedAt: '2026-09-14T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 3_000,
    });
    const earlyItem = firstSubmittedItem(early);
    const skillId = String(earlyItem.skillId);
    expect(firstSubmittedItem(later).skillId).toBe(skillId);
    const originalOutcomes = structuredClone(db.rows('teacher_observation_outcomes'));
    const originalReviews = structuredClone(db.rows('teacher_srs_reviews'));

    expectKind(await amend(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId: (early.receipt as Record<string, unknown>).observationId,
      idempotencyKey: 'early-event-amendment',
      expectedVersion: 0,
      reason: 'Correct the earlier rating.',
      changedItems: [{ itemId: earlyItem.itemId, outcome: { kind: 'rated', rating: 1 } }],
      now: OBSERVATION_NOW_MS + 4_000,
    }), 'amended');

    for (const outcome of originalOutcomes) expect(db.rows('teacher_observation_outcomes')).toContainEqual(outcome);
    for (const review of originalReviews) expect(db.rows('teacher_srs_reviews')).toContainEqual(review);

    const cleanDb = new MemoryDb();
    seedFoundation(cleanDb);
    await submitRatedWalkthrough({
      db: cleanDb,
      submissionKey: 'clean-early-observation',
      rating: 1,
      observedAt: '2026-09-10T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    await submitRatedWalkthrough({
      db: cleanDb,
      submissionKey: 'clean-later-observation',
      rating: 4,
      observedAt: '2026-09-14T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 3_000,
    });

    const amendedCard = db.rows('teacher_srs_cards').find((row) => row.skillId === skillId)?.card;
    const cleanCard = cleanDb.rows('teacher_srs_cards').find((row) => row.skillId === skillId)?.card;
    expect(amendedCard).toEqual(cleanCard);
    expect(effectiveReviewTimeline(
      db.rows('teacher_srs_reviews'),
      db.rows('teacher_evidence_supersessions'),
    ))
      .toEqual(effectiveReviewTimeline(cleanDb.rows('teacher_srs_reviews')));
    expect(db.rows('teacher_proficiency').find((row) => row.skillId === skillId)?.projection)
      .toMatchObject({ rawRating: 4, occurredAt: '2026-09-14T08:00:00.000Z' });
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(7);
    expect(db.rows('teacher_evidence_supersessions')).toHaveLength(1);
  });

  it('uses the amendment key for two correction revisions created in the same millisecond', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const early = await submitRatedWalkthrough({
      db,
      submissionKey: 'same-time-early',
      rating: 2,
      observedAt: '2026-09-10T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    await submitRatedWalkthrough({
      db,
      submissionKey: 'same-time-later',
      rating: 4,
      observedAt: '2026-09-14T08:00:00.000Z',
      now: OBSERVATION_NOW_MS + 3_000,
    });
    const earlyItem = firstSubmittedItem(early);
    const observationId = (early.record as Record<string, unknown>).observationId;
    const sameNow = OBSERVATION_NOW_MS + 4_000;
    for (const [index, idempotencyKey, rating] of [
      [0, 'same-time-correction-one', 1],
      [1, 'same-time-correction-two', 3],
    ] as const) {
      expectKind(await handler(amendObservation)(db.context(), {
        actorAccountId: OBSERVER_ACCOUNT_ID,
        observationId,
        idempotencyKey,
        expectedVersion: index,
        reason: `Correction ${index + 1}.`,
        changedItems: [{ itemId: earlyItem.itemId, outcome: { kind: 'rated', rating } }],
        now: sameNow,
      }), 'amended');
    }

    const laterLogicalReviewId = String(db.rows('teacher_srs_reviews').find((row) => (
      row.isCorrection === false && String(row.logicalReviewId).includes('same-time-later')
    ))?.logicalReviewId);
    const corrections = db.rows('teacher_srs_reviews').filter((row) => (
      row.logicalReviewId === laterLogicalReviewId && row.isCorrection === true
    ));
    expect(corrections.map((row) => row.correctionIdempotencyKey)).toEqual([
      'same-time-correction-one',
      'same-time-correction-two',
    ]);
    expect(new Set(corrections.map((row) => row.reviewId)).size).toBe(2);
  });

  it.each(['formal_q1', 'formal_q4'] as const)('permits only one submitted %s record per school year', async (observationType) => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submit = handler(submitObservation);
    const firstDraft = await createCompletedDraft(db, 'first_rated', { observationType });
    expectKind(await submit(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: firstDraft.draftId,
      expectedRevision: firstDraft.revision,
      submissionKey: `${observationType}-first`,
      now: OBSERVATION_NOW_MS + 2_000,
    }), 'submitted');

    const duplicateDraft = await createCompletedDraft(db, 'first_rated', { observationType });
    expectKind(await submit(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: duplicateDraft.draftId,
      expectedRevision: duplicateDraft.revision,
      submissionKey: `${observationType}-duplicate`,
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'formal_observation_exists');
  });

  it('returns a capacity error instead of truncating a queue above 250 active teachers', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    for (let index = 0; index < 250; index += 1) {
      const accountId = `accounts:queue-${index}`;
      db.seed('accounts', accountId, {
        organizationId: ORGANIZATION_A,
        username: `queue-${index}`,
        displayName: `Queue Teacher ${index}`,
        sharedSessionRole: 'teacher',
        isActive: true,
      });
      db.seed('teacher_profiles', `teacher_profiles:queue-${index}`, {
        organizationId: ORGANIZATION_A,
        accountId,
        isActive: true,
      });
    }
    const readQueue = handler(readRankedTeacherQueue);

    expect(await readQueue(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      now: OBSERVATION_NOW,
    })).toEqual({ kind: 'queue_capacity_exceeded' });
  });

  it('returns the explicit target shortfall through the persistent queue boundary', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    db.seed('teacher_attention_summaries', 'teacher_attention_summaries:teacher', {
      organizationId: ORGANIZATION_A,
      teacherProfileId: TEACHER_PROFILE_ID,
      targets: [priority({ skillId: 'skill-a' }), priority({ skillId: 'skill-b' })],
      updatedAt: OBSERVATION_NOW_MS,
    });

    const result = expectKind(await handler(readRankedTeacherQueue)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      now: OBSERVATION_NOW,
    }), 'allowed');

    expect(result.items).toEqual([
      expect.objectContaining({
        teacherProfileId: TEACHER_PROFILE_ID,
        requested: 3,
        returned: 2,
        shortfall: 1,
        shortfallReason: 'fewer_than_three_eligible_skills',
      }),
    ]);
  });

  it('excludes teachers in inactive departments from an HOD queue', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    await db.delete(`role_assignments:${OBSERVER_ACCOUNT_ID}:school-head`);
    db.seed('role_assignments', 'role_assignments:observer:hod', {
      organizationId: ORGANIZATION_A,
      accountId: OBSERVER_ACCOUNT_ID,
      role: 'hod',
      status: 'active',
    });
    db.seed('departments', 'departments:inactive', {
      organizationId: ORGANIZATION_A,
      name: 'Inactive department',
      isActive: false,
    });
    db.seed('department_memberships', 'department_memberships:inactive', {
      organizationId: ORGANIZATION_A,
      departmentId: 'departments:inactive',
      teacherProfileId: TEACHER_PROFILE_ID,
      status: 'active',
    });
    db.seed('hod_assignments', 'hod_assignments:inactive', {
      organizationId: ORGANIZATION_A,
      accountId: OBSERVER_ACCOUNT_ID,
      departmentId: 'departments:inactive',
      status: 'active',
    });

    expect(await handler(readRankedTeacherQueue)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      now: OBSERVATION_NOW,
    })).toMatchObject({ kind: 'allowed', items: [] });
  });

  it('hides owned drafts after the observer loses the current teacher scope', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const created = expectKind(await createDraft(db), 'created');
    await db.delete(`role_assignments:${OBSERVER_ACCOUNT_ID}:school-head`);
    db.seed('role_assignments', 'role_assignments:observer:hod', {
      organizationId: ORGANIZATION_A,
      accountId: OBSERVER_ACCOUNT_ID,
      role: 'hod',
      status: 'active',
    });

    const result = expectKind(await handler(listMyObservationDrafts)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      paginationOpts: { cursor: null, numItems: 20 },
    }), 'allowed');

    expect(result.page).toMatchObject({ page: [] });
    expect(db.rows('observation_records')).toContainEqual(expect.objectContaining({
      _id: (created.draft as Record<string, unknown>).draftId,
      status: 'draft',
    }));
  });

  it('returns the frozen target shortfall when it creates a walkthrough draft', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const skillIds = buildDanielsonGraph().graph.nodes
      .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
      .map((node) => node.id)
      .sort();
    for (const skillId of skillIds.slice(2)) {
      db.seed('teacher_srs_cards', `teacher_srs_cards:${skillId}`, {
        organizationId: ORGANIZATION_A,
        teacherId: TEACHER_PROFILE_ID,
        skillId,
        variantKey: skillId,
        card: {
          objectiveId: skillId,
          variantKey: skillId,
          dueDate: '2027-09-15T08:00:00.000Z',
        },
        updatedAt: OBSERVATION_NOW_MS,
      });
      db.seed('teacher_proficiency', `teacher_proficiency:${skillId}`, {
        organizationId: ORGANIZATION_A,
        teacherId: TEACHER_PROFILE_ID,
        skillId,
        projection: { skillId, componentId: COMPONENT_1E, rawRating: 3 },
        updatedAt: OBSERVATION_NOW_MS,
      });
    }

    const result = expectKind(await createDraft(db), 'created');
    expect(result).toMatchObject({
      requested: 3,
      returned: 2,
      shortfall: 1,
      shortfallReason: 'fewer_than_three_eligible_skills',
    });
  });

  it('rejects an amendment key that collides with an observation submission key', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submitted = await submitRatedWalkthrough({
      db,
      submissionKey: 'shared-evidence-key',
      rating: 2,
      observedAt: '2026-09-15T07:45:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const before = structuredClone(db.allRows());

    expectKind(await handler(amendObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId: (submitted.record as Record<string, unknown>).observationId,
      idempotencyKey: 'shared-evidence-key',
      expectedVersion: 0,
      reason: 'Correct the rating.',
      changedItems: [{
        itemId: firstSubmittedItem(submitted).itemId,
        outcome: { kind: 'rated', rating: 3 },
      }],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'idempotency_conflict');
    expect(db.allRows()).toEqual(before);
  });

  it('keeps a scoped teacher visible when the organization has more than 250 accounts', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    for (let index = 0; index < 300; index += 1) {
      db.seed('accounts', `accounts:non-teacher-${index}`, {
        organizationId: ORGANIZATION_A,
        username: `non-teacher-${index}`,
        displayName: `Non-teacher ${index}`,
        sharedSessionRole: 'admin',
        isActive: true,
      });
    }
    db.seed('accounts', 'accounts:late-teacher', {
      organizationId: ORGANIZATION_A,
      username: 'late-teacher',
      displayName: 'Late Teacher',
      sharedSessionRole: 'teacher',
      isActive: true,
    });
    db.seed('teacher_profiles', 'teacher_profiles:late-teacher', {
      organizationId: ORGANIZATION_A,
      accountId: 'accounts:late-teacher',
      isActive: true,
    });

    const result = expectKind(await handler(readRankedTeacherQueue)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      now: OBSERVATION_NOW,
    }), 'allowed');

    expect(result.items).toContainEqual(expect.objectContaining({
      teacherProfileId: 'teacher_profiles:late-teacher',
      displayName: 'Late Teacher',
    }));
  });

  it('recomputes stored priority timing at the queue read clock', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    db.seed('teacher_attention_summaries', 'teacher_attention_summaries:clock', {
      organizationId: ORGANIZATION_A,
      teacherProfileId: TEACHER_PROFILE_ID,
      targets: [priority({
        due: false,
        overdueDays: 0,
        dueAt: '2026-09-10T08:00:00.000Z',
        evidenceGaps: [],
        currentProficiency: { rawRating: 3, points: 90, passes: true },
      })],
      updatedAt: Date.parse('2026-09-01T08:00:00.000Z'),
    });

    const result = expectKind(await handler(readRankedTeacherQueue)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      now: OBSERVATION_NOW,
    }), 'allowed');

    expect(result.items).toEqual([
      expect.objectContaining({
        teacherProfileId: TEACHER_PROFILE_ID,
        reason: 'overdue',
        targets: [expect.objectContaining({ due: true, overdueDays: 5 })],
      }),
    ]);
  });

  it('keeps a proficient teacher available for a formal observation when no walkthrough is due', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    db.seed('teacher_attention_summaries', 'teacher_attention_summaries:formal-only', {
      organizationId: ORGANIZATION_A,
      teacherProfileId: TEACHER_PROFILE_ID,
      targets: [priority({
        due: false,
        dueAt: '2027-09-15T08:00:00.000Z',
        overdueDays: 0,
        evidenceGaps: [],
        currentProficiency: { rawRating: 3, points: 90, passes: true },
      })],
      updatedAt: OBSERVATION_NOW_MS,
    });

    const result = expectKind(await handler(readRankedTeacherQueue)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      now: OBSERVATION_NOW,
    }), 'allowed');

    expect(result.items).toEqual([]);
    expect(result.formalCandidates).toEqual([
      { teacherProfileId: TEACHER_PROFILE_ID, displayName: 'Teacher One' },
    ]);
  });

  it('keeps amendment and submission idempotency keys in one organization namespace', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const first = await submitRatedWalkthrough({
      db,
      submissionKey: 'first-submission',
      rating: 2,
      observedAt: '2026-09-15T07:45:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const amendmentCommand = {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId: (first.record as Record<string, unknown>).observationId,
      idempotencyKey: 'shared-later-key',
      expectedVersion: 0,
      reason: 'Correct the rating.',
      changedItems: [{
        itemId: firstSubmittedItem(first).itemId,
        outcome: { kind: 'rated', rating: 3 },
      }],
      now: OBSERVATION_NOW_MS + 3_000,
    };
    expectKind(await handler(amendObservation)(db.context(), amendmentCommand), 'amended');

    const second = await createCompletedDraft(db, 'first_rated', {
      observedAt: '2026-09-16T07:45:00.000Z',
    });
    const beforeConflict = structuredClone(db.allRows());
    expectKind(await handler(submitObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      draftId: second.draftId,
      expectedRevision: second.revision,
      submissionKey: 'shared-later-key',
      now: OBSERVATION_NOW_MS + 4_000,
    }), 'idempotency_conflict');
    expect(db.allRows()).toEqual(beforeConflict);

    expectKind(await handler(amendObservation)(db.context(), amendmentCommand), 'replayed');
  });

  it('rejects amendment 101 before it makes the published record unreadable', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submitted = await submitRatedWalkthrough({
      db,
      submissionKey: 'amendment-capacity',
      rating: 2,
      observedAt: '2026-09-15T07:45:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const observationId = String((submitted.record as Record<string, unknown>).observationId);
    for (let version = 1; version <= 100; version += 1) {
      db.seed('observation_amendments', `observation_amendments:capacity-${version}`, {
        organizationId: ORGANIZATION_A,
        observationId,
        teacherProfileId: TEACHER_PROFILE_ID,
        authorAccountId: OBSERVER_ACCOUNT_ID,
        idempotencyKey: `capacity-${version}`,
        fingerprint: `fingerprint-${version}`,
        version,
        reason: `Correction ${version}.`,
        changedItems: [{ itemId: firstSubmittedItem(submitted).itemId, evidenceNote: `Note ${version}` }],
        occurredAt: OBSERVATION_NOW_MS + version,
      });
    }
    const before = structuredClone(db.allRows());

    expectKind(await handler(amendObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId,
      idempotencyKey: 'capacity-101',
      expectedVersion: 100,
      reason: 'One correction too many.',
      changedItems: [{ itemId: firstSubmittedItem(submitted).itemId, evidenceNote: 'Overflow.' }],
      now: OBSERVATION_NOW_MS + 10_000,
    }), 'correction_history_capacity_exceeded');
    expect(db.allRows()).toEqual(before);
  });

  it('rejects a scoring amendment before it exceeds the evidence-history bound', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submitted = await submitRatedWalkthrough({
      db,
      submissionKey: 'evidence-capacity',
      rating: 2,
      observedAt: '2026-09-15T07:45:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const existingOutcomes = db.rows('teacher_observation_outcomes').length;
    for (let index = existingOutcomes; index < 2_000; index += 1) {
      db.seed('teacher_observation_outcomes', `teacher_observation_outcomes:capacity-${index}`, {
        organizationId: ORGANIZATION_A,
        teacherId: TEACHER_PROFILE_ID,
        idempotencyKey: `existing-outcome-${index}`,
        outcome: {},
        occurredAt: index,
        createdAt: index,
      });
    }
    const before = structuredClone(db.allRows());

    expectKind(await handler(amendObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId: (submitted.record as Record<string, unknown>).observationId,
      idempotencyKey: 'evidence-capacity-amendment',
      expectedVersion: 0,
      reason: 'Correct the rating.',
      changedItems: [{
        itemId: firstSubmittedItem(submitted).itemId,
        outcome: { kind: 'rated', rating: 3 },
      }],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'correction_history_capacity_exceeded');
    expect(db.allRows()).toEqual(before);
  });

  it('does not let a redundant outcome become the predecessor of a real correction', async () => {
    const db = new MemoryDb();
    seedFoundation(db);
    const submitted = await submitRatedWalkthrough({
      db,
      submissionKey: 'redundant-then-real',
      rating: 3,
      observedAt: '2026-09-15T07:45:00.000Z',
      now: OBSERVATION_NOW_MS + 2_000,
    });
    const item = firstSubmittedItem(submitted);
    const observationId = (submitted.record as Record<string, unknown>).observationId;

    expectKind(await handler(amendObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId,
      idempotencyKey: 'redundant-rating',
      expectedVersion: 0,
      reason: 'No effective change.',
      changedItems: [{ itemId: item.itemId, outcome: { kind: 'rated', rating: 3 } }],
      now: OBSERVATION_NOW_MS + 3_000,
    }), 'no_changes');
    expect(db.rows('observation_amendments')).toEqual([]);

    expectKind(await handler(amendObservation)(db.context(), {
      actorAccountId: OBSERVER_ACCOUNT_ID,
      observationId,
      idempotencyKey: 'real-rating-correction',
      expectedVersion: 0,
      reason: 'Correct the rating.',
      changedItems: [{ itemId: item.itemId, outcome: { kind: 'rated', rating: 2 } }],
      now: OBSERVATION_NOW_MS + 4_000,
    }), 'amended');

    expect(db.rows('teacher_evidence_supersessions')).toEqual([
      expect.objectContaining({
        supersededEvidenceKey: `redundant-then-real:skill:${item.skillId}`,
        replacementEvidenceKey: `real-rating-correction:skill:${item.skillId}`,
      }),
    ]);
    expect(db.rows('teacher_srs_cards')).toEqual([
      expect.objectContaining({ card: expect.objectContaining({ reps: 1 }) }),
    ]);
    expect(effectiveReviewTimeline(
      db.rows('teacher_srs_reviews'),
      db.rows('teacher_evidence_supersessions'),
    )).toHaveLength(1);
  });
});
