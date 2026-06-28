import { internalMutation, internalQuery } from '../_generated/server';
import { v } from 'convex/values';
import type { MutationCtx, QueryCtx } from '../_generated/server';
import type { Id } from '../_generated/dataModel';

export type CreateParentLinkResult =
  | { ok: true; linkId: string }
  | { ok: false; reason: 'forbidden' | 'parent_not_found' | 'student_not_found' | 'invalid_target_role' | 'org_mismatch' };

export type RevokeParentLinkResult =
  | { ok: true; linkId: string }
  | { ok: false; reason: 'forbidden' | 'link_not_found' };

export async function createParentLink(
  ctx: MutationCtx,
  args: { callerProfileId: Id<'profiles'>; parentProfileId: Id<'profiles'>; studentProfileId: Id<'profiles'> },
): Promise<CreateParentLinkResult> {
  const caller = await ctx.db.get(args.callerProfileId);
  if (!caller || (caller.role !== 'teacher' && caller.role !== 'admin')) {
    return { ok: false, reason: 'forbidden' };
  }

  const parent = await ctx.db.get(args.parentProfileId);
  if (!parent) {
    return { ok: false, reason: 'parent_not_found' };
  }
  if (parent.role !== 'parent') {
    return { ok: false, reason: 'invalid_target_role' };
  }

  const student = await ctx.db.get(args.studentProfileId);
  if (!student) {
    return { ok: false, reason: 'student_not_found' };
  }
  if (student.role !== 'student') {
    return { ok: false, reason: 'invalid_target_role' };
  }

  if (parent.organizationId !== student.organizationId) {
    return { ok: false, reason: 'org_mismatch' };
  }

  const existing = await ctx.db
    .query('parent_links')
    .withIndex('by_parent_and_student', (q) =>
      q.eq('parentId', args.parentProfileId).eq('studentId', args.studentProfileId),
    )
    .first();

  if (existing && existing.status === 'active') {
    return { ok: true, linkId: existing._id };
  }

  const now = Date.now();
  const linkId = await ctx.db.insert('parent_links', {
    parentId: args.parentProfileId,
    studentId: args.studentProfileId,
    organizationId: parent.organizationId,
    status: 'active',
    createdBy: args.callerProfileId,
    createdAt: now,
  });

  return { ok: true, linkId };
}

export async function revokeParentLink(
  ctx: MutationCtx,
  args: { callerProfileId: Id<'profiles'>; linkId: Id<'parent_links'> },
): Promise<RevokeParentLinkResult> {
  const caller = await ctx.db.get(args.callerProfileId);
  if (!caller || (caller.role !== 'teacher' && caller.role !== 'admin')) {
    return { ok: false, reason: 'forbidden' };
  }

  const link = await ctx.db.get(args.linkId);
  if (!link) {
    return { ok: false, reason: 'link_not_found' };
  }

  if (link.status !== 'active') {
    return { ok: true, linkId: link._id };
  }

  const now = Date.now();
  await ctx.db.patch(link._id, {
    status: 'revoked',
    revokedAt: now,
    revokedBy: args.callerProfileId,
  });

  return { ok: true, linkId: link._id };
}

export async function listParentLinks(
  ctx: QueryCtx,
  args: { parentProfileId: Id<'profiles'> },
) {
  return ctx.db
    .query('parent_links')
    .withIndex('by_parent', (q) => q.eq('parentId', args.parentProfileId))
    .collect();
}

/**
 * Convex internalMutation wrapper: create parent link mutation.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const createParentLinkMutation = internalMutation({
  args: {
    callerProfileId: v.id('profiles'),
    parentProfileId: v.id('profiles'),
    studentProfileId: v.id('profiles'),
  },
  handler: createParentLink,
});

/**
 * Convex internalMutation wrapper: revoke parent link mutation.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const revokeParentLinkMutation = internalMutation({
  args: {
    callerProfileId: v.id('profiles'),
    linkId: v.id('parent_links'),
  },
  handler: revokeParentLink,
});

/**
 * Convex internalQuery wrapper: list parent links query.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const listParentLinksQuery = internalQuery({
  args: {
    parentProfileId: v.id('profiles'),
  },
  handler: listParentLinks,
});
