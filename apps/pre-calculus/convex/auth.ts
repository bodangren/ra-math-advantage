import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

const roleValidator = v.union(v.literal('student'), v.literal('teacher'), v.literal('admin'));
const accountFields = {
  id: v.id('profiles'), username: v.string(), role: roleValidator,
  organizationId: v.id('organizations'), displayName: v.string(), organizationName: v.string(),
};

export const getCredentialByUsername = internalQuery({
  args: { username: v.string() },
  returns: v.union(v.null(), v.object({
    id: v.id('auth_credentials'), profileId: v.id('profiles'), username: v.string(),
    role: roleValidator, organizationId: v.id('organizations'),
    passwordHash: v.string(), passwordSalt: v.string(), passwordHashIterations: v.number(),
  })),
  handler: async (ctx, { username }) => {
    const credential = await ctx.db.query('auth_credentials')
      .withIndex('by_username', q => q.eq('username', username)).unique();
    if (!credential?.isActive) return null;
    const profile = await ctx.db.get(credential.profileId);
    if (!profile || profile.organizationId !== credential.organizationId) return null;
    return {
      id: credential._id, profileId: profile._id, username: profile.username,
      role: profile.role, organizationId: profile.organizationId,
      passwordHash: credential.passwordHash, passwordSalt: credential.passwordSalt,
      passwordHashIterations: credential.passwordHashIterations,
    };
  },
});

export const getAccountSettingsContext = internalQuery({
  args: { profileId: v.id('profiles') },
  returns: v.union(v.null(), v.object(accountFields)),
  handler: async (ctx, { profileId }) => {
    const profile = await ctx.db.get(profileId);
    if (!profile) return null;
    const credential = await ctx.db.query('auth_credentials')
      .withIndex('by_profile', q => q.eq('profileId', profileId)).unique();
    if (!credential?.isActive || credential.organizationId !== profile.organizationId) return null;
    const organization = await ctx.db.get(profile.organizationId);
    if (!organization) return null;
    return {
      id: profile._id, username: profile.username, role: profile.role,
      displayName: profile.displayName ?? profile.username,
      organizationId: profile.organizationId, organizationName: organization.name,
    };
  },
});

/** Creates both records in one transaction. Existing names cannot be claimed. */
export const registerStudent = internalMutation({
  args: {
    username: v.string(), passwordHash: v.string(), passwordSalt: v.string(),
    passwordHashIterations: v.number(),
  },
  returns: v.union(v.object({ ok: v.literal(true) }), v.object({ ok: v.literal(false), reason: v.literal('username_taken') })),
  handler: async (ctx, args) => {
    if (!args.username.trim() || args.username.length > 255) throw new Error('Invalid username');
    const profile = await ctx.db.query('profiles').withIndex('by_username', q => q.eq('username', args.username)).unique();
    const credential = await ctx.db.query('auth_credentials').withIndex('by_username', q => q.eq('username', args.username)).unique();
    if (profile || credential) return { ok: false as const, reason: 'username_taken' as const };
    const now = Date.now();
    const organization = await ctx.db.query('organizations').withIndex('by_slug', q => q.eq('slug', 'demo-org')).unique();
    const organizationId = organization?._id ?? await ctx.db.insert('organizations', {
      name: 'Demo Organization', slug: 'demo-org', settings: {}, createdAt: now, updatedAt: now,
    });
    const profileId = await ctx.db.insert('profiles', {
      organizationId, username: args.username, role: 'student', displayName: args.username,
      createdAt: now, updatedAt: now,
    });
    await ctx.db.insert('auth_credentials', {
      ...args, profileId, organizationId, role: 'student', isActive: true, createdAt: now, updatedAt: now,
    });
    return { ok: true as const };
  },
});

/** Shares attempt limits across all web server instances. */
export const checkAuthAttempt = internalMutation({
  args: { username: v.string(), operation: v.union(v.literal('login'), v.literal('register')) },
  returns: v.object({ allowed: v.boolean(), retryAfter: v.number() }),
  handler: async (ctx, { username, operation }) => {
    if (!username || username.length > 255) throw new Error('Invalid username');
    const now = Date.now();
    // The global registration limit also bounds attempts with distinct names.
    const limits = [{ key: `${operation}:${username}`, maximum: 5, window: 15 * 60_000 },
      ...(operation === 'register' ? [{ key: 'register:global', maximum: 60, window: 60 * 60_000 }] : [])];
    for (const limit of limits) {
      const row = await ctx.db.query('auth_attempts').withIndex('by_key', q => q.eq('key', limit.key)).unique();
      if (row && now < row.windowStart + limit.window && row.requestCount >= limit.maximum) {
        return { allowed: false, retryAfter: Math.ceil((row.windowStart + limit.window - now) / 1000) };
      }
    }
    for (const limit of limits) {
      const row = await ctx.db.query('auth_attempts').withIndex('by_key', q => q.eq('key', limit.key)).unique();
      const reset = !row || now >= row.windowStart + limit.window;
      const value = { key: limit.key, requestCount: reset ? 1 : row.requestCount + 1, windowStart: reset ? now : row.windowStart };
      if (row) await ctx.db.patch(row._id, value);
      else await ctx.db.insert('auth_attempts', value);
    }
    return { allowed: true, retryAfter: 0 };
  },
});
