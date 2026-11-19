import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson4_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson4_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson4_2Result> => {
    const now = Date.now();
    const lessonSlug = "4-2-parametric-motion-modeling";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 4,
          title: "Parametric Functions Modeling Planar Motion",
          slug: lessonSlug,
          description: "AP Precalculus Topic 4.2: Parametric Functions Modeling Planar Motion",
          orderIndex: 2,
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
          title: "Parametric Functions Modeling Planar Motion",
          description: "AP Precalculus Topic 4.2: Parametric Functions Modeling Planar Motion",
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
                "A soccer ball is kicked across a field. At time $t$ seconds, its position is $x(t) = 20t$ horizontally and $y(t) = -16t^2 + 30t$ vertically. Where is the ball after 1 second? When does it land? Parametric equations let us model two-dimensional motion by tracking horizontal and vertical components independently.",
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
                "- **Planar motion**: Movement in a two-dimensional plane, described by separate horizontal and vertical components.\n- **Position function**: A parametric function $(x(t), y(t))$ that gives the location of an object at time $t$.\n- **Domain restriction on the parameter**: Limiting $t$ to a meaningful interval (e.g., $t \\geq 0$ or $0 \\leq t \\leq T$) to reflect physical constraints.\n- **Projectile motion**: A special case where horizontal velocity is constant and vertical motion is governed by gravity.",
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
                "Parametric functions are natural tools for modeling **planar motion** because they separate horizontal and vertical behavior:\n\n$$x(t) = x_0 + v_x t, \\quad y(t) = y_0 + v_y t + \\frac{1}{2}at^2$$\n\n- $x_0, y_0$ = initial position\n- $v_x, v_y$ = initial velocities\n- $a$ = acceleration (for gravity, $a = -32$ ft/s² or $a = -9.8$ m/s²)\n\n**Horizontal motion** is typically linear (no air resistance). **Vertical motion** is typically quadratic (gravity acts downward).\n\n**Finding when the object lands**: Set $y(t) = 0$ and solve for $t$ (taking the positive solution). Then substitute into $x(t)$ to find the landing position.\n\n**Key constraint**: The domain of $t$ should reflect reality — time starts at $t = 0$ and ends when the object lands or the motion stops.",
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
                "**Example:** A ball is launched from the origin with $x(t) = 12t$ and $y(t) = -16t^2 + 20t$.\n\n**(a)** Where is the ball at $t = 1$?\n- $x(1) = 12(1) = 12$\n- $y(1) = -16(1)^2 + 20(1) = 4$\n- Position: $(12, 4)$\n\n**(b)** When does the ball land?\nSet $y(t) = 0$:\n$$-16t^2 + 20t = 0 \\implies t(-16t + 20) = 0 \\implies t = 0 \\text{ or } t = \\frac{20}{16} = 1.25 \\text{ seconds}$$\n\n**(c)** Where does it land?\n$x(1.25) = 12(1.25) = 15$. The ball lands at $(15, 0)$.",
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
                "**Problem 1:** A projectile has $x(t) = 8t$ and $y(t) = -16t^2 + 24t$. Find its position at $t = 0.5$.\n\n**Hint:** Substitute $t = 0.5$ into both equations.\n\n**Problem 2:** For the projectile in Problem 1, when does it land and where?\n\n**Hint:** Set $y(t) = 0$ and solve. Then evaluate $x$ at that time.",
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
                "**Problem 1:** A model rocket has $x(t) = 6t$ and $y(t) = -16t^2 + 48t$. Find its maximum height and the time at which it occurs.\n\n**Problem 2:** A ball is thrown from position $(2, 5)$ with $x(t) = 2 + 10t$ and $y(t) = 5 - 16t^2 + 8t$. When does the ball hit the ground ($y = 0$)?\n\n**Problem 3:** Two objects move with $x_1(t) = 3t, y_1(t) = 4t$ and $x_2(t) = 12 - 3t, y_2(t) = 8t$. At what time and position do they meet?",
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
                "**Exit Ticket:** For $x(t) = 15t$ and $y(t) = -16t^2 + 30t$, find the landing position of the projectile.\n\n**Lesson Summary:** Parametric equations model planar motion by treating horizontal and vertical components separately. Horizontal motion is typically linear; vertical motion is quadratic when gravity is involved. Landing occurs when $y(t) = 0$.",
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
