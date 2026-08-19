import { v } from 'convex/values';

import { internalMutation, type QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { resolveAccessContextForDb } from './foundation';
import { authorizeDanielsonAction } from '../lib/foundation/authorization';
import { GBF_GRAPH_RELEASE } from '../lib/gbf/graph';
import { createCurrentGbfAssignment } from '../lib/gbf/progress';
import { GBF_SEQUENCE_RELEASE } from '../lib/gbf/source';

const MAX_REQUEST_ID_LENGTH = 200;
const MAX_TEACHER_ASSIGNMENTS = 100;
const MAX_ORGANIZATION_ASSIGNMENTS = 250;

const deniedValidator = v.object({ kind: v.literal('denied'), reason: v.string() });
const receiptFields = {
  assignmentId: v.string(),
  sequenceReleaseId: v.string(),
  graphReleaseId: v.string(),
};
const assignmentResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('invalid_input') }),
  v.object({ kind: v.literal('unsupported_release') }),
  v.object({ kind: v.literal('idempotency_conflict') }),
  v.object({ kind: v.literal('assigned'), ...receiptFields }),
  v.object({ kind: v.literal('replayed'), ...receiptFields }),
);

export type GbfAssignmentView = {
  assignmentId: string;
  teacherProfileId: string;
  sequenceReleaseId: string;
  graphReleaseId: string;
  assignedSkillIds: string[];
  unresolvedGapSkillIds: string[];
  assignedAt: number;
};

type DbCtx = { db: unknown };

function database(ctx: DbCtx): QueryCtx['db'] {
  return ctx.db as QueryCtx['db'];
}

function assignmentView(row: Doc<'teacher_gbf_assignments'>): GbfAssignmentView {
  return {
    assignmentId: String(row._id),
    teacherProfileId: String(row.teacherProfileId),
    sequenceReleaseId: row.sequenceReleaseId,
    graphReleaseId: row.graphReleaseId,
    assignedSkillIds: [...row.assignedSkillIds],
    unresolvedGapSkillIds: [...row.unsequencedGapSkillIds],
    assignedAt: row.assignedAt,
  };
}

function assignmentFingerprint(input: {
  teacherProfileId: string;
  sequenceReleaseId: string;
  graphReleaseId: string;
}) {
  return JSON.stringify({
    teacherProfileId: input.teacherProfileId,
    sequenceReleaseId: input.sequenceReleaseId,
    graphReleaseId: input.graphReleaseId,
  });
}

/** Read the latest immutable assignment for one teacher. */
export async function readTeacherGbfAssignment(
  ctx: DbCtx,
  organizationId: Id<'organizations'> | string,
  teacherProfileId: Id<'teacher_profiles'> | string,
): Promise<
  | { kind: 'not_configured' }
  | { kind: 'capacity_exceeded' }
  | { kind: 'allowed'; assignment: GbfAssignmentView }
> {
  const rows = await database(ctx).query('teacher_gbf_assignments')
    .withIndex('by_org_teacher_time', (query) => query
      .eq('organizationId', organizationId as Id<'organizations'>)
      .eq('teacherProfileId', teacherProfileId as Id<'teacher_profiles'>))
    .order('desc')
    .take(MAX_TEACHER_ASSIGNMENTS + 1);
  if (rows.length > MAX_TEACHER_ASSIGNMENTS) return { kind: 'capacity_exceeded' };
  const current = rows[0];
  return current
    ? { kind: 'allowed', assignment: assignmentView(current) }
    : { kind: 'not_configured' };
}

/** Read current organization assignments in one bounded query. */
export async function readOrganizationCurrentGbfAssignments(
  ctx: DbCtx,
  organizationId: Id<'organizations'> | string,
): Promise<
  | { kind: 'capacity_exceeded' }
  | { kind: 'allowed'; assignmentsByTeacher: Map<string, GbfAssignmentView> }
> {
  const rows = await database(ctx).query('teacher_gbf_assignments')
    .withIndex('by_org_time', (query) => query
      .eq('organizationId', organizationId as Id<'organizations'>))
    .order('desc')
    .take(MAX_ORGANIZATION_ASSIGNMENTS + 1);
  if (rows.length > MAX_ORGANIZATION_ASSIGNMENTS) return { kind: 'capacity_exceeded' };
  const assignmentsByTeacher = new Map<string, GbfAssignmentView>();
  for (const row of rows) {
    const teacherProfileId = String(row.teacherProfileId);
    if (!assignmentsByTeacher.has(teacherProfileId)) {
      assignmentsByTeacher.set(teacherProfileId, assignmentView(row));
    }
  }
  return { kind: 'allowed', assignmentsByTeacher };
}

export const assignTeacherGbfTrack = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    sequenceReleaseId: v.string(),
    graphReleaseId: v.string(),
    requestId: v.string(),
    now: v.number(),
  },
  returns: assignmentResultValidator,
  handler: async (ctx, args) => {
    if (
      !args.requestId.trim()
      || args.requestId.length > MAX_REQUEST_ID_LENGTH
      || !Number.isFinite(args.now)
    ) return { kind: 'invalid_input' as const };
    if (
      args.sequenceReleaseId !== GBF_SEQUENCE_RELEASE.releaseId
      || args.graphReleaseId !== GBF_GRAPH_RELEASE.releaseId
    ) return { kind: 'unsupported_release' as const };

    const teacher = await ctx.db.get(args.teacherProfileId);
    if (!teacher) return { kind: 'denied' as const, reason: 'target_inactive' };
    const accessContext = await resolveAccessContextForDb(ctx, {
      actorAccountId: args.actorAccountId,
      subjectAccountId: teacher.accountId,
    });
    const decision = authorizeDanielsonAction(accessContext, 'gbf:assign');
    if (!decision.allowed) return { kind: 'denied' as const, reason: decision.reason };
    if (!teacher.isActive || teacher.organizationId !== accessContext.actor?.organizationId) {
      return {
        kind: 'denied' as const,
        reason: teacher.organizationId === accessContext.actor?.organizationId
          ? 'target_inactive'
          : 'cross_organization',
      };
    }

    const fingerprint = assignmentFingerprint({
      teacherProfileId: String(args.teacherProfileId),
      sequenceReleaseId: args.sequenceReleaseId,
      graphReleaseId: args.graphReleaseId,
    });
    const organizationId = teacher.organizationId;
    const existing = await ctx.db.query('teacher_gbf_assignments')
      .withIndex('by_org_request', (query) => query
        .eq('organizationId', organizationId)
        .eq('requestId', args.requestId))
      .unique();
    if (existing) {
      if (existing.fingerprint !== fingerprint) return { kind: 'idempotency_conflict' as const };
      return {
        kind: 'replayed' as const,
        assignmentId: String(existing._id),
        sequenceReleaseId: existing.sequenceReleaseId,
        graphReleaseId: existing.graphReleaseId,
      };
    }

    const snapshot = createCurrentGbfAssignment({
      assignmentId: 'pending',
      organizationId: String(organizationId),
      teacherProfileId: String(args.teacherProfileId),
      assignedByAccountId: String(args.actorAccountId),
      requestId: args.requestId,
      assignedAt: args.now,
    });
    const assignmentId = await ctx.db.insert('teacher_gbf_assignments', {
      organizationId,
      teacherProfileId: args.teacherProfileId,
      sequenceReleaseId: snapshot.sequenceReleaseId,
      graphReleaseId: snapshot.graphReleaseId,
      assignedSkillIds: snapshot.assignedSkillIds,
      unsequencedGapSkillIds: snapshot.unresolvedGapSkillIds,
      actorAccountId: args.actorAccountId,
      requestId: args.requestId,
      fingerprint,
      assignedAt: args.now,
    });
    return {
      kind: 'assigned' as const,
      assignmentId: String(assignmentId),
      sequenceReleaseId: snapshot.sequenceReleaseId,
      graphReleaseId: snapshot.graphReleaseId,
    };
  },
});
