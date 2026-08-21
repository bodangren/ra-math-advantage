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
const improvementPlanSourceRefValidator = v.object({
  source: v.string(),
  location: v.optional(v.string()),
});
const priorityValidator = v.object({
  teacherId: v.string(),
  skillId: v.string(),
  componentId: v.optional(v.string()),
  due: v.boolean(),
  dueAt: v.optional(v.union(v.string(), v.null())),
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
const observationTypeValidator = v.union(
  v.literal('walkthrough'),
  v.literal('formal_q1'),
  v.literal('formal_q4'),
);
const observationPriorityReasonValidator = v.union(
  v.literal('below_proficient'),
  v.literal('approved_plan_priority'),
  v.literal('gbf_phase_priority'),
  v.literal('overdue'),
  v.literal('evidence_gap'),
  v.literal('due'),
);
const observationItemOutcomeValidator = v.union(
  v.object({ kind: v.literal('rated'), rating: v.number() }),
  v.object({ kind: v.literal('not_enough_evidence') }),
);
const observationItemValidator = v.object({
  itemId: v.string(),
  componentId: v.string(),
  skillId: v.optional(v.string()),
  priorityReason: v.optional(observationPriorityReasonValidator),
  outcome: v.union(v.null(), observationItemOutcomeValidator),
  evidenceNote: v.union(v.null(), v.string()),
});
const observationItemChangeValidator = v.object({
  itemId: v.string(),
  outcome: v.optional(observationItemOutcomeValidator),
  evidenceNote: v.optional(v.union(v.null(), v.string())),
});
const improvementPlanStateValidator = v.union(
  v.literal('proposed'),
  v.literal('active'),
  v.literal('closed'),
);
const improvementPlanOutcomeValidator = v.union(
  v.literal('successful'),
  v.literal('insufficient_improvement'),
);
const improvementPlanEventKindValidator = v.union(
  v.literal('proposed'),
  v.literal('approved'),
  v.literal('teacher_acknowledged'),
  v.literal('supervisor_acknowledged'),
  v.literal('closed'),
);
const improvementPlanTargetResultValidator = v.object({
  componentId: v.string(),
  skillId: v.string(),
  expectedRating: v.number(),
  currentRating: v.union(v.number(), v.null()),
  state: v.union(
    v.literal('no_plan_evidence'),
    v.literal('below_expected'),
    v.literal('meets_expected'),
  ),
  evidenceDueAt: v.number(),
  evidenceDue: v.boolean(),
  evidenceOverdue: v.boolean(),
  sourceRecordId: v.union(v.string(), v.null()),
  evidenceIdempotencyKey: v.union(v.string(), v.null()),
});

export default defineSchema({
  organizations: defineTable({
    slug: v.string(),
    name: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_slug', ['slug']),

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
    currentGbfAssignmentId: v.optional(v.union(v.id('teacher_gbf_assignments'), v.null())),
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
    .index('by_organizationId_and_status', ['organizationId', 'status'])
    .index('by_org_dept_teacher_status', ['organizationId', 'departmentId', 'teacherProfileId', 'status'])
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
    .index('by_organizationId_and_accountId_and_status', ['organizationId', 'accountId', 'status']),

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
    .index('by_organizationId_and_accountId_and_status', ['organizationId', 'accountId', 'status']),

  login_rate_limits: defineTable({
    key: v.string(),
    windowStartedAt: v.number(),
    failureCount: v.number(),
    blockedUntil: v.optional(v.number()),
    updatedAt: v.number(),
  }).index('by_key', ['key']),

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
    .index('by_organizationId_and_occurredAt', ['organizationId', 'occurredAt'])
    .index('by_organizationId_and_teacherId_and_occurredAt', ['organizationId', 'teacherId', 'occurredAt']),

  teacher_proficiency: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    skillId: v.string(),
    projection: proficiencyProjectionValidator,
    updatedAt: v.number(),
  }).index('by_organizationId_and_teacherId', ['organizationId', 'teacherId']),

  teacher_srs_cards: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    skillId: v.string(),
    variantKey: v.string(),
    card: canonicalCardValidator,
    updatedAt: v.number(),
  }).index('by_organizationId_and_teacherId', ['organizationId', 'teacherId']),

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
  }).index('by_organizationId_and_teacherId_and_reviewedAt', ['organizationId', 'teacherId', 'reviewedAt']),

  teacher_knowledge_state: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    nodeId: v.string(),
    state: knowledgeStateValidator,
    updatedAt: v.number(),
  }).index('by_organizationId_and_teacherId', ['organizationId', 'teacherId']),

  teacher_priority: defineTable({
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    skillId: v.string(),
    projection: priorityValidator,
    updatedAt: v.number(),
  }).index('by_organizationId_and_teacherId', ['organizationId', 'teacherId']),

  observation_records: defineTable({
    organizationId: v.id('organizations'),
    teacherProfileId: v.id('teacher_profiles'),
    observerAccountId: v.id('accounts'),
    observationType: observationTypeValidator,
    schoolYear: v.string(),
    sourceVersion: v.string(),
    frameworkVersion: v.string(),
    observedAt: v.string(),
    status: v.union(v.literal('draft'), v.literal('submitted')),
    revision: v.number(),
    items: v.array(observationItemValidator),
    submissionKey: v.optional(v.string()),
    submissionFingerprint: v.optional(v.string()),
    submittedAt: v.optional(v.number()),
    publishedAt: v.optional(v.number()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org_observer_status', ['organizationId', 'observerAccountId', 'status'])
    .index('by_org_submission_key', ['organizationId', 'submissionKey'])
    .index('by_org_teacher_status_submitted', ['organizationId', 'teacherProfileId', 'status', 'submittedAt'])
    .index('by_org_teacher_type_year_status', ['organizationId', 'teacherProfileId', 'observationType', 'schoolYear', 'status'])
    .index(
      'by_organizationId_and_status_and_observationType_and_schoolYear',
      ['organizationId', 'status', 'observationType', 'schoolYear'],
    ),

  observation_amendments: defineTable({
    organizationId: v.id('organizations'),
    observationId: v.id('observation_records'),
    teacherProfileId: v.id('teacher_profiles'),
    authorAccountId: v.id('accounts'),
    idempotencyKey: v.string(),
    fingerprint: v.string(),
    version: v.number(),
    reason: v.string(),
    changedItems: v.array(observationItemChangeValidator),
    occurredAt: v.number(),
  })
    .index('by_org_observation_version', ['organizationId', 'observationId', 'version'])
    .index('by_org_idempotency_key', ['organizationId', 'idempotencyKey'])
    .index('by_org_teacher_occurred', ['organizationId', 'teacherProfileId', 'occurredAt']),

  teacher_evidence_supersessions: defineTable({
    organizationId: v.id('organizations'),
    teacherProfileId: v.id('teacher_profiles'),
    observationId: v.id('observation_records'),
    amendmentId: v.id('observation_amendments'),
    itemId: v.string(),
    supersededEvidenceKey: v.string(),
    replacementEvidenceKey: v.string(),
    replacementOutcome: observationItemOutcomeValidator,
    occurredAt: v.number(),
  })
    .index('by_org_occurred', ['organizationId', 'occurredAt'])
    .index('by_org_teacher_occurred', ['organizationId', 'teacherProfileId', 'occurredAt']),

  teacher_attention_summaries: defineTable({
    organizationId: v.id('organizations'),
    teacherProfileId: v.id('teacher_profiles'),
    targets: v.array(priorityValidator),
    updatedAt: v.number(),
  })
    .index('by_organizationId', ['organizationId'])
    .index('by_organizationId_and_teacherProfileId', ['organizationId', 'teacherProfileId']),

  observation_public_comments: defineTable({
    organizationId: v.id('organizations'),
    observationId: v.id('observation_records'),
    teacherProfileId: v.id('teacher_profiles'),
    authorAccountId: v.id('accounts'),
    content: v.string(),
    createdAt: v.number(),
  }).index('by_org_teacher_created', ['organizationId', 'teacherProfileId', 'createdAt']),

  observation_private_comments: defineTable({
    organizationId: v.id('organizations'),
    observationId: v.id('observation_records'),
    teacherProfileId: v.id('teacher_profiles'),
    authorAccountId: v.id('accounts'),
    content: v.string(),
    createdAt: v.number(),
  }).index('by_org_teacher_created', ['organizationId', 'teacherProfileId', 'createdAt']),

  teacher_observation_responses: defineTable({
    organizationId: v.id('organizations'),
    observationId: v.id('observation_records'),
    teacherProfileId: v.id('teacher_profiles'),
    authorAccountId: v.id('accounts'),
    content: v.string(),
    submittedAt: v.number(),
  })
    .index('by_org_observation', ['organizationId', 'observationId'])
    .index('by_org_teacher_submitted', ['organizationId', 'teacherProfileId', 'submittedAt']),

  improvement_plans: defineTable({
    organizationId: v.id('organizations'),
    teacherProfileId: v.id('teacher_profiles'),
    state: improvementPlanStateValidator,
    revision: v.number(),
    latestVersion: v.number(),
    pendingVersionId: v.optional(v.id('improvement_plan_versions')),
    activeVersionId: v.optional(v.id('improvement_plan_versions')),
    activeVersion: v.optional(v.number()),
    activeTargets: v.optional(v.array(v.object({
      componentId: v.string(),
      skillId: v.string(),
      expectedRating: v.number(),
    }))),
    approvedAt: v.optional(v.number()),
    planEndAt: v.optional(v.number()),
    reviewMeetingAt: v.optional(v.number()),
    closedAt: v.optional(v.number()),
    closureOutcome: v.optional(improvementPlanOutcomeValidator),
    closureNote: v.optional(v.string()),
    approvalEventId: v.optional(v.string()),
    closureEventId: v.optional(v.string()),
    closedTargetResults: v.optional(v.array(improvementPlanTargetResultValidator)),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index('by_org_teacher_state', ['organizationId', 'teacherProfileId', 'state'])
    .index('by_org_created', ['organizationId', 'createdAt'])
    .index('by_org_state_updated', ['organizationId', 'state', 'updatedAt']),

  improvement_plan_versions: defineTable({
    organizationId: v.id('organizations'),
    planId: v.id('improvement_plans'),
    teacherProfileId: v.id('teacher_profiles'),
    version: v.number(),
    proposerAccountId: v.id('accounts'),
    supervisorAccountId: v.id('accounts'),
    teacherName: v.string(),
    position: v.string(),
    departmentId: v.id('departments'),
    departmentName: v.string(),
    supervisorName: v.string(),
    requestedPlanEndDate: v.union(v.string(), v.null()),
    reviewMeetingDate: v.string(),
    purpose: v.string(),
    areasOfConcern: v.string(),
    expectedStandard: v.string(),
    requiredActions: v.string(),
    evidenceOfImprovement: v.string(),
    schoolSupport: v.string(),
    successfulCompletionCriteria: v.string(),
    insufficientImprovementConsequences: v.string(),
    acknowledgmentText: v.string(),
    sourceId: v.string(),
    sourceVersion: v.string(),
    fingerprint: v.string(),
    proposedAt: v.number(),
  }).index('by_org_plan_version', ['organizationId', 'planId', 'version']),

  improvement_plan_targets: defineTable({
    organizationId: v.id('organizations'),
    planId: v.id('improvement_plans'),
    versionId: v.id('improvement_plan_versions'),
    teacherProfileId: v.id('teacher_profiles'),
    ordinal: v.number(),
    componentId: v.string(),
    componentTitle: v.string(),
    skillId: v.string(),
    skillTitle: v.string(),
    expectedRating: v.number(),
    expectedPoints: v.number(),
    sourceId: v.string(),
    sourceVersion: v.string(),
    componentSourceRefs: v.array(improvementPlanSourceRefValidator),
    skillSourceRefs: v.array(improvementPlanSourceRefValidator),
    createdAt: v.number(),
  }).index('by_org_version_ordinal', ['organizationId', 'versionId', 'ordinal']),

  improvement_plan_acknowledgments: defineTable({
    organizationId: v.id('organizations'),
    planId: v.id('improvement_plans'),
    versionId: v.id('improvement_plan_versions'),
    teacherProfileId: v.id('teacher_profiles'),
    kind: v.union(v.literal('teacher'), v.literal('supervisor')),
    actorAccountId: v.id('accounts'),
    requestId: v.string(),
    acknowledgedAt: v.number(),
  }).index('by_org_version_kind', ['organizationId', 'versionId', 'kind']),

  improvement_plan_events: defineTable({
    organizationId: v.id('organizations'),
    planId: v.id('improvement_plans'),
    teacherProfileId: v.id('teacher_profiles'),
    version: v.number(),
    versionId: v.optional(v.id('improvement_plan_versions')),
    kind: improvementPlanEventKindValidator,
    requestId: v.string(),
    fingerprint: v.string(),
    actorAccountId: v.id('accounts'),
    occurredAt: v.number(),
    revision: v.number(),
    payload: v.object({
      outcome: v.optional(improvementPlanOutcomeValidator),
      note: v.optional(v.string()),
      planStartAt: v.optional(v.number()),
      planEndAt: v.optional(v.number()),
      acknowledgmentKind: v.optional(v.union(v.literal('teacher'), v.literal('supervisor'))),
      acknowledgmentId: v.optional(v.string()),
      targetResults: v.optional(v.array(improvementPlanTargetResultValidator)),
    }),
  })
    .index('by_org_request', ['organizationId', 'requestId'])
    .index('by_org_plan_time', ['organizationId', 'planId', 'occurredAt']),

  teacher_gbf_assignments: defineTable({
    organizationId: v.id('organizations'),
    teacherProfileId: v.id('teacher_profiles'),
    assignedSkillIds: v.array(v.string()),
    unsequencedGapSkillIds: v.array(v.string()),
    actorAccountId: v.id('accounts'),
    assignedAt: v.number(),
  }),

});
