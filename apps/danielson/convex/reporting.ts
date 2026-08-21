import { paginationOptsValidator, paginationResultValidator } from 'convex/server';
import { v } from 'convex/values';
import type { KnowledgeSpace } from '@math-platform/knowledge-space-core';

import { internalMutation, internalQuery } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { resolveAccessContextForDb } from './foundation';
import {
  authorizeDanielsonAction,
  type DanielsonAction,
  type DanielsonRole,
} from '../lib/foundation/authorization';
import { projectEffectiveObservation } from '../lib/observations/amendments';
import type {
  ObservationAmendment,
  ObservationItem,
  SubmittedObservation,
} from '../lib/observations/contracts';
import { buildDanielsonGraph } from '../lib/proficiency/graph';
import {
  projectTeacherPriority,
  type PriorityProjection,
} from '../lib/proficiency/processor';
import {
  comparePortfolioRows,
  paginatePortfolioRows,
  applyPriorityOverlays,
  projectCurrentProficiency,
  projectOfficialEvaluation,
  projectPortfolioRow,
} from '../lib/reporting/projections';
import {
  improvementPlanProgressValidator,
  publicImprovementPlanProgressValidator,
  readOrganizationActiveImprovementPlans,
  readOrganizationLatestClosedImprovementPlans,
  readTeacherImprovementPlanProjection,
} from './improvementPlans';
import {
  readOrganizationCurrentGbfAssignments,
  readTeacherGbfAssignment,
} from './gbf';
import { projectGbfProgress } from '../lib/gbf/progress';
import { isDanielsonRating } from '../lib/proficiency/rating';

const MAX_TEACHERS = 250;
const MAX_ACCOUNTS = 1_000;
const MAX_SCOPE_ROWS = 2_000;
const MAX_ATTENTION_SUMMARIES = 250;
const MAX_TEACHER_ROWS = 200;
const MAX_HISTORY_ROWS = 2_000;
const MAX_PAGE_SIZE = 50;

const deniedValidator = v.object({ kind: v.literal('denied'), reason: v.string() });
const reportingStateValidator = v.union(
  v.literal('below_proficient'),
  v.literal('proficient'),
  v.literal('not_enough_evidence'),
);
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
const observationOutcomeValidator = v.union(
  v.object({ kind: v.literal('rated'), rating: v.number() }),
  v.object({ kind: v.literal('not_enough_evidence') }),
);
const observationItemValidator = v.object({
  itemId: v.string(),
  componentId: v.string(),
  skillId: v.optional(v.string()),
  priorityReason: v.optional(observationPriorityReasonValidator),
  outcome: v.union(observationOutcomeValidator, v.null()),
  evidenceNote: v.union(v.string(), v.null()),
});
const gbfPhaseIdValidator = v.union(
  v.literal('phase_1'),
  v.literal('phase_2'),
  v.literal('phase_3'),
  v.literal('phase_4'),
  v.literal('stretch_it'),
  v.literal('complete'),
);
const compactGbfProgressValidator = v.union(
  v.object({
    contractVersion: v.literal('danielson.gbf-progress.v1'),
    state: v.literal('not_configured'),
  }),
  v.object({
    contractVersion: v.literal('danielson.gbf-progress.v1'),
    state: v.union(v.literal('in_progress'), v.literal('proficient')),
    managementPhaseId: gbfPhaseIdValidator,
    rigorPhaseId: gbfPhaseIdValidator,
    dueSkillCount: v.number(),
    unresolvedGapSkillCount: v.number(),
  }),
);
const gbfTrajectoryProgressValidator = v.object({
  currentPhaseId: gbfPhaseIdValidator,
  requiredActionStepIds: v.array(v.string()),
  completedActionStepIds: v.array(v.string()),
  assignedPrimarySkillIds: v.array(v.string()),
  proficientPrimarySkillIds: v.array(v.string()),
  duePrimarySkillIds: v.array(v.string()),
});
const gbfProgressValidator = v.union(
  v.object({
    contractVersion: v.literal('danielson.gbf-progress.v1'),
    state: v.literal('not_configured'),
  }),
  v.object({
    contractVersion: v.literal('danielson.gbf-progress.v1'),
    state: v.union(v.literal('in_progress'), v.literal('proficient')),
    assignmentId: v.string(),
    trajectories: v.object({
      management: gbfTrajectoryProgressValidator,
      rigor: gbfTrajectoryProgressValidator,
    }),
    assignedSkillIds: v.array(v.string()),
    proficientSkillIds: v.array(v.string()),
    dueSkillIds: v.array(v.string()),
    unresolvedGapSkillIds: v.array(v.string()),
  }),
);
const portfolioRowValidator = v.object({
  teacherProfileId: v.string(),
  displayName: v.string(),
  danielson: v.object({
    state: reportingStateValidator,
    belowComponentIds: v.array(v.string()),
  }),
  improvementPlan: v.union(
    v.object({
      contractVersion: v.literal('danielson.ip-progress.v1'),
      state: v.union(v.literal('not_configured'), v.literal('pending_approval')),
    }),
    v.object({
      contractVersion: v.literal('danielson.ip-progress.v1'),
      state: v.literal('active'),
      planId: v.string(),
      trackState: v.union(v.literal('on_track'), v.literal('off_track')),
      daysRemaining: v.number(),
    }),
    v.object({
      contractVersion: v.literal('danielson.ip-progress.v1'),
      state: v.literal('closed'),
      planId: v.string(),
      outcome: v.union(v.literal('successful'), v.literal('insufficient_improvement')),
    }),
  ),
  gbf: compactGbfProgressValidator,
  evidenceDue: v.object({
    state: v.union(v.literal('overdue'), v.literal('due'), v.literal('current')),
    dueCount: v.number(),
    overdueCount: v.number(),
    maximumOverdueDays: v.number(),
    nextDueAt: v.union(v.string(), v.null()),
  }),
  attentionReasons: v.array(v.union(
    v.literal('below_proficient'),
    v.literal('overdue_evidence'),
    v.literal('ip_off_track'),
  )),
});
const commentValidator = v.object({
  commentId: v.string(),
  observationId: v.string(),
  teacherProfileId: v.string(),
  authorAccountId: v.string(),
  content: v.string(),
  createdAt: v.number(),
});
const responseValidator = v.object({
  responseId: v.string(),
  observationId: v.string(),
  teacherProfileId: v.string(),
  authorAccountId: v.string(),
  content: v.string(),
  submittedAt: v.number(),
});
const officialEvaluationValidator = v.object({
  observationId: v.string(),
  observationType: v.union(v.literal('formal_q1'), v.literal('formal_q4')),
  schoolYear: v.string(),
  observedAt: v.string(),
  observerDisplayName: v.string(),
  amendmentCount: v.number(),
  status: reportingStateValidator,
  components: v.array(v.object({
    componentId: v.string(),
    title: v.string(),
    rawRating: v.union(v.number(), v.null()),
    points: v.union(v.number(), v.null()),
    observedAt: v.string(),
    observerDisplayName: v.string(),
    sourceObservationId: v.string(),
    amendmentCount: v.number(),
  })),
});
const currentProficiencyValidator = v.object({
  state: reportingStateValidator,
  priorityTargets: v.array(v.object({
    rank: v.union(v.literal(1), v.literal(2), v.literal(3)),
    skillId: v.string(),
    reason: observationPriorityReasonValidator,
  })),
  domains: v.array(v.object({
    domainId: v.string(),
    title: v.string(),
    state: reportingStateValidator,
    components: v.array(v.object({
      componentId: v.string(),
      title: v.string(),
      state: reportingStateValidator,
      skills: v.array(v.object({
        skillId: v.string(),
        title: v.string(),
        rawRating: v.union(v.number(), v.null()),
        points: v.union(v.number(), v.null()),
        state: reportingStateValidator,
        due: v.boolean(),
        dueAt: v.union(v.string(), v.null()),
        overdueDays: v.number(),
        sourceRecordId: v.union(v.string(), v.null()),
      })),
    })),
  })),
});
const evidenceHistoryItemValidator = v.object({
  observationId: v.string(),
  observationType: observationTypeValidator,
  schoolYear: v.string(),
  observedAt: v.string(),
  observerDisplayName: v.string(),
  amendmentCount: v.number(),
  teacherResponseState: v.union(
    v.literal('submitted'),
    v.literal('not_submitted'),
  ),
  items: v.array(observationItemValidator),
});
const publicReportValidator = v.object({
  teacherProfileId: v.string(),
  displayName: v.string(),
  danielsonState: reportingStateValidator,
  officialEvaluations: v.array(officialEvaluationValidator),
  currentProficiency: currentProficiencyValidator,
  improvementPlan: publicImprovementPlanProgressValidator,
  gbf: gbfProgressValidator,
  evidenceHistory: v.array(evidenceHistoryItemValidator),
  publicComments: v.array(commentValidator),
  responses: v.array(responseValidator),
});
const privateReportValidator = v.object({
  teacherProfileId: v.string(),
  displayName: v.string(),
  danielsonState: reportingStateValidator,
  officialEvaluations: v.array(officialEvaluationValidator),
  currentProficiency: currentProficiencyValidator,
  improvementPlan: improvementPlanProgressValidator,
  gbf: gbfProgressValidator,
  evidenceHistory: v.array(evidenceHistoryItemValidator),
  publicComments: v.array(commentValidator),
  privateComments: v.array(commentValidator),
  responses: v.array(responseValidator),
});

type DbCtx = Pick<QueryCtx, 'db'> | Pick<MutationCtx, 'db'>;

function priorityAtClock(priority: PriorityProjection, now: number): PriorityProjection {
  const dueAt = priority.dueAt === null || priority.dueAt === undefined
    ? Number.NaN
    : Date.parse(priority.dueAt);
  const due = priority.dueAt === null || !Number.isFinite(dueAt) || dueAt <= now;
  return {
    ...priority,
    due,
    overdueDays: due && Number.isFinite(dueAt)
      ? Math.max(0, Math.floor((now - dueAt) / 86_400_000))
      : 0,
  };
}

function submittedFromRow(row: Doc<'observation_records'>): SubmittedObservation {
  if (
    row.status !== 'submitted'
    || !row.submissionKey
    || !row.submissionFingerprint
    || row.submittedAt === undefined
    || row.publishedAt === undefined
  ) throw new Error('submitted_observation_invalid');
  return {
    draftId: String(row._id),
    observationId: String(row._id),
    organizationId: String(row.organizationId),
    teacherProfileId: String(row.teacherProfileId),
    observerAccountId: String(row.observerAccountId),
    observationType: row.observationType,
    schoolYear: row.schoolYear,
    sourceVersion: row.sourceVersion,
    frameworkVersion: row.frameworkVersion,
    observedAt: row.observedAt,
    status: 'submitted',
    revision: row.revision,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: row.items as ObservationItem[],
    submissionKey: row.submissionKey,
    submissionFingerprint: row.submissionFingerprint,
    submittedAt: row.submittedAt,
    publishedAt: row.publishedAt,
  };
}

function amendmentFromRow(row: Doc<'observation_amendments'>): ObservationAmendment {
  return {
    amendmentId: String(row._id),
    observationId: String(row.observationId),
    organizationId: String(row.organizationId),
    teacherProfileId: String(row.teacherProfileId),
    authorAccountId: String(row.authorAccountId),
    idempotencyKey: row.idempotencyKey,
    fingerprint: row.fingerprint,
    version: row.version,
    reason: row.reason,
    changedItems: row.changedItems as ObservationAmendment['changedItems'],
    occurredAt: row.occurredAt,
  };
}

function commentFromRow(
  row: Doc<'observation_public_comments'> | Doc<'observation_private_comments'>,
) {
  return {
    commentId: String(row._id),
    observationId: String(row.observationId),
    teacherProfileId: String(row.teacherProfileId),
    authorAccountId: String(row.authorAccountId),
    content: row.content,
    createdAt: row.createdAt,
  };
}

function responseFromRow(row: Doc<'teacher_observation_responses'>) {
  return {
    responseId: String(row._id),
    observationId: String(row.observationId),
    teacherProfileId: String(row.teacherProfileId),
    authorAccountId: String(row.authorAccountId),
    content: row.content,
    submittedAt: row.submittedAt,
  };
}

async function authorizeTeacher(
  ctx: DbCtx,
  actorAccountId: Id<'accounts'>,
  teacherProfileId: Id<'teacher_profiles'>,
  action: DanielsonAction,
) {
  const teacher = await ctx.db.get(teacherProfileId);
  if (!teacher) return { kind: 'denied' as const, reason: 'target_inactive' };
  const context = await resolveAccessContextForDb(ctx as Pick<QueryCtx, 'db'>, {
    actorAccountId,
    subjectAccountId: teacher.accountId,
  });
  const decision = authorizeDanielsonAction(context, action);
  if (!decision.allowed) return { kind: 'denied' as const, reason: decision.reason };
  const account = await ctx.db.get(teacher.accountId);
  if (!account?.isActive) return { kind: 'denied' as const, reason: 'target_inactive' };
  return { kind: 'allowed' as const, teacher, account };
}

function normalizeText(content: string) {
  const normalized = content.trim();
  return normalized.length > 0 && normalized.length <= 4_000 ? normalized : null;
}

const baseGraph: KnowledgeSpace = buildDanielsonGraph().graph;

function emptyPriorities(teacherProfileId: string, now: number, graph = baseGraph) {
  const skillIds = graph.nodes
    .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
    .map((node) => node.id)
    .sort();
  return projectTeacherPriority(teacherProfileId, [], [], graph, skillIds, now);
}

export const readLeadershipPortfolio = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    now: v.string(),
    cursor: v.union(v.string(), v.null()),
    pageSize: v.optional(v.number()),
  },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('portfolio_capacity_exceeded') }),
    v.object({ kind: v.literal('invalid_cursor') }),
    v.object({
      kind: v.literal('allowed'),
      page: v.object({
        items: v.array(portfolioRowValidator),
        isDone: v.boolean(),
        continueCursor: v.string(),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    const now = Date.parse(args.now);
    if (!Number.isFinite(now)) return { kind: 'denied' as const, reason: 'invalid_now' };
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    const organization = await ctx.db.get(actor.organizationId);
    if (!organization?.isActive) {
      return { kind: 'denied' as const, reason: 'organization_inactive' };
    }
    const roles = await ctx.db.query('role_assignments')
      .withIndex('by_organizationId_and_accountId_and_status', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('accountId', actor._id)
        .eq('status', 'active'))
      .take(7);
    const supervisorRoles = roles
      .map((row) => row.role)
      .filter((role): role is DanielsonRole => (
        role === 'hod' || role === 'coach' || role === 'school_head' || role === 'slt'
      ));
    if (supervisorRoles.length === 0) {
      return { kind: 'denied' as const, reason: 'capability_not_granted' };
    }
    const [improvementPlans, closedPlans] = await Promise.all([
      readOrganizationActiveImprovementPlans(ctx, actor.organizationId, now),
      readOrganizationLatestClosedImprovementPlans(ctx, actor.organizationId),
    ]);
    if (improvementPlans.kind === 'capacity_exceeded' || closedPlans.kind === 'capacity_exceeded') {
      return { kind: 'portfolio_capacity_exceeded' as const };
    }
    const profiles = await ctx.db.query('teacher_profiles')
      .withIndex('by_organizationId_and_isActive', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('isActive', true))
      .take(MAX_TEACHERS + 1);
    if (profiles.length > MAX_TEACHERS) {
      return { kind: 'portfolio_capacity_exceeded' as const };
    }
    const organizationWide = supervisorRoles.includes('school_head') || supervisorRoles.includes('slt');
    const [accounts, summaries, gbfAssignments, observations] = await Promise.all([
      ctx.db.query('accounts')
        .withIndex('by_organizationId_and_isActive', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('isActive', true))
        .take(MAX_ACCOUNTS + 1),
      ctx.db.query('teacher_attention_summaries')
        .withIndex('by_organizationId', (query) => query.eq('organizationId', actor.organizationId))
        .take(MAX_ATTENTION_SUMMARIES + 1),
      readOrganizationCurrentGbfAssignments(ctx, actor.organizationId),
      ctx.db.query('observation_records')
        .withIndex('by_org_observer_status', (query) => query
          .eq('organizationId', actor.organizationId))
        .take(MAX_HISTORY_ROWS + 1),
    ]);
    if (gbfAssignments.kind !== 'allowed') {
      return { kind: 'portfolio_capacity_exceeded' as const };
    }
    let memberships: Doc<'department_memberships'>[] = [];
    let departments: Doc<'departments'>[] = [];
    let hodAssignments: Doc<'hod_assignments'>[] = [];
    let coachAssignments: Doc<'coach_assignments'>[] = [];
    if (!organizationWide) {
      [memberships, departments, hodAssignments, coachAssignments] = await Promise.all([
        ctx.db.query('department_memberships')
          .withIndex('by_organizationId_and_status', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('status', 'active'))
          .take(MAX_SCOPE_ROWS + 1),
        ctx.db.query('departments')
          .withIndex('by_organizationId_and_isActive', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('isActive', true))
          .take(MAX_SCOPE_ROWS + 1),
        ctx.db.query('hod_assignments')
          .withIndex('by_organizationId_and_accountId_and_status', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('accountId', actor._id)
            .eq('status', 'active'))
          .take(MAX_SCOPE_ROWS + 1),
        ctx.db.query('coach_assignments')
          .withIndex('by_organizationId_and_accountId_and_status', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('accountId', actor._id)
            .eq('status', 'active'))
          .take(MAX_SCOPE_ROWS + 1),
      ]);
    }
    if (
      accounts.length > MAX_ACCOUNTS
      || memberships.length > MAX_SCOPE_ROWS
      || departments.length > MAX_SCOPE_ROWS
      || hodAssignments.length > MAX_SCOPE_ROWS
      || coachAssignments.length > MAX_SCOPE_ROWS
      || summaries.length > MAX_ATTENTION_SUMMARIES
      || observations.length > MAX_HISTORY_ROWS
    ) return { kind: 'portfolio_capacity_exceeded' as const };

    const activeDepartmentIds = new Set(departments.map((row) => String(row._id)));
    const hodDepartmentIds = new Set(hodAssignments
      .map((row) => String(row.departmentId))
      .filter((id) => activeDepartmentIds.has(id)));
    const coachTeacherIds = new Set(coachAssignments.map((row) => String(row.teacherProfileId)));
    const departmentsByTeacher = new Map<string, string[]>();
    for (const membership of memberships) {
      const departmentId = String(membership.departmentId);
      if (!activeDepartmentIds.has(departmentId)) continue;
      const teacherId = String(membership.teacherProfileId);
      departmentsByTeacher.set(teacherId, [
        ...(departmentsByTeacher.get(teacherId) ?? []),
        departmentId,
      ]);
    }
    const accountById = new Map(accounts.map((account) => [String(account._id), account]));
    const summaryByTeacher = new Map(summaries.map((summary) => [
      String(summary.teacherProfileId),
      summary.targets.map((target) => priorityAtClock(target, now)),
    ]));
    const formalByTeacher = new Map<string, Doc<'observation_records'>>();
    for (const observation of observations) {
      if (observation.status !== 'submitted'
        || (observation.observationType !== 'formal_q1' && observation.observationType !== 'formal_q4')) continue;
      const teacherId = String(observation.teacherProfileId);
      const current = formalByTeacher.get(teacherId);
      const observationAt = observation.submittedAt ?? observation.updatedAt;
      const currentAt = current?.submittedAt ?? current?.updatedAt ?? 0;
      if (!current
        || (observation.observationType === 'formal_q4' && current.observationType === 'formal_q1')
        || (observation.observationType === current.observationType
          && observationAt > currentAt)) {
        formalByTeacher.set(teacherId, observation);
      }
    }
    const rows = profiles.flatMap((profile) => {
      const teacherProfileId = String(profile._id);
      const inScope = organizationWide
        || (supervisorRoles.includes('hod') && (departmentsByTeacher.get(teacherProfileId) ?? [])
          .some((departmentId) => hodDepartmentIds.has(departmentId)))
        || (supervisorRoles.includes('coach') && coachTeacherIds.has(teacherProfileId));
      const account = accountById.get(String(profile.accountId));
      if (!inScope || !account?.isActive) return [];
      const activePlan = improvementPlans.progressByTeacher.get(teacherProfileId);
      const pendingPlanId = improvementPlans.pendingByTeacher.get(teacherProfileId);
      const closedPlan = closedPlans.plansByTeacher.get(teacherProfileId);
      const improvementPlan = activePlan?.state === 'active'
        ? {
            contractVersion: activePlan.contractVersion,
            state: activePlan.state,
            planId: activePlan.planId,
            trackState: activePlan.trackState,
            daysRemaining: activePlan.daysRemaining,
          }
        : pendingPlanId
          ? {
              contractVersion: 'danielson.ip-progress.v1' as const,
              state: 'pending_approval' as const,
            }
          : closedPlan?.closureOutcome
            ? {
                contractVersion: 'danielson.ip-progress.v1' as const,
                state: 'closed' as const,
                planId: String(closedPlan._id),
                outcome: closedPlan.closureOutcome,
              }
            : undefined;
      const priorities = summaryByTeacher.get(teacherProfileId)
        ?? emptyPriorities(
          teacherProfileId,
          now,
          baseGraph,
        );
      const formal = formalByTeacher.get(teacherProfileId);
      const formalEvidence = formal?.items.flatMap((item) => (
        item.outcome?.kind === 'rated' && isDanielsonRating(item.outcome.rating)
          ? [{
              componentId: item.componentId,
              rawRating: item.outcome.rating,
              sourceRecordId: String(formal._id),
            }]
          : []
      )) ?? [];
      const gbf = projectGbfProgress({
        assignment: gbfAssignments.assignmentsByTeacher.get(teacherProfileId) ?? null,
        priorities,
      });
      return [projectPortfolioRow({
        teacherProfileId,
        displayName: account.displayName,
        priorities,
        now,
        componentEvidence: formalEvidence,
        improvementPlan,
        gbf,
      })];
    }).sort(comparePortfolioRows);
    try {
      return {
        kind: 'allowed' as const,
        page: paginatePortfolioRows(rows, {
          cursor: args.cursor,
          pageSize: args.pageSize ?? 25,
        }),
      };
    } catch {
      return { kind: 'invalid_cursor' as const };
    }
  },
});

async function buildPublicTeacherReport(
  ctx: DbCtx,
  teacher: Doc<'teacher_profiles'>,
  account: Doc<'accounts'>,
  now: number,
) {
  const [
    records,
    amendments,
    cards,
    proficiency,
    responses,
    accounts,
    improvementPlan,
    gbfAssignment,
    activePlanData,
  ] = await Promise.all([
    ctx.db.query('observation_records')
      .withIndex('by_org_teacher_status_submitted', (query) => query
        .eq('organizationId', teacher.organizationId)
        .eq('teacherProfileId', teacher._id)
        .eq('status', 'submitted'))
      .order('desc')
      .take(MAX_HISTORY_ROWS + 1),
    ctx.db.query('observation_amendments')
      .withIndex('by_org_teacher_occurred', (query) => query
        .eq('organizationId', teacher.organizationId)
        .eq('teacherProfileId', teacher._id))
      .take(MAX_HISTORY_ROWS + 1),
    ctx.db.query('teacher_srs_cards')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', teacher.organizationId)
        .eq('teacherId', String(teacher._id)))
      .take(MAX_TEACHER_ROWS + 1),
    ctx.db.query('teacher_proficiency')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', teacher.organizationId)
        .eq('teacherId', String(teacher._id)))
      .take(MAX_TEACHER_ROWS + 1),
    ctx.db.query('teacher_observation_responses')
      .withIndex('by_org_teacher_submitted', (query) => query
        .eq('organizationId', teacher.organizationId)
        .eq('teacherProfileId', teacher._id))
      .order('desc')
      .take(MAX_HISTORY_ROWS + 1),
    ctx.db.query('accounts')
      .withIndex('by_organizationId', (query) => query.eq('organizationId', teacher.organizationId))
      .take(MAX_ACCOUNTS + 1),
    readTeacherImprovementPlanProjection(
      ctx,
      teacher.organizationId,
      teacher._id,
      now,
      false,
    ),
    readTeacherGbfAssignment(ctx, teacher.organizationId, teacher._id),
    readOrganizationActiveImprovementPlans(ctx, teacher.organizationId, now),
  ]);
  if (
    records.length > MAX_HISTORY_ROWS
    || amendments.length > MAX_HISTORY_ROWS
    || cards.length > MAX_TEACHER_ROWS
    || proficiency.length > MAX_TEACHER_ROWS
    || responses.length > MAX_HISTORY_ROWS
    || accounts.length > MAX_ACCOUNTS
    || improvementPlan === null
    || gbfAssignment.kind === 'capacity_exceeded'
    || activePlanData.kind === 'capacity_exceeded'
  ) return null;
  const reportGraph = baseGraph;
  const reportSkillIds = reportGraph.nodes
    .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
    .map((node) => node.id)
    .sort();
  const publicImprovementPlan = improvementPlan.state === 'pending_approval'
    ? { contractVersion: 'danielson.ip-progress.v1' as const, state: 'not_configured' as const }
    : improvementPlan;
  const submittedRecords = records.map(submittedFromRow);
  const amendmentRows = amendments.map(amendmentFromRow);
  const latestFormal = (type: 'formal_q1' | 'formal_q4') => submittedRecords
    .filter((record) => record.observationType === type)
    .sort((left, right) => right.submittedAt - left.submittedAt)[0];
  const formalRecord = latestFormal('formal_q4') ?? latestFormal('formal_q1');
  const formalEvidence = formalRecord
    ? projectEffectiveObservation(
        formalRecord,
        amendmentRows.filter((row) => row.observationId === formalRecord.observationId),
      ).items.flatMap((item) => item.outcome?.kind === 'rated'
        ? [{
            componentId: item.componentId,
            rawRating: item.outcome.rating,
            sourceRecordId: formalRecord.observationId,
          }]
        : [])
    : [];
  const rawPriorities = projectTeacherPriority(
    String(teacher._id),
    cards.map((row) => row.card) as never,
    proficiency.map((row) => row.projection as Record<string, unknown>),
    reportGraph,
    reportSkillIds,
    now,
  );
  const sourceBySkill = new Map(proficiency.map((row) => [
    row.projection.skillId,
    row.projection.sourceRecordId,
  ]));
  const priorities = applyPriorityOverlays({
    priorities: rawPriorities.map((priority) => ({
      ...priority,
      sourceRecordId: sourceBySkill.get(priority.skillId) ?? null,
    })),
    pipOverlays: activePlanData.overlaysByTeacher.get(String(teacher._id)) ?? new Map(),
    gbfAssignment: gbfAssignment.kind === 'allowed' ? gbfAssignment.assignment : null,
    now,
  });
  const currentProficiency = projectCurrentProficiency({
    priorities,
    componentEvidence: formalEvidence,
  });
  const gbf = projectGbfProgress({
    assignment: gbfAssignment.kind === 'allowed' ? gbfAssignment.assignment : null,
    priorities,
  });
  const accountById = new Map(accounts.map((row) => [String(row._id), row]));
  const officialEvaluations = (['formal_q1', 'formal_q4'] as const).flatMap((type) => {
    const record = latestFormal(type);
    if (!record) return [];
    return [{
      ...projectOfficialEvaluation({
        record,
        amendments: amendmentRows.filter((row) => row.observationId === record.observationId),
        observerDisplayName: accountById.get(record.observerAccountId)?.displayName
          ?? record.observerAccountId,
      }),
      observationType: type,
    }];
  });
  return {
    teacherProfileId: String(teacher._id),
    displayName: account.displayName,
    danielsonState: currentProficiency.state,
    officialEvaluations,
    currentProficiency,
    improvementPlan: publicImprovementPlan,
    gbf,
    evidenceHistory: [],
    publicComments: [],
    responses: responses.map(responseFromRow),
  };
}

export const readLeadershipTeacherReport = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    now: v.string(),
  },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('teacher_report_capacity_exceeded') }),
    v.object({ kind: v.literal('allowed'), visibility: v.literal('public'), report: publicReportValidator }),
    v.object({ kind: v.literal('allowed'), visibility: v.literal('private'), report: privateReportValidator }),
  ),
  handler: async (ctx, args) => {
    const now = Date.parse(args.now);
    if (!Number.isFinite(now)) return { kind: 'denied' as const, reason: 'invalid_now' };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      args.teacherProfileId,
      'teacher_report:read',
    );
    if (access.kind === 'denied') return access;
    const report = await buildPublicTeacherReport(ctx, access.teacher, access.account, now);
    if (!report) return { kind: 'teacher_report_capacity_exceeded' as const };
    const privateAccess = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      args.teacherProfileId,
      'private_leadership:read',
    );
    if (privateAccess.kind === 'denied') {
      return { kind: 'allowed' as const, visibility: 'public' as const, report };
    }
    const privateImprovementPlan = await readTeacherImprovementPlanProjection(
      ctx,
      access.teacher.organizationId,
      access.teacher._id,
      now,
      true,
    );
    if (privateImprovementPlan === null) {
      return { kind: 'teacher_report_capacity_exceeded' as const };
    }
    return {
      kind: 'allowed' as const,
      visibility: 'private' as const,
      report: { ...report, improvementPlan: privateImprovementPlan, privateComments: [] },
    };
  },
});

export const readMyTeacherReport = internalQuery({
  args: { actorAccountId: v.id('accounts'), now: v.string() },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('teacher_report_capacity_exceeded') }),
    v.object({ kind: v.literal('allowed'), report: publicReportValidator }),
  ),
  handler: async (ctx, args) => {
    const now = Date.parse(args.now);
    if (!Number.isFinite(now)) return { kind: 'denied' as const, reason: 'invalid_now' };
    const teacher = await ctx.db.query('teacher_profiles')
      .withIndex('by_accountId', (query) => query.eq('accountId', args.actorAccountId))
      .unique();
    if (!teacher) return { kind: 'denied' as const, reason: 'target_inactive' };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      teacher._id,
      'published_record:read',
    );
    if (access.kind === 'denied') return access;
    const report = await buildPublicTeacherReport(ctx, access.teacher, access.account, now);
    return report
      ? { kind: 'allowed' as const, report }
      : { kind: 'teacher_report_capacity_exceeded' as const };
  },
});

async function listEvidenceHistory(
  ctx: Pick<QueryCtx, 'db'>,
  args: {
    actorAccountId: Id<'accounts'>;
    teacherProfileId: Id<'teacher_profiles'>;
    paginationOpts: { cursor: string | null; numItems: number };
  },
  action: 'teacher_report:read' | 'published_record:read',
) {
  const access = await authorizeTeacher(
    ctx,
    args.actorAccountId,
    args.teacherProfileId,
    action,
  );
  if (access.kind === 'denied') return access;
  const [result, amendments, responses, accounts] = await Promise.all([
    ctx.db.query('observation_records')
      .withIndex('by_org_teacher_status_submitted', (query) => query
        .eq('organizationId', access.teacher.organizationId)
        .eq('teacherProfileId', access.teacher._id)
        .eq('status', 'submitted'))
      .order('desc')
      .paginate({
        cursor: args.paginationOpts.cursor,
        numItems: Math.min(args.paginationOpts.numItems, MAX_PAGE_SIZE),
      }),
    ctx.db.query('observation_amendments')
      .withIndex('by_org_teacher_occurred', (query) => query
        .eq('organizationId', access.teacher.organizationId)
        .eq('teacherProfileId', access.teacher._id))
      .take(MAX_HISTORY_ROWS + 1),
    ctx.db.query('teacher_observation_responses')
      .withIndex('by_org_teacher_submitted', (query) => query
        .eq('organizationId', access.teacher.organizationId)
        .eq('teacherProfileId', access.teacher._id))
      .take(MAX_HISTORY_ROWS + 1),
    ctx.db.query('accounts')
      .withIndex('by_organizationId', (query) => query
        .eq('organizationId', access.teacher.organizationId))
      .take(MAX_ACCOUNTS + 1),
  ]);
  if (
    amendments.length > MAX_HISTORY_ROWS
    || responses.length > MAX_HISTORY_ROWS
    || accounts.length > MAX_ACCOUNTS
  ) return { kind: 'history_capacity_exceeded' as const };

  const amendmentsByObservation = new Map<string, ObservationAmendment[]>();
  for (const row of amendments) {
    const amendment = amendmentFromRow(row);
    amendmentsByObservation.set(amendment.observationId, [
      ...(amendmentsByObservation.get(amendment.observationId) ?? []),
      amendment,
    ]);
  }
  const responseByObservation = new Set(responses.map((row) => String(row.observationId)));
  const accountById = new Map(accounts.map((row) => [String(row._id), row]));
  return {
    kind: 'allowed' as const,
    page: {
      ...result,
      page: result.page.map((row) => {
        const original = submittedFromRow(row);
        const observationAmendments = amendmentsByObservation.get(original.observationId) ?? [];
        const effective = projectEffectiveObservation(original, observationAmendments);
        return {
          observationId: effective.observationId,
          observationType: effective.observationType,
          schoolYear: effective.schoolYear,
          observedAt: effective.observedAt,
          observerDisplayName: accountById.get(effective.observerAccountId)?.displayName
            ?? effective.observerAccountId,
          amendmentCount: observationAmendments.length,
          teacherResponseState: responseByObservation.has(effective.observationId)
            ? 'submitted' as const
            : 'not_submitted' as const,
          items: effective.items,
        };
      }),
    },
  };
}

const evidenceHistoryPageResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('history_capacity_exceeded') }),
  v.object({
    kind: v.literal('allowed'),
    page: paginationResultValidator(evidenceHistoryItemValidator),
  }),
);

export const listLeadershipEvidenceHistory = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    paginationOpts: paginationOptsValidator,
  },
  returns: evidenceHistoryPageResultValidator,
  handler: (ctx, args) => listEvidenceHistory(ctx, args, 'teacher_report:read'),
});

export const listMyEvidenceHistory = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
  },
  returns: evidenceHistoryPageResultValidator,
  handler: async (ctx, args) => {
    const teacher = await ctx.db.query('teacher_profiles')
      .withIndex('by_accountId', (query) => query.eq('accountId', args.actorAccountId))
      .unique();
    if (!teacher) return { kind: 'denied' as const, reason: 'target_inactive' };
    return listEvidenceHistory(ctx, {
      ...args,
      teacherProfileId: teacher._id,
    }, 'published_record:read');
  },
});

async function listLeadershipComments(
  ctx: Pick<QueryCtx, 'db'>,
  args: {
    actorAccountId: Id<'accounts'>;
    teacherProfileId: Id<'teacher_profiles'>;
    paginationOpts: { cursor: string | null; numItems: number };
  },
  table: 'observation_public_comments' | 'observation_private_comments',
  action: 'teacher_report:read' | 'private_leadership:read',
) {
  const access = await authorizeTeacher(ctx, args.actorAccountId, args.teacherProfileId, action);
  if (access.kind === 'denied') return access;
  const result = await ctx.db.query(table)
    .withIndex('by_org_teacher_created', (query) => query
      .eq('organizationId', access.teacher.organizationId)
      .eq('teacherProfileId', access.teacher._id))
    .order('desc')
    .paginate({
      cursor: args.paginationOpts.cursor,
      numItems: Math.min(args.paginationOpts.numItems, MAX_PAGE_SIZE),
    });
  return {
    kind: 'allowed' as const,
    page: { ...result, page: result.page.map(commentFromRow) },
  };
}

const commentPageResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('allowed'), page: paginationResultValidator(commentValidator) }),
);

export const listLeadershipPublicComments = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    paginationOpts: paginationOptsValidator,
  },
  returns: commentPageResultValidator,
  handler: (ctx, args) => listLeadershipComments(
    ctx,
    args,
    'observation_public_comments',
    'teacher_report:read',
  ),
});

export const listLeadershipPrivateComments = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    paginationOpts: paginationOptsValidator,
  },
  returns: commentPageResultValidator,
  handler: (ctx, args) => listLeadershipComments(
    ctx,
    args,
    'observation_private_comments',
    'private_leadership:read',
  ),
});

export const listMyPublicComments = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
  },
  returns: commentPageResultValidator,
  handler: async (ctx, args) => {
    const teacher = await ctx.db.query('teacher_profiles')
      .withIndex('by_accountId', (query) => query.eq('accountId', args.actorAccountId))
      .unique();
    if (!teacher) return { kind: 'denied' as const, reason: 'target_inactive' };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      teacher._id,
      'published_record:read',
    );
    if (access.kind === 'denied') return access;
    const result = await ctx.db.query('observation_public_comments')
      .withIndex('by_org_teacher_created', (query) => query
        .eq('organizationId', teacher.organizationId)
        .eq('teacherProfileId', teacher._id))
      .order('desc')
      .paginate({
        cursor: args.paginationOpts.cursor,
        numItems: Math.min(args.paginationOpts.numItems, MAX_PAGE_SIZE),
      });
    return {
      kind: 'allowed' as const,
      page: { ...result, page: result.page.map(commentFromRow) },
    };
  },
});

async function addObservationComment(
  ctx: Pick<MutationCtx, 'db'>,
  args: {
    actorAccountId: Id<'accounts'>;
    observationId: Id<'observation_records'>;
    content: string;
    now: number;
  },
  table: 'observation_public_comments' | 'observation_private_comments',
) {
  const content = normalizeText(args.content);
  if (!content || !Number.isFinite(args.now)) return { kind: 'invalid_comment' as const };
  const observation = await ctx.db.get(args.observationId);
  if (!observation || observation.status !== 'submitted') return { kind: 'not_found' as const };
  const access = await authorizeTeacher(
    ctx,
    args.actorAccountId,
    observation.teacherProfileId,
    'observation_comment:write',
  );
  if (access.kind === 'denied') return access;
  const commentId = await ctx.db.insert(table, {
    organizationId: observation.organizationId,
    observationId: observation._id,
    teacherProfileId: observation.teacherProfileId,
    authorAccountId: args.actorAccountId,
    content,
    createdAt: args.now,
  });
  return { kind: 'created' as const, commentId: String(commentId) };
}

const commentWriteResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('invalid_comment') }),
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('created'), commentId: v.string() }),
);

const commentWriteArgs = {
  actorAccountId: v.id('accounts'),
  observationId: v.id('observation_records'),
  content: v.string(),
  now: v.number(),
};

export const addPublicObservationComment = internalMutation({
  args: commentWriteArgs,
  returns: commentWriteResultValidator,
  handler: (ctx, args) => addObservationComment(
    ctx,
    args,
    'observation_public_comments',
  ),
});

export const addPrivateObservationComment = internalMutation({
  args: commentWriteArgs,
  returns: commentWriteResultValidator,
  handler: (ctx, args) => addObservationComment(
    ctx,
    args,
    'observation_private_comments',
  ),
});

export const submitTeacherResponse = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    observationId: v.id('observation_records'),
    content: v.string(),
    now: v.number(),
  },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('invalid_response') }),
    v.object({ kind: v.literal('not_found') }),
    v.object({ kind: v.literal('response_exists') }),
    v.object({ kind: v.literal('submitted'), responseId: v.string() }),
  ),
  handler: async (ctx, args) => {
    const content = normalizeText(args.content);
    if (!content || !Number.isFinite(args.now)) return { kind: 'invalid_response' as const };
    const observation = await ctx.db.get(args.observationId);
    if (!observation || observation.status !== 'submitted') return { kind: 'not_found' as const };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      observation.teacherProfileId,
      'teacher_response:write',
    );
    if (access.kind === 'denied') return access;
    const existing = await ctx.db.query('teacher_observation_responses')
      .withIndex('by_org_observation', (query) => query
        .eq('organizationId', observation.organizationId)
        .eq('observationId', observation._id))
      .unique();
    if (existing) return { kind: 'response_exists' as const };
    const responseId = await ctx.db.insert('teacher_observation_responses', {
      organizationId: observation.organizationId,
      observationId: observation._id,
      teacherProfileId: observation.teacherProfileId,
      authorAccountId: args.actorAccountId,
      content,
      submittedAt: args.now,
    });
    return { kind: 'submitted' as const, responseId: String(responseId) };
  },
});
