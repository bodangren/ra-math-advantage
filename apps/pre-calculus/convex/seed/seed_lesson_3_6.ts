import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_6Result> => {
    const now = Date.now();
    const lessonSlug = "3-6-sinusoidal-applications";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sinusoidal Function Transformations",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.6: Sinusoidal Function Transformations",
          orderIndex: 6,
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
          title: "Sinusoidal Function Transformations",
          description: "AP Precalculus Topic 3.6: Sinusoidal Function Transformations",
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
                "Start with $f(\\theta) = \\sin \\theta$. What happens when you change the equation to $g(\\theta) = 3\\sin(2\\theta) + 1$? The graph still looks like a wave, but it is taller, narrower, and shifted upward. How do the numbers $3$, $2$, and $1$ control the shape?\n\nEvery sinusoidal function can be written in the form $h(t) = a\\sin(bt + c) + d$. Each constant — $a$, $b$, $c$, $d$ — performs a specific transformation on the parent sine function.",
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
                "- **Vertical dilation**: Stretching or compressing the graph vertically by a factor of $|a|$. Controls the amplitude.\n- **Horizontal dilation**: Stretching or compressing the graph horizontally by a factor of $1/b$. Controls the period.\n- **Phase shift**: A horizontal translation of the graph. For $h(t) = a\\sin(bt + c) + d$, the phase shift is $-c/b$ units.\n- **Vertical translation**: Shifting the graph up or down by $d$ units. Controls the midline.\n- **General sinusoidal form**: $h(t) = a\\sin(bt + c) + d$ (or equivalently with cosine).",
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
                "The general sinusoidal form $h(t) = a\\sin(bt + c) + d$ encodes four transformations:\n\n| Parameter | Transformation | Controls |\n|---|---|---|\n| $a$ | Vertical dilation by $|a|$ | Amplitude = $|a|$ |\n| $b$ | Horizontal dilation by $1/b$ | Period = $2\\pi/|b|$ |\n| $c$ | Horizontal translation (phase shift) | Phase shift = $-c/b$ |\n| $d$ | Vertical translation | Midline = $d$ |\n\nTo determine $a$, $b$, $c$, $d$ from a graph or context:\n1. **Amplitude** $a = (max - min)/2$\n2. **Midline** $d = (max + min)/2$\n3. **Period** $P = 2 \\times$ (horizontal distance from max to min), then $b = 2\\pi/P$\n4. **Phase shift** $c$: If the graph reaches a maximum at $t = t_0$, then $\\sin(bt_0 + c) = 1$, so $bt_0 + c = \\pi/2$.\n\nWhen choosing between sine and cosine: use cosine if the graph starts at a maximum or minimum at $t = 0$; use sine if it starts on the midline.",
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
                "**Example 1:** A sinusoidal function $h$ has a maximum at $(\\pi, 6)$ and the next minimum at $(3\\pi/2, -4)$. Find $h(t) = a\\sin(bt + c) + d$.\n\n**Solution:**\n- $a = (6 - (-4))/2 = 5$, $d = (6 + (-4))/2 = 1$\n- Period = $2(3\\pi/2 - \\pi) = \\pi$, so $b = 2\\pi/\\pi = 2$\n- Maximum at $t = \\pi$: $\\sin(2\\pi + c) = 1$ → $c = \\pi/2 - 2\\pi = -3\\pi/2$\n- $h(t) = 5\\sin(2t - 3\\pi/2) + 1$\n\n**Example 2:** Five labeled points: $F(2, 16)$, $G(5, 11)$, $J(8, 6)$, $K(11, 11)$, $P(14, 16)$. Find $h(t) = a\\sin(bt + c) + d$.\n\n**Solution:**\n- $a = (16 - 6)/2 = 5$, $d = (16 + 6)/2 = 11$\n- F and P are consecutive maxima. The period is $14-2=12$, so $b=2\\pi/12=\\pi/6$.\n- F is a maximum at $t=2$. A cosine model is $h(t)=5\\cos(\\pi(t-2)/6)+11$.\n- In the requested sine form, $h(t)=5\\sin(\\pi t/6+\\pi/6)+11$.\n- The model gives $16,11,6,11,16$ at the five stated times.\n\n**Example 3:** Which graph matches $f(\\theta) = 3\\sin(2\\theta) - 1$?\n\n**Solution:** Amplitude $3$, period $\\pi$, midline $y = -1$. The graph oscillates between $2$ and $-4$ with one cycle every $\\pi$ units.",
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
                "**Problem 1:** Given $k(x) = 5\\cos(2x) + 1$, find the amplitude, period, and midline. Verify by checking the maximum and minimum values.\n\n**Hint:** Amplitude = $5$, period = $\\pi$, midline = $y = 1$. Max = $5 + 1 = 6$, min = $-5 + 1 = -4$.\n\n**Problem 2:** Five points: $F(0, 10)$, $G(3, 5)$, $J(6, 0)$, $K(9, 5)$, $P(12, 10)$. Find $h(t) = a\\sin(bt + c) + d$.\n\n**Hint:** $a = 5$, $d = 5$, period = $12$, $b = \\pi/6$. Start at max — consider using cosine, or find $c$ for sine.\n\n**Problem 3:** A sinusoidal function has a minimum at $t = 0$ with value $2$ and a maximum at $t = \\pi$ with value $10$. Write the equation using cosine.\n\n**Hint:** Since it starts at a minimum, use $-a\\cos(bt) + d$. $a = 4$, $d = 6$, period = $2\\pi$.",
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
                "**Problem 1:** For each set of five points, find $h(t) = a\\sin(bt + c) + d$:\n- (a) $F(0, 12), G(5, 9), J(10, 6), K(15, 9), P(20, 12)$\n- (b) $F(\\pi/2, 6), G(3\\pi/4, 1), J(\\pi, -4), K(5\\pi/4, 1), P(3\\pi/2, 6)$\n\n**Problem 2:** Write the equation for a sinusoidal function with amplitude $4$, period $6\\pi$, midline $y = -3$, that starts at a maximum at $t = 0$.\n\n**Problem 3:** San Diego daylight hours can be modeled by $D(t) = 2.715\\cos(0.017(t - c)) + 12.250$. What do the numbers $2.715$, $0.017$, and $12.250$ represent in context?",
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
                "**Exit Ticket:** Five points: $F(0, 10)$, $G(3, 5)$, $J(6, 0)$, $K(9, 5)$, $P(12, 10)$. Find $h(t) = a\\sin(bt + c) + d$.\n\n**Lesson Summary:** The general sinusoidal form $h(t) = a\\sin(bt + c) + d$ captures every possible transformation of the sine function. The amplitude is $|a|$, the period is $2\\pi/|b|$, the midline is $y = d$, and the phase shift is $-c/b$. To determine these from five labeled points, extract $a$ and $d$ from the max/min, $b$ from the period, and $c$ from the location of the first maximum or minimum.",
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
