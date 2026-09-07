import { paginationOptsValidator, paginationResultValidator } from 'convex/server';
import { v } from 'convex/values';

import { internalMutation, internalQuery } from './_generated/server';
import type { Id, Doc } from './_generated/dataModel';
import type { MutationCtx, QueryCtx } from './_generated/server';
import { resolveAccessContextForDb } from './foundation';
import {
  authorizeDanielsonAction,
  type DanielsonAction,
  type DanielsonRole,
} from '../lib/foundation/authorization';
import { buildDanielsonGraph, getComponentSkillIds } from '../lib/proficiency/graph';
import {
  processTeacherEvidence,
  projectTeacherPriority,
  type PriorityProjection,
} from '../lib/proficiency/processor';
import { createDanielsonTeacherProficiencyPort } from '../lib/proficiency/convex-repository';
import { replayTeacherEvidence } from '../lib/proficiency/replay';
import {
  rankTeacherQueue,
  scopeTeacherCandidates,
  selectWalkthroughTargets,
} from '../lib/observations/queue';
import {
  discardObservationDraft as discardDraftRecord,
  normalizeObservationDraft,
  saveObservationDraft as saveDraftRecord,
  submitObservationDraft,
} from '../lib/observations/lifecycle';
import {
  applyObservationAmendment,
  projectEffectiveObservation,
} from '../lib/observations/amendments';
import { buildObservationEvidenceCommands } from '../lib/observations/evidence-adapter';
import type {
  ObservationAmendment,
  ObservationDraft,
  ObservationItem,
  ObservationType,
  SubmittedObservation,
} from '../lib/observations/contracts';
import { readOrganizationActiveImprovementPlans } from './improvementPlans';
import { applyGbfPhasePriority } from '../lib/gbf/progress';
import { readOrganizationCurrentGbfAssignments, readTeacherGbfAssignment } from './gbf';
import { applyPriorityOverlays } from '../lib/reporting/projections';

const MAX_QUEUE_TEACHERS = 250;
const MAX_ORGANIZATION_ACCOUNTS = 1_000;
const MAX_SCOPE_ROWS = 2_000;
const MAX_HISTORY_ROWS = 2_000;
const MAX_TEACHER_ROWS = 200;
const MAX_AMENDMENTS = 100;

const observationTypeValidator = v.union(
  v.literal('walkthrough'),
  v.literal('formal_q1'),
  v.literal('formal_q4'),
);
const observationOutcomeValidator = v.union(
  v.object({ kind: v.literal('rated'), rating: v.number() }),
  v.object({ kind: v.literal('not_enough_evidence') }),
);
const savedItemValidator = v.object({
  itemId: v.string(),
  outcome: v.union(v.null(), observationOutcomeValidator),
  evidenceNote: v.union(v.null(), v.string()),
});
const changedItemValidator = v.object({
  itemId: v.string(),
  outcome: v.optional(observationOutcomeValidator),
  evidenceNote: v.optional(v.union(v.null(), v.string())),
});

const priorityReasonValidator = v.union(
  v.literal('below_proficient'),
  v.literal('approved_plan_priority'),
  v.literal('gbf_phase_priority'),
  v.literal('overdue'),
  v.literal('evidence_gap'),
  v.literal('due'),
);
const observationItemFields = {
  itemId: v.string(),
  componentId: v.string(),
  skillId: v.optional(v.string()),
  priorityReason: v.optional(priorityReasonValidator),
  outcome: v.union(v.null(), observationOutcomeValidator),
  evidenceNote: v.union(v.null(), v.string()),
};
const observationItemValidator = v.object(observationItemFields);
const observationDraftFields = {
  draftId: v.string(),
  organizationId: v.string(),
  teacherProfileId: v.string(),
  observerAccountId: v.string(),
  observationType: observationTypeValidator,
  schoolYear: v.string(),
  sourceVersion: v.string(),
  frameworkVersion: v.string(),
  observedAt: v.string(),
  revision: v.number(),
  createdAt: v.number(),
  updatedAt: v.number(),
  items: v.array(observationItemValidator),
};
const observationDraftValidator = v.object({
  ...observationDraftFields,
  status: v.literal('draft'),
});
const submittedObservationValidator = v.object({
  ...observationDraftFields,
  observationId: v.string(),
  status: v.literal('submitted'),
  submissionKey: v.string(),
  submissionFingerprint: v.string(),
  submittedAt: v.number(),
  publishedAt: v.number(),
});
const observationReceiptValidator = v.object({
  observationId: v.string(),
  submissionKey: v.string(),
  submittedAt: v.number(),
  publishedAt: v.number(),
  fingerprint: v.string(),
});
const currentProficiencyValidator = v.object({
  rawRating: v.union(v.number(), v.null()),
  points: v.union(v.number(), v.null()),
  passes: v.boolean(),
});
const priorityProjectionFields = {
  teacherId: v.string(),
  skillId: v.string(),
  componentId: v.optional(v.string()),
  due: v.boolean(),
  dueAt: v.optional(v.union(v.string(), v.null())),
  overdueDays: v.number(),
  currentProficiency: currentProficiencyValidator,
  evidenceGaps: v.array(v.string()),
  approvedPriorityInputs: v.array(v.string()),
};
const rankedPriorityFields = {
  ...priorityProjectionFields,
  reason: priorityReasonValidator,
};
const rankedPriorityValidator = v.object(rankedPriorityFields);
const rankedPriorityTargetValidator = v.object({
  ...rankedPriorityFields,
  skillTitle: v.string(),
  componentTitle: v.string(),
});
const targetSelectionFields = {
  requested: v.literal(3),
  returned: v.number(),
  shortfall: v.number(),
  shortfallReason: v.union(v.literal('fewer_than_three_eligible_skills'), v.null()),
};
const deniedResultValidator = v.object({ kind: v.literal('denied'), reason: v.string() });
const queueCapacityResultValidator = v.object({ kind: v.literal('queue_capacity_exceeded') });
const queueResultValidator = v.union(
  deniedResultValidator,
  queueCapacityResultValidator,
  v.object({
    kind: v.literal('allowed'),
    formalCandidates: v.array(v.object({ teacherProfileId: v.string(), displayName: v.string() })),
    items: v.array(v.object({
      teacherProfileId: v.string(),
      displayName: v.string(),
      reason: priorityReasonValidator,
      eligibleTargetCount: v.number(),
      ...targetSelectionFields,
      targets: v.array(rankedPriorityTargetValidator),
    })),
  }),
);
const draftErrorValidators = [
  deniedResultValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('revision_conflict') }),
  v.object({ kind: v.literal('submitted_immutable') }),
] as const;
const observationAmendmentFields = {
  amendmentId: v.string(),
  observationId: v.string(),
  organizationId: v.string(),
  teacherProfileId: v.string(),
  authorAccountId: v.string(),
  idempotencyKey: v.string(),
  fingerprint: v.string(),
  version: v.number(),
  reason: v.string(),
  changedItems: v.array(changedItemValidator),
  occurredAt: v.number(),
};
const evidenceSupersessionValidator = v.object({
  supersessionId: v.string(),
  observationId: v.string(),
  amendmentId: v.string(),
  teacherProfileId: v.string(),
  itemId: v.string(),
  supersededEvidenceKey: v.string(),
  replacementEvidenceKey: v.string(),
  replacementOutcome: observationOutcomeValidator,
  occurredAt: v.number(),
});
const amendmentReceiptValidator = v.object({ amendmentId: v.string(), version: v.number() });
const createDraftResultValidator = v.union(
  deniedResultValidator,
  v.object({ kind: v.literal('invalid_components') }),
  v.object({
    kind: v.literal('no_eligible_targets'),
    ...targetSelectionFields,
    targets: v.array(rankedPriorityValidator),
  }),
  v.object({
    kind: v.literal('created'),
    draft: observationDraftValidator,
    requested: v.optional(v.literal(3)),
    returned: v.optional(v.number()),
    shortfall: v.optional(v.number()),
    shortfallReason: v.optional(v.union(
      v.literal('fewer_than_three_eligible_skills'),
      v.null(),
    )),
  }),
);
const saveDraftResultValidator = v.union(
  ...draftErrorValidators,
  v.object({ kind: v.literal('saved'), draft: observationDraftValidator }),
);
const enrichedObservationItemValidator = v.object({
  ...observationItemFields,
  skillTitle: v.optional(v.string()),
  componentTitle: v.string(),
});
const readDraftResultValidator = v.union(
  deniedResultValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({
    kind: v.literal('allowed'),
    draft: v.object({
      ...observationDraftFields,
      status: v.literal('draft'),
      teacherDisplayName: v.string(),
      items: v.array(enrichedObservationItemValidator),
    }),
  }),
);
const discardDraftResultValidator = v.union(
  ...draftErrorValidators,
  v.object({ kind: v.literal('confirmation_required') }),
  v.object({ kind: v.literal('discarded'), draftId: v.string() }),
);
const submissionResultValidator = v.union(
  ...draftErrorValidators,
  v.object({ kind: v.literal('incomplete_items'), itemIds: v.array(v.string()) }),
  v.object({ kind: v.literal('future_observed_at') }),
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({ kind: v.literal('formal_observation_exists') }),
  v.object({
    kind: v.union(v.literal('submitted'), v.literal('replayed')),
    record: submittedObservationValidator,
    receipt: observationReceiptValidator,
  }),
);
const publishedObservationResultValidator = v.union(
  deniedResultValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('history_capacity_exceeded') }),
  v.object({
    kind: v.literal('allowed'),
    record: submittedObservationValidator,
    original: submittedObservationValidator,
    amendmentCount: v.number(),
    isSelf: v.boolean(),
    teacherDisplayName: v.string(),
    observerDisplayName: v.string(),
  }),
);
const amendmentHistoryItemValidator = v.object({
  ...observationAmendmentFields,
  authorDisplayName: v.string(),
});
const amendmentHistoryResultValidator = v.union(
  deniedResultValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({
    kind: v.literal('allowed'),
    page: paginationResultValidator(amendmentHistoryItemValidator),
  }),
);
const draftListItemValidator = v.object({
  draftId: v.string(),
  observationType: observationTypeValidator,
  teacherDisplayName: v.string(),
  observedAt: v.string(),
  updatedAt: v.number(),
  revision: v.number(),
});
const draftListResultValidator = v.union(
  deniedResultValidator,
  queueCapacityResultValidator,
  v.object({
    kind: v.literal('allowed'),
    page: paginationResultValidator(draftListItemValidator),
  }),
);
const publishedListItemValidator = v.object({
  observationId: v.string(),
  observationType: observationTypeValidator,
  observedAt: v.string(),
  publishedAt: v.optional(v.number()),
  observerDisplayName: v.string(),
});
const publishedListResultValidator = v.union(
  deniedResultValidator,
  v.object({
    kind: v.literal('allowed'),
    page: paginationResultValidator(publishedListItemValidator),
  }),
);
const amendmentMutationResultValidator = v.union(
  deniedResultValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({ kind: v.literal('correction_history_capacity_exceeded') }),
  v.object({ kind: v.literal('version_conflict'), latestVersion: v.number() }),
  v.object({ kind: v.literal('invalid_reason') }),
  v.object({ kind: v.literal('no_changes') }),
  v.object({
    kind: v.union(v.literal('amended'), v.literal('replayed')),
    amendment: v.object(observationAmendmentFields),
    supersessions: v.array(evidenceSupersessionValidator),
    receipt: amendmentReceiptValidator,
  }),
);

function priorityAtClock(priority: PriorityProjection, now: number): PriorityProjection {
  if (priority.dueAt === undefined) return priority;
  const dueAt = priority.dueAt === null ? Number.NaN : Date.parse(priority.dueAt);
  const due = priority.dueAt === null || !Number.isFinite(dueAt) || dueAt <= now;
  return {
    ...priority,
    due,
    overdueDays: due && Number.isFinite(dueAt)
      ? Math.max(0, Math.floor((now - dueAt) / 86_400_000))
      : 0,
  };
}

type DbCtx = Pick<QueryCtx, 'db'> | Pick<MutationCtx, 'db'>;

function graphDetails() {
  const graph = buildDanielsonGraph().graph;
  const skillIds = graph.nodes
    .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
    .map((node) => node.id)
    .sort();
  const componentIds = new Set(
    graph.nodes
      .filter((node) => node.kind === 'instructional_unit')
      .map((node) => node.id),
  );
  return { graph, skillIds, componentIds };
}

async function graphDetailsForTeacher(
  ctx: DbCtx,
  organizationId: Id<'organizations'>,
  teacherProfileId: Id<'teacher_profiles'>,
) {
  const baseGraph = buildDanielsonGraph().graph;
  const assignment = await readTeacherGbfAssignment(ctx, organizationId, teacherProfileId);
  if (assignment.kind === 'capacity_exceeded') throw new Error('gbf_assignment_capacity_exceeded');
  const graph = baseGraph;
  const skillIds = graph.nodes
    .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
    .map((node) => node.id)
    .sort();
  const componentIds = new Set(
    graph.nodes
      .filter((node) => node.kind === 'instructional_unit')
      .map((node) => node.id),
  );
  return {
    graph,
    skillIds,
    componentIds,
    assignment: assignment.kind === 'allowed' ? assignment.assignment : null,
  };
}

function actionFor(type: ObservationType, mode: 'submit' | 'amend'): DanielsonAction {
  if (type === 'walkthrough') return `walkthrough:${mode}`;
  if (type === 'formal_q1') return `q1_observation:${mode}`;
  return `q4_observation:${mode}`;
}

async function authorizeTeacher(
  ctx: DbCtx,
  actorAccountId: Id<'accounts'>,
  teacherProfileId: Id<'teacher_profiles'>,
  action: DanielsonAction,
) {
  const actor = await ctx.db.get(actorAccountId);
  const teacher = await ctx.db.get(teacherProfileId);
  if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
  if (!teacher?.isActive) return { kind: 'denied' as const, reason: 'target_inactive' };
  if (teacher.organizationId !== actor.organizationId) {
    return { kind: 'denied' as const, reason: 'cross_organization' };
  }
  const subjectAccount = await ctx.db.get(teacher.accountId);
  if (!subjectAccount?.isActive) return { kind: 'denied' as const, reason: 'target_inactive' };
  const context = await resolveAccessContextForDb(ctx as Pick<QueryCtx, 'db'>, {
    actorAccountId,
    subjectAccountId: teacher.accountId,
  });
  const decision = authorizeDanielsonAction(context, action);
  if (!decision.allowed) return { kind: 'denied' as const, reason: decision.reason };
  return { kind: 'allowed' as const, actor, teacher, subjectAccount };
}

function draftFromRow(row: Doc<'observation_records'>): ObservationDraft {
  return {
    draftId: String(row._id),
    organizationId: String(row.organizationId),
    teacherProfileId: String(row.teacherProfileId),
    observerAccountId: String(row.observerAccountId),
    observationType: row.observationType,
    schoolYear: row.schoolYear,
    sourceVersion: row.sourceVersion,
    frameworkVersion: row.frameworkVersion,
    observedAt: row.observedAt,
    status: 'draft',
    revision: row.revision,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    items: row.items as ObservationItem[],
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
    ...draftFromRow({ ...row, status: 'draft' }),
    observationId: String(row._id),
    status: 'submitted',
    submissionKey: row.submissionKey,
    submissionFingerprint: row.submissionFingerprint,
    submittedAt: row.submittedAt,
    publishedAt: row.publishedAt,
  };
}

function receiptFor(record: SubmittedObservation) {
  return {
    observationId: record.observationId,
    submissionKey: record.submissionKey,
    submittedAt: record.submittedAt,
    publishedAt: record.publishedAt,
    fingerprint: record.submissionFingerprint,
  };
}

async function readTeacherPriorityRows(
  ctx: DbCtx,
  organizationId: Id<'organizations'>,
  teacherProfileId: Id<'teacher_profiles'>,
  nowMs: number,
): Promise<PriorityProjection[]> {
  const [cards, proficiency] = await Promise.all([
    ctx.db.query('teacher_srs_cards')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', String(teacherProfileId)))
      .take(MAX_TEACHER_ROWS),
    ctx.db.query('teacher_proficiency')
      .withIndex('by_organizationId_and_teacherId', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherId', String(teacherProfileId)))
      .take(MAX_TEACHER_ROWS),
  ]);
  const { graph, skillIds, assignment } = await graphDetailsForTeacher(
    ctx,
    organizationId,
    teacherProfileId,
  );
  const priorities = projectTeacherPriority(
    String(teacherProfileId),
    cards.map((row) => row.card) as never,
    proficiency.map((row) => row.projection as Record<string, unknown>),
    graph,
    skillIds,
    nowMs,
  );
  return applyGbfPhasePriority({ assignment, priorities });
}

export async function refreshAttentionSummary(
  ctx: Pick<MutationCtx, 'db'>,
  organizationId: Id<'organizations'>,
  teacherProfileId: Id<'teacher_profiles'>,
  now: number,
) {
  const targets = await readTeacherPriorityRows(ctx, organizationId, teacherProfileId, now);
  const existing = await ctx.db.query('teacher_attention_summaries')
    .withIndex('by_organizationId_and_teacherProfileId', (query) => query
      .eq('organizationId', organizationId)
      .eq('teacherProfileId', teacherProfileId))
    .unique();
  const value = { organizationId, teacherProfileId, targets, updatedAt: now };
  if (existing) await ctx.db.patch(existing._id, value);
  else await ctx.db.insert('teacher_attention_summaries', value);
}

export const readRankedTeacherQueue = internalQuery({
  args: { actorAccountId: v.id('accounts'), now: v.string() },
  returns: queueResultValidator,
  handler: async (ctx, args) => {
    const now = Date.parse(args.now);
    if (!Number.isFinite(now)) return { kind: 'denied' as const, reason: 'invalid_now' };
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    const organization = await ctx.db.get(actor.organizationId);
    if (!organization?.isActive) return { kind: 'denied' as const, reason: 'organization_inactive' };
    const roles = await ctx.db.query('role_assignments')
      .withIndex('by_organizationId_and_accountId_and_status', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('accountId', actor._id)
        .eq('status', 'active'))
      .take(6);
    const supervisorRoles = roles
      .map((row) => row.role)
      .filter((role): role is DanielsonRole => (
        role === 'hod' || role === 'coach' || role === 'school_head' || role === 'slt'
      ));
    if (supervisorRoles.length === 0) {
      return { kind: 'denied' as const, reason: 'capability_not_granted' };
    }
    const [activePlans, gbfAssignments] = await Promise.all([
      readOrganizationActiveImprovementPlans(ctx, actor.organizationId, now),
      readOrganizationCurrentGbfAssignments(ctx, actor.organizationId),
    ]);
    if (activePlans.kind === 'capacity_exceeded' || gbfAssignments.kind === 'capacity_exceeded') {
      return { kind: 'queue_capacity_exceeded' as const };
    }
    const profiles = await ctx.db.query('teacher_profiles')
      .withIndex('by_organizationId_and_isActive', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('isActive', true))
      .take(MAX_QUEUE_TEACHERS + 1);
    if (profiles.length > MAX_QUEUE_TEACHERS) return { kind: 'queue_capacity_exceeded' as const };
    const [
      memberships,
      hodAssignments,
      coachAssignments,
      summaries,
      actorProfile,
      organizationAccounts,
      activeDepartments,
    ] = await Promise.all([
      ctx.db.query('department_memberships')
        .withIndex('by_organizationId_and_status', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('status', 'active'))
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
        .take(MAX_QUEUE_TEACHERS + 1),
      ctx.db.query('teacher_attention_summaries')
        .withIndex('by_organizationId', (query) => query.eq('organizationId', actor.organizationId))
        .take(MAX_QUEUE_TEACHERS + 1),
      ctx.db.query('teacher_profiles')
        .withIndex('by_accountId', (query) => query.eq('accountId', actor._id))
        .unique(),
      ctx.db.query('accounts')
        .withIndex('by_organizationId_and_isActive', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('isActive', true))
        .take(MAX_ORGANIZATION_ACCOUNTS + 1),
      ctx.db.query('departments')
        .withIndex('by_organizationId_and_isActive', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('isActive', true))
        .take(MAX_SCOPE_ROWS + 1),
    ]);
    if (
      memberships.length > MAX_SCOPE_ROWS
      || hodAssignments.length > MAX_SCOPE_ROWS
      || coachAssignments.length > MAX_QUEUE_TEACHERS
      || summaries.length > MAX_QUEUE_TEACHERS
      || organizationAccounts.length > MAX_ORGANIZATION_ACCOUNTS
      || activeDepartments.length > MAX_SCOPE_ROWS
    ) return { kind: 'queue_capacity_exceeded' as const };
    const activeDepartmentIds = new Set(activeDepartments.map((row) => String(row._id)));
    const membershipIds = new Map<string, string[]>();
    for (const membership of memberships) {
      if (!activeDepartmentIds.has(String(membership.departmentId))) continue;
      const key = String(membership.teacherProfileId);
      membershipIds.set(key, [...(membershipIds.get(key) ?? []), String(membership.departmentId)]);
    }
    const scoped = scopeTeacherCandidates(
      profiles.map((profile) => ({
        teacherProfileId: String(profile._id),
        organizationId: String(profile.organizationId),
        isActive: profile.isActive,
        departmentIds: membershipIds.get(String(profile._id)) ?? [],
      })),
      {
        actorAccountId: String(actor._id),
        actorTeacherProfileId: actorProfile ? String(actorProfile._id) : null,
        organizationId: String(actor.organizationId),
        roles: supervisorRoles,
        hodDepartmentIds: hodAssignments
          .map((row) => String(row.departmentId))
          .filter((departmentId) => activeDepartmentIds.has(departmentId)),
        coachTeacherProfileIds: coachAssignments.map((row) => String(row.teacherProfileId)),
      },
    );
    const summaryByTeacher = new Map(summaries.map((row) => [
      String(row.teacherProfileId),
      row.targets.map((target) => priorityAtClock(target, now)),
    ]));
    const accountById = new Map(organizationAccounts.map((account) => [String(account._id), account]));
    const { graph, skillIds } = graphDetails();
    const titleById = new Map(graph.nodes.map((node) => [node.id, node.title]));
    const candidates = scoped.flatMap((candidate) => {
      const profile = profiles.find((row) => String(row._id) === candidate.teacherProfileId);
      const account = profile ? accountById.get(String(profile.accountId)) : null;
      if (!account?.isActive) return [];
      const baseTargets = summaryByTeacher.get(candidate.teacherProfileId)
        ?? projectTeacherPriority(
          candidate.teacherProfileId,
          [],
          [],
          graph,
          skillIds,
          now,
        );
      const targets = applyPriorityOverlays({
        priorities: baseTargets,
        pipOverlays: activePlans.overlaysByTeacher.get(candidate.teacherProfileId) ?? new Map(),
        gbfAssignment: gbfAssignments.assignmentsByTeacher.get(candidate.teacherProfileId) ?? null,
        now,
      });
      return [{ teacherProfileId: candidate.teacherProfileId, displayName: account.displayName, targets }];
    });
    return {
      kind: 'allowed' as const,
      formalCandidates: candidates
        .map(({ teacherProfileId, displayName }) => ({ teacherProfileId, displayName }))
        .sort((left, right) => (
          left.displayName.localeCompare(right.displayName)
          || left.teacherProfileId.localeCompare(right.teacherProfileId)
        )),
      items: rankTeacherQueue(candidates).map((item) => {
        const selection = selectWalkthroughTargets(item.targets);
        return {
          teacherProfileId: item.teacherProfileId,
          displayName: item.displayName,
          reason: item.reason,
          eligibleTargetCount: item.eligibleTargetCount,
          requested: selection.requested,
          returned: selection.returned,
          shortfall: selection.shortfall,
          shortfallReason: selection.shortfallReason,
          targets: selection.targets.map((target) => ({
            ...target,
            skillTitle: titleById.get(target.skillId) ?? target.skillId,
            componentTitle: target.componentId
              ? titleById.get(target.componentId) ?? target.componentId
              : 'Danielson component',
          })),
        };
      }),
    };
  },
});

export const createObservationDraft = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    observationType: observationTypeValidator,
    schoolYear: v.string(),
    observedAt: v.string(),
    sourceVersion: v.string(),
    frameworkVersion: v.string(),
    componentIds: v.optional(v.array(v.string())),
    now: v.number(),
  },
  returns: createDraftResultValidator,
  handler: async (ctx, args) => {
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      args.teacherProfileId,
      actionFor(args.observationType, 'submit'),
    );
    if (access.kind === 'denied') return access;
    const { componentIds } = graphDetails();
    let items: ObservationItem[];
    let walkthroughSelection: ReturnType<typeof selectWalkthroughTargets> | null = null;
    if (args.observationType === 'walkthrough') {
      const priorities = await readTeacherPriorityRows(
        ctx,
        access.actor.organizationId,
        args.teacherProfileId,
        args.now,
      );
      const selected = selectWalkthroughTargets(priorities);
      if (selected.returned === 0) return { kind: 'no_eligible_targets' as const, ...selected };
      walkthroughSelection = selected;
      items = selected.targets.map((target) => ({
        itemId: target.skillId,
        skillId: target.skillId,
        componentId: target.componentId ?? '',
        priorityReason: target.reason,
        outcome: null,
        evidenceNote: null,
      }));
    } else {
      const requested = [...new Set(args.componentIds ?? [])];
      if (requested.length < 1 || requested.length > 22 || requested.some((id) => !componentIds.has(id))) {
        return { kind: 'invalid_components' as const };
      }
      items = requested.sort().map((componentId) => ({
        itemId: componentId,
        componentId,
        outcome: null,
        evidenceNote: null,
      }));
    }
    const provisional: ObservationDraft = {
      draftId: 'pending',
      organizationId: String(access.actor.organizationId),
      teacherProfileId: String(args.teacherProfileId),
      observerAccountId: String(args.actorAccountId),
      observationType: args.observationType,
      schoolYear: args.schoolYear,
      sourceVersion: args.sourceVersion,
      frameworkVersion: args.frameworkVersion,
      observedAt: args.observedAt,
      status: 'draft',
      revision: 1,
      createdAt: args.now,
      updatedAt: args.now,
      items,
    };
    const draft = normalizeObservationDraft(provisional);
    const id = await ctx.db.insert('observation_records', {
      organizationId: access.actor.organizationId,
      teacherProfileId: args.teacherProfileId,
      observerAccountId: args.actorAccountId,
      observationType: draft.observationType,
      schoolYear: draft.schoolYear,
      sourceVersion: draft.sourceVersion,
      frameworkVersion: draft.frameworkVersion,
      observedAt: draft.observedAt,
      status: 'draft',
      revision: 1,
      items: draft.items,
      createdAt: args.now,
      updatedAt: args.now,
    });
    return {
      kind: 'created' as const,
      draft: { ...draft, draftId: String(id) },
      ...(walkthroughSelection ? {
        requested: walkthroughSelection.requested,
        returned: walkthroughSelection.returned,
        shortfall: walkthroughSelection.shortfall,
        shortfallReason: walkthroughSelection.shortfallReason,
      } : {}),
    };
  },
});

export const saveObservationDraft = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    draftId: v.id('observation_records'),
    expectedRevision: v.number(),
    items: v.array(savedItemValidator),
    now: v.number(),
  },
  returns: saveDraftResultValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row) return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) return { kind: 'denied' as const, reason: 'target_out_of_scope' };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      row.teacherProfileId,
      actionFor(row.observationType, 'submit'),
    );
    if (access.kind === 'denied') return access;
    if (row.status !== 'draft') return { kind: 'submitted_immutable' as const };
    const result = saveDraftRecord(draftFromRow(row), args);
    if (result.kind !== 'saved') return result;
    await ctx.db.patch(row._id, {
      revision: result.draft.revision,
      updatedAt: result.draft.updatedAt,
      items: result.draft.items,
    });
    return result;
  },
});

export const readObservationDraft = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    draftId: v.id('observation_records'),
  },
  returns: readDraftResultValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row || row.status !== 'draft') return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) {
      return { kind: 'denied' as const, reason: 'target_out_of_scope' };
    }
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      row.teacherProfileId,
      actionFor(row.observationType, 'submit'),
    );
    if (access.kind === 'denied') return access;
    const { graph } = graphDetails();
    const titleById = new Map(graph.nodes.map((node) => [node.id, node.title]));
    return {
      kind: 'allowed' as const,
      draft: {
        ...draftFromRow(row),
        observationType: row.observationType,
        teacherDisplayName: access.subjectAccount.displayName,
        items: row.items.map((item) => ({
          ...item,
          skillTitle: item.skillId ? titleById.get(item.skillId) ?? item.skillId : undefined,
          componentTitle: titleById.get(item.componentId) ?? item.componentId,
        })),
      },
    };
  },
});

export const discardObservationDraft = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    draftId: v.id('observation_records'),
    expectedRevision: v.number(),
    confirmed: v.boolean(),
  },
  returns: discardDraftResultValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row || row.status !== 'draft') return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) {
      return { kind: 'denied' as const, reason: 'target_out_of_scope' };
    }
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      row.teacherProfileId,
      actionFor(row.observationType, 'submit'),
    );
    if (access.kind === 'denied') return access;
    const result = discardDraftRecord(draftFromRow(row), args);
    if (result.kind !== 'discarded') return result;
    await ctx.db.delete(row._id);
    return result;
  },
});

async function processSubmissionEvidence(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
  record: SubmittedObservation,
  now: number,
) {
  const graph = buildDanielsonGraph().graph;
  const port = createDanielsonTeacherProficiencyPort(ctx, organizationId);
  for (const command of buildObservationEvidenceCommands(record)) {
    const evidence = Object.fromEntries(
      Object.entries(command).filter(([field]) => field !== 'scoringEffect'),
    );
    const result = await processTeacherEvidence({
      evidence,
      graph,
      now: new Date(now).toISOString(),
      port,
    });
    if (result.kind === 'idempotency_conflict') throw new Error('idempotency_conflict');
  }
}

export const submitObservation = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    draftId: v.id('observation_records'),
    expectedRevision: v.number(),
    submissionKey: v.string(),
    now: v.number(),
  },
  returns: submissionResultValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row) return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) return { kind: 'denied' as const, reason: 'target_out_of_scope' };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      row.teacherProfileId,
      actionFor(row.observationType, 'submit'),
    );
    if (access.kind === 'denied') return access;
    if (row.status === 'submitted') {
      if (row.submissionKey !== args.submissionKey) return { kind: 'submitted_immutable' as const };
      const record = submittedFromRow(row);
      return { kind: 'replayed' as const, record, receipt: receiptFor(record) };
    }
    if (args.expectedRevision !== row.revision) {
      return { kind: 'revision_conflict' as const };
    }
    const candidate = submitObservationDraft(draftFromRow(row), {
      submissionKey: args.submissionKey,
      now: args.now,
    });
    if (candidate.kind !== 'submitted') return candidate;
    const existingKey = await ctx.db.query('observation_records')
      .withIndex('by_org_submission_key', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('submissionKey', args.submissionKey))
      .unique();
    if (existingKey) {
      const existingRecord = submittedFromRow(existingKey);
      if (existingRecord.submissionFingerprint !== candidate.record.submissionFingerprint) {
        return { kind: 'idempotency_conflict' as const };
      }
      return { kind: 'replayed' as const, record: existingRecord, receipt: receiptFor(existingRecord) };
    }
    const conflictingAmendmentKey = await ctx.db.query('observation_amendments')
      .withIndex('by_org_idempotency_key', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('idempotencyKey', args.submissionKey))
      .unique();
    if (conflictingAmendmentKey) return { kind: 'idempotency_conflict' as const };
    if (row.observationType !== 'walkthrough') {
      const existingFormal = await ctx.db.query('observation_records')
        .withIndex(
          'by_org_teacher_type_year_status',
          (query) => query
            .eq('organizationId', row.organizationId)
            .eq('teacherProfileId', row.teacherProfileId)
            .eq('observationType', row.observationType)
            .eq('schoolYear', row.schoolYear)
            .eq('status', 'submitted'),
        )
        .unique();
      if (existingFormal) return { kind: 'formal_observation_exists' as const };
    }
    const record = { ...candidate.record, observationId: String(row._id), draftId: String(row._id) };
    await processSubmissionEvidence(ctx, row.organizationId, record, args.now);
    await ctx.db.patch(row._id, {
      status: 'submitted',
      submissionKey: args.submissionKey,
      submissionFingerprint: record.submissionFingerprint,
      submittedAt: args.now,
      publishedAt: args.now,
      updatedAt: args.now,
    });
    await refreshAttentionSummary(ctx, row.organizationId, row.teacherProfileId, args.now);
    return { kind: 'submitted' as const, record, receipt: receiptFor(record) };
  },
});

export const readPublishedObservation = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    observationId: v.id('observation_records'),
  },
  returns: publishedObservationResultValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.observationId);
    if (!row || row.status !== 'submitted') return { kind: 'not_found' as const };
    const teacher = await ctx.db.get(row.teacherProfileId);
    if (!teacher) return { kind: 'not_found' as const };
    const action: DanielsonAction = teacher.accountId === args.actorAccountId
      ? 'published_record:read'
      : 'teacher_report:read';
    const access = await authorizeTeacher(ctx, args.actorAccountId, row.teacherProfileId, action);
    if (access.kind === 'denied') return access;
    const amendments = await ctx.db.query('observation_amendments')
      .withIndex('by_org_observation_version', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('observationId', row._id))
      .order('asc')
      .take(MAX_AMENDMENTS + 1);
    if (amendments.length > MAX_AMENDMENTS) {
      return { kind: 'history_capacity_exceeded' as const };
    }
    const original = submittedFromRow(row);
    const effective = projectEffectiveObservation(original, amendments.map(amendmentFromRow));
    const observer = await ctx.db.get(row.observerAccountId);
    return {
      kind: 'allowed' as const,
      record: effective,
      original,
      amendmentCount: amendments.length,
      isSelf: teacher.accountId === args.actorAccountId,
      teacherDisplayName: access.subjectAccount.displayName,
      observerDisplayName: observer?.displayName ?? 'Unknown observer',
    };
  },
});

export const listObservationAmendments = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    observationId: v.id('observation_records'),
    paginationOpts: paginationOptsValidator,
  },
  returns: amendmentHistoryResultValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.observationId);
    if (!row || row.status !== 'submitted') return { kind: 'not_found' as const };
    const teacher = await ctx.db.get(row.teacherProfileId);
    if (!teacher) return { kind: 'not_found' as const };
    const action: DanielsonAction = teacher.accountId === args.actorAccountId
      ? 'published_record:read'
      : 'teacher_report:read';
    const access = await authorizeTeacher(ctx, args.actorAccountId, row.teacherProfileId, action);
    if (access.kind === 'denied') return access;
    const page = await ctx.db.query('observation_amendments')
      .withIndex('by_org_observation_version', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('observationId', row._id))
      .order('desc')
      .paginate(args.paginationOpts);
    const items = await Promise.all(page.page.map(async (amendment) => {
      const author = await ctx.db.get(amendment.authorAccountId);
      return {
        ...amendmentFromRow(amendment),
        authorDisplayName: author?.displayName ?? 'Unknown author',
      };
    }));
    return { kind: 'allowed' as const, page: { ...page, page: items } };
  },
});

export const listMyObservationDrafts = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
  },
  returns: draftListResultValidator,
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    const page = await ctx.db.query('observation_records')
      .withIndex('by_org_observer_status', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('observerAccountId', actor._id)
        .eq('status', 'draft'))
      .order('desc')
      .paginate(args.paginationOpts);
    const accessDecisions = await Promise.all(page.page.map((row) => authorizeTeacher(
      ctx,
      args.actorAccountId,
      row.teacherProfileId,
      actionFor(row.observationType, 'submit'),
    )));
    const accessibleRows = page.page.filter((_, index) => accessDecisions[index].kind === 'allowed');
    const [accounts, profiles] = await Promise.all([
      ctx.db.query('accounts')
        .withIndex('by_organizationId_and_isActive', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('isActive', true))
        .take(MAX_ORGANIZATION_ACCOUNTS + 1),
      ctx.db.query('teacher_profiles')
        .withIndex('by_organizationId_and_isActive', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('isActive', true))
        .take(MAX_QUEUE_TEACHERS + 1),
    ]);
    if (accounts.length > MAX_ORGANIZATION_ACCOUNTS || profiles.length > MAX_QUEUE_TEACHERS) {
      return { kind: 'queue_capacity_exceeded' as const };
    }
    const accountById = new Map(accounts.map((account) => [String(account._id), account]));
    const profileById = new Map(profiles.map((profile) => [String(profile._id), profile]));
    const items = accessibleRows.map((row) => {
      const teacher = profileById.get(String(row.teacherProfileId));
      const account = teacher ? accountById.get(String(teacher.accountId)) : null;
      return {
        draftId: String(row._id),
        observationType: row.observationType,
        teacherDisplayName: account?.displayName ?? 'Unknown teacher',
        observedAt: row.observedAt,
        updatedAt: row.updatedAt,
        revision: row.revision,
      };
    });
    return { kind: 'allowed' as const, page: { ...page, page: items } };
  },
});

export const listMyPublishedObservations = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
  },
  returns: publishedListResultValidator,
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    const teacher = await ctx.db.query('teacher_profiles')
      .withIndex('by_accountId', (query) => query.eq('accountId', actor._id))
      .unique();
    if (!teacher?.isActive) return { kind: 'allowed' as const, page: { page: [], isDone: true, continueCursor: '' } };
    const access = await authorizeTeacher(ctx, actor._id, teacher._id, 'published_record:read');
    if (access.kind === 'denied') return access;
    const page = await ctx.db.query('observation_records')
      .withIndex('by_org_teacher_status_submitted', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('teacherProfileId', teacher._id)
        .eq('status', 'submitted'))
      .order('desc')
      .paginate(args.paginationOpts);
    const items = await Promise.all(page.page.map(async (row) => {
      const observer = await ctx.db.get(row.observerAccountId);
      return {
        observationId: String(row._id),
        observationType: row.observationType,
        observedAt: row.observedAt,
        publishedAt: row.publishedAt,
        observerDisplayName: observer?.displayName ?? 'Unknown observer',
      };
    }));
    return { kind: 'allowed' as const, page: { ...page, page: items } };
  },
});

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

function reviewPayload(raw: Record<string, unknown>) {
  return {
    reviewId: String(raw.reviewId),
    cardId: String(raw.cardId),
    studentId: String(raw.studentId),
    rating: raw.rating,
    submissionId: String(raw.submissionId),
    paramsVersion: String(raw.paramsVersion),
    reviewedAt: String(raw.reviewedAt),
    evidence: raw.evidence,
    stateBefore: raw.stateBefore,
    stateAfter: raw.stateAfter,
  };
}

function reviewTransitionPayload(raw: Record<string, unknown>) {
  const payload = reviewPayload(raw);
  return {
    cardId: payload.cardId,
    studentId: payload.studentId,
    rating: payload.rating,
    submissionId: payload.submissionId,
    paramsVersion: payload.paramsVersion,
    reviewedAt: payload.reviewedAt,
    evidence: payload.evidence,
    stateBefore: payload.stateBefore,
    stateAfter: payload.stateAfter,
  };
}

function reviewTargetsAffectedSkill(logicalReviewId: string, affected: Set<string>): boolean {
  return [...affected].some((skillId) => logicalReviewId.endsWith(`:${skillId}`));
}

async function insertReviewRow(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
  teacherId: string,
  raw: Record<string, unknown>,
  now: number,
  correctionKey?: string,
) {
  const logicalReviewId = String(raw.logicalReviewId ?? raw.reviewId);
  const reviewId = correctionKey ? `${logicalReviewId}:correction:${correctionKey}` : String(raw.reviewId);
  const payload = { ...reviewPayload(raw), reviewId } as never;
  await ctx.db.insert('teacher_srs_reviews', {
    organizationId,
    teacherId,
    cardId: String(raw.cardId),
    reviewId,
    logicalReviewId,
    isCorrection: correctionKey !== undefined,
    ...(correctionKey ? { correctionIdempotencyKey: correctionKey } : {}),
    sourceRecordId: String(raw.submissionId),
    reviewedAt: String(raw.reviewedAt),
    review: payload,
    createdAt: now,
  });
}

async function reconcileBySkill(
  ctx: MutationCtx,
  organizationId: Id<'organizations'>,
  teacherId: string,
  affected: Set<string>,
  replay: Awaited<ReturnType<typeof replayTeacherEvidence>>,
  now: number,
  correctionKey: string,
) {
  const graph = buildDanielsonGraph().graph;
  const [cards, proficiency, states, priorities, reviews] = await Promise.all([
    ctx.db.query('teacher_srs_cards').withIndex('by_organizationId_and_teacherId', (q) => q
      .eq('organizationId', organizationId).eq('teacherId', teacherId)).take(MAX_TEACHER_ROWS),
    ctx.db.query('teacher_proficiency').withIndex('by_organizationId_and_teacherId', (q) => q
      .eq('organizationId', organizationId).eq('teacherId', teacherId)).take(MAX_TEACHER_ROWS),
    ctx.db.query('teacher_knowledge_state').withIndex('by_organizationId_and_teacherId', (q) => q
      .eq('organizationId', organizationId).eq('teacherId', teacherId)).take(MAX_TEACHER_ROWS),
    ctx.db.query('teacher_priority').withIndex('by_organizationId_and_teacherId', (q) => q
      .eq('organizationId', organizationId).eq('teacherId', teacherId)).take(MAX_TEACHER_ROWS),
    ctx.db.query('teacher_srs_reviews').withIndex('by_organizationId_and_teacherId_and_reviewedAt', (q) => q
      .eq('organizationId', organizationId).eq('teacherId', teacherId)).take(MAX_HISTORY_ROWS + 1),
  ]);
  if (reviews.length > MAX_HISTORY_ROWS) throw new Error('correction_history_capacity_exceeded');
  const desiredCards = new Map(replay.state.cards
    .filter((row) => affected.has(String(row.objectiveId)))
    .map((row) => [String(row.objectiveId), row]));
  const desiredProficiency = new Map(replay.state.proficiency
    .filter((row) => affected.has(String(row.skillId)))
    .map((row) => [String(row.skillId), row]));
  const desiredStates = new Map(replay.state.knowledgeState
    .filter((row) => affected.has(String(row.nodeId)))
    .map((row) => [String(row.nodeId), row]));
  for (const row of cards.filter((item) => affected.has(item.skillId))) {
    const desired = desiredCards.get(row.skillId);
    if (!desired) await ctx.db.delete(row._id);
    else await ctx.db.patch(row._id, { card: desired as never, variantKey: row.skillId, updatedAt: now });
    desiredCards.delete(row.skillId);
  }
  for (const [skillId, card] of desiredCards) {
    await ctx.db.insert('teacher_srs_cards', {
      organizationId, teacherId, skillId, variantKey: skillId, card: card as never, updatedAt: now,
    });
  }
  for (const row of proficiency.filter((item) => affected.has(item.skillId))) {
    const desired = desiredProficiency.get(row.skillId);
    if (!desired) await ctx.db.delete(row._id);
    else await ctx.db.patch(row._id, { projection: desired as never, updatedAt: now });
    desiredProficiency.delete(row.skillId);
  }
  for (const [skillId, projection] of desiredProficiency) {
    await ctx.db.insert('teacher_proficiency', {
      organizationId, teacherId, skillId, projection: projection as never, updatedAt: now,
    });
  }
  for (const row of states.filter((item) => affected.has(item.nodeId))) {
    const desired = desiredStates.get(row.nodeId);
    if (!desired) await ctx.db.delete(row._id);
    else await ctx.db.patch(row._id, { state: desired as never, updatedAt: now });
    desiredStates.delete(row.nodeId);
  }
  for (const [nodeId, state] of desiredStates) {
    await ctx.db.insert('teacher_knowledge_state', {
      organizationId, teacherId, nodeId, state: state as never, updatedAt: now,
    });
  }
  const allCards = replay.state.cards as never;
  const desiredPriority = new Map(projectTeacherPriority(
    teacherId,
    allCards,
    replay.state.proficiency,
    graph,
    [...affected],
    now,
  ).map((row) => [row.skillId, row]));
  for (const row of priorities.filter((item) => affected.has(item.skillId))) {
    const desired = desiredPriority.get(row.skillId);
    if (!desired) await ctx.db.delete(row._id);
    else await ctx.db.patch(row._id, { projection: desired, updatedAt: now });
    desiredPriority.delete(row.skillId);
  }
  for (const [skillId, projection] of desiredPriority) {
    await ctx.db.insert('teacher_priority', {
      organizationId, teacherId, skillId, projection, updatedAt: now,
    });
  }
  const latestReviews = new Map<string, Doc<'teacher_srs_reviews'>>();
  for (const row of reviews) {
    if (reviewTargetsAffectedSkill(row.logicalReviewId, affected)) {
      latestReviews.set(row.logicalReviewId, row);
    }
  }
  for (const raw of replay.state.reviews) {
    const logicalId = String(raw.logicalReviewId ?? raw.reviewId);
    if (!reviewTargetsAffectedSkill(logicalId, affected)) continue;
    const existing = latestReviews.get(logicalId);
    if (!existing) await insertReviewRow(ctx, organizationId, teacherId, raw, now);
    else if (JSON.stringify(reviewTransitionPayload(existing.review)) !== JSON.stringify(reviewTransitionPayload(raw))) {
      await insertReviewRow(ctx, organizationId, teacherId, raw, now, correctionKey);
    }
  }
}

export const amendObservation = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    observationId: v.id('observation_records'),
    idempotencyKey: v.string(),
    expectedVersion: v.number(),
    reason: v.string(),
    changedItems: v.array(changedItemValidator),
    now: v.number(),
  },
  returns: amendmentMutationResultValidator,
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.observationId);
    if (!row || row.status !== 'submitted') return { kind: 'not_found' as const };
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      row.teacherProfileId,
      actionFor(row.observationType, 'amend'),
    );
    if (access.kind === 'denied') return access;
    const existingIdempotencyKey = await ctx.db.query('observation_amendments')
      .withIndex('by_org_idempotency_key', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('idempotencyKey', args.idempotencyKey))
      .unique();
    if (existingIdempotencyKey && existingIdempotencyKey.observationId !== row._id) {
      return { kind: 'idempotency_conflict' as const };
    }
    if (!existingIdempotencyKey) {
      const conflictingSubmissionKey = await ctx.db.query('observation_records')
        .withIndex('by_org_submission_key', (query) => query
          .eq('organizationId', row.organizationId)
          .eq('submissionKey', args.idempotencyKey))
        .unique();
      if (conflictingSubmissionKey) return { kind: 'idempotency_conflict' as const };
    }
    const priorRows = await ctx.db.query('observation_amendments')
      .withIndex('by_org_observation_version', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('observationId', row._id))
      .order('asc')
      .take(MAX_AMENDMENTS + 1);
    if (
      priorRows.length > MAX_AMENDMENTS
      || (priorRows.length === MAX_AMENDMENTS && !existingIdempotencyKey)
    ) return { kind: 'correction_history_capacity_exceeded' as const };
    const prior = priorRows.map(amendmentFromRow);
    const original = submittedFromRow(row);
    const applied = applyObservationAmendment({
      original,
      priorAmendments: prior,
      command: {
        idempotencyKey: args.idempotencyKey,
        expectedVersion: args.expectedVersion,
        authorAccountId: String(args.actorAccountId),
        reason: args.reason,
        changedItems: args.changedItems,
      },
      now: args.now,
    });
    if (applied.kind !== 'amended') return applied;
    const outcomeRows = await ctx.db.query('teacher_observation_outcomes')
      .withIndex('by_organizationId_and_teacherId_and_occurredAt', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('teacherId', String(row.teacherProfileId)))
      .order('asc')
      .take(MAX_HISTORY_ROWS + 1);
    const existingSupersessions = await ctx.db.query('teacher_evidence_supersessions')
      .withIndex('by_org_teacher_occurred', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('teacherProfileId', row.teacherProfileId))
      .order('asc')
      .take(MAX_HISTORY_ROWS + 1);
    const scoringGrowth = applied.supersessions.length;
    if (
      outcomeRows.length + scoringGrowth > MAX_HISTORY_ROWS
      || existingSupersessions.length + scoringGrowth > MAX_HISTORY_ROWS
    ) {
      return { kind: 'correction_history_capacity_exceeded' as const };
    }
    const amendmentId = await ctx.db.insert('observation_amendments', {
      organizationId: row.organizationId,
      observationId: row._id,
      teacherProfileId: row.teacherProfileId,
      authorAccountId: args.actorAccountId,
      idempotencyKey: applied.amendment.idempotencyKey,
      fingerprint: applied.amendment.fingerprint,
      version: applied.amendment.version,
      reason: applied.amendment.reason,
      changedItems: applied.amendment.changedItems,
      occurredAt: applied.amendment.occurredAt,
    });
    const insertedSupersessions = [];
    for (const supersession of applied.supersessions) {
      const id = await ctx.db.insert('teacher_evidence_supersessions', {
        organizationId: row.organizationId,
        teacherProfileId: row.teacherProfileId,
        observationId: row._id,
        amendmentId,
        itemId: supersession.itemId,
        supersededEvidenceKey: supersession.supersededEvidenceKey,
        replacementEvidenceKey: supersession.replacementEvidenceKey,
        replacementOutcome: supersession.replacementOutcome,
        occurredAt: args.now,
      });
      insertedSupersessions.push({
        ...supersession,
        supersessionId: String(id),
        amendmentId: String(amendmentId),
        _id: id,
      });
    }
    if (applied.supersessions.length > 0) {
      const effective = projectEffectiveObservation(original, [...prior, applied.amendment]);
      const changedIds = new Set(applied.supersessions.map((item) => item.itemId));
      const replacementRecord: SubmittedObservation = {
        ...effective,
        submissionKey: args.idempotencyKey,
        items: effective.items.filter((item) => changedIds.has(item.itemId)),
      };
      const replacementCommands = buildObservationEvidenceCommands(replacementRecord);
      const allSupersessions = [...existingSupersessions, ...insertedSupersessions];
      const excluded = new Set(allSupersessions.map((item) => item.supersededEvidenceKey));
      const activeEvidence = outcomeRows
        .filter((outcome) => !excluded.has(outcome.idempotencyKey))
        .map((outcome) => outcome.outcome);
      const graph = buildDanielsonGraph().graph;
      const replay = await replayTeacherEvidence({
        teacherId: String(row.teacherProfileId),
        evidence: [...activeEvidence, ...replacementCommands],
        graph,
        now: new Date(args.now).toISOString(),
      });
      const replacementKeys = new Set(replacementCommands.map((command) => command.idempotencyKey));
      for (const commit of replay.commits.filter((item) => replacementKeys.has(item.idempotency.key))) {
        const outcomeId = `teacher_observation_outcomes:${commit.teacherId}:${commit.idempotency.key}`;
        await ctx.db.insert('teacher_proficiency_idempotency', {
          organizationId: row.organizationId,
          teacherId: commit.teacherId,
          idempotencyKey: commit.idempotency.key,
          fingerprint: commit.idempotency.fingerprint,
          result: commit.idempotency.result,
          outcomeId,
          createdAt: args.now,
        });
        await ctx.db.insert('teacher_observation_outcomes', {
          organizationId: row.organizationId,
          teacherId: commit.teacherId,
          idempotencyKey: commit.idempotency.key,
          outcome: commit.outcome as never,
          occurredAt: Date.parse(String(commit.outcome.occurredAt)),
          createdAt: args.now,
        });
      }
      const affected = new Set<string>();
      for (const supersession of applied.supersessions) {
        const source = original.items.find((item) => item.itemId === supersession.itemId);
        if (!source) continue;
        if (original.observationType === 'walkthrough' && source.skillId) affected.add(source.skillId);
        if (original.observationType === 'formal_q1') {
          for (const skillId of getComponentSkillIds(graph, source.componentId)) {
            affected.add(skillId);
          }
        }
      }
      await reconcileBySkill(
        ctx,
        row.organizationId,
        String(row.teacherProfileId),
        affected,
        replay,
        args.now,
        args.idempotencyKey,
      );
      await refreshAttentionSummary(ctx, row.organizationId, row.teacherProfileId, args.now);
    }
    return {
      kind: 'amended' as const,
      amendment: { ...applied.amendment, amendmentId: String(amendmentId) },
      supersessions: insertedSupersessions.map((supersession) => ({
        supersessionId: supersession.supersessionId,
        observationId: supersession.observationId,
        amendmentId: supersession.amendmentId,
        teacherProfileId: supersession.teacherProfileId,
        itemId: supersession.itemId,
        supersededEvidenceKey: supersession.supersededEvidenceKey,
        replacementEvidenceKey: supersession.replacementEvidenceKey,
        replacementOutcome: supersession.replacementOutcome,
        occurredAt: supersession.occurredAt,
      })),
      receipt: { amendmentId: String(amendmentId), version: applied.amendment.version },
    };
  },
});
