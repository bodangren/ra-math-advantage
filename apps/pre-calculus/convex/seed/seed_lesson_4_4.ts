import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_4Result> => {
    const now = Date.now();
    const lessonSlug = "4-4-parametric-circles-lines";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametrically Defined Circles and Lines",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.4: Parametrically Defined Circles and Lines",
          orderIndex: 4,
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
          title: "Parametrically Defined Circles and Lines",
          description: "AP Precalculus Topic 4.4: Parametrically Defined Circles and Lines",
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
                "The equation $x^2 + y^2 = 25$ describes a circle of radius 5. But how would you write parametric equations for it? If $x = 5\\cos(t)$ and $y = 5\\sin(t)$, then $x^2 + y^2 = 25\\cos^2(t) + 25\\sin^2(t) = 25$ — it works! Parametric representations of circles and lines unlock powerful tools for describing paths and geometric objects.",
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
                "- **Parametric equation of a line**: Given a point $(x_0, y_0)$ and a direction vector $langle a, brangle$: $x = x_0 + at$, $y = y_0 + bt$.\n- **Parametric equation of a circle**: A circle of radius $r$ centered at $(h, k)$: $x = h + rcos(t)$, $y = k + rsin(t)$.\n- **Orientation**: The direction the curve is traced as $t$ increases (counterclockwise for the standard circle parameterization).",
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
                "**Parametric lines**: A line through $(x_0, y_0)$ moving in direction $langle a, brangle$ is:\n\n$$x = x_0 + at, \\quad y = y_0 + bt$$\n\nAs $t$ increases, the point moves along the line in the direction of $langle a, brangle$. The slope of the line is $\\frac{b}{a}$ (when $a \\neq 0$).\n\n**Parametric circles**: A circle of radius $r$ centered at $(h, k)$:\n\n$$x = h + rcos(t), \\quad y = k + rsin(t)$$\n\nAs $t$ goes from $0$ to $2\\pi$, the point traces the circle once, counterclockwise, starting from $(h + r, k)$.\n\n**Eliminating the parameter**: For the circle, $x - h = rcos(t)$ and $y - k = rsin(t)$, so $(x - h)^2 + (y - k)^2 = r^2\\cos^2(t) + r^2\\sin^2(t) = r^2$. This recovers the standard circle equation.\n\n**Why parametric?** A circle cannot be written as a single function $y = f(x)$ (it fails the vertical line test). Parametric equations bypass this limitation.",
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
                "**Example 1:** Write parametric equations for a circle of radius 3 centered at $(1, -2)$.\n\n**Solution:** $x = 1 + 3\\cos(t)$, $y = -2 + 3\\sin(t)$\n\n**Verification**: $(x - 1)^2 + (y + 2)^2 = 9\\cos^2(t) + 9\\sin^2(t) = 9$. ✓\n\n**Example 2:** Write parametric equations for the line through $(2, 3)$ with direction $langle -1, 4rangle$.\n\n**Solution:** $x = 2 - t$, $y = 3 + 4t$\n\n**Verification**: $\\frac{dy}{dx} = \\frac{4}{-1} = -4$. The line passes through $(2, 3)$ at $t = 0$ and has slope $-4$. ✓",
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
                "**Problem 1:** Write parametric equations for a circle of radius 4 centered at the origin.\n\n**Hint:** Use $x = rcos(t)$ and $y = rsin(t)$ with $r = 4$.\n\n**Problem 2:** Write parametric equations for the line through $(5, 1)$ and $(8, 7)$.\n\n**Hint:** The direction vector is $langle 8 - 5, 7 - 1rangle = langle 3, 6rangle$.",
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
                "**Problem 1:** Write parametric equations for the line through $(-1, 4)$ with slope $\\frac{2}{3}$.\n\n**Problem 2:** A circle has parametric equations $x = 2\\cos(t)$ and $y = 2\\sin(t) + 3$. Find its center and radius.\n\n**Problem 3:** Eliminate the parameter from $x = 3 - 2t$, $y = 1 + 5t$ to find the Cartesian equation of the line.",
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
                "**Exit Ticket:** Write parametric equations for a circle of radius 6 centered at $(-2, 5)$.\n\n**Lesson Summary:** Circles and lines are easily represented in parametric form. Circles use cosine and sine; lines use a point plus a direction vector scaled by $t$. Parametric form overcomes the limitation that circles cannot be written as $y = f(x)$.",
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
