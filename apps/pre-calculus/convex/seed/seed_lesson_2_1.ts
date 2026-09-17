import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_1Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_1 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_1Result> => {
    const now = Date.now();
    const lessonSlug = "2-1-arithmetic-geometric-sequences";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Change in Arithmetic and Geometric Sequences",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.1: Change in Arithmetic and Geometric Sequences",
          orderIndex: 1,
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
          title: "Change in Arithmetic and Geometric Sequences",
          description: "AP Precalculus Topic 2.1: Change in Arithmetic and Geometric Sequences",
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
          "markdown": "Consider these two sequences of values:\n\n**Sequence A:** 3, 7, 11, 15, 19, ...\n\n**Sequence B:** 3, 6, 12, 24, 48, ...\n\nFor each sequence, compute the difference between consecutive terms and the ratio of consecutive terms. What patterns do you notice? How would you predict the next two terms in each sequence?"
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
          "markdown": "- **Sequence**: A function whose domain is a subset of the integers. Each term is identified by its position index $n$.\n- **Arithmetic sequence**: A sequence with a constant difference $d$ between consecutive terms. The change is additive.\n- **Geometric sequence**: A sequence with a constant ratio $r$ between consecutive terms. The change is multiplicative.\n- **Common difference** ($d$): The constant value added to each term to get the next term in an arithmetic sequence. Found by $d = a_{n+1} - a_n$.\n- **Common ratio** ($r$): The constant value each term is multiplied by to get the next term in a geometric sequence. Found by $r = g_{n+1} / g_n$.\n- **Explicit formula**: A formula that directly computes the $n$th term from the index, without needing previous terms."
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
          "markdown": "A **sequence** is a function from the natural numbers to the real numbers. The inputs are whole-number positions only — this means when graphing a sequence, you plot discrete points, never connecting them with lines or curves.\n\n**Arithmetic sequences** model constant additive change and behave like linear functions. The explicit formula is:\n\n$$a_n = a_0 + d \\cdot n \\quad \\text{or} \\quad a_n = a_k + d(n - k)$$\n\n**Geometric sequences** model constant multiplicative change and behave like exponential functions. The explicit formula is:\n\n$$g_n = g_0 \\cdot r^n \\quad \\text{or} \\quad g_n = g_k \\cdot r^{(n-k)}$$\n\nTo classify a sequence: compute the differences between consecutive terms. If constant, the sequence is arithmetic with $d$ equal to that constant. If differences are not constant, compute ratios. If constant, the sequence is geometric with $r$ equal to that constant. If neither is constant, the sequence is neither arithmetic nor geometric.\n\nWhen writing a geometric formula from two given terms, use $g_n = g_k \\cdot r^{(n-k)}$ with the larger index as the $g_n$ term to avoid fractional exponents."
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
          "markdown": "**Example 1:** Let $a_n$ be arithmetic with $a_3 = 8$ and $d = -3$. Find $a_n$ and $a_{12}$.\n\n**Solution:**\n$$a_n = a_3 + d(n - 3) = 8 + (-3)(n - 3) = 8 - 3n + 9 = 17 - 3n$$\n\nChecking: $a_3 = 17 - 9 = 8$ \\checkmark\n\n$$a_{12} = 17 - 3(12) = 17 - 36 = -19$$\n\n**Example 2:** Let $g_n$ be geometric with $g_3 = -2$ and $g_6 = 128$. Find $g_n$ and $g_{11}$.\n\n**Solution:**\n$$128 = -2 \\cdot r^{(6-3)} \\implies 128 = -2r^3 \\implies r^3 = -64 \\implies r = -4$$\n\n$$g_n = -2 \\cdot (-4)^{(n-3)}$$\n\n$$g_{11} = -2 \\cdot (-4)^8 = -2 \\cdot 65536 = -131072$$"
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
          "markdown": "**Problem 1:** Classify each sequence as arithmetic, geometric, or neither. If arithmetic, state $d$. If geometric, state $r$.\n\na) 12, 7, 2, -3, -8, ...\n\nb) -5, 10, -20, 40, ...\n\nc) 1, 3, 2, 6, 4, 12, ...\n\n**Hint:** For each, first compute consecutive differences. If not constant, compute consecutive ratios.\n\n**Problem 2:** Let $a_n$ be arithmetic with $a_2 = 7$ and $a_6 = 9$. Find $a_n$ and $a_{24}$.\n\n**Hint:** Use $d = (a_6 - a_2)/(6 - 2)$ to find the common difference, then write the formula using $a_n = a_2 + d(n - 2)$."
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
          "markdown": "**Problem 1:** Classify and write the explicit formula for: -16, -8, -4, -2, -1, ...\n\n**Problem 2:** Let $g_n$ be geometric with $g_1 = 5$ and $r = -2$. Find $g_n$ and $g_6$.\n\n**Problem 3:** Let $g_n$ be geometric with $g_2 = 48$ and $g_7 = 1.5$. Find $g_n$ and $g_{10}$.\n\n**Problem 4:** Classify as arithmetic, geometric, or neither: $s_n = 2 \\cdot 3^n$. If it fits a type, state the common difference or ratio.\n\n**Problem 5:** Let $a_n$ be arithmetic with $a_5 = 7$ and $a_3 = -9$. Find $a_n$ and $a_{20}$."
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
          "markdown": "**Exit Ticket:** Let $a_n$ be arithmetic with $a_5 = 7$ and $a_3 = -9$. Find the explicit formula $a_n$.\n\n**Lesson Summary:** Arithmetic sequences have constant additive change (common difference $d$) and behave like linear functions. Geometric sequences have constant multiplicative change (common ratio $r$) and behave like exponential functions. Both are discrete — their graphs consist of unconnected points, not curves. The explicit formulas $a_n = a_k + d(n - k)$ and $g_n = g_k \\cdot r^{(n-k)}$ allow direct computation of any term."
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
