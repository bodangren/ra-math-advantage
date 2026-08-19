import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

import * as improvementPlanModule from '../../convex/improvementPlans';
import {
  acknowledgeImprovementPlan,
  approveImprovementPlan,
  closeImprovementPlan,
  createImprovementPlanProposal,
  listScopedImprovementPlans,
  readImprovementPlanProposalWorkspace,
  readImprovementPlan,
  readImprovementPlanReportProjection,
} from '../../convex/improvementPlans';
import { readRankedTeacherQueue } from '../../convex/observations';
import {
  readLeadershipPortfolio,
  readLeadershipTeacherReport,
  readMyTeacherReport,
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
  readonly queryCalls: string[] = [];

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
    this.queryCalls.push(tableName);
    let matches = this.rows(tableName);
    let descending = false;
    const query = {
      withIndex: (
        _name: string,
        configure: (builder: {
          eq: (field: string, value: unknown) => unknown;
          gte: (field: string, value: number) => unknown;
        }) => unknown,
      ) => {
        const equalities: Array<[string, unknown]> = [];
        const lowerBounds: Array<[string, number]> = [];
        const builder = {
          eq: (field: string, value: unknown) => {
            equalities.push([field, value]);
            return builder;
          },
          gte: (field: string, value: number) => {
            lowerBounds.push([field, value]);
            return builder;
          },
        };
        configure(builder);
        matches = matches.filter((document) => (
          equalities.every(([field, value]) => document[field] === value)
          && lowerBounds.every(([field, value]) => Number(document[field]) >= value)
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
        if (!Number.isInteger(start) || start < 0) throw new Error('Invalid cursor');
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

  clearQueryCalls() {
    this.queryCalls.length = 0;
  }

  queryCount(tableName: string) {
    return this.queryCalls.filter((name) => name === tableName).length;
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
const DAY_MS = 86_400_000;

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

function seedTeacher(
  db: MemoryDb,
  suffix: string,
  departmentId: string,
  organizationId = ORG,
) {
  const accountId = `accounts:teacher-${suffix}`;
  const teacherProfileId = `teacher_profiles:teacher-${suffix}`;
  seedAccount(db, accountId, `Teacher ${suffix}`, organizationId);
  seedRole(db, accountId, 'teacher', organizationId);
  db.seed('teacher_profiles', teacherProfileId, {
    organizationId,
    accountId,
    position: 'Teacher',
    isActive: true,
    createdAt: NOW,
    updatedAt: NOW,
  });
  db.seed('department_memberships', `department_memberships:${suffix}`, {
    organizationId,
    departmentId,
    teacherProfileId,
    status: 'active',
    createdByAccountId: SLT,
    createdAt: NOW,
  });
  return teacherProfileId;
}

function seedPlan(
  db: MemoryDb,
  suffix: string,
  teacherProfileId = TEACHER,
  updatedAt = NOW,
) {
  const planId = `improvement_plans:${suffix}`;
  const versionId = `improvement_plan_versions:${suffix}`;
  db.seed('improvement_plans', planId, {
    organizationId: ORG,
    teacherProfileId,
    state: 'proposed',
    revision: 1,
    latestVersion: 1,
    pendingVersionId: versionId,
    createdAt: updatedAt,
    updatedAt,
  });
  db.seed('improvement_plan_versions', versionId, {
    organizationId: ORG,
    planId,
    teacherProfileId,
    version: 1,
    proposerAccountId: PROPOSER,
    supervisorAccountId: PROPOSER,
    teacherName: `Teacher ${suffix}`,
    position: 'Teacher',
    departmentId: DEPARTMENT,
    departmentName: 'Mathematics',
    requestedPlanEndDate: null,
    reviewMeetingDate: '2026-09-20',
    purpose: `Purpose ${suffix}`,
    areasOfConcern: 'Concern.',
    expectedStandard: 'Danielson Proficient.',
    requiredActions: 'Required action.',
    evidenceOfImprovement: 'Rated evidence.',
    schoolSupport: 'School support.',
    successfulCompletionCriteria: 'Expected rating met.',
    insufficientImprovementConsequences: 'Consequences.',
    acknowledgmentText: 'Acknowledgment.',
    sourceId: 'school.pip-form.2026-08-19',
    sourceVersion: '1.0.0',
    sourceHash: 'source-hash',
    fingerprint: `fingerprint:${suffix}`,
    proposedAt: updatedAt,
  });
  db.seed('improvement_plan_targets', `improvement_plan_targets:${suffix}`, {
    organizationId: ORG,
    planId,
    versionId,
    teacherProfileId,
    ordinal: 0,
    componentId: 'danielson.framework.component.1e',
    componentTitle: '1e: Planning Coherent Instruction',
    skillId: 'danielson.tlac.skill.double-plan',
    skillTitle: 'The Double Plan',
    expectedRating: 3,
    expectedPoints: 90,
    sourceId: 'school.pip-form.2026-08-19',
    sourceVersion: '1.0.0',
    sourceHash: 'source-hash',
    createdAt: updatedAt,
  });
  return planId;
}

function seedPlanVersion(
  db: MemoryDb,
  input: {
    planId: string;
    version: number;
    purpose: string;
    versionId?: string;
  },
) {
  const versionId = input.versionId ?? `improvement_plan_versions:history-${input.version}`;
  db.seed('improvement_plan_versions', versionId, {
    organizationId: ORG,
    planId: input.planId,
    teacherProfileId: TEACHER,
    version: input.version,
    proposerAccountId: PROPOSER,
    supervisorAccountId: PROPOSER,
    teacherName: 'Teacher One',
    position: 'Mathematics Teacher',
    departmentId: DEPARTMENT,
    departmentName: 'Mathematics',
    supervisorName: 'Supervisor One',
    requestedPlanEndDate: null,
    reviewMeetingDate: '2026-09-20',
    purpose: input.purpose,
    areasOfConcern: 'Concern.',
    expectedStandard: 'Danielson Proficient.',
    requiredActions: 'Required action.',
    evidenceOfImprovement: 'Rated evidence.',
    schoolSupport: 'School support.',
    successfulCompletionCriteria: 'Expected rating met.',
    insufficientImprovementConsequences: 'Consequences.',
    acknowledgmentText: 'Acknowledgment.',
    sourceId: 'school.pip-form.2026-08-19',
    sourceVersion: '1.0.0',
    sourceHash: 'source-hash',
    fingerprint: `fingerprint:history:${input.version}`,
    proposedAt: NOW + input.version,
  });
  return versionId;
}

function seedClosedPlan(
  db: MemoryDb,
  suffix: string,
  teacherProfileId: string,
  createdAt: number,
  outcome: 'successful' | 'insufficient_improvement' = 'successful',
) {
  const planId = seedPlan(db, suffix, teacherProfileId, createdAt);
  const versionId = `improvement_plan_versions:${suffix}`;
  db.seed('improvement_plans', planId, {
    organizationId: ORG,
    teacherProfileId,
    state: 'closed',
    revision: 3,
    latestVersion: 1,
    activeVersionId: versionId,
    activeVersion: 1,
    activeTargets: [{
      componentId: 'danielson.framework.component.1e',
      skillId: 'danielson.tlac.skill.double-plan',
      expectedRating: 3,
    }],
    approvedAt: createdAt,
    planEndAt: createdAt + 30 * DAY_MS,
    reviewMeetingAt: createdAt + 20 * DAY_MS,
    closedAt: createdAt + 31 * DAY_MS,
    closureOutcome: outcome,
    closureNote: `Private closure note ${suffix}.`,
    closedTargetResults: [{
      componentId: 'danielson.framework.component.1e',
      skillId: 'danielson.tlac.skill.double-plan',
      expectedRating: 3,
      currentRating: null,
      state: 'no_plan_evidence',
      evidenceDueAt: createdAt + 7 * DAY_MS,
      evidenceDue: true,
      evidenceOverdue: true,
      sourceRecordId: null,
      evidenceIdempotencyKey: null,
    }],
    createdAt,
    updatedAt: createdAt + 31 * DAY_MS,
  });
  return planId;
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

async function proposeWith(db: MemoryDb, overrides: Record<string, unknown>) {
  return handler(createImprovementPlanProposal)(db.context(), {
    ...proposalArgs(),
    ...overrides,
  });
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

async function approveWith(
  db: MemoryDb,
  proposal: Record<string, unknown>,
  overrides: Record<string, unknown>,
) {
  return handler(approveImprovementPlan)(db.context(), {
    actorAccountId: SLT,
    planId: proposal.planId,
    versionId: proposal.versionId,
    requestId: 'request:approval:one',
    expectedRevision: proposal.revision,
    now: NOW,
    ...overrides,
  });
}

async function closeWith(
  db: MemoryDb,
  planId: unknown,
  overrides: Record<string, unknown> = {},
) {
  return handler(closeImprovementPlan)(db.context(), {
    actorAccountId: SLT,
    planId,
    requestId: 'request:close:one',
    expectedRevision: 2,
    outcome: 'successful',
    note: 'The approved targets were sustained.',
    now: NOW + 31 * DAY_MS,
    ...overrides,
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
  it('does not require the client-owned position in the proposal mutation contract', () => {
    const args = JSON.parse(
      (createImprovementPlanProposal as unknown as { exportArgs(): string }).exportArgs(),
    ) as { value: Record<string, unknown> };

    expect(args.value).not.toHaveProperty('position');
  });

  it('returns one scoped proposal workspace with approved target options', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const result = await handler(readImprovementPlanProposalWorkspace)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
    });
    expect(result).toMatchObject({
      kind: 'allowed',
      teacher: {
        teacherProfileId: TEACHER,
        displayName: 'Teacher One',
        position: 'Mathematics Teacher',
      },
      departments: [{ departmentId: DEPARTMENT, departmentName: 'Mathematics' }],
    });
    expect((result as { targetOptions: unknown[] }).targetOptions).toHaveLength(63);
  });

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

  it('authorizes the actor before organization-wide PIP reads', async () => {
    const db = new MemoryDb();
    seedBase(db);

    const reads = [
      () => handler(readLeadershipPortfolio)(db.context(), {
        actorAccountId: TEACHER_ACCOUNT,
        now: new Date(NOW).toISOString(),
        cursor: null,
        pageSize: 25,
      }),
      () => handler(readRankedTeacherQueue)(db.context(), {
        actorAccountId: TEACHER_ACCOUNT,
        now: new Date(NOW).toISOString(),
      }),
    ];
    for (const read of reads) {
      db.clearQueryCalls();
      await expect(read()).resolves.toMatchObject({ kind: 'denied' });
      for (const protectedTable of [
        'improvement_plans',
        'teacher_observation_outcomes',
        'teacher_evidence_supersessions',
      ]) expect(db.queryCalls).not.toContain(protectedTable);
    }
  });

  it('paginates only scoped plans and preserves the opaque source cursor', async () => {
    const db = new MemoryDb();
    seedBase(db);
    db.seed('role_assignments', `role_assignments:${PROPOSER}:school_head`, {
      organizationId: ORG,
      accountId: PROPOSER,
      role: 'hod',
      status: 'active',
      createdByAccountId: SLT,
      createdAt: NOW,
    });
    db.seed('hod_assignments', 'hod_assignments:math', {
      organizationId: ORG,
      accountId: PROPOSER,
      departmentId: DEPARTMENT,
      status: 'active',
      createdByAccountId: SLT,
      createdAt: NOW,
    });
    const science = 'departments:science';
    db.seed('departments', science, {
      organizationId: ORG,
      key: 'science',
      name: 'Science',
      isActive: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    const outOfScopeTeacher = seedTeacher(db, 'science', science);
    seedPlan(db, 'out-of-scope-1', outOfScopeTeacher, NOW + 1);
    seedPlan(db, 'out-of-scope-2', outOfScopeTeacher, NOW + 2);

    const result = await handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: null, numItems: 1 },
      now: NOW,
    });
    expect(result).toEqual({
      kind: 'allowed',
      page: { page: [], isDone: false, continueCursor: '1' },
    });
  });

  it('loads list authorization once instead of once per plan row', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedPlan(db, 'visible-1', TEACHER, NOW + 1);
    seedPlan(db, 'visible-2', TEACHER, NOW + 2);
    seedPlan(db, 'visible-3', TEACHER, NOW + 3);
    db.clearQueryCalls();

    const result = await handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: null, numItems: 3 },
      now: NOW,
    }) as { kind: string; page: { page: unknown[] } };
    expect(result.kind).toBe('allowed');
    expect(result.page.page).toHaveLength(3);
    expect(db.queryCount('role_assignments')).toBeLessThanOrEqual(1);
    expect(db.queryCount('hod_assignments')).toBeLessThanOrEqual(1);
    expect(db.queryCount('coach_assignments')).toBeLessThanOrEqual(1);
  });

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
    const selfReport = await handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: new Date(NOW).toISOString(),
    });
    expect(selfReport).toMatchObject({
      kind: 'allowed',
      report: {
        improvementPlan: {
          contractVersion: 'danielson.ip-progress.v1',
          state: 'not_configured',
        },
      },
    });
    expect(JSON.stringify(selfReport)).not.toContain(String(result.planId));
    expect(JSON.stringify(selfReport)).not.toContain('pending_approval');
  });

  it('adds an approved target to the walkthrough queue and leadership portfolio', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const proposal = await propose(db) as Record<string, unknown>;
    await approve(db, proposal);

    const queue = await handler(readRankedTeacherQueue)(db.context(), {
      actorAccountId: PROPOSER,
      now: new Date(NOW + DAY_MS).toISOString(),
    }) as { kind: string; items: Array<{ targets: Array<Record<string, unknown>> }> };
    expect(queue.kind).toBe('allowed');
    expect(queue.items[0]?.targets).toEqual(expect.arrayContaining([
      expect.objectContaining({
        skillId: 'danielson.tlac.skill.double-plan',
        reason: 'approved_plan_priority',
        approvedPriorityInputs: expect.arrayContaining(['approved_plan_priority']),
      }),
    ]));

    const portfolio = await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: PROPOSER,
      now: new Date(NOW + 8 * DAY_MS).toISOString(),
      cursor: null,
      pageSize: 25,
    }) as { kind: string; page: { items: Array<Record<string, unknown>> } };
    expect(portfolio.kind).toBe('allowed');
    expect(portfolio.page.items[0]).toMatchObject({
      improvementPlan: { state: 'active', trackState: 'off_track' },
      attentionReasons: expect.arrayContaining(['ip_off_track']),
    });
  });

  it('fingerprints the complete proposal command and replays before mutable plan checks', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const first = await propose(db) as Record<string, unknown>;
    await approve(db, first);
    const replay = await propose(db);
    const conflict = await handler(createImprovementPlanProposal)(db.context(), {
      ...proposalArgs(),
      purpose: 'Changed purpose.',
    });
    const planConflict = await proposeWith(db, { planId: first.planId });
    const revisionConflict = await proposeWith(db, { expectedRevision: 1 });
    expect(first).toMatchObject({ kind: 'proposed' });
    expect(replay).toMatchObject({ kind: 'replayed' });
    expect(conflict).toEqual({ kind: 'idempotency_conflict' });
    expect(planConflict).toEqual({ kind: 'idempotency_conflict' });
    expect(revisionConflict).toEqual({ kind: 'idempotency_conflict' });
    expect(db.rows('improvement_plan_versions')).toHaveLength(1);
  });

  it('uses the teacher profile position instead of a client-supplied position', async () => {
    const db = new MemoryDb();
    seedBase(db);

    await expect(proposeWith(db, { position: 'Chief Executive Officer' }))
      .resolves.toMatchObject({ kind: 'proposed' });
    expect(db.rows('improvement_plan_versions')[0]).toMatchObject({
      position: 'Mathematics Teacher',
    });
  });

  it.each([
    'purpose',
    'areasOfConcern',
    'expectedStandard',
    'requiredActions',
    'evidenceOfImprovement',
    'schoolSupport',
    'successfulCompletionCriteria',
  ] as const)('enforces the 4,000-character server limit for %s', async (field) => {
    const db = new MemoryDb();
    seedBase(db);

    await expect(proposeWith(db, { [field]: 'x'.repeat(4_001) })).resolves.toEqual({
      kind: 'invalid',
      reason: `invalid_${field}`,
    });
    expect(db.rows('improvement_plans')).toHaveLength(0);
  });

  it.each(['', '   ', 'x'.repeat(129)])(
    'rejects an empty or oversized request ID before each lifecycle write: %j',
    async (requestId) => {
      const proposalDb = new MemoryDb();
      seedBase(proposalDb);
      await expect(proposeWith(proposalDb, { requestId })).resolves.toEqual({
        kind: 'invalid',
        reason: 'invalid_request_id',
      });

      const approvalDb = new MemoryDb();
      seedBase(approvalDb);
      const pending = await propose(approvalDb) as Record<string, unknown>;
      await expect(approveWith(approvalDb, pending, { requestId })).resolves.toEqual({
        kind: 'invalid',
        reason: 'invalid_request_id',
      });

      const activeDb = new MemoryDb();
      seedBase(activeDb);
      const activeProposal = await propose(activeDb) as Record<string, unknown>;
      await approve(activeDb, activeProposal);
      await expect(handler(acknowledgeImprovementPlan)(activeDb.context(), {
        actorAccountId: TEACHER_ACCOUNT,
        planId: activeProposal.planId,
        versionId: activeProposal.versionId,
        kind: 'teacher',
        requestId,
        expectedRevision: 2,
        now: NOW + 1_000,
      })).resolves.toEqual({ kind: 'invalid', reason: 'invalid_request_id' });
      await expect(closeWith(activeDb, activeProposal.planId, { requestId })).resolves.toEqual({
        kind: 'invalid',
        reason: 'invalid_request_id',
      });
    },
  );
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
    const approvalEvent = db.rows('improvement_plan_events').find((event) => event.kind === 'approved');
    expect(approvalEvent).toBeDefined();
    expect(db.rows('improvement_plans')[0]).toMatchObject({
      approvalEventId: approvalEvent?._id,
    });
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

    await expect(acknowledge(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'teacher',
      requestId: 'request:ack:stale',
      expectedRevision: 1,
      now: NOW + 1_000,
    })).resolves.toEqual({ kind: 'revision_conflict' });

    const teacherResult = await acknowledge(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'teacher',
      requestId: 'request:ack:teacher',
      expectedRevision: 2,
      now: NOW + 2_000,
    });
    const supervisorResult = await acknowledge(db.context(), {
      actorAccountId: PROPOSER,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'supervisor',
      requestId: 'request:ack:supervisor',
      expectedRevision: 2,
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
      expectedRevision: 2,
      now: NOW + 4_000,
    })).resolves.toEqual({ kind: 'acknowledgment_exists' });

    const revision = await proposeWith(db, {
      planId: proposal.planId,
      requestId: 'request:proposal:revision',
      expectedRevision: 2,
      purpose: 'Revised purpose.',
      now: NOW + 5_000,
    }) as Record<string, unknown>;
    await approveWith(db, revision, {
      requestId: 'request:approval:revision',
      expectedRevision: 3,
      now: NOW + 6_000,
    });
    await expect(acknowledge(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'teacher',
      requestId: 'request:ack:teacher',
      expectedRevision: 2,
      now: NOW + 7_000,
    })).resolves.toMatchObject({ kind: 'replayed', acknowledgmentKind: 'teacher' });
    await expect(acknowledge(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: proposal.planId,
      versionId: proposal.versionId,
      kind: 'teacher',
      requestId: 'request:ack:teacher',
      expectedRevision: 3,
      now: NOW + 7_000,
    })).resolves.toEqual({ kind: 'idempotency_conflict' });
  });

  it('freezes target graph sources and rated evidence identity in active and closed progress', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const proposal = await propose(db) as Record<string, unknown>;
    await approve(db, proposal);

    expect(db.rows('improvement_plan_targets')[0]).toMatchObject({
      componentSourceRefs: expect.arrayContaining([
        expect.objectContaining({ source: 'Danielson Framework for Teaching 2022' }),
      ]),
      skillSourceRefs: expect.arrayContaining([
        expect.objectContaining({ source: 'Teach Like a Champion 3.0' }),
      ]),
    });

    const sourceRecordId = 'observation_records:plan-evidence';
    const evidenceIdempotencyKey = 'plan-evidence:key';
    db.seed('teacher_observation_outcomes', 'teacher_observation_outcomes:plan-evidence', {
      organizationId: ORG,
      teacherId: TEACHER,
      idempotencyKey: evidenceIdempotencyKey,
      occurredAt: NOW + DAY_MS,
      createdAt: NOW + DAY_MS,
      outcome: {
        kind: 'rated',
        organizationId: ORG,
        teacherId: TEACHER,
        sourceRecordId,
        sourceType: 'walkthrough',
        componentId: 'danielson.framework.component.1e',
        targetSkillIds: ['danielson.tlac.skill.double-plan'],
        observerId: PROPOSER,
        occurredAt: new Date(NOW + DAY_MS).toISOString(),
        sourceVersion: '1',
        provenanceGroupId: 'plan-evidence',
        idempotencyKey: evidenceIdempotencyKey,
        rating: 3,
        targetEvidence: [{
          skillId: 'danielson.tlac.skill.double-plan',
          componentId: 'danielson.framework.component.1e',
          rawRating: 3,
          points: 90,
          passes: true,
          srsRating: 'Good',
          idempotencyKey: evidenceIdempotencyKey,
          sourceRecordId,
          provenanceGroupId: 'plan-evidence',
          sourceType: 'walkthrough',
          occurredAt: new Date(NOW + DAY_MS).toISOString(),
        }],
      },
    });

    const active = await handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      now: NOW + 2 * DAY_MS,
    });
    expect(active).toMatchObject({
      kind: 'allowed',
      projection: {
        state: 'active',
        targets: [{
          skillId: 'danielson.tlac.skill.double-plan',
          currentRating: 3,
          sourceRecordId,
          evidenceIdempotencyKey,
        }],
      },
    });

    await closeWith(db, proposal.planId);
    expect(db.rows('improvement_plans')[0]).toMatchObject({
      closedTargetResults: [{ sourceRecordId, evidenceIdempotencyKey }],
    });
    expect(db.rows('improvement_plan_events').at(-1)).toMatchObject({
      kind: 'closed',
      payload: {
        targetResults: [{ sourceRecordId, evidenceIdempotencyKey }],
      },
    });
    await expect(handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      now: NOW + 32 * DAY_MS,
    })).resolves.toMatchObject({
      kind: 'allowed',
      projection: {
        state: 'closed',
        targets: [{ sourceRecordId, evidenceIdempotencyKey }],
      },
    });
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
    expect(db.rows('improvement_plans')[0]).toMatchObject({
      approvalEventId: db.rows('improvement_plan_events').find((event) => event.kind === 'approved')?._id,
      closureEventId: db.rows('improvement_plan_events').find((event) => event.kind === 'closed')?._id,
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
    await expect(close(db.context(), {
      actorAccountId: SLT,
      planId: proposal.planId,
      requestId: 'request:close:one',
      expectedRevision: 3,
      outcome: 'insufficient_improvement',
      note: 'The approved targets were not sustained.',
      now: NOW + 31 * 86_400_000,
    })).resolves.toEqual({ kind: 'idempotency_conflict' });
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
    const teacherReport = await handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: new Date(NOW + 31 * DAY_MS).toISOString(),
    }) as Record<string, unknown>;
    expect(teacherReport).toMatchObject({
      kind: 'allowed',
      report: { improvementPlan: { state: 'closed', outcome: 'insufficient_improvement' } },
    });
    expect(JSON.stringify(teacherReport)).not.toContain('The approved targets were not sustained.');
    await expect(handler(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      now: new Date(NOW + 31 * DAY_MS).toISOString(),
    })).resolves.toMatchObject({
      kind: 'allowed',
      visibility: 'private',
      report: {
        improvementPlan: {
          state: 'closed',
          closureNote: 'The approved targets were not sustained.',
        },
      },
    });
    const frozenProjection = await handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      now: NOW + 31 * DAY_MS,
    });
    db.seed('teacher_observation_outcomes', 'teacher_observation_outcomes:late-correction', {
      organizationId: ORG,
      teacherId: TEACHER,
      idempotencyKey: 'late-correction',
      occurredAt: NOW + DAY_MS,
      createdAt: NOW + 32 * DAY_MS,
      outcome: {
        kind: 'rated',
        organizationId: ORG,
        teacherId: TEACHER,
        sourceRecordId: 'observation_records:corrected',
        sourceType: 'walkthrough',
        componentId: 'danielson.framework.component.1e',
        targetSkillIds: ['danielson.tlac.skill.double-plan'],
        observerId: PROPOSER,
        occurredAt: new Date(NOW + DAY_MS).toISOString(),
        sourceVersion: '1',
        provenanceGroupId: 'correction',
        idempotencyKey: 'late-correction',
        rating: 4,
        targetEvidence: [{
          skillId: 'danielson.tlac.skill.double-plan',
          componentId: 'danielson.framework.component.1e',
          rawRating: 4,
          points: 100,
          passes: true,
          srsRating: 'Easy',
          idempotencyKey: 'late-correction',
          sourceRecordId: 'observation_records:corrected',
          provenanceGroupId: 'correction',
          sourceType: 'walkthrough',
          occurredAt: new Date(NOW + DAY_MS).toISOString(),
        }],
      },
    });
    await expect(handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      now: NOW + 33 * DAY_MS,
    })).resolves.toEqual(frozenProjection);
  });

  it('shows only the latest closed plan for each teacher in the leadership portfolio', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const first = await propose(db) as Record<string, unknown>;
    await approve(db, first);
    await closeWith(db, first.planId, {
      outcome: 'insufficient_improvement',
      note: 'The first plan did not meet its targets.',
    });

    const second = await proposeWith(db, {
      requestId: 'request:proposal:second-root',
      reviewMeetingDate: '2026-11-20',
      now: NOW + 32 * DAY_MS,
    }) as Record<string, unknown>;
    await approveWith(db, second, {
      requestId: 'request:approval:second-root',
      now: NOW + 32 * DAY_MS,
    });
    await closeWith(db, second.planId, {
      requestId: 'request:close:second-root',
      expectedRevision: 2,
      outcome: 'successful',
      note: 'The second plan met its targets.',
      now: NOW + 63 * DAY_MS,
    });

    const portfolio = await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: PROPOSER,
      now: new Date(NOW + 64 * DAY_MS).toISOString(),
      cursor: null,
      pageSize: 25,
    }) as { kind: string; page: { items: Array<Record<string, unknown>> } };
    expect(portfolio).toMatchObject({
      kind: 'allowed',
      page: {
        items: [{
          teacherProfileId: TEACHER,
          improvementPlan: {
            state: 'closed',
            planId: second.planId,
            outcome: 'successful',
          },
        }],
      },
    });
    expect(JSON.stringify(portfolio)).not.toContain(String(first.planId));
  });

  it('loads the latest closed plan for all portfolio teachers in one bounded batch', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const teacherIds = [TEACHER];
    for (const suffix of ['batch-a', 'batch-b', 'batch-c']) {
      teacherIds.push(seedTeacher(db, suffix, DEPARTMENT));
    }
    const latestPlanIds = teacherIds.map((teacherId, index) => {
      seedClosedPlan(db, `old-${index}`, teacherId, NOW - 100_000 - index);
      return seedClosedPlan(db, `latest-${index}`, teacherId, NOW + index, 'successful');
    });
    db.clearQueryCalls();

    const portfolio = await handler(readLeadershipPortfolio)(db.context(), {
      actorAccountId: PROPOSER,
      now: new Date(NOW + 32 * DAY_MS).toISOString(),
      cursor: null,
      pageSize: 25,
    }) as { kind: string; page: { items: Array<{ improvementPlan: Record<string, unknown> }> } };
    expect(portfolio.kind).toBe('allowed');
    expect(portfolio.page.items).toHaveLength(teacherIds.length);
    expect(portfolio.page.items.map((item) => item.improvementPlan.planId).sort())
      .toEqual([...latestPlanIds].sort());
    expect(db.queryCount('improvement_plans')).toBeLessThanOrEqual(3);
  });

  it('paginates scoped lifecycle history with prior approved versions and public-safe rows', async () => {
    const historyDefinition = (improvementPlanModule as Record<string, unknown>)
      .listImprovementPlanHistory;
    expect(historyDefinition).toBeDefined();
    if (!historyDefinition) return;
    const listHistory = handler(historyDefinition);
    const db = new MemoryDb();
    seedBase(db);
    const first = await propose(db) as Record<string, unknown>;
    await approve(db, first);
    const second = await proposeWith(db, {
      planId: first.planId,
      requestId: 'request:proposal:history-v2',
      expectedRevision: 2,
      purpose: 'Second approved purpose.',
      now: NOW + 1_000,
    }) as Record<string, unknown>;
    await approveWith(db, second, {
      requestId: 'request:approval:history-v2',
      expectedRevision: 3,
      now: NOW + 2_000,
    });
    const privateClosureNote = 'Private closure narrative.';
    await closeWith(db, first.planId, {
      requestId: 'request:close:history',
      expectedRevision: 4,
      note: privateClosureNote,
      now: NOW + 31 * DAY_MS,
    });

    await expect(listHistory(db.context(), {
      actorAccountId: PROPOSER,
      planId: first.planId,
      paginationOpts: { cursor: null, numItems: 51 },
    })).resolves.toEqual({ kind: 'invalid_page_size' });

    const events: Array<Record<string, unknown>> = [];
    let cursor: string | null = null;
    let firstPage: Record<string, unknown> | null = null;
    do {
      const result = await listHistory(db.context(), {
        actorAccountId: PROPOSER,
        planId: first.planId,
        paginationOpts: { cursor, numItems: 2 },
      }) as {
        kind: string;
        page: { page: Array<Record<string, unknown>>; isDone: boolean; continueCursor: string };
        priorApprovedVersions: Array<Record<string, unknown>>;
      };
      expect(result.kind).toBe('allowed');
      firstPage ??= result as unknown as Record<string, unknown>;
      events.push(...result.page.page);
      cursor = result.page.isDone ? null : result.page.continueCursor;
    } while (cursor !== null);

    expect(events.map((event) => event.kind).sort()).toEqual([
      'approved',
      'approved',
      'closed',
      'proposed',
      'proposed',
    ]);
    expect(events.every((event) => typeof event.eventId === 'string')).toBe(true);
    expect(firstPage).toMatchObject({
      priorApprovedVersions: [{
        version: 1,
        purpose: 'Improve lesson coherence.',
      }],
    });
    expect(JSON.stringify(events)).toContain(privateClosureNote);

    const teacherHistory = await listHistory(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId: first.planId,
      paginationOpts: { cursor: null, numItems: 50 },
    });
    expect(teacherHistory).toMatchObject({ kind: 'allowed' });
    expect(JSON.stringify(teacherHistory)).not.toContain(privateClosureNote);

    const outsideSlt = 'accounts:outside-slt';
    seedAccount(db, outsideSlt, 'Outside SLT', OTHER_ORG);
    seedRole(db, outsideSlt, 'slt', OTHER_ORG);
    await expect(listHistory(db.context(), {
      actorAccountId: outsideSlt,
      planId: first.planId,
      paginationOpts: { cursor: null, numItems: 20 },
    })).resolves.toMatchObject({ kind: 'denied' });
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

describe('PIP final independent-review regressions', () => {
  it('keeps a closed root terminal when it has an old pending revision', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const first = await propose(db) as Record<string, unknown>;
    await approve(db, first);
    const pending = await proposeWith(db, {
      planId: first.planId,
      requestId: 'request:proposal:closed-pending',
      expectedRevision: 2,
      reviewMeetingDate: '2026-11-20',
      purpose: 'Unapproved revision after the active version.',
      now: NOW + 1_000,
    }) as Record<string, unknown>;
    await closeWith(db, first.planId, {
      expectedRevision: 3,
      requestId: 'request:close:closed-pending',
    });

    await expect(approveWith(db, pending, {
      expectedRevision: 4,
      requestId: 'request:approval:closed-pending',
      now: NOW + 31 * DAY_MS + 1,
    })).resolves.toEqual({ kind: 'not_found' });
    expect(db.rows('improvement_plans')[0]).toMatchObject({
      state: 'closed',
      activeVersionId: first.versionId,
      pendingVersionId: undefined,
    });
    await expect(handler(readImprovementPlan)(db.context(), {
      actorAccountId: PROPOSER,
      planId: first.planId,
      now: NOW + 31 * DAY_MS + 1,
    })).resolves.toMatchObject({
      kind: 'allowed',
      plan: { state: 'closed', pendingVersion: null },
    });
  });

  it('uses the selected historical plan root for its progress projection', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const historical = await propose(db) as Record<string, unknown>;
    await approve(db, historical);
    await closeWith(db, historical.planId, {
      requestId: 'request:close:historical-root',
      outcome: 'successful',
      note: 'The historical plan closed successfully.',
    });
    const current = await proposeWith(db, {
      requestId: 'request:proposal:current-root',
      reviewMeetingDate: '2026-11-20',
      now: NOW + 32 * DAY_MS,
    }) as Record<string, unknown>;
    await approveWith(db, current, {
      requestId: 'request:approval:current-root',
      now: NOW + 32 * DAY_MS,
    });

    await expect(handler(readImprovementPlanReportProjection)(db.context(), {
      actorAccountId: PROPOSER,
      teacherProfileId: TEACHER,
      planId: historical.planId,
      now: NOW + 33 * DAY_MS,
    })).resolves.toMatchObject({
      kind: 'allowed',
      projection: {
        state: 'closed',
        planId: historical.planId,
        outcome: 'successful',
      },
    });
  });

  it('keeps unapproved proposal events and metadata leadership-only during an active revision', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const planId = seedPlan(db, 'approval-event-history');
    const unapprovedVersionId = seedPlanVersion(db, {
      planId,
      version: 1,
      versionId: 'improvement_plan_versions:approval-event-history',
      purpose: 'Unapproved version one narrative.',
    });
    const priorApprovedVersionId = seedPlanVersion(db, {
      planId,
      version: 2,
      purpose: 'Approved version two narrative.',
    });
    const activeVersionId = seedPlanVersion(db, {
      planId,
      version: 3,
      purpose: 'Approved active version three narrative.',
    });
    const pendingVersionId = seedPlanVersion(db, {
      planId,
      version: 4,
      purpose: 'Unapproved pending version four narrative.',
    });
    db.seed('improvement_plans', planId, {
      organizationId: ORG,
      teacherProfileId: TEACHER,
      state: 'active',
      revision: 6,
      latestVersion: 4,
      activeVersionId,
      activeVersion: 3,
      pendingVersionId,
      approvedAt: NOW,
      planEndAt: NOW + 30 * DAY_MS,
      reviewMeetingAt: NOW + 20 * DAY_MS,
      activeTargets: [],
      createdAt: NOW,
      updatedAt: NOW,
    });
    const event = (
      id: string,
      kind: 'proposed' | 'approved',
      version: number,
      versionId: string,
    ) => db.seed('improvement_plan_events', id, {
      organizationId: ORG,
      planId,
      teacherProfileId: TEACHER,
      version,
      versionId,
      kind,
      requestId: `request:${id}`,
      fingerprint: `fingerprint:${id}`,
      actorAccountId: PROPOSER,
      occurredAt: NOW + version,
      revision: version,
      payload: {},
    });
    event('improvement_plan_events:proposed-v1', 'proposed', 1, unapprovedVersionId);
    event('improvement_plan_events:approved-v2', 'approved', 2, priorApprovedVersionId);
    event('improvement_plan_events:approved-v3', 'approved', 3, activeVersionId);
    event('improvement_plan_events:proposed-v4', 'proposed', 4, pendingVersionId);
    const historyDefinition = (improvementPlanModule as Record<string, unknown>)
      .listImprovementPlanHistory;
    expect(historyDefinition).toBeDefined();
    if (!historyDefinition) throw new Error('The PIP history query is missing.');
    const listHistory = handler(historyDefinition);

    const leadershipHistory = await listHistory(db.context(), {
      actorAccountId: PROPOSER,
      planId,
      paginationOpts: { cursor: null, numItems: 20 },
    }) as {
      kind: string;
      page: { page: Array<Record<string, unknown>> };
      priorApprovedVersions: Array<Record<string, unknown>>;
    };
    expect(leadershipHistory.kind).toBe('allowed');
    expect(leadershipHistory.page.page).toEqual(expect.arrayContaining([
      expect.objectContaining({
        kind: 'proposed',
        version: 1,
        versionId: unapprovedVersionId,
      }),
      expect.objectContaining({
        kind: 'proposed',
        version: 4,
        versionId: pendingVersionId,
      }),
    ]));
    expect(leadershipHistory.priorApprovedVersions).toEqual([
      {
        version: 2,
        versionId: priorApprovedVersionId,
        purpose: 'Approved version two narrative.',
      },
    ]);
    const teacherHistory = await listHistory(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      planId,
      paginationOpts: { cursor: null, numItems: 20 },
    }) as {
      kind: string;
      page: { page: Array<Record<string, unknown>> };
      priorApprovedVersions: Array<Record<string, unknown>>;
    };
    expect(teacherHistory.kind).toBe('allowed');
    expect(teacherHistory.page.page.map((event) => event.kind)).toEqual(['approved', 'approved']);
    expect(JSON.stringify(teacherHistory)).not.toContain(unapprovedVersionId);
    expect(JSON.stringify(teacherHistory)).not.toContain(pendingVersionId);
    expect(JSON.stringify(teacherHistory)).not.toContain('improvement_plan_events:proposed-v1');
    expect(JSON.stringify(teacherHistory)).not.toContain('improvement_plan_events:proposed-v4');
  });

  it('denies a scoped plan list when the actor organization is inactive', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedPlan(db, 'inactive-organization');
    db.seed('organizations', ORG, {
      slug: 'one',
      name: 'School One',
      isActive: false,
      activeSysadminCount: 1,
      createdAt: NOW,
      updatedAt: NOW,
    });

    await expect(handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: null, numItems: 25 },
      now: NOW,
    })).resolves.toEqual({ kind: 'denied', reason: 'organization_inactive' });
  });

  it('keeps a supervisor list self-safe for an account with teacher and supervisor roles', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedRole(db, TEACHER_ACCOUNT, 'school_head');
    seedPlan(db, 'self-plan');

    await expect(handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      paginationOpts: { cursor: null, numItems: 25 },
      now: NOW,
    })).resolves.toEqual({
      kind: 'allowed',
      page: { page: [], isDone: true, continueCursor: '' },
    });
  });

  it('keeps the plan list lightweight and reserves lifecycle history for a detail query', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedPlan(db, 'lightweight-one');
    seedPlan(db, 'lightweight-two', seedTeacher(db, 'lightweight-two', DEPARTMENT), NOW + 1);
    seedPlan(db, 'lightweight-three', seedTeacher(db, 'lightweight-three', DEPARTMENT), NOW + 2);
    db.clearQueryCalls();

    await expect(handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: null, numItems: 25 },
      now: NOW,
    })).resolves.toMatchObject({ kind: 'allowed', page: { page: expect.any(Array) } });
    expect(db.queryCount('improvement_plan_events')).toBe(0);
    expect(db.queryCount('improvement_plans')).toBe(1);
  });

  it('returns the requested cursor page when the organization has 251 historical plans', async () => {
    const db = new MemoryDb();
    seedBase(db);
    for (let index = 0; index < 251; index += 1) seedPlan(db, `capacity-${index}`);

    const first = await handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: null, numItems: 25 },
      now: NOW,
    }) as {
      kind: string;
      page: {
        page: Array<{ planId: string }>;
        isDone: boolean;
        continueCursor: string;
      };
    };
    expect(first).toMatchObject({
      kind: 'allowed',
      page: {
        page: expect.any(Array),
        isDone: false,
        continueCursor: expect.any(String),
      },
    });
    expect(first.page.page).toHaveLength(25);
    expect(first.page.continueCursor).not.toBe('');
    const second = await handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: first.page.continueCursor, numItems: 25 },
      now: NOW,
    }) as {
      kind: string;
      page: { page: Array<{ planId: string }> };
    };
    expect(second).toMatchObject({ kind: 'allowed', page: { page: expect.any(Array) } });
    expect(second.page.page).toHaveLength(25);
    expect(new Set([
      ...first.page.page.map((plan) => plan.planId),
      ...second.page.page.map((plan) => plan.planId),
    ])).toHaveLength(50);
    expect(db.queryCount('improvement_plans')).toBe(2);
  });

  it('paginates lifecycle detail without an unbounded history read', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const planId = seedPlan(db, 'paginated-history');
    for (let index = 0; index < 55; index += 1) {
      db.seed('improvement_plan_events', `improvement_plan_events:paginated-${index}`, {
        organizationId: ORG,
        planId,
        teacherProfileId: TEACHER,
        version: 1,
        versionId: 'improvement_plan_versions:paginated-history',
        kind: 'proposed',
        requestId: `request:paginated-${index}`,
        fingerprint: `fingerprint:paginated-${index}`,
        actorAccountId: PROPOSER,
        occurredAt: NOW + index,
        revision: 1,
        payload: {},
      });
    }
    const historyDefinition = (improvementPlanModule as Record<string, unknown>)
      .listImprovementPlanHistory;
    expect(historyDefinition).toBeDefined();
    if (!historyDefinition) throw new Error('The PIP history query is missing.');
    const listHistory = handler(historyDefinition);
    const events: Array<Record<string, unknown>> = [];
    let cursor: string | null = null;
    db.clearQueryCalls();

    do {
      const result = await listHistory(db.context(), {
        actorAccountId: PROPOSER,
        planId,
        paginationOpts: { cursor, numItems: 20 },
      }) as {
        kind: string;
        page: { page: Array<Record<string, unknown>>; isDone: boolean; continueCursor: string };
      };
      expect(result.kind).toBe('allowed');
      events.push(...result.page.page);
      cursor = result.page.isDone ? null : result.page.continueCursor;
    } while (cursor !== null);

    expect(events).toHaveLength(55);
    expect(db.queryCount('improvement_plan_events')).toBe(3);
  });

  it('rejects an invalid scoped-list cursor without returning the first page', async () => {
    const db = new MemoryDb();
    seedBase(db);
    seedPlan(db, 'cursor');

    await expect(handler(listScopedImprovementPlans)(db.context(), {
      actorAccountId: PROPOSER,
      paginationOpts: { cursor: 'improvement_plans:missing', numItems: 25 },
      now: NOW,
    })).resolves.toEqual({ kind: 'invalid_cursor' });
  });

  it('replays a proposal after the server-owned teacher position changes', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const first = await propose(db) as Record<string, unknown>;
    await db.patch(TEACHER, { position: 'Teacher and Department Lead' });

    await expect(propose(db)).resolves.toEqual({ ...first, kind: 'replayed' });
  });

  it('keeps public PIP output pending-safe and excludes pending from its validator', async () => {
    const db = new MemoryDb();
    seedBase(db);
    await propose(db);

    await expect(handler(readMyTeacherReport)(db.context(), {
      actorAccountId: TEACHER_ACCOUNT,
      now: new Date(NOW).toISOString(),
    })).resolves.toMatchObject({
      kind: 'allowed',
      report: {
        improvementPlan: {
          contractVersion: 'danielson.ip-progress.v1',
          state: 'not_configured',
        },
      },
    });
    const source = readFileSync(resolve(
      dirname(fileURLToPath(import.meta.url)),
      '../../convex/improvementPlans.ts',
    ), 'utf8');
    const publicValidator = source.slice(
      source.indexOf('export const publicImprovementPlanProgressValidator'),
      source.indexOf('export const improvementPlanProgressValidator'),
    );
    expect(publicValidator).not.toContain('pendingImprovementPlanValidator');
  });
});
