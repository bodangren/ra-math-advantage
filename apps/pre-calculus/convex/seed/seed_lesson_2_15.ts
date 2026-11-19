import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_15Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_15 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_15Result> => {
    const now = Date.now();
    const lessonSlug = "2-15-semi-log-plots";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Semi-log Plots",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.15: Semi-log Plots",
          orderIndex: 15,
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
          title: "Semi-log Plots",
          description: "AP Precalculus Topic 2.15: Semi-log Plots",
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
                'Exponential data can span many orders of magnitude — from 1 to 1000 to 1,000,000. On a standard linear plot, small values get crushed along the axis while large values dominate. What if we could "flatten" the exponential curve into a straight line?\n\nConsider this data:\n\n| x | 1 | 2 | 3 | 4 | 5 |\n|---|---|---|---|---|---|\n| f(x) | 40 | 60 | 90 | 135 | 203 |\n\nCheck the ratios: $60/40 = 1.5$, $90/60 = 1.5$, $135/90 = 1.5$, $203/135 \\approx 1.5$. The constant ratio confirms exponential behavior.\n\nNow imagine plotting this on a graph where the y-axis is **logarithmically scaled** — the marks read 10, 100, 1000 with equal spacing. On this "semi-log" plot, the exponential data would form a straight line. This is because $\\log(a \\cdot b^x) = \\log(a) + x \\cdot \\log(b)$, which is linear in $x$.',
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
                "- **Semi-log plot**: A graph where one axis (typically the y-axis) uses a logarithmic scale and the other uses a linear scale.\n- **Logarithmic scale**: A scale where equal distances represent multiplicative (not additive) steps. Marks at equal intervals might read 1, 10, 100, 1000.\n- **Linearity on semi-log**: Exponential data appears as a straight line on a semi-log plot. This is the diagnostic test for exponential behavior.\n- **Semi-log linear model**: On a semi-log plot, the linear model is $\\log_n(y) = \\log_n(a) + x \\cdot \\log_n(b)$, where slope = $\\log_n(b)$ and y-intercept = $\\log_n(a)$.\n- **Model conversion**: From the semi-log linear model, recover the exponential model $y = a \\cdot b^x$ by computing $b = n^{slope}$ and $a = n^{ytext{-intercept}}$.",
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
                "**Why exponential data becomes linear on semi-log:**\n\nGiven $y = a \\cdot b^x$, take $\\log_n$ of both sides:\n$$\\log_n(y) = \\log_n(a \\cdot b^x) = \\log_n(a) + x \\cdot \\log_n(b)$$\n\nThis is a linear equation in $x$ with slope $m = \\log_n(b)$ and intercept $c = \\log_n(a)$. So when we plot $x$ vs. $\\log_n(y)$, we get a straight line.\n\n**Key insight:** Logarithmically scaling the y-axis does NOT change the data values — only how they are displayed. Equally-spaced marks on a log-scaled axis represent **multiplicative** (not additive) steps.\n\n**Reading a semi-log plot:**\n- If the points fall on a straight line, the data is exponential.\n- The steeper the line, the larger the growth rate.\n- A downward-sloping line indicates exponential decay.\n\n**Building the exponential model from a semi-log plot:**\n1. Find the line of best fit on the semi-log plot: $\\log(y) = c + mx$.\n2. Convert: $a = 10^c$ and $b = 10^m$.\n3. Write the exponential model: $y = a \\cdot b^x$.",
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
                "**Example 1:** Table: x: 1, 2, 3, 4, 5 → f(x): 40, 60, 90, 135, 203. Confirm exponential and write the model.\n\nConstant ratio: $60/40 = 1.5$, $90/60 = 1.5$, $135/90 = 1.5$. Confirmed exponential with $b = 1.5$.\n\nSemi-log linear model using points (1, 40) and (5, 203):\n- Slope = $\\frac{\\log(203) - \\log(40)}{5 - 1} = \\frac{\\log(203/40)}{4} = \\frac{\\log(5.075)}{4} \\approx \\frac{0.705}{4} \\approx 0.176$\n- y-intercept = $\\log(40) - 0.176(1) = 1.602 - 0.176 = 1.426$\n- Convert: $b = 10^{0.176} \\approx 1.5$, $a = 10^{1.426} \\approx 26.7$\n- Exponential model: $y \\approx 26.7 \\cdot 1.5^x$\n\n**Example 2:** Which function would appear linear on a semi-log plot?\n- (A) $P(t) = 2 + 2t$ — No (linear function curves on semi-log)\n- (B) $P(t) = 2 + 2^t$ — Approximately (exponential with vertical shift)\n- (C) $P(t) = 2 + 2 \\log(t)$ — No (log function curves on semi-log)\n- (D) $P(t) = 2 \\cdot 2^t$ — Yes (pure exponential, perfectly linear on semi-log)\n\n**Example 3:** Table: x: 10, 20, 30, 40, 50 → g(x): 30, 90, 270, 810, 2430.\n\nRatios: $90/30 = 3$, $270/90 = 3$, $810/270 = 3$. Constant ratio $b = 3$ — exponential — linear on semi-log.",
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
                "**Problem 1:** Plot the points A(0, 200), B(1, 25), C(2, 7), D(3.2, 800), E(4.6, 1.5) on semi-log axes.\n\n**Hint:** On the log-scaled y-axis, position each point at its $\\log(y)$-value. For instance, 200 is between 100 and 1000, closer to 100.\n\n**Problem 2:** Table: x: 0, 1, 2, 3, 4 → f(x): 5, 15, 45, 135, 405. Is this exponential? Would it appear linear on a semi-log plot?\n\n**Hint:** Check for a constant ratio between consecutive output values.\n\n**Problem 3:** A semi-log plot shows data points forming a line through (1, 10) and (4, 800). Write the linear model $\\log(y) = c + mx$, then convert to $y = a \\cdot b^x$.\n\n**Hint:** Slope = $\\frac{\\log(800) - \\log(10)}{4 - 1} = \\frac{\\log(80)}{3}$. Then $b = 10^m$ and $a = 10^c$.",
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
                "**Problem 1:** Which dataset would appear linear on a semi-log plot?\n- a) x: 1, 2, 3, 4 → y: 3, 6, 12, 24\n- b) x: 1, 2, 3, 4 → y: 2, 5, 10, 17\n- c) x: 1, 2, 3, 4 → y: 100, 50, 25, 12.5\n\n**Problem 2:** A semi-log plot of data forms a line through (0, 5) and (3, 40). Write the linear model, then find the exponential model $y = a \\cdot b^x$.\n\n**Problem 3:** Table: x: 1, 3, 5, 7, 9 → f(x): 2, 18, 162, 1458, 13122.\n- a) Confirm this is exponential by checking ratios.\n- b) Write the semi-log linear model.\n- c) Convert to $y = a \\cdot b^x$.\n\n**Problem 4:** Explain why equally-spaced marks on a logarithmic y-axis represent multiplicative steps. If the marks read 1, 10, 100, 1000, what is the multiplicative factor between consecutive marks?",
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
                "**Exit Ticket:** The table x: 10, 20, 30, 40, 50 → g(x): 30, 90, 270, 810, 2430 shows a constant ratio of 3. Would this data appear linear on a semi-log plot? Why? Write the exponential model.\n\n**Lesson Summary:** A semi-log plot uses a logarithmically scaled y-axis. Exponential data $y = a \\cdot b^x$ appears as a straight line on semi-log because $\\log(y) = \\log(a) + x \\cdot \\log(b)$ is linear. Equally-spaced marks on the log axis represent multiplicative (not additive) steps. To build an exponential model from semi-log data: find the linear model $\\log(y) = c + mx$, then convert using $a = 10^c$ and $b = 10^m$. Semi-log plots are a powerful diagnostic tool for identifying exponential behavior in real-world data.",
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
