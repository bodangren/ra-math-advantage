import { paginationOptsValidator } from 'convex/server';
import { internalMutation, internalQuery, type MutationCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { v } from 'convex/values';

import { sanitizeAuditSnapshot } from '../lib/foundation/audit';
import { countActiveSysadmins } from '../lib/foundation/sysadmin-policy';

const scalarValidator = v.union(v.string(), v.number(), v.boolean(), v.null());
const snapshotValidator = v.record(v.string(), scalarValidator);
const roleValidator = v.union(
  v.literal('teacher'),
  v.literal('hod'),
  v.literal('coach'),
  v.literal('school_head'),
  v.literal('slt'),
  v.literal('sysadmin'),
);
const accessContextValidator = v.object({
  actor: v.union(v.null(), v.object({ accountId: v.string(), organizationId: v.string(), isActive: v.boolean(), organizationIsActive: v.boolean() })),
  subject: v.union(v.null(), v.object({ accountId: v.string(), organizationId: v.string(), departmentIds: v.array(v.string()), isActive: v.boolean() })),
  roleAssignments: v.array(v.object({ accountId: v.string(), organizationId: v.string(), role: roleValidator, status: v.union(v.literal('active'), v.literal('revoked')) })),
  hodDepartmentAssignments: v.array(v.object({ accountId: v.string(), organizationId: v.string(), departmentId: v.string(), status: v.union(v.literal('active'), v.literal('revoked')) })),
  coachTeacherAssignments: v.array(v.object({ accountId: v.string(), organizationId: v.string(), teacherAccountId: v.string(), status: v.union(v.literal('active'), v.literal('revoked')) })),
});

const changeValidator = v.object({
  kind: v.string(),
  targetAccountId: v.optional(v.string()),
  accountId: v.optional(v.string()),
  teacherAccountId: v.optional(v.string()),
  teacherProfileId: v.optional(v.string()),
  departmentId: v.optional(v.string()),
  targetId: v.optional(v.string()),
  role: v.optional(v.string()),
  displayName: v.optional(v.string()),
  username: v.optional(v.string()),
  organizationId: v.optional(v.string()),
  key: v.optional(v.string()),
  name: v.optional(v.string()),
  position: v.optional(v.string()),
  passwordHash: v.optional(v.string()),
  passwordSalt: v.optional(v.string()),
  passwordHashIterations: v.optional(v.number()),
  mustChangePassword: v.optional(v.boolean()),
  sharedSessionRole: v.optional(v.union(v.literal('teacher'), v.literal('admin'))),
});

type Role = 'teacher' | 'hod' | 'coach' | 'school_head' | 'slt' | 'sysadmin';
type Action =
  | 'account.create'
  | 'account.update'
  | 'account.activate'
  | 'account.deactivate'
  | 'role.assign'
  | 'role.revoke'
  | 'department.create'
  | 'department.update'
  | 'department.activate'
  | 'department.deactivate'
  | 'department_membership.assign'
  | 'department_membership.revoke'
  | 'hod_assignment.assign'
  | 'hod_assignment.revoke'
  | 'coach_assignment.assign'
  | 'coach_assignment.revoke';

function isRole(value: string | undefined): value is Role {
  return value === 'teacher'
    || value === 'hod'
    || value === 'coach'
    || value === 'school_head'
    || value === 'slt'
    || value === 'sysadmin';
}

function isAction(value: string): value is Action {
  return value === 'account.create'
    || value === 'account.update'
    || value === 'account.activate'
    || value === 'account.deactivate'
    || value === 'role.assign'
    || value === 'role.revoke'
    || value === 'department.create'
    || value === 'department.update'
    || value === 'department.activate'
    || value === 'department.deactivate'
    || value === 'department_membership.assign'
    || value === 'department_membership.revoke'
    || value === 'hod_assignment.assign'
    || value === 'hod_assignment.revoke'
    || value === 'coach_assignment.assign'
    || value === 'coach_assignment.revoke';
}

function targetTypeFor(action: Action) {
  if (action.startsWith('account.')) return 'account' as const;
  if (action.startsWith('role.')) return 'role_assignment' as const;
  if (action.startsWith('department_membership.')) return 'department_membership' as const;
  if (action.startsWith('hod_assignment.')) return 'hod_assignment' as const;
  if (action.startsWith('coach_assignment.')) return 'coach_assignment' as const;
  return 'department' as const;
}

function administrationCapability(changeKind: string): 'accounts' | 'departments' | 'assignments' {
  if (changeKind.startsWith('account.')) return 'accounts';
  if (changeKind.startsWith('department.')) return 'departments';
  return 'assignments';
}

async function activeSysadminCount(ctx: MutationCtx, organizationId: Id<'organizations'>) {
  let cursor: string | null = null;
  let count = 0;
  do {
    const result = await ctx.db
      .query('role_assignments')
      .withIndex('by_organizationId_and_role_and_status', (query) =>
        query.eq('organizationId', organizationId).eq('role', 'sysadmin').eq('status', 'active'),
      )
      .paginate({ cursor, numItems: 100 });
    const accounts = await Promise.all(result.page.map((role) => ctx.db.get(role.accountId)));
    count += countActiveSysadmins(accounts, String(organizationId));
    if (count >= 2 || result.isDone) return count;
    cursor = result.continueCursor;
  } while (cursor);
  return count;
}

export const resolveAccessContext = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    subjectAccountId: v.optional(v.id('accounts')),
  },
  returns: accessContextValidator,
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor) {
      return {
        actor: null,
        subject: null,
        roleAssignments: [],
        hodDepartmentAssignments: [],
        coachTeacherAssignments: [],
      };
    }
    const organization = await ctx.db.get(actor.organizationId);
    const roleAssignments = await ctx.db
      .query('role_assignments')
      .withIndex('by_organizationId_and_accountId_and_status', (query) =>
        query.eq('organizationId', actor.organizationId).eq('accountId', actor._id).eq('status', 'active'),
      )
      .take(6);
    const hodDepartmentAssignments: Doc<'hod_assignments'>[] = [];
    const coachTeacherAssignments: Array<{
      accountId: string;
      organizationId: string;
      teacherAccountId: string;
      status: 'active';
    }> = [];

    let subject = null;
    if (args.subjectAccountId) {
      const subjectAccount = await ctx.db.get(args.subjectAccountId);
      if (subjectAccount) {
        const teacherProfile = await ctx.db
          .query('teacher_profiles')
          .withIndex('by_accountId', (query) => query.eq('accountId', subjectAccount._id))
          .unique();
        const departmentIds: string[] = [];
        if (teacherProfile?.isActive) {
          const memberships: Doc<'department_memberships'>[] = [];
          let cursor: string | null = null;
          do {
            const result = await ctx.db
              .query('department_memberships')
              .withIndex('by_organizationId_and_teacherProfileId_and_status', (query) =>
                query.eq('organizationId', subjectAccount.organizationId)
                  .eq('teacherProfileId', teacherProfile._id)
                  .eq('status', 'active'),
              )
              .paginate({ cursor, numItems: 100 });
            memberships.push(...result.page);
            if (result.isDone) break;
            cursor = result.continueCursor;
          } while (cursor);

          for (const membership of memberships) {
            const department = await ctx.db.get(membership.departmentId);
            if (!department?.isActive) continue;
            departmentIds.push(String(department._id));
            const hodAssignment = await ctx.db
              .query('hod_assignments')
              .withIndex('by_organizationId_and_accountId_and_departmentId_and_status', (query) =>
                query.eq('organizationId', actor.organizationId)
                  .eq('accountId', actor._id)
                  .eq('departmentId', department._id)
                  .eq('status', 'active'),
              )
              .unique();
            if (hodAssignment) hodDepartmentAssignments.push(hodAssignment);
          }

          const coachAssignment = await ctx.db
            .query('coach_assignments')
            .withIndex('by_organizationId_and_accountId_and_teacherProfileId_and_status', (query) =>
              query.eq('organizationId', actor.organizationId)
                .eq('accountId', actor._id)
                .eq('teacherProfileId', teacherProfile._id)
                .eq('status', 'active'),
            )
            .unique();
          if (coachAssignment) {
            coachTeacherAssignments.push({
              accountId: String(actor._id),
              organizationId: String(actor.organizationId),
              teacherAccountId: String(subjectAccount._id),
              status: 'active',
            });
          }
        }
        subject = {
          accountId: String(subjectAccount._id),
          organizationId: String(subjectAccount.organizationId),
          departmentIds,
          isActive: subjectAccount.isActive && (teacherProfile?.isActive ?? false),
        };
      }
    }

    return {
      actor: {
        accountId: String(actor._id),
        organizationId: String(actor.organizationId),
        isActive: actor.isActive,
        organizationIsActive: organization?.isActive ?? false,
      },
      subject,
      roleAssignments: roleAssignments.map((assignment) => ({
        accountId: String(assignment.accountId),
        organizationId: String(assignment.organizationId),
        role: assignment.role,
        status: assignment.status,
      })),
      hodDepartmentAssignments: hodDepartmentAssignments.map((assignment) => ({
        accountId: String(assignment.accountId),
        organizationId: String(assignment.organizationId),
        departmentId: String(assignment.departmentId),
        status: assignment.status,
      })),
      coachTeacherAssignments,
    };
  },
});

export const listAdministrationDirectory = internalQuery({
  args: { actorAccountId: v.id('accounts') },
  returns: v.union(
    v.object({ kind: v.literal('denied'), reason: v.string() }),
    v.object({
      kind: v.literal('allowed'),
      accounts: v.array(v.object({
        accountId: v.id('accounts'),
        username: v.string(),
        displayName: v.string(),
        isActive: v.boolean(),
        isTeacher: v.boolean(),
        roles: v.array(roleValidator),
      })),
      departments: v.array(v.object({
        departmentId: v.id('departments'),
        key: v.string(),
        name: v.string(),
        isActive: v.boolean(),
      })),
    }),
  ),
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    const organization = await ctx.db.get(actor.organizationId);
    if (!organization?.isActive) return { kind: 'denied' as const, reason: 'organization_inactive' };
    const sysadmin = await ctx.db
      .query('role_assignments')
      .withIndex('by_organizationId_and_accountId_and_role_and_status', (query) =>
        query.eq('organizationId', actor.organizationId)
          .eq('accountId', actor._id)
          .eq('role', 'sysadmin')
          .eq('status', 'active'),
      )
      .unique();
    if (!sysadmin) return { kind: 'denied' as const, reason: 'capability_not_granted' };

    const accounts = await ctx.db
      .query('accounts')
      .withIndex('by_organizationId', (query) => query.eq('organizationId', actor.organizationId))
      .take(100);
    const departments = await ctx.db
      .query('departments')
      .withIndex('by_organizationId', (query) => query.eq('organizationId', actor.organizationId))
      .take(100);
    const teacherProfiles = await ctx.db
      .query('teacher_profiles')
      .withIndex('by_organizationId_and_isActive', (query) =>
        query.eq('organizationId', actor.organizationId).eq('isActive', true),
      )
      .take(100);
    const teacherAccountIds = new Set(teacherProfiles.map((profile) => String(profile.accountId)));
    const rolesByAccount = new Map<string, Role[]>();
    for (const role of ['teacher', 'hod', 'coach', 'school_head', 'slt', 'sysadmin'] as const) {
      const assignments = await ctx.db
        .query('role_assignments')
        .withIndex('by_organizationId_and_role_and_status', (query) =>
          query.eq('organizationId', actor.organizationId).eq('role', role).eq('status', 'active'),
        )
        .take(100);
      for (const assignment of assignments) {
        const key = String(assignment.accountId);
        rolesByAccount.set(key, [...(rolesByAccount.get(key) ?? []), role]);
      }
    }

    return {
      kind: 'allowed' as const,
      accounts: accounts.map((account) => ({
        accountId: account._id,
        username: account.username,
        displayName: account.displayName,
        isActive: account.isActive,
        isTeacher: teacherAccountIds.has(String(account._id)),
        roles: rolesByAccount.get(String(account._id)) ?? [],
      })),
      departments: departments.map((department) => ({
        departmentId: department._id,
        key: department.key,
        name: department.name,
        isActive: department.isActive,
      })),
    };
  },
});

export const listAccessAuditEvents = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.object({
    page: v.array(v.object({
      _id: v.id('access_audit_events'),
      _creationTime: v.number(),
      organizationId: v.id('organizations'),
      requestId: v.string(),
      actorAccountId: v.id('accounts'),
      action: v.string(),
      targetType: v.string(),
      targetId: v.string(),
      occurredAt: v.number(),
      before: v.union(snapshotValidator, v.null()),
      after: v.union(snapshotValidator, v.null()),
    })),
    isDone: v.boolean(),
    continueCursor: v.string(),
  }),
  handler: async (ctx, args) => ctx.db
    .query('access_audit_events')
    .withIndex('by_organizationId_and_occurredAt', (query) => query.eq('organizationId', args.organizationId))
    .order('desc')
    .paginate(args.paginationOpts),
});

export const applyAdministrationChange = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    organizationId: v.id('organizations'),
    requestId: v.string(),
    change: changeValidator,
  },
  returns: v.object({
    kind: v.string(),
    reason: v.optional(v.string()),
    auditEventId: v.optional(v.id('access_audit_events')),
    targetId: v.optional(v.string()),
  }),
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorAccountId);
    const organization = await ctx.db.get(args.organizationId);
    if (!actor || actor.organizationId !== args.organizationId || !actor.isActive) {
      return { kind: 'denied' as const, reason: 'account_inactive' as const };
    }
    if (!organization?.isActive) return { kind: 'denied' as const, reason: 'organization_inactive' as const };

    const sysadmin = await ctx.db
      .query('role_assignments')
      .withIndex('by_organizationId_and_accountId_and_role_and_status', (query) =>
        query.eq('organizationId', args.organizationId)
          .eq('accountId', actor._id)
          .eq('role', 'sysadmin')
          .eq('status', 'active'),
      )
      .unique();
    if (!sysadmin) return { kind: 'denied' as const, reason: 'capability_not_granted' as const };

    const duplicate = await ctx.db
      .query('access_audit_events')
      .withIndex('by_organizationId_and_requestId', (query) =>
        query.eq('organizationId', args.organizationId).eq('requestId', args.requestId),
      )
      .unique();
    if (duplicate) return { kind: 'denied' as const, reason: 'duplicate_request' as const };

    if (!isAction(args.change.kind)) return { kind: 'invalid' as const, reason: 'invalid_action' as const };
    const action = args.change.kind;
    const capability = administrationCapability(action);
    if (capability === 'accounts' && !action.startsWith('account.')) {
      return { kind: 'invalid' as const, reason: 'invalid_action' as const };
    }

    const now = Date.now();
    let targetId = '';
    let before: Record<string, string | number | boolean | null> | null = null;
    let after: Record<string, string | number | boolean | null> | null = null;

    if (action === 'account.create') {
      const username = args.change.username?.trim().toLowerCase();
      const displayName = args.change.displayName?.trim();
      if (!username || !displayName || !args.change.passwordHash || !args.change.passwordSalt) {
        return { kind: 'invalid' as const, reason: 'invalid_account' as const };
      }
      const duplicateUsername = await ctx.db
        .query('accounts')
        .withIndex('by_username', (query) => query.eq('username', username))
        .unique();
      if (duplicateUsername) return { kind: 'denied' as const, reason: 'duplicate_username' as const };
      const accountId = await ctx.db.insert('accounts', {
        organizationId: args.organizationId,
        username,
        displayName,
        sharedSessionRole: args.change.sharedSessionRole ?? 'teacher',
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      await ctx.db.insert('auth_credentials', {
        accountId,
        username,
        passwordHash: args.change.passwordHash,
        passwordSalt: args.change.passwordSalt,
        passwordHashIterations: args.change.passwordHashIterations ?? 120000,
        isActive: true,
        mustChangePassword: args.change.mustChangePassword ?? true,
        createdAt: now,
        updatedAt: now,
      });
      if (args.change.position !== undefined || args.change.sharedSessionRole !== 'admin') {
        await ctx.db.insert('teacher_profiles', {
          organizationId: args.organizationId,
          accountId,
          position: args.change.position,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
      targetId = String(accountId);
      after = sanitizeAuditSnapshot({ accountId: targetId, organizationId: String(args.organizationId), username, displayName, isActive: true });
    } else if (action.startsWith('account.')) {
      const accountId = ctx.db.normalizeId('accounts', args.change.targetAccountId ?? args.change.accountId ?? '');
      const target = accountId ? await ctx.db.get(accountId) : null;
      if (!target || target.organizationId !== args.organizationId) return { kind: 'invalid' as const, reason: 'target_not_found' as const };
      targetId = String(target._id);
      before = sanitizeAuditSnapshot({ accountId: targetId, organizationId: String(target.organizationId), username: target.username, displayName: target.displayName, isActive: target.isActive });
      if (action === 'account.update') {
        const username = args.change.username?.trim().toLowerCase() || target.username;
        const displayName = args.change.displayName?.trim() || target.displayName;
        if (username === target.username && displayName === target.displayName) {
          return { kind: 'invalid' as const, reason: 'no_change' as const };
        }
        if (username !== target.username) {
          const duplicateUsername = await ctx.db.query('accounts').withIndex('by_username', (query) => query.eq('username', username)).unique();
          if (duplicateUsername) return { kind: 'denied' as const, reason: 'duplicate_username' as const };
        }
        await ctx.db.patch(target._id, {
          username,
          displayName,
          updatedAt: now,
        });
        const credential = await ctx.db.query('auth_credentials').withIndex('by_accountId', (query) => query.eq('accountId', target._id)).unique();
        if (credential && username !== target.username) await ctx.db.patch(credential._id, { username, updatedAt: now });
      } else {
        const isActive = action === 'account.activate';
        if (target.isActive === isActive) {
          return { kind: 'invalid' as const, reason: 'no_change' as const };
        }
        if (action === 'account.deactivate' && target.isActive) {
          const roles = await ctx.db.query('role_assignments').withIndex('by_organizationId_and_accountId_and_status', (query) => query.eq('organizationId', args.organizationId).eq('accountId', target._id).eq('status', 'active')).take(6);
          if (roles.some((role) => role.role === 'sysadmin') && await activeSysadminCount(ctx, args.organizationId) <= 1) {
            return { kind: 'denied' as const, reason: 'final_active_sysadmin' as const };
          }
        }
        await ctx.db.patch(target._id, { isActive, updatedAt: now });
        const credential = await ctx.db.query('auth_credentials').withIndex('by_accountId', (query) => query.eq('accountId', target._id)).unique();
        if (credential) await ctx.db.patch(credential._id, { isActive, updatedAt: now });
      }
      const updated = await ctx.db.get(target._id);
      after = updated ? sanitizeAuditSnapshot({ accountId: targetId, organizationId: String(updated.organizationId), username: updated.username, displayName: updated.displayName, isActive: updated.isActive }) : null;
    } else if (action === 'role.assign' || action === 'role.revoke') {
      if (!isRole(args.change.role)) return { kind: 'invalid' as const, reason: 'invalid_role' as const };
      const accountId = ctx.db.normalizeId('accounts', args.change.targetAccountId ?? args.change.accountId ?? '');
      const target = accountId ? await ctx.db.get(accountId) : null;
      if (!target || target.organizationId !== args.organizationId || !target.isActive) return { kind: 'invalid' as const, reason: 'target_not_found' as const };
      const existing = await ctx.db.query('role_assignments').withIndex('by_organizationId_and_accountId_and_role_and_status', (query) => query.eq('organizationId', args.organizationId).eq('accountId', target._id).eq('role', args.change.role as Role).eq('status', 'active')).unique();
      if (action === 'role.assign') {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const assignmentId = await ctx.db.insert('role_assignments', { organizationId: args.organizationId, accountId: target._id, role: args.change.role, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(assignmentId);
        after = sanitizeAuditSnapshot({ accountId: String(target._id), organizationId: String(args.organizationId), role: args.change.role, status: 'active' });
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        if (args.change.role === 'sysadmin' && await activeSysadminCount(ctx, args.organizationId) <= 1) return { kind: 'denied' as const, reason: 'final_active_sysadmin' as const };
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
        before = sanitizeAuditSnapshot({ accountId: String(target._id), organizationId: String(args.organizationId), role: args.change.role, status: 'active' });
        after = sanitizeAuditSnapshot({ accountId: String(target._id), organizationId: String(args.organizationId), role: args.change.role, status: 'revoked' });
      }
    } else if (action === 'department.create') {
      const key = args.change.key?.trim().toLowerCase();
      const name = args.change.name?.trim();
      if (!key || !name) return { kind: 'invalid' as const, reason: 'invalid_department' as const };
      const duplicate = await ctx.db.query('departments').withIndex('by_organizationId_and_key', (query) => query.eq('organizationId', args.organizationId).eq('key', key)).unique();
      if (duplicate) return { kind: 'denied' as const, reason: 'duplicate_department' as const };
      const departmentId = await ctx.db.insert('departments', { organizationId: args.organizationId, key, name, isActive: true, createdAt: now, updatedAt: now });
      targetId = String(departmentId);
      after = sanitizeAuditSnapshot({ departmentId: targetId, organizationId: String(args.organizationId), key, name, isActive: true });
    } else if (action.startsWith('department.')) {
      const departmentId = ctx.db.normalizeId('departments', args.change.departmentId ?? args.change.targetId ?? '');
      const department = departmentId ? await ctx.db.get(departmentId) : null;
      if (!department || department.organizationId !== args.organizationId) return { kind: 'invalid' as const, reason: 'target_not_found' as const };
      targetId = String(department._id);
      before = sanitizeAuditSnapshot({ departmentId: targetId, organizationId: String(department.organizationId), key: department.key, name: department.name, isActive: department.isActive });
      if (action === 'department.update') {
        const key = args.change.key?.trim().toLowerCase() || department.key;
        const name = args.change.name?.trim() || department.name;
        if (key === department.key && name === department.name) {
          return { kind: 'invalid' as const, reason: 'no_change' as const };
        }
        const duplicate = await ctx.db.query('departments').withIndex('by_organizationId_and_key', (query) => query.eq('organizationId', args.organizationId).eq('key', key)).unique();
        if (duplicate && duplicate._id !== department._id) return { kind: 'denied' as const, reason: 'duplicate_department' as const };
        await ctx.db.patch(department._id, { key, name, updatedAt: now });
      } else {
        const isActive = action === 'department.activate';
        if (department.isActive === isActive) {
          return { kind: 'invalid' as const, reason: 'no_change' as const };
        }
        await ctx.db.patch(department._id, { isActive, updatedAt: now });
      }
      const updated = await ctx.db.get(department._id);
      after = updated ? sanitizeAuditSnapshot({ departmentId: targetId, organizationId: String(updated.organizationId), key: updated.key, name: updated.name, isActive: updated.isActive }) : null;
    } else if (action === 'department_membership.assign' || action === 'department_membership.revoke') {
      const departmentId = ctx.db.normalizeId('departments', args.change.departmentId ?? args.change.targetId ?? '');
      const department = departmentId ? await ctx.db.get(departmentId) : null;
      const teacherAccountId = ctx.db.normalizeId('accounts', args.change.teacherAccountId ?? '');
      const profileId = ctx.db.normalizeId('teacher_profiles', args.change.teacherProfileId ?? '')
        ?? (teacherAccountId
          ? (await ctx.db.query('teacher_profiles').withIndex('by_accountId', (query) => query.eq('accountId', teacherAccountId)).unique())?._id ?? null
          : null);
      const profile = profileId ? await ctx.db.get(profileId) : null;
      if (!department || !profile || department.organizationId !== args.organizationId || profile.organizationId !== args.organizationId || !department.isActive || !profile.isActive) {
        return { kind: 'invalid' as const, reason: 'relation_not_found' as const };
      }
      const existing = await ctx.db.query('department_memberships').withIndex('by_org_dept_teacher_status', (query) => query.eq('organizationId', args.organizationId).eq('departmentId', department._id).eq('teacherProfileId', profile._id).eq('status', 'active')).unique();
      if (action.endsWith('.assign')) {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const membershipId = await ctx.db.insert('department_memberships', { organizationId: args.organizationId, departmentId: department._id, teacherProfileId: profile._id, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(membershipId);
        after = sanitizeAuditSnapshot({ departmentId: String(department._id), teacherProfileId: String(profile._id), organizationId: String(args.organizationId), status: 'active' });
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
        before = sanitizeAuditSnapshot({ departmentId: String(department._id), teacherProfileId: String(profile._id), organizationId: String(args.organizationId), status: 'active' });
        after = sanitizeAuditSnapshot({ departmentId: String(department._id), teacherProfileId: String(profile._id), organizationId: String(args.organizationId), status: 'revoked' });
      }
    } else if (action === 'hod_assignment.assign' || action === 'hod_assignment.revoke') {
      const departmentId = ctx.db.normalizeId('departments', args.change.departmentId ?? args.change.targetId ?? '');
      const accountId = ctx.db.normalizeId('accounts', args.change.accountId ?? args.change.targetAccountId ?? '');
      const department = departmentId ? await ctx.db.get(departmentId) : null;
      const target = accountId ? await ctx.db.get(accountId) : null;
      if (!department || !target || department.organizationId !== args.organizationId || target.organizationId !== args.organizationId || !department.isActive || !target.isActive) {
        return { kind: 'invalid' as const, reason: 'relation_not_found' as const };
      }
      const existing = await ctx.db.query('hod_assignments').withIndex('by_organizationId_and_accountId_and_departmentId_and_status', (query) => query.eq('organizationId', args.organizationId).eq('accountId', target._id).eq('departmentId', department._id).eq('status', 'active')).unique();
      if (action.endsWith('.assign')) {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const assignmentId = await ctx.db.insert('hod_assignments', { organizationId: args.organizationId, accountId: target._id, departmentId: department._id, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(assignmentId);
        after = sanitizeAuditSnapshot({ accountId: String(target._id), departmentId: String(department._id), organizationId: String(args.organizationId), status: 'active' });
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
        before = sanitizeAuditSnapshot({ accountId: String(target._id), departmentId: String(department._id), organizationId: String(args.organizationId), status: 'active' });
        after = sanitizeAuditSnapshot({ accountId: String(target._id), departmentId: String(department._id), organizationId: String(args.organizationId), status: 'revoked' });
      }
    } else if (action === 'coach_assignment.assign' || action === 'coach_assignment.revoke') {
      const accountId = ctx.db.normalizeId('accounts', args.change.accountId ?? args.change.targetAccountId ?? '');
      const teacherAccountId = ctx.db.normalizeId('accounts', args.change.teacherAccountId ?? '');
      const profileId = ctx.db.normalizeId('teacher_profiles', args.change.teacherProfileId ?? '')
        ?? (teacherAccountId
          ? (await ctx.db.query('teacher_profiles').withIndex('by_accountId', (query) => query.eq('accountId', teacherAccountId)).unique())?._id ?? null
          : null);
      const target = accountId ? await ctx.db.get(accountId) : null;
      const profile = profileId ? await ctx.db.get(profileId) : null;
      if (!target || !profile || target.organizationId !== args.organizationId || profile.organizationId !== args.organizationId || !target.isActive || !profile.isActive) {
        return { kind: 'invalid' as const, reason: 'relation_not_found' as const };
      }
      const existing = await ctx.db.query('coach_assignments').withIndex('by_organizationId_and_accountId_and_teacherProfileId_and_status', (query) => query.eq('organizationId', args.organizationId).eq('accountId', target._id).eq('teacherProfileId', profile._id).eq('status', 'active')).unique();
      if (action.endsWith('.assign')) {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const assignmentId = await ctx.db.insert('coach_assignments', { organizationId: args.organizationId, accountId: target._id, teacherProfileId: profile._id, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(assignmentId);
        after = sanitizeAuditSnapshot({ accountId: String(target._id), teacherProfileId: String(profile._id), organizationId: String(args.organizationId), status: 'active' });
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
        before = sanitizeAuditSnapshot({ accountId: String(target._id), teacherProfileId: String(profile._id), organizationId: String(args.organizationId), status: 'active' });
        after = sanitizeAuditSnapshot({ accountId: String(target._id), teacherProfileId: String(profile._id), organizationId: String(args.organizationId), status: 'revoked' });
      }
    } else {
      return { kind: 'invalid' as const, reason: 'unsupported_change' as const };
    }

    const auditEvent = await ctx.db.insert('access_audit_events', {
      organizationId: args.organizationId,
      requestId: args.requestId,
      actorAccountId: actor._id,
      action,
      targetType: targetTypeFor(action),
      targetId,
      occurredAt: now,
      before,
      after,
    });
    return { kind: 'applied' as const, auditEventId: auditEvent, targetId };
  },
});
