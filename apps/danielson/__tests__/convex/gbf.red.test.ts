import { describe, expect, it } from 'vitest';

import {
  assignTeacherGbfTrack,
  readOrganizationCurrentGbfAssignments,
  readTeacherGbfAssignment,
} from '../../convex/gbf';
import schema from '../../convex/schema';

type StoredDocument = Record<string, unknown> & { _id: string; _creationTime: number };
type Handler = (
  ctx: { db: MemoryDb },
  args: Record<string, unknown>,
) => Promise<Record<string, unknown>>;

function handler(value: unknown): Handler {
  return (value as { _handler: Handler })._handler;
}

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, { _id: id, _creationTime: ++this.sequence, ...document });
  }

  rows(table: string) {
    return [...this.table(table).values()];
  }

  async get(id: unknown) {
    if (typeof id !== 'string') return null;
    for (const rows of this.tables.values()) {
      const row = rows.get(id);
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
    for (const rows of this.tables.values()) {
      const row = rows.get(id);
      if (row) {
        rows.set(id, { ...row, ...patch });
        return;
      }
    }
    throw new Error(`Missing ${id}`);
  }

  query(tableName: string) {
    let matches = this.rows(tableName);
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
        matches = matches.filter((row) => equalities.every(([field, value]) => row[field] === value));
        return query;
      },
      unique: async () => {
        if (matches.length > 1) throw new Error(`Expected one ${tableName} row`);
        return matches[0] ?? null;
      },
      take: async (count: number) => matches.slice(0, count),
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
const NOW = Date.parse('2026-08-20T00:00:00.000Z');

function seedBase(db: MemoryDb) {
  db.seed('organizations', ORG, {
    slug: 'school', name: 'School', isActive: true,
    createdAt: NOW, updatedAt: NOW,
  });
  db.seed('organizations', OTHER_ORG, {
    slug: 'other', name: 'Other', isActive: true,
    createdAt: NOW, updatedAt: NOW,
  });
  db.seed('accounts', LEADER, {
    organizationId: ORG, username: 'leader', displayName: 'Leader',
    sharedSessionRole: 'admin', isActive: true, createdAt: NOW, updatedAt: NOW,
  });
  db.seed('role_assignments', 'role_assignments:leader', {
    organizationId: ORG, accountId: LEADER, role: 'school_head', status: 'active',
    createdByAccountId: LEADER, createdAt: NOW,
  });
  db.seed('accounts', TEACHER_ACCOUNT, {
    organizationId: ORG, username: 'teacher', displayName: 'Teacher',
    sharedSessionRole: 'teacher', isActive: true, createdAt: NOW, updatedAt: NOW,
  });
  db.seed('teacher_profiles', TEACHER, {
    organizationId: ORG, accountId: TEACHER_ACCOUNT, currentGbfAssignmentId: null,
    isActive: true, createdAt: NOW, updatedAt: NOW,
  });
}

function assignmentArgs(extra: Record<string, unknown> = {}) {
  return {
    actorAccountId: LEADER,
    teacherProfileId: TEACHER,
    now: NOW,
    ...extra,
  };
}

describe('GBF assignment boundary', () => {
  it('stores only the current assignment data', () => {
    const table = schema.tables.teacher_gbf_assignments as unknown as {
      indexes: Array<{ indexDescriptor: string }>;
      validator: { fields: Record<string, unknown> };
    };
    expect(Object.keys(table.validator.fields).sort()).toEqual([
      'actorAccountId',
      'assignedAt',
      'assignedSkillIds',
      'organizationId',
      'teacherProfileId',
      'unsequencedGapSkillIds',
    ]);
    expect(table.indexes).toEqual([]);
    expect(JSON.parse((assignTeacherGbfTrack as unknown as { exportArgs(): string }).exportArgs()))
      .not.toHaveProperty('value.requestId');
  });

  it('assigns once and treats a repeated assignment as a replay', async () => {
    const db = new MemoryDb();
    seedBase(db);
    const assign = handler(assignTeacherGbfTrack);

    await expect(assign(db.context(), assignmentArgs())).resolves.toMatchObject({ kind: 'assigned' });
    await expect(assign(db.context(), assignmentArgs({ now: NOW + 1 })))
      .resolves.toMatchObject({ kind: 'replayed' });

    expect(db.rows('teacher_gbf_assignments')).toHaveLength(1);
    expect(db.rows('teacher_gbf_assignments')[0]).not.toHaveProperty('requestId');
    expect(db.rows('teacher_gbf_assignments')[0]).not.toHaveProperty('fingerprint');
    expect(await readTeacherGbfAssignment(db.context(), ORG, TEACHER))
      .toMatchObject({ kind: 'allowed', assignment: { teacherProfileId: TEACHER } });
  });

  it('rejects cross-organization assignment', async () => {
    const db = new MemoryDb();
    seedBase(db);
    await db.patch(TEACHER_ACCOUNT, { organizationId: OTHER_ORG });
    await db.patch(TEACHER, { organizationId: OTHER_ORG });

    await expect(handler(assignTeacherGbfTrack)(db.context(), assignmentArgs()))
      .resolves.toMatchObject({ kind: 'denied', reason: 'cross_organization' });
    expect(db.rows('teacher_gbf_assignments')).toHaveLength(0);
  });

  it('returns a named capacity result above 250 active teachers', async () => {
    const db = new MemoryDb();
    seedBase(db);
    for (let index = 0; index < 250; index += 1) {
      db.seed('teacher_profiles', `teacher_profiles:${index}`, {
        organizationId: ORG,
        accountId: `accounts:${index}`,
        currentGbfAssignmentId: null,
        isActive: true,
        createdAt: NOW,
        updatedAt: NOW,
      });
    }
    await expect(readOrganizationCurrentGbfAssignments(db.context(), ORG))
      .resolves.toEqual({ kind: 'capacity_exceeded' });
  });
});
