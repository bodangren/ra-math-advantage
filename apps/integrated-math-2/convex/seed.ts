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
  handler: async (ctx) => {
    const results: {
      lessons: { slug: string; success: boolean; error?: string }[];
      standards: { code: string; success: boolean; error?: string }[];
      lessonStandards: { lessonSlug: string; standardCode: string; success: boolean; error?: string }[];
    } = {
      lessons: [],
      standards: [],
      lessonStandards: [],
    };

    // 1. Seed units and lesson records
    await ctx.runMutation(seedInternal.seedUnits, {});

    // 2. Seed standards
    try {
      const standardResults = await ctx.runMutation(seedInternal.seedStandards, {});
      for (const result of standardResults) {
        results.standards.push({ code: result.code, success: true });
      }
    } catch (error) {
      results.standards.push({
        code: "ALL",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // 3. Seed all lesson content
    const lessonSeedFunctions = [
      // Unit 1 — Relationships in Triangles (6 lessons)
      { slug: "1-1-classifying-triangles", fn: "seedLesson1_1" },
      { slug: "1-2-triangle-angle-relationships", fn: "seedLesson1_2" },
      { slug: "1-3-triangle-inequality-theorem", fn: "seedLesson1_3" },
      { slug: "1-4-congruence-criteria", fn: "seedLesson1_4" },
      { slug: "1-5-proving-triangle-congruence", fn: "seedLesson1_5" },
      { slug: "1-6-isosceles-equilateral-properties", fn: "seedLesson1_6" },
      // Unit 2 — Quadrilaterals (5 lessons)
      { slug: "2-1-polygon-basics-angle-sums", fn: "seedLesson2_1" },
      { slug: "2-2-parallelogram-properties", fn: "seedLesson2_2" },
      { slug: "2-3-special-parallelograms", fn: "seedLesson2_3" },
      { slug: "2-4-trapezoids", fn: "seedLesson2_4" },
      { slug: "2-5-coordinate-proofs-quadrilaterals", fn: "seedLesson2_5" },
      // Unit 3 — Similarity (5 lessons)
      { slug: "3-1-similar-figures-scale-factors", fn: "seedLesson3_1" },
      { slug: "3-2-triangle-similarity", fn: "seedLesson3_2" },
      { slug: "3-3-proportions-indirect-measurement", fn: "seedLesson3_3" },
      { slug: "3-4-similarity-proofs", fn: "seedLesson3_4" },
      { slug: "3-5-applications-similarity", fn: "seedLesson3_5" },
      // Unit 4 — Right Triangles & Trigonometry (6 lessons)
      { slug: "4-1-pythagorean-theorem", fn: "seedLesson4_1" },
      { slug: "4-2-special-right-triangles", fn: "seedLesson4_2" },
      { slug: "4-3-intro-sin-cos-tan", fn: "seedLesson4_3" },
      { slug: "4-4-solving-right-triangles", fn: "seedLesson4_4" },
      { slug: "4-5-law-of-sines", fn: "seedLesson4_5" },
      { slug: "4-6-law-of-cosines", fn: "seedLesson4_6" },
      // Unit 5 — Circles (5 lessons)
      { slug: "5-1-circle-vocabulary-properties", fn: "seedLesson5_1" },
      { slug: "5-2-angles-in-circles", fn: "seedLesson5_2" },
      { slug: "5-3-arcs-and-chords", fn: "seedLesson5_3" },
      { slug: "5-4-tangents-and-secants", fn: "seedLesson5_4" },
      { slug: "5-5-equations-of-circles", fn: "seedLesson5_5" },
      // Unit 6 — Measurement (5 lessons)
      { slug: "6-1-area-of-polygons", fn: "seedLesson6_1" },
      { slug: "6-2-surface-area-3d", fn: "seedLesson6_2" },
      { slug: "6-3-volume-prisms-cylinders", fn: "seedLesson6_3" },
      { slug: "6-4-volume-cones-spheres", fn: "seedLesson6_4" },
      { slug: "6-5-cross-sections-composite", fn: "seedLesson6_5" },
      // Unit 7 — Probability (6 lessons)
      { slug: "7-1-basic-probability", fn: "seedLesson7_1" },
      { slug: "7-2-counting-principle", fn: "seedLesson7_2" },
      { slug: "7-3-permutations", fn: "seedLesson7_3" },
      { slug: "7-4-combinations", fn: "seedLesson7_4" },
      { slug: "7-5-compound-probability", fn: "seedLesson7_5" },
      { slug: "7-6-fair-decisions-expected-value", fn: "seedLesson7_6" },
      // Unit 8 — Relations and Functions (6 lessons)
      { slug: "8-1-relations-vs-functions", fn: "seedLesson8_1" },
      { slug: "8-2-domain-and-range", fn: "seedLesson8_2" },
      { slug: "8-3-function-notation", fn: "seedLesson8_3" },
      { slug: "8-4-linear-nonlinear-functions", fn: "seedLesson8_4" },
      { slug: "8-5-function-transformations", fn: "seedLesson8_5" },
      { slug: "8-6-comparing-functions", fn: "seedLesson8_6" },
      // Unit 9 — Linear Equations, Inequalities & Systems (5 lessons)
      { slug: "9-1-solving-linear-equations", fn: "seedLesson9_1" },
      { slug: "9-2-graphing-linear-equations", fn: "seedLesson9_2" },
      { slug: "9-3-linear-inequalities", fn: "seedLesson9_3" },
      { slug: "9-4-systems-of-equations", fn: "seedLesson9_4" },
      { slug: "9-5-systems-of-inequalities", fn: "seedLesson9_5" },
      // Unit 10 — Exponents and Roots (5 lessons)
      { slug: "10-1-laws-of-exponents", fn: "seedLesson10_1" },
      { slug: "10-2-negative-rational-exponents", fn: "seedLesson10_2" },
      { slug: "10-3-scientific-notation", fn: "seedLesson10_3" },
      { slug: "10-4-radical-expressions", fn: "seedLesson10_4" },
      { slug: "10-5-solving-radical-equations", fn: "seedLesson10_5" },
      // Unit 11 — Polynomials (6 lessons)
      { slug: "11-1-polynomial-vocabulary", fn: "seedLesson11_1" },
      { slug: "11-2-adding-subtracting-polynomials", fn: "seedLesson11_2" },
      { slug: "11-3-multiplying-polynomials", fn: "seedLesson11_3" },
      { slug: "11-4-special-products", fn: "seedLesson11_4" },
      { slug: "11-5-factoring-techniques", fn: "seedLesson11_5" },
      { slug: "11-6-solving-polynomial-equations", fn: "seedLesson11_6" },
      // Unit 12 — Quadratic Functions (5 lessons)
      { slug: "12-1-graphing-quadratics", fn: "seedLesson12_1" },
      { slug: "12-2-factoring-quadratics", fn: "seedLesson12_2" },
      { slug: "12-3-completing-the-square", fn: "seedLesson12_3" },
      { slug: "12-4-quadratic-formula", fn: "seedLesson12_4" },
      { slug: "12-5-quadratic-applications", fn: "seedLesson12_5" },
      // Unit 13 — Trigonometric Identities & Equations (5 lessons)
      { slug: "13-1-fundamental-trig-identities", fn: "seedLesson13_1" },
      { slug: "13-2-pythagorean-identities", fn: "seedLesson13_2" },
      { slug: "13-3-sum-difference-identities", fn: "seedLesson13_3" },
      { slug: "13-4-double-half-angle-identities", fn: "seedLesson13_4" },
      { slug: "13-5-solving-trig-equations", fn: "seedLesson13_5" },
    ];

    for (const lesson of lessonSeedFunctions) {
      try {
        await ctx.runMutation(seedInternal[lesson.fn], {});
        results.lessons.push({ slug: lesson.slug, success: true });
      } catch (error) {
        results.lessons.push({
          slug: lesson.slug,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // 4. Seed lesson-standard links
    try {
      const lessonStandardResults = await ctx.runMutation(seedInternal.seedLessonStandards, {});
      for (const result of lessonStandardResults) {
        results.lessonStandards.push({
          lessonSlug: result.lessonSlug,
          standardCode: result.standardCode,
          success: result.success,
          error: result.error,
        });
      }
    } catch (error) {
      results.lessonStandards.push({
        lessonSlug: "ALL",
        standardCode: "ALL",
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    // 5. Seed objective policies
    try {
      await ctx.runMutation(seedInternal.seedObjectivePolicies, {});
    } catch {
      // Objective policies seeding failure is non-fatal
    }

    // 6. Seed problem families
    try {
      await ctx.runMutation(seedInternal.seedProblemFamilies, {});
    } catch {
      // Problem families seeding failure is non-fatal
    }

    return results;
  },
});
