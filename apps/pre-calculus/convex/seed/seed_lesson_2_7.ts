import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_7Result> => {
    const now = Date.now();
    const lessonSlug = "2-7-composition-of-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Function Composition",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.7: Function Composition",
          orderIndex: 7,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson_and_version", (q) => q.eq("lessonId", lessonId).eq("version", 2))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 2,
          title: "Function Composition",
          description: "AP Precalculus Topic 2.7: Function Composition",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "Suppose $g(3) = 7$ and $f(7) = 22$. You first apply $g$ to 3, getting 7. Then you feed that 7 into $f$, getting 22. What single expression captures this two-step process? What happens if you reverse the order — apply $f$ first, then $g$?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                '- **Composite function**: A function created by chaining two or more functions — the output of one becomes the input of another.\n- **$f(g(x))$**: Read as "$f$ of $g$ of $x$." Evaluate $g(x)$ first, then use that result as the input to $f$.\n- **$(f \\circ g)(x)$**: The composition notation. Means the same thing as $f(g(x))$.\n- **Inside-out rule**: Always evaluate the innermost function first, working outward.\n- **Order matters**: In general, $f(g(x)) \\neq g(f(x))$. The order of composition affects the result.',
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "A composite function chains operations: you feed an input into one function, take the output, and feed it into the next function. Two notations express the same idea:\n\n$$f(g(x)) \\quad \\text{and} \\quad (f \\circ g)(x)$$\n\nBoth mean: first compute $g(x)$, then apply $f$ to that result.\n\n**Evaluation procedure** (inside-out):\n1. Identify the inner function.\n2. Evaluate the inner function at the given input.\n3. Use that result as the input to the outer function.\n\nThis works with equations, graphs, tables, piecewise functions, and verbal descriptions. Triple compositions follow the same rule: $(f \\circ g \\circ k)(x)$ means first $k(x)$, then $g$ of that result, then $f$ of that result.\n\n**Algebraic composition**: To find $f(g(x))$ as an expression, replace every $x$ in $f$ with the entire expression $g(x)$, then simplify.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example",
        phaseType: "worked_example",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Example 1:** Let $f(x) = 3x - 5$ and $g(x) = 2x + 1$.\n\nFind $f(g(3))$.\n\n**Solution:**\n$$\\text{Step 1: } g(3) = 2(3) + 1 = 7$$\n$$\\text{Step 2: } f(7) = 3(7) - 5 = 16$$\n\nSo $f(g(3)) = 16$.\n\n**Example 2:** Find $(f \\circ g)(x)$ for the same functions.\n\n**Solution:**\n$$(f \\circ g)(x) = f(g(x)) = 3(2x + 1) - 5 = 6x + 3 - 5 = 6x - 2$$\n\n**Example 3:** Find $(g \\circ f)(x)$.\n\n**Solution:**\n$$(g \\circ f)(x) = g(f(x)) = 2(3x - 5) + 1 = 6x - 10 + 1 = 6x - 9$$\n\nNote: $(f \\circ g)(x) = 6x - 2$ but $(g \\circ f)(x) = 6x - 9$. Order matters.\n\n**Example 4:** Find $(k \\circ p)(x)$ where $k(x) = x^2 + 4x + 5$ and $p(x) = \\sqrt{3x + 1}$.\n\n**Solution:**\n$$(k \\circ p)(x) = (\\sqrt{3x+1})^2 + 4\\sqrt{3x+1} + 5 = 3x + 1 + 4\\sqrt{3x+1} + 5 = 3x + 6 + 4\\sqrt{3x+1}$$",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Guided Practice",
        phaseType: "guided_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** Let $f(x) = 4x - 5$, $g(x) = x^2 - 2x + 4$, and $h(x) = 3(2)^x$.\n\na) Find $f(g(1))$.\n\nb) Find $h(h(0))$.\n\nc) Find $f(g(x))$.\n\n**Hint:** For (b), compute $h(0) = 3(2)^0 = 3$, then $h(3) = 3(2)^3$.\n\n**Problem 2:** Let $k(x) = 3 - 2x$. Find $(f \\circ g \\circ k)(1)$.\n\n**Hint:** Start with $k(1)$, then $g$ of that result, then $f$.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Independent Practice",
        phaseType: "independent_practice",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Problem 1:** Let $f(x) = 4x - 5$, $g(x) = x^2 - 2x + 4$, $h(x) = 3(2)^x$.\n\na) Find $g(f(0))$.\n\nb) Find $h(k(2))$ where $k(x) = 3 - 2x$.\n\nc) Find $f(f(-1))$.\n\n**Problem 2:** Find $(g \\circ f)(x)$ where $f(x) = 4x - 5$ and $g(x) = x^2 - 2x + 4$.\n\n**Problem 3:** A table gives $f$: 1 \\to 3, 3 \\to 5, 5 \\to 7. A graph shows $g(1) = 3$, $g(3) = 1$, $g(5) = 3$. Find $f(g(3))$ and $g(f(3))$.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Reflection",
        phaseType: "reflection",
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text",
            content: {
              markdown:
                "**Exit Ticket:** Let $f(x) = 3x - 5$ and $g(x) = 2x + 1$. Find $f(g(x))$.\n\n**Lesson Summary:** Function composition chains operations — the output of one function becomes the input of another. The notation $f(g(x))$ and $(f \\circ g)(x)$ are equivalent. Always work inside-out: evaluate the inner function first. Order matters — $f(g(x))$ and $g(f(x))$ generally produce different results. Composition works across all representations: equations, graphs, tables, and piecewise functions.",
            },
          },
        ],
      },
    ] as const;

    const activitiesCreated = 0;

    const phasesCreated = await upsertLessonPhases(ctx, lessonVersionId, phaseData, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
