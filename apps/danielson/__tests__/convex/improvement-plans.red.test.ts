import { describe, expect, it } from 'vitest';

import {
  acknowledgeImprovementPlan,
  approveImprovementPlan,
  closeImprovementPlan,
  createImprovementPlanProposal,
  listScopedImprovementPlans,
  readImprovementPlan,
  readImprovementPlanReportProjection,
} from '../../convex/improvementPlans';

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

  snapshot(tableNames: string[]) {
    return structuredClone(Object.fromEntries(
      tableNames.map((name) => [name, this.rows(name)]),
    ));
  }

  async get(id: unknown) {
    if (typeof id !== 'string') return null;
    for (const rows of this.tables.values()) {
      const value = rows.get(id);
      if (value) return value;
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
    for (const rows of this.tables.values()) {
      const current = rows.get(id);
      if (current) {
        rows.set(id, { ...current, ...patch });
        return;
      }
    }
    throw new Error(`Missing ${id}`);
  }

  async delete(id: string) {
    for (const rows of this.tables.values()) {
      if (rows.delete(id)) return;
    }
    throw new Error(`Missing ${id}`);
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
      collect: async () => {
        throw new Error(`Unbounded collect is prohibited for ${tableName}`);
      },
    };
    return query;
  }

  context() {
    return { db: this };
  }

  private table(name: string) {
    let table = this.tables.get(name);
    if (!table) {
      table = new Map();
      this.tables.set(name, table);
    }
    return table;
  }
}

const ORG = 'organizations:one';
const OTHER_ORG = 'organizations:other';
const PROPOSER = 'accounts:proposer';
const SLT = 'accounts:slt';
const TEACHER_ACCOUNT = 'accounts:teacher';
const TEACHER = 'teacher_profiles:teacher';
const DEPARTMENT = 'departments:math';
const NOW = Date.parse('2026-09-01T00:00:00.000Z');

function seedAccount(db: MemoryDb, id: string, displayName: string, organizationId = ORG) {
  db.seed('accounts', id, {
    organizationId,
    username: id,
    displayName,
    sharedSessionRole: id === TEACHER_ACCOUNT ? 'teacher' : 'admin',
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
    createdByAccountId: SLT,
    createdAt: NOW,
  });
}

function seedBase(db: MemoryDb) {
  db.seed('organizations', ORG, {
    slug: 'one', name: 'School One', isActive: true, activeSysadminCount: 1,
    createdAt: NOW, updatedAt: NOW,
  });
  db.seed('organizations', OTHER_ORG, {
    slug: 'other', name: 'Other', isActive: true, activeSysadminCount: 1,
    createdAt: NOW, updatedAt: NOW,
  });
  seedAccount(db, PROPOSER, 'Supervisor One');
  seedAccount(db, SLT, 'SLT One');
  seedAccount(db, TEACHER_ACCOUNT, 'Teacher One');
  seedRole(db, PROPOSER, 'school_head');
  seedRole(db, SLT, 'slt');
  seedRole(db, TEACHER_ACCOUNT, 'teacher');
  db.seed('teacher_profiles', TEACHER, {
    organizationId: ORG,
    accountId: TEACHER_ACCOUNT,
    position: 'Mathematics Teacher',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('departments', DEPARTMENT, {
    organizationId: ORG,
    key: 'math',
    name: 'Mathematics',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('department_memberships', 'department_memberships:teacher', {
    organizationId: ORG,
    departmentId: DEPARTMENT,
    teacherProfileId: TEACHER,
    status: 'active',
    createdByAccountId: SLT,
    createdAt: NOW,
  });
}

function proposalArgs(actorAccountId = PROPOSER) {
  return {
    actorAccountId,
    teacherProfileId: TEACHER,
    planId: null,
    requestId: 'request:proposal:one',
    expectedRevision: 0,
    position: 'Mathematics Teacher',
    departmentId: DEPARTMENT,
    reviewMeetingDate: '2026-09-20',
    requestedPlanEndDate: null,
    purpose: 'Improve lesson coherence.',
    areasOfConcern: 'Lesson tasks do not follow a clear sequence.',
    expectedStandard: 'Danielson Proficient.',
    requiredActions: 'Use Double Plan for each observed lesson.',
    evidenceOfImprovement: 'Walkthrough and formal-observation evidence.',
    schoolSupport: 'Weekly planning meeting with the HOD.',
    successfulCompletionCriteria: 'Rating 3 or higher on the target.',
    targets: [{
      componentId: 'danielson.framework.component.1e',
      skillId: 'danielson.tlac.skill.double-plan',
      expectedRating: 3,
    }],
    now: NOW,
  };
}

async function propose(db: MemoryDb, actorAccountId = PROPOSER) {
  return handler(createImprovementPlanProposal)(db.context(), proposalArgs(actorAccountId));
}

async function approve(db: MemoryDb, proposal: Record<string, unknown>, actorAccountId = SLT) {
  return handler(approveImprovementPlan)(db.context(), {
    actorAccountId,
    planId: proposal.planId,
    versionId: proposal.versionId,
    requestId: 'request:approval:one',
    expectedRevision: 1,
    now: NOW,
  });
}

const SCORING_TABLES = [
  'teacher_proficiency',
  'teacher_knowledge_state',
  'teacher_srs_cards',
  'teacher_srs_reviews',
  'teacher_priority',
  'teacher_attention_summaries',
];

describe('PIP persistence and authorization', () => {
  it.each(['hod', 'coach', 'school_head', 'slt'] as const)(
    'permits an in-scope %s proposal',
    async (role) => {
      const db = new MemoryDb();
      seedBase(db);
      db.seed('role_assignments', `role_assignments:${PROPOSER}:school_head`, {
        organizationId: ORG,
        accountId: PROPOSER,
        role,
        status: 'active',
        createdByAccountId: SLT,
        createdAt: NOW,
      });
      if (role === 'hod') {
        db.seed('hod_assignments', 'hod_assignments:one', {
          organizationId: ORG,
          accountId: PROPOSER,
          departmentId: DEPARTMENT,
          status: 'active',
          createdByAccountId: SLT,
          createdAt: NOW,
        });
      }
      if (role === 'coach') {
        db.seed('coach_assignments', 'coach_assignments:one', {
          organizationId: ORG,
          accountId: PROPOSER,
          teacherProfileId: TEACHER,
          status: 'active',
          createdByAccountId: SLT,
          createdAt: NOW,
        });
      }

      await expect(propose(db)).resolves.toMatchObject({ kind: 'proposed' });
    },
  );

  it.each(['teacher', 'sysadmin'])(
    'denies a %s-only proposal before protected writes',
    async (role) => {
      const db = new MemoryDb();
      seedBase(db);
      const actor = role === 'teacher' ? TEACHER_ACCOUNT : 'accounts:sysadmin';
      if (role === 'sysadmin') {
        seedAccount(db, actor, 'System Administrator');
        seedRole(db, actor, role);
      }
      const before = db.snapshot([
        'improvement_plans',
        'improvement_plan_versions',
        'improvement_plan_targets',
        'improvement_plan_events',
      ]);
      await expect(propose(db, actor)).resolves.toMatchObject({ kind: 'denied' });
      expect(db.snapshot(Object.keys(before))).toEqual(before);
    },
  );

  it('keeps a proposal inactive and byte-isolates every scoring table', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const scoring = db.snapshot(SCORING_TABLES);
    const result = await propose(db) as Record<string, unknown>;

    expect(result).toMatchObject({ kind: 'proposed', revision: 1, version: 1 });
    expect(db.snapshot(SCORING_TABLES)).toEqual(scoring);
    expect(db.rows('improvement_plans')[0]).toMatchObject({ state: 'proposed' });
    expect(db.rows('improvement_plans')[0]).not.toHaveProperty('activeVersionId');
    await expect(handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      now: NOW,
    })).resolves.toMatchObject({
      kind: 'allowed',
      projection: { contractVersion: 'danielson.ip-progress.v1', state: 'pending_approval' },
    });
    await expect(handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      teacherProfileId: TEACHER,
      now: NOW,
    })).resolves.toMatchObject({
      kind: 'allowed',
      projection: { contractVersion: 'danielson.ip-progress.v1', state: 'not_configured' },
    });
  });

  it('uses one request identity for replay and rejects changed content', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const first = await propose(db);
    const replay = await propose(db);
    const conflict = await handler(createImprovementPlanProposal)(db.context(), {
      ...proposalArgs(),
      purpose: 'Changed purpose.',
    });
    expect(first).toMatchObject({ kind: 'proposed' });
    expect(replay).toMatchObject({ kind: 'replayed' });
    expect(conflict).toEqual({ kind: 'idempotency_conflict' });
    expect(db.rows('improvement_plan_versions')).toHaveLength(1);
  });
});

describe('PIP approval, versions, acknowledgment, and closure', () => {
  it('requires SLT approval, defaults to 30 days, and freezes the active version', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const proposal = await propose(db) as Record<string, unknown>;

    await expect(approve(db, proposal, PROPOSER)).resolves.toMatchObject({ kind: 'denied' });
    const result = await approve(db, proposal) as Record<string, unknown>;
    expect(result).toMatchObject({
      kind: 'approved',
      revision: 2,
      planStartAt: NOW,
      planEndAt: NOW + 30 * 86_400_000,
    });
    expect(db.rows('improvement_plans')[0]).toMatchObject({
      state: 'active',
      revision: 2,
      activeVersionId: proposal.versionId,
    });
    expect(db.rows('improvement_plan_targets')).toHaveLength(1);
    expect(db.rows('improvement_plan_events').map((event) => event.kind))
      .toEqual(['proposed', 'approved']);
    await expect(approve(db, proposal)).resolves.toMatchObject({
      kind: 'replayed',
      planStartAt: NOW,
      planEndAt: NOW + 30 * 86_400_000,
    });
  });

  it('creates a pending revision without modifying the approved version', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const proposal = await propose(db) as Record<string, unknown>;
    await approve(db, proposal);
    const originalVersion = structuredClone(db.rows('improvement_plan_versions')[0]);

    const revision = await handler(createImprovementPlanProposal)(db.context(), {
      ...proposalArgs(),
      planId: proposal.planId,
      requestId: 'request:proposal:two',
      expectedRevision: 2,
      purpose: 'Revised purpose.',
      now: NOW + 1_000,
    });
    expect(revision).toMatchObject({ kind: 'proposed', version: 2, revision: 3 });
    expect(db.rows('improvement_plan_versions')[0]).toEqual(originalVersion);
    expect(db.rows('improvement_plans')[0]).toMatchObject({
      state: 'active',
      activeVersionId: proposal.versionId,
      pendingVersionId: expect.not.stringMatching(String(proposal.versionId)),
    });
  });

  it('records one teacher and one frozen-supervisor acknowledgment without a signature claim', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const proposal = await propose(db) as Record<string, unknown>;
    await approve(db, proposal);
    const acknowledge = handler(acknowledgeImprovementPlan);

    const teacherResult = await acknowledge(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'teacher',
      requestId: 'request:ack:teacher',
      now: NOW + 2_000,
    });
    const supervisorResult = await acknowledge(db.context(), {
      actorAccountId: PROPOSER,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'supervisor',
      requestId: 'request:ack:supervisor',
      now: NOW + 3_000,
    });
    expect(teacherResult).toMatchObject({ kind: 'acknowledged', acknowledgmentKind: 'teacher' });
    expect(supervisorResult).toMatchObject({ kind: 'acknowledged', acknowledgmentKind: 'supervisor' });
    expect(db.rows('improvement_plan_acknowledgments')).toHaveLength(2);
    expect(JSON.stringify(db.rows('improvement_plan_acknowledgments'))).not.toMatch(/signature/i);

    await expect(acknowledge(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'teacher',
      requestId: 'request:ack:changed',
      now: NOW + 4_000,
    })).resolves.toEqual({ kind: 'acknowledgment_exists' });
  });

  it('lets only SLT close with a human outcome and immutable target snapshot', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const proposal = await propose(db) as Record<string, unknown>;
    await approve(db, proposal);
    const close = handler(closeImprovementPlan);

    await expect(close(db.context(), {
      actorAccountId: PROPOSER,
      planId: proposal.planId,
      requestId: 'request:close:one',
      expectedRevision: 2,
      outcome: 'successful',
      note: 'Targets met.',
      now: NOW + 31 * 86_400_000,
    })).resolves.toMatchObject({ kind: 'denied' });
    const result = await close(db.context(), {
      actorAccountId: SLT,
      planId: proposal.planId,
      requestId: 'request:close:one',
      expectedRevision: 2,
      outcome: 'insufficient_improvement',
      note: 'The approved targets were not sustained.',
      now: NOW + 31 * 86_400_000,
    });
    expect(result).toMatchObject({ kind: 'closed', outcome: 'insufficient_improvement' });
    expect(JSON.stringify(result)).not.toMatch(/recommendation|retention|termination/i);
    expect(db.rows('improvement_plans')[0]).toMatchObject({ state: 'closed', revision: 3 });
    expect(db.rows('improvement_plan_events').at(-1)).toMatchObject({
      kind: 'closed',
      payload: expect.objectContaining({
        outcome: 'insufficient_improvement',
        note: 'The approved targets were not sustained.',
        targetResults: expect.any(Array),
      }),
    });
    await expect(close(db.context(), {
      actorAccountId: SLT,
      planId: proposal.planId,
      requestId: 'request:close:one',
      expectedRevision: 2,
      outcome: 'insufficient_improvement',
      note: 'The approved targets were not sustained.',
      now: NOW + 31 * 86_400_000,
    })).resolves.toMatchObject({ kind: 'replayed', outcome: 'insufficient_improvement' });
    await expect(handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      now: NOW + 31 * 86_400_000,
    })).resolves.toMatchObject({
      kind: 'allowed',
      projection: { state: 'closed', outcome: 'insufficient_improvement' },
    });
    await expect(handler(readImprovementPlan)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      now: NOW + 31 * 86_400_000,
    })).resolves.toMatchObject({
      kind: 'allowed',
      plan: { state: 'closed', closureOutcome: 'insufficient_improvement', closureNote: null },
    });
  });

  it('paginates scoped plans and returns approved content only to the subject teacher', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const proposal = await propose(db) as Record<string, unknown>;
    const beforeApproval = await handler(readImprovementPlan)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      now: NOW,
    });
    expect(beforeApproval).toMatchObject({ kind: 'denied' });
    await approve(db, proposal);
    const teacherRead = await handler(readImprovementPlan)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      now: NOW,
    });
    expect(teacherRead).toMatchObject({
      kind: 'allowed',
      plan: { state: 'active', activeVersion: { version: 1 } },
    });
    expect(teacherRead).toMatchObject({ plan: { closureNote: null } });
    const list = await handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: null, numItems: 25 },
      now: NOW,
    });
    expect(list).toMatchObject({ kind: 'allowed', page: { page: [{ state: 'active' }] } });
  });
});
