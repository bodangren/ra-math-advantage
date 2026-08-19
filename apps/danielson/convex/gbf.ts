import { v } from 'convex/values';

import { internalMutation, type MutationCtx, type QueryCtx } from './_generated/server';
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
  v.object({ kind: v.literal('capacity_exceeded') }),
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

function compareAssignmentOrder(
  left: Pick<Doc<'teacher_gbf_assignments'>, 'assignedAt' | 'requestId' | 'actorAccountId'>,
  right: Pick<Doc<'teacher_gbf_assignments'>, 'assignedAt' | 'requestId' | 'actorAccountId'>,
) {
  const time = left.assignedAt - right.assignedAt;
  if (time !== 0) return time;
  const request = left.requestId.localeCompare(right.requestId);
  if (request !== 0) return request;
  return String(left.actorAccountId).localeCompare(String(right.actorAccountId));
}

async function selectCurrentAssignment(
  ctx: Pick<MutationCtx, 'db'>,
  teacher: Doc<'teacher_profiles'>,
  candidate: Doc<'teacher_gbf_assignments'>,
) {
  const current = teacher.currentGbfAssignmentId
    ? await ctx.db.get(teacher.currentGbfAssignmentId)
    : null;
  if (
    current
    && current.organizationId === teacher.organizationId
    && current.teacherProfileId === teacher._id
    && compareAssignmentOrder(current, candidate) >= 0
  ) return;
  await ctx.db.patch(teacher._id, {
    currentGbfAssignmentId: candidate._id,
    updatedAt: Math.max(teacher.updatedAt, candidate.assignedAt),
  });
}

function newestAssignment(rows: readonly Doc<'teacher_gbf_assignments'>[]) {
  return rows.reduce<Doc<'teacher_gbf_assignments'> | null>((newest, row) => (
    !newest || compareAssignmentOrder(row, newest) > 0 ? row : newest
  ), null);
}

async function readBoundedTeacherAssignments(
  ctx: DbCtx,
  organizationId: Id<'organizations'> | string,
  teacherProfileId: Id<'teacher_profiles'> | string,
) {
  const rows = await database(ctx).query('teacher_gbf_assignments')
    .withIndex('by_org_teacher_time', (query) => query
      .eq('organizationId', organizationId as Id<'organizations'>)
      .eq('teacherProfileId', teacherProfileId as Id<'teacher_profiles'>))
    .order('desc')
    .take(MAX_TEACHER_ASSIGNMENTS + 1);
  return rows.length > MAX_TEACHER_ASSIGNMENTS ? null : rows;
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
  const teacher = await database(ctx).get(teacherProfileId as Id<'teacher_profiles'>);
  if (
    teacher?.organizationId === organizationId
    && teacher.currentGbfAssignmentId
  ) {
    const current = await database(ctx).get(teacher.currentGbfAssignmentId);
    if (
      !current
      || current.organizationId !== organizationId
      || current.teacherProfileId !== teacherProfileId
    ) return { kind: 'capacity_exceeded' };
    return { kind: 'allowed', assignment: assignmentView(current) };
  }
  if (teacher?.organizationId === organizationId && teacher.currentGbfAssignmentId === null) {
    return { kind: 'not_configured' };
  }
  const rows = await readBoundedTeacherAssignments(ctx, organizationId, teacherProfileId);
  if (!rows) return { kind: 'capacity_exceeded' };
  const current = newestAssignment(rows);
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
  | { kind: 'migration_required' }
  | { kind: 'allowed'; assignmentsByTeacher: Map<string, GbfAssignmentView> }
> {
  const teachers = await database(ctx).query('teacher_profiles')
    .withIndex('by_organizationId_and_isActive', (query) => query
      .eq('organizationId', organizationId as Id<'organizations'>)
      .eq('isActive', true))
    .take(MAX_ORGANIZATION_ASSIGNMENTS + 1);
  if (teachers.length > MAX_ORGANIZATION_ASSIGNMENTS) return { kind: 'capacity_exceeded' };
  if (teachers.some((teacher) => teacher.currentGbfAssignmentId === undefined)) {
    return { kind: 'migration_required' };
  }
  const rows = await Promise.all(teachers.map((teacher) => (
    teacher.currentGbfAssignmentId
      ? database(ctx).get(teacher.currentGbfAssignmentId)
      : Promise.resolve(null)
  )));
  const assignmentsByTeacher = new Map<string, GbfAssignmentView>();
  for (let index = 0; index < rows.length; index += 1) {
    const row = rows[index];
    const teacher = teachers[index];
    if (
      !row
      || !teacher
      || row.organizationId !== organizationId
      || row.teacherProfileId !== teacher._id
    ) continue;
    const teacherProfileId = String(row.teacherProfileId);
    assignmentsByTeacher.set(teacherProfileId, assignmentView(row));
  }
  return { kind: 'allowed', assignmentsByTeacher };
}

/** Backfill one legacy profile without adding assignment-history reads to reports. */
export const backfillTeacherGbfAssignmentPointer = internalMutation({
  args: { teacherProfileId: v.id('teacher_profiles') },
  returns: v.union(
    v.object({ kind: v.literal('invalid_input') }),
    v.object({ kind: v.literal('capacity_exceeded') }),
    v.object({
      kind: v.literal('migrated'),
      currentAssignmentId: v.union(v.string(), v.null()),
    }),
  ),
  handler: async (ctx, args) => {
    const teacher = await ctx.db.get(args.teacherProfileId);
    if (!teacher) return { kind: 'invalid_input' as const };
    const rows = await readBoundedTeacherAssignments(
      ctx,
      teacher.organizationId,
      teacher._id,
    );
    if (!rows) return { kind: 'capacity_exceeded' as const };
    const newest = newestAssignment(rows);
    await ctx.db.patch(teacher._id, {
      currentGbfAssignmentId: newest?._id ?? null,
    });
    return {
      kind: 'migrated' as const,
      currentAssignmentId: newest ? String(newest._id) : null,
    };
  },
});

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
    const fingerprint = assignmentFingerprint({
      teacherProfileId: String(args.teacherProfileId),
      sequenceReleaseId: args.sequenceReleaseId,
      graphReleaseId: args.graphReleaseId,
    });
    const actor = await ctx.db.get(args.actorAccountId);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    const organizationId = actor.organizationId;
    const existing = await ctx.db.query('teacher_gbf_assignments')
      .withIndex('by_org_actor_request', (query) => query
        .eq('organizationId', organizationId)
        .eq('actorAccountId', args.actorAccountId)
        .eq('requestId', args.requestId))
      .unique();
    if (existing) {
      if (existing.fingerprint !== fingerprint) return { kind: 'idempotency_conflict' as const };
      const replayTeacher = await ctx.db.get(existing.teacherProfileId);
      const history = await readBoundedTeacherAssignments(
        ctx,
        existing.organizationId,
        existing.teacherProfileId,
      );
      if (!history) return { kind: 'capacity_exceeded' as const };
      const newest = newestAssignment(history);
      if (replayTeacher && newest) await selectCurrentAssignment(ctx, replayTeacher, newest);
      return {
        kind: 'replayed' as const,
        assignmentId: String(existing._id),
        sequenceReleaseId: existing.sequenceReleaseId,
        graphReleaseId: existing.graphReleaseId,
      };
    }
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
    if (!teacher.isActive || teacher.organizationId !== organizationId) {
      return {
        kind: 'denied' as const,
        reason: teacher.organizationId === organizationId
          ? 'target_inactive'
          : 'cross_organization',
      };
    }

    const priorAssignments = await readBoundedTeacherAssignments(
      ctx,
      organizationId,
      args.teacherProfileId,
    );
    if (!priorAssignments || priorAssignments.length >= MAX_TEACHER_ASSIGNMENTS) {
      return { kind: 'capacity_exceeded' as const };
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
    const assignment = await ctx.db.get(assignmentId);
    if (!assignment) throw new Error('assignment_insert_failed');
    const newest = newestAssignment([...priorAssignments, assignment]);
    if (newest) await selectCurrentAssignment(ctx, teacher, newest);
    return {
      kind: 'assigned' as const,
      assignmentId: String(assignmentId),
      sequenceReleaseId: snapshot.sequenceReleaseId,
      graphReleaseId: snapshot.graphReleaseId,
    };
  },
});
