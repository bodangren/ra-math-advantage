import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson3_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson3_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson3_4Result> => {
    const now = Date.now();
    const lessonSlug = "3-4-graphs-transformations";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 3,
          title: "Sine and Cosine Function Graphs",
          slug: lessonSlug,
          description: "AP Precalculus Topic 3.4: Sine and Cosine Function Graphs",
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
          title: "Sine and Cosine Function Graphs",
          description: "AP Precalculus Topic 3.4: Sine and Cosine Function Graphs",
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
          "markdown": "Plot $\\sin \\theta$ for $\\theta$ from $0$ to $2\\pi$ using the unit circle values you know: $\\sin 0 = 0$, $\\sin(\\pi/6) = 1/2$, $\\sin(\\pi/2) = 1$, $\\sin(\\pi) = 0$, $\\sin(3\\pi/2) = -1$, $\\sin(2\\pi) = 0$. Connect the dots smoothly.\n\nWhat shape emerges? How high and low does it go? How far along the $θ$-axis does one full pattern take? These questions define the key features of every sinusoidal graph."
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
          "markdown": "- **Midline**: The horizontal line halfway between the maximum and minimum values of a sinusoidal function. If the maximum is $M$ and the minimum is $m$, the midline is $y = (M + m)/2$.\n- **Amplitude**: The distance from the midline to the maximum (or minimum). Amplitude = $(M - m)/2$.\n- **Period**: The horizontal length of one full cycle.\n- **Frequency**: The reciprocal of the period — the number of cycles per unit of input. Frequency = $1/P$.\n- **Sinusoidal function**: A function that can be expressed as a transformation of $\\sin \\theta$ or $\\cos \\theta$."
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
          "markdown": "The graphs of $f(\\theta) = \\sin \\theta$ and $g(\\theta) = \\cos \\theta$ share the same basic properties:\n\n| Property | Value |\n|---|---|\n| Midline | $y = 0$ |\n| Amplitude | $1$ |\n| Period | $2\\pi$ |\n| Frequency | $1/(2\\pi)$ |\n\nThe sine graph starts at the origin, rises to $1$ at $\\pi/2$, crosses zero at $\\pi$, falls to $-1$ at $3\\pi/2$, and returns to $0$ at $2\\pi$. The cosine graph starts at $1$, crosses zero at $\\pi/2$, reaches $-1$ at $\\pi$, crosses zero again at $3\\pi/2$, and returns to $1$ at $2\\pi$.\n\nThe graph of $\\sin \\theta$ oscillates between **concave down** (above the midline) and **concave up** (below the midline). This concavity pattern is essential for describing interval behavior.\n\nThe cosine function is a horizontal shift of sine: $\\cos \\theta = \\sin(\\theta + \\pi/2)$."
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
          "markdown": "**Example 1:** A sinusoidal function $h(\\theta)$ has a maximum value of $8$ and a minimum value of $-2$. Find the midline, amplitude, period (if max occurs at $\\pi$ and next min at $3\\pi$), and frequency.\n\n**Solution:**\n- Midline: $y = (8 + (-2))/2 = 3$\n- Amplitude: $(8 - (-2))/2 = 5$\n- Period: $2(3\\pi - \\pi) = 4\\pi$\n- Frequency: $1/(4\\pi)$\n\n**Example 2:** Describe the behavior of $f(\\theta) = \\sin \\theta$ on the interval $(0, \\pi/2)$.\n\n**Solution:** On $(0, \\pi/2)$, $f$ is **increasing** and **concave down** (the graph is above the midline and bending toward the maximum).\n\n**Example 3:** Describe the behavior on $(\\pi/2, \\pi)$.\n\n**Solution:** On $(\\pi/2, \\pi)$, $f$ is **decreasing** and **concave down** (above the midline, curving away from the peak)."
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
          "markdown": "**Problem 1:** A sinusoidal graph has a maximum of $12$ at $\\theta = 0$ and the next minimum of $4$ at $\\theta = \\pi$. Find the midline, amplitude, period, and frequency.\n\n**Hint:** The midline is the average of max and min. The period is twice the horizontal distance from max to min.\n\n**Problem 2:** On the interval $(\\pi, 3\\pi/2)$, is $\\sin \\theta$ increasing or decreasing? Is it concave up or concave down?\n\n**Hint:** Sine is below the midline on $(\\pi, 2\\pi)$ and heading toward its minimum.\n\n**Problem 3:** A sinusoidal function $g$ has a minimum at $(\\pi/2, 0)$ and a maximum at $(\\pi, 1)$. Find the midline and amplitude.\n\n**Hint:** Midline = $(1 + 0)/2 = 0.5$. Amplitude = $(1 - 0)/2 = 0.5$."
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
          "markdown": "**Problem 1:** For each graph below, find the period, frequency, amplitude, and midline.\n- (a) Maximum $6$, minimum $-4$, one cycle from $0$ to $2\\pi$.\n- (b) Maximum $3$, minimum $1$, one cycle from $0$ to $\\pi$.\n\n**Problem 2:** A sinusoidal function $k(\\theta)$ has a minimum at $(\\pi, -10)$ and a maximum at $(4\\pi, 0)$. Find period, frequency, amplitude, and midline.\n\n**Problem 3:** Describe the behavior of $\\cos \\theta$ on $(0, \\pi/2)$ — is it increasing or decreasing? Concave up or concave down? Positive or negative?\n\n**Problem 4:** The function $f(\\theta) = \\cos \\theta$ has a maximum at $(0, 1)$ and a minimum at $(\\pi, -1)$. Verify that the period is $2\\pi$, the amplitude is $1$, and the midline is $y = 0$."
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
          "markdown": "**Exit Ticket:** A sinusoidal function has a maximum at $(2, 10)$ and the next minimum at $(6, 2)$. Find the amplitude and midline.\n\n**Lesson Summary:** The graphs of sine and cosine share the same fundamental shape — smooth, repeating waves. Four parameters define any sinusoidal graph: the midline (vertical center), amplitude (distance from midline to peak), period (horizontal length of one cycle), and frequency (cycles per unit). A sinusoidal graph is concave down above the midline and concave up below it, which determines how to describe behavior on sub-intervals."
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
