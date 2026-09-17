import { internalAction, internalMutation, type ActionCtx } from "./_generated/server";
import { v } from "convex/values";
import { makeFunctionReference } from "convex/server";
import topicIndex from "../curriculum/source/college-board/ced-topic-index.json";

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

    const units = [
      { number: 1, title: "Polynomial and Rational Functions" },
      { number: 2, title: "Exponential and Logarithmic Functions" },
      { number: 3, title: "Trigonometric and Polar Functions" },
      { number: 4, title: "Functions with Parameters, Vectors, and Matrices" },
    ];

    const lessonSlugs: Record<number, Array<{ slug: string; title: string }>> = {
      1: [
        { slug: "1-1-change-in-tandem", title: "Change in Tandem" },
        { slug: "1-2-rates-of-change", title: "Rates of Change" },
        { slug: "1-3-rates-of-change-linear-quadratic", title: "Rates of Change in Linear and Quadratic Functions" },
        { slug: "1-4-polynomial-functions-rates", title: "Polynomial Functions and Rates of Change" },
        { slug: "1-5-polynomial-functions-complex-zeros", title: "Polynomial Functions and Complex Zeros" },
        { slug: "1-6-polynomial-functions-end-behavior", title: "Polynomial Functions and End Behavior" },
        { slug: "1-7-rational-functions-end-behavior", title: "Rational Functions and End Behavior" },
        { slug: "1-8-rational-functions-zeros", title: "Rational Functions and Zeros" },
        { slug: "1-9-rational-functions-vertical-asymptotes", title: "Rational Functions and Vertical Asymptotes" },
        { slug: "1-10-rational-functions-holes", title: "Rational Functions and Holes" },
        { slug: "1-11-equivalent-representations", title: "Equivalent Representations of Polynomial and Rational Expressions" },
        { slug: "1-12-transformations-of-functions", title: "Transformations of Functions" },
        { slug: "1-13-function-model-selection", title: "Function Model Selection and Assumption Articulation" },
        { slug: "1-14-function-model-construction", title: "Function Model Construction and Application" },
      ],
      2: [
        { slug: "2-1-arithmetic-geometric-sequences", title: "Arithmetic vs. Geometric Sequences" },
        { slug: "2-2-linear-exponential-change", title: "Linear vs. Exponential Change" },
        { slug: "2-3-exponential-functions", title: "Exponential Functions" },
        { slug: "2-4-exponential-manipulation", title: "Exponential Function Manipulation" },
        { slug: "2-5-exponential-modeling", title: "Exponential Modeling" },
        { slug: "2-6-model-validation", title: "Model Validation" },
        { slug: "2-7-composition-of-functions", title: "Composition of Functions" },
        { slug: "2-8-inverse-functions", title: "Inverse Functions" },
        { slug: "2-9-logarithmic-expressions", title: "Logarithmic Expressions" },
        { slug: "2-10-logarithmic-functions", title: "Logarithmic Functions" },
        { slug: "2-11-logarithmic-properties", title: "Logarithmic Properties" },
        { slug: "2-12-logarithmic-equations", title: "Logarithmic Equations" },
        { slug: "2-13-exp-log-equations-inequalities", title: "Exponential/Logarithmic Equations and Inequalities" },
        { slug: "2-14-logarithmic-modeling", title: "Logarithmic Modeling" },
        { slug: "2-15-semi-log-plots", title: "Semi-log Plots" },
      ],
      3: [
        { slug: "3-1-periodic-phenomena", title: "Periodic Phenomena" },
        { slug: "3-2-basic-trig-functions", title: "Basic Trigonometric Functions" },
        { slug: "3-3-trig-functions-unit-circle", title: "Trigonometric Functions and the Unit Circle" },
        { slug: "3-4-graphs-transformations", title: "Graphs of Trigonometric Functions" },
        { slug: "3-5-sinusoidal-transformations", title: "Sinusoidal Transformations" },
        { slug: "3-6-sinusoidal-applications", title: "Sinusoidal Applications" },
        { slug: "3-7-sinusoidal-modeling", title: "Sinusoidal Modeling" },
        { slug: "3-8-tangent-function", title: "Tangent Function" },
        { slug: "3-9-inverse-trig-functions", title: "Inverse Trigonometric Functions" },
        { slug: "3-10-trig-equations-inequalities", title: "Trigonometric Equations and Inequalities" },
        { slug: "3-11-other-trig-functions", title: "Other Trigonometric Functions" },
        { slug: "3-12-equivalent-trig-representations", title: "Equivalent Trigonometric Representations" },
        { slug: "3-13-polar-coordinates", title: "Polar Coordinates" },
        { slug: "3-14-polar-functions", title: "Polar Functions" },
        { slug: "3-15-polar-representations", title: "Polar Representations" },
      ],
      4: [
        { slug: "4-1-parametric-functions", title: "Parametric Functions" },
        { slug: "4-2-parametric-motion-modeling", title: "Parametric Motion Modeling" },
        { slug: "4-3-rates-of-change-parametric", title: "Rates of Change (Parametric)" },
        { slug: "4-4-parametric-circles-lines", title: "Parametric Circles and Lines" },
        { slug: "4-5-implicit-functions", title: "Implicit Functions" },
        { slug: "4-6-conic-sections", title: "Conic Sections" },
        { slug: "4-7-parametrization", title: "Parametrization" },
        { slug: "4-8-vectors", title: "Vectors" },
        { slug: "4-9-vector-valued-functions", title: "Vector-Valued Functions" },
        { slug: "4-10-matrix-operations", title: "Matrix Operations" },
        { slug: "4-11-matrix-transformations", title: "Matrix Transformations" },
        { slug: "4-12-matrix-systems", title: "Matrices for Systems of Equations" },
        { slug: "4-13-matrix-applications", title: "Matrix Applications" },
        { slug: "4-14-matrix-inverses", title: "Matrix Inverses" },
      ],
    };

    let lessonsCreated = 0;

    for (const unit of units) {
      const lessons = lessonSlugs[unit.number] ?? [];
      for (let i = 0; i < lessons.length; i++) {
        const lesson = lessons[i];
        const title = topicIndex.units.find(entry => entry.unit === unit.number)!.topics[i]!.title;
        const existing = await ctx.db
          .query("lessons")
          .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
          .unique();

        if (existing) {
          await ctx.db.patch(existing._id, { title, updatedAt: now });
        }
        if (!existing) {
          await ctx.db.insert("lessons", {
            unitNumber: unit.number,
            title,
            slug: lesson.slug,
            description: `${title} — Unit ${unit.number}: ${unit.title}`,
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

export const seedAll = internalAction({
  args: {},
  returns: v.object({ ok: v.literal(true), lessons: v.number() }),
  handler: async (ctx: ActionCtx): Promise<{ ok: true; lessons: number }> => {
    const units = await ctx.runMutation(makeFunctionReference<"mutation", Record<string, never>, { ok: boolean }>("seed:seedUnits"), {});
    if (!units.ok) throw new Error('Could not seed lesson records');
    await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_standards:seedStandards"), {});
    const lessons = [];
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_1:seedLesson1_1"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_2:seedLesson1_2"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_3:seedLesson1_3"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_4:seedLesson1_4"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_5:seedLesson1_5"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_6:seedLesson1_6"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_7:seedLesson1_7"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_8:seedLesson1_8"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_9:seedLesson1_9"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_10:seedLesson1_10"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_11:seedLesson1_11"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_12:seedLesson1_12"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_13:seedLesson1_13"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_1_14:seedLesson1_14"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_1:seedLesson2_1"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_2:seedLesson2_2"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_3:seedLesson2_3"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_4:seedLesson2_4"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_5:seedLesson2_5"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_6:seedLesson2_6"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_7:seedLesson2_7"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_8:seedLesson2_8"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_9:seedLesson2_9"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_10:seedLesson2_10"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_11:seedLesson2_11"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_12:seedLesson2_12"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_13:seedLesson2_13"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_14:seedLesson2_14"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_2_15:seedLesson2_15"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_1:seedLesson3_1"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_2:seedLesson3_2"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_3:seedLesson3_3"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_4:seedLesson3_4"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_5:seedLesson3_5"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_6:seedLesson3_6"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_7:seedLesson3_7"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_8:seedLesson3_8"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_9:seedLesson3_9"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_10:seedLesson3_10"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_11:seedLesson3_11"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_12:seedLesson3_12"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_13:seedLesson3_13"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_14:seedLesson3_14"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_3_15:seedLesson3_15"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_1:seedLesson4_1"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_2:seedLesson4_2"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_3:seedLesson4_3"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_4:seedLesson4_4"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_5:seedLesson4_5"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_6:seedLesson4_6"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_7:seedLesson4_7"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_8:seedLesson4_8"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_9:seedLesson4_9"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_10:seedLesson4_10"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_11:seedLesson4_11"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_12:seedLesson4_12"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_13:seedLesson4_13"), {}));
    lessons.push(await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_4_14:seedLesson4_14"), {}));
    const lessonStandards = await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_lesson_standards:seedLessonStandards"), {});
    const policies = await ctx.runMutation(makeFunctionReference<"mutation">("seed/seed_objective_policies:seedObjectivePolicies"), {});
    for (const result of [...lessonStandards, ...policies]) {
      if (!result.success) throw new Error(result.error ?? 'A required seed step failed');
    }
    return { ok: true, lessons: lessons.length };
  },
});
