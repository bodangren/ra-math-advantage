import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_7Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_7 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_7Result> => {
    const now = Date.now();
    const lessonSlug = "4-7-parametrization";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametrization of Implicitly Defined Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.7: Parametrization of Implicitly Defined Functions",
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
          title: "Parametrization of Implicitly Defined Functions",
          description: "AP Precalculus Topic 4.7: Parametrization of Implicitly Defined Functions",
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
                "We know that $x = \\cos(t)$, $y = \\sin(t)$ traces the unit circle $x^2 + y^2 = 1$. Can we find parametric equations for *other* implicit curves, like the ellipse $\\frac{x^2}{9} + \\frac{y^2}{4} = 1$ or the hyperbola $x^2 - y^2 = 1$? Parametrizing implicit curves converts static equations into dynamic paths.",
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
                "- **Parametrization**: A set of parametric equations $(x(t), y(t))$ that traces out an implicitly defined curve.\n- **Trigonometric parametrization**: Using sine and cosine (or other trig functions) to parameterize a curve.\n- **Branch**: One connected piece of a curve that requires a separate parametrization.",
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
                "**Ellipse**: $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ can be parameterized as:\n$$x = a\\cos(t), \\quad y = bsin(t), \\quad 0 \\leq t \\leq 2\\pi$$\n\nThis works because $\\frac{a^2\\cos^2(t)}{a^2} + \\frac{b^2\\sin^2(t)}{b^2} = \\cos^2(t) + \\sin^2(t) = 1$. ✓\n\n**Hyperbola**: $\\frac{x^2}{a^2} - \\frac{y^2}{b^2} = 1$ can be parameterized using **hyperbolic functions** (beyond this course) or by noting that $x = asec(t)$ and $y = btan(t)$ satisfy the equation (since $\\sec^2(t) - \\tan^2(t) = 1$). This traces the right branch; the left branch uses $x = -asec(t)$.\n\n**General strategy**:\n1. Identify the conic type from the implicit equation.\n2. Choose a trig identity that matches (e.g., $\\cos^2 + \\sin^2 = 1$ for ellipses, $\\sec^2 - \\tan^2 = 1$ for hyperbolas).\n3. Scale and shift to match the equation's parameters.",
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
                "**Example 1:** Parameterize $\\frac{x^2}{16} + \\frac{y^2}{25} = 1$.\n\n**Solution:** Here $a = 4$, $b = 5$:\n$$x = 4\\cos(t), \\quad y = 5\\sin(t), \\quad 0 \\leq t \\leq 2\\pi$$\n\n**Example 2:** Parameterize $(x - 1)^2 + (y + 3)^2 = 9$.\n\n**Solution:** This is a circle centered at $(1, -3)$ with radius 3:\n$$x = 1 + 3\\cos(t), \\quad y = -3 + 3\\sin(t), \\quad 0 \\leq t \\leq 2\\pi$$",
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
                "**Problem 1:** Parameterize $\\frac{x^2}{36} + \\frac{y^2}{49} = 1$.\n\n**Hint:** Identify $a$ and $b$, then use $x = a\\cos(t)$, $y = bsin(t)$.\n\n**Problem 2:** Parameterize $x^2 + y^2 - 6x + 4y + 4 = 0$.\n\n**Hint:** First complete the square to find the center and radius.",
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
                "**Problem 1:** Parameterize $9x^2 + 4y^2 = 36$.\n\n**Problem 2:** A circle has center $(3, -2)$ and passes through $(6, -2)$. Write its parametric equations.\n\n**Problem 3:** Explain why the ellipse $\\frac{x^2}{a^2} + \\frac{y^2}{b^2} = 1$ can use $x = a\\sin(t)$, $y = bcos(t)$ instead of cosine for $x$. Does it trace the same curve?",
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
                "**Exit Ticket:** Parameterize $\\frac{x^2}{9} + \\frac{y^2}{16} = 1$.\n\n**Lesson Summary:** Implicit curves can be parameterized by matching trig identities to the equation's structure. Ellipses use $\\cos$ and $\\sin$; circles are special cases. Completing the square handles centered forms.",
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
