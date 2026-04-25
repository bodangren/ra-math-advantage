import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

const roleValidator = v.union(v.literal('student'), v.literal('teacher'), v.literal('admin'));

export const getCredentialByUsername = internalQuery({
  args: { username: v.string() },
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (!credential || !credential.isActive) {
      return null;
    }

    return {
      id: credential._id,
      profileId: credential.profileId,
      username: credential.username,
      role: credential.role,
      organizationId: credential.organizationId,
    };
  },
});

export const getAccountSettingsContext = internalQuery({
  args: { profileId: v.id("profiles") },
  handler: async (ctx, args) => {
    const profile = await ctx.db.get(args.profileId);
    if (!profile) return null;

    const organization = await ctx.db.get(profile.organizationId);

    return {
      id: profile._id,
      username: profile.username,
      role: profile.role,
      displayName: profile.displayName ?? profile.username,
      organizationId: profile.organizationId,
      organizationName: organization?.name ?? "Your organization",
    };
  },
});

export const ensureProfileByUsername = internalMutation({
  args: {
    username: v.string(),
    role: roleValidator,
    displayName: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (existingProfile) {
      return {
        ok: true as const,
        created: false as const,
        profileId: existingProfile._id,
        organizationId: existingProfile.organizationId,
      };
    }

    const now = Date.now();
    const demoOrgSlug = 'demo-org';
    const demoOrgName = 'Demo Organization';

    let organization = await ctx.db
      .query('organizations')
      .withIndex('by_slug', (q) => q.eq('slug', demoOrgSlug))
      .unique();

    if (!organization) {
      const organizationId = await ctx.db.insert('organizations', {
        name: demoOrgName,
        slug: demoOrgSlug,
        settings: {},
        createdAt: now,
        updatedAt: now,
      });
      organization = await ctx.db.get(organizationId);
    }

    if (!organization) {
      return { ok: false as const, reason: 'organization_not_found' as const };
    }

    const profileId = await ctx.db.insert('profiles', {
      organizationId: organization._id,
      username: args.username,
      role: args.role,
      displayName: args.displayName,
      metadata: {},
      createdAt: now,
      updatedAt: now,
    });

    return {
      ok: true as const,
      created: true as const,
      profileId,
      organizationId: organization._id,
    };
  },
});

export const upsertCredentialByUsername = internalMutation({
  args: {
    username: v.string(),
    role: roleValidator,
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query('profiles')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (!profile) {
      return { ok: false as const, reason: 'profile_not_found' as const };
    }

    const now = Date.now();

    const existing = await ctx.db
      .query('auth_credentials')
      .withIndex('by_username', (q) => q.eq('username', args.username))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        role: args.role,
        organizationId: profile.organizationId,
        passwordHash: args.passwordHash,
        passwordSalt: args.passwordSalt,
        passwordHashIterations: args.passwordHashIterations,
        isActive: args.isActive,
        updatedAt: now,
      });
      return { ok: true as const, updated: true as const };
    }

    await ctx.db.insert('auth_credentials', {
      profileId: profile._id,
      username: args.username,
      role: args.role,
      organizationId: profile.organizationId,
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      passwordHashIterations: args.passwordHashIterations,
      isActive: args.isActive,
      createdAt: now,
      updatedAt: now,
    });

    return { ok: true as const, updated: false as const };
  },
});
