import { v } from 'convex/values';

import { internalMutation, type QueryCtx } from './_generated/server';
import type { Doc, Id } from './_generated/dataModel';
import { resolveAccessContextForDb } from './foundation';
import { authorizeDanielsonAction } from '../lib/foundation/authorization';
import { createCurrentGbfAssignment } from '../lib/gbf/progress';

const MAX_ORGANIZATION_ASSIGNMENTS = 250;

const deniedValidator = v.object({ kind: v.literal('denied'), reason: v.string() });
const receiptFields = {
  assignmentId: v.string(),
};
const assignmentResultValidator = v.union(
  deniedValidator,
  v.object({ kind: v.literal('invalid_input') }),
  v.object({ kind: v.literal('assigned'), ...receiptFields }),
  v.object({ kind: v.literal('replayed'), ...receiptFields }),
);

export type GbfAssignmentView = {
  assignmentId: string;
  teacherProfileId: string;
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
    assignedSkillIds: [...row.assignedSkillIds],
    unresolvedGapSkillIds: [...row.unsequencedGapSkillIds],
    assignedAt: row.assignedAt,
  };
}

/** Read the assignment selected on the teacher profile. */
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
  if (teacher?.organizationId !== organizationId || !teacher.currentGbfAssignmentId) {
    return { kind: 'not_configured' };
  }
  const current = await database(ctx).get(teacher.currentGbfAssignmentId);
  if (
    !current
    || current.organizationId !== organizationId
    || current.teacherProfileId !== teacherProfileId
  ) return { kind: 'capacity_exceeded' };
  return { kind: 'allowed', assignment: assignmentView(current) };
}

/** Read current assignments for all active teachers in one organization. */
export async function readOrganizationCurrentGbfAssignments(
  ctx: DbCtx,
  organizationId: Id<'organizations'> | string,
): Promise<
  | { kind: 'capacity_exceeded' }
  | { kind: 'allowed'; assignmentsByTeacher: Map<string, GbfAssignmentView> }
> {
  const teachers = await database(ctx).query('teacher_profiles')
    .withIndex('by_organizationId_and_isActive', (query) => query
      .eq('organizationId', organizationId as Id<'organizations'>)
      .eq('isActive', true))
    .take(MAX_ORGANIZATION_ASSIGNMENTS + 1);
  if (teachers.length > MAX_ORGANIZATION_ASSIGNMENTS) return { kind: 'capacity_exceeded' };
  const rows = await Promise.all(teachers.map((teacher) => (
    teacher.currentGbfAssignmentId
      ? database(ctx).get(teacher.currentGbfAssignmentId)
      : Promise.resolve(null)
  )));
  const assignmentsByTeacher = new Map<string, GbfAssignmentView>();
  for (const row of rows) {
    if (row?.organizationId === organizationId) {
      assignmentsByTeacher.set(String(row.teacherProfileId), assignmentView(row));
    }
  }
  return { kind: 'allowed', assignmentsByTeacher };
}

export const assignTeacherGbfTrack = internalMutation({
  args: {
    actorAccountId: v.id('accounts'),
    teacherProfileId: v.id('teacher_profiles'),
    now: v.number(),
  },
  returns: assignmentResultValidator,
  handler: async (ctx, args) => {
    if (!Number.isFinite(args.now)) return { kind: 'invalid_input' as const };

    const [actor, teacher] = await Promise.all([
      ctx.db.get(args.actorAccountId),
      ctx.db.get(args.teacherProfileId),
    ]);
    if (!actor?.isActive) return { kind: 'denied' as const, reason: 'account_inactive' };
    if (!teacher) return { kind: 'denied' as const, reason: 'target_inactive' };
    const accessContext = await resolveAccessContextForDb(ctx, {
      actorAccountId: args.actorAccountId,
      subjectAccountId: teacher.accountId,
    });
    const decision = authorizeDanielsonAction(accessContext, 'gbf:assign');
    if (!decision.allowed) return { kind: 'denied' as const, reason: decision.reason };
    if (!teacher.isActive || teacher.organizationId !== actor.organizationId) {
      return {
        kind: 'denied' as const,
        reason: teacher.organizationId === actor.organizationId
          ? 'target_inactive'
          : 'cross_organization',
      };
    }

    const snapshot = createCurrentGbfAssignment({
      assignmentId: 'pending',
      organizationId: String(actor.organizationId),
      teacherProfileId: String(args.teacherProfileId),
      assignedByAccountId: String(args.actorAccountId),
      assignedAt: args.now,
    });
    const current = teacher.currentGbfAssignmentId ? await ctx.db.get(teacher.currentGbfAssignmentId) : null;
    if (
      current
      && current.organizationId === actor.organizationId
      && current.teacherProfileId === teacher._id
      && current.assignedSkillIds.join('\0') === snapshot.assignedSkillIds.join('\0')
      && current.unsequencedGapSkillIds.join('\0') === snapshot.unresolvedGapSkillIds.join('\0')
    ) {
      return {
        kind: 'replayed' as const,
        assignmentId: String(current._id),
      };
    }

    const assignmentId = await ctx.db.insert('teacher_gbf_assignments', {
      organizationId: actor.organizationId,
      teacherProfileId: args.teacherProfileId,
      assignedSkillIds: snapshot.assignedSkillIds,
      unsequencedGapSkillIds: snapshot.unresolvedGapSkillIds,
      actorAccountId: args.actorAccountId,
      assignedAt: args.now,
    });
    await ctx.db.patch(teacher._id, {
      currentGbfAssignmentId: assignmentId,
      updatedAt: Math.max(teacher.updatedAt, args.now),
    });
    return {
      kind: 'assigned' as const,
      assignmentId: String(assignmentId),
    };
  },
});
