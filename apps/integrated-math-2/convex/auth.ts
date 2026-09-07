import { internalMutation, internalQuery } from "./_generated/server";
import { v } from "convex/values";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

const roleValidator = v.union(
  v.literal("student"),
  v.literal("teacher"),
  v.literal("admin"),
);

export const getCredentialByUsername = internalQuery({
  args: { username: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("auth_credentials"),
      profileId: v.id("profiles"),
      username: v.string(),
      role: roleValidator,
      organizationId: v.id("organizations"),
      passwordHash: v.string(),
      passwordSalt: v.string(),
      passwordHashIterations: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const credential = await ctx.db
      .query("auth_credentials")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!credential || !credential.isActive) {
      return null;
    }

    const profile = await ctx.db.get(credential.profileId);
    if (
      !profile ||
      profile.role !== credential.role ||
      profile.organizationId !== credential.organizationId
    )
      return null;

    return {
      passwordHash: credential.passwordHash,
      passwordSalt: credential.passwordSalt,
      passwordHashIterations: credential.passwordHashIterations,
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
  returns: v.union(
    v.null(),
    v.object({
      id: v.id("profiles"),
      username: v.string(),
      role: roleValidator,
      displayName: v.string(),
      organizationId: v.id("organizations"),
      organizationName: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
    }),
  ),
  handler: async (ctx, args) => {
    const profile = await activeAccount(ctx, args.profileId);
    if (!profile) return null;

    const organization = await ctx.db.get(profile.organizationId);

    return {
      id: profile._id,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
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
  returns: v.union(
    v.object({
      ok: v.literal(false),
      reason: v.literal("organization_not_found"),
    }),
    v.object({
      ok: v.literal(true),
      created: v.boolean(),
      profileId: v.id("profiles"),
      organizationId: v.id("organizations"),
    }),
  ),
  handler: async (ctx, args) => {
    const existingProfile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
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
    const demoOrgSlug = "demo-org";
    const demoOrgName = "Demo Organization";

    let organization = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", demoOrgSlug))
      .unique();

    if (!organization) {
      const organizationId = await ctx.db.insert("organizations", {
        name: demoOrgName,
        slug: demoOrgSlug,
        settings: {},
        createdAt: now,
        updatedAt: now,
      });
      organization = await ctx.db.get(organizationId);
    }

    if (!organization) {
      return { ok: false as const, reason: "organization_not_found" as const };
    }

    const profileId = await ctx.db.insert("profiles", {
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
  returns: v.union(
    v.object({ ok: v.literal(false), reason: v.literal("profile_not_found") }),
    v.object({ ok: v.literal(true), updated: v.boolean() }),
  ),
  handler: async (ctx, args) => {
    const profile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .unique();

    if (!profile) {
      return { ok: false as const, reason: "profile_not_found" as const };
    }

    const now = Date.now();

    const existing = await ctx.db
      .query("auth_credentials")
      .withIndex("by_username", (q) => q.eq("username", args.username))
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

    await ctx.db.insert("auth_credentials", {
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

/** Return an active account with consistent identity fields. */
export async function activeAccount(
  ctx: Pick<QueryCtx, "db">,
  profileId: Id<"profiles">,
) {
  const [profile, credential] = await Promise.all([
    ctx.db.get(profileId),
    ctx.db
      .query("auth_credentials")
      .withIndex("by_profile", (q) => q.eq("profileId", profileId))
      .unique(),
  ]);
  if (
    !profile ||
    !credential?.isActive ||
    profile.role !== credential.role ||
    profile.organizationId !== credential.organizationId ||
    profile.username !== credential.username
  )
    return null;
  return profile;
}

export const registerStudent = internalMutation({
  args: {
    username: v.string(),
    classCode: v.string(),
    passwordHash: v.string(),
    passwordSalt: v.string(),
    passwordHashIterations: v.number(),
  },
  returns: v.union(
    v.object({ ok: v.literal(true) }),
    v.object({
      ok: v.literal(false),
      reason: v.union(v.literal("username_taken"), v.literal("invalid_class")),
    }),
  ),
  handler: async (ctx, args) => {
    const [profile, credential] = await Promise.all([
      ctx.db
        .query("profiles")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique(),
      ctx.db
        .query("auth_credentials")
        .withIndex("by_username", (q) => q.eq("username", args.username))
        .unique(),
    ]);
    if (profile || credential)
      return { ok: false, reason: "username_taken" } as const;
    const classroom = await ctx.db
      .query("classes")
      .withIndex("by_join_code", (q) => q.eq("joinCode", args.classCode))
      .unique();
    const teacher =
      classroom && !classroom.archived
        ? await activeAccount(ctx, classroom.teacherId)
        : null;
    if (!classroom || !teacher || teacher.role === "student")
      return { ok: false, reason: "invalid_class" } as const;
    const now = Date.now();
    const profileId = await ctx.db.insert("profiles", {
      organizationId: teacher.organizationId,
      username: args.username,
      role: "student",
      displayName: args.username,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("auth_credentials", {
      profileId,
      organizationId: teacher.organizationId,
      username: args.username,
      role: "student",
      passwordHash: args.passwordHash,
      passwordSalt: args.passwordSalt,
      passwordHashIterations: args.passwordHashIterations,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("class_enrollments", {
      classId: classroom._id,
      studentId: profileId,
      enrolledAt: now,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });
    return { ok: true } as const;
  },
});

export const consumeAuthAttempt = internalMutation({
  args: {
    username: v.string(),
    operation: v.union(v.literal("login"), v.literal("register")),
  },
  returns: v.object({ allowed: v.boolean() }),
  handler: async (ctx, args) => {
    const now = Date.now();
    const keys = [
      `${args.operation}:global`,
      `${args.operation}:user:${args.username}`,
    ];
    const limits = [200, 10];
    const rows = await Promise.all(
      keys.map((key) =>
        ctx.db
          .query("auth_rate_limits")
          .withIndex("by_key", (q) => q.eq("key", key))
          .unique(),
      ),
    );
    if (
      rows.some(
        (row, i) =>
          row && now - row.windowStart < 60_000 && row.count >= limits[i],
      )
    )
      return { allowed: false };
    for (let i = 0; i < keys.length; i++) {
      const row = rows[i];
      const data = {
        key: keys[i],
        windowStart:
          row && now - row.windowStart < 60_000 ? row.windowStart : now,
        count: row && now - row.windowStart < 60_000 ? row.count + 1 : 1,
      };
      if (row) await ctx.db.patch(row._id, data);
      else await ctx.db.insert("auth_rate_limits", data);
    }
    return { allowed: true };
  },
});
