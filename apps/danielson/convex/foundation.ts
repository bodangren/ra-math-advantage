import { paginationOptsValidator } from 'convex/server';
import { internalMutation, internalQuery, type QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { v } from 'convex/values';

const MAX_ACTIVE_DEPARTMENT_MEMBERSHIPS = 100;

const roleValidator = v.union(
  v.literal('teacher'),
  v.literal('hod'),
  v.literal('coach'),
  v.literal('school_head'),
  v.literal('slt'),
  v.literal('sysadmin'),
);
const actionValidator = v.union(
  v.literal('account.create'),
  v.literal('account.reset_password'),
  v.literal('account.update'),
  v.literal('account.activate'),
  v.literal('account.deactivate'),
  v.literal('role.assign'),
  v.literal('role.revoke'),
  v.literal('department.create'),
  v.literal('department.update'),
  v.literal('department.activate'),
  v.literal('department.deactivate'),
  v.literal('department_membership.assign'),
  v.literal('department_membership.revoke'),
  v.literal('hod_assignment.assign'),
  v.literal('hod_assignment.revoke'),
  v.literal('coach_assignment.assign'),
  v.literal('coach_assignment.revoke'),
);
const accessContextValidator = v.object({
  actor: v.union(v.null(), v.object({ accountId: v.string(), organizationId: v.string(), isActive: v.boolean(), organizationIsActive: v.boolean() })),
  subject: v.union(v.null(), v.object({ accountId: v.string(), organizationId: v.string(), departmentIds: v.array(v.string()), isActive: v.boolean() })),
  roleAssignments: v.array(v.object({ accountId: v.string(), organizationId: v.string(), role: roleValidator, status: v.union(v.literal('active'), v.literal('revoked')) })),
  hodDepartmentAssignments: v.array(v.object({ accountId: v.string(), organizationId: v.string(), departmentId: v.string(), status: v.union(v.literal('active'), v.literal('revoked')) })),
  coachTeacherAssignments: v.array(v.object({ accountId: v.string(), organizationId: v.string(), teacherAccountId: v.string(), status: v.union(v.literal('active'), v.literal('revoked')) })),
});

const changeValidator = v.object({
  kind: actionValidator,
  targetAccountId: v.optional(v.string()),
  accountId: v.optional(v.string()),
  teacherAccountId: v.optional(v.string()),
  teacherProfileId: v.optional(v.string()),
  departmentId: v.optional(v.string()),
  targetId: v.optional(v.string()),
  role: v.optional(roleValidator),
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
  | 'account.reset_password'
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
  return value === 'account.reset_password'
    || value === 'account.create'
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

/** Resolve fresh Danielson roles and subject scope from current database rows. */
export async function resolveAccessContextForDb(
  ctx: Pick<QueryCtx, 'db'>,
  args: {
    actorAccountId: Id<'accounts'>;
    subjectAccountId?: Id<'accounts'>;
  },
) {
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
        if (subjectAccount.organizationId !== actor.organizationId) {
          subject = {
            accountId: String(subjectAccount._id),
            organizationId: String(subjectAccount.organizationId),
            departmentIds: [],
            isActive: subjectAccount.isActive,
          };
        } else {
          const teacherProfile = await ctx.db
            .query('teacher_profiles')
            .withIndex('by_accountId', (query) => query.eq('accountId', subjectAccount._id))
            .unique();
          const departmentIds: string[] = [];
          if (teacherProfile?.isActive) {
            const memberships = await ctx.db
              .query('department_memberships')
              .withIndex('by_organizationId_and_teacherProfileId_and_status', (query) =>
                query.eq('organizationId', subjectAccount.organizationId)
                  .eq('teacherProfileId', teacherProfile._id)
                  .eq('status', 'active'),
              )
              .take(MAX_ACTIVE_DEPARTMENT_MEMBERSHIPS);
            const departments = await Promise.all(
              memberships.map((membership) => ctx.db.get(membership.departmentId)),
            );
            const activeDepartments = departments.filter(
              (department): department is Doc<'departments'> => Boolean(department?.isActive),
            );
            departmentIds.push(...activeDepartments.map((department) => String(department._id)));
            const hodAssignments = await Promise.all(activeDepartments.map((department) => ctx.db
              .query('hod_assignments')
              .withIndex('by_organizationId_and_accountId_and_departmentId_and_status', (query) =>
                query.eq('organizationId', actor.organizationId)
                  .eq('accountId', actor._id)
                  .eq('departmentId', department._id)
                  .eq('status', 'active'),
              )
              .unique()));
            hodDepartmentAssignments.push(...hodAssignments.filter(
              (assignment): assignment is Doc<'hod_assignments'> => Boolean(assignment),
            ));

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
}

export const resolveAccessContext = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    subjectAccountId: v.optional(v.id('accounts')),
  },
  returns: accessContextValidator,
  handler: resolveAccessContextForDb,
});

async function resolveSysadminActor(ctx: QueryCtx, actorAccountId: Id<'accounts'>) {
  const actor = await ctx.db.get(actorAccountId);
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
  return { kind: 'allowed' as const, actor };
}

async function hasOtherActiveSysadmin(
  ctx: Pick<QueryCtx, 'db'>,
  organizationId: Id<'organizations'>,
  excludedAccountId: Id<'accounts'>,
) {
  const assignments = await ctx.db.query('role_assignments')
    .withIndex('by_organizationId_and_role_and_status', (query) => query
      .eq('organizationId', organizationId)
      .eq('role', 'sysadmin')
      .eq('status', 'active'))
    .take(100);
  const accounts = await Promise.all(assignments
    .filter((assignment) => assignment.accountId !== excludedAccountId)
    .map((assignment) => ctx.db.get(assignment.accountId)));
  return accounts.some((account) => account?.isActive === true);
}

/** Create the first organization and administrator on an empty deployment. */
export const bootstrapFirstSysadmin = internalMutation({
  args: {
    organizationSlug: v.string(),
    organizationName: v.string(),
    username: v.string(),
    displayName: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
  },
  returns: v.union(
    v.object({ kind: v.literal('invalid_input') }),
    v.object({ kind: v.literal('already_bootstrapped') }),
    v.object({
      kind: v.literal('created'),
      organizationId: v.id('organizations'),
      accountId: v.id('accounts'),
    }),
  ),
  handler: async (ctx, args) => {
    const organizationSlug = args.organizationSlug.trim().toLowerCase();
    const organizationName = args.organizationName.trim();
    const username = args.username.trim().toLowerCase();
    const displayName = args.displayName.trim();
    if (
      !organizationSlug
      || !organizationName
      || !username
      || !displayName
      || !args.passwordHash
      || !args.passwordSalt
      || !Number.isInteger(args.passwordHashIterations)
      || args.passwordHashIterations < 1
    ) return { kind: 'invalid_input' as const };

    const [organization, account] = await Promise.all([
      ctx.db.query('organizations')
        .withIndex('by_slug', (query) => query.eq('slug', organizationSlug))
        .unique(),
      ctx.db.query('accounts')
        .withIndex('by_username', (query) => query.eq('username', username))
        .unique(),
    ]);
    if (organization || account) return { kind: 'already_bootstrapped' as const };
    if ((await ctx.db.query('organizations').take(1)).length > 0) {
      return { kind: 'already_bootstrapped' as const };
    }

    const now = Date.now();
    const organizationId = await ctx.db.insert('organizations', {
      slug: organizationSlug,
      name: organizationName,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    const accountId = await ctx.db.insert('accounts', {
      organizationId,
      username,
      displayName,
      sharedSessionRole: 'admin',
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert('auth_credentials', {
      accountId,
      username,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      passwordHashIterations: args.passwordHashIterations,
      isActive: true,
      mustChangePassword: true,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert('role_assignments', {
      organizationId,
      accountId,
      role: 'sysadmin',
      status: 'active',
      createdByAccountId: accountId,
      createdAt: now,
    });
    return { kind: 'created' as const, organizationId, accountId };
  },
});

export const listAdministrationAccounts = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.union(
    v.object({ kind: v.literal('denied'), reason: v.string() }),
    v.object({
      kind: v.literal('allowed'),
      accountPage: v.object({
        items: v.array(v.object({
          accountId: v.id('accounts'),
          username: v.string(),
          displayName: v.string(),
          isActive: v.boolean(),
          isTeacher: v.boolean(),
          roles: v.array(roleValidator),
        })),
        nextCursor: v.union(v.string(), v.null()),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const access = await resolveSysadminActor(ctx, args.actorAccountId);
    if (access.kind === 'denied') return access;
    const { actor } = access;
    const accountResult = await ctx.db
      .query('accounts')
      .withIndex('by_organizationId', (query) => query.eq('organizationId', actor.organizationId))
      .paginate({
        cursor: args.paginationOpts.cursor,
        numItems: Math.min(args.paginationOpts.numItems, 100),
      });
    const accounts = await Promise.all(accountResult.page.map(async (account) => {
      const [profile, roles] = await Promise.all([
        ctx.db.query('teacher_profiles')
          .withIndex('by_accountId', (query) => query.eq('accountId', account._id))
          .unique(),
        ctx.db.query('role_assignments')
          .withIndex('by_organizationId_and_accountId_and_status', (query) =>
            query.eq('organizationId', actor.organizationId)
              .eq('accountId', account._id)
              .eq('status', 'active'),
          )
          .take(6),
      ]);
      return {
        accountId: account._id,
        username: account.username,
        displayName: account.displayName,
        isActive: account.isActive,
        isTeacher: profile?.isActive ?? false,
        roles: roles.map((assignment) => assignment.role),
      };
    }));

    return {
      kind: 'allowed' as const,
      accountPage: {
        items: accounts,
        nextCursor: accountResult.isDone ? null : accountResult.continueCursor,
      },
    };
  },
});

export const listAdministrationDepartments = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.union(
    v.object({ kind: v.literal('denied'), reason: v.string() }),
    v.object({
      kind: v.literal('allowed'),
      departmentPage: v.object({
        items: v.array(v.object({
          departmentId: v.id('departments'),
          key: v.string(),
          name: v.string(),
          isActive: v.boolean(),
        })),
        nextCursor: v.union(v.string(), v.null()),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const access = await resolveSysadminActor(ctx, args.actorAccountId);
    if (access.kind === 'denied') return access;
    const departmentResult = await ctx.db
      .query('departments')
      .withIndex('by_organizationId', (query) =>
        query.eq('organizationId', access.actor.organizationId),
      )
      .paginate({
        cursor: args.paginationOpts.cursor,
        numItems: Math.min(args.paginationOpts.numItems, 100),
      });
    return {
      kind: 'allowed' as const,
      departmentPage: {
        items: departmentResult.page.map((department) => ({
          departmentId: department._id,
          key: department.key,
          name: department.name,
          isActive: department.isActive,
        })),
        nextCursor: departmentResult.isDone ? null : departmentResult.continueCursor,
      },
    };
  },
});

export const applyAdministrationChange = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    organizationId: v.id('organizations'),
    change: changeValidator,
  },
  returns: v.object({
    kind: v.string(),
    reason: v.optional(v.string()),
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

    if (!isAction(args.change.kind)) return { kind: 'invalid' as const, reason: 'invalid_action' as const };
    const action = args.change.kind;

    const now = Date.now();
    let targetId = '';

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
          currentGbfAssignmentId: null,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
      targetId = String(accountId);
    } else if (action.startsWith('account.')) {
      const accountId = ctx.db.normalizeId('accounts', args.change.targetAccountId ?? args.change.accountId ?? '');
      const target = accountId ? await ctx.db.get(accountId) : null;
      if (!target || target.organizationId !== args.organizationId) return { kind: 'invalid' as const, reason: 'target_not_found' as const };
      targetId = String(target._id);
      if (action === 'account.reset_password') {
        if (!target.isActive || target._id === actor._id) {
          return { kind: 'invalid' as const, reason: 'invalid_account' as const };
        }
        const credential = await ctx.db.query('auth_credentials')
          .withIndex('by_accountId', (query) => query.eq('accountId', target._id)).unique();
        if (!credential?.isActive || !args.change.passwordHash || !args.change.passwordSalt
          || !Number.isInteger(args.change.passwordHashIterations) || Number(args.change.passwordHashIterations) < 1) {
          return { kind: 'invalid' as const, reason: 'invalid_account' as const };
        }
        await ctx.db.patch(credential._id, {
          passwordHash: args.change.passwordHash, passwordSalt: args.change.passwordSalt,
          passwordHashIterations: Number(args.change.passwordHashIterations), mustChangePassword: true,
          updatedAt: Math.max(now, credential.updatedAt + 1),
        });
      } else if (action === 'account.update') {
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
        if (credential && username !== target.username) await ctx.db.patch(credential._id, { username, updatedAt: Math.max(now, credential.updatedAt + 1) });
      } else {
        const isActive = action === 'account.activate';
        if (target.isActive === isActive) {
          return { kind: 'invalid' as const, reason: 'no_change' as const };
        }
        const roles = await ctx.db.query('role_assignments')
          .withIndex('by_organizationId_and_accountId_and_status', (query) =>
            query.eq('organizationId', args.organizationId)
              .eq('accountId', target._id)
              .eq('status', 'active'),
          )
          .take(6);
        const hasSysadminRole = roles.some((role) => role.role === 'sysadmin');
        if (action === 'account.deactivate'
          && hasSysadminRole
          && !await hasOtherActiveSysadmin(ctx, args.organizationId, target._id)) {
          return { kind: 'denied' as const, reason: 'final_active_sysadmin' as const };
        }
        await ctx.db.patch(target._id, { isActive, updatedAt: now });
        const credential = await ctx.db.query('auth_credentials').withIndex('by_accountId', (query) => query.eq('accountId', target._id)).unique();
        if (credential) await ctx.db.patch(credential._id, { isActive, updatedAt: Math.max(now, credential.updatedAt + 1) });
      }
    } else if (action === 'role.assign' || action === 'role.revoke') {
      if (!isRole(args.change.role)) return { kind: 'invalid' as const, reason: 'invalid_role' as const };
      const accountId = ctx.db.normalizeId('accounts', args.change.targetAccountId ?? args.change.accountId ?? '');
      const target = accountId ? await ctx.db.get(accountId) : null;
      if (!target || target.organizationId !== args.organizationId || (action === 'role.assign' && !target.isActive)) {
        return { kind: 'invalid' as const, reason: 'target_not_found' as const };
      }
      const existing = await ctx.db.query('role_assignments').withIndex('by_organizationId_and_accountId_and_role_and_status', (query) => query.eq('organizationId', args.organizationId).eq('accountId', target._id).eq('role', args.change.role as Role).eq('status', 'active')).unique();
      if (action === 'role.assign') {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const assignmentId = await ctx.db.insert('role_assignments', { organizationId: args.organizationId, accountId: target._id, role: args.change.role, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(assignmentId);
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        const removesActiveSysadmin = args.change.role === 'sysadmin' && target.isActive;
        if (removesActiveSysadmin
          && !await hasOtherActiveSysadmin(ctx, args.organizationId, target._id)) {
          return { kind: 'denied' as const, reason: 'final_active_sysadmin' as const };
        }
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
      }
    } else if (action === 'department.create') {
      const key = args.change.key?.trim().toLowerCase();
      const name = args.change.name?.trim();
      if (!key || !name) return { kind: 'invalid' as const, reason: 'invalid_department' as const };
      const duplicate = await ctx.db.query('departments').withIndex('by_organizationId_and_key', (query) => query.eq('organizationId', args.organizationId).eq('key', key)).unique();
      if (duplicate) return { kind: 'denied' as const, reason: 'duplicate_department' as const };
      const departmentId = await ctx.db.insert('departments', { organizationId: args.organizationId, key, name, isActive: true, createdAt: now, updatedAt: now });
      targetId = String(departmentId);
    } else if (action.startsWith('department.')) {
      const departmentId = ctx.db.normalizeId('departments', args.change.departmentId ?? args.change.targetId ?? '');
      const department = departmentId ? await ctx.db.get(departmentId) : null;
      if (!department || department.organizationId !== args.organizationId) return { kind: 'invalid' as const, reason: 'target_not_found' as const };
      targetId = String(department._id);
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
    } else if (action === 'department_membership.assign' || action === 'department_membership.revoke') {
      const departmentId = ctx.db.normalizeId('departments', args.change.departmentId ?? args.change.targetId ?? '');
      const department = departmentId ? await ctx.db.get(departmentId) : null;
      const teacherAccountId = ctx.db.normalizeId('accounts', args.change.teacherAccountId ?? '');
      const profileId = ctx.db.normalizeId('teacher_profiles', args.change.teacherProfileId ?? '')
        ?? (teacherAccountId
          ? (await ctx.db.query('teacher_profiles').withIndex('by_accountId', (query) => query.eq('accountId', teacherAccountId)).unique())?._id ?? null
          : null);
      const profile = profileId ? await ctx.db.get(profileId) : null;
      const teacherAccount = profile ? await ctx.db.get(profile.accountId) : null;
      const isAssign = action === 'department_membership.assign';
      if (!department || !profile || !teacherAccount
        || department.organizationId !== args.organizationId
        || profile.organizationId !== args.organizationId
        || teacherAccount.organizationId !== args.organizationId
        || (teacherAccountId !== null && teacherAccount._id !== teacherAccountId)
        || (isAssign && (!department.isActive || !profile.isActive || !teacherAccount.isActive))) {
        return { kind: 'invalid' as const, reason: 'relation_not_found' as const };
      }
      const existing = await ctx.db.query('department_memberships').withIndex('by_org_dept_teacher_status', (query) => query.eq('organizationId', args.organizationId).eq('departmentId', department._id).eq('teacherProfileId', profile._id).eq('status', 'active')).unique();
      if (isAssign) {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const activeMemberships = await ctx.db.query('department_memberships')
          .withIndex('by_organizationId_and_teacherProfileId_and_status', (query) =>
            query.eq('organizationId', args.organizationId)
              .eq('teacherProfileId', profile._id)
              .eq('status', 'active'),
          )
          .take(MAX_ACTIVE_DEPARTMENT_MEMBERSHIPS);
        if (activeMemberships.length >= MAX_ACTIVE_DEPARTMENT_MEMBERSHIPS) {
          return { kind: 'denied' as const, reason: 'assignment_limit_reached' as const };
        }
        const membershipId = await ctx.db.insert('department_memberships', { organizationId: args.organizationId, departmentId: department._id, teacherProfileId: profile._id, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(membershipId);
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
      }
    } else if (action === 'hod_assignment.assign' || action === 'hod_assignment.revoke') {
      const departmentId = ctx.db.normalizeId('departments', args.change.departmentId ?? args.change.targetId ?? '');
      const accountId = ctx.db.normalizeId('accounts', args.change.accountId ?? args.change.targetAccountId ?? '');
      const department = departmentId ? await ctx.db.get(departmentId) : null;
      const target = accountId ? await ctx.db.get(accountId) : null;
      const isAssign = action === 'hod_assignment.assign';
      if (!department || !target
        || department.organizationId !== args.organizationId
        || target.organizationId !== args.organizationId
        || (isAssign && (!department.isActive || !target.isActive))) {
        return { kind: 'invalid' as const, reason: 'relation_not_found' as const };
      }
      const existing = await ctx.db.query('hod_assignments').withIndex('by_organizationId_and_accountId_and_departmentId_and_status', (query) => query.eq('organizationId', args.organizationId).eq('accountId', target._id).eq('departmentId', department._id).eq('status', 'active')).unique();
      if (isAssign) {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const assignmentId = await ctx.db.insert('hod_assignments', { organizationId: args.organizationId, accountId: target._id, departmentId: department._id, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(assignmentId);
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
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
      const teacherAccount = profile ? await ctx.db.get(profile.accountId) : null;
      const isAssign = action === 'coach_assignment.assign';
      if (!target || !profile || !teacherAccount
        || target.organizationId !== args.organizationId
        || profile.organizationId !== args.organizationId
        || teacherAccount.organizationId !== args.organizationId
        || (teacherAccountId !== null && teacherAccount._id !== teacherAccountId)
        || (isAssign && (!target.isActive || !profile.isActive || !teacherAccount.isActive))) {
        return { kind: 'invalid' as const, reason: 'relation_not_found' as const };
      }
      const existing = await ctx.db.query('coach_assignments').withIndex('by_organizationId_and_accountId_and_teacherProfileId_and_status', (query) => query.eq('organizationId', args.organizationId).eq('accountId', target._id).eq('teacherProfileId', profile._id).eq('status', 'active')).unique();
      if (isAssign) {
        if (existing) return { kind: 'denied' as const, reason: 'duplicate_assignment' as const };
        const assignmentId = await ctx.db.insert('coach_assignments', { organizationId: args.organizationId, accountId: target._id, teacherProfileId: profile._id, status: 'active', createdByAccountId: actor._id, createdAt: now });
        targetId = String(assignmentId);
      } else {
        if (!existing) return { kind: 'invalid' as const, reason: 'assignment_not_found' as const };
        await ctx.db.patch(existing._id, { status: 'revoked', revokedByAccountId: actor._id, revokedAt: now });
        targetId = String(existing._id);
      }
    } else {
      return { kind: 'invalid' as const, reason: 'unsupported_change' as const };
    }

    return { kind: 'applied' as const, targetId };
  },
});

/** List existing relationships so administrators can inspect and revoke them. */
export const listAdministrationAssignments = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    kind: v.union(v.literal('department_memberships'), v.literal('hod_assignments'), v.literal('coach_assignments')),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.union(
    v.object({ kind: v.literal('denied'), reason: v.string() }),
    v.object({ kind: v.literal('allowed'), items: v.array(v.object({
      assignmentId: v.string(), person: v.string(), assignment: v.string(),
    })), nextCursor: v.union(v.string(), v.null()) }),
  ),
  handler: async (ctx, args) => {
    const access = await resolveSysadminActor(ctx, args.actorAccountId);
    if (access.kind === 'denied') return access;
    const organizationId = access.actor.organizationId;
    const pagination = { ...args.paginationOpts, numItems: Math.max(1, Math.min(50, args.paginationOpts.numItems)) };
    const result = args.kind === 'department_memberships'
      ? await ctx.db.query('department_memberships').withIndex('by_organizationId_and_status', (q) => q.eq('organizationId', organizationId).eq('status', 'active')).paginate(pagination)
      : args.kind === 'hod_assignments'
        ? await ctx.db.query('hod_assignments').withIndex('by_organizationId_and_accountId_and_status', (q) => q.eq('organizationId', organizationId)).paginate(pagination)
        : await ctx.db.query('coach_assignments').withIndex('by_organizationId_and_accountId_and_status', (q) => q.eq('organizationId', organizationId)).paginate(pagination);
    const items = await Promise.all(result.page.filter((row) => row.status === 'active').map(async (row) => {
      const profile = 'teacherProfileId' in row ? await ctx.db.get(row.teacherProfileId) : null;
      if (profile && profile.organizationId !== organizationId) return null;
      const [person, department, teacher] = await Promise.all([
        'accountId' in row ? ctx.db.get(row.accountId) : profile ? ctx.db.get(profile.accountId) : null,
        'departmentId' in row ? ctx.db.get(row.departmentId) : null,
        profile ? ctx.db.get(profile.accountId) : null,
      ]);
      if (!person || person.organizationId !== organizationId
        || (department && department.organizationId !== organizationId)
        || (teacher && teacher.organizationId !== organizationId)) return null;
      return {
        assignmentId: String(row._id), person: `${person.displayName}${person.isActive ? '' : ' (inactive)'}`,
        assignment: department?.name ?? teacher?.displayName ?? 'Unavailable subject',
      };
    }));
    return { kind: 'allowed' as const, items: items.filter((item) => item !== null), nextCursor: result.isDone ? null : result.continueCursor };
  },
});
