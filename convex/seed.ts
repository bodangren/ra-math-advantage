import { internalAction } from "./_generated/server";
import type { SeedLesson, SeedCompetencyStandard, SeedDemoEnvironment } from "./seed/types";
import { seedDemoEnv } from "./seed/seed-demo-env";
import { seedStandards } from "./seed/seed-standards";
import { seedDemoProgress } from "./seed/seed-demo-progress";

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
      const standardResults = await ctx.runMutation(seedStandards, {});
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
        await ctx.runMutation(seedDemoEnv, {});
        results.demo = { success: true };
      } catch (error) {
        results.demo = {
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        };
      }

      try {
        await ctx.runMutation(seedDemoProgress, {});
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

function getStandards(): SeedCompetencyStandard[] {
  return [
    {
      code: "HSA-SSE.B.3",
      description: "Choosing and producing equivalent forms of expressions",
      studentFriendlyDescription: "I can rewrite expressions in different forms.",
      category: "Algebra",
      isActive: true,
    },
    {
      code: "HSA-REI.B.4",
      description: "Solving quadratic equations in one variable",
      studentFriendlyDescription: "I can solve quadratic equations.",
      category: "Algebra",
      isActive: true,
    },
    {
      code: "HSA-APR.B.3",
      description: "Identifying zeros of polynomials",
      studentFriendlyDescription: "I can find where polynomials equal zero.",
      category: "Algebra",
      isActive: true,
    },
    {
      code: "HSA-CED.A.1",
      description: "Creating equations in one variable",
      studentFriendlyDescription: "I can create equations to solve problems.",
      category: "Algebra",
      isActive: true,
    },
    {
      code: "N-CN.A.1",
      description: "Knowing the definition of complex numbers",
      studentFriendlyDescription: "I know what imaginary numbers are.",
      category: "Number",
      isActive: true,
    },
    {
      code: "N-CN.C.7",
      description: "Solving quadratics with complex solutions",
      studentFriendlyDescription: "I can solve equations with complex answers.",
      category: "Number",
      isActive: true,
    },
  ];
}

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
