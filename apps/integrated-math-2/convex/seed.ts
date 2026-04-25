import { internalAction, internalMutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { units, lessonSlugs } from "./seed/units";

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

    let lessonsCreated = 0;

    for (const unit of units) {
      const lessons = lessonSlugs[unit.number] ?? [];
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const existing = await ctx.db
          .query("lessons")
          .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
          .unique();

        if (!existing) {
          await ctx.db.insert("lessons", {
            unitNumber: unit.number,
            title: lesson.title,
            slug: lesson.slug,
            description: `${lesson.title} — Unit ${unit.number}: ${unit.title}`,
            orderIndex: i + 1,
            metadata: {},
            createdAt: now,
            updatedAt: now,
          });
          lessonsCreated += 1;
        }
      }
    }

    return { ok: true, lessonsCreated, unitsCreated: units.length };
  },
});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const seedInternal = (internal as any).seed;

export const seedAll = internalAction({
  args: {},
  handler: async (ctx): Promise<{ ok: boolean; lessonsCreated: number; unitsCreated: number }> => {
    const result = await ctx.runMutation(seedInternal.seedUnits, {});
    return result;
  },
});
