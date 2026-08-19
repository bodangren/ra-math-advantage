import { paginationOptsValidator, paginationResultValidator } from 'convex/server';
import { v } from 'convex/values';

import { internalMutation, internalQuery, type MutationCtx, type QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { resolveAccessContextForDb } from './foundation';
import {
  authorizeDanielsonAction,
  type DanielsonAction,
} from '../lib/foundation/authorization';
import {
  normalizePipProposal,
  projectExpectedTarget,
  validatePipTargets,
} from '../lib/improvement-plans/contracts';
import { projectImprovementPlanProgress } from '../lib/improvement-plans/progress';
import { buildDanielsonGraph } from '../lib/proficiency/graph';

const MAX_TARGETS = 63;
const MAX_EVIDENCE_ROWS = 2_000;
const MAX_PAGE_SIZE = 50;
const DAY_MS = 86_400_000;

const graph = buildDanielsonGraph().graph;
const nodeById = new Map(graph.nodes.map((node) => [node.id, node]));

const deniedValidator = v.object({ kind: v.literal('denied'), reason: v.string() });
const sourceRefValidator = v.object({
  source: v.string(),
  location: v.optional(v.string()),
});
const targetArgValidator = v.object({
  componentId: v.string(),
  skillId: v.string(),
  expectedRating: v.number(),
});
const targetViewValidator = v.object({
  targetId: v.string(),
  componentId: v.string(),
  componentTitle: v.string(),
  skillId: v.string(),
  skillTitle: v.string(),
  expectedRating: v.number(),
  expectedPoints: v.number(),
  componentSourceRefs: v.array(sourceRefValidator),
  skillSourceRefs: v.array(sourceRefValidator),
});
const versionViewValidator = v.object({
  versionId: v.string(),
  version: v.number(),
  teacherName: v.string(),
  position: v.string(),
  departmentId: v.string(),
  departmentName: v.string(),
  supervisorAccountId: v.string(),
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
  sourceHash: v.string(),
  proposedAt: v.number(),
  targets: v.array(targetViewValidator),
});
const acknowledgmentViewValidator = v.object({
  acknowledgmentId: v.string(),
  kind: v.union(v.literal('teacher'), v.literal('supervisor')),
  actorAccountId: v.string(),
  acknowledgedAt: v.number(),
});
const targetProgressValidator = v.object({
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
const noImprovementPlanValidator = v.object({
  contractVersion: v.literal('danielson.ip-progress.v1'),
  state: v.literal('not_configured'),
});
const pendingImprovementPlanValidator = v.object({
  contractVersion: v.literal('danielson.ip-progress.v1'),
  state: v.literal('pending_approval'),
  planId: v.optional(v.string()),
});
const activeImprovementPlanValidator = v.object({
  contractVersion: v.literal('danielson.ip-progress.v1'),
  state: v.literal('active'),
  planId: v.string(),
  version: v.number(),
  daysRemaining: v.number(),
  trackState: v.union(v.literal('on_track'), v.literal('off_track')),
  targets: v.array(targetProgressValidator),
  schoolSupport: v.optional(v.string()),
  successfulCompletionCriteria: v.optional(v.string()),
});
const closedImprovementPlanValidator = v.object({
  contractVersion: v.literal('danielson.ip-progress.v1'),
  state: v.literal('closed'),
  planId: v.string(),
  version: v.number(),
  daysRemaining: v.number(),
  outcome: v.union(v.literal('successful'), v.literal('insufficient_improvement')),
  closedAt: v.number(),
  targets: v.array(targetProgressValidator),
  schoolSupport: v.optional(v.string()),
  successfulCompletionCriteria: v.optional(v.string()),
});
export const publicImprovementPlanProgressValidator = v.union(
  noImprovementPlanValidator,
  pendingImprovementPlanValidator,
  activeImprovementPlanValidator,
  closedImprovementPlanValidator,
);
export const improvementPlanProgressValidator = v.union(
  noImprovementPlanValidator,
  pendingImprovementPlanValidator,
  activeImprovementPlanValidator,
  v.object({
    contractVersion: v.literal('danielson.ip-progress.v1'),
    state: v.literal('closed'),
    planId: v.string(),
    version: v.number(),
    daysRemaining: v.number(),
    outcome: v.union(v.literal('successful'), v.literal('insufficient_improvement')),
    closedAt: v.number(),
    targets: v.array(targetProgressValidator),
    schoolSupport: v.optional(v.string()),
    successfulCompletionCriteria: v.optional(v.string()),
    closureNote: v.optional(v.string()),
  }),
);
const proposalWorkspaceValidator = v.object({
  kind: v.literal('allowed'),
  teacher: v.object({
    teacherProfileId: v.string(),
    displayName: v.string(),
    position: v.string(),
  }),
  departments: v.array(v.object({ departmentId: v.string(), departmentName: v.string() })),
  targetOptions: v.array(v.object({
    componentId: v.string(),
    componentTitle: v.string(),
    skillId: v.string(),
    skillTitle: v.string(),
  })),
});
const proposalResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('invalid'), reason: v.string() }),
  v.object({ kind: v.literal('revision_conflict') }),
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({ kind: v.literal('open_plan_exists') }),
  v.object({
    kind: v.union(v.literal('proposed'), v.literal('replayed')),
    planId: v.string(),
    versionId: v.string(),
    revision: v.number(),
    version: v.number(),
  }),
);
const approvalResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('invalid'), reason: v.string() }),
  v.object({ kind: v.literal('revision_conflict') }),
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({
    kind: v.union(v.literal('approved'), v.literal('replayed')),
    planId: v.string(),
    versionId: v.string(),
    revision: v.number(),
    planStartAt: v.number(),
    planEndAt: v.number(),
  }),
);
const acknowledgmentResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('acknowledgment_exists') }),
  v.object({ kind: v.literal('revision_conflict') }),
  v.object({ kind: v.literal('invalid'), reason: v.string() }),
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({
    kind: v.union(v.literal('acknowledged'), v.literal('replayed')),
    acknowledgmentId: v.string(),
    acknowledgmentKind: v.union(v.literal('teacher'), v.literal('supervisor')),
  }),
);
const lifecycleHistoryEventValidator = v.object({
  eventId: v.string(),
  kind: v.union(
    v.literal('proposed'),
    v.literal('approved'),
    v.literal('teacher_acknowledged'),
    v.literal('supervisor_acknowledged'),
    v.literal('closed'),
  ),
  version: v.number(),
  versionId: v.union(v.string(), v.null()),
  occurredAt: v.number(),
  payload: v.object({
    outcome: v.optional(v.union(v.literal('successful'), v.literal('insufficient_improvement'))),
    note: v.optional(v.string()),
  }),
});
const priorApprovedVersionValidator = v.object({
  version: v.number(),
  versionId: v.string(),
  purpose: v.string(),
});
const planHistoryValidator = v.object({
  events: v.array(lifecycleHistoryEventValidator),
  priorApprovedVersions: v.array(priorApprovedVersionValidator),
});
const planViewValidator = v.object({
  planId: v.string(),
  teacherProfileId: v.string(),
  state: v.union(v.literal('proposed'), v.literal('active'), v.literal('closed')),
  revision: v.number(),
  activeVersion: v.union(versionViewValidator, v.null()),
  pendingVersion: v.union(versionViewValidator, v.null()),
  approvedAt: v.union(v.number(), v.null()),
  planEndAt: v.union(v.number(), v.null()),
  reviewMeetingAt: v.union(v.number(), v.null()),
  closedAt: v.union(v.number(), v.null()),
  closureOutcome: v.union(
    v.literal('successful'),
    v.literal('insufficient_improvement'),
    v.null(),
  ),
  closureNote: v.union(v.string(), v.null()),
  approvalEventId: v.union(v.string(), v.null()),
  closureEventId: v.union(v.string(), v.null()),
  history: planHistoryValidator,
  acknowledgments: v.array(acknowledgmentViewValidator),
});
const historyResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('invalid_page_size') }),
  v.object({ kind: v.literal('capacity_exceeded') }),
  v.object({
    kind: v.literal('allowed'),
    page: paginationResultValidator(lifecycleHistoryEventValidator),
    priorApprovedVersions: v.array(priorApprovedVersionValidator),
  }),
);
const closureResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('not_found') }),
  v.object({ kind: v.literal('invalid'), reason: v.string() }),
  v.object({ kind: v.literal('revision_conflict') }),
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({ kind: v.literal('evidence_capacity_exceeded') }),
  v.object({
    kind: v.union(v.literal('closed'), v.literal('replayed')),
    planId: v.string(),
    revision: v.number(),
    outcome: v.union(v.literal('successful'), v.literal('insufficient_improvement')),
  }),
);

type DbCtx = Pick<QueryCtx, 'db'> | Pick<MutationCtx, 'db'>;

async function authorizeTeacher(
  ctx: DbCtx,
  actorAccountId: Id<'accounts'>,
  teacherProfileId: Id<'teacher_profiles'>,
  action: DanielsonAction,
) {
  const teacher = await ctx.db.get(teacherProfileId);
  if (!teacher?.isActive) return { kind: 'denied' as const, reason: 'target_inactive' };
  const context = await resolveAccessContextForDb(ctx as Pick<QueryCtx, 'db'>, {
    actorAccountId,
    subjectAccountId: teacher.accountId,
  });
  const decision = authorizeDanielsonAction(context, action);
  if (!decision.allowed) return { kind: 'denied' as const, reason: decision.reason };
  const [teacherAccount, actorAccount] = await Promise.all([
    ctx.db.get(teacher.accountId),
    ctx.db.get(actorAccountId),
  ]);
  if (!teacherAccount?.isActive) return { kind: 'denied' as const, reason: 'target_inactive' };
  if (!actorAccount?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
  return { kind: 'allowed' as const, teacher, teacherAccount, actorAccount };
}

async function openPlan(ctx: DbCtx, organizationId: Id<'organizations'>, teacherProfileId: Id<'teacher_profiles'>) {
  const [active, proposed] = await Promise.all([
    ctx.db.query('improvement_plans')
      .withIndex('by_org_teacher_state', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherProfileId', teacherProfileId)
        .eq('state', 'active'))
      .unique(),
    ctx.db.query('improvement_plans')
      .withIndex('by_org_teacher_state', (query) => query
        .eq('organizationId', organizationId)
        .eq('teacherProfileId', teacherProfileId)
        .eq('state', 'proposed'))
      .unique(),
  ]);
  if (active && proposed) throw new Error('open_plan_invariant');
  return active ?? proposed;
}

async function currentOrLatestPlan(
  ctx: DbCtx,
  organizationId: Id<'organizations'>,
  teacherProfileId: Id<'teacher_profiles'>,
) {
  const current = await openPlan(ctx, organizationId, teacherProfileId);
  if (current) return current;
  return ctx.db.query('improvement_plans')
    .withIndex('by_org_teacher_state', (query) => query
      .eq('organizationId', organizationId)
      .eq('teacherProfileId', teacherProfileId)
      .eq('state', 'closed'))
    .order('desc')
    .first();
}

function proposalContentFingerprint(value: unknown) {
  return JSON.stringify(value);
}

function validRequestId(value: string) {
  return value.trim().length > 0 && value.length <= 128;
}

async function priorEvent(ctx: DbCtx, organizationId: Id<'organizations'>, requestId: string) {
  return ctx.db.query('improvement_plan_events')
    .withIndex('by_org_request', (query) => query
      .eq('organizationId', organizationId)
      .eq('requestId', requestId))
    .unique();
}

function proposalReceipt(event: Doc<'improvement_plan_events'>) {
  return {
    kind: 'replayed' as const,
    planId: String(event.planId),
    versionId: String(event.versionId),
    revision: event.revision,
    version: event.version,
  };
}

async function readTargets(
  ctx: DbCtx,
  organizationId: Id<'organizations'>,
  versionId: Id<'improvement_plan_versions'>,
) {
  return ctx.db.query('improvement_plan_targets')
    .withIndex('by_org_version_ordinal', (query) => query
      .eq('organizationId', organizationId)
      .eq('versionId', versionId))
    .order('asc')
    .take(MAX_TARGETS + 1);
}

function targetView(row: Doc<'improvement_plan_targets'>) {
  return {
    targetId: String(row._id),
    componentId: row.componentId,
    componentTitle: row.componentTitle,
    skillId: row.skillId,
    skillTitle: row.skillTitle,
    expectedRating: row.expectedRating,
    expectedPoints: row.expectedPoints,
    componentSourceRefs: row.componentSourceRefs ?? [],
    skillSourceRefs: row.skillSourceRefs ?? [],
  };
}

async function versionView(
  ctx: DbCtx,
  version: Doc<'improvement_plan_versions'> | null,
) {
  if (!version) return null;
  const targets = await readTargets(ctx, version.organizationId, version._id);
  if (targets.length > MAX_TARGETS) throw new Error('target_capacity_exceeded');
  return {
    versionId: String(version._id),
    version: version.version,
    teacherName: version.teacherName,
    position: version.position,
    departmentId: String(version.departmentId),
    departmentName: version.departmentName,
    supervisorAccountId: String(version.supervisorAccountId),
    supervisorName: version.supervisorName,
    requestedPlanEndDate: version.requestedPlanEndDate,
    reviewMeetingDate: version.reviewMeetingDate,
    purpose: version.purpose,
    areasOfConcern: version.areasOfConcern,
    expectedStandard: version.expectedStandard,
    requiredActions: version.requiredActions,
    evidenceOfImprovement: version.evidenceOfImprovement,
    schoolSupport: version.schoolSupport,
    successfulCompletionCriteria: version.successfulCompletionCriteria,
    insufficientImprovementConsequences: version.insufficientImprovementConsequences,
    acknowledgmentText: version.acknowledgmentText,
    sourceId: version.sourceId,
    sourceVersion: version.sourceVersion,
    sourceHash: version.sourceHash,
    proposedAt: version.proposedAt,
    targets: targets.map(targetView),
  };
}

async function planHistoryView(
  ctx: DbCtx,
  plan: Doc<'improvement_plans'>,
  includePrivate: boolean,
) {
  const [events, versions] = await Promise.all([
    ctx.db.query('improvement_plan_events')
      .withIndex('by_org_plan_time', (query) => query
        .eq('organizationId', plan.organizationId)
        .eq('planId', plan._id))
      .order('desc')
      .take(MAX_EVIDENCE_ROWS + 1),
    ctx.db.query('improvement_plan_versions')
      .withIndex('by_org_plan_version', (query) => query
        .eq('organizationId', plan.organizationId)
        .eq('planId', plan._id))
      .order('asc')
      .take(MAX_TARGETS + 1),
  ]);
  if (events.length > MAX_EVIDENCE_ROWS || versions.length > MAX_TARGETS) {
    throw new Error('history_capacity_exceeded');
  }
  return {
    events: events.map((event) => ({
      eventId: String(event._id),
      kind: event.kind,
      version: event.version,
      versionId: event.versionId ? String(event.versionId) : null,
      occurredAt: event.occurredAt,
      payload: {
        ...(event.payload.outcome ? { outcome: event.payload.outcome } : {}),
        ...(includePrivate && event.payload.note ? { note: event.payload.note } : {}),
      },
    })),
    priorApprovedVersions: versions
      .filter((version) => version.version < (plan.activeVersion ?? Number.POSITIVE_INFINITY))
      .map((version) => ({
        version: version.version,
        versionId: String(version._id),
        purpose: version.purpose,
      })),
  };
}

async function readPlanView(ctx: DbCtx, plan: Doc<'improvement_plans'>, includePending: boolean) {
  const [activeVersion, pendingVersion, acknowledgments, history] = await Promise.all([
    plan.activeVersionId ? ctx.db.get(plan.activeVersionId) : Promise.resolve(null),
    includePending && plan.pendingVersionId
      ? ctx.db.get(plan.pendingVersionId)
      : Promise.resolve(null),
    plan.activeVersionId
      ? ctx.db.query('improvement_plan_acknowledgments')
          .withIndex('by_org_version_kind', (query) => query
            .eq('organizationId', plan.organizationId)
            .eq('versionId', plan.activeVersionId as Id<'improvement_plan_versions'>))
          .take(3)
      : Promise.resolve([]),
    planHistoryView(ctx, plan, includePending),
  ]);
  if (acknowledgments.length > 2) throw new Error('acknowledgment_capacity_exceeded');
  return {
    planId: String(plan._id),
    teacherProfileId: String(plan.teacherProfileId),
    state: plan.state,
    revision: plan.revision,
    activeVersion: await versionView(ctx, activeVersion),
    pendingVersion: await versionView(ctx, pendingVersion),
    approvedAt: plan.approvedAt ?? null,
    planEndAt: plan.planEndAt ?? null,
    reviewMeetingAt: plan.reviewMeetingAt ?? null,
    closedAt: plan.closedAt ?? null,
    closureOutcome: plan.closureOutcome ?? null,
    closureNote: includePending ? plan.closureNote ?? null : null,
    approvalEventId: plan.approvalEventId ?? null,
    closureEventId: plan.closureEventId ?? null,
    history,
    acknowledgments: acknowledgments.map((row) => ({
      acknowledgmentId: String(row._id),
      kind: row.kind,
      actorAccountId: String(row.actorAccountId),
      acknowledgedAt: row.acknowledgedAt,
    })),
  };
}

export const createImprovementPlanProposal = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    planId: v.union(v.id('improvement_plans'), v.null()),
    requestId: v.string(),
    expectedRevision: v.number(),
    position: v.string(),
    departmentId: v.id('departments'),
    reviewMeetingDate: v.string(),
    requestedPlanEndDate: v.union(v.string(), v.null()),
    purpose: v.string(),
    areasOfConcern: v.string(),
    expectedStandard: v.string(),
    requiredActions: v.string(),
    evidenceOfImprovement: v.string(),
    schoolSupport: v.string(),
    successfulCompletionCriteria: v.string(),
    targets: v.array(targetArgValidator),
    now: v.number(),
  },
  returns: proposalResultValidator,
  handler: async (ctx, args) => {
    if (!validRequestId(args.requestId)) {
      return { kind: 'invalid' as const, reason: 'invalid_request_id' };
    }
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      args.teacherProfileId,
      'pip:propose',
    );
    if (access.kind === 'denied') return access;
    let normalized;
    try {
      normalized = normalizePipProposal({
        teacherProfileId: String(args.teacherProfileId),
        position: access.teacher.position ?? 'Teacher',
        departmentId: String(args.departmentId),
        supervisorAccountId: String(args.actorAccountId),
        requestedPlanEndDate: args.requestedPlanEndDate,
        reviewMeetingDate: args.reviewMeetingDate,
        purpose: args.purpose,
        areasOfConcern: args.areasOfConcern,
        expectedStandard: args.expectedStandard,
        requiredActions: args.requiredActions,
        evidenceOfImprovement: args.evidenceOfImprovement,
        schoolSupport: args.schoolSupport,
        successfulCompletionCriteria: args.successfulCompletionCriteria,
        targets: args.targets,
      });
    } catch (error) {
      return { kind: 'invalid' as const, reason: error instanceof Error ? error.message : 'invalid' };
    }
    const targetDecision = validatePipTargets(normalized.targets, graph);
    if (!targetDecision.valid) return { kind: 'invalid' as const, reason: targetDecision.reason };
    const fingerprint = proposalContentFingerprint({
      action: 'proposed',
      planId: args.planId ? String(args.planId) : null,
      expectedRevision: args.expectedRevision,
      normalized,
    });
    const replay = await priorEvent(ctx, access.teacher.organizationId, args.requestId);
    if (replay) return replay.fingerprint === fingerprint
      ? proposalReceipt(replay)
      : { kind: 'idempotency_conflict' as const };

    const [department, membership] = await Promise.all([
      ctx.db.get(args.departmentId),
      ctx.db.query('department_memberships')
        .withIndex('by_org_dept_teacher_status', (query) => query
          .eq('organizationId', access.teacher.organizationId)
          .eq('departmentId', args.departmentId)
          .eq('teacherProfileId', args.teacherProfileId)
          .eq('status', 'active'))
        .unique(),
    ]);
    if (!department?.isActive
      || department.organizationId !== access.teacher.organizationId
      || !membership) {
      return { kind: 'invalid' as const, reason: 'invalid_department' };
    }
    const current = await openPlan(ctx, access.teacher.organizationId, args.teacherProfileId);
    if (args.planId && (!current || String(current._id) !== String(args.planId))) {
      return { kind: 'open_plan_exists' as const };
    }
    if (!args.planId && current) return { kind: 'open_plan_exists' as const };
    if ((current?.revision ?? 0) !== args.expectedRevision) {
      return { kind: 'revision_conflict' as const };
    }
    const planId = current?._id ?? await ctx.db.insert('improvement_plans', {
      organizationId: access.teacher.organizationId,
      teacherProfileId: args.teacherProfileId,
      state: 'proposed',
      revision: 0,
      latestVersion: 0,
      createdAt: args.now,
      updatedAt: args.now,
    });
    const version = (current?.latestVersion ?? 0) + 1;
    const versionId = await ctx.db.insert('improvement_plan_versions', {
      organizationId: access.teacher.organizationId,
      planId,
      teacherProfileId: args.teacherProfileId,
      version,
      proposerAccountId: args.actorAccountId,
      supervisorAccountId: args.actorAccountId,
      teacherName: access.teacherAccount.displayName,
      position: normalized.position,
      departmentId: args.departmentId,
      departmentName: department.name,
      supervisorName: access.actorAccount.displayName,
      requestedPlanEndDate: normalized.requestedPlanEndDate,
      reviewMeetingDate: normalized.reviewMeetingDate,
      purpose: normalized.purpose,
      areasOfConcern: normalized.areasOfConcern,
      expectedStandard: normalized.expectedStandard,
      requiredActions: normalized.requiredActions,
      evidenceOfImprovement: normalized.evidenceOfImprovement,
      schoolSupport: normalized.schoolSupport,
      successfulCompletionCriteria: normalized.successfulCompletionCriteria,
      insufficientImprovementConsequences: normalized.insufficientImprovementConsequences,
      acknowledgmentText: normalized.acknowledgmentText,
      sourceId: normalized.sourceId,
      sourceVersion: normalized.sourceVersion,
      sourceHash: normalized.sourceHash,
      fingerprint,
      proposedAt: args.now,
    });
    for (const [ordinal, rawTarget] of normalized.targets.entries()) {
      const target = projectExpectedTarget(rawTarget);
      await ctx.db.insert('improvement_plan_targets', {
        organizationId: access.teacher.organizationId,
        planId,
        versionId,
        teacherProfileId: args.teacherProfileId,
        ordinal,
        componentId: target.componentId,
        componentTitle: nodeById.get(target.componentId)?.title ?? target.componentId,
        skillId: target.skillId,
        skillTitle: nodeById.get(target.skillId)?.title ?? target.skillId,
        expectedRating: target.expectedRating,
        expectedPoints: target.expectedPoints,
        sourceId: normalized.sourceId,
        sourceVersion: normalized.sourceVersion,
        sourceHash: normalized.sourceHash,
        componentSourceRefs: nodeById.get(target.componentId)?.sourceRefs ?? [],
        skillSourceRefs: nodeById.get(target.skillId)?.sourceRefs ?? [],
        createdAt: args.now,
      });
    }
    const revision = (current?.revision ?? 0) + 1;
    await ctx.db.patch(planId, {
      state: current?.state ?? 'proposed',
      revision,
      latestVersion: version,
      pendingVersionId: versionId,
      updatedAt: args.now,
    });
    await ctx.db.insert('improvement_plan_events', {
      organizationId: access.teacher.organizationId,
      planId,
      teacherProfileId: args.teacherProfileId,
      version,
      versionId,
      kind: 'proposed',
      requestId: args.requestId,
      fingerprint,
      actorAccountId: args.actorAccountId,
      occurredAt: args.now,
      revision,
      payload: {},
    });
    return { kind: 'proposed' as const, planId: String(planId), versionId: String(versionId), revision, version };
  },
});

export const readImprovementPlanProposalWorkspace = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
  },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('capacity_exceeded') }),
    proposalWorkspaceValidator,
  ),
  handler: async (ctx, args) => {
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      args.teacherProfileId,
      'pip:propose',
    );
    if (access.kind === 'denied') return access;
    const memberships = await ctx.db.query('department_memberships')
      .withIndex('by_organizationId_and_teacherProfileId_and_status', (query) => query
        .eq('organizationId', access.teacher.organizationId)
        .eq('teacherProfileId', access.teacher._id)
        .eq('status', 'active'))
      .take(101);
    if (memberships.length > 100) return { kind: 'capacity_exceeded' as const };
    const departments = (await Promise.all(memberships.map((membership) => ctx.db.get(membership.departmentId))))
      .filter((department): department is Doc<'departments'> => Boolean(
        department?.isActive && department.organizationId === access.teacher.organizationId,
      ));
    return {
      kind: 'allowed' as const,
      teacher: {
        teacherProfileId: String(access.teacher._id),
        displayName: access.teacherAccount.displayName,
        position: access.teacher.position ?? 'Teacher',
      },
      departments: departments.map((department) => ({
        departmentId: String(department._id),
        departmentName: department.name,
      })),
      targetOptions: graph.edges.flatMap((edge) => {
        if (edge.type !== 'contains' || nodeById.get(edge.targetId)?.kind !== 'skill') return [];
        return [{
          componentId: edge.sourceId,
          componentTitle: nodeById.get(edge.sourceId)?.title ?? edge.sourceId,
          skillId: edge.targetId,
          skillTitle: nodeById.get(edge.targetId)?.title ?? edge.targetId,
        }];
      }),
    };
  },
});

export const approveImprovementPlan = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    planId: v.id('improvement_plans'),
    versionId: v.id('improvement_plan_versions'),
    requestId: v.string(),
    expectedRevision: v.number(),
    now: v.number(),
  },
  returns: approvalResultValidator,
  handler: async (ctx, args) => {
    if (!validRequestId(args.requestId)) {
      return { kind: 'invalid' as const, reason: 'invalid_request_id' };
    }
    const plan = await ctx.db.get(args.planId);
    if (!plan) return { kind: 'not_found' as const };
    const access = await authorizeTeacher(ctx, args.actorAccountId, plan.teacherProfileId, 'pip:approve');
    if (access.kind === 'denied') return access;
    const version = await ctx.db.get(args.versionId);
    if (!version || version.planId !== plan._id) return { kind: 'invalid' as const, reason: 'invalid_pending_version' };
    const fingerprint = proposalContentFingerprint({
      action: 'approved',
      planId: String(plan._id),
      versionId: String(version._id),
      expectedRevision: args.expectedRevision,
    });
    const replay = await priorEvent(ctx, plan.organizationId, args.requestId);
    if (replay) {
      if (replay.fingerprint !== fingerprint) return { kind: 'idempotency_conflict' as const };
      return {
        kind: 'replayed' as const,
        planId: String(plan._id),
        versionId: String(version._id),
        revision: replay.revision,
        planStartAt: replay.payload.planStartAt as number,
        planEndAt: replay.payload.planEndAt as number,
      };
    }
    if (plan.pendingVersionId !== version._id) {
      return { kind: 'invalid' as const, reason: 'invalid_pending_version' };
    }
    if (plan.revision !== args.expectedRevision) return { kind: 'revision_conflict' as const };
    const requestedEnd = version.requestedPlanEndDate
      ? Date.parse(`${version.requestedPlanEndDate}T23:59:59.999Z`)
      : args.now + 30 * DAY_MS;
    const reviewMeetingAt = Date.parse(`${version.reviewMeetingDate}T00:00:00.000Z`);
    if (!Number.isFinite(requestedEnd) || requestedEnd <= args.now) {
      return { kind: 'invalid' as const, reason: 'invalid_plan_end_date' };
    }
    if (!Number.isFinite(reviewMeetingAt) || reviewMeetingAt < args.now) {
      return { kind: 'invalid' as const, reason: 'invalid_review_meeting_date' };
    }
    const approvedTargets = await readTargets(ctx, plan.organizationId, version._id);
    if (approvedTargets.length > MAX_TARGETS) {
      return { kind: 'invalid' as const, reason: 'target_capacity_exceeded' };
    }
    const revision = plan.revision + 1;
    await ctx.db.patch(plan._id, {
      state: 'active',
      revision,
      activeVersionId: version._id,
      activeVersion: version.version,
      activeTargets: approvedTargets.map((target) => ({
        componentId: target.componentId,
        skillId: target.skillId,
        expectedRating: target.expectedRating,
      })),
      pendingVersionId: undefined,
      approvedAt: args.now,
      planEndAt: requestedEnd,
      reviewMeetingAt,
      closedAt: undefined,
      closureOutcome: undefined,
      closureNote: undefined,
      updatedAt: args.now,
    });
    const approvalEventId = await ctx.db.insert('improvement_plan_events', {
      organizationId: plan.organizationId,
      planId: plan._id,
      teacherProfileId: plan.teacherProfileId,
      version: version.version,
      versionId: version._id,
      kind: 'approved',
      requestId: args.requestId,
      fingerprint,
      actorAccountId: args.actorAccountId,
      occurredAt: args.now,
      revision,
      payload: { planStartAt: args.now, planEndAt: requestedEnd },
    });
    await ctx.db.patch(plan._id, { approvalEventId: String(approvalEventId) });
    return {
      kind: 'approved' as const,
      planId: String(plan._id),
      versionId: String(version._id),
      revision,
      planStartAt: args.now,
      planEndAt: requestedEnd,
    };
  },
});

export const acknowledgeImprovementPlan = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    planId: v.id('improvement_plans'),
    versionId: v.id('improvement_plan_versions'),
    kind: v.union(v.literal('teacher'), v.literal('supervisor')),
    requestId: v.string(),
    expectedRevision: v.number(),
    now: v.number(),
  },
  returns: acknowledgmentResultValidator,
  handler: async (ctx, args) => {
    if (!validRequestId(args.requestId)) {
      return { kind: 'invalid' as const, reason: 'invalid_request_id' };
    }
    const plan = await ctx.db.get(args.planId);
    if (!plan) return { kind: 'not_found' as const };
    const version = await ctx.db.get(args.versionId);
    if (!version || version.planId !== plan._id) return { kind: 'not_found' as const };
    const action: DanielsonAction = args.kind === 'teacher'
      ? 'pip_acknowledgment:write'
      : 'pip_supervisor_acknowledgment:write';
    const access = await authorizeTeacher(ctx, args.actorAccountId, plan.teacherProfileId, action);
    if (access.kind === 'denied') return access;
    if (args.kind === 'teacher' && String(access.teacher.accountId) !== String(args.actorAccountId)) {
      return { kind: 'denied' as const, reason: 'target_out_of_scope' };
    }
    if (args.kind === 'supervisor' && String(version.supervisorAccountId) !== String(args.actorAccountId)) {
      return { kind: 'denied' as const, reason: 'target_out_of_scope' };
    }
    const fingerprint = proposalContentFingerprint({
      action: 'acknowledged',
      planId: String(plan._id),
      versionId: String(version._id),
      kind: args.kind,
      expectedRevision: args.expectedRevision,
    });
    const replay = await priorEvent(ctx, plan.organizationId, args.requestId);
    if (replay) {
      if (replay.fingerprint !== fingerprint) return { kind: 'idempotency_conflict' as const };
      return {
        kind: 'replayed' as const,
        acknowledgmentId: replay.payload.acknowledgmentId as string,
        acknowledgmentKind: args.kind,
      };
    }
    if (!plan.activeVersionId || plan.activeVersionId !== args.versionId) {
      return { kind: 'not_found' as const };
    }
    if (plan.state !== 'active' && plan.state !== 'closed') return { kind: 'not_found' as const };
    if (plan.revision !== args.expectedRevision) return { kind: 'revision_conflict' as const };
    const existing = await ctx.db.query('improvement_plan_acknowledgments')
      .withIndex('by_org_version_kind', (query) => query
        .eq('organizationId', plan.organizationId)
        .eq('versionId', version._id)
        .eq('kind', args.kind))
      .unique();
    if (existing) return { kind: 'acknowledgment_exists' as const };
    const acknowledgmentId = await ctx.db.insert('improvement_plan_acknowledgments', {
      organizationId: plan.organizationId,
      planId: plan._id,
      versionId: version._id,
      teacherProfileId: plan.teacherProfileId,
      kind: args.kind,
      actorAccountId: args.actorAccountId,
      requestId: args.requestId,
      acknowledgedAt: args.now,
    });
    await ctx.db.insert('improvement_plan_events', {
      organizationId: plan.organizationId,
      planId: plan._id,
      teacherProfileId: plan.teacherProfileId,
      version: version.version,
      versionId: version._id,
      kind: args.kind === 'teacher' ? 'teacher_acknowledged' : 'supervisor_acknowledged',
      requestId: args.requestId,
      fingerprint,
      actorAccountId: args.actorAccountId,
      occurredAt: args.now,
      revision: plan.revision,
      payload: { acknowledgmentKind: args.kind, acknowledgmentId: String(acknowledgmentId) },
    });
    return {
      kind: 'acknowledged' as const,
      acknowledgmentId: String(acknowledgmentId),
      acknowledgmentKind: args.kind,
    };
  },
});

async function effectivePlanEvidence(ctx: DbCtx, plan: Doc<'improvement_plans'>) {
  const [outcomes, supersessions] = await Promise.all([
    ctx.db.query('teacher_observation_outcomes')
      .withIndex('by_organizationId_and_teacherId_and_occurredAt', (query) => query
        .eq('organizationId', plan.organizationId)
        .eq('teacherId', String(plan.teacherProfileId)))
      .order('asc')
      .take(MAX_EVIDENCE_ROWS + 1),
    ctx.db.query('teacher_evidence_supersessions')
      .withIndex('by_org_teacher_occurred', (query) => query
        .eq('organizationId', plan.organizationId)
        .eq('teacherProfileId', plan.teacherProfileId))
      .order('asc')
      .take(MAX_EVIDENCE_ROWS + 1),
  ]);
  if (outcomes.length > MAX_EVIDENCE_ROWS || supersessions.length > MAX_EVIDENCE_ROWS) return null;
  const superseded = new Set(supersessions.map((row) => row.supersededEvidenceKey));
  return outcomes.flatMap((row) => {
    if (superseded.has(row.idempotencyKey) || row.outcome.kind !== 'rated') return [];
    return row.outcome.targetEvidence.map((evidence) => ({
      skillId: evidence.skillId,
      kind: 'rated' as const,
      rating: evidence.rawRating as 1 | 2 | 3 | 4,
      occurredAt: Date.parse(evidence.occurredAt),
      sourceRecordId: evidence.sourceRecordId ?? null,
      evidenceIdempotencyKey: evidence.idempotencyKey,
    }));
  });
}

export type ActivePlanPriorityOverlay = {
  approvedAt: number;
  planEndAt: number;
  latestRatedEvidenceAt: number | null;
};

/** Read active PIP cadence and progress once for an organization. */
export async function readOrganizationActiveImprovementPlans(
  ctx: DbCtx,
  organizationId: Id<'organizations'>,
  now: number,
) {
  const [plans, proposedPlans] = await Promise.all([
    ctx.db.query('improvement_plans')
      .withIndex('by_org_state_updated', (query) => query
        .eq('organizationId', organizationId)
        .eq('state', 'active'))
      .take(251),
    ctx.db.query('improvement_plans')
      .withIndex('by_org_state_updated', (query) => query
        .eq('organizationId', organizationId)
        .eq('state', 'proposed'))
      .take(251),
  ]);
  if (plans.length > 250 || proposedPlans.length > 250) {
    return { kind: 'capacity_exceeded' as const };
  }
  const pendingByTeacher = new Map(proposedPlans.map((plan) => [
    String(plan.teacherProfileId),
    String(plan._id),
  ]));
  if (plans.length === 0) {
    return {
      kind: 'allowed' as const,
      overlaysByTeacher: new Map<string, Map<string, ActivePlanPriorityOverlay>>(),
      progressByTeacher: new Map<string, ReturnType<typeof projectImprovementPlanProgress>>(),
      pendingByTeacher,
    };
  }
  const earliestApproval = Math.min(...plans.map((plan) => plan.approvedAt ?? now));
  const [outcomes, supersessions] = await Promise.all([
    ctx.db.query('teacher_observation_outcomes')
      .withIndex('by_organizationId_and_occurredAt', (query) => query
        .eq('organizationId', organizationId)
        .gte('occurredAt', earliestApproval))
      .order('asc')
      .take(MAX_EVIDENCE_ROWS + 1),
    ctx.db.query('teacher_evidence_supersessions')
      .withIndex('by_org_occurred', (query) => query
        .eq('organizationId', organizationId)
        .gte('occurredAt', earliestApproval))
      .order('asc')
      .take(MAX_EVIDENCE_ROWS + 1),
  ]);
  if (outcomes.length > MAX_EVIDENCE_ROWS || supersessions.length > MAX_EVIDENCE_ROWS) {
    return { kind: 'capacity_exceeded' as const };
  }
  const superseded = new Set(supersessions.map((row) => row.supersededEvidenceKey));
  const evidenceByTeacher = new Map<string, Array<{
    skillId: string;
    kind: 'rated';
    rating: 1 | 2 | 3 | 4;
    occurredAt: number;
    sourceRecordId: string | null;
    evidenceIdempotencyKey: string;
  }>>();
  for (const row of outcomes) {
    if (superseded.has(row.idempotencyKey) || row.outcome.kind !== 'rated') continue;
    const teacherId = row.teacherId;
    const current = evidenceByTeacher.get(teacherId) ?? [];
    for (const evidence of row.outcome.targetEvidence) {
      current.push({
        skillId: evidence.skillId,
        kind: 'rated',
        rating: evidence.rawRating as 1 | 2 | 3 | 4,
        occurredAt: Date.parse(evidence.occurredAt),
        sourceRecordId: evidence.sourceRecordId ?? null,
        evidenceIdempotencyKey: evidence.idempotencyKey,
      });
    }
    evidenceByTeacher.set(teacherId, current);
  }
  const overlaysByTeacher = new Map<string, Map<string, ActivePlanPriorityOverlay>>();
  const progressByTeacher = new Map<string, ReturnType<typeof projectImprovementPlanProgress>>();
  for (const plan of plans) {
    if (plan.approvedAt === undefined || plan.planEndAt === undefined
      || plan.reviewMeetingAt === undefined || plan.activeVersion === undefined) continue;
    const targets = (plan.activeTargets ?? []).map((target) => ({
      componentId: target.componentId,
      skillId: target.skillId,
      expectedRating: target.expectedRating as 3 | 4,
    }));
    const evidence = evidenceByTeacher.get(String(plan.teacherProfileId)) ?? [];
    progressByTeacher.set(String(plan.teacherProfileId), projectImprovementPlanProgress({
      planId: String(plan._id),
      version: plan.activeVersion,
      approvedAt: plan.approvedAt,
      planEndAt: plan.planEndAt,
      reviewMeetingAt: plan.reviewMeetingAt,
      now,
      targets,
      evidence,
    }));
    const targetOverlays = new Map<string, ActivePlanPriorityOverlay>();
    for (const target of targets) {
      const latestRatedEvidenceAt = evidence
        .filter((event) => event.skillId === target.skillId
          && event.occurredAt >= plan.approvedAt!
          && event.occurredAt <= plan.planEndAt!)
        .reduce<number | null>((latest, event) => (
          latest === null || event.occurredAt > latest ? event.occurredAt : latest
        ), null);
      targetOverlays.set(target.skillId, {
        approvedAt: plan.approvedAt,
        planEndAt: plan.planEndAt,
        latestRatedEvidenceAt,
      });
    }
    overlaysByTeacher.set(String(plan.teacherProfileId), targetOverlays);
  }
  return { kind: 'allowed' as const, overlaysByTeacher, progressByTeacher, pendingByTeacher };
}

/** Read one latest closed plan per teacher for the leadership portfolio. */
export async function readOrganizationLatestClosedImprovementPlans(
  ctx: DbCtx,
  organizationId: Id<'organizations'>,
) {
  const plans = await ctx.db.query('improvement_plans')
    .withIndex('by_org_state_updated', (query) => query
      .eq('organizationId', organizationId)
      .eq('state', 'closed'))
    .order('desc')
    .take(251);
  if (plans.length > 250) return { kind: 'capacity_exceeded' as const };
  const plansByTeacher = new Map<string, Doc<'improvement_plans'>>();
  for (const plan of plans) {
    const teacherId = String(plan.teacherProfileId);
    if (!plansByTeacher.has(teacherId)) plansByTeacher.set(teacherId, plan);
  }
  return { kind: 'allowed' as const, plansByTeacher };
}

async function progressForPlan(ctx: DbCtx, plan: Doc<'improvement_plans'>, now: number) {
  if (!plan.activeVersionId || plan.approvedAt === undefined
    || plan.planEndAt === undefined || plan.reviewMeetingAt === undefined) return null;
  if (plan.state === 'closed' && plan.closureOutcome && plan.closedAt !== undefined
    && plan.closedTargetResults) {
    return {
      contractVersion: 'danielson.ip-progress.v1' as const,
      state: 'closed' as const,
      planId: String(plan._id),
      version: plan.activeVersion ?? 1,
      daysRemaining: 0,
      targets: structuredClone(plan.closedTargetResults),
      outcome: plan.closureOutcome,
      closedAt: plan.closedAt,
    };
  }
  const [targets, evidence] = await Promise.all([
    readTargets(ctx, plan.organizationId, plan.activeVersionId),
    effectivePlanEvidence(ctx, plan),
  ]);
  if (targets.length > MAX_TARGETS || evidence === null) return null;
  return projectImprovementPlanProgress({
    planId: String(plan._id),
    version: plan.activeVersion ?? 1,
    approvedAt: plan.approvedAt,
    planEndAt: plan.planEndAt,
    reviewMeetingAt: plan.reviewMeetingAt,
    now,
    targets: targets.map((target) => ({
      componentId: target.componentId,
      skillId: target.skillId,
      expectedRating: target.expectedRating as 3 | 4,
    })),
    evidence,
    ...(plan.state === 'closed' && plan.closureOutcome && plan.closedAt !== undefined
      ? { closure: { outcome: plan.closureOutcome, closedAt: plan.closedAt } }
      : {}),
  });
}

/** Build the current PIP reporting seam without applying actor authorization. */
export async function readTeacherImprovementPlanProjection(
  ctx: DbCtx,
  organizationId: Id<'organizations'>,
  teacherProfileId: Id<'teacher_profiles'>,
  now: number,
  includeClosureNote: boolean,
) {
  const plan = await currentOrLatestPlan(ctx, organizationId, teacherProfileId);
  if (!plan) {
    return { contractVersion: 'danielson.ip-progress.v1' as const, state: 'not_configured' as const };
  }
  if (plan.state === 'proposed') {
    return {
      contractVersion: 'danielson.ip-progress.v1' as const,
      state: 'pending_approval' as const,
      planId: String(plan._id),
    };
  }
  const progress = await progressForPlan(ctx, plan, now);
  if (!progress || !plan.activeVersionId) return null;
  const version = await ctx.db.get(plan.activeVersionId);
  if (!version) return null;
  return {
    ...progress,
    schoolSupport: version.schoolSupport,
    successfulCompletionCriteria: version.successfulCompletionCriteria,
    ...(includeClosureNote && plan.closureNote ? { closureNote: plan.closureNote } : {}),
  };
}

export const closeImprovementPlan = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    planId: v.id('improvement_plans'),
    requestId: v.string(),
    expectedRevision: v.number(),
    outcome: v.union(v.literal('successful'), v.literal('insufficient_improvement')),
    note: v.string(),
    now: v.number(),
  },
  returns: closureResultValidator,
  handler: async (ctx, args) => {
    if (!validRequestId(args.requestId)) {
      return { kind: 'invalid' as const, reason: 'invalid_request_id' };
    }
    const plan = await ctx.db.get(args.planId);
    if (!plan) return { kind: 'not_found' as const };
    const access = await authorizeTeacher(ctx, args.actorAccountId, plan.teacherProfileId, 'pip:close');
    if (access.kind === 'denied') return access;
    const note = args.note.trim();
    if (!note || note.length > 4_000) return { kind: 'invalid' as const, reason: 'invalid_closure_note' };
    const fingerprint = proposalContentFingerprint({
      action: 'closed',
      planId: String(plan._id),
      expectedRevision: args.expectedRevision,
      outcome: args.outcome,
      note,
    });
    const replay = await priorEvent(ctx, plan.organizationId, args.requestId);
    if (replay) {
      if (replay.fingerprint !== fingerprint) return { kind: 'idempotency_conflict' as const };
      return {
        kind: 'replayed' as const,
        planId: String(plan._id),
        revision: replay.revision,
        outcome: replay.payload.outcome as 'successful' | 'insufficient_improvement',
      };
    }
    if (plan.state !== 'active' || !plan.activeVersionId) return { kind: 'not_found' as const };
    if (plan.revision !== args.expectedRevision) return { kind: 'revision_conflict' as const };
    const progress = await progressForPlan(ctx, plan, args.now);
    if (!progress) return { kind: 'evidence_capacity_exceeded' as const };
    const targetResults = progress.targets.map((target) => ({
      componentId: target.componentId,
      skillId: target.skillId,
      expectedRating: target.expectedRating,
      currentRating: target.currentRating,
      state: target.state,
      evidenceDueAt: target.evidenceDueAt,
      evidenceDue: target.evidenceDue,
      evidenceOverdue: target.evidenceOverdue,
      sourceRecordId: target.sourceRecordId,
      evidenceIdempotencyKey: target.evidenceIdempotencyKey,
    }));
    const revision = plan.revision + 1;
    await ctx.db.patch(plan._id, {
      state: 'closed',
      revision,
      closedAt: args.now,
      closureOutcome: args.outcome,
      closureNote: note,
      closedTargetResults: targetResults,
      updatedAt: args.now,
    });
    const closureEventId = await ctx.db.insert('improvement_plan_events', {
      organizationId: plan.organizationId,
      planId: plan._id,
      teacherProfileId: plan.teacherProfileId,
      version: plan.activeVersion ?? 1,
      versionId: plan.activeVersionId,
      kind: 'closed',
      requestId: args.requestId,
      fingerprint,
      actorAccountId: args.actorAccountId,
      occurredAt: args.now,
      revision,
      payload: { outcome: args.outcome, note, targetResults },
    });
    await ctx.db.patch(plan._id, { closureEventId: String(closureEventId) });
    return { kind: 'closed' as const, planId: String(plan._id), revision, outcome: args.outcome };
  },
});

export const readImprovementPlan = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    planId: v.id('improvement_plans'),
    now: v.number(),
  },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('not_found') }),
    v.object({ kind: v.literal('capacity_exceeded') }),
    v.object({
      kind: v.literal('allowed'),
      plan: planViewValidator,
      viewer: v.object({
        isSubjectTeacher: v.boolean(),
        isFrozenSupervisor: v.boolean(),
      }),
    }),
  ),
  handler: async (ctx, args) => {
    void args.now;
    const plan = await ctx.db.get(args.planId);
    if (!plan) return { kind: 'not_found' as const };
    const teacher = await ctx.db.get(plan.teacherProfileId);
    if (!teacher) return { kind: 'not_found' as const };
    const own = String(teacher.accountId) === String(args.actorAccountId);
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      plan.teacherProfileId,
      own ? 'published_record:read' : 'pip:propose',
    );
    if (access.kind === 'denied') return access;
    if (own && plan.state === 'proposed') return { kind: 'denied' as const, reason: 'target_out_of_scope' };
    try {
      const view = await readPlanView(ctx, plan, !own);
      return {
        kind: 'allowed' as const,
        plan: view,
        viewer: {
          isSubjectTeacher: own,
          isFrozenSupervisor:
            view.activeVersion?.supervisorAccountId === String(args.actorAccountId),
        },
      };
    } catch {
      return { kind: 'capacity_exceeded' as const };
    }
  },
});

export const readImprovementPlanReportProjection = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    now: v.number(),
  },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('capacity_exceeded') }),
    v.object({ kind: v.literal('allowed'), projection: improvementPlanProgressValidator }),
  ),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.teacherProfileId);
    if (!teacher) return { kind: 'denied' as const, reason: 'target_inactive' };
    const own = String(teacher.accountId) === String(args.actorAccountId);
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      args.teacherProfileId,
      own ? 'published_record:read' : 'pip:propose',
    );
    if (access.kind === 'denied') return access;
    const projection = await readTeacherImprovementPlanProjection(
      ctx,
      access.teacher.organizationId,
      args.teacherProfileId,
      args.now,
      !own,
    );
    if (projection === null) return { kind: 'capacity_exceeded' as const };
    if (own && projection.state === 'pending_approval') {
      return {
        kind: 'allowed' as const,
        projection: { contractVersion: 'danielson.ip-progress.v1' as const, state: 'not_configured' as const },
      };
    }
    return { kind: 'allowed' as const, projection };
  },
});

export const listScopedImprovementPlans = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
    now: v.number(),
  },
  returns: v.union(
    deniedValidator,
    v.object({ kind: v.literal('invalid_page_size') }),
    v.object({ kind: v.literal('allowed'), page: paginationResultValidator(planViewValidator) }),
  ),
  handler: async (ctx, args) => {
    void args.now;
    if (args.paginationOpts.numItems < 1 || args.paginationOpts.numItems > MAX_PAGE_SIZE) {
      return { kind: 'invalid_page_size' as const };
    }
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    const roles = await ctx.db.query('role_assignments')
      .withIndex('by_organizationId_and_accountId_and_status', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('accountId', actor._id)
        .eq('status', 'active'))
      .take(7);
    const supervisorRoles = new Set(roles
      .map((row) => row.role)
      .filter((role) => role === 'hod' || role === 'coach' || role === 'school_head' || role === 'slt'));
    if (supervisorRoles.size === 0) {
      return { kind: 'denied' as const, reason: 'capability_not_granted' };
    }
    const profiles = await ctx.db.query('teacher_profiles')
      .withIndex('by_organizationId_and_isActive', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('isActive', true))
      .take(251);
    if (profiles.length > 250) return { kind: 'denied' as const, reason: 'capacity_exceeded' };
    const organizationWide = supervisorRoles.has('school_head') || supervisorRoles.has('slt');
    let scopedTeacherIds = new Set(profiles.map((profile) => String(profile._id)));
    if (!organizationWide) {
      const [memberships, departments, hodAssignments, coachAssignments] = await Promise.all([
        ctx.db.query('department_memberships')
          .withIndex('by_organizationId_and_status', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('status', 'active'))
          .take(MAX_EVIDENCE_ROWS + 1),
        ctx.db.query('departments')
          .withIndex('by_organizationId_and_isActive', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('isActive', true))
          .take(MAX_EVIDENCE_ROWS + 1),
        ctx.db.query('hod_assignments')
          .withIndex('by_organizationId_and_accountId_and_status', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('accountId', actor._id)
            .eq('status', 'active'))
          .take(MAX_EVIDENCE_ROWS + 1),
        ctx.db.query('coach_assignments')
          .withIndex('by_organizationId_and_accountId_and_status', (query) => query
            .eq('organizationId', actor.organizationId)
            .eq('accountId', actor._id)
            .eq('status', 'active'))
          .take(MAX_EVIDENCE_ROWS + 1),
      ]);
      if ([memberships, departments, hodAssignments, coachAssignments]
        .some((rows) => rows.length > MAX_EVIDENCE_ROWS)) {
        return { kind: 'denied' as const, reason: 'capacity_exceeded' };
      }
      const departmentIds = new Set(departments.map((department) => String(department._id)));
      const hodDepartmentIds = new Set(hodAssignments
        .map((assignment) => String(assignment.departmentId))
        .filter((departmentId) => departmentIds.has(departmentId)));
      const teacherDepartments = new Map<string, Set<string>>();
      for (const membership of memberships) {
        const departmentId = String(membership.departmentId);
        if (!departmentIds.has(departmentId)) continue;
        const teacherId = String(membership.teacherProfileId);
        teacherDepartments.set(teacherId, new Set([
          ...(teacherDepartments.get(teacherId) ?? []),
          departmentId,
        ]));
      }
      const coachTeacherIds = new Set(coachAssignments.map((assignment) => String(assignment.teacherProfileId)));
      scopedTeacherIds = new Set(profiles
        .filter((profile) => (
          (supervisorRoles.has('hod')
            && [...(teacherDepartments.get(String(profile._id)) ?? [])]
              .some((departmentId) => hodDepartmentIds.has(departmentId)))
          || (supervisorRoles.has('coach') && coachTeacherIds.has(String(profile._id)))
        ))
        .map((profile) => String(profile._id)));
    }

    const plans: Doc<'improvement_plans'>[] = [];
    for (const teacherProfileId of scopedTeacherIds) {
      const rows = await ctx.db.query('improvement_plans')
        .withIndex('by_org_teacher_created', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('teacherProfileId', teacherProfileId as Id<'teacher_profiles'>))
        .order('desc')
        .take(251);
      if (rows.length > 250) return { kind: 'denied' as const, reason: 'capacity_exceeded' };
      plans.push(...rows);
    }
    plans.sort((left, right) => right.updatedAt - left.updatedAt || String(right._id).localeCompare(String(left._id)));
    const start = args.paginationOpts.cursor === null
      ? 0
      : plans.findIndex((plan) => String(plan._id) === args.paginationOpts.cursor) + 1;
    const pagePlans = start === 0 && args.paginationOpts.cursor !== null
      ? []
      : plans.slice(start, start + args.paginationOpts.numItems);
    const isDone = start + pagePlans.length >= plans.length;
    return {
      kind: 'allowed' as const,
      page: {
        page: await Promise.all(pagePlans.map((plan) => readPlanView(ctx, plan, true))),
        isDone,
        continueCursor: isDone ? '' : String(pagePlans.at(-1)?._id ?? ''),
      },
    };
  },
});

export const listImprovementPlanHistory = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    planId: v.id('improvement_plans'),
    paginationOpts: paginationOptsValidator,
  },
  returns: historyResultValidator,
  handler: async (ctx, args) => {
    if (args.paginationOpts.numItems < 1 || args.paginationOpts.numItems > MAX_PAGE_SIZE) {
      return { kind: 'invalid_page_size' as const };
    }
    const plan = await ctx.db.get(args.planId);
    if (!plan) return { kind: 'not_found' as const };
    const teacher = await ctx.db.get(plan.teacherProfileId);
    if (!teacher) return { kind: 'not_found' as const };
    const own = String(teacher.accountId) === String(args.actorAccountId);
    const access = await authorizeTeacher(
      ctx,
      args.actorAccountId,
      plan.teacherProfileId,
      own ? 'published_record:read' : 'pip:propose',
    );
    if (access.kind === 'denied') return access;
    const [result, versions] = await Promise.all([
      ctx.db.query('improvement_plan_events')
        .withIndex('by_org_plan_time', (query) => query
          .eq('organizationId', plan.organizationId)
          .eq('planId', plan._id))
        .order('desc')
        .paginate(args.paginationOpts),
      ctx.db.query('improvement_plan_versions')
        .withIndex('by_org_plan_version', (query) => query
          .eq('organizationId', plan.organizationId)
          .eq('planId', plan._id))
        .order('asc')
        .take(MAX_TARGETS + 1),
    ]);
    if (versions.length > MAX_TARGETS) return { kind: 'capacity_exceeded' as const };
    const priorApprovedVersions = versions
      .filter((version) => version.version < (plan.activeVersion ?? Number.POSITIVE_INFINITY))
      .map((version) => ({
        version: version.version,
        versionId: String(version._id),
        purpose: version.purpose,
      }));
    return {
      kind: 'allowed' as const,
      page: {
        ...result,
        page: result.page.map((event) => ({
          eventId: String(event._id),
          kind: event.kind,
          version: event.version,
          versionId: event.versionId ? String(event.versionId) : null,
          occurredAt: event.occurredAt,
          payload: {
            ...(event.payload.outcome ? { outcome: event.payload.outcome } : {}),
            ...(!own && event.payload.note ? { note: event.payload.note } : {}),
          },
        })),
      },
      priorApprovedVersions,
    };
  },
});
