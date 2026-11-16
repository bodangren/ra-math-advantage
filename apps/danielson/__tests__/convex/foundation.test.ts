import { describe, expect, it } from 'vitest';

import type { MutationCtx, QueryCtx } from '../../convex/_generated/server';
import {
  applyAdministrationChange,
  bootstrapFirstSysadmin,
  listAdministrationAccounts,
  listAdministrationAssignments,
  listAdministrationDepartments,
  resolveAccessContext,
} from '../../convex/foundation';
import {
  checkAndIncrementLoginRateLimit,
  changeOwnPassword,
  clearLoginRateLimit,
  getAccountById,
  getCredentialByAccountId,
  getCredentialByUsername,
} from '../../convex/auth';

type StoredDocument = Record<string, unknown> & {
  _id: string;
  _creationTime: number;
};

type Handler<TArgs, TResult> = (
  ctx: MutationCtx | QueryCtx,
  args: TArgs,
) => Promise<TResult>;

function handler<TArgs, TResult>(value: unknown): Handler<TArgs, TResult> {
  return (value as { _handler: Handler<TArgs, TResult> })._handler;
}

class MemoryDb {
  private sequence = 0;
  private readonly tables = new Map<string, Map<string, StoredDocument>>();
  readonly queryCalls: string[] = [];

  seed(table: string, id: string, document: Record<string, unknown>) {
    this.table(table).set(id, {
      _id: id,
      _creationTime: ++this.sequence,
      ...document,
    });
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

  normalizeId(table: string, value: string) {
    return value.startsWith(`${table}:`) ? value : null;
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
  }

  query(tableName: string) {
    this.queryCalls.push(tableName);
    let matches = this.rows(tableName);
    let descending = false;
    const query = {
      withIndex: (_indexName: string, configure: (builder: { eq: (field: string, value: unknown) => unknown }) => unknown) => {
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
      take: async (count: number) => matches.slice(0, count),
      paginate: async ({ cursor, numItems }: { cursor: string | null; numItems: number }) => {
        const start = cursor ? Number(cursor) : 0;
        const ordered = descending ? [...matches].reverse() : matches;
        const page = ordered.slice(start, start + numItems);
        const next = start + page.length;
        return {
          page,
          isDone: next >= ordered.length,
          continueCursor: String(next),
        };
      },
    };
    return query;
  }

  context(): MutationCtx {
    return { db: this } as unknown as MutationCtx;
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

const applyChange = handler<Record<string, unknown>, Record<string, unknown>>(
  applyAdministrationChange,
);
const bootstrapAdministrator = handler<Record<string, unknown>, Record<string, unknown>>(
  bootstrapFirstSysadmin,
);
const resolveContext = handler<Record<string, unknown>, Record<string, unknown>>(
  resolveAccessContext,
);
const readAdministrationAccounts = handler<Record<string, unknown>, Record<string, unknown>>(
  listAdministrationAccounts,
);
const readAdministrationDepartments = handler<Record<string, unknown>, Record<string, unknown>>(
  listAdministrationDepartments,
);
const readAccount = handler<Record<string, unknown>, Record<string, unknown> | null>(
  getAccountById,
);
const readCredentialByAccount = handler<Record<string, unknown>, Record<string, unknown> | null>(
  getCredentialByAccountId,
);
const readCredentialByUsername = handler<Record<string, unknown>, Record<string, unknown> | null>(
  getCredentialByUsername,
);
const incrementRateLimit = handler<Record<string, unknown>, { allowed: boolean }>(
  checkAndIncrementLoginRateLimit,
);
const clearRateLimit = handler<Record<string, unknown>, { ok: true }>(
  clearLoginRateLimit,
);
const changePassword = handler<Record<string, unknown>, { ok: boolean }>(
  changeOwnPassword,
);

function seedAdministrator(db: MemoryDb) {
  db.seed('organizations', 'organizations:school', {
    slug: 'school', name: 'School', isActive: true,
    createdAt: 1, updatedAt: 1,
  });
  db.seed('accounts', 'accounts:admin', {
    organizationId: 'organizations:school', username: 'admin', displayName: 'Admin',
    sharedSessionRole: 'admin', isActive: true, createdAt: 1, updatedAt: 1,
  });
  db.seed('role_assignments', 'role_assignments:admin', {
    organizationId: 'organizations:school', accountId: 'accounts:admin', role: 'sysadmin',
    status: 'active', createdByAccountId: 'accounts:admin', createdAt: 1,
  });
}

function administrationArgs(_requestId: string, change: Record<string, unknown>) {
  return {
    actorAccountId: 'accounts:admin',
    organizationId: 'organizations:school',
    change,
  };
}

describe('Danielson Convex foundation handlers', () => {
  it('seeds the first organization and sysadmin with a required password change', async () => {
    const db = new MemoryDb();

    await expect(bootstrapAdministrator(db.context(), {
      organizationSlug: 'school',
      organizationName: 'School',
      username: 'admin',
      displayName: 'System Administrator',
      passwordHash: 'temporary-password-hash',
      passwordSalt: 'temporary-password-salt',
      passwordHashIterations: 120000,
    })).resolves.toMatchObject({ kind: 'created' });

    expect(db.rows('organizations')).toHaveLength(1);
    expect(db.rows('accounts')).toHaveLength(1);
    expect(db.rows('role_assignments')).toHaveLength(1);
    expect(db.rows('auth_credentials')[0]).toMatchObject({
      mustChangePassword: true,
      isActive: true,
    });
    await expect(bootstrapAdministrator(db.context(), {
      organizationSlug: 'school-two',
      organizationName: 'School Two',
      username: 'admin-two',
      displayName: 'Second Administrator',
      passwordHash: 'temporary-password-hash',
      passwordSalt: 'temporary-password-salt',
      passwordHashIterations: 120000,
    })).resolves.toEqual({ kind: 'already_bootstrapped' });
  });

  it('creates one account and one temporary credential', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    const args = administrationArgs('create-teacher-1', {
      kind: 'account.create',
      username: 'Teacher.One',
      displayName: 'Teacher One',
      passwordHash: 'secret-hash',
      passwordSalt: 'secret-salt',
      passwordHashIterations: 120000,
      mustChangePassword: true,
      sharedSessionRole: 'teacher',
    });

    await expect(applyChange(db.context(), args)).resolves.toMatchObject({ kind: 'applied' });
    expect(db.rows('accounts')).toHaveLength(2);
    expect(db.rows('auth_credentials')).toHaveLength(1);
    expect(db.rows('teacher_profiles')).toHaveLength(1);
    expect(db.rows('auth_credentials')[0]).toMatchObject({
      username: 'teacher.one',
      mustChangePassword: true,
    });
  });

  it('applies every account, department, role, and supervisor assignment change', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:teacher', {
      organizationId: 'organizations:school', username: 'teacher', displayName: 'Teacher',
      sharedSessionRole: 'teacher', isActive: true, createdAt: 1, updatedAt: 1,
    });
    db.seed('auth_credentials', 'auth_credentials:teacher', {
      accountId: 'accounts:teacher', username: 'teacher', passwordHash: 'hash',
      passwordSalt: 'salt', passwordHashIterations: 120000, isActive: true,
      mustChangePassword: false, createdAt: 1, updatedAt: 1,
    });
    db.seed('teacher_profiles', 'teacher_profiles:teacher', {
      organizationId: 'organizations:school', accountId: 'accounts:teacher', isActive: true,
      createdAt: 1, updatedAt: 1,
    });

    let sequence = 0;
    const run = async (change: Record<string, unknown>) => {
      sequence += 1;
      const result = await applyChange(db.context(), administrationArgs(`change-${sequence}`, change));
      expect(result).toMatchObject({ kind: 'applied' });
      return result;
    };

    await run({
      kind: 'account.update', targetAccountId: 'accounts:teacher',
      username: 'teacher.updated', displayName: 'Teacher Updated',
    });
    await run({ kind: 'account.deactivate', targetAccountId: 'accounts:teacher' });
    await run({ kind: 'account.activate', targetAccountId: 'accounts:teacher' });
    await run({ kind: 'role.assign', targetAccountId: 'accounts:teacher', role: 'hod' });
    await run({ kind: 'role.revoke', targetAccountId: 'accounts:teacher', role: 'hod' });

    const departmentResult = await run({
      kind: 'department.create', key: 'math', name: 'Mathematics',
    });
    const departmentId = String(departmentResult.targetId);
    await run({ kind: 'department.update', departmentId, name: 'Math' });
    await run({
      kind: 'department_membership.assign', departmentId,
      teacherAccountId: 'accounts:teacher',
    });
    await run({
      kind: 'department_membership.revoke', departmentId,
      teacherAccountId: 'accounts:teacher',
    });
    await run({
      kind: 'hod_assignment.assign', departmentId, accountId: 'accounts:admin',
    });
    await run({
      kind: 'hod_assignment.revoke', departmentId, accountId: 'accounts:admin',
    });
    await run({
      kind: 'coach_assignment.assign', accountId: 'accounts:admin',
      teacherAccountId: 'accounts:teacher',
    });
    await run({
      kind: 'coach_assignment.revoke', accountId: 'accounts:admin',
      teacherAccountId: 'accounts:teacher',
    });
    await run({ kind: 'department.deactivate', departmentId });
    await run({ kind: 'department.activate', departmentId });

    expect(await db.get('accounts:teacher')).toMatchObject({
      username: 'teacher.updated', displayName: 'Teacher Updated', isActive: true,
    });
    expect(await db.get(String(departmentId))).toMatchObject({ name: 'Math', isActive: true });
  });

  it('rejects malformed targets, no-op changes, and removal of the final active system administrator', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);

    await expect(applyChange(db.context(), administrationArgs('bad-id', {
      kind: 'account.deactivate', targetAccountId: 'not-an-id',
    }))).resolves.toEqual({ kind: 'invalid', reason: 'target_not_found' });

    await expect(applyChange(db.context(), administrationArgs('no-change', {
      kind: 'account.update', targetAccountId: 'accounts:admin', displayName: 'Admin',
    }))).resolves.toEqual({ kind: 'invalid', reason: 'no_change' });

    await expect(applyChange(db.context(), administrationArgs('final-admin', {
      kind: 'account.deactivate', targetAccountId: 'accounts:admin',
    }))).resolves.toEqual({ kind: 'denied', reason: 'final_active_sysadmin' });
    expect(db.rows('accounts')[0].isActive).toBe(true);
  });

  it('uses current accounts and roles to protect the final active system administrator', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:second-admin', {
      organizationId: 'organizations:school', username: 'second-admin', displayName: 'Second Admin',
      sharedSessionRole: 'admin', isActive: true, createdAt: 1, updatedAt: 1,
    });

    await expect(applyChange(db.context(), administrationArgs('assign-second-admin', {
      kind: 'role.assign', targetAccountId: 'accounts:second-admin', role: 'sysadmin',
    }))).resolves.toMatchObject({ kind: 'applied' });

    await expect(applyChange(db.context(), administrationArgs('deactivate-first-admin', {
      kind: 'account.deactivate', targetAccountId: 'accounts:admin',
    }))).resolves.toMatchObject({ kind: 'applied' });
    expect((await db.get('accounts:admin'))?.isActive).toBe(false);

    const secondActor = { actorAccountId: 'accounts:second-admin' };
    await expect(applyChange(db.context(), {
      ...administrationArgs('reactivate-first-admin', {
        kind: 'account.activate', targetAccountId: 'accounts:admin',
      }),
      ...secondActor,
    })).resolves.toMatchObject({ kind: 'applied' });

    await expect(applyChange(db.context(), {
      ...administrationArgs('revoke-first-admin', {
        kind: 'role.revoke', targetAccountId: 'accounts:admin', role: 'sysadmin',
      }),
      ...secondActor,
    })).resolves.toMatchObject({ kind: 'applied' });

    await expect(applyChange(db.context(), {
      ...administrationArgs('deactivate-final-admin', {
        kind: 'account.deactivate', targetAccountId: 'accounts:second-admin',
      }),
      ...secondActor,
    })).resolves.toEqual({ kind: 'denied', reason: 'final_active_sysadmin' });
  });

  it('does not treat an account without an active teacher profile as an active subject', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:subject', {
      organizationId: 'organizations:school', username: 'subject', displayName: 'Subject',
      sharedSessionRole: 'teacher', isActive: true, createdAt: 1, updatedAt: 1,
    });

    await expect(resolveContext(db.context(), {
      actorAccountId: 'accounts:admin',
      subjectAccountId: 'accounts:subject',
    })).resolves.toMatchObject({ subject: { accountId: 'accounts:subject', isActive: false } });
  });

  it('stops before protected scope reads for a subject in another organization', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('organizations', 'organizations:other', {
      slug: 'other', name: 'Other', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    db.seed('accounts', 'accounts:foreign', {
      organizationId: 'organizations:other', username: 'foreign', displayName: 'Foreign',
      sharedSessionRole: 'teacher', isActive: true, createdAt: 1, updatedAt: 1,
    });
    db.queryCalls.length = 0;

    await expect(resolveContext(db.context(), {
      actorAccountId: 'accounts:admin',
      subjectAccountId: 'accounts:foreign',
    })).resolves.toMatchObject({
      subject: {
        accountId: 'accounts:foreign',
        organizationId: 'organizations:other',
        departmentIds: [],
      },
    });
    expect(db.queryCalls).not.toContain('teacher_profiles');
    expect(db.queryCalls).not.toContain('department_memberships');
    expect(db.queryCalls).not.toContain('hod_assignments');
    expect(db.queryCalls).not.toContain('coach_assignments');
  });

  it('rejects teacher assignments when the profile owner account is inactive', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:teacher', {
      organizationId: 'organizations:school', username: 'teacher', displayName: 'Teacher',
      sharedSessionRole: 'teacher', isActive: false, createdAt: 1, updatedAt: 1,
    });
    db.seed('teacher_profiles', 'teacher_profiles:teacher', {
      organizationId: 'organizations:school', accountId: 'accounts:teacher', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    db.seed('departments', 'departments:math', {
      organizationId: 'organizations:school', key: 'math', name: 'Math', isActive: true,
      createdAt: 1, updatedAt: 1,
    });

    await expect(applyChange(db.context(), administrationArgs('inactive-membership', {
      kind: 'department_membership.assign',
      departmentId: 'departments:math',
      teacherProfileId: 'teacher_profiles:teacher',
    }))).resolves.toEqual({ kind: 'invalid', reason: 'relation_not_found' });
    await expect(applyChange(db.context(), administrationArgs('inactive-coach', {
      kind: 'coach_assignment.assign',
      accountId: 'accounts:admin',
      teacherProfileId: 'teacher_profiles:teacher',
    }))).resolves.toEqual({ kind: 'invalid', reason: 'relation_not_found' });
  });

  it('revokes existing relationships after linked records become inactive', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:teacher', {
      organizationId: 'organizations:school', username: 'teacher', displayName: 'Teacher',
      sharedSessionRole: 'teacher', isActive: true, createdAt: 1, updatedAt: 1,
    });
    db.seed('teacher_profiles', 'teacher_profiles:teacher', {
      organizationId: 'organizations:school', accountId: 'accounts:teacher', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    db.seed('departments', 'departments:math', {
      organizationId: 'organizations:school', key: 'math', name: 'Math', isActive: true,
      createdAt: 1, updatedAt: 1,
    });

    await applyChange(db.context(), administrationArgs('assign-membership', {
      kind: 'department_membership.assign', departmentId: 'departments:math',
      teacherAccountId: 'accounts:teacher',
    }));
    await applyChange(db.context(), administrationArgs('assign-hod', {
      kind: 'hod_assignment.assign', departmentId: 'departments:math',
      accountId: 'accounts:admin',
    }));
    await applyChange(db.context(), administrationArgs('assign-coach', {
      kind: 'coach_assignment.assign', accountId: 'accounts:admin',
      teacherAccountId: 'accounts:teacher',
    }));
    await db.patch('accounts:teacher', { isActive: false });
    await db.patch('teacher_profiles:teacher', { isActive: false });
    await db.patch('departments:math', { isActive: false });

    await expect(applyChange(db.context(), administrationArgs('revoke-membership', {
      kind: 'department_membership.revoke', departmentId: 'departments:math',
      teacherAccountId: 'accounts:teacher',
    }))).resolves.toMatchObject({ kind: 'applied' });
    await expect(applyChange(db.context(), administrationArgs('revoke-hod', {
      kind: 'hod_assignment.revoke', departmentId: 'departments:math',
      accountId: 'accounts:admin',
    }))).resolves.toMatchObject({ kind: 'applied' });
    await expect(applyChange(db.context(), administrationArgs('revoke-coach', {
      kind: 'coach_assignment.revoke', accountId: 'accounts:admin',
      teacherAccountId: 'accounts:teacher',
    }))).resolves.toMatchObject({ kind: 'applied' });
    expect(db.rows('department_memberships')[0]).toMatchObject({ status: 'revoked' });
    expect(db.rows('hod_assignments')[0]).toMatchObject({ status: 'revoked' });
    expect(db.rows('coach_assignments')[0]).toMatchObject({ status: 'revoked' });
  });

  it('limits one teacher profile to 100 active department memberships', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:teacher', {
      organizationId: 'organizations:school', username: 'teacher', displayName: 'Teacher',
      sharedSessionRole: 'teacher', isActive: true, createdAt: 1, updatedAt: 1,
    });
    db.seed('teacher_profiles', 'teacher_profiles:teacher', {
      organizationId: 'organizations:school', accountId: 'accounts:teacher', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    db.seed('departments', 'departments:new', {
      organizationId: 'organizations:school', key: 'new', name: 'New', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    for (let index = 0; index < 100; index += 1) {
      db.seed('department_memberships', `department_memberships:${index}`, {
        organizationId: 'organizations:school',
        departmentId: `departments:existing-${index}`,
        teacherProfileId: 'teacher_profiles:teacher',
        status: 'active', createdByAccountId: 'accounts:admin', createdAt: 1,
      });
    }

    await expect(applyChange(db.context(), administrationArgs('membership-over-limit', {
      kind: 'department_membership.assign',
      departmentId: 'departments:new',
      teacherAccountId: 'accounts:teacher',
    }))).resolves.toEqual({ kind: 'denied', reason: 'assignment_limit_reached' });
    expect(db.rows('department_memberships')).toHaveLength(100);
  });

  it('finds an exact HOD assignment when more than 100 unrelated assignments exist', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:subject', {
      organizationId: 'organizations:school', username: 'subject', displayName: 'Subject',
      sharedSessionRole: 'teacher', isActive: true, createdAt: 1, updatedAt: 1,
    });
    db.seed('teacher_profiles', 'teacher_profiles:subject', {
      organizationId: 'organizations:school', accountId: 'accounts:subject', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    db.seed('departments', 'departments:math', {
      organizationId: 'organizations:school', key: 'math', name: 'Math', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    db.seed('department_memberships', 'department_memberships:subject', {
      organizationId: 'organizations:school', departmentId: 'departments:math',
      teacherProfileId: 'teacher_profiles:subject', status: 'active',
      createdByAccountId: 'accounts:admin', createdAt: 1,
    });
    for (let index = 0; index < 110; index += 1) {
      db.seed('hod_assignments', `hod_assignments:unrelated-${index}`, {
        organizationId: 'organizations:school', accountId: `accounts:other-${index}`,
        departmentId: 'departments:math', status: 'active',
        createdByAccountId: 'accounts:admin', createdAt: 1,
      });
    }
    db.seed('hod_assignments', 'hod_assignments:admin-math', {
      organizationId: 'organizations:school', accountId: 'accounts:admin',
      departmentId: 'departments:math', status: 'active',
      createdByAccountId: 'accounts:admin', createdAt: 1,
    });

    await expect(resolveContext(db.context(), {
      actorAccountId: 'accounts:admin',
      subjectAccountId: 'accounts:subject',
    })).resolves.toMatchObject({
      hodDepartmentAssignments: [{ departmentId: 'departments:math', status: 'active' }],
    });
  });

  it('returns current account IDs, roles, teacher status, and department IDs to a system administrator', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('accounts', 'accounts:teacher', {
      organizationId: 'organizations:school', username: 'teacher', displayName: 'Teacher',
      sharedSessionRole: 'teacher', isActive: true, createdAt: 1, updatedAt: 1,
    });
    db.seed('teacher_profiles', 'teacher_profiles:teacher', {
      organizationId: 'organizations:school', accountId: 'accounts:teacher', isActive: true,
      createdAt: 1, updatedAt: 1,
    });
    db.seed('role_assignments', 'role_assignments:teacher', {
      organizationId: 'organizations:school', accountId: 'accounts:teacher', role: 'teacher',
      status: 'active', createdByAccountId: 'accounts:admin', createdAt: 1,
    });
    db.seed('departments', 'departments:math', {
      organizationId: 'organizations:school', key: 'math', name: 'Math', isActive: true,
      createdAt: 1, updatedAt: 1,
    });

    await expect(readAdministrationAccounts(db.context(), {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: null, numItems: 100 },
    })).resolves.toMatchObject({
      kind: 'allowed',
      accountPage: {
        items: expect.arrayContaining([{
          accountId: 'accounts:teacher', username: 'teacher', displayName: 'Teacher',
          isActive: true, isTeacher: true, roles: ['teacher'],
        }]),
        nextCursor: null,
      },
    });
    await expect(readAdministrationDepartments(db.context(), {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: null, numItems: 100 },
    })).resolves.toMatchObject({
      kind: 'allowed',
      departmentPage: {
        items: [{
          departmentId: 'departments:math', key: 'math', name: 'Math', isActive: true,
        }],
        nextCursor: null,
      },
    });
  });

  it('returns the next administration page after the first 100 records', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    for (let index = 0; index < 100; index += 1) {
      db.seed('accounts', `accounts:teacher-${index}`, {
        organizationId: 'organizations:school', username: `teacher-${index}`,
        displayName: `Teacher ${index}`, sharedSessionRole: 'teacher', isActive: true,
        createdAt: index + 2, updatedAt: index + 2,
      });
    }
    for (let index = 0; index < 101; index += 1) {
      db.seed('departments', `departments:department-${index}`, {
        organizationId: 'organizations:school', key: `department-${index}`,
        name: `Department ${index}`, isActive: true,
        createdAt: index + 2, updatedAt: index + 2,
      });
    }

    const firstAccounts = await readAdministrationAccounts(db.context(), {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: null, numItems: 500 },
    });
    const firstDepartments = await readAdministrationDepartments(db.context(), {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: null, numItems: 500 },
    });
    expect(firstAccounts).toMatchObject({
      kind: 'allowed',
      accountPage: { items: expect.any(Array), nextCursor: '100' },
    });
    expect(firstDepartments).toMatchObject({
      kind: 'allowed',
      departmentPage: { items: expect.any(Array), nextCursor: '100' },
    });
    expect((firstAccounts as { accountPage: { items: unknown[] } }).accountPage.items).toHaveLength(100);
    expect((firstDepartments as { departmentPage: { items: unknown[] } }).departmentPage.items).toHaveLength(100);

    const secondAccounts = await readAdministrationAccounts(db.context(), {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: '100', numItems: 100 },
    });
    const secondDepartments = await readAdministrationDepartments(db.context(), {
      actorAccountId: 'accounts:admin',
      paginationOpts: { cursor: '100', numItems: 100 },
    });
    expect(secondAccounts).toMatchObject({
      kind: 'allowed',
      accountPage: { nextCursor: null },
    });
    expect(secondDepartments).toMatchObject({
      kind: 'allowed',
      departmentPage: { nextCursor: null },
    });
    expect((secondAccounts as { accountPage: { items: unknown[] } }).accountPage.items).toHaveLength(1);
    expect((secondDepartments as { departmentPage: { items: unknown[] } }).departmentPage.items).toHaveLength(1);
  });

});

describe('Danielson Convex authentication handlers', () => {
  it('returns an active credential by username and account ID', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('auth_credentials', 'auth_credentials:admin', {
      accountId: 'accounts:admin', username: 'admin', passwordHash: 'hash', passwordSalt: 'salt',
      passwordHashIterations: 120000, isActive: true, mustChangePassword: true,
      createdAt: 1, updatedAt: 1,
    });

    await expect(readCredentialByUsername(db.context(), { username: 'admin' })).resolves.toMatchObject({
      accountId: 'accounts:admin', username: 'admin', mustChangePassword: true,
    });
    await expect(readCredentialByAccount(db.context(), { accountId: 'accounts:admin' })).resolves.toMatchObject({
      accountId: 'accounts:admin', username: 'admin', mustChangePassword: true,
    });
  });

  it('reports an inactive or missing credential as inactive account access', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);

    await expect(readAccount(db.context(), { accountId: 'accounts:admin' })).resolves.toMatchObject({
      credentialIsActive: false,
    });
    db.seed('auth_credentials', 'auth_credentials:admin', {
      accountId: 'accounts:admin', username: 'admin', passwordHash: 'hash', passwordSalt: 'salt',
      passwordHashIterations: 120000, isActive: false, mustChangePassword: false,
      createdAt: 1, updatedAt: 1,
    });
    await expect(readAccount(db.context(), { accountId: 'accounts:admin' })).resolves.toMatchObject({
      credentialIsActive: false,
    });
  });

  it('replaces a temporary password and clears the required-change flag', async () => {
    const db = new MemoryDb();
    seedAdministrator(db);
    db.seed('auth_credentials', 'auth_credentials:admin', {
      accountId: 'accounts:admin', username: 'admin', passwordHash: 'old-hash',
      passwordSalt: 'old-salt', passwordHashIterations: 120000, isActive: true,
      mustChangePassword: true, createdAt: 1, updatedAt: 1,
    });

    await expect(changePassword(db.context(), {
      accountId: 'accounts:admin',
      expectedPasswordSalt: 'old-salt',
      passwordHash: 'new-hash',
      passwordSalt: 'new-salt',
      passwordHashIterations: 120000,
    })).resolves.toEqual({ ok: true, username: 'admin' });
    expect(await db.get('auth_credentials:admin')).toMatchObject({
      passwordHash: 'new-hash',
      passwordSalt: 'new-salt',
      mustChangePassword: false,
    });
  });

  it('blocks the sixth failed sign-in and clears the limit after success', async () => {
    const db = new MemoryDb();
    for (let attempt = 1; attempt <= 5; attempt += 1) {
      await expect(incrementRateLimit(db.context(), { key: 'login-key' })).resolves.toMatchObject({
        allowed: true,
      });
    }
    await expect(incrementRateLimit(db.context(), { key: 'login-key' })).resolves.toMatchObject({
      allowed: false,
    });
    await expect(clearRateLimit(db.context(), { key: 'login-key' })).resolves.toEqual({ ok: true });
    expect(db.rows('login_rate_limits')).toHaveLength(0);
  });
});

it('lets an administrator reset another account without exposing stored credentials', async () => {
  const db = new MemoryDb();
  seedAdministrator(db);
  const created = await applyChange(db.context(), administrationArgs('create', {
    kind: 'account.create', username: 'reset-target', displayName: 'Target',
    passwordHash: 'old-hash', passwordSalt: 'old-salt', passwordHashIterations: 120000,
  }));
  const targetId = created.targetId;
  const previous = db.rows('auth_credentials')[0].updatedAt;
  const result = await applyChange(db.context(), administrationArgs('reset', {
    kind: 'account.reset_password', targetAccountId: targetId,
    passwordHash: 'new-hash', passwordSalt: 'new-salt', passwordHashIterations: 120000,
  }));
  expect(result).toMatchObject({ kind: 'applied', targetId });
  expect(result).not.toHaveProperty('passwordHash');
  expect(db.rows('auth_credentials')[0]).toMatchObject({ passwordHash: 'new-hash', mustChangePassword: true });
  expect(Number(db.rows('auth_credentials')[0].updatedAt)).toBeGreaterThan(Number(previous));
});


it('lists current assignments within the administrator organization', async () => {
  const db = new MemoryDb();
  seedAdministrator(db);
  db.seed('accounts', 'accounts:teacher', { organizationId: 'organizations:school', displayName: 'Teacher', isActive: true });
  db.seed('teacher_profiles', 'teacher_profiles:teacher', { organizationId: 'organizations:school', accountId: 'accounts:teacher', isActive: true });
  db.seed('departments', 'departments:math', { organizationId: 'organizations:school', name: 'Math', isActive: true });
  db.seed('department_memberships', 'department_memberships:current', { organizationId: 'organizations:school', departmentId: 'departments:math', teacherProfileId: 'teacher_profiles:teacher', status: 'active' });
  db.seed('department_memberships', 'department_memberships:other', { organizationId: 'organizations:other', departmentId: 'departments:math', teacherProfileId: 'teacher_profiles:teacher', status: 'active' });
  const result = await handler<Record<string, unknown>, Record<string, unknown>>(listAdministrationAssignments)(db.context(), {
    actorAccountId: 'accounts:admin', kind: 'department_memberships', paginationOpts: { cursor: null, numItems: 25 },
  });
  expect(result).toMatchObject({ kind: 'allowed', items: [{ person: 'Teacher', assignment: 'Math' }] });
});

it('does not overwrite a password reset with an earlier password-change request', async () => {
  const db = new MemoryDb();
  seedAdministrator(db);
  db.seed('auth_credentials', 'auth_credentials:admin', {
    accountId: 'accounts:admin', username: 'admin', passwordHash: 'reset-hash', passwordSalt: 'reset-salt',
    passwordHashIterations: 120000, isActive: true, mustChangePassword: true, createdAt: 1, updatedAt: 2,
  });
  const result = await changePassword(db.context(), {
    accountId: 'accounts:admin', expectedPasswordSalt: 'old-salt',
    passwordHash: 'stale-hash', passwordSalt: 'stale-salt', passwordHashIterations: 120000,
  });
  expect(result.ok).toBe(false);
  expect(db.rows('auth_credentials')[0].passwordHash).toBe('reset-hash');
});
