import { upsertLessonPhases } from "./lesson_phases";
import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson2_14Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson2_14 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson2_14Result> => {
    const now = Date.now();
    const lessonSlug = "2-14-logarithmic-modeling";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Logarithmic Function Context and Data Modeling",
          slug: lessonSlug,
          description: "AP Precalculus Topic 2.14: Logarithmic Function Context and Data Modeling",
          orderIndex: 14,
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
          title: "Logarithmic Function Context and Data Modeling",
          description: "AP Precalculus Topic 2.14: Logarithmic Function Context and Data Modeling",
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
                "A logarithmic model can increase while its rate of change decreases. For $L(x)=a+b\\ln x$ with $b>0$, equal additive increases in $x$ produce smaller output increases at larger inputs. Equal multiplicative changes produce equal output changes: $L(2x)-L(x)=b\\ln2$.\n\nCompare to exponential growth:\n- **Exponential**: slow start, then rapid acceleration (population growth, compound interest).\n- **Logarithmic**: rapid start, then gradual leveling off (salary vs. experience, sound vs. intensity).\n\nThe Richter scale for earthquakes, decibels for sound, and pH for acidity all use logarithmic models because the underlying data spans many orders of magnitude.\n\nA logarithmic model has the form $y = a + b \\ln(x)$ or $y = a + b \\log(x)$, where $a$ and $b$ are constants and $b \\ne 0$.",
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
                "- **Logarithmic model**: A function of the form $y = a + b \\ln(x)$ or $y = a + b \\log(x)$ that fits data with large initial rates of change that gradually decrease.\n- **Two-point model construction**: Given two data points, write two equations in $a$ and $b$, then solve the system.\n- **Regression (LnReg / LogReg)**: A calculator method for finding the best-fit logarithmic model from a dataset.\n- **Logarithmic scale**: A measurement scale where each equal interval represents a multiplicative change (e.g., Richter, decibels, pH).",
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
                "**Constructing a logarithmic model from two points:**\n\nGiven $L(x) = a + b \\ln(x)$ and two data points, create a system of two equations and solve for $a$ and $b$:\n1. Substitute each point into the model.\n2. Subtract one equation from the other to eliminate $a$.\n3. Solve for $b$, then back-substitute for $a$.\n\n**Using regression:** Enter data into two lists, then use LnReg (or LogReg) to find the best-fit model. The calculator returns $a$ and $b$ for $y = a + b \\ln(x)$.\n\n**Interpreting in context:**\n- $a$ is the predicted value when $x = 1$ (since $\\ln(1) = 0$).\n- $b$ controls the rate of growth. Positive $b$ means increasing; negative $b$ means decreasing.\n- Predictions use the model equation — substitute the $x$-value and compute.\n\n**Real-world logarithmic contexts:**\n- Sound: $\\beta(I) = a + b \\log(I)$ where $\\beta$ is decibels and $I$ is intensity.\n- Earthquakes: The Lillie Empirical Formula $M = a + b \\ln(d)$ relates magnitude $M$ to displacement $d$.\n- Salary vs. experience, learning curves, information theory.",
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
                "**Example 1:** $L(x) = a + b \\ln(x)$. Data: $x = 2 \\rightarrow L = 3$, $x = 5 \\rightarrow L = 7$.\n- Two equations: $3 = a + b \\ln(2)$ and $7 = a + b \\ln(5)$\n- Subtract: $4 = b(\\ln 5 - \\ln 2) = b \\ln(\\frac{5}{2})$\n- $b = \\frac{4}{\\ln(5/2)} \\approx \\frac{4}{0.916} \\approx 4.366$\n- $a = 3 - b \\ln(2) \\approx 3 - 4.366(0.693) \\approx -0.026$\n\n**Example 2:** Sound intensity. Traffic: $I = 5 \\times 10^{-5}$, $\\beta = 70$ dB. Concert: $I = 1$, $\\beta = 120$ dB. Model: $\\beta(I) = a + b \\log(I)$.\n- Since $\\log(1) = 0$: $120 = a + b(0) \\to a = 120$.\n- $70 = 120 + b \\log(5 \\times 10^{-5})$ → $b = \\frac{-50}{\\log(5 \\times 10^{-5})} = \\frac{-50}{\\log 5 - 5} \\approx \\frac{-50}{-4.301} \\approx 11.63$\n- Predict for $I = 10^4$: $\\beta = 120 + 11.63 \\times 4 = 166.5$ dB.\n\n**Example 3:** $f(x) = a + b \\ln(x)$. Data: $x = 1 \\rightarrow f = 2$, $x = 6 \\rightarrow f = 10$.\n- $2 = a + b \\ln(1) = a + 0 \\to a = 2$\n- $10 = 2 + b \\ln(6) \\to b = \\frac{8}{\\ln(6)} \\approx 4.463$",
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
                "**Problem 1:** $g(x) = a + b \\ln(x)$. Data: $x = 3 \\rightarrow g = 11$, $x = 10 \\rightarrow g = 14.5$. Find $a$ and $b$.\n\n**Hint:** Write two equations, subtract to eliminate $a$, solve for $b$ using $b = \\frac{14.5 - 11}{\\ln(10) - \\ln(3)}$.\n\n**Problem 2:** The Richter scale uses $M = a + b \\log(\\frac{A}{A_0})$. If an earthquake with displacement 21 microns registers magnitude 9.5, and one with 180 microns registers 7.0, set up the system to find $a$ and $b$.\n\n**Hint:** Write two equations using $M = a + b \\ln(d)$, then subtract to solve.\n\n**Problem 3:** A logarithmic model $S(p) = 25 + 18 \\ln(p)$ predicts salary in thousands from congregation size. Predict the salary for a church of 500 members.\n\n**Hint:** Substitute $p = 500$ and evaluate $S(500) = 25 + 18 \\ln(500)$.",
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
                "**Problem 1:** $f(x) = a + b \\ln(x)$. Data: $x = 1 \\rightarrow f = -2$, $x = 16 \\rightarrow f = 3$. Find $a$ and $b$.\n\n**Problem 2:** $h(x) = a + b \\log(x)$. Data: $x = 2 \\rightarrow h = 5$, $x = 20 \\rightarrow h = 12$. Find $a$ and $b$. Then predict $h(100)$.\n\n**Problem 3:** A learning model $L(t) = a + b \\ln(t)$ gives proficiency score from hours of practice. Given $L(5) = 40$ and $L(30) = 72$, find the model and predict $L(100)$.\n\n**Problem 4:** The Lillie Empirical Formula $M = a + b \\ln(d)$ uses displacement in microns. Given $M = 9.5$ when $d = 21$ and $M = 7.0$ when $d = 180$, find the model. Predict the magnitude for a displacement of 300,000,000 microns (the largest recorded earthquake).",
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
                "**Exit Ticket:** $f(x) = a + b \\ln(x)$. Given $f(1) = 2$ and $f(6) = 10$, write two equations and find $a$. How does logarithmic growth differ from exponential growth? Give one real-world example of each.\n\n**Lesson Summary:** Logarithmic models fit data that grows rapidly at first then levels off. The model $y = a + b \\ln(x)$ is constructed from two data points by writing a system of equations, or from a full dataset using regression. Real-world applications include sound intensity (decibels), earthquake magnitude (Richter scale), acidity (pH), and salary vs. experience. When interpreting predictions, always connect the numerical result back to the context.",
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
