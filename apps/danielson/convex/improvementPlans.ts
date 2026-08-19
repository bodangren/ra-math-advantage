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
  acknowledgments: v.array(acknowledgmentViewValidator),
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
});
const progressValidator = v.union(
  v.object({
    contractVersion: v.literal('danielson.ip-progress.v1'),
    state: v.literal('not_configured'),
  }),
  v.object({
    contractVersion: v.literal('danielson.ip-progress.v1'),
    state: v.literal('pending_approval'),
  }),
  v.object({
    contractVersion: v.literal('danielson.ip-progress.v1'),
    state: v.literal('active'),
    planId: v.string(),
    version: v.number(),
    daysRemaining: v.number(),
    trackState: v.union(v.literal('on_track'), v.literal('off_track')),
    targets: v.array(targetProgressValidator),
  }),
  v.object({
    contractVersion: v.literal('danielson.ip-progress.v1'),
    state: v.literal('closed'),
    planId: v.string(),
    version: v.number(),
    daysRemaining: v.number(),
    outcome: v.union(v.literal('successful'), v.literal('insufficient_improvement')),
    closedAt: v.number(),
    targets: v.array(targetProgressValidator),
  }),
);
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
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({
    kind: v.union(v.literal('acknowledged'), v.literal('replayed')),
    acknowledgmentId: v.string(),
    acknowledgmentKind: v.union(v.literal('teacher'), v.literal('supervisor')),
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

async function readPlanView(ctx: DbCtx, plan: Doc<'improvement_plans'>, includePending: boolean) {
  const [activeVersion, pendingVersion, acknowledgments] = await Promise.all([
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
        position: args.position,
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
    const fingerprint = proposalContentFingerprint({ action: 'proposed', normalized });
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
    const revision = plan.revision + 1;
    await ctx.db.patch(plan._id, {
      state: 'active',
      revision,
      activeVersionId: version._id,
      activeVersion: version.version,
      pendingVersionId: undefined,
      approvedAt: args.now,
      planEndAt: requestedEnd,
      reviewMeetingAt,
      closedAt: undefined,
      closureOutcome: undefined,
      closureNote: undefined,
      updatedAt: args.now,
    });
    await ctx.db.insert('improvement_plan_events', {
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
    now: v.number(),
  },
  returns: acknowledgmentResultValidator,
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.planId);
    if (!plan || (plan.state !== 'active' && plan.state !== 'closed')
      || plan.activeVersionId !== args.versionId) return { kind: 'not_found' as const };
    const version = await ctx.db.get(args.versionId);
    if (!version) return { kind: 'not_found' as const };
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
      action: 'acknowledged', planId: String(plan._id), versionId: String(version._id), kind: args.kind,
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
    }));
  });
}

async function progressForPlan(ctx: DbCtx, plan: Doc<'improvement_plans'>, now: number) {
  if (!plan.activeVersionId || plan.approvedAt === undefined
    || plan.planEndAt === undefined || plan.reviewMeetingAt === undefined) return null;
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
    const plan = await ctx.db.get(args.planId);
    if (!plan) return { kind: 'not_found' as const };
    const access = await authorizeTeacher(ctx, args.actorAccountId, plan.teacherProfileId, 'pip:close');
    if (access.kind === 'denied') return access;
    const note = args.note.trim();
    if (!note || note.length > 4_000) return { kind: 'invalid' as const, reason: 'invalid_closure_note' };
    const fingerprint = proposalContentFingerprint({
      action: 'closed', planId: String(plan._id), outcome: args.outcome, note,
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
    }));
    const revision = plan.revision + 1;
    await ctx.db.patch(plan._id, {
      state: 'closed',
      revision,
      closedAt: args.now,
      closureOutcome: args.outcome,
      closureNote: note,
      updatedAt: args.now,
    });
    await ctx.db.insert('improvement_plan_events', {
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
    v.object({ kind: v.literal('allowed'), plan: planViewValidator }),
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
      return { kind: 'allowed' as const, plan: await readPlanView(ctx, plan, !own) };
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
    v.object({ kind: v.literal('allowed'), projection: progressValidator }),
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
    const plan = await currentOrLatestPlan(ctx, access.teacher.organizationId, args.teacherProfileId);
    if (!plan || (own && plan.state === 'proposed')) {
      return {
        kind: 'allowed' as const,
        projection: { contractVersion: 'danielson.ip-progress.v1' as const, state: 'not_configured' as const },
      };
    }
    if (plan.state === 'proposed') {
      return {
        kind: 'allowed' as const,
        projection: { contractVersion: 'danielson.ip-progress.v1' as const, state: 'pending_approval' as const },
      };
    }
    const projection = await progressForPlan(ctx, plan, args.now);
    return projection
      ? { kind: 'allowed' as const, projection }
      : { kind: 'capacity_exceeded' as const };
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
    const raw = await ctx.db.query('improvement_plans')
      .withIndex('by_org_updated', (query) => query.eq('organizationId', actor.organizationId))
      .order('desc')
      .paginate(args.paginationOpts);
    const visible = [];
    for (const plan of raw.page) {
      const access = await authorizeTeacher(ctx, args.actorAccountId, plan.teacherProfileId, 'pip:propose');
      if (access.kind === 'allowed') visible.push(await readPlanView(ctx, plan, true));
    }
    return { kind: 'allowed' as const, page: { ...raw, page: visible } };
  },
});
