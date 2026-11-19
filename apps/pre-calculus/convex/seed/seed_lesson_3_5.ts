import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_5Result> => {
    const now = Date.now();
    const lessonSlug = "3-5-sinusoidal-transformations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sinusoidal Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.5: Sinusoidal Functions",
          orderIndex: 5,
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
          title: "Sinusoidal Functions",
          description: "AP Precalculus Topic 3.5: Sinusoidal Functions",
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
                "Is the cosine function just another version of the sine function? Consider $\\cos \\theta = \\sin(\\theta + \\pi/2)$. Graph both on the same axes. How are they related?\n\nEvery function that can be obtained by stretching, compressing, and shifting $\\sin \\theta$ (or equivalently $\\cos \\theta$) is called **sinusoidal**. But not every repeating pattern is sinusoidal — a square wave repeats but is not sinusoidal. What makes sinusoidal functions special?",
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
                "- **Sinusoidal function**: Any function that can be written as an additive and multiplicative transformation of $f(\\theta) = \\sin \\theta$. Equivalently, any function of the form $a\\sin(b\\theta) + d$ or $a\\cos(b\\theta) + d$.\n- **Increasing at an increasing rate**: The function is rising and the slope is getting steeper (concave up, above midline going up... or below midline going up — specifically concave up and increasing).\n- **Increasing at a decreasing rate**: The function is rising but the slope is flattening (concave down and increasing).\n- **Decreasing at an increasing rate**: The function is falling and the slope is becoming more negative (concave down and decreasing).\n- **Decreasing at a decreasing rate**: The function is falling but the slope is flattening toward zero (concave up and decreasing).",
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
                'A **sinusoidal function** is any function that involves additive and multiplicative transformations of $\\sin \\theta$. The cosine function qualifies because:\n\n$$\\cos \\theta = \\sin\\left(\\theta + \\frac{\\pi}{2}\\right)$$\n\nEvery sinusoidal function has four defining characteristics:\n1. **Midline** — the vertical center of oscillation\n2. **Amplitude** — the distance from midline to peak\n3. **Period** — the horizontal length of one full cycle\n4. **Frequency** — the number of cycles per unit of input ($1/\\text{period}$)\n\nA sinusoidal function is always periodic, but the converse is not true. A square wave or sawtooth wave is periodic but not sinusoidal. Only smooth, wave-shaped oscillations that match the sine/cosine pattern are sinusoidal.\n\nDescribing interval behavior requires four phrases: "increasing at an increasing rate," "increasing at a decreasing rate," "decreasing at an increasing rate," and "decreasing at a decreasing rate." These combine direction (increasing/decreasing) with concavity (rate of change speeding up or slowing down).',
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
                "**Example 1:** A sinusoidal function $h(\\theta)$ has a maximum at $(\\pi, 14)$ and a minimum at $(3\\pi/2, 6)$. Find the midline, amplitude, period, and frequency.\n\n**Solution:**\n- Midline: $d = (14 + 6)/2 = 10$\n- Amplitude: $a = (14 - 6)/2 = 4$\n- Period: $P = 2(3\\pi/2 - \\pi) = 2(\\pi/2) = \\pi$\n- Frequency: $f = 1/\\pi$\n\n**Example 2:** On the interval $(0, \\pi/2)$, describe the behavior of $f(\\theta) = \\sin \\theta$.\n\n**Solution:** $f$ is increasing (from $0$ toward $1$). The graph is above the midline and concave down as it approaches the peak. So $f$ is **increasing at a decreasing rate**.\n\n**Example 3:** Is every periodic function sinusoidal? Give a counterexample if not.\n\n**Solution:** No. A square wave that alternates between $1$ and $-1$ at regular intervals is periodic but has sharp corners — it is not a smooth transformation of sine or cosine.",
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
                "**Problem 1:** A sinusoidal function $g$ has a maximum at $(\\pi/3, 9)$ and a minimum at $(2\\pi/3, 1)$. Find the midline and amplitude.\n\n**Hint:** Midline = $(max + min)/2$, Amplitude = $(max - min)/2$.\n\n**Problem 2:** On the interval $(\\pi/2, \\pi)$, is $\\sin \\theta$ increasing or decreasing? Is it concave up or concave down? Combine these into one phrase.\n\n**Hint:** Sine is falling from $1$ to $0$ (decreasing). It is above the midline and bending downward (concave down). So: decreasing at a decreasing rate.\n\n**Problem 3:** Explain why $\\cos \\theta$ is a sinusoidal function but $f(\\theta) = \\sin(\\theta^2)$ is not.\n\n**Hint:** $\\cos \\theta = \\sin(\\theta + \\pi/2)$ — it is a horizontal shift of sine. $\\sin(\\theta^2)$ has a changing period and is not a simple multiplicative/additive transformation.",
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
                '**Problem 1:** For $f(\\theta) = \\sin \\theta$, describe the behavior on each interval: (a) $(0, \\pi/2)$, (b) $(\\pi/2, \\pi)$, (c) $(\\pi, 3\\pi/2)$, (d) $(3\\pi/2, 2\\pi)$.\n\n**Problem 2:** A sinusoidal function $p$ has a minimum at $(0, 2)$ and a maximum at $(\\pi, 8)$. Find the midline, amplitude, period, and frequency.\n\n**Problem 3:** A function is described as "decreasing at a decreasing rate." Is the function above or below the midline? Is it heading toward a maximum or minimum?',
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
                "**Exit Ticket:** A function has a maximum at $(\\pi, 14)$ and a minimum at $(3\\pi/2, 6)$. Find the midline and amplitude. Is this function sinusoidal?\n\n**Lesson Summary:** Sinusoidal functions are transformations of sine — they have smooth, wave-shaped graphs with a definite midline, amplitude, period, and frequency. Every sinusoidal function is periodic, but not every periodic function is sinusoidal. Describing behavior on sub-intervals requires combining direction (increasing/decreasing) with concavity (rate of change speeding up or slowing down).",
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
