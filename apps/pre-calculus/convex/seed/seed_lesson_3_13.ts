import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_13Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_13 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_13Result> => {
    const now = Date.now();
    const lessonSlug = "3-13-polar-coordinates";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Trigonometry and Polar Coordinates",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.13: Trigonometry and Polar Coordinates",
          orderIndex: 13,
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
          title: "Trigonometry and Polar Coordinates",
          description: "AP Precalculus Topic 3.13: Trigonometry and Polar Coordinates",
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
          "markdown": "A ship is 5 miles from a harbor at an angle of $\\pi/3$ from due east. You could describe this as the rectangular point $(2.5, 4.33)$, but that obscures the natural description: 5 miles, angle $\\pi/3$. A polar coordinate system uses distance and angle directly. How do you convert between these two systems, and why can a single point have infinitely many polar representations?"
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
          "markdown": "- **Polar coordinates** $(r, \\theta)$: A point defined by radius $r$ (distance from origin) and angle $\\theta$ (in standard position). The same point has many representations.\n- **Rectangular coordinates** $(x, y)$: The familiar Cartesian system. Connected to polar by $x = rcos(\\theta)$, $y = rsin(\\theta)$.\n- **Polar-to-rectangular formulas**: $x = rcos(\\theta)$, $y = rsin(\\theta)$.\n- **Rectangular-to-polar formulas**: $r^2 = x^2 + y^2$, $\\tan(\\theta) = y/x$.\n- **Polar form of a complex number**: $r(\\cos(\\theta) + i \\sin(\\theta)$ where $(r, \\theta)$ are the polar coordinates of $(a, b)$ for $a + bi$."
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
          "markdown": "In polar coordinates, a point $A$ is defined by $(r, \\theta)$ where $r$ is the radius of the circle on which $A$ lies and $\\theta$ is the angle in standard position whose terminal ray includes $A$.\n\n**Key insight**: The same point can be represented many different ways. The point $(5, \\pi/2)$ can also be written as $(5, 5\\pi/2)$, $(-5, 3\\pi/2)$, or $(-5, -\\pi/2)$.\n\n**Conversion formulas:**\n\nPolar to rectangular:\n$$x = rcos(\\theta), \\quad y = rsin(\\theta)$$\n\nRectangular to polar:\n$$r^2 = x^2 + y^2, \\quad \\tan(\\theta) = \\frac{y}{x}$$\n\n**Tip**: Always sketch the point first and check that your answer makes sense. When computing $\\theta$ from $\\tan(\\theta) = y/x$, check the quadrant — $\\arctan$ only gives angles in $(-\\pi/2, \\pi/2)$.\n\n**Complex numbers**: The rectangular form $a + bi$ corresponds to the point $(a, b)$. Its polar form is $r(\\cos(\\theta) + i \\sin(\\theta))$. For example, $-2 - 2i$ has $r = \\sqrt{8} = 2\\sqrt{2}$ and $\\theta = 5\\pi/4$, giving $2\\sqrt{2}(\\cos(5\\pi/4) + i \\sin(5\\pi/4))$."
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
          "markdown": "**Example 1:** Convert $(5, 4\\pi/3)$ to rectangular coordinates.\n\n**Solution:**\n- $x = 5\\cos(4\\pi/3) = 5 \\cdot (-1/2) = -5/2$\n- $y = 5\\sin(4\\pi/3) = 5 \\cdot (-\\sqrt{3}/2) = -5\\sqrt{3}/2$\n- Rectangular: $(-5/2, -5\\sqrt{3}/2)$\n\n**Example 2:** Convert $(2, -2)$ to polar coordinates.\n\n**Solution:**\n- $r = \\sqrt{4 + 4} = \\sqrt{8} = 2\\sqrt{2}$\n- $\\tan(\\theta) = -2/2 = -1$. Point is in QIV, so $\\theta = -\\pi/4$ (or $7\\pi/4$)\n- Polar: $(2\\sqrt{2}, -\\pi/4)$\n\n**Example 3:** Convert $(-1, \\sqrt{3})$ to polar coordinates.\n\n**Solution:**\n- $r = \\sqrt{1 + 3} = 2$\n- $\\tan(\\theta) = \\sqrt{3}/(-1) = -\\sqrt{3}$. Point is in QII, so $\\theta = 2\\pi/3$\n- Polar: $(2, 2\\pi/3)$\n\n**Example 4:** Write two different polar representations for $(5, \\pi/2)$.\n\n**Solution:**\n- Original: $(5, \\pi/2)$\n- Add $2\\pi$: $(5, 5\\pi/2)$\n- Negate $r$, add $\\pi$: $(-5, 3\\pi/2)$"
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
          "markdown": "**Problem 1:** Convert $(2, \\pi)$ to rectangular coordinates.\n\n**Hint:** Use $x = 2\\cos(\\pi)$ and $y = 2\\sin(\\pi)$.\n\n**Problem 2:** Convert $(7, -\\pi/2)$ to rectangular coordinates.\n\n**Hint:** What is $\\sin(-\\pi/2)$?\n\n**Problem 3:** Convert $(0, -5)$ to polar coordinates.\n\n**Hint:** This point is on the negative $y$-axis. What angle does that correspond to?"
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
          "markdown": "**Problem 1:** Convert to rectangular:\n- $(2, \\pi)$\n- $(7, -\\pi/2)$\n\n**Problem 2:** Convert to polar (give $r > 0$ and $0 \\leq \\theta < 2\\pi$):\n- $(2, -2)$\n- $(-1, \\sqrt{3})$\n\n**Problem 3:** Write the complex number $3 + 2i$ in polar form $r(\\cos(\\theta) + i \\sin(\\theta))$.\n\n**Hint:** Find $r = \\sqrt{a^2 + b^2}$ and $\\theta$ from the point $(3, 2)$.\n\n**Problem 4:** Convert $7(\\cos(7\\pi/6) + i \\sin(7\\pi/6))$ to rectangular form $a + bi$."
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
          "markdown": "**Exit Ticket:** Convert $(5, \\pi/3)$ to rectangular coordinates. Convert $(-3, 3)$ to polar coordinates.\n\n**Lesson Summary:** Polar coordinates $(r, \\theta)$ describe points by distance and angle. Conversion uses $x = rcos(\\theta)$, $y = rsin(\\theta)$ for polar-to-rectangular and $r^2 = x^2 + y^2$, $\\tan(\\theta) = y/x$ for rectangular-to-polar. A single point has infinitely many polar representations. When converting, always sketch the point and verify the quadrant. Complex numbers connect naturally: $a + bi \\rightarrow r(\\cos(\\theta) + i \\sin(\\theta))$."
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
