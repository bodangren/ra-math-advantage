import { v } from "convex/values";
import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const seedUnits = internalMutation({
  args: {},
  returns: v.union(
    v.object({ ok: v.literal(true) }),
    v.object({ ok: v.literal(false), reason: v.string() }),
  ),
  handler: async (ctx) => {
    const now = Date.now();

    let org = await ctx.db
      .query("organizations")
      .withIndex("by_slug", (q) => q.eq("slug", "demo-org"))
      .unique();

    if (!org) {
      const orgId = await ctx.db.insert("organizations", {
        name: "Demo Organization",
        slug: "demo-org",
        settings: {},
        createdAt: now,
        updatedAt: now,
      });
      org = await ctx.db.get(orgId);
    }

    if (!org) return { ok: false as const, reason: "organization_not_found" };

    const teacherUsername = "demo_teacher";
    let teacherProfile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", teacherUsername))
      .unique();

    if (!teacherProfile) {
      const teacherId = await ctx.db.insert("profiles", {
        organizationId: org._id,
        username: teacherUsername,
        role: "teacher",
        displayName: "Demo Teacher",
        metadata: {},
        createdAt: now,
        updatedAt: now,
      });
      teacherProfile = await ctx.db.get(teacherId);
    }

    const studentUsername = "demo_student";
    let studentProfile = await ctx.db
      .query("profiles")
      .withIndex("by_username", (q) => q.eq("username", studentUsername))
      .unique();

    if (!studentProfile) {
      const studentId = await ctx.db.insert("profiles", {
        organizationId: org._id,
        username: studentUsername,
        role: "student",
        displayName: "Demo Student",
        metadata: {},
        createdAt: now,
        updatedAt: now,
      });
      studentProfile = await ctx.db.get(studentId);
    }

    return { ok: true as const };
  },
});

export const seedAll = internalAction({
  args: {},
  returns: v.object({ lessons: v.number() }),
  handler: async (ctx): Promise<{ lessons: number }> => {
    await ctx.runMutation(internal.seed.seed_standards.seedStandards, {});
    let lessons = 0;
    lessons += (await ctx.runMutation(internal.seed.seed_module_1_lessons.seedModule1Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_2_lessons.seedModule2Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_3_lessons.seedModule3Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_4_lessons.seedModule4Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_5_lessons.seedModule5Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_6_lessons.seedModule6Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_7_lessons.seedModule7Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_8_lessons.seedModule8Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_9_lessons.seedModule9Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_10_lessons.seedModule10Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_11_lessons.seedModule11Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_12_lessons.seedModule12Lessons, {}))
      .lessons.length;
    lessons += (await ctx.runMutation(internal.seed.seed_module_13_lessons.seedModule13Lessons, {}))
      .lessons.length;
    await ctx.runMutation(internal.seed.seed_im2_module_1_standards.seedModule1LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_2_standards.seedModule2LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_3_standards.seedModule3LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_4_standards.seedModule4LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_5_standards.seedModule5LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_6_standards.seedModule6LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_7_standards.seedModule7LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_8_standards.seedModule8LessonStandards, {});
    await ctx.runMutation(internal.seed.seed_im2_module_9_standards.seedModule9LessonStandards, {});
    await ctx.runMutation(
      internal.seed.seed_im2_module_10_standards.seedModule10LessonStandards,
      {},
    );
    await ctx.runMutation(
      internal.seed.seed_im2_module_11_standards.seedModule11LessonStandards,
      {},
    );
    await ctx.runMutation(
      internal.seed.seed_im2_module_12_standards.seedModule12LessonStandards,
      {},
    );
    await ctx.runMutation(
      internal.seed.seed_im2_module_13_standards.seedModule13LessonStandards,
      {},
    );
    return { lessons };
  },
});
