import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";

export const seedUnits = internalMutation({
  args: {},
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

    if (!org) return { ok: false, reason: "organization_not_found" };

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

    return { ok: true };
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const seedInternal = (internal as any).seed;

export const seedAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessons: { module: number; success: boolean; error?: string }[];
      standards: { module: number; success: boolean; error?: string }[];
    } = {
      lessons: [],
      standards: [],
    };

    // 1. Seed org, teacher, student
    await ctx.runMutation(seedInternal.seedUnits, {});

    // 2. Seed all lesson content (modules 1-14)
    const lessonSeedFns: Array<{ module: number; fn: string }> = [
      { module: 1, fn: "seedModule1Lessons" },
      { module: 2, fn: "seedModule2Lessons" },
      { module: 3, fn: "seedModule3Lessons" },
      { module: 4, fn: "seedModule4Lessons" },
      { module: 5, fn: "seedModule5Lessons" },
      { module: 6, fn: "seedModule6Lessons" },
      { module: 7, fn: "seedModule7Lessons" },
      { module: 8, fn: "seedModule8Lessons" },
      { module: 9, fn: "seedModule9Lessons" },
      { module: 10, fn: "seedModule10Lessons" },
      { module: 11, fn: "seedModule11Lessons" },
      { module: 12, fn: "seedModule12Lessons" },
      { module: 13, fn: "seedModule13Lessons" },
      { module: 14, fn: "seedModule14Lessons" },
    ];

    for (const { module, fn } of lessonSeedFns) {
      try {
        await ctx.runMutation(seedInternal[fn], {});
        results.lessons.push({ module, success: true });
      } catch (error) {
        results.lessons.push({
          module,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // 3. Seed lesson-standard links (modules 1-14)
    const standardsSeedFns: Array<{ module: number; fn: string }> = [
      { module: 1, fn: "seedModule1LessonStandards" },
      { module: 2, fn: "seedModule2LessonStandards" },
      { module: 3, fn: "seedModule3LessonStandards" },
      { module: 4, fn: "seedModule4LessonStandards" },
      { module: 5, fn: "seedModule5LessonStandards" },
      { module: 6, fn: "seedModule6LessonStandards" },
      { module: 7, fn: "seedModule7LessonStandards" },
      { module: 8, fn: "seedModule8LessonStandards" },
      { module: 9, fn: "seedModule9LessonStandards" },
      { module: 10, fn: "seedModule10LessonStandards" },
      { module: 11, fn: "seedModule11LessonStandards" },
      { module: 12, fn: "seedModule12LessonStandards" },
      { module: 13, fn: "seedModule13LessonStandards" },
      { module: 14, fn: "seedModule14LessonStandards" },
    ];

    for (const { module, fn } of standardsSeedFns) {
      try {
        await ctx.runMutation(seedInternal[fn], {});
        results.standards.push({ module, success: true });
      } catch (error) {
        results.standards.push({
          module,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return results;
  },
});
