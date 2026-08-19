import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';

const roleValidator = v.union(
  v.literal('teacher'),
  v.literal('hod'),
  v.literal('coach'),
  v.literal('school_head'),
  v.literal('slt'),
  v.literal('sysadmin'),
);

const statusValidator = v.union(v.literal('active'), v.literal('revoked'));
const sharedSessionRoleValidator = v.union(v.literal('teacher'), v.literal('admin'));
const scalarValidator = v.union(v.string(), v.number(), v.boolean(), v.null());
const snapshotValidator = v.record(v.string(), scalarValidator);

export default defineSchema({
  organizations: defineTable({
    slug: v.string(),
    name: v.string(),
    isActive: v.boolean(),
    activeSysadminCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug'])
    .index('by_isActive', ['isActive']),

  accounts: defineTable({
    organizationId: v.id('organizations'),
    username: v.string(),
    displayName: v.string(),
    sharedSessionRole: sharedSessionRoleValidator,
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_username', ['username'])
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_and_isActive', ['organizationId', 'isActive']),

  auth_credentials: defineTable({
    accountId: v.id('accounts'),
    username: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
    isActive: v.boolean(),
    mustChangePassword: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_accountId', ['accountId'])
    .index('by_username', ['username']),

  teacher_profiles: defineTable({
    organizationId: v.id('organizations'),
    accountId: v.id('accounts'),
    position: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_accountId', ['accountId'])
    .index('by_organizationId_and_isActive', ['organizationId', 'isActive']),

  departments: defineTable({
    organizationId: v.id('organizations'),
    key: v.string(),
    name: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_and_key', ['organizationId', 'key'])
    .index('by_organizationId_and_isActive', ['organizationId', 'isActive']),

  department_memberships: defineTable({
    organizationId: v.id('organizations'),
    departmentId: v.id('departments'),
    teacherProfileId: v.id('teacher_profiles'),
    status: statusValidator,
    createdByAccountId: v.id('accounts'),
    createdAt: v.number(),
    revokedByAccountId: v.optional(v.id('accounts')),
    revokedAt: v.optional(v.number()),
  })
    .index('by_org_dept_teacher_status', ['organizationId', 'departmentId', 'teacherProfileId', 'status'])
    .index('by_organizationId_and_departmentId_and_status', ['organizationId', 'departmentId', 'status'])
    .index('by_organizationId_and_teacherProfileId_and_status', ['organizationId', 'teacherProfileId', 'status']),

  role_assignments: defineTable({
    organizationId: v.id('organizations'),
    accountId: v.id('accounts'),
    role: roleValidator,
    status: statusValidator,
    createdByAccountId: v.id('accounts'),
    createdAt: v.number(),
    revokedByAccountId: v.optional(v.id('accounts')),
    revokedAt: v.optional(v.number()),
  })
    .index('by_organizationId_and_accountId_and_role_and_status', ['organizationId', 'accountId', 'role', 'status'])
    .index('by_organizationId_and_accountId_and_status', ['organizationId', 'accountId', 'status'])
    .index('by_organizationId_and_role_and_status', ['organizationId', 'role', 'status']),

  hod_assignments: defineTable({
    organizationId: v.id('organizations'),
    accountId: v.id('accounts'),
    departmentId: v.id('departments'),
    status: statusValidator,
    createdByAccountId: v.id('accounts'),
    createdAt: v.number(),
    revokedByAccountId: v.optional(v.id('accounts')),
    revokedAt: v.optional(v.number()),
  })
    .index('by_organizationId_and_accountId_and_departmentId_and_status', ['organizationId', 'accountId', 'departmentId', 'status'])
    .index('by_organizationId_and_accountId_and_status', ['organizationId', 'accountId', 'status'])
    .index('by_organizationId_and_departmentId_and_status', ['organizationId', 'departmentId', 'status']),

  coach_assignments: defineTable({
    organizationId: v.id('organizations'),
    accountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    status: statusValidator,
    createdByAccountId: v.id('accounts'),
    createdAt: v.number(),
    revokedByAccountId: v.optional(v.id('accounts')),
    revokedAt: v.optional(v.number()),
  })
    .index('by_organizationId_and_accountId_and_teacherProfileId_and_status', ['organizationId', 'accountId', 'teacherProfileId', 'status'])
    .index('by_organizationId_and_accountId_and_status', ['organizationId', 'accountId', 'status'])
    .index('by_organizationId_and_teacherProfileId_and_status', ['organizationId', 'teacherProfileId', 'status']),

  login_rate_limits: defineTable({
    key: v.string(),
    windowStartedAt: v.number(),
    failureCount: v.number(),
    blockedUntil: v.optional(v.number()),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

  access_audit_events: defineTable({
    organizationId: v.id('organizations'),
    requestId: v.string(),
    actorAccountId: v.id('accounts'),
    action: v.union(
      v.literal('account.create'),
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
    ),
    targetType: v.union(
      v.literal('account'),
      v.literal('role_assignment'),
      v.literal('department'),
      v.literal('department_membership'),
      v.literal('hod_assignment'),
      v.literal('coach_assignment'),
    ),
    targetId: v.string(),
    occurredAt: v.number(),
    before: v.union(snapshotValidator, v.null()),
    after: v.union(snapshotValidator, v.null()),
  })
    .index('by_organizationId_and_requestId', ['organizationId', 'requestId'])
    .index('by_organizationId_and_occurredAt', ['organizationId', 'occurredAt'])
    .index('by_organizationId_and_actorAccountId_and_occurredAt', ['organizationId', 'actorAccountId', 'occurredAt'])
    .index('by_organizationId_and_targetType_and_targetId_and_occurredAt', ['organizationId', 'targetType', 'targetId', 'occurredAt']),
});
