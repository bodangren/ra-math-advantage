import { describe, expect, it } from 'vitest';

import { seedLocalDemo } from '../../convex/demo';
import { readRankedTeacherQueue } from '../../convex/observations';
import {
  readLeadershipPortfolio,
  readLeadershipTeacherReport,
} from '../../convex/reporting';
import { authorizeDanielsonAction } from '../../lib/foundation/authorization';
import { buildDemoScenario } from '../../lib/demo/scenarios';
import { scopeTeacherCandidates } from '../../lib/observations/queue';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type Comparison = 'eq' | 'gt' | 'gte' | 'lt' | 'lte';
type Comparable = string | number;
type PortfolioResult =
  | { kind: 'allowed'; page: { items: Array<{
      displayName: string;
      danielson: { state: string };
      gbf: { state: string };
      improvementPlan: { state: string; outcome?: string };
    }> } }
  | { kind: 'denied' | 'portfolio_capacity_exceeded' };
type QueueResult =
  | { kind: 'allowed'; items: Array<{
      displayName: string;
      reason: string;
      returned: number;
      targets: Array<{ skillId: string }>;
    }> }
  | { kind: 'denied' | 'queue_capacity_exceeded' };
type ReportResult =
  | { kind: 'allowed'; visibility: string; report: {
      displayName: string;
      danielsonState: string;
      officialEvaluations: unknown[];
      currentProficiency: { domains: unknown[] };
      improvementPlan: { state: string; outcome?: string };
      responses: unknown[];
    } }
  | { kind: 'denied' | 'teacher_report_capacity_exceeded' };

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string) {
    return [...(this.tables.get(table)?.values() ?? [])];
  }

  async get(id: unknown) {
    if (typeof id !== 'string') return null;
    for (const table of this.tables.values()) {
      const row = table.get(id);
      if (row) return row;
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
      const row = table.get(id);
      if (row) {
        table.set(id, { ...row, ...patch });
        return;
      }
    }
    throw new Error(`Missing document ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
    let descending = false;
    const query = {
      withIndex: (
        _index: string,
        configure: (builder: Record<Comparison, (field: string, value: unknown) => unknown>) => unknown,
      ) => {
        const conditions: Array<[Comparison, string, unknown]> = [];
        const builder = {} as Record<Comparison, (field: string, value: unknown) => unknown>;
        for (const comparison of ['eq', 'gt', 'gte', 'lt', 'lte'] as const) {
          builder[comparison] = (field, value) => {
            conditions.push([comparison, field, value]);
            return builder;
          };
        }
        configure(builder);
        matches = matches.filter((row) => conditions.every(([comparison, field, value]) => {
          if (comparison === 'eq') return row[field] === value;
          const left = (row[field] ?? '') as Comparable;
          const right = (value ?? '') as Comparable;
          if (comparison === 'gt') return left > right;
          if (comparison === 'gte') return left >= right;
          if (comparison === 'lt') return left < right;
          return left <= right;
        }));
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

function handler<TResult>(value: unknown) {
  return (value as { _handler: (ctx: unknown, args: unknown) => Promise<TResult> })._handler;
}

const REFERENCE_TIME = Date.parse('2026-08-21T12:00:00.000Z');
const ORGANIZATION_ID = 'organizations:demo';
const NOW_ISO = new Date(REFERENCE_TIME).toISOString();

function seedArgs() {
  return {
    organizationSlug: 'danielson-school',
    organizationName: 'Danielson School',
    referenceTime: REFERENCE_TIME,
    credentials: buildDemoScenario(REFERENCE_TIME).accounts.map((account, index) => ({
      username: account.username,
      passwordHash: `hash-${index}`,
      passwordSalt: `salt-${index}`,
      passwordHashIterations: 120_000,
      mustChangePassword: false,
    })),
  };
}

function accountId(db: MemoryDb, username: string) {
  const account = db.rows('accounts').find((row) => row.username === username);
  if (!account) throw new Error(`Missing account ${username}`);
  return account._id;
}

function teacherProfileId(db: MemoryDb, username: string) {
  const account = accountId(db, username);
  const profile = db.rows('teacher_profiles').find((row) => row.accountId === account);
  if (!profile) throw new Error(`Missing teacher profile ${username}`);
  return profile._id;
}

function candidates(scenario: ReturnType<typeof buildDemoScenario>) {
  return scenario.teachers.map((teacher) => ({
    teacherProfileId: teacher.username,
    organizationId: ORGANIZATION_ID,
    isActive: true,
    departmentIds: teacher.departmentKeys,
  }));
}

describe('Danielson local demo sales acceptance', () => {
  it('seeds the database and reads the required sales-call states from real handlers', async () => {
    const db = new MemoryDb();
    await expect(handler(seedLocalDemo)(db.context(), seedArgs())).resolves.toMatchObject({ kind: 'created' });

    const portfolioResult = await handler<PortfolioResult>(readLeadershipPortfolio)(db.context(), {
      actorAccountId: accountId(db, 'demo.slt'),
      now: NOW_ISO,
      cursor: null,
      pageSize: 25,
    });
    expect(portfolioResult).toMatchObject({ kind: 'allowed' });
    if (portfolioResult.kind !== 'allowed') throw new Error('Expected leadership portfolio');
    const portfolioRows = portfolioResult.page.items as Array<Record<string, unknown>>;
    const portfolioByName = new Map(portfolioRows.map((row) => [row.displayName, row]));
    expect(portfolioByName.get('Maya Chen')).toMatchObject({
      danielson: { state: 'not_enough_evidence' },
      gbf: { state: 'in_progress' },
    });
    expect(portfolioByName.get('Noah Williams')).toMatchObject({ danielson: { state: 'below_proficient' } });
    expect(portfolioByName.get('Sofia Patel')).toMatchObject({ danielson: { state: 'proficient' } });
    expect(portfolioByName.get('Ethan Brooks')).toMatchObject({
      danielson: { state: 'below_proficient' },
      improvementPlan: { state: 'active' },
    });
    expect(portfolioByName.get('Lina Park')).toMatchObject({
      danielson: { state: 'proficient' },
      improvementPlan: { state: 'closed', outcome: 'successful' },
    });

    const queueResult = await handler<QueueResult>(readRankedTeacherQueue)(db.context(), {
      actorAccountId: accountId(db, 'demo.slt'),
      now: NOW_ISO,
    });
    expect(queueResult).toMatchObject({ kind: 'allowed' });
    if (queueResult.kind !== 'allowed') throw new Error('Expected ranked teacher queue');
    const noahQueue = queueResult.items.find((item) => item.displayName === 'Noah Williams');
    expect(noahQueue?.targets.map((target) => target.skillId)).toEqual(expect.arrayContaining([
      'danielson.tlac.skill.cold-call',
      'danielson.tlac.skill.stretch-it',
      'danielson.tlac.skill.turn-and-talk',
    ]));
    expect(noahQueue?.returned).toBe(3);
    const ethanQueue = queueResult.items.find((item) => item.displayName === 'Ethan Brooks');
    expect(ethanQueue).toMatchObject({ reason: 'approved_plan_priority' });

    const reportResult = await handler<ReportResult>(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: accountId(db, 'demo.slt'),
      teacherProfileId: teacherProfileId(db, 'demo.teacher.experienced'),
      now: NOW_ISO,
    });
    expect(reportResult).toMatchObject({ kind: 'allowed', visibility: 'private' });
    if (reportResult.kind !== 'allowed') throw new Error('Expected teacher report');
    expect(reportResult.report).toMatchObject({
      displayName: 'Sofia Patel',
      danielsonState: 'proficient',
    });
    expect(reportResult.report.officialEvaluations).toHaveLength(2);
    expect(reportResult.report.currentProficiency.domains).toHaveLength(4);

    const growthReport = await handler<ReportResult>(readLeadershipTeacherReport)(db.context(), {
      actorAccountId: accountId(db, 'demo.slt'),
      teacherProfileId: teacherProfileId(db, 'demo.teacher.growth'),
      now: NOW_ISO,
    });
    expect(growthReport).toMatchObject({ kind: 'allowed', visibility: 'private' });
    if (growthReport.kind !== 'allowed') throw new Error('Expected growth teacher report');
    expect(growthReport.report).toMatchObject({
      displayName: 'Lina Park',
      improvementPlan: { state: 'closed', outcome: 'successful' },
    });
    expect(growthReport.report.responses).toHaveLength(1);
  });

  it('contains the visible teacher states and the three-target Noah path', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const byUsername = new Map(scenario.teachers.map((teacher) => [teacher.username, teacher]));

    expect(byUsername.get('demo.teacher.new')?.expectedState).toBe('not_enough_evidence');
    expect(byUsername.get('demo.teacher.developing')?.expectedState).toBe('below_proficient');
    expect(byUsername.get('demo.teacher.experienced')?.expectedState).toBe('proficient');
    expect(byUsername.get('demo.teacher.developing')?.walkthroughPriorityCount).toBe(3);
    expect(byUsername.get('demo.teacher.developing')?.observations).toHaveLength(3);
    expect(byUsername.get('demo.teacher.pip')?.pip).toMatchObject({ state: 'active' });
    expect(byUsername.get('demo.teacher.growth')?.pip).toMatchObject({ state: 'closed', outcome: 'successful' });
    expect(byUsername.get('demo.teacher.growth')?.responseCount).toBe(1);
  });

  it('keeps HOD and coach portfolios scoped to their assignments', () => {
    const scenario = buildDemoScenario(REFERENCE_TIME);
    const allCandidates = candidates(scenario);
    const hod = scopeTeacherCandidates(allCandidates, {
      actorAccountId: 'demo.hod.math',
      actorTeacherProfileId: 'demo.hod.math',
      organizationId: ORGANIZATION_ID,
      roles: ['hod'],
      hodDepartmentIds: ['mathematics'],
      coachTeacherProfileIds: [],
    });
    const coach = scopeTeacherCandidates(allCandidates, {
      actorAccountId: 'demo.coach.primary',
      actorTeacherProfileId: null,
      organizationId: ORGANIZATION_ID,
      roles: ['coach'],
      hodDepartmentIds: [],
      coachTeacherProfileIds: scenario.coachAssignments.map((assignment) => assignment.teacherUsername),
    });

    expect(hod.map((candidate) => candidate.teacherProfileId)).toEqual([
      'demo.slt',
      'demo.teacher.experienced',
      'demo.teacher.pip',
    ]);
    expect(coach.map((candidate) => candidate.teacherProfileId)).toEqual([
      'demo.teacher.new',
      'demo.teacher.developing',
      'demo.teacher.growth',
    ]);
  });

  it('does not grant the system administrator evaluation report access', () => {
    const decision = authorizeDanielsonAction({
      actor: {
        accountId: 'demo.sysadmin',
        organizationId: ORGANIZATION_ID,
        isActive: true,
        organizationIsActive: true,
      },
      subject: {
        accountId: 'demo.teacher.developing',
        organizationId: ORGANIZATION_ID,
        departmentIds: ['primary-school'],
        isActive: true,
      },
      roleAssignments: [{
        accountId: 'demo.sysadmin',
        organizationId: ORGANIZATION_ID,
        role: 'sysadmin',
        status: 'active',
      }],
      hodDepartmentAssignments: [],
      coachTeacherAssignments: [],
    }, 'teacher_report:read');

    expect(decision).toEqual({ allowed: false, reason: 'capability_not_granted' });
  });
});
