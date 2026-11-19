import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_2Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_2 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_2Result> => {
    const now = Date.now();
    const lessonSlug = "2-2-linear-exponential-change";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Change in Linear and Exponential Functions",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.2: Change in Linear and Exponential Functions",
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
          title: "Change in Linear and Exponential Functions",
          description: "AP Precalculus Topic 2.2: Change in Linear and Exponential Functions",
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
                "A biologist tracks a rumor spreading through a prairie dog colony. On day 3, 43 animals have heard it. By day 6, 140 know. Is this population growing by a constant number each day, or by a constant percentage? How would each type of growth change your prediction for day 10?",
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
                "- **Constant rate of change**: A fixed amount added per unit of input change. Characteristic of linear functions — if $x$ increases by 1, $y$ increases by the same amount every time.\n- **Constant proportional change**: A fixed multiplier applied per unit of input change. Characteristic of exponential functions — if $x$ increases by 1, $y$ is multiplied by the same factor every time.\n- **Linear model**: A function of the form $f(x) = mx + b$ where $m$ is the slope (constant rate of change).\n- **Exponential model**: A function of the form $f(x) = a \\cdot b^x$ where $b$ is the growth/decay factor.",
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
                'Linear and exponential functions are the continuous counterparts of arithmetic and geometric sequences. The parallel structure is:\n\n| Sequence type | Continuous counterpart | Formula | What is constant? |\n|---|---|---|---|\n| Arithmetic | Linear | $f(x) = b + mx$ | Difference ($y_2 - y_1 = m \\cdot \\Delta x$) |\n| Geometric | Exponential | $f(x) = a \\cdot b^x$ | Ratio ($y_2 / y_1 = b^{\\Delta x}$) |\n\nTo determine function type from a table: compute the differences between outputs over equal-length input intervals. If differences are constant, the data is linear. If not, compute ratios. If ratios are constant, the data is exponential. If neither is constant, the data fits neither model — and "neither" is always a valid answer.\n\nTo construct a model from two data points:\n- **Linear**: Use $m = (y_2 - y_1)/(x_2 - x_1)$ and write $f(x) = m(x - x_1) + y_1$.\n- **Exponential**: Use $b^{(x_2 - x_1)} = y_2 / y_1$ to solve for $b$, then write $f(x) = y_1 \\cdot b^{(x - x_1)}$.',
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
                "**Example 1:** A theater adds a constant number of seats per row. Row 5 has 31 seats; row 11 has 49 seats. How many seats in row 25?\n\n**Solution:**\nThis is an arithmetic sequence (linear model).\n$$d = \\frac{49 - 31}{11 - 5} = \\frac{18}{6} = 3 \\text{ seats per row}$$\n$$a_{25} = 31 + 3(25 - 5) = 31 + 60 = 91 \\text{ seats}$$\n\n**Example 2:** A rumor reaches 43 people on day 3 and 140 people on day 6. Model with a geometric sequence and predict day 10.\n\n**Solution:**\n$$r^3 = \\frac{140}{43} \\implies r = \\left(\\frac{140}{43}\\right)^{1/3} \\approx 1.482$$\n$$g_{10} = 43 \\cdot r^{(10-3)} = 43 \\cdot \\left(\\frac{140}{43}\\right)^{7/3} \\approx 676 \\text{ people}$$",
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
                '**Problem 1:** Determine if each data set is linear, exponential, or neither.\n\na) $x$: 0, 3, 6, 9, 12 \\quad $f(x)$: 7, 5, 3, 1, -1\n\nb) $x$: 1, 2, 3, 4, 5 \\quad $g(x)$: 0, 1, 4, 9, 16\n\nc) $x$: 0, 2, 4, 6, 8 \\quad $h(x)$: 1, 2, 4, 8, 16\n\n**Hint:** Compute differences first. If constant, it is linear. If not, compute ratios. If constant, it is exponential. If neither is constant, classify as "neither."\n\n**Problem 2:** A meme is viewed by 2,500 people at hour 3 and 20,000 at hour 6. Using a geometric model, how many people will have viewed it by hour 10?\n\n**Hint:** Find $r^3 = 20000/2500 = 8$, so $r = 2$. Then $g_{10} = 2500 \\cdot 2^7$.',
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
                "**Problem 1:** Classify as linear, exponential, or neither:\n\na) $x$: 0, 2, 4, 6, 8 \\quad $f(x)$: 1/2, 2, 8, 32, 128\n\nb) $x$: 1, 2, 3, 4, 5 \\quad $g(x)$: -1, 0, 2, 5, 9\n\nc) $x$: 10, 20, 30, 40, 50 \\quad $h(x)$: 100, 50, 25, 12.5, 6.25\n\n**Problem 2:** Airport flights are modeled by an arithmetic sequence. At 5 AM (hour 5), 11,750 passengers have been processed. At 11 AM, 22,250 have been processed. Predict passengers processed by 6 PM (hour 18).\n\n**Problem 3:** Bald eagle nesting pairs: 417 pairs in 1963 (year 0) and 71,400 pairs in 2019 (year 56). Using a geometric model, estimate nesting pairs in the year 2000.",
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
                "**Exit Ticket:** Given $x$: 10, 20, 30, 40, 50 and $h(x)$: 100, 50, 25, 12.5, 6.25 — is this linear, exponential, or neither? Justify with calculations.\n\n**Lesson Summary:** Linear functions have constant additive change; exponential functions have constant proportional change. From a table, compute differences to test for linearity or ratios to test for exponentiality. Given two data points, you can construct either model — the choice depends on which quantity stays constant in the data. Not all real-world data fits either model.",
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
