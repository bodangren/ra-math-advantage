import { describe, expect, it } from 'vitest';

import {
  assignTeacherGbfTrack,
  readOrganizationCurrentGbfAssignments,
  readTeacherGbfAssignment,
} from '../../convex/gbf';
import schema from '../../convex/schema';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>> = (
  ctx: { db: MemoryDb },
  args: TArgs,
) => Promise<TResult>;

type QueryCall = {
  table: string;
  index: string | null;
  take: number | null;
};

function handler<TArgs = Record<string, unknown>, TResult = Record<string, unknown>>(
  value: unknown,
): Handler<TArgs, TResult> {
  return (value as { _handler: Handler<TArgs, TResult> })._handler;
}

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();
  readonly queryCalls: QueryCall[] = [];
  readonly patches: string[] = [];
  readonly deletions: string[] = [];

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string): StoredDocument[] {
    return [...this.table(table).values()];
  }

  async get(id: unknown) {
    if (typeof id !== 'string') return null;
    for (const rows of this.tables.values()) {
      const document = rows.get(id);
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
    this.patches.push(id);
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
    this.deletions.push(id);
    for (const rows of this.tables.values()) {
      if (rows.delete(id)) return;
    }
    throw new Error(`Missing ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
    let descending = false;
    const call: QueryCall = { table: tableName, index: null, take: null };
    this.queryCalls.push(call);
    const query = {
      withIndex: (
        name: string,
        configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown,
      ) => {
        call.index = name;
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
        call.take = count;
        const ordered = descending ? [...matches].reverse() : matches;
        return ordered.slice(0, count);
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
    let rows = this.tables.get(name);
    if (!rows) {
      rows = new Map();
      this.tables.set(name, rows);
    }
    return rows;
  }
}

const ORG = 'organizations:one';
const OTHER_ORG = 'organizations:other';
const LEADER = 'accounts:leader';
const TEACHER_ACCOUNT = 'accounts:teacher';
const TEACHER = 'teacher_profiles:teacher';
const OTHER_TEACHER_ACCOUNT = 'accounts:other-teacher';
const OTHER_TEACHER = 'teacher_profiles:other-teacher';
const SEQUENCE_RELEASE = 'danielson.gbf.sequence.2026-08-19.v1';
const GRAPH_RELEASE = 'danielson.gbf.graph.2026-08-19.v1';
const NOW = Date.parse('2026-08-20T00:00:00.000Z');

function seedOrganization(db: MemoryDb, organizationId = ORG, isActive = true) {
  db.seed('organizations', organizationId, {
    slug: organizationId,
    name: organizationId,
    isActive,
    activeSysadminCount: 1,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedAccount(
  db: MemoryDb,
  accountId: string,
  organizationId = ORG,
  isActive = true,
) {
  db.seed('accounts', accountId, {
    organizationId,
    username: accountId,
    displayName: accountId,
    sharedSessionRole: accountId === TEACHER_ACCOUNT ? 'teacher' : 'admin',
    isActive,
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

function seedTeacher(
  db: MemoryDb,
  teacherProfileId: string,
  accountId: string,
  organizationId = ORG,
  input: { accountActive?: boolean; profileActive?: boolean } = {},
) {
  seedAccount(db, accountId, organizationId, input.accountActive ?? true);
  seedRole(db, accountId, 'teacher', organizationId);
  db.seed('teacher_profiles', teacherProfileId, {
    organizationId,
    accountId,
    isActive: input.profileActive ?? true,
    createdAt: NOW,
    updatedAt: NOW,
  });
}

function seedBase(db: MemoryDb, leaderRole: string) {
  seedOrganization(db);
  seedOrganization(db, OTHER_ORG);
  seedAccount(db, LEADER);
  seedRole(db, LEADER, leaderRole);
  seedTeacher(db, TEACHER, TEACHER_ACCOUNT);
  seedTeacher(db, OTHER_TEACHER, OTHER_TEACHER_ACCOUNT);
}

function assignmentArgs(input: Partial<Record<string, unknown>> = {}) {
  return {
    actorAccountId: LEADER,
    teacherProfileId: TEACHER,
    sequenceReleaseId: SEQUENCE_RELEASE,
    graphReleaseId: GRAPH_RELEASE,
    requestId: 'request:gbf:one',
    now: NOW,
    ...input,
  };
}

function assignmentRow(input: {
  teacherProfileId: string;
  requestId: string;
  assignedAt: number;
  organizationId?: string;
}) {
  return {
    organizationId: input.organizationId ?? ORG,
    teacherProfileId: input.teacherProfileId,
    sequenceReleaseId: SEQUENCE_RELEASE,
    graphReleaseId: GRAPH_RELEASE,
    assignedSkillIds: ['danielson.tlac.skill.double-plan'],
    unsequencedGapSkillIds: ['danielson.tlac.skill.knowledge-organizers'],
    actorAccountId: LEADER,
    requestId: input.requestId,
    fingerprint: `fingerprint:${input.requestId}`,
    assignedAt: input.assignedAt,
  };
}

type ValidatorJson = {
  type: string;
  tableName?: string;
  value?: unknown;
};

function exportedArgs(value: unknown) {
  return JSON.parse((value as { exportArgs(): string }).exportArgs()) as {
    type: 'object';
    value: Record<string, { fieldType: ValidatorJson; optional: boolean }>;
  };
}

describe('GBF assignment schema and Convex boundary', () => {
  it('uses one immutable assignment table with the exact fields and indexes', () => {
    expect(Object.keys(schema.tables).filter((name) => name.includes('gbf')))
      .toEqual(['teacher_gbf_assignments']);

    const table = schema.tables.teacher_gbf_assignments as unknown as {
      indexes: Array<{ indexDescriptor: string; fields: string[] }>;
      validator: {
        fields: Record<string, {
          kind: string;
          tableName?: string;
          element?: { kind: string };
        }>;
      };
    };
    expect(Object.keys(table.validator.fields).sort()).toEqual([
      'actorAccountId',
      'assignedAt',
      'assignedSkillIds',
      'fingerprint',
      'graphReleaseId',
      'organizationId',
      'requestId',
      'sequenceReleaseId',
      'teacherProfileId',
      'unsequencedGapSkillIds',
    ]);
    expect(table.validator.fields.organizationId).toMatchObject({
      kind: 'id',
      tableName: 'organizations',
    });
    expect(table.validator.fields.teacherProfileId).toMatchObject({
      kind: 'id',
      tableName: 'teacher_profiles',
    });
    expect(table.validator.fields.actorAccountId).toMatchObject({
      kind: 'id',
      tableName: 'accounts',
    });
    for (const field of [
      'sequenceReleaseId',
      'graphReleaseId',
      'requestId',
      'fingerprint',
    ]) {
      expect(table.validator.fields[field]).toMatchObject({ kind: 'string' });
    }
    expect(table.validator.fields.assignedAt).toMatchObject({ kind: 'float64' });
    expect(table.validator.fields.assignedSkillIds).toMatchObject({
      kind: 'array',
      element: { kind: 'string' },
    });
    expect(table.validator.fields.unsequencedGapSkillIds).toMatchObject({
      kind: 'array',
      element: { kind: 'string' },
    });
    expect(table.indexes).toEqual([
      { indexDescriptor: 'by_org_request', fields: ['organizationId', 'requestId'] },
      {
        indexDescriptor: 'by_org_teacher_time',
        fields: ['organizationId', 'teacherProfileId', 'assignedAt'],
      },
      { indexDescriptor: 'by_org_time', fields: ['organizationId', 'assignedAt'] },
    ]);
  });

  it('accepts only server-owned release assignment arguments', () => {
    const args = exportedArgs(assignTeacherGbfTrack);

    expect(Object.keys(args.value).sort()).toEqual([
      'actorAccountId',
      'graphReleaseId',
      'now',
      'requestId',
      'sequenceReleaseId',
      'teacherProfileId',
    ]);
    expect(args.value.actorAccountId).toEqual({
      fieldType: { type: 'id', tableName: 'accounts' },
      optional: false,
    });
    expect(args.value.teacherProfileId).toEqual({
      fieldType: { type: 'id', tableName: 'teacher_profiles' },
      optional: false,
    });
    expect(args.value.sequenceReleaseId.fieldType).toEqual({ type: 'string' });
    expect(args.value.graphReleaseId.fieldType).toEqual({ type: 'string' });
    expect(args.value.requestId.fieldType).toEqual({ type: 'string' });
    expect(args.value.now.fieldType).toEqual({ type: 'number' });
    const returns = JSON.parse(
      (assignTeacherGbfTrack as unknown as { exportReturns(): string }).exportReturns(),
    ) as {
      type: 'union';
      value: Array<{
        type: 'object';
        value: Record<string, { fieldType: ValidatorJson; optional: boolean }>;
      }>;
    };
    expect(JSON.stringify(returns)).not.toContain('"type":"any"');
    expect(returns.value.map((member) => member.value.kind.fieldType.value).sort())
      .toEqual([
        'assigned',
        'denied',
        'idempotency_conflict',
        'invalid_input',
        'replayed',
        'unsupported_release',
      ]);
    for (const kind of ['assigned', 'replayed']) {
      const member = returns.value.find((candidate) => candidate.value.kind.fieldType.value === kind);
      expect(member).toBeDefined();
      expect(Object.keys(member?.value ?? {}).sort()).toEqual([
        'assignmentId',
        'graphReleaseId',
        'kind',
        'sequenceReleaseId',
      ]);
      expect(member?.value.assignmentId.fieldType).toEqual({ type: 'string' });
      expect(member?.value.sequenceReleaseId.fieldType).toEqual({ type: 'string' });
      expect(member?.value.graphReleaseId.fieldType).toEqual({ type: 'string' });
    }
  });
});

describe('GBF assignment authorization and persistence', () => {
  it.each(['school_head', 'slt'])(
    'permits an active same-organization %s to assign the current release',
    async (role) => {
      const db = new MemoryDb();
      seedBase(db, role);

      await expect(handler(assignTeacherGbfTrack)(db.context(), assignmentArgs()))
        .resolves.toMatchObject({ kind: 'assigned' });
      expect(db.rows('teacher_gbf_assignments')).toHaveLength(1);
      expect(db.rows('teacher_gbf_assignments')[0]).toMatchObject({
        organizationId: ORG,
        teacherProfileId: TEACHER,
        sequenceReleaseId: SEQUENCE_RELEASE,
        graphReleaseId: GRAPH_RELEASE,
        actorAccountId: LEADER,
        requestId: 'request:gbf:one',
        assignedAt: NOW,
      });
      expect(db.rows('teacher_gbf_assignments')[0].assignedSkillIds)
        .toEqual(expect.arrayContaining(['danielson.tlac.skill.double-plan']));
      expect(db.rows('teacher_gbf_assignments')[0].unsequencedGapSkillIds)
        .toEqual(expect.arrayContaining(['danielson.tlac.skill.knowledge-organizers']));
      expect(db.rows('teacher_gbf_assignments')[0].assignedSkillIds).toHaveLength(50);
      expect(db.rows('teacher_gbf_assignments')[0].unsequencedGapSkillIds).toHaveLength(13);
    },
  );

  it.each(['sysadmin', 'hod', 'coach'])(
    'denies a %s-only assignment before the write',
    async (role) => {
      const db = new MemoryDb();
      seedBase(db, role);

      await expect(handler(assignTeacherGbfTrack)(db.context(), assignmentArgs()))
        .resolves.toMatchObject({ kind: 'denied', reason: 'capability_not_granted' });
      expect(db.rows('teacher_gbf_assignments')).toEqual([]);
    },
  );

  it('denies cross-organization, inactive, and self assignments', async () => {
    const crossOrganization = new MemoryDb();
    seedBase(crossOrganization, 'slt');
    seedTeacher(
      crossOrganization,
      'teacher_profiles:cross',
      'accounts:cross',
      OTHER_ORG,
    );
    await expect(handler(assignTeacherGbfTrack)(crossOrganization.context(), assignmentArgs({
      teacherProfileId: 'teacher_profiles:cross',
      requestId: 'request:cross',
    }))).resolves.toMatchObject({ kind: 'denied', reason: 'cross_organization' });

    for (const inactiveField of ['account', 'profile'] as const) {
      const inactive = new MemoryDb();
      seedBase(inactive, 'school_head');
      seedTeacher(inactive, 'teacher_profiles:inactive', 'accounts:inactive', ORG, {
        accountActive: inactiveField !== 'account',
        profileActive: inactiveField !== 'profile',
      });
      await expect(handler(assignTeacherGbfTrack)(inactive.context(), assignmentArgs({
        teacherProfileId: 'teacher_profiles:inactive',
        requestId: `request:inactive:${inactiveField}`,
      }))).resolves.toMatchObject({ kind: 'denied', reason: 'target_inactive' });
      expect(inactive.rows('teacher_gbf_assignments')).toEqual([]);
    }

    const self = new MemoryDb();
    seedBase(self, 'slt');
    self.seed('teacher_profiles', 'teacher_profiles:leader', {
      organizationId: ORG,
      accountId: LEADER,
      isActive: true,
      createdAt: NOW,
      updatedAt: NOW,
    });
    await expect(handler(assignTeacherGbfTrack)(self.context(), assignmentArgs({
      teacherProfileId: 'teacher_profiles:leader',
      requestId: 'request:self',
    }))).resolves.toMatchObject({ kind: 'denied', reason: 'self_evaluation_denied' });
    expect(self.rows('teacher_gbf_assignments')).toEqual([]);
    expect(crossOrganization.rows('teacher_gbf_assignments')).toEqual([]);
  });

  it('rejects an unknown or mismatched release pair before the write', async () => {
    for (const releases of [
      { sequenceReleaseId: 'danielson.gbf.sequence.unknown', graphReleaseId: GRAPH_RELEASE },
      { sequenceReleaseId: SEQUENCE_RELEASE, graphReleaseId: 'danielson.gbf.graph.unknown' },
    ]) {
      const db = new MemoryDb();
      seedBase(db, 'school_head');
      const result = await handler(assignTeacherGbfTrack)(db.context(), assignmentArgs({
        ...releases,
        requestId: `request:${releases.sequenceReleaseId}:${releases.graphReleaseId}`,
      }));
      expect(result).toEqual({ kind: 'unsupported_release' });
      expect(db.rows('teacher_gbf_assignments')).toEqual([]);
    }
  });

  it('rejects invalid request IDs and clocks before the write', async () => {
    for (const invalid of [
      { requestId: '' },
      { requestId: 'x'.repeat(10_001) },
      { now: Number.NaN },
      { now: Number.POSITIVE_INFINITY },
    ]) {
      const db = new MemoryDb();
      seedBase(db, 'school_head');
      await expect(handler(assignTeacherGbfTrack)(db.context(), assignmentArgs(invalid)))
        .resolves.toEqual({ kind: 'invalid_input' });
      expect(db.rows('teacher_gbf_assignments')).toEqual([]);
    }
  });

  it('returns the first assignment for an equal retry and rejects changed content', async () => {
    const db = new MemoryDb();
    seedBase(db, 'school_head');
    const assign = handler(assignTeacherGbfTrack);
    const first = await assign(db.context(), assignmentArgs());
    const retry = await assign(db.context(), assignmentArgs({ now: NOW + 10_000 }));

    expect(first).toMatchObject({ kind: 'assigned' });
    expect(retry).toMatchObject({
      kind: 'replayed',
      assignmentId: (first as { assignmentId: string }).assignmentId,
      sequenceReleaseId: SEQUENCE_RELEASE,
      graphReleaseId: GRAPH_RELEASE,
    });
    expect(db.rows('teacher_gbf_assignments')).toHaveLength(1);

    await expect(assign(db.context(), assignmentArgs({
      teacherProfileId: OTHER_TEACHER,
      now: NOW + 20_000,
    }))).resolves.toEqual({ kind: 'idempotency_conflict' });
    expect(db.rows('teacher_gbf_assignments')).toHaveLength(1);
  });

  it('appends a reassignment and reads the latest row without rewriting history', async () => {
    const db = new MemoryDb();
    seedBase(db, 'slt');
    const assign = handler(assignTeacherGbfTrack);
    await assign(db.context(), assignmentArgs());
    const first = structuredClone(db.rows('teacher_gbf_assignments')[0]);
    await assign(db.context(), assignmentArgs({
      requestId: 'request:gbf:two',
      now: NOW + 1,
    }));

    expect(db.rows('teacher_gbf_assignments')).toHaveLength(2);
    expect(db.rows('teacher_gbf_assignments')[0]).toEqual(first);
    expect(db.patches).toEqual([]);
    expect(db.deletions).toEqual([]);
    const current = await readTeacherGbfAssignment(db.context(), ORG, TEACHER);
    expect(current).toMatchObject({
      kind: 'allowed',
      assignment: { assignedAt: NOW + 1 },
    });
    if (current.kind !== 'allowed') throw new Error('Expected current assignment');
    expect(current.assignment).not.toHaveProperty('requestId');
    expect(current.assignment).not.toHaveProperty('fingerprint');
    expect(current.assignment).not.toHaveProperty('actorAccountId');
    expect(current.assignment).not.toHaveProperty('organizationId');
  });
});

describe('GBF assignment read bounds', () => {
  it('returns explicit empty states without an assignment', async () => {
    const db = new MemoryDb();

    await expect(readTeacherGbfAssignment(db.context(), ORG, TEACHER))
      .resolves.toEqual({ kind: 'not_configured' });
    const organization = await readOrganizationCurrentGbfAssignments(db.context(), ORG);
    expect(organization).toMatchObject({ kind: 'allowed' });
    if (organization.kind !== 'allowed') throw new Error('Expected empty organization batch');
    expect(organization.assignmentsByTeacher.size).toBe(0);
  });

  it('reads at most 101 teacher rows and returns a capacity error instead of truncation', async () => {
    const db = new MemoryDb();
    for (let index = 0; index < 101; index += 1) {
      db.seed('teacher_gbf_assignments', `teacher_gbf_assignments:${index}`, assignmentRow({
        teacherProfileId: TEACHER,
        requestId: `request:${index}`,
        assignedAt: NOW + index,
      }));
    }

    await expect(readTeacherGbfAssignment(db.context(), ORG, TEACHER))
      .resolves.toEqual({ kind: 'capacity_exceeded' });
    expect(db.queryCalls.filter((call) => call.table === 'teacher_gbf_assignments'))
      .toEqual([{
        table: 'teacher_gbf_assignments',
        index: 'by_org_teacher_time',
        take: 101,
      }]);
  });

  it('uses one bounded organization query and keeps only the latest row per teacher', async () => {
    const db = new MemoryDb();
    for (let index = 0; index < 250; index += 1) {
      const teacherProfileId = `teacher_profiles:${index}`;
      db.seed('teacher_gbf_assignments', `teacher_gbf_assignments:${index}:old`, assignmentRow({
        teacherProfileId,
        requestId: `request:${index}:old`,
        assignedAt: NOW - 1,
      }));
      if (index === 0) {
        db.seed('teacher_gbf_assignments', `teacher_gbf_assignments:${index}:new`, assignmentRow({
          teacherProfileId,
          requestId: `request:${index}:new`,
          assignedAt: NOW,
        }));
      }
    }

    await expect(readOrganizationCurrentGbfAssignments(db.context(), ORG))
      .resolves.toEqual({ kind: 'capacity_exceeded' });
    expect(db.queryCalls.filter((call) => call.table === 'teacher_gbf_assignments'))
      .toEqual([{
        table: 'teacher_gbf_assignments',
        index: 'by_org_time',
        take: 251,
      }]);

    const withinBound = new MemoryDb();
    for (let index = 0; index < 249; index += 1) {
      const teacherProfileId = `teacher_profiles:${index}`;
      withinBound.seed(
        'teacher_gbf_assignments',
        `teacher_gbf_assignments:${index}`,
        assignmentRow({
          teacherProfileId,
          requestId: `request:${index}`,
          assignedAt: NOW + index,
        }),
      );
    }
    withinBound.seed(
      'teacher_gbf_assignments',
      'teacher_gbf_assignments:latest',
      assignmentRow({
        teacherProfileId: 'teacher_profiles:0',
        requestId: 'request:latest',
        assignedAt: NOW + 1_000,
      }),
    );
    const result = await readOrganizationCurrentGbfAssignments(withinBound.context(), ORG);
    expect(result).toMatchObject({
      kind: 'allowed',
      assignmentsByTeacher: expect.any(Map),
    });
    if (result.kind !== 'allowed') throw new Error('Expected bounded assignment batch');
    expect(result.assignmentsByTeacher.size).toBe(249);
    expect(result.assignmentsByTeacher.get('teacher_profiles:0'))
      .toMatchObject({ assignedAt: NOW + 1_000 });
    expect(result.assignmentsByTeacher.get('teacher_profiles:0'))
      .not.toHaveProperty('requestId');
  });
});
