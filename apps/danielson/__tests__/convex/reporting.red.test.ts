import { describe, expect, it } from 'vitest';

import {
  addPrivateObservationComment,
  addPublicObservationComment,
  listLeadershipPrivateComments,
  listLeadershipPublicComments,
  listMyPublicComments,
  readLeadershipPortfolio,
  readLeadershipTeacherReport,
  readMyTeacherReport,
  submitTeacherResponse,
} from '../../convex/reporting';

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

  snapshot() {
    return structuredClone(Object.fromEntries(
      [...this.tables.entries()].map(([name, rows]) => [name, [...rows.values()]]),
    ));
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
      first: async () => {
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered[0] ?? null;
      },
      take: async (count: number) => {
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered.slice(0, count);
      },
      collect: async () => {
        throw new Error(`Unbounded collect is prohibited for ${tableName}`);
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

const ORG = 'organizations:one';
const OTHER_ORG = 'organizations:other';
const LEADER = 'accounts:leader';
const SYSADMIN = 'accounts:sysadmin';
const TEACHER_ACCOUNT = 'accounts:teacher';
const TEACHER = 'teacher_profiles:teacher';
const NOW = Date.parse('2026-11-01T00:00:00.000Z');
const NOW_ISO = new Date(NOW).toISOString();

function seedOrganization(db: MemoryDb, organizationId = ORG) {
  db.seed('organizations', organizationId, {
    slug: organizationId,
    name: organizationId,
    isActive: true,
    activeSysadminCount: 1,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedAccount(
  db: MemoryDb,
  accountId: string,
  displayName: string,
  organizationId = ORG,
) {
  db.seed('accounts', accountId, {
    organizationId,
    username: accountId,
    displayName,
    sharedSessionRole: 'admin',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedTeacher(
  db: MemoryDb,
  teacherProfileId: string,
  accountId: string,
  displayName: string,
  organizationId = ORG,
) {
  seedAccount(db, accountId, displayName, organizationId);
  db.seed('teacher_profiles', teacherProfileId, {
    organizationId,
    accountId,
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedRole(db: MemoryDb, accountId: string, role: string, organizationId = ORG) {
  db.seed('role_assignments', `role_assignments:${accountId}:${role}`, {
    organizationId,
    accountId,
    role,
    status: 'active',
    createdByAccountId: accountId,
    createdAt: NOW,
  });
}

function seedBase(db: MemoryDb) {
  seedOrganization(db);
  seedOrganization(db, OTHER_ORG);
  seedAccount(db, LEADER, 'Leader One');
  seedAccount(db, SYSADMIN, 'System Administrator');
  seedTeacher(db, TEACHER, TEACHER_ACCOUNT, 'Teacher One');
  seedRole(db, LEADER, 'school_head');
  seedRole(db, SYSADMIN, 'sysadmin');
  seedRole(db, TEACHER_ACCOUNT, 'teacher');
}

function priority(input: {
  teacherProfileId?: string;
  skillId?: string;
  componentId?: string;
  rating?: 1 | 2 | 3 | 4 | null;
  due?: boolean;
  dueAt?: string | null;
  overdueDays?: number;
} = {}) {
  const rating = input.rating === undefined ? 3 : input.rating;
  const points = rating === null ? null : { 1: 70, 2: 80, 3: 90, 4: 100 }[rating];
  return {
    teacherId: input.teacherProfileId ?? TEACHER,
    skillId: input.skillId ?? 'danielson.tlac.skill.double-plan',
    componentId: input.componentId ?? 'danielson.framework.component.1e',
    due: input.due ?? false,
    dueAt: input.dueAt ?? '2027-01-01T00:00:00.000Z',
    overdueDays: input.overdueDays ?? 0,
    currentProficiency: {
      rawRating: rating,
      points,
      passes: rating !== null && rating >= 3,
    },
    evidenceGaps: rating === null ? ['no_valid_rated_evidence'] : [],
    approvedPriorityInputs: [
      'due_status',
      'overdue_duration',
      'current_proficiency',
      'evidence_gap',
    ],
  };
}

function seedAttention(db: MemoryDb, teacherProfileId = TEACHER, targets = [priority()]) {
  db.seed('teacher_attention_summaries', `teacher_attention_summaries:${teacherProfileId}`, {
    organizationId: ORG,
    teacherProfileId,
    targets,
    updatedAt: NOW,
  });
}

function seedSubmittedObservation(db: MemoryDb, input: {
  observationId?: string;
  teacherProfileId?: string;
  teacherAccountId?: string;
  observationType?: 'walkthrough' | 'formal_q1' | 'formal_q4';
  submittedAt?: number;
} = {}) {
  const observationId = input.observationId ?? 'observation_records:one';
  const teacherProfileId = input.teacherProfileId ?? TEACHER;
  db.seed('observation_records', observationId, {
    organizationId: ORG,
    teacherProfileId,
    observerAccountId: LEADER,
    observationType: input.observationType ?? 'walkthrough',
    schoolYear: '2026-2027',
    sourceVersion: 'danielson-observation.v1',
    frameworkVersion: 'danielson-2022',
    observedAt: '2026-10-01T00:00:00.000Z',
    status: 'submitted',
    revision: 1,
    items: [{
      itemId: 'danielson.tlac.skill.double-plan',
      skillId: 'danielson.tlac.skill.double-plan',
      componentId: 'danielson.framework.component.1e',
      priorityReason: 'due',
      outcome: { kind: 'rated', rating: 3 },
      evidenceNote: 'Teacher-visible note.',
    }],
    submissionKey: `${observationId}:submission`,
    submissionFingerprint: `${observationId}:fingerprint`,
    submittedAt: input.submittedAt ?? NOW,
    publishedAt: input.submittedAt ?? NOW,
    createdAt: NOW,
    updatedAt: NOW,
  });
  return observationId;
}

function scoringSnapshot(db: MemoryDb) {
  return structuredClone({
    observations: db.rows('observation_records'),
    amendments: db.rows('observation_amendments'),
    outcomes: db.rows('teacher_observation_outcomes'),
    proficiency: db.rows('teacher_proficiency'),
    cards: db.rows('teacher_srs_cards'),
    reviews: db.rows('teacher_srs_reviews'),
    knowledgeState: db.rows('teacher_knowledge_state'),
    priority: db.rows('teacher_priority'),
    summaries: db.rows('teacher_attention_summaries'),
  });
}

function expectAllowed<T extends Record<string, unknown>>(result: T) {
  expect(result).toMatchObject({ kind: 'allowed' });
  if (result.kind !== 'allowed') throw new Error('Expected allowed result');
  return result;
}

describe('Danielson reporting Convex boundary', () => {
  it('paginates 61 compact portfolio rows and makes no database write', async () => {
    const db = new MemoryDb();
    seedBase(db);
    for (let index = 0; index < 61; index += 1) {
      const suffix = String(index).padStart(2, '0');
      const teacherProfileId = `teacher_profiles:${suffix}`;
      seedTeacher(db, teacherProfileId, `accounts:teacher-${suffix}`, `Teacher ${suffix}`);
      seedAttention(db, teacherProfileId, [priority({ teacherProfileId })]);
    }
    const before = db.snapshot();
    const read = handler(readLeadershipPortfolio);
    const first = expectAllowed(await read(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const firstPage = first.page as {
      items: Array<Record<string, unknown>>;
      isDone: boolean;
      continueCursor: string;
    };
    const second = expectAllowed(await read(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: firstPage.continueCursor,
      pageSize: 25,
    }));
    const secondPage = second.page as typeof firstPage;
    const third = expectAllowed(await read(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: secondPage.continueCursor,
      pageSize: 25,
    }));
    const thirdPage = third.page as typeof firstPage;
    const rows = [...firstPage.items, ...secondPage.items, ...thirdPage.items];

    expect(firstPage.items).toHaveLength(25);
    expect(secondPage.items).toHaveLength(25);
    expect(thirdPage.items).toHaveLength(12);
    expect(new Set(rows.map((row) => row.teacherProfileId))).toHaveLength(62);
    expect(firstPage.items[0]).toMatchObject({
      teacherProfileId: expect.any(String),
      displayName: expect.any(String),
      danielson: expect.any(Object),
      improvementPlan: { state: 'not_configured' },
      gbf: { state: 'not_configured' },
      evidenceDue: expect.any(Object),
      attentionReasons: expect.any(Array),
    });
    expect(db.snapshot()).toEqual(before);
  });

  it('uses current HOD and coach scope without a report query for each teacher', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const scopedLeader = 'accounts:scoped-leader';
    seedAccount(db, scopedLeader, 'Scoped Leader');
    db.seed('departments', 'departments:math', {
      organizationId: ORG,
      key: 'math',
      name: 'Mathematics',
      isActive: true,
    });
    seedRole(db, scopedLeader, 'hod');
    seedRole(db, scopedLeader, 'coach');
    db.seed('hod_assignments', 'hod_assignments:leader-math', {
      organizationId: ORG,
      accountId: scopedLeader,
      departmentId: 'departments:math',
      status: 'active',
    });
    seedTeacher(db, 'teacher_profiles:hod', 'accounts:hod-teacher', 'HOD Teacher');
    seedTeacher(db, 'teacher_profiles:coach', 'accounts:coach-teacher', 'Coach Teacher');
    seedTeacher(db, 'teacher_profiles:outside', 'accounts:outside-teacher', 'Outside Teacher');
    db.seed('department_memberships', 'department_memberships:hod', {
      organizationId: ORG,
      departmentId: 'departments:math',
      teacherProfileId: 'teacher_profiles:hod',
      status: 'active',
    });
    db.seed('coach_assignments', 'coach_assignments:coach', {
      organizationId: ORG,
      accountId: scopedLeader,
      teacherProfileId: 'teacher_profiles:coach',
      status: 'active',
    });

    const result = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: scopedLeader,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const page = result.page as { items: Array<{ teacherProfileId: string }> };
    expect(page.items.map((row) => row.teacherProfileId)).toEqual(expect.arrayContaining([
      'teacher_profiles:hod',
      'teacher_profiles:coach',
    ]));
    expect(page.items.map((row) => row.teacherProfileId)).not.toContain('teacher_profiles:outside');
  });

  it('denies sysadmin-only access and permits the same account through an added SLT role', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const read = handler(readLeadershipPortfolio);

    await expect(read(db.context(), {
      actorAccountId: SYSADMIN,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'capability_not_granted' });

    seedRole(db, SYSADMIN, 'slt');
    await expect(read(db.context(), {
      actorAccountId: SYSADMIN,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toMatchObject({ kind: 'allowed' });
  });

  it('returns a capacity result instead of truncating 251 active teachers', async () => {
    const db = new MemoryDb();
    seedBase(db);
    for (let index = 0; index < 251; index += 1) {
      seedTeacher(
        db,
        `teacher_profiles:capacity-${index}`,
        `accounts:capacity-${index}`,
        `Capacity Teacher ${index}`,
      );
    }

    await expect(handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toEqual({ kind: 'portfolio_capacity_exceeded' });
  });

  it('keeps sentinel private data out of teacher, portfolio, and self-leadership shapes', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedRole(db, TEACHER_ACCOUNT, 'slt');
    const observationId = seedSubmittedObservation(db);
    db.seed('observation_public_comments', 'observation_public_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'Public comment sentinel.',
      createdAt: NOW,
    });
    db.seed('observation_private_comments', 'observation_private_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'PRIVATE-TEXT-SENTINEL',
      createdAt: NOW,
    });
    const teacher = expectAllowed(await handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: NOW_ISO,
    }));
    const portfolio = expectAllowed(await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    }));
    const selfLeadership = expectAllowed(await handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      teacherProfileId: TEACHER,
      now: NOW_ISO,
    }));

    for (const result of [teacher, portfolio, selfLeadership]) {
      const serialized = JSON.stringify(result);
      expect(serialized).not.toContain('PRIVATE-TEXT-SENTINEL');
      expect(serialized).not.toContain('privateComments');
      expect(serialized).not.toContain('privateCommentCount');
      expect(serialized).not.toContain('hasPrivateComment');
    }
    await expect(handler(listLeadershipPrivateComments)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    })).resolves.toMatchObject({ kind: 'denied', reason: 'self_private_denied' });
  });

  it('returns private comments only to an authorized leader in current scope', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const observationId = seedSubmittedObservation(db);
    db.seed('observation_public_comments', 'observation_public_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'Public comment.',
      createdAt: NOW,
    });
    db.seed('observation_private_comments', 'observation_private_comments:one', {
      organizationId: ORG,
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: LEADER,
      content: 'Private comment.',
      createdAt: NOW,
    });

    const publicResult = expectAllowed(await handler(listLeadershipPublicComments)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    }));
    const privateResult = expectAllowed(await handler(listLeadershipPrivateComments)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    }));
    const teacherPublic = expectAllowed(await handler(listMyPublicComments)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      paginationOpts: { cursor: null, numItems: 20 },
    }));

    expect(JSON.stringify(publicResult)).toContain('Public comment.');
    expect(JSON.stringify(publicResult)).not.toContain('Private comment.');
    expect(JSON.stringify(privateResult)).toContain('Private comment.');
    expect(JSON.stringify(teacherPublic)).toContain('Public comment.');
    expect(JSON.stringify(teacherPublic)).not.toContain('Private comment.');

    const outsideLeader = 'accounts:outside-leader';
    seedAccount(db, outsideLeader, 'Outside Leader', OTHER_ORG);
    seedRole(db, outsideLeader, 'slt', OTHER_ORG);
    await expect(handler(listLeadershipPrivateComments)(db.context(), {
      actorAccountId: outsideLeader,
      teacherProfileId: TEACHER,
      paginationOpts: { cursor: null, numItems: 20 },
    })).resolves.toMatchObject({ kind: 'denied', reason: 'cross_organization' });
  });

  it('stores public and private comments separately without changing scoring or order', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedAttention(db);
    const observationId = seedSubmittedObservation(db);
    const scoringBefore = scoringSnapshot(db);
    const portfolioBefore = await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    });

    await expect(handler(addPublicObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: ' Teacher-visible comment. ',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'created' });
    await expect(handler(addPrivateObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: ' Leadership-only comment. ',
      now: NOW + 1,
    })).resolves.toMatchObject({ kind: 'created' });

    expect(db.rows('observation_public_comments')).toHaveLength(1);
    expect(db.rows('observation_public_comments')[0]).toMatchObject({
      content: 'Teacher-visible comment.',
      authorAccountId: LEADER,
      teacherProfileId: TEACHER,
    });
    expect(db.rows('observation_private_comments')).toHaveLength(1);
    expect(db.rows('observation_private_comments')[0]).toMatchObject({
      content: 'Leadership-only comment.',
      authorAccountId: LEADER,
      teacherProfileId: TEACHER,
    });
    expect(scoringSnapshot(db)).toEqual(scoringBefore);
    await expect(handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: LEADER,
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    })).resolves.toEqual(portfolioBefore);
  });

  it('rejects invalid, self-subject, and sysadmin-only comment writes before insert', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedRole(db, TEACHER_ACCOUNT, 'slt');
    const observationId = seedSubmittedObservation(db);

    await expect(handler(addPublicObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: ' '.repeat(5),
      now: NOW,
    })).resolves.toMatchObject({ kind: 'invalid_comment' });
    await expect(handler(addPublicObservationComment)(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: 'x'.repeat(4_001),
      now: NOW,
    })).resolves.toMatchObject({ kind: 'invalid_comment' });
    await expect(handler(addPrivateObservationComment)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: 'Self comment.',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'self_evaluation_denied' });
    await expect(handler(addPrivateObservationComment)(db.context(), {
      actorAccountId: SYSADMIN,
      observationId,
      content: 'Sysadmin comment.',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'denied', reason: 'capability_not_granted' });
    expect(db.rows('observation_public_comments')).toEqual([]);
    expect(db.rows('observation_private_comments')).toEqual([]);
  });

  it('keeps the first teacher response final and makes no scoring write', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const observationId = seedSubmittedObservation(db);
    const before = scoringSnapshot(db);
    const submit = handler(submitTeacherResponse);
    const first = await submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: ' My final response. ',
      now: NOW,
    });
    const second = await submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: 'Replacement response.',
      now: NOW + 1,
    });

    expect(first).toMatchObject({ kind: 'submitted' });
    expect(second).toEqual({ kind: 'response_exists' });
    expect(db.rows('teacher_observation_responses')).toHaveLength(1);
    expect(db.rows('teacher_observation_responses')[0]).toMatchObject({
      observationId,
      teacherProfileId: TEACHER,
      authorAccountId: TEACHER_ACCOUNT,
      content: 'My final response.',
    });
    expect(scoringSnapshot(db)).toEqual(before);

    const teacherReport = expectAllowed(await handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: NOW_ISO,
    }));
    const leaderReport = expectAllowed(await handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: LEADER,
      teacherProfileId: TEACHER,
      now: NOW_ISO,
    }));
    expect(JSON.stringify(teacherReport)).toContain('My final response.');
    expect(JSON.stringify(leaderReport)).toContain('My final response.');
  });

  it('rejects a second-person response, empty response, and response to a draft', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const observationId = seedSubmittedObservation(db);
    const draftId = 'observation_records:draft';
    db.seed('observation_records', draftId, {
      ...db.rows('observation_records')[0],
      status: 'draft',
      submissionKey: undefined,
      submittedAt: undefined,
      publishedAt: undefined,
    });
    const submit = handler(submitTeacherResponse);

    await expect(submit(db.context(), {
      actorAccountId: LEADER,
      observationId,
      content: 'Leader reply.',
      now: NOW,
    })).resolves.toMatchObject({ kind: 'denied' });
    await expect(submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId,
      content: '',
      now: NOW,
    })).resolves.toEqual({ kind: 'invalid_response' });
    await expect(submit(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      observationId: draftId,
      content: 'Response to draft.',
      now: NOW,
    })).resolves.toEqual({ kind: 'not_found' });
    expect(db.rows('teacher_observation_responses')).toEqual([]);
  });
});
