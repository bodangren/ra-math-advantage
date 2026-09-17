import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_3Result> => {
    const now = Date.now();
    const lessonSlug = "2-3-exponential-functions";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.3: Exponential Functions",
          orderIndex: 3,
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
          title: "Exponential Functions",
          description: "AP Precalculus Topic 2.3: Exponential Functions",
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
          "markdown": "Consider the functions $f(x) = 2^x$ and $g(x) = (1/2)^x$. As $x$ gets very large, what does each function approach? As $x$ gets very negative? Do either function ever turn around and start going the other direction — could $2^x$ ever start decreasing?"
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
          "markdown": "- **Exponential growth**: Occurs when $a > 0$ and $b > 1$ in $f(x) = a \\cdot b^x$. The function is increasing — output values get larger as $x$ increases.\n- **Exponential decay**: Occurs when $a > 0$ and $0 < b < 1$. The function is decreasing — output values get smaller as $x$ increases.\n- **End behavior**: Described using limit notation: $\\lim_{x \\to \\infty} f(x)$ and $\\lim_{x \\to -\\infty} f(x)$.\n- **Concavity**: Whether the graph curves upward (concave up) or downward (concave down). Exponential functions always have the same concavity.\n- **Increasing/Decreasing**: Whether outputs rise or fall as inputs increase. Exponential functions are always one or the other — they never switch."
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
          "markdown": "An exponential function has the form $f(x) = a \\cdot b^x$, where $b > 0$, $a \\neq 0$, and $b \\neq 1$.\n\nThree critical properties distinguish exponential functions:\n\n1. **Always increasing or always decreasing** — they never change direction and have no local maxima or minima.\n2. **Always concave up or always concave down** — they never switch concavity and have no inflection points.\n3. **End behavior is governed by limits**:\n\nFor exponential growth ($a > 0$, $b > 1$):\n$$\\lim_{x \\to -\\infty} f(x) = 0 \\quad \\text{and} \\quad \\lim_{x \\to \\infty} f(x) = \\infty$$\n\nFor exponential decay ($a > 0$, $0 < b < 1$):\n$$\\lim_{x \\to \\infty} f(x) = 0 \\quad \\text{and} \\quad \\lim_{x \\to -\\infty} f(x) = \\infty$$\n\nWhen $a < 0$, the graph is reflected over the x-axis, flipping both increasing/decreasing behavior and concavity."
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
          "markdown": "**Example 1:** Write limit statements for $f(x) = 2^x$.\n\n**Solution:**\nSince $b = 2 > 1$ and $a = 1 > 0$, this is exponential growth.\n$$\\lim_{x \\to -\\infty} 2^x = 0 \\quad \\text{and} \\quad \\lim_{x \\to \\infty} 2^x = \\infty$$\n\n**Example 2:** Determine whether $g(x) = -3(1/2)^x$ is increasing or decreasing and concave up or down.\n\n**Solution:**\nSince $a = -3 < 0$, the negative coefficient reflects the decay curve over the x-axis. The function $-(1/2)^x$ is **increasing** (as $x$ increases, a negative value getting closer to 0 means the output rises) and **concave down**.\n\n$$\\lim_{x \\to -\\infty} g(x) = -\\infty \\quad \\text{and} \\quad \\lim_{x \\to \\infty} g(x) = 0$$\n\n**Example 3:** Write limit statements for $h(x) = (2/5)^{3x}$.\n\n**Solution:**\nRewrite: $(2/5)^{3x} = ((2/5)^3)^x = (8/125)^x$. Since $0 < 8/125 < 1$, this is decreasing, concave up.\n$$\\lim_{x \\to \\infty} h(x) = 0 \\quad \\text{and} \\quad \\lim_{x \\to -\\infty} h(x) = \\infty$$"
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
          "markdown": "**Problem 1:** Write limit statements for each function.\n\na) $h(x) = 2^{-3x}$\n\nb) $k(x) = (3/5)^{8x}$\n\n**Hint:** Determine whether the effective base is greater than 1 or between 0 and 1.\n\n**Problem 2:** Classify each as increasing or decreasing, and concave up or concave down.\n\na) $f(x) = (1/3)^{4x}$\n\nb) $h(x) = (4/3)^{2x}$\n\n**Hint:** Remember: if $0 < b < 1$, the function is decreasing and concave up. If $b > 1$, it is increasing and concave up (assuming $a > 0$)."
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
          "markdown": "**Problem 1:** Write limit statements for $m(x) = (3/6)^{-2x}$.\n\n**Problem 2:** Write limit statements for $n(x) = (7/4)^{-x} \\cdot \\pi$.\n\n**Problem 3:** Which of the following is an exponential decay function?\n\n(A) $k(x) = (4/3)^{2x}$ \\quad (B) $k(x) = 4^{-2x+3}$ \\quad (C) $k(x) = (1/2)^{4x-3}$ \\quad (D) Both B and C\n\n**Problem 4:** Sketch the graph of an exponential function where $\\lim_{x \\to \\infty} f(x) = -\\infty$ and $\\lim_{x \\to -\\infty} f(x) = 0$. Write a possible equation."
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
          "markdown": "**Exit Ticket:** Is $f(x) = (1/5)^{2x}$ increasing or decreasing? Concave up or down? Write the right-hand limit.\n\n**Lesson Summary:** Exponential functions $f(x) = a \\cdot b^x$ are always monotonic (only increasing or only decreasing) and always maintain one concavity. They never have local extrema or inflection points. Limit statements describe their end behavior — exponential functions either approach 0 or shoot off to $\\pm \\infty$ as $x \\to \\pm \\infty$. The sign of $a$ determines whether the graph is above or below the x-axis."
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
