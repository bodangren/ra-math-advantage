import { paginationOptsValidator } from 'convex/server';
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

const MAX_QUEUE_TEACHERS = 250;
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
  if (!teacher?.isActive || teacher.organizationId !== actor.organizationId) {
    return { kind: 'denied' as const, reason: 'teacher_scope_denied' };
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
  const { graph, skillIds } = graphDetails();
  return projectTeacherPriority(
    String(teacherProfileId),
    cards.map((row) => row.card) as never,
    proficiency.map((row) => row.projection as Record<string, unknown>),
    graph,
    skillIds,
    nowMs,
  );
}

async function refreshAttentionSummary(
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
  returns: v.any(),
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
    const profiles = await ctx.db.query('teacher_profiles')
      .withIndex('by_organizationId_and_isActive', (query) => query
        .eq('organizationId', actor.organizationId)
        .eq('isActive', true))
      .take(MAX_QUEUE_TEACHERS + 1);
    if (profiles.length > MAX_QUEUE_TEACHERS) return { kind: 'queue_capacity_exceeded' as const };
    const [memberships, hodAssignments, coachAssignments, summaries, actorProfile, organizationAccounts] = await Promise.all([
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
        .take(100),
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
        .take(MAX_QUEUE_TEACHERS + 1),
    ]);
    if (
      memberships.length > MAX_SCOPE_ROWS
      || coachAssignments.length > MAX_QUEUE_TEACHERS
      || summaries.length > MAX_QUEUE_TEACHERS
      || organizationAccounts.length > MAX_QUEUE_TEACHERS
    ) return { kind: 'queue_capacity_exceeded' as const };
    const membershipIds = new Map<string, string[]>();
    for (const membership of memberships) {
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
        hodDepartmentIds: hodAssignments.map((row) => String(row.departmentId)),
        coachTeacherProfileIds: coachAssignments.map((row) => String(row.teacherProfileId)),
      },
    );
    const summaryByTeacher = new Map(summaries.map((row) => [String(row.teacherProfileId), row.targets]));
    const accountById = new Map(organizationAccounts.map((account) => [String(account._id), account]));
    const { graph, skillIds } = graphDetails();
    const titleById = new Map(graph.nodes.map((node) => [node.id, node.title]));
    const candidates = scoped.flatMap((candidate) => {
      const profile = profiles.find((row) => String(row._id) === candidate.teacherProfileId);
      const account = profile ? accountById.get(String(profile.accountId)) : null;
      if (!account?.isActive) return [];
      const targets = summaryByTeacher.get(candidate.teacherProfileId)
        ?? projectTeacherPriority(
          candidate.teacherProfileId,
          [],
          [],
          graph,
          skillIds,
          now,
        );
      return [{ teacherProfileId: candidate.teacherProfileId, displayName: account.displayName, targets }];
    });
    return {
      kind: 'allowed' as const,
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
  returns: v.any(),
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
    if (args.observationType === 'walkthrough') {
      const priorities = await readTeacherPriorityRows(
        ctx,
        access.actor.organizationId,
        args.teacherProfileId,
        args.now,
      );
      const selected = selectWalkthroughTargets(priorities);
      if (selected.returned === 0) return { kind: 'no_eligible_targets' as const, ...selected };
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
    return { kind: 'created' as const, draft: { ...draft, draftId: String(id) } };
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
  returns: v.any(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row) return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) return { kind: 'denied' as const, reason: 'draft_owner_mismatch' };
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
  returns: v.any(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row || row.status !== 'draft') return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) {
      return { kind: 'denied' as const, reason: 'draft_owner_mismatch' };
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
  returns: v.any(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row || row.status !== 'draft') return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) {
      return { kind: 'denied' as const, reason: 'draft_owner_mismatch' };
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
    expectedRevision: v.optional(v.number()),
    submissionKey: v.string(),
    now: v.number(),
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const row = await ctx.db.get(args.draftId);
    if (!row) return { kind: 'not_found' as const };
    if (row.observerAccountId !== args.actorAccountId) return { kind: 'denied' as const, reason: 'draft_owner_mismatch' };
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
    if (args.expectedRevision !== undefined && args.expectedRevision !== row.revision) {
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
  returns: v.any(),
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
  returns: v.any(),
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

export const listTeacherObservationHistory = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.any(),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.teacherProfileId);
    if (!teacher) return { kind: 'not_found' as const };
    const action: DanielsonAction = teacher.accountId === args.actorAccountId
      ? 'published_record:read'
      : 'teacher_report:read';
    const access = await authorizeTeacher(ctx, args.actorAccountId, teacher._id, action);
    if (access.kind === 'denied') return access;
    const page = await ctx.db.query('observation_records')
      .withIndex('by_org_teacher_status_submitted', (query) => query
        .eq('organizationId', teacher.organizationId)
        .eq('teacherProfileId', teacher._id)
        .eq('status', 'submitted'))
      .order('desc')
      .paginate(args.paginationOpts);
    return {
      kind: 'allowed' as const,
      page: {
        ...page,
        page: page.page.map((record) => ({
          observationId: String(record._id),
          observationType: record.observationType,
          schoolYear: record.schoolYear,
          observedAt: record.observedAt,
          publishedAt: record.publishedAt,
        })),
      },
    };
  },
});

export const listMyObservationDrafts = internalQuery({
  args: {
    actorAccountId: v.id('accounts'),
    paginationOpts: paginationOptsValidator,
  },
  returns: v.any(),
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
    const [accounts, profiles] = await Promise.all([
      ctx.db.query('accounts')
        .withIndex('by_organizationId', (query) => query.eq('organizationId', actor.organizationId))
        .take(MAX_QUEUE_TEACHERS + 1),
      ctx.db.query('teacher_profiles')
        .withIndex('by_organizationId_and_isActive', (query) => query
          .eq('organizationId', actor.organizationId)
          .eq('isActive', true))
        .take(MAX_QUEUE_TEACHERS + 1),
    ]);
    if (accounts.length > MAX_QUEUE_TEACHERS || profiles.length > MAX_QUEUE_TEACHERS) {
      return { kind: 'queue_capacity_exceeded' as const };
    }
    const accountById = new Map(accounts.map((account) => [String(account._id), account]));
    const profileById = new Map(profiles.map((profile) => [String(profile._id), profile]));
    const items = page.page.map((row) => {
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
  returns: v.any(),
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
) {
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
    buildDanielsonGraph().graph,
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
  for (const row of reviews) latestReviews.set(row.logicalReviewId, row);
  for (const raw of replay.state.reviews) {
    const logicalId = String(raw.logicalReviewId ?? raw.reviewId);
    const existing = latestReviews.get(logicalId);
    if (!existing) await insertReviewRow(ctx, organizationId, teacherId, raw, now);
    else if (JSON.stringify(existing.review) !== JSON.stringify(reviewPayload(raw))) {
      await insertReviewRow(ctx, organizationId, teacherId, raw, now, `amendment-${now}`);
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
  returns: v.any(),
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
    const priorRows = await ctx.db.query('observation_amendments')
      .withIndex('by_org_observation_version', (query) => query
        .eq('organizationId', row.organizationId)
        .eq('observationId', row._id))
      .order('asc')
      .take(MAX_AMENDMENTS + 1);
    if (priorRows.length > MAX_AMENDMENTS) return { kind: 'correction_history_capacity_exceeded' as const };
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
    if (outcomeRows.length > MAX_HISTORY_ROWS || existingSupersessions.length > MAX_HISTORY_ROWS) {
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
      insertedSupersessions.push({ ...supersession, _id: id });
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
      const replay = await replayTeacherEvidence({
        teacherId: String(row.teacherProfileId),
        evidence: [...activeEvidence, ...replacementCommands],
        graph: buildDanielsonGraph().graph,
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
          for (const skillId of getComponentSkillIds(buildDanielsonGraph().graph, source.componentId)) {
            affected.add(skillId);
          }
        }
      }
      await reconcileBySkill(ctx, row.organizationId, String(row.teacherProfileId), affected, replay, args.now);
      await refreshAttentionSummary(ctx, row.organizationId, row.teacherProfileId, args.now);
    }
    return {
      kind: 'amended' as const,
      amendment: { ...applied.amendment, amendmentId: String(amendmentId) },
      supersessions: applied.supersessions,
      receipt: { amendmentId: String(amendmentId), version: applied.amendment.version },
    };
  },
});
