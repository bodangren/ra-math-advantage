import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_10Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_10 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_10Result> => {
    const now = Date.now();
    const lessonSlug = "2-10-logarithmic-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Inverses of Exponential Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.10: Inverses of Exponential Functions",
          orderIndex: 10,
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
          title: "Inverses of Exponential Functions",
          description: "AP Precalculus Topic 2.10: Inverses of Exponential Functions",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
  {
    "phaseNumber": 1,
    "title": "Explore",
    "phaseType": "explore",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "Consider the function $f(x) = 2^x$. Its table of values shows a clear pattern:\n\n| x | -1 | 0 | 1 | 2 | 3 |\n|---|---|---|---|---|---|\n| f(x) | 1/2 | 1 | 2 | 4 | 8 |\n\nThe inputs change by **+1** each step (additive), and the outputs **multiply by 2** each step (multiplicative).\n\nNow swap the columns — reverse the roles of input and output:\n\n| x | 1/2 | 1 | 2 | 4 | 8 |\n|---|---|---|---|---|---|\n| g(x) | -1 | 0 | 1 | 2 | 3 |\n\nWhat pattern do you see in the new table? The inputs **multiply by 2** (or divide), while the outputs **change by +1** (additive). This reversed pattern is the signature of a **logarithmic function** — the inverse of an exponential function."
        }
      }
    ]
  },
  {
    "phaseNumber": 2,
    "title": "Vocabulary",
    "phaseType": "vocabulary",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "- **Logarithmic function**: A function of the form $f(x) = a \\log_b(x)$, where $b > 0$, $b \\ne 1$, and $a \\ne 0$. Logarithmic functions are the inverses of exponential functions.\n- **Input/output swap**: Exponential functions have additive inputs and multiplicative outputs. Logarithmic functions reverse this: multiplicative inputs and additive (equally spaced) outputs.\n- **Reflection over $y = x$**: The graph of $f^{-1}$ is the reflection of the graph of $f$ across the line $y = x$. If $(x_1, y_1)$ is on $f$, then $(y_1, x_1)$ is on $f^{-1}$.\n- **Composition verification**: Functions $f$ and $g$ are inverses if $f(g(x)) = x$ and $g(f(x)) = x$ for all $x$ in the appropriate domains."
        }
      }
    ]
  },
  {
    "phaseNumber": 3,
    "title": "Learn",
    "phaseType": "learn",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "Exponential and logarithmic functions are inverses. This means their key behaviors reverse:\n\n| Exponential $f(x) = b^x$ | Logarithmic $g(x) = \\log_b(x)$ |\n|---|---|\n| Domain: all reals | Domain: $(0, \\infty)$ |\n| Range: $(0, \\infty)$ | Range: all reals |\n| Input changes additively | Input changes multiplicatively |\n| Output changes multiplicatively | Output changes additively |\n\n**Recognizing logarithmic functions from tables:** If inputs multiply by a constant factor and outputs change by a constant amount, the function is logarithmic.\n\n**Verifying inverses by composition:** If $f(x) = b^x$ and $g(x) = \\log_b(x)$, then:\n- $f(g(x)) = b^{\\log_b(x)} = x$\n- $g(f(x)) = \\log_b(b^x) = x$\n\n**Sketching inverse graphs:** Reflect key points of the exponential graph over the line $y = x$. The point $(a, b)$ on $f$ becomes $(b, a)$ on $f^{-1}$."
        }
      }
    ]
  },
  {
    "phaseNumber": 4,
    "title": "Worked Example",
    "phaseType": "worked_example",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Example 1:** Classify each table as logarithmic, exponential, or neither.\n\n| x | 1 | 2 | 3 | 4 |\n|---|---|---|---|---|\n| h(x) | 16 | 8 | 4 | 2 |\n\n**Solution:** Exponential. Outputs halve (constant ratio $1/2$).\n\n| x | 10 | 30 | 90 | 270 |\n|---|---|---|---|---|\n| k(x) | 10 | 20 | 30 | 40 |\n\n**Solution:** Logarithmic. Inputs multiply by 3; outputs increase by 10.\n\n**Example 2:** Let $f(x) = 3^x$ and $g(x) = \\log_3(x)$. Verify they are inverses.\n- $f(g(x)) = 3^{\\log_3(x)} = x$\n- $g(f(x)) = \\log_3(3^x) = x$\n\n**Example 3:** The graph of $f(x) = 2^x$ passes through $(0, 1), (1, 2), (2, 4), (-1, 0.5)$. Sketch $f^{-1}(x) = \\log_2(x)$ by reflecting over $y = x$.\n\n**Solution:** Reflect each point: $(0, 1) \\to (1, 0)$, $(1, 2) \\to (2, 1)$, $(2, 4) \\to (4, 2)$, $(-1, 0.5) \\to (0.5, -1)$.\n\n**Example 4:** $h(x) = a^x$ contains $(2, 3)$ and $(6, 27)$. Find the average rate of change of $y = \\log_a(x)$ over $[3, 27]$. Since the inverse has points $(3, 2)$ and $(27, 6)$, the rate = $\\frac{6-2}{27-3} = \\frac{1}{6}$."
        }
      }
    ]
  },
  {
    "phaseNumber": 5,
    "title": "Guided Practice",
    "phaseType": "guided_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** Classify each as logarithmic, exponential, or neither.\n- a) x: 0, 3, 6, 9 → f(x): 1, 4, 9, 16\n- b) x: 0, 1, 2, 3 → g(x): 1, 4, 16, 64\n- c) x: 40, 20, 10, 5 → k(x): -1, -2, -3, -4\n\n**Hint:** Constant ratio in outputs → exponential. Inputs multiply with additive outputs → logarithmic.\n\n**Problem 2:** The graph of $y = 5^x$ passes through $(0, 1), (1, 5), (2, 25)$. Reflect each point over $y = x$ and sketch $y = \\log_5(x)$.\n\n**Problem 3:** Given $f(x) = a^x$ passes through $(3, 8)$, find the average rate of change of $\\log_a(x)$ from $x = 2$ to $x = 16$.\n\n**Hint:** $a^3 = 8$ gives $a = 2$. Then $\\log_2(2) = 1$ and $\\log_2(16) = 4$."
        }
      }
    ]
  },
  {
    "phaseNumber": 6,
    "title": "Independent Practice",
    "phaseType": "independent_practice",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Problem 1:** Classify each table.\n- a) x: 0, 1, 2, 3 → f(x): 1, 4, 9, 16\n- b) x: 1, 2, 4, 8 → h(x): 1, 3, 5, 7\n- c) x: 0, 1, 2, 3 → g(x): 1, 4, 16, 64\n\n**Problem 2:** The graph of $y = 4^x$ passes through $(0, 1), (1, 4), (2, 16), (-1, 0.25)$. Reflect each point over $y = x$ to sketch $y = \\log_4(x)$.\n\n**Problem 3:** $f(x) = a^x$ contains $(1, 3)$ and $(5, 243)$. Find the average rate of change of $\\log_a(x)$ over $[3, 27]$."
        }
      }
    ]
  },
  {
    "phaseNumber": 7,
    "title": "Reflection",
    "phaseType": "reflection",
    "estimatedMinutes": 10,
    "sections": [
      {
        "sequenceOrder": 1,
        "sectionType": "text",
        "content": {
          "markdown": "**Exit Ticket:** x: 5, 50, 500, 5000 → p(x): 1, 2, 3, 4. Is $p$ logarithmic, exponential, or neither? Justify.\n\n**Lesson Summary:** Logarithmic functions are inverses of exponential functions. Exponential has additive inputs and multiplicative outputs; logarithmic reverses this. Verify via composition: $f(f^{-1}(x)) = x$."
        }
      }
    ]
  }
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
