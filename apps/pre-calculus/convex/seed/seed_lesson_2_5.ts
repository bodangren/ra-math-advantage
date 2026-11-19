import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_5Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_5 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_5Result> => {
    const now = Date.now();
    const lessonSlug = "2-5-exponential-modeling";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Exponential Function Context and Data Modeling",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.5: Exponential Function Context and Data Modeling",
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
          title: "Exponential Function Context and Data Modeling",
          description: "AP Precalculus Topic 2.5: Exponential Function Context and Data Modeling",
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
                "A bacteria culture starts with 17 bacteria and grows at 31% per hour. But what if the data does not look proportional at first glance — what if each output is always 3 more than a doubling pattern? How would you detect and correct for this hidden offset to reveal the exponential growth underneath?",
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
                "- **Initial value** ($a$): The output when $x = 0$ in $f(x) = a \\cdot b^x$.\n- **Growth factor** ($b$): The multiplier per unit of input. If $b > 1$, the function models growth. If $0 < b < 1$, it models decay.\n- **Vertical translation**: A constant added to or subtracted from all output values. If subtracting a constant from the data reveals proportional growth, the original function has the form $f(x) = a \\cdot b^x + c$.\n- **Natural base** ($e$): The constant $e \\approx 2.718$, often used as the base in exponential models of continuous real-world phenomena.\n- **Exponential regression** (ExpReg): A calculator procedure that fits $y = a \\cdot b^x$ to data points.",
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
                "Exponential models in real-world contexts are built from data. Three key skills are required:\n\n**1. Detecting hidden proportionality.** Sometimes data appears non-proportional because of a vertical translation. If subtracting (or adding) a constant reveals a constant ratio, the data is exponential with a vertical shift. For example, $f(x)$: 7, 13, 25, 49, 97 becomes proportional after subtracting 1: 6, 12, 24, 48, 96 (ratio = 2).\n\n**2. Constructing models from two data points.** Given $f(x_1) = y_1$ and $f(x_2) = y_2$ with $f(x) = a \\cdot b^x$:\n$$b^{(x_2 - x_1)} = \\frac{y_2}{y_1} \\implies b = \\left(\\frac{y_2}{y_1}\\right)^{1/(x_2 - x_1)}$$\nThen $a = y_1 / b^{x_1}$.\n\n**3. Converting between time units.** If an annual growth factor is $b$, the monthly growth factor is $b^{1/12}$. This is NOT dividing time by 12 — the base must be recalculated. For a 13% annual increase: $b = 1.13$, monthly base $k = 1.13^{1/12} \\approx 1.0102$.\n\nThe natural base $e$ arises in continuous growth models. For example, $B(t) = 17e^{0.31t}$ is equivalent to $B(t) = 17 \\cdot (e^{0.31})^t = 17 \\cdot (1.363)^t$.",
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
                "**Example 1:** Find the constant that reveals proportional growth.\n\n$x$: 0, 1, 2, 3, 4 \\quad $h(x)$: 63, 31, 15, 7, 3\n\n**Solution:**\nAdd 1 to each value: 64, 32, 16, 8, 4. Each value is half the previous — ratio = 1/2. So $h(x) = 64 \\cdot (1/2)^x - 1$.\n\n**Example 2:** A bacteria model is $B(t) = 17e^{0.31t}$. Rewrite in the form $A(t) = a \\cdot b^t$.\n\n**Solution:**\n$$A(t) = 17 \\cdot (e^{0.31})^t = 17 \\cdot (1.363)^t$$\nSo $a = 17$ and $b = e^{0.31} \\approx 1.363$.\n\n**Example 3:** A deer population starts at 50 and grows 13% per year. Find the monthly growth factor.\n\n**Solution:**\nAnnual: $D(t) = 50 \\cdot (1.13)^t$. Monthly: $D(m) = 50 \\cdot (1.13)^{m/12}$.\nNew base: $k = 1.13^{1/12} \\approx 1.0102$.",
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
                "**Problem 1:** Find the constant that reveals proportional growth: $x$: 0, 1, 2, 3, 4 \\quad $f(x)$: 7, 13, 25, 49, 97.\n\n**Hint:** Try subtracting small integers from each output until the ratios become constant.\n\n**Problem 2:** A stadium has 47 fans at $t = 2$ minutes and 2,602 fans at $t = 20$ minutes. Write two equations for $F(t) = a \\cdot b^t$ and solve for $b$.\n\n**Hint:** $47 = a \\cdot b^2$ and $2602 = a \\cdot b^{18}$. Divide to eliminate $a$.",
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
                "**Problem 1:** A video goes viral. Viewership is modeled by $y = 1391(1.07)^m$ where $m$ is minutes. Find the viewers after 2 hours and convert the model to seconds.\n\n**Problem 2:** A MINI Cooper costs $39,645 and depreciates 17% per year. Write $V(t) = a \\cdot b^t$, then convert to a monthly depreciation model.\n\n**Problem 3:** A bacteria culture has 200 bacteria at $t = 1$ and 1,600 at $t = 4$. Write two equations for $B(t) = a \\cdot b^t$ and solve for $a$ and $b$.",
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
                "**Exit Ticket:** A bacteria culture has 200 bacteria at $t = 1$ and 1,600 at $t = 4$. Write two equations for $B(t) = a \\cdot b^t$.\n\n**Lesson Summary:** Real-world exponential modeling requires three skills: detecting hidden vertical translations that mask proportionality, constructing models from two data points by solving a system of equations, and converting between time units by recalculating the base — not simply dividing. The natural base $e$ connects continuous and discrete exponential forms.",
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
