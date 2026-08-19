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

const observationSourceTypeValidator = v.union(
  v.literal('walkthrough'),
  v.literal('formal_q1'),
  v.literal('formal_q4'),
);
const observationBaseValidator = {
  organizationId: v.id('organizations'),
  teacherId: v.string(),
  teacherProfileId: v.optional(v.string()),
  sourceRecordId: v.string(),
  formalObservationId: v.optional(v.string()),
  sourceType: observationSourceTypeValidator,
  componentId: v.string(),
  targetSkillIds: v.array(v.string()),
  observerId: v.string(),
  observerAccountId: v.optional(v.string()),
  occurredAt: v.string(),
  eventTime: v.optional(v.string()),
  sourceVersion: v.string(),
  provenanceGroupId: v.string(),
  idempotencyKey: v.string(),
};
const targetEvidenceValidator = v.object({
  skillId: v.string(),
  componentId: v.string(),
  rawRating: v.number(),
  points: v.number(),
  passes: v.boolean(),
  srsRating: v.union(v.literal('Again'), v.literal('Hard'), v.literal('Good'), v.literal('Easy')),
  idempotencyKey: v.string(),
  sourceRecordId: v.string(),
  formalObservationId: v.optional(v.string()),
  provenanceGroupId: v.string(),
  sourceType: observationSourceTypeValidator,
  occurredAt: v.string(),
});
const observationOutcomeValidator = v.union(
  v.object({
    kind: v.literal('rated'),
    ...observationBaseValidator,
    rating: v.number(),
    targetEvidence: v.array(targetEvidenceValidator),
  }),
  v.object({
    kind: v.literal('not_enough_evidence'),
    ...observationBaseValidator,
  }),
);
const canonicalCardValidator = v.object({
  cardId: v.string(),
  studentId: v.string(),
  objectiveId: v.string(),
  variantKey: v.string(),
  stability: v.number(),
  difficulty: v.number(),
  state: v.union(v.literal('new'), v.literal('learning'), v.literal('review'), v.literal('relearning')),
  dueDate: v.string(),
  elapsedDays: v.number(),
  scheduledDays: v.number(),
  reps: v.number(),
  lapses: v.number(),
  lastReview: v.union(v.string(), v.null()),
  createdAt: v.string(),
  updatedAt: v.string(),
});
const proficiencyProjectionValidator = v.object({
  skillId: v.string(),
  componentId: v.string(),
  rawRating: v.number(),
  points: v.number(),
  passes: v.boolean(),
  srsRating: v.union(v.literal('Again'), v.literal('Hard'), v.literal('Good'), v.literal('Easy')),
  idempotencyKey: v.string(),
  sourceRecordId: v.string(),
  formalObservationId: v.optional(v.string()),
  provenanceGroupId: v.string(),
  sourceType: observationSourceTypeValidator,
  occurredAt: v.string(),
});
const knowledgeStateValidator = v.object({
  nodeId: v.string(),
  mastery: v.number(),
  retention: v.number(),
  isProficient: v.boolean(),
  state: v.union(v.literal('mastered'), v.literal('decaying'), v.literal('inProgress'), v.literal('untouched')),
  lastUpdated: v.optional(v.number()),
});
const currentProficiencyValidator = v.object({
  rawRating: v.union(v.number(), v.null()),
  points: v.union(v.number(), v.null()),
  passes: v.boolean(),
});
const priorityValidator = v.object({
  teacherId: v.string(),
  skillId: v.string(),
  componentId: v.optional(v.string()),
  due: v.boolean(),
  overdueDays: v.number(),
  currentProficiency: currentProficiencyValidator,
  evidenceGaps: v.array(v.string()),
  approvedPriorityInputs: v.array(v.string()),
});
const teacherEvidenceResultValidator = v.object({
  targetEvidence: v.array(targetEvidenceValidator),
  knowledgeState: v.array(knowledgeStateValidator),
  priority: v.array(priorityValidator),
});

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

  teacher_proficiency_idempotency: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    idempotencyKey: v.string(),
    fingerprint: v.string(),
    result: teacherEvidenceResultValidator,
    outcomeId: v.string(),
    createdAt: v.number(),
  })
    .index('by_organizationId_and_idempotencyKey', ['organizationId', 'idempotencyKey'])
    .index('by_organizationId_and_teacherId', ['organizationId', 'teacherId']),

  teacher_observation_outcomes: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    idempotencyKey: v.string(),
    outcome: observationOutcomeValidator,
    occurredAt: v.number(),
    createdAt: v.number(),
  })
    .index('by_organizationId_and_teacherId_and_occurredAt', ['organizationId', 'teacherId', 'occurredAt'])
    .index('by_organizationId_and_idempotencyKey', ['organizationId', 'idempotencyKey']),

  teacher_proficiency: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    skillId: v.string(),
    projection: proficiencyProjectionValidator,
    updatedAt: v.number(),
  })
    .index('by_organizationId_and_teacherId', ['organizationId', 'teacherId'])
    .index('by_organizationId_and_teacherId_and_skillId', ['organizationId', 'teacherId', 'skillId']),

  teacher_srs_cards: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    skillId: v.string(),
    variantKey: v.string(),
    card: canonicalCardValidator,
    updatedAt: v.number(),
  })
    .index('by_organizationId_and_teacherId', ['organizationId', 'teacherId'])
    .index('by_organizationId_and_teacherId_and_skillId', ['organizationId', 'teacherId', 'skillId'])
    .index('by_organizationId_and_teacherId_and_variantKey', ['organizationId', 'teacherId', 'variantKey']),

  teacher_srs_reviews: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    cardId: v.string(),
    reviewId: v.string(),
    logicalReviewId: v.string(),
    isCorrection: v.boolean(),
    correctionIdempotencyKey: v.optional(v.string()),
    correctionSourceRecordId: v.optional(v.string()),
    sourceRecordId: v.string(),
    reviewedAt: v.string(),
    review: v.object({
      reviewId: v.string(),
      cardId: v.string(),
      studentId: v.string(),
      rating: v.union(v.literal('Again'), v.literal('Hard'), v.literal('Good'), v.literal('Easy')),
      submissionId: v.string(),
      paramsVersion: v.string(),
      reviewedAt: v.string(),
      evidence: v.union(
        v.object({ action: v.literal('teacher_reset'), objectiveId: v.string() }),
        v.object({
          baseRating: v.union(v.literal('Again'), v.literal('Hard'), v.literal('Good'), v.literal('Easy')),
          timingAdjusted: v.boolean(),
          reasons: v.array(v.string()),
          misconceptionTags: v.optional(v.array(v.string())),
        }),
      ),
      stateBefore: v.object({
        stability: v.number(), difficulty: v.number(),
        state: v.union(v.literal('new'), v.literal('learning'), v.literal('review'), v.literal('relearning')),
        reps: v.number(), lapses: v.number(),
      }),
      stateAfter: v.object({
        stability: v.number(), difficulty: v.number(),
        state: v.union(v.literal('new'), v.literal('learning'), v.literal('review'), v.literal('relearning')),
        reps: v.number(), lapses: v.number(),
      }),
    }),
    createdAt: v.number(),
  })
    .index('by_organizationId_and_teacherId_and_reviewedAt', ['organizationId', 'teacherId', 'reviewedAt'])
    .index('by_organizationId_and_teacherId_and_cardId', ['organizationId', 'teacherId', 'cardId'])
    .index('by_organizationId_and_teacherId_and_logicalReviewId', ['organizationId', 'teacherId', 'logicalReviewId']),

  teacher_knowledge_state: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    nodeId: v.string(),
    state: knowledgeStateValidator,
    updatedAt: v.number(),
  })
    .index('by_organizationId_and_teacherId', ['organizationId', 'teacherId'])
    .index('by_organizationId_and_teacherId_and_nodeId', ['organizationId', 'teacherId', 'nodeId']),

  teacher_priority: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    skillId: v.string(),
    projection: priorityValidator,
    updatedAt: v.number(),
  })
    .index('by_organizationId_and_teacherId', ['organizationId', 'teacherId'])
    .index('by_organizationId_and_teacherId_and_skillId', ['organizationId', 'teacherId', 'skillId']),

});
