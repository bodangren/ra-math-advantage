import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  organizations: defineTable({
    name: v.string(),
    slug: v.string(),
    settings: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_slug", ["slug"]),

  profiles: defineTable({
    organizationId: v.id("organizations"),
    username: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher"), v.literal("admin")),
    displayName: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_organization", ["organizationId"])
    .index("by_username", ["username"]),

  auth_credentials: defineTable({
    profileId: v.id("profiles"),
    username: v.string(),
    role: v.union(v.literal("student"), v.literal("teacher"), v.literal("admin")),
    organizationId: v.id("organizations"),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_username", ["username"])
    .index("by_profile", ["profileId"]),

  classes: defineTable({
    teacherId: v.id("profiles"),
    name: v.string(),
    description: v.optional(v.string()),
    academicYear: v.optional(v.string()),
    archived: v.boolean(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_teacher", ["teacherId"]),

  class_enrollments: defineTable({
    classId: v.id("classes"),
    studentId: v.id("profiles"),
    enrolledAt: v.number(),
    status: v.union(v.literal("active"), v.literal("withdrawn"), v.literal("completed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_class", ["classId"])
    .index("by_student", ["studentId"])
    .index("by_class_and_student", ["classId", "studentId"]),

  class_lessons: defineTable({
    classId: v.id("classes"),
    lessonId: v.id("lessons"),
    assignedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_class_and_lesson", ["classId", "lessonId"])
    .index("by_lesson", ["lessonId"]),

  lessons: defineTable({
    unitNumber: v.number(),
    title: v.string(),
    slug: v.string(),
    description: v.optional(v.string()),
    learningObjectives: v.optional(v.array(v.string())),
    orderIndex: v.number(),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_slug", ["slug"])
    .index("by_unit_and_order", ["unitNumber", "orderIndex"]),

  lesson_versions: defineTable({
    lessonId: v.id("lessons"),
    version: v.number(),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.union(v.literal("draft"), v.literal("review"), v.literal("published"), v.literal("archived")),
    createdAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_status", ["status"])
    .index("by_lesson_and_version", ["lessonId", "version"]),

  phase_versions: defineTable({
    lessonVersionId: v.id("lesson_versions"),
    phaseNumber: v.number(),
    title: v.optional(v.string()),
    estimatedMinutes: v.optional(v.number()),
    phaseType: v.union(
      v.literal("explore"),
      v.literal("vocabulary"),
      v.literal("learn"),
      v.literal("key_concept"),
      v.literal("worked_example"),
      v.literal("guided_practice"),
      v.literal("independent_practice"),
      v.literal("assessment"),
      v.literal("discourse"),
      v.literal("reflection"),
    ),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
  })
    .index("by_lesson_version", ["lessonVersionId"])
    .index("by_lesson_version_and_phase", ["lessonVersionId", "phaseNumber"]),

  phase_sections: defineTable({
    phaseVersionId: v.id("phase_versions"),
    sequenceOrder: v.number(),
    sectionType: v.union(
      v.literal("text"),
      v.literal("callout"),
      v.literal("activity"),
      v.literal("video"),
      v.literal("image"),
    ),
    content: v.any(),
    createdAt: v.number(),
  })
    .index("by_phase_version", ["phaseVersionId"])
    .index("by_phase_version_and_sequence", ["phaseVersionId", "sequenceOrder"]),

  competency_standards: defineTable({
    code: v.string(),
    description: v.string(),
    studentFriendlyDescription: v.optional(v.string()),
    category: v.optional(v.string()),
    isActive: v.boolean(),
    createdAt: v.number(),
  }).index("by_code", ["code"]),

  lesson_standards: defineTable({
    lessonVersionId: v.id("lesson_versions"),
    standardId: v.id("competency_standards"),
    isPrimary: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_lesson_version", ["lessonVersionId"])
    .index("by_standard", ["standardId"])
    .index("by_lesson_version_and_standard", ["lessonVersionId", "standardId"]),

  activities: defineTable({
    componentKey: v.string(),
    displayName: v.string(),
    description: v.optional(v.string()),
    props: v.any(),
    gradingConfig: v.optional(v.any()),
    standardId: v.optional(v.id("competency_standards")),
    approval: v.optional(v.object({
      status: v.union(
        v.literal("unreviewed"),
        v.literal("approved"),
        v.literal("needs_changes"),
        v.literal("rejected"),
      ),
      contentHash: v.optional(v.string()),
      reviewedAt: v.optional(v.number()),
      reviewedBy: v.optional(v.id("profiles")),
      reviewId: v.optional(v.id("component_reviews")),
    })),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_standard", ["standardId"]),

  student_competency: defineTable({
    studentId: v.id("profiles"),
    standardId: v.id("competency_standards"),
    masteryLevel: v.number(),
    evidenceActivityId: v.optional(v.id("activities")),
    lastUpdated: v.number(),
    createdAt: v.number(),
    updatedBy: v.optional(v.id("profiles")),
  })
    .index("by_student", ["studentId"])
    .index("by_standard", ["standardId"])
    .index("by_student_and_standard", ["studentId", "standardId"]),

  resources: defineTable({
    lessonId: v.optional(v.id("lessons")),
    phaseId: v.optional(v.id("phase_versions")),
    title: v.string(),
    description: v.optional(v.string()),
    resourceType: v.union(
      v.literal("dataset"),
      v.literal("pdf"),
      v.literal("excel"),
      v.literal("link"),
      v.literal("video"),
    ),
    filePath: v.optional(v.string()),
    externalUrl: v.optional(v.string()),
    metadata: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_lesson", ["lessonId"])
    .index("by_phase", ["phaseId"]),

  student_progress: defineTable({
    userId: v.id("profiles"),
    phaseId: v.id("phase_versions"),
    status: v.union(v.literal("not_started"), v.literal("in_progress"), v.literal("completed"), v.literal("skipped")),
    startedAt: v.optional(v.number()),
    completedAt: v.optional(v.number()),
    timeSpentSeconds: v.optional(v.number()),
    idempotencyKey: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_phase", ["phaseId"])
    .index("by_user_and_phase", ["userId", "phaseId"]),

  activity_submissions: defineTable({
    userId: v.id("profiles"),
    activityId: v.id("activities"),
    submissionData: v.any(),
    score: v.optional(v.number()),
    maxScore: v.optional(v.number()),
    feedback: v.optional(v.string()),
    submittedAt: v.number(),
    gradedAt: v.optional(v.number()),
    gradedBy: v.optional(v.id("profiles")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_activity", ["activityId"])
    .index("by_user_and_activity", ["userId", "activityId"]),

  student_spreadsheet_responses: defineTable({
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
    spreadsheetData: v.any(),
    isCompleted: v.boolean(),
    attempts: v.number(),
    lastValidationResult: v.optional(v.any()),
    submittedAt: v.optional(v.number()),
    draftData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_activity", ["activityId"])
    .index("by_student_and_activity", ["studentId", "activityId"]),

  activity_completions: defineTable({
    studentId: v.id("profiles"),
    activityId: v.id("activities"),
    lessonId: v.id("lessons"),
    phaseNumber: v.number(),
    completedAt: v.number(),
    idempotencyKey: v.string(),
    completionData: v.optional(v.any()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_activity", ["activityId"])
    .index("by_lesson", ["lessonId"])
    .index("by_idempotency_key", ["idempotencyKey"])
    .index("by_student_and_activity", ["studentId", "activityId"]),

  component_reviews: defineTable({
    componentKind: v.union(v.literal("example"), v.literal("activity"), v.literal("practice")),
    componentId: v.string(),
    componentKey: v.optional(v.string()),
    componentContentHash: v.string(),
    status: v.union(v.literal("approved"), v.literal("needs_changes"), v.literal("rejected")),
    comment: v.optional(v.string()),
    issueTags: v.optional(v.array(v.string())),
    priority: v.optional(v.union(v.literal("low"), v.literal("medium"), v.literal("high"))),
    placement: v.optional(v.object({
      lessonId: v.optional(v.string()),
      lessonVersionId: v.optional(v.string()),
      phaseId: v.optional(v.string()),
      phaseNumber: v.optional(v.number()),
      sectionId: v.optional(v.string()),
    })),
    createdBy: v.id("profiles"),
    createdAt: v.number(),
    resolvedAt: v.optional(v.number()),
    resolvedBy: v.optional(v.id("profiles")),
    resolutionReviewId: v.optional(v.id("component_reviews")),
  })
    .index("by_component", ["componentKind", "componentId"])
    .index("by_status", ["status"])
    .index("by_created_at", ["createdAt"])
    .index("by_resolved", ["resolvedAt"]),

  component_approvals: defineTable({
    componentKind: v.union(v.literal("example"), v.literal("activity"), v.literal("practice")),
    componentId: v.string(),
    componentKey: v.optional(v.string()),
    status: v.union(
      v.literal("unreviewed"),
      v.literal("approved"),
      v.literal("needs_changes"),
      v.literal("rejected"),
    ),
    contentHash: v.optional(v.string()),
    reviewedAt: v.optional(v.number()),
    reviewedBy: v.optional(v.id("profiles")),
    reviewId: v.optional(v.id("component_reviews")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_component", ["componentKind", "componentId"])
    .index("by_status", ["status"]),

  timing_baselines: defineTable({
    problemFamilyId: v.string(),
    sampleCount: v.number(),
    medianActiveMs: v.number(),
    p25ActiveMs: v.optional(v.number()),
    p75ActiveMs: v.optional(v.number()),
    p90ActiveMs: v.optional(v.number()),
    lastComputedAt: v.string(),
    minSamplesMet: v.boolean(),
  })
    .index("by_problem_family", ["problemFamilyId"])
    .index("by_last_computed", ["lastComputedAt"]),

  problem_families: defineTable({
    problemFamilyId: v.string(),
    componentKey: v.string(),
    displayName: v.string(),
    description: v.string(),
    objectiveIds: v.array(v.string()),
    difficulty: v.string(),
    metadata: v.optional(v.any()),
  })
    .index("by_problemFamilyId", ["problemFamilyId"])
    .index("by_componentKey", ["componentKey"])
    .index("by_objectiveId", ["objectiveIds"]),

  practice_items: defineTable({
    practiceItemId: v.string(),
    activityId: v.id("activities"),
    problemFamilyId: v.string(),
    variantLabel: v.string(),
  })
    .index("by_activityId", ["activityId"])
    .index("by_problemFamilyId", ["problemFamilyId"]),

  objective_policies: defineTable({
    standardId: v.id("competency_standards"),
    policy: v.string(),
    courseKey: v.string(),
    priority: v.number(),
  })
    .index("by_standardId", ["standardId"])
    .index("by_courseKey", ["courseKey"]),

  srs_cards: defineTable({
    studentId: v.id("profiles"),
    objectiveId: v.string(),
    problemFamilyId: v.string(),
    stability: v.number(),
    difficulty: v.number(),
    state: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("review"),
      v.literal("relearning")
    ),
    dueDate: v.string(),
    elapsedDays: v.number(),
    scheduledDays: v.number(),
    reps: v.number(),
    lapses: v.number(),
    lastReview: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_student_and_due", ["studentId", "dueDate"])
    .index("by_objective", ["objectiveId"])
    .index("by_student_and_objective", ["studentId", "objectiveId"])
    .index("by_problem_family", ["problemFamilyId"])
    .index("by_student_and_problem_family", ["studentId", "problemFamilyId"]),

  srs_review_log: defineTable({
    cardId: v.id("srs_cards"),
    studentId: v.id("profiles"),
    rating: v.string(),
    reviewId: v.optional(v.string()),
    submissionId: v.optional(v.string()),
    evidence: v.any(),
    stateBefore: v.any(),
    stateAfter: v.any(),
    reviewedAt: v.number(),
  })
    .index("by_card", ["cardId"])
    .index("by_student", ["studentId"])
    .index("by_reviewed_at", ["reviewedAt"]),

  srs_sessions: defineTable({
    studentId: v.id("profiles"),
    startedAt: v.number(),
    completedAt: v.optional(v.number()),
    plannedCards: v.number(),
    completedCards: v.number(),
    config: v.any(),
  })
    .index("by_student", ["studentId"])
    .index("by_student_and_status", ["studentId", "completedAt"]),

  study_sessions: defineTable({
    userId: v.id("profiles"),
    activityType: v.union(
      v.literal("flashcards"),
      v.literal("matching"),
      v.literal("speed_round"),
      v.literal("srs_review"),
      v.literal("practice_test")
    ),
    curriculumScope: v.object({
      type: v.union(v.literal("all_units"), v.literal("module")),
      moduleNumber: v.optional(v.number()),
    }),
    results: v.object({
      itemsSeen: v.number(),
      itemsCorrect: v.number(),
      itemsIncorrect: v.number(),
      durationSeconds: v.number(),
    }),
    startedAt: v.number(),
    endedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_activity", ["userId", "activityType"])
    .index("by_user_and_started", ["userId", "startedAt"]),

  practice_test_results: defineTable({
    userId: v.id("profiles"),
    moduleNumber: v.number(),
    lessonsTested: v.array(v.string()),
    questionCount: v.number(),
    score: v.number(),
    perLessonBreakdown: v.array(v.object({
      lessonId: v.string(),
      lessonTitle: v.string(),
      correct: v.number(),
      total: v.number(),
    })),
    completedAt: v.number(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_module", ["userId", "moduleNumber"])
    .index("by_user_and_completed", ["userId", "completedAt"]),

  term_mastery: defineTable({
    userId: v.id("profiles"),
    termSlug: v.string(),
    masteryScore: v.number(),
    proficiencyBand: v.union(
      v.literal("new"),
      v.literal("learning"),
      v.literal("familiar"),
      v.literal("mastered")
    ),
    seenCount: v.number(),
    correctCount: v.number(),
    incorrectCount: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_term", ["userId", "termSlug"]),

  due_reviews: defineTable({
    userId: v.id("profiles"),
    termSlug: v.string(),
    scheduledFor: v.number(),
    fsrsState: v.any(),
    isDue: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_and_term", ["userId", "termSlug"])
    .index("by_user_and_due", ["userId", "isDue", "scheduledFor"]),

  study_preferences: defineTable({
    userId: v.id("profiles"),
    preferences: v.any(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_user", ["userId"]),

  chatbot_rate_limits: defineTable({
    userId: v.id("profiles"),
    requestCount: v.number(),
    windowStart: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"]),
});
