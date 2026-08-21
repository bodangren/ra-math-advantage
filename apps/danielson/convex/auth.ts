import { internalMutation, internalQuery } from './_generated/server';
import { v } from 'convex/values';

const sharedSessionRoleValidator = v.union(v.literal('teacher'), v.literal('admin'));
const credentialResult = v.union(
  v.null(),
  v.object({
    accountId: v.id('accounts'),
    username: v.string(),
    displayName: v.string(),
    sharedSessionRole: sharedSessionRoleValidator,
    organizationId: v.id('organizations'),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
    mustChangePassword: v.boolean(),
  }),
);

export const getCredentialByUsername = internalQuery({
  args: { username: v.string() },
  returns: credentialResult,
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_username', (query) => query.eq('username', args.username))
      .unique();
    if (!credential) return null;

    const account = await ctx.db.get(credential.accountId);
    if (!account || !account.isActive) return null;
    const organization = await ctx.db.get(account.organizationId);
    if (!organization || !organization.isActive || !credential.isActive) return null;

    return {
      accountId: account._id,
      username: account.username,
      displayName: account.displayName,
      sharedSessionRole: account.sharedSessionRole,
      organizationId: account.organizationId,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
      passwordHashIterations: credential.passwordHashIterations,
      mustChangePassword: credential.mustChangePassword,
    };
  },
});

export const getCredentialByAccountId = internalQuery({
  args: { accountId: v.id('accounts') },
  returns: credentialResult,
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_accountId', (query) => query.eq('accountId', args.accountId))
      .unique();
    if (!credential?.isActive) return null;

    const account = await ctx.db.get(credential.accountId);
    if (!account?.isActive) return null;
    const organization = await ctx.db.get(account.organizationId);
    if (!organization?.isActive) return null;

    return {
      accountId: account._id,
      username: account.username,
      displayName: account.displayName,
      sharedSessionRole: account.sharedSessionRole,
      organizationId: account.organizationId,
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
      passwordHashIterations: credential.passwordHashIterations,
      mustChangePassword: credential.mustChangePassword,
    };
  },
});

export const getAccountById = internalQuery({
  args: { accountId: v.id('accounts') },
  returns: v.union(
    v.null(),
    v.object({
      accountId: v.id('accounts'),
      username: v.string(),
      displayName: v.string(),
      sharedSessionRole: sharedSessionRoleValidator,
      organizationId: v.id('organizations'),
      organizationName: v.union(v.string(), v.null()),
      organizationBranding: v.union(
        v.null(),
        v.object({
          displayName: v.string(),
          logoPath: v.string(),
          primaryColor: v.string(),
          accentColor: v.string(),
        }),
      ),
      accountIsActive: v.boolean(),
      organizationIsActive: v.boolean(),
      credentialIsActive: v.boolean(),
      mustChangePassword: v.boolean(),
    }),
  ),
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account) return null;
    const organization = await ctx.db.get(account.organizationId);
    const credential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_accountId', (query) => query.eq('accountId', account._id))
      .unique();
    return {
      accountId: account._id,
      username: account.username,
      displayName: account.displayName,
      sharedSessionRole: account.sharedSessionRole,
      organizationId: account.organizationId,
      organizationName: organization?.name ?? null,
      organizationBranding: organization?.branding ?? null,
      accountIsActive: account.isActive,
      organizationIsActive: organization?.isActive ?? false,
      credentialIsActive: credential?.isActive ?? false,
      mustChangePassword: credential?.mustChangePassword ?? false,
    };
  },
});

export const changeOwnPassword = internalMutation({
  args: {
    accountId: v.id('accounts'),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
  },
  returns: v.union(
    v.object({ ok: v.literal(true), username: v.string() }),
    v.object({ ok: v.literal(false), reason: v.union(v.literal('account_inactive'), v.literal('credential_not_found')) }),
  ),
  handler: async (ctx, args) => {
    const account = await ctx.db.get(args.accountId);
    if (!account || !account.isActive) return { ok: false as const, reason: 'account_inactive' as const };
    const credential = await ctx.db
      .query('auth_credentials')
      .withIndex('by_accountId', (query) => query.eq('accountId', account._id))
      .unique();
    if (!credential) return { ok: false as const, reason: 'credential_not_found' as const };

    await ctx.db.patch(credential._id, {
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      passwordHashIterations: args.passwordHashIterations,
      mustChangePassword: false,
      updatedAt: Date.now(),
    });
    return { ok: true as const, username: account.username };
  },
});

const LOGIN_WINDOW_MS = 15 * 60 * 1000;
const MAX_LOGIN_ATTEMPTS = 5;

export const checkAndIncrementLoginRateLimit = internalMutation({
  args: { key: v.string() },
  returns: v.union(
    v.object({ allowed: v.literal(true), windowExpiresAt: v.number() }),
    v.object({ allowed: v.literal(false), windowExpiresAt: v.number() }),
  ),
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await ctx.db
      .query('login_rate_limits')
      .withIndex('by_key', (query) => query.eq('key', args.key))
      .unique();

    if (existing?.blockedUntil && existing.blockedUntil > now) {
      return { allowed: false as const, windowExpiresAt: existing.blockedUntil };
    }

    const inWindow = existing && now - existing.windowStartedAt < LOGIN_WINDOW_MS;
    const failureCount = inWindow ? existing.failureCount + 1 : 1;
    const windowStartedAt = inWindow ? existing.windowStartedAt : now;
    const blockedUntil = failureCount > MAX_LOGIN_ATTEMPTS ? windowStartedAt + LOGIN_WINDOW_MS : undefined;

    if (existing) {
      await ctx.db.patch(existing._id, { windowStartedAt, failureCount, blockedUntil, updatedAt: now });
    } else {
      await ctx.db.insert('login_rate_limits', {
        key: args.key,
        windowStartedAt,
        failureCount,
        blockedUntil,
        updatedAt: now,
      });
    }

    return blockedUntil
      ? { allowed: false as const, windowExpiresAt: blockedUntil }
      : { allowed: true as const, windowExpiresAt: windowStartedAt + LOGIN_WINDOW_MS };
  },
});

export const clearLoginRateLimit = internalMutation({
  args: { key: v.string() },
  returns: v.object({ ok: v.literal(true) }),
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query('login_rate_limits')
      .withIndex('by_key', (query) => query.eq('key', args.key))
      .unique();
    if (existing) await ctx.db.delete(existing._id);
    return { ok: true as const };
  },
});
