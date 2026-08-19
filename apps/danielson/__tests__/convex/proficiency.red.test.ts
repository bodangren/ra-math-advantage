import { describe, expect, it } from 'vitest';

import {
  FIXED_NOW,
  ORGANIZATION_ID,
  SKILL_IDS,
  TEACHER_ID,
  createRatedEvidence,
  createStableDueCard,
} from '../proficiency/fixtures';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };

type Handler<TArgs, TResult> = (ctx: { db: MemoryDb }, args: TArgs) => Promise<TResult>;

function handler<TArgs, TResult>(value: unknown): Handler<TArgs, TResult> {
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

  async get(id: string) {
    for (const table of this.tables.values()) {
      const document = table.get(id);
      if (document) return document;
    }
    return null;
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

  query(tableName: string) {
    let matches = this.rows(tableName);
    let descending = false;
    const query = {
      withIndex: (_name: string, configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
        const equalities: Array<[string, unknown]> = [];
        const builder = {
          eq: (field: string, value: unknown) => {
            equalities.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((document) => equalities.every(([field, value]) => document[field] === value));
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
        return { page, isDone: next >= ordered.length, continueCursor: next >= ordered.length ? '' : String(next) };
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

function seedTeacher(db: MemoryDb) {
  db.seed('organizations', ORGANIZATION_ID, {
    slug: 'school', name: 'School', isActive: true, activeSysadminCount: 1,
  });
  db.seed('accounts', 'accounts:observer', {
    organizationId: ORGANIZATION_ID, username: 'observer', displayName: 'Observer',
    sharedSessionRole: 'admin', isActive: true,
  });
  db.seed('accounts', 'accounts:teacher', {
    organizationId: ORGANIZATION_ID, username: 'teacher', displayName: 'Teacher',
    sharedSessionRole: 'teacher', isActive: true,
  });
  db.seed('teacher_profiles', TEACHER_ID, {
    organizationId: ORGANIZATION_ID, accountId: 'accounts:teacher', isActive: true,
  });
}

function seedHodScope(db: MemoryDb, includeTeacherMembership: boolean, accountId = 'accounts:observer') {
  db.seed('role_assignments', `role_assignments:${accountId}:hod`, {
    organizationId: ORGANIZATION_ID,
    accountId,
    role: 'hod',
    status: 'active',
  });
  db.seed('departments', 'departments:math', {
    organizationId: ORGANIZATION_ID,
    key: 'math',
    name: 'Mathematics',
    isActive: true,
  });
  db.seed('hod_assignments', `hod_assignments:${accountId}:math`, {
    organizationId: ORGANIZATION_ID,
    accountId,
    departmentId: 'departments:math',
    status: 'active',
  });
  if (includeTeacherMembership) {
    db.seed('department_memberships', 'department_memberships:teacher-math', {
      organizationId: ORGANIZATION_ID,
      departmentId: 'departments:math',
      teacherProfileId: TEACHER_ID,
      status: 'active',
    });
  }
}

describe('Danielson proficiency Convex persistence', () => {
  it('persists one tenant-scoped logical effect and exposes it through a bounded priority read', async () => {
    const { ingestObservationEvidence, readTeacherPriority } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);

    for (let index = 0; index < 101; index += 1) {
      db.seed('teacher_srs_cards', `teacher_srs_cards:other-${index}`, {
        organizationId: 'organizations:other',
        teacherId: `teacher_profiles:other-${index}`,
        skillId: 'danielson.tlac.skill.other',
        variantKey: 'danielson.tlac.skill.other',
      });
    }

    const args = {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence(),
      now: FIXED_NOW,
    };
    const first = await ingest(db.context(), args);
    expect(first).toMatchObject({ kind: 'applied' });
    await expect(ingest(db.context(), args)).resolves.toEqual({ ...first, kind: 'replayed' });

    expect(db.rows('teacher_proficiency_idempotency')).toHaveLength(1);
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(1);
    expect(db.rows('teacher_srs_cards')).toHaveLength(104);
    expect(db.rows('teacher_srs_reviews')).toHaveLength(3);

    const priority = await readPriority(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    });
    expect(priority).toMatchObject({
      kind: 'allowed',
      items: expect.arrayContaining([
        expect.objectContaining({ skillId: 'danielson.tlac.skill.double-plan' }),
      ]),
    });
  });

  it('rejects a same-key conflict and refuses cross-organization persistence reads', async () => {
    const { ingestObservationEvidence, readTeacherPriority } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);
    const baseArgs = {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence(),
      now: FIXED_NOW,
    };

    await expect(ingest(db.context(), baseArgs)).resolves.toMatchObject({ kind: 'applied' });
    await expect(ingest(db.context(), {
      ...baseArgs,
      evidence: createRatedEvidence({ rating: 1 }),
    })).resolves.toMatchObject({ kind: 'idempotency_conflict' });
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(1);

    await expect(readPriority(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: 'organizations:other',
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'denied' });
  });

  it('requires an actor for a teacher-priority read', async () => {
    const { readTeacherPriority } = await import('../../convex/proficiency');
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);

    await expect(readPriority(db.context(), {
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'denied' });
  });

  it('exposes due evidence gaps for every unobserved approved skill', async () => {
    const { readTeacherPriority } = await import('../../convex/proficiency');
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);

    const result = await readPriority(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    });
    expect(result).toMatchObject({
      kind: 'allowed',
      items: expect.arrayContaining([
        expect.objectContaining({
          teacherId: TEACHER_ID,
          skillId: 'danielson.tlac.skill.double-plan',
          componentId: 'danielson.framework.component.1e',
          due: true,
          evidenceGaps: ['no_valid_rated_evidence'],
        }),
      ]),
    });
    expect((result as { items: unknown[] }).items).toHaveLength(63);
  });

  it('denies an evidence command when the authenticated actor is not its observer', async () => {
    const { ingestObservationEvidence } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const db = new MemoryDb();
    seedTeacher(db);
    db.seed('accounts', 'accounts:second-observer', {
      organizationId: ORGANIZATION_ID, username: 'second-observer', displayName: 'Second observer',
      sharedSessionRole: 'admin', isActive: true,
    });
    seedHodScope(db, true, 'accounts:second-observer');

    await expect(ingest(db.context(), {
      actorAccountId: 'accounts:second-observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence({ idempotencyKey: 'actor-observer-mismatch' }),
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'denied' });
    expect(db.rows('teacher_observation_outcomes')).toEqual([]);
  });

  it('uses the current HOD department scope for a Q1 write and teacher-priority read', async () => {
    const { ingestObservationEvidence, readTeacherPriority } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);
    const args = {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence({ idempotencyKey: 'hod-current-scope' }),
      now: FIXED_NOW,
    };

    await expect(ingest(db.context(), args)).resolves.toMatchObject({ kind: 'applied' });
    await expect(readPriority(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'allowed' });
  });

  it('denies a current teacher-priority read to an active actor without evaluation-read capability', async () => {
    const { readTeacherPriority } = await import('../../convex/proficiency');
    const readPriority = handler<Record<string, unknown>, Record<string, unknown>>(readTeacherPriority);
    const db = new MemoryDb();
    seedTeacher(db);

    await expect(readPriority(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'capability_not_granted' });
  });

  it('denies a Q1 write outside the actor HOD scope before it writes an outcome', async () => {
    const { ingestObservationEvidence } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, false);

    await expect(ingest(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence({ idempotencyKey: 'hod-out-of-scope' }),
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'target_out_of_scope' });
    expect(db.rows('teacher_observation_outcomes')).toEqual([]);
  });

  it('applies Track 1 self-exclusion before it writes a supervisor evaluation', async () => {
    const { ingestObservationEvidence } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const db = new MemoryDb();
    seedTeacher(db);
    db.seed('role_assignments', 'role_assignments:teacher-school-head', {
      organizationId: ORGANIZATION_ID,
      accountId: 'accounts:teacher',
      role: 'school_head',
      status: 'active',
    });

    await expect(ingest(db.context(), {
      actorAccountId: 'accounts:teacher',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence({
        idempotencyKey: 'self-evaluation-denied',
        observerId: 'accounts:teacher',
      }),
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'self_evaluation_denied' });
    expect(db.rows('teacher_observation_outcomes')).toEqual([]);
  });

  it('accepts the documented evidence command at the Convex handler boundary', async () => {
    const { ingestObservationEvidence } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);
    const source = createRatedEvidence({ idempotencyKey: 'documented-convex-command' });

    await expect(ingest(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      now: FIXED_NOW,
      evidence: {
        idempotencyKey: source.idempotencyKey,
        organizationId: source.organizationId,
        teacherProfileId: source.teacherId,
        observerAccountId: source.observerId,
        sourceRecordId: source.sourceRecordId,
        formalObservationId: source.formalObservationId,
        sourceType: source.sourceType,
        componentId: source.componentId,
        targetSkillIds: source.targetSkillIds,
        eventTime: source.occurredAt,
        sourceVersion: source.sourceVersion,
        provenanceGroupId: source.provenanceGroupId,
        outcome: { kind: 'rated', rating: source.rating },
      },
    })).resolves.toMatchObject({ kind: 'applied' });
  });

  it('continues ingestion after more than 200 immutable outcomes', async () => {
    const { ingestObservationEvidence } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);
    for (let index = 0; index < 201; index += 1) {
      db.seed('teacher_observation_outcomes', `teacher_observation_outcomes:old-${index}`, {
        organizationId: ORGANIZATION_ID,
        teacherId: TEACHER_ID,
        idempotencyKey: `old-${index}`,
        outcome: { kind: 'not_enough_evidence' },
        occurredAt: Date.parse(FIXED_NOW) - index,
        createdAt: Date.parse(FIXED_NOW) - index,
      });
    }

    await expect(ingest(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence({ idempotencyKey: 'after-two-hundred-outcomes' }),
      now: FIXED_NOW,
    })).resolves.toMatchObject({ kind: 'applied' });
    expect(db.rows('teacher_observation_outcomes')).toHaveLength(202);
  });

  it('keeps audit timestamps monotonic and appends review corrections for late evidence', async () => {
    const { ingestObservationEvidence } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);
    const later = createRatedEvidence({
      idempotencyKey: 'late-order-later',
      sourceRecordId: 'observation_records:late-order-later',
      sourceType: 'walkthrough',
      formalObservationId: undefined,
      provenanceGroupId: 'provenance:late-order-later',
      targetSkillIds: ['danielson.tlac.skill.double-plan'],
      occurredAt: '2026-08-20T00:00:00.000Z',
      rating: 4,
    });
    const earlier = createRatedEvidence({
      ...later,
      idempotencyKey: 'late-order-earlier',
      sourceRecordId: 'observation_records:late-order-earlier',
      provenanceGroupId: 'provenance:late-order-earlier',
      occurredAt: '2026-08-10T00:00:00.000Z',
      rating: 1,
    });
    const firstCommitTime = Date.parse('2026-08-21T00:00:00.000Z');
    const correctionCommitTime = Date.parse('2026-08-22T00:00:00.000Z');

    await ingest(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: later,
      now: new Date(firstCommitTime).toISOString(),
    });
    await ingest(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: earlier,
      now: new Date(correctionCommitTime).toISOString(),
    });

    expect(db.rows('teacher_proficiency')).toEqual([
      expect.objectContaining({ updatedAt: correctionCommitTime }),
    ]);
    expect(db.rows('teacher_proficiency_idempotency').map((row) => row.createdAt))
      .toEqual([firstCommitTime, correctionCommitTime]);
    expect(db.rows('teacher_srs_reviews')).toEqual(expect.arrayContaining([
      expect.objectContaining({ createdAt: firstCommitTime, isCorrection: false }),
      expect.objectContaining({ createdAt: correctionCommitTime, isCorrection: false }),
      expect.objectContaining({ createdAt: correctionCommitTime, isCorrection: true }),
    ]));
  });

  it('does not rewrite an unrelated card or proficiency audit timestamp', async () => {
    const { ingestObservationEvidence } = await import('../../convex/proficiency');
    const ingest = handler<Record<string, unknown>, Record<string, unknown>>(ingestObservationEvidence);
    const db = new MemoryDb();
    seedTeacher(db);
    seedHodScope(db, true);
    const unrelatedSkillId = SKILL_IDS[1];
    db.seed('teacher_srs_cards', 'teacher_srs_cards:unrelated', {
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      skillId: unrelatedSkillId,
      variantKey: unrelatedSkillId,
      card: createStableDueCard({ objectiveId: unrelatedSkillId, variantKey: unrelatedSkillId }),
      updatedAt: 123,
    });
    db.seed('teacher_proficiency', 'teacher_proficiency:unrelated', {
      organizationId: ORGANIZATION_ID,
      teacherId: TEACHER_ID,
      skillId: unrelatedSkillId,
      projection: {
        skillId: unrelatedSkillId,
        componentId: 'danielson.framework.component.1e',
        rawRating: 3,
        points: 90,
        passes: true,
        srsRating: 'Good',
        idempotencyKey: 'unrelated-existing-command',
        sourceRecordId: 'observation_records:unrelated-existing',
        provenanceGroupId: 'provenance:unrelated-existing',
        sourceType: 'walkthrough',
        occurredAt: '2026-08-01T00:00:00.000Z',
      },
      updatedAt: 123,
    });
    const beforeCard = structuredClone(db.rows('teacher_srs_cards')[0]);
    const beforeProficiency = structuredClone(db.rows('teacher_proficiency')[0]);

    await ingest(db.context(), {
      actorAccountId: 'accounts:observer',
      organizationId: ORGANIZATION_ID,
      evidence: createRatedEvidence({
        idempotencyKey: 'one-skill-with-unrelated-state',
        sourceRecordId: 'observation_records:one-skill-with-unrelated-state',
        sourceType: 'walkthrough',
        formalObservationId: undefined,
        provenanceGroupId: 'provenance:one-skill-with-unrelated-state',
        targetSkillIds: [SKILL_IDS[0]],
      }),
      now: FIXED_NOW,
    });

    expect(db.rows('teacher_srs_cards').find((row) => row.skillId === unrelatedSkillId))
      .toEqual(beforeCard);
    expect(db.rows('teacher_proficiency').find((row) => row.skillId === unrelatedSkillId))
      .toEqual(beforeProficiency);
  });
});
