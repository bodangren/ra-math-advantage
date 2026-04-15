import { internalAction } from "./_generated/server";
import { internal } from "./_generated/api";
import type { SeedLesson, SeedDemoEnvironment } from "./seed/types";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const seedInternal = (internal as any).seed;

export const seedAll = internalAction({
  args: {},
  handler: async (ctx) => {
    const results: {
      lessons: { slug: string; success: boolean; error?: string }[];
      standards: { code: string; success: boolean; error?: string }[];
      demo: { success: boolean; error?: string };
      progress: { success: boolean; error?: string };
    } = {
      lessons: [],
      standards: [],
      demo: { success: true },
      progress: { success: true },
    };

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

    const lessons = getLessons();
    for (const lesson of lessons) {
      try {
        switch (lesson.slug) {
          case "module-1-lesson-1":
            await ctx.runMutation(seedInternal.seedLesson1, {});
            break;
          case "module-1-lesson-2":
            await ctx.runMutation(seedInternal.seedLesson2, {});
            break;
          case "module-1-lesson-3":
            await ctx.runMutation(seedInternal.seedLesson3, {});
            break;
          case "module-1-lesson-4":
            await ctx.runMutation(seedInternal.seedLesson4, {});
            break;
          case "module-1-lesson-5":
            await ctx.runMutation(seedInternal.seedLesson5, {});
            break;
          case "module-1-lesson-6":
            await ctx.runMutation(seedInternal.seedLesson6, {});
            break;
          case "module-1-lesson-7":
            await ctx.runMutation(seedInternal.seedLesson7, {});
            break;
          case "module-1-lesson-8":
            await ctx.runMutation(seedInternal.seedLesson8, {});
            break;
          case "module-2-lesson-1":
            await ctx.runMutation(seedInternal.seedLesson2_1, {});
            break;
          case "module-2-lesson-2":
            await ctx.runMutation(seedInternal.seedLesson2_2, {});
            break;
          case "module-2-lesson-3":
            await ctx.runMutation(seedInternal.seedLesson2_3, {});
            break;
          case "module-2-lesson-4":
            await ctx.runMutation(seedInternal.seedLesson2_4, {});
            break;
          case "module-2-lesson-5":
            await ctx.runMutation(seedInternal.seedLesson2_5, {});
            break;
          case "module-3-lesson-1":
            await ctx.runMutation(seedInternal.seedLesson3_1, {});
            break;
          case "module-3-lesson-2":
            await ctx.runMutation(seedInternal.seedLesson3_2, {});
            break;
          case "module-3-lesson-3":
            await ctx.runMutation(seedInternal.seedLesson3_3, {});
            break;
          case "module-3-lesson-4":
            await ctx.runMutation(seedInternal.seedLesson3_4, {});
            break;
          case "module-3-lesson-5":
            await ctx.runMutation(seedInternal.seedLesson3_5, {});
            break;
          case "module-4-lesson-1":
            await ctx.runMutation(seedInternal.seedLesson4_1, {});
            break;
          case "module-4-lesson-2":
            await ctx.runMutation(seedInternal.seedLesson4_2, {});
            break;
          case "module-4-lesson-3":
            await ctx.runMutation(seedInternal.seedLesson4_3, {});
            break;
          case "module-4-lesson-4":
            await ctx.runMutation(seedInternal.seedLesson4_4, {});
            break;
          case "module-4-lesson-5":
            await ctx.runMutation(seedInternal.seedLesson4_5, {});
            break;
          default:
            break;
        }
        results.lessons.push({ slug: lesson.slug, success: true });
      } catch (error) {
        results.lessons.push({
          slug: lesson.slug,
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    const demo = getDemoEnvironment();
    if (demo) {
      try {
        await ctx.runMutation(seedInternal.seedDemoEnv, {});
        results.demo = { success: true };
      } catch (error) {
        results.demo = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }

      try {
        await ctx.runMutation(seedInternal.seedDemoProgress, {});
        results.progress = { success: true };
      } catch (error) {
        results.progress = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }
    }

    return results;
  },
});

function getLessons(): SeedLesson[] {
  return [
    {
      unitNumber: 1,
      title: "Graphing Quadratic Functions",
      slug: "module-1-lesson-1",
      description: "Students analyze vertex form, standard form, and intercept form.",
      orderIndex: 1,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 1,
      title: "Solving Quadratics by Graphing",
      slug: "module-1-lesson-2",
      description: "Students interpret x-intercepts as solutions.",
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 9, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 1,
      title: "Complex Numbers",
      slug: "module-1-lesson-3",
      description: "Introduction to imaginary unit i and operations with complex numbers.",
      orderIndex: 3,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 5, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 9, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 12, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 13, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 1,
      title: "Solving by Factoring",
      slug: "module-1-lesson-4",
      description: "Students factor trinomials and apply the zero product property.",
      orderIndex: 4,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 5, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Assessment", phaseType: "assessment", sections: [] },
        { phaseNumber: 13, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 1,
      title: "Completing the Square",
      slug: "module-1-lesson-5",
      description: "Conceptual development of completing the square.",
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 5, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 10, title: "Assessment", phaseType: "assessment", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 1,
      title: "Quadratic Formula and Discriminant",
      slug: "module-1-lesson-6",
      description: "Derivation and application of quadratic formula.",
      orderIndex: 6,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Assessment", phaseType: "assessment", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 1,
      title: "Quadratic Inequalities",
      slug: "module-1-lesson-7",
      description: "Graphing solution regions and interpreting intervals.",
      orderIndex: 7,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Assessment", phaseType: "assessment", sections: [] },
        { phaseNumber: 9, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 10, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 1,
      title: "Linear-Quadratic Systems",
      slug: "module-1-lesson-8",
      description: "Solving systems graphically and algebraically.",
      orderIndex: 8,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Assessment", phaseType: "assessment", sections: [] },
        { phaseNumber: 9, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 10, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 2,
      title: "Polynomial Functions",
      slug: "module-2-lesson-1",
      description: "Students graph and analyze power functions and polynomial functions.",
      orderIndex: 1,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Graphing Power Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Learn: Graphing Polynomial Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 2,
      title: "Analyzing Graphs of Polynomial Functions",
      slug: "module-2-lesson-2",
      description: "Students analyze graphs of polynomial functions, approximate zeros, and find extrema.",
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 6, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 11, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 2,
      title: "Operations with Polynomials",
      slug: "module-2-lesson-3",
      description: "Students add, subtract, and multiply polynomials.",
      orderIndex: 3,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Worked Example 7", phaseType: "worked_example", sections: [] },
        { phaseNumber: 12, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 13, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 2,
      title: "Dividing Polynomials",
      slug: "module-2-lesson-4",
      description: "Students divide polynomials using long division and synthetic division.",
      orderIndex: 4,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 11, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
      {
      unitNumber: 2,
      title: "Powers of Binomials",
      slug: "module-2-lesson-5",
      description: "Students use the Binomial Theorem to expand powers of binomials.",
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 8, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 3,
      title: "Solving Polynomial Equations by Graphing",
      slug: "module-3-lesson-1",
      description: "Students use graphing to find solutions of polynomial equations.",
      orderIndex: 1,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Solving Polynomial Equations by Graphing", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 7, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 3,
      title: "Solving Polynomial Equations Algebraically",
      slug: "module-3-lesson-2",
      description: "Students solve polynomial equations by factoring and using quadratic form.",
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Solving Polynomial Equations by Factoring", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Learn: Solving Polynomial Equations in Quadratic Form", phaseType: "learn", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Worked Example 7", phaseType: "worked_example", sections: [] },
        { phaseNumber: 12, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 13, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 3,
      title: "Proving Polynomial Identities",
      slug: "module-3-lesson-3",
      description: "Students prove polynomial identities and use them to describe relationships.",
      orderIndex: 3,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Proving Polynomial Identities", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 7, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 3,
      title: "The Remainder and Factor Theorems",
      slug: "module-3-lesson-4",
      description: "Students evaluate functions using synthetic substitution and use the Factor Theorem to determine factors of polynomials.",
      orderIndex: 4,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: The Remainder Theorem", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Learn: The Factor Theorem", phaseType: "learn", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 9, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 3,
      title: "Roots and Zeros",
      slug: "module-3-lesson-5",
      description: "Students apply the Fundamental Theorem of Algebra and find zeros of polynomial functions.",
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Fundamental Theorem of Algebra", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Learn: Finding Zeros of Polynomial Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 11, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 4,
      title: "Operations on Functions",
      slug: "module-4-lesson-1",
      description: "Students find sums, differences, products, quotients, and compositions of functions.",
      orderIndex: 1,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Operations on Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Learn: Compositions of Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 4,
      title: "Inverse Relations and Functions",
      slug: "module-4-lesson-2",
      description: "Students find inverses of relations, verify inverse functions using compositions, and apply the horizontal line test.",
      orderIndex: 2,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Inverse Relations and Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Learn: Verifying Inverses", phaseType: "learn", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 4,
      title: "nth Roots and Rational Exponents",
      slug: "module-4-lesson-3",
      description: "Students simplify expressions involving radicals and rational exponents, and convert between exponential and radical forms.",
      orderIndex: 3,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: nth Roots", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Learn: Rational Exponents", phaseType: "learn", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 12, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 4,
      title: "Graphing Radical Functions",
      slug: "module-4-lesson-4",
      description: "Students graph and analyze square root and cube root functions.",
      orderIndex: 4,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Graphing Square Root Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 7, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Learn: Graphing Cube Root Functions", phaseType: "learn", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 11, title: "Worked Example 7", phaseType: "worked_example", sections: [] },
        { phaseNumber: 12, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 13, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
    {
      unitNumber: 4,
      title: "Operations with Radical Expressions",
      slug: "module-4-lesson-5",
      description: "Students simplify radical expressions, add, subtract, multiply, and divide radicals, and rationalize denominators.",
      orderIndex: 5,
      phases: [
        { phaseNumber: 1, title: "Explore", phaseType: "explore", sections: [] },
        { phaseNumber: 2, title: "Vocabulary", phaseType: "vocabulary", sections: [] },
        { phaseNumber: 3, title: "Learn: Properties of Radicals", phaseType: "learn", sections: [] },
        { phaseNumber: 4, title: "Worked Example 1", phaseType: "worked_example", sections: [] },
        { phaseNumber: 5, title: "Worked Example 2", phaseType: "worked_example", sections: [] },
        { phaseNumber: 6, title: "Learn: Adding and Subtracting Radical Expressions", phaseType: "learn", sections: [] },
        { phaseNumber: 7, title: "Worked Example 3", phaseType: "worked_example", sections: [] },
        { phaseNumber: 8, title: "Worked Example 4", phaseType: "worked_example", sections: [] },
        { phaseNumber: 9, title: "Worked Example 5", phaseType: "worked_example", sections: [] },
        { phaseNumber: 10, title: "Learn: Rationalizing the Denominator", phaseType: "learn", sections: [] },
        { phaseNumber: 11, title: "Worked Example 6", phaseType: "worked_example", sections: [] },
        { phaseNumber: 12, title: "Worked Example 7", phaseType: "worked_example", sections: [] },
        { phaseNumber: 13, title: "Discourse", phaseType: "discourse", sections: [] },
        { phaseNumber: 14, title: "Reflection", phaseType: "reflection", sections: [] },
      ],
    },
  ];
}

function getDemoEnvironment(): SeedDemoEnvironment | undefined {
  return {
    organization: { name: "Demo Organization", slug: "demo" },
    teacher: {
      organizationSlug: "demo",
      username: "teacher@demo",
      role: "teacher",
      displayName: "Demo Teacher",
      password: "Demo1234!",
    },
    students: [
      { organizationSlug: "demo", username: "student1@demo", role: "student", displayName: "Student One", password: "Demo1234!" },
      { organizationSlug: "demo", username: "student2@demo", role: "student", displayName: "Student Two", password: "Demo1234!" },
      { organizationSlug: "demo", username: "student3@demo", role: "student", displayName: "Student Three", password: "Demo1234!" },
      { organizationSlug: "demo", username: "student4@demo", role: "student", displayName: "Student Four", password: "Demo1234!" },
      { organizationSlug: "demo", username: "student5@demo", role: "student", displayName: "Student Five", password: "Demo1234!" },
    ],
    className: "IM3 Period 1",
    studentProgress: [
      { studentUsername: "student1@demo", lessonSlug: "module-1-lesson-1", phaseNumber: 1, status: "not_started" },
      { studentUsername: "student2@demo", lessonSlug: "module-1-lesson-1", phaseNumber: 3, status: "in_progress" },
      { studentUsername: "student3@demo", lessonSlug: "module-1-lesson-1", phaseNumber: 6, status: "in_progress" },
      { studentUsername: "student4@demo", lessonSlug: "module-1-lesson-1", phaseNumber: 9, status: "completed" },
      { studentUsername: "student5@demo", lessonSlug: "module-1-lesson-1", phaseNumber: 12, status: "completed" },
    ],
  };
}
