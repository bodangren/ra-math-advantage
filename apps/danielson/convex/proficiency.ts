import { internalMutation, internalQuery } from './_generated/server';
import type { Id } from './_generated/dataModel';
import { v } from 'convex/values';

import { buildDanielsonGraph } from '../lib/proficiency/graph';
import { createDanielsonTeacherProficiencyPort } from '../lib/proficiency/convex-repository';
import { normalizeObservationEvidence, observationFingerprint } from '../lib/proficiency/evidence';
import {
  processTeacherEvidence,
  projectTeacherKnowledgeState,
  projectTeacherPriority,
} from '../lib/proficiency/processor';
import { authorizeDanielsonAction, type DanielsonAction } from '../lib/foundation/authorization';
import { resolveAccessContextForDb } from './foundation';

const sourceTypeValidator = v.union(
  v.literal('walkthrough'),
  v.literal('formal_q1'),
  v.literal('formal_q4'),
);
const evidenceValidator = v.object({
  kind: v.optional(v.union(v.literal('rated'), v.literal('not_enough_evidence'))),
  idempotencyKey: v.string(),
  organizationId: v.id('organizations'),
  teacherId: v.optional(v.string()),
  teacherProfileId: v.optional(v.string()),
  sourceRecordId: v.string(),
  formalObservationId: v.optional(v.string()),
  sourceType: sourceTypeValidator,
  componentId: v.string(),
  targetSkillIds: v.array(v.string()),
  observerId: v.optional(v.string()),
  observerAccountId: v.optional(v.string()),
  occurredAt: v.optional(v.string()),
  eventTime: v.optional(v.string()),
  sourceVersion: v.string(),
  provenanceGroupId: v.string(),
  rating: v.optional(v.number()),
  outcome: v.optional(v.union(
    v.object({ kind: v.literal('rated'), rating: v.number() }),
    v.object({ kind: v.literal('not_enough_evidence') }),
  )),
});
const targetEvidenceReturnValidator = v.object({
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
  sourceType: sourceTypeValidator,
  occurredAt: v.string(),
});
const knowledgeStateReturnValidator = v.object({
  nodeId: v.string(),
  mastery: v.number(),
  retention: v.number(),
  isProficient: v.boolean(),
  state: v.union(v.literal('mastered'), v.literal('decaying'), v.literal('inProgress'), v.literal('untouched')),
  lastUpdated: v.optional(v.number()),
});
const priorityReturnValidator = v.object({
  teacherId: v.string(),
  skillId: v.string(),
  componentId: v.optional(v.string()),
  due: v.boolean(),
  overdueDays: v.number(),
  currentProficiency: v.object({
    rawRating: v.union(v.number(), v.null()),
    points: v.union(v.number(), v.null()),
    passes: v.boolean(),
  }),
  evidenceGaps: v.array(v.string()),
  approvedPriorityInputs: v.array(v.string()),
});
const ingestReturnsValidator = v.union(
  v.object({ kind: v.literal('denied'), reason: v.string() }),
  v.object({
    kind: v.union(v.literal('applied'), v.literal('replayed'), v.literal('idempotency_conflict')),
    targetEvidence: v.array(targetEvidenceReturnValidator),
    knowledgeState: v.array(knowledgeStateReturnValidator),
    priority: v.array(priorityReturnValidator),
  }),
);
const priorityReturnsValidator = v.union(
  v.object({ kind: v.literal('denied'), reason: v.string() }),
  v.object({
    kind: v.literal('allowed'),
    items: v.array(priorityReturnValidator),
    knowledgeState: v.array(knowledgeStateReturnValidator),
  }),
);

type ScopeResult =
  | { kind: 'allowed'; teacherId: string; teacherAccountId: Id<'accounts'> }
  | { kind: 'denied'; reason: string };

async function resolveScope(
  ctx: { db: { get: (id: Id<'teacher_profiles'> | Id<'accounts'>) => Promise<Record<string, unknown> | null> } },
  organizationId: Id<'organizations'>,
  teacherId: string,
  actorAccountId: Id<'accounts'>,
): Promise<ScopeResult> {
  const actor = await ctx.db.get(actorAccountId);
  if (!actor || actor.organizationId !== organizationId || actor.isActive !== true) {
    return { kind: 'denied', reason: 'actor_scope_denied' };
  }
  const teacher = await ctx.db.get(teacherId as Id<'teacher_profiles'>);
  if (!teacher || teacher.organizationId !== organizationId || teacher.isActive !== true) {
    return { kind: 'denied', reason: 'teacher_scope_denied' };
  }
  return {
    kind: 'allowed',
    teacherId,
    teacherAccountId: teacher.accountId as Id<'accounts'>,
  };
}

function submitAction(sourceType: 'walkthrough' | 'formal_q1' | 'formal_q4'): DanielsonAction {
  if (sourceType === 'walkthrough') return 'walkthrough:submit';
  if (sourceType === 'formal_q1') return 'q1_observation:submit';
  return 'q4_observation:submit';
}

async function authorizeTeacherAction(
  ctx: Parameters<typeof resolveAccessContextForDb>[0],
  actorAccountId: Id<'accounts'>,
  teacherAccountId: Id<'accounts'>,
  action: DanielsonAction,
) {
  const context = await resolveAccessContextForDb(ctx, {
    actorAccountId,
    subjectAccountId: teacherAccountId,
  });
  return authorizeDanielsonAction(context, action);
}

/**
 * Persist one teacher observation and its canonical SRS/KST projections.
 * This is internal because the caller must already be a server-authorized
 * observation workflow.
 */
export const ingestObservationEvidence = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    organizationId: v.id('organizations'),
    evidence: evidenceValidator,
    now: v.string(),
  },
  returns: ingestReturnsValidator,
  handler: async (ctx, args) => {
    const graph = buildDanielsonGraph().graph;
    const normalized = normalizeObservationEvidence(args.evidence, graph);
    if (normalized.organizationId !== args.organizationId) {
      return { kind: 'denied' as const, reason: 'organization_scope_denied' };
    }
    if (normalized.observerId !== String(args.actorAccountId)) {
      return { kind: 'denied' as const, reason: 'observer_mismatch' };
    }
    const scope = await resolveScope(ctx, args.organizationId, normalized.teacherId, args.actorAccountId);
    if (scope.kind === 'denied') return scope;
    const decision = await authorizeTeacherAction(
      ctx,
      args.actorAccountId,
      scope.teacherAccountId,
      submitAction(normalized.sourceType),
    );
    if (!decision.allowed) return { kind: 'denied' as const, reason: decision.reason };
    const existing = await ctx.db.query('teacher_proficiency_idempotency')
      .withIndex('by_organizationId_and_idempotencyKey', (query) => query
        .eq('organizationId', args.organizationId)
        .eq('idempotencyKey', normalized.idempotencyKey))
      .unique();
    if (existing) {
      return existing.fingerprint === observationFingerprint(normalized)
        ? { kind: 'replayed' as const, ...existing.result }
        : {
            kind: 'idempotency_conflict' as const,
            targetEvidence: [],
            knowledgeState: [],
            priority: [],
          };
    }
    const port = createDanielsonTeacherProficiencyPort(ctx, args.organizationId);
    return processTeacherEvidence({
      evidence: normalized,
      graph,
      now: args.now,
      port,
    });
  },
});

/** Read a bounded, organization-scoped walkthrough-priority projection. */
export const readTeacherPriority = internalQuery({
  args: {
    organizationId: v.id('organizations'),
    teacherId: v.string(),
    now: v.string(),
    actorAccountId: v.id('accounts'),
  },
  returns: priorityReturnsValidator,
  handler: async (ctx, args) => {
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor || actor.organizationId !== args.organizationId || actor.isActive !== true) {
      return { kind: 'denied' as const, reason: 'actor_scope_denied' };
    }
    const teacher = await ctx.db.get(args.teacherId as Id<'teacher_profiles'>);
    if (!teacher || teacher.organizationId !== args.organizationId || teacher.isActive !== true) {
      return { kind: 'denied' as const, reason: 'teacher_scope_denied' };
    }
    const decision = await authorizeTeacherAction(
      ctx,
      args.actorAccountId,
      teacher.accountId as Id<'accounts'>,
      'teacher_report:read',
    );
    if (!decision.allowed) return { kind: 'denied' as const, reason: decision.reason };
    const nowMs = Date.parse(args.now);
    if (!Number.isFinite(nowMs)) {
      return { kind: 'denied' as const, reason: 'invalid_now' };
    }
    const [cardRows, proficiencyRows] = await Promise.all([
      ctx.db
        .query('teacher_srs_cards')
        .withIndex('by_organizationId_and_teacherId', (query) => query
          .eq('organizationId', args.organizationId)
          .eq('teacherId', args.teacherId))
        .order('asc')
        .take(200),
      ctx.db
        .query('teacher_proficiency')
        .withIndex('by_organizationId_and_teacherId', (query) => query
          .eq('organizationId', args.organizationId)
          .eq('teacherId', args.teacherId))
        .order('asc')
        .take(200),
    ]);
    const graph = buildDanielsonGraph().graph;
    const observedSkillIds = [...new Set([
      ...cardRows.map((row) => row.skillId),
      ...proficiencyRows.map((row) => row.skillId),
    ])];
    const approvedSkillIds = graph.nodes
      .filter((node) => node.kind === 'skill' && node.reviewStatus === 'approved')
      .map((node) => node.id)
      .sort();
    const knowledgeState = projectTeacherKnowledgeState(
      cardRows.map((row) => row.card) as never,
      proficiencyRows.map((row) => row.projection as Record<string, unknown>),
      graph,
      observedSkillIds,
      nowMs,
    );
    return {
      kind: 'allowed' as const,
      knowledgeState,
      items: projectTeacherPriority(
        args.teacherId,
        cardRows.map((row) => row.card) as never,
        proficiencyRows.map((row) => row.projection as Record<string, unknown>),
        graph,
        approvedSkillIds,
        nowMs,
      ),
    };
  },
});
