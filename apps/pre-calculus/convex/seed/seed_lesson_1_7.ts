import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson1_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson1_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson1_7Result> => {
    const now = Date.now();
    const lessonSlug = "1-7-rational-functions-end-behavior";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Rational Functions and End Behavior",
          slug: lessonSlug,
          description: "AP Precalculus Topic 1.7: Rational Functions and End Behavior",
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
          title: "Rational Functions and End Behavior",
          description: "AP Precalculus Topic 1.7: Rational Functions and End Behavior",
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
                "Consider $f(x) = \\frac{3x^2 + 4}{x^2 - 1}$. As $x$ gets very large, both the numerator and denominator grow like $x^2$. What does the fraction approach? Now consider $g(x) = \\frac{2x + 1}{x^2 + 3}$ — the denominator grows much faster than the numerator. What does $g(x)$ approach? Rational functions are \"just fractions of polynomials,\" and their end behavior depends on how the numerator's degree compares to the denominator's degree.",
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
                "- **Rational function**: The quotient of two polynomials: $y = \\frac{f(x)}{g(x)}$ where $f(x)$ and $g(x)$ are polynomials and $g(x) \\neq 0$.\n- **Horizontal asymptote (HA)**: A horizontal line $y = c$ that the graph approaches as $x \\to \\pm \\infty$.\n- **Slant (oblique) asymptote**: A non-horizontal, non-vertical line that the graph approaches as $x \\to \\pm \\infty$. Occurs when the numerator's degree exceeds the denominator's degree by exactly 1.\n- **Numerator degree ($n$)**: The degree of the polynomial in the numerator.\n- **Denominator degree ($d$)**: The degree of the polynomial in the denominator.",
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
                "The end behavior of a rational function depends on comparing $n$ (numerator degree) and $d$ (denominator degree):\n\n**Case I: $n = d$** (same degree) — The horizontal asymptote is $y = \\frac{a}{b}$, where $a$ and $b$ are the leading coefficients of the numerator and denominator. Both ends approach the same horizontal line.\n\n**Case II: $n < d$** (denominator dominates) — The horizontal asymptote is $y = 0$. The denominator grows faster, so the fraction shrinks toward zero.\n\n**Case III: $n > d$** (numerator dominates) — No horizontal asymptote. If $n = d + 1$ exactly, the function has a **slant asymptote**. If $n > d + 1$, the end behavior follows a polynomial trend (lim(x to pm infty) goes to $\\pm \\infty$).\n\n**Process**: Always start by identifying the degree of the numerator and denominator. Then classify which case applies. Write the HA equation or determine the slant asymptote. Finally, write limit statements.\n\n**Common mistake**: Trying to divide every term instead of just comparing leading terms. Only the leading terms matter for end behavior.",
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
                "**Example 1:** Determine asymptote type.\n\na) $f(x) = \\frac{3x^2 + 4x - 7}{5x^2 - 3}$ → $n = 2$, $d = 2$. **Case I**: HA at $y = \\frac{3}{5}$.\n\nb) $y = \\frac{2x - 5}{x^2 + 3x + 2}$ → $n = 1$, $d = 2$. **Case II**: HA at $y = 0$.\n\nc) $g(x) = \\frac{2x^2 - 4}{5x + 9}$ → $n = 2$, $d = 1$. **Case III**: slant asymptote ($n = d + 1$).\n\nd) $k(x) = \\frac{3}{x^2 + 3x - 7}$ → $n = 0$, $d = 2$. **Case II**: HA at $y = 0$.\n\n**Example 2:** Write limit statements.\n\na) $f(x) = \\frac{2x^3 + 4x - 1}{6x^3 - x^2 + 4}$ → $n = 3$, $d = 3$. HA: $y = \\frac{2}{6} = \\frac{1}{3}$.\n   - lim(x to infty) f(x) = frac{1}{3}, lim(x to -infty) f(x) = frac{1}{3}\n\nb) $g(x) = \\frac{5x^2 - 8x + 9}{2x^3 + x - 1}$ → $n = 2$, $d = 3$. HA: $y = 0$.\n   - lim(x to infty) g(x) = 0, lim(x to -infty) g(x) = 0\n\nc) $h(x) = \\frac{-3x^4 - x^2 + x}{x^3 + 4x + 4}$ → $n = 4$, $d = 3$. Since $n > d + 1$, the leading ratio is $-3x$. As $x \\to \\infty$, $h(x) \\to -\\infty$. As $x \\to -\\infty$, $h(x) \\to \\infty$.\n\n**Example 3:** Which functions have a slant asymptote parallel to $y = \\frac{1}{2}x$?\n\n**Solution:** Only functions where $n = d + 1$ and the leading coefficient ratio $\\frac{a}{b} = \\frac{1}{2}$ qualify.",
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
                "**Problem 1:** Does $f(x) = \\frac{5x^2 + 3}{2x^2 - 1}$ have a horizontal or slant asymptote? Write its equation.\n\n**Hint:** $n = 2$, $d = 2$ → same degree → HA at $y = \\frac{5}{2}$.\n\n**Problem 2:** Write limit statements for $g(x) = \\frac{4x - 7}{8x + 2}$.\n\n**Hint:** $n = 1$, $d = 1$ → HA at $y = \\frac{4}{8} = \\frac{1}{2}$. Both limits approach $\\frac{1}{2}$.",
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
                "**Problem 1:** $y = \\frac{3x^2 - 1}{2x^2 + 5x + 7}$. Find the horizontal asymptote.\n\n**Problem 2:** $h(x) = \\frac{4x^2 - 5x - 2}{x^3 + 6x}$. Find the horizontal asymptote.\n\n**Problem 3:** $y = \\frac{3x^2 + 1}{x - 1}$. Does this function have a horizontal or slant asymptote? Explain.",
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
                "**Exit Ticket:** Does $f(x) = \\frac{5x^2 + 3}{2x^2 - 1}$ have a horizontal or slant asymptote? Write its equation and the corresponding limit statements.\n\n**Lesson Summary:** Rational functions are fractions of polynomials. Their end behavior depends on comparing numerator and denominator degrees: equal degrees give $y = a/b$, denominator-dominant gives $y = 0$, and numerator-dominant (by exactly 1) gives a slant asymptote. Always start by identifying degrees and leading coefficients — only the leading terms control end behavior.",
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
