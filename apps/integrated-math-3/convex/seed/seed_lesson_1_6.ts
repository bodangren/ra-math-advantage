import { convexToJson } from "convex/values";
import {
  IM3_QF_DRAFT_MAPPINGS,
  IM3_QF_NODE,
  IM3_QF_VARIANT_SCHEDULES,
  quadraticFormulaPublicProps,
  quadraticFormulaVariantKey,
} from "../../lib/activities/server-grading";
import { internalMutation } from "../_generated/server";
import type { MutationCtx } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";
import { lesson16QuizPrivateProps } from "../lib/lesson_1_6_quiz";

interface SeedLesson6Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export function buildIm3QuadraticFormulaDraftDocuments(
  mode: keyof typeof IM3_QF_DRAFT_MAPPINGS,
  activityId: Id<"activities">,
  now: number,
) {
  const mapping = IM3_QF_DRAFT_MAPPINGS[mode];
  const props = quadraticFormulaPublicProps(mode, mapping.seed);
  const variantKey = mapping.stableActivityId;
  return {
    activity: {
      componentKey: "quadratic-formula",
      displayName:
        mode === "guided_practice"
          ? "Guided quadratic-formula practice"
          : "Independent quadratic-formula practice",
      description: "Solve a generated quadratic equation by using the Quadratic Formula.",
      props,
      gradingConfig: {
        autoGrade: true,
        partialCredit: true,
        passingScore: 3,
        partIds: ["discriminant", "x1", "x2"],
      },
      stableActivityId: mapping.stableActivityId,
      masteryNodeId: IM3_QF_NODE,
      approval: { status: "unreviewed" as const },
      srsEligible: false,
      createdAt: now,
      updatedAt: now,
    },
    variant: {
      variantKey,
      componentKey: "quadratic-formula",
      displayName:
        mode === "guided_practice"
          ? "Guided quadratic-formula practice"
          : "Independent quadratic-formula practice",
      description: "A draft generated quadratic-formula variant.",
      objectiveIds: [IM3_QF_NODE],
      difficulty: "standard",
      metadata: {
        generatorKey: "quadratic-formula",
        seed: mapping.seed,
        stableActivityId: mapping.stableActivityId,
        mode,
      },
    },
    item: {
      practiceItemId: `${variantKey}:seed-${mapping.seed}`,
      activityId,
      variantKey,
      variantLabel: `Seed ${mapping.seed}`,
    },
  };
}

function qfActivityContent(value: Record<string, unknown>) {
  return convexToJson({
    componentKey: value.componentKey,
    displayName: value.displayName,
    description: value.description,
    props: value.props,
    gradingConfig: value.gradingConfig,
    stableActivityId: value.stableActivityId,
    masteryNodeId: value.masteryNodeId,
    approval: value.approval,
    srsEligible: value.srsEligible,
  } as never);
}

export async function upsertIm3QuadraticFormulaDrafts(
  ctx: MutationCtx,
  now: number,
): Promise<void> {
  const drafts = [];
  for (const mode of ["guided_practice", "independent_practice"] as const) {
    const mapping = IM3_QF_DRAFT_MAPPINGS[mode];
    const existing = await ctx.db
      .query("activities")
      .withIndex("by_stable_activity_id", (q) => q.eq("stableActivityId", mapping.stableActivityId))
      .unique();
    if (
      existing &&
      (existing.approval?.status !== "unreviewed" ||
        existing.stableActivityId !== mapping.stableActivityId ||
        existing.masteryNodeId !== IM3_QF_NODE ||
        existing.componentKey !== "quadratic-formula" ||
        existing.srsEligible !== false ||
        (existing.props as { presentationMode?: unknown }).presentationMode !==
          mapping.presentationMode)
    ) {
      throw new Error("Existing quadratic-formula activity is not the exact unreviewed draft");
    }
    const provisional = buildIm3QuadraticFormulaDraftDocuments(
      mode,
      (existing?._id ?? "activities:pending") as Id<"activities">,
      now,
    );
    const expectedContent = JSON.stringify(qfActivityContent(provisional.activity));
    const legacyEquation = provisional.activity.props.equation.replace(/ = 0$/, "");
    const legacyContent = JSON.stringify(
      qfActivityContent({
        ...provisional.activity,
        props: { ...provisional.activity.props, equation: legacyEquation },
      }),
    );
    const existingContent = existing ? JSON.stringify(qfActivityContent(existing)) : undefined;
    if (existing && existingContent !== expectedContent && existingContent !== legacyContent)
      throw new Error("Existing quadratic-formula activity content changed");
    drafts.push({
      mode,
      existing,
      provisional,
      reconcileLegacy: existingContent === legacyContent,
    });
  }
  for (const { mode, existing, provisional, reconcileLegacy } of drafts) {
    if (existing && reconcileLegacy)
      await ctx.db.patch(existing._id, { props: provisional.activity.props, updatedAt: now });
    const activityId = existing?._id ?? (await ctx.db.insert("activities", provisional.activity));
    const docs = buildIm3QuadraticFormulaDraftDocuments(mode, activityId, now);
    const activityItems = await ctx.db
      .query("practice_items")
      .withIndex("by_activityId", (q) => q.eq("activityId", activityId))
      .take(5);
    if (
      activityItems.some(
        (item) =>
          !Array.from({ length: 4 }, (_, index) =>
            quadraticFormulaVariantKey(mode, index),
          ).includes(item.variantKey),
      )
    )
      throw new Error("Existing quadratic-formula storage relation is inconsistent");
    for (let index = 0; index < IM3_QF_VARIANT_SCHEDULES[mode].length; index++) {
      const seed = IM3_QF_VARIANT_SCHEDULES[mode][index];
      const variantKey = quadraticFormulaVariantKey(mode, index);
      const expectedVariant = {
        ...docs.variant,
        variantKey,
        metadata: { ...docs.variant.metadata, seed },
      };
      const expectedItem = {
        ...docs.item,
        variantKey,
        practiceItemId: `${variantKey}:seed-${seed}`,
        variantLabel: `Seed ${seed}`,
      };
      const variants = await ctx.db
        .query("practice_variants")
        .withIndex("by_variantKey", (q) => q.eq("variantKey", variantKey))
        .take(2);
      const items = activityItems.filter((item) => item.variantKey === variantKey);
      const reverseItems = await ctx.db
        .query("practice_items")
        .withIndex("by_variantKey", (q) => q.eq("variantKey", variantKey))
        .take(2);
      if (variants[0] || items[0]) {
        const coherent =
          variants.length === 1 &&
          items.length === 1 &&
          reverseItems.length === 1 &&
          reverseItems[0]._id === items[0]._id &&
          variants[0].componentKey === expectedVariant.componentKey &&
          JSON.stringify(variants[0].objectiveIds) ===
            JSON.stringify(expectedVariant.objectiveIds) &&
          JSON.stringify(convexToJson(variants[0].metadata as never)) ===
            JSON.stringify(convexToJson(expectedVariant.metadata as never)) &&
          items[0].practiceItemId === expectedItem.practiceItemId;
        if (!coherent)
          throw new Error("Existing quadratic-formula storage relation is inconsistent");
      } else if (index === 0) {
        await ctx.db.insert("practice_variants", expectedVariant);
        await ctx.db.insert("practice_items", expectedItem);
      }
    }
  }
}

/**
 * Convex internalMutation wrapper: seed lesson6.
 * @returns {Promise<unknown>} The wrapper result.
 */
export const seedLesson6 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson6Result> => {
    const now = Date.now();
    const lessonSlug = "module-1-lesson-6";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 1,
          title: "Using the Quadratic Formula and the Discriminant",
          slug: lessonSlug,
          description:
            "Use the Quadratic Formula to solve equations and the discriminant to determine the number and type of solutions.",
          orderIndex: 6,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lessonId))
      .first();

    const lessonVersionId: Id<"lesson_versions"> = existingLessonVersion
      ? existingLessonVersion._id
      : await ctx.db.insert("lesson_versions", {
          lessonId,
          version: 1,
          title: "Using the Quadratic Formula and the Discriminant",
          description:
            "Use the Quadratic Formula to solve equations and the discriminant to determine the number and type of solutions.",
          status: "published",
          createdAt: now,
        });

    const phaseData = [
      {
        phaseNumber: 1,
        title: "Explore",
        phaseType: "explore" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Explore: The Discriminant\n\n**Inquiry Question**: How can you predict the number and type of solutions of a quadratic equation without solving it?\n\nConsider these three equations:\n- $x^2 + 5x + 6 = 0$\n- $x^2 - 4x - 1 = 0$\n- $x^2 + 2x + 5 = 0$\n\nCan you determine how many solutions each has just by looking?",
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Vocabulary",
        phaseType: "vocabulary" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Key Terms\n\n- **Quadratic Formula**: The solutions to $ax^2 + bx + c = 0$ are given by:\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n- **Discriminant**: The expression $b^2 - 4ac$ under the square root\n- **Standard form**: $ax^2 + bx + c = 0$ where $a \\neq 0$\n\n**Remember**: The discriminant tells you how many real roots you'll get before you solve!",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## The Quadratic Formula\n\nFor a quadratic equation in standard form:\n\n$$ax^2 + bx + c = 0, \\quad a \\neq 0$$\n\nThe solutions are given by:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\n### When to Use the Quadratic Formula\n\n- When factoring is difficult or impossible\n- When the coefficients are large\n- When you need exact (not approximate) solutions",
            },
          },
        ],
      },
      // math.im3.example.1.6.036 — curriculum/IM3-reveal-module-1.pdf, page 43.
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: `## Example 1 Real Roots, $c$ Is Positive

**CONTEST** At the World Championship Punkin Chunkin contest in Bridgeville, Delaware, pumpkins are launched hundreds of yards. The path of a pumpkin can be modeled by $h = -4.9t^2 + 11.7t + 42$, where $h$ is the height and $t$ is the number of seconds after launch.

### Part A

Use the Quadratic Formula to solve $0 = -4.9t^2 + 11.7t + 42$.

Identify the coefficients: $a = -4.9$, $b = 11.7$, and $c = 42$.

$$t = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

$$t = \\frac{-11.7 \\pm \\sqrt{(11.7)^2 - 4(-4.9)(42)}}{2(-4.9)}$$

$$t = \\frac{-11.7 \\pm \\sqrt{136.89 + 823.2}}{-9.8}$$

$$t = \\frac{-11.7 \\pm \\sqrt{960.09}}{-9.8}$$

$$t = \\frac{11.7 + \\sqrt{960.09}}{9.8} \\text{ or } t = \\frac{11.7 - \\sqrt{960.09}}{9.8}$$

The approximate solutions are $4.4$ seconds and $-2.0$ seconds.

### Part B

Interpret the roots.

The negative root does not make sense in this context because the pumpkin launches at 0 seconds. The pumpkin lands after 4.4 seconds.`,
            },
          },
        ],
      },
      // math.im3.example.1.6.037 — curriculum/IM3-reveal-module-1.pdf, page 44.
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: `## Example 2 Real Roots, $c$ Is Negative

Solve $x^2 + 4x - 17 = 0$ by using the Quadratic Formula.

Identify the coefficients: $a = 1$, $b = 4$, and $c = -17$.

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

$$x = \\frac{-4 \\pm \\sqrt{(4)^2 - 4(1)(-17)}}{2(1)}$$

$$x = \\frac{-4 \\pm \\sqrt{84}}{2}$$

$$x = \\frac{-4 \\pm \\sqrt{4} \\cdot \\sqrt{21}}{2}$$

$$x = \\frac{-4 \\pm 2\\sqrt{21}}{2}$$

$$x = -2 \\pm \\sqrt{21}$$`,
            },
          },
        ],
      },
      // math.im3.example.1.6.038 — curriculum/IM3-reveal-module-1.pdf, page 44.
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: `## Example 3 Complex Roots

Solve $5x^2 + 8x + 11 = 0$ by using the Quadratic Formula.

Identify the coefficients: $a = 5$, $b = 8$, and $c = 11$.

$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$

$$x = \\frac{-8 \\pm \\sqrt{8^2 - 4(5)(11)}}{2(5)}$$

$$x = \\frac{-8 \\pm \\sqrt{-156}}{10}$$

$$x = \\frac{-8 \\pm \\sqrt{-1} \\cdot \\sqrt{4} \\cdot \\sqrt{39}}{10}$$

$$x = \\frac{-8 \\pm 2i\\sqrt{39}}{10}$$

$$x = \\frac{-4 \\pm i\\sqrt{39}}{5}$$`,
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## The Discriminant\n\nThe expression under the square root is called the **discriminant**:\n\n$$D = b^2 - 4ac$$\n\n### Key Concept: Interpreting the Discriminant\n\n| Value of D | Number and Type of Solutions |\n|------------|------------------------------|\n| $D > 0$ | Two distinct real solutions |\n| $D = 0$ | One repeated real solution |\n| $D < 0$ | Two complex solutions |\n\n**Tip**: Use the discriminant to check your work — if you expect real roots but get $D < 0$, check your arithmetic!",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            // math.im3.example.1.6.039; IM3-reveal-module-1.pdf, page 46.
            content: {
              markdown: `## Example 4 The Discriminant, Real Roots

Examine $2x^2 - 10x + 7 = 0$.

**Part A** Find the value of the discriminant for $2x^2 - 10x + 7 = 0$.

$a = 2, b = -10, c = 7$

$$b^2 - 4ac = (-10)^2 - 4(2)(7)$$
$$= 100 - 56$$
$$= 44$$

**Part B** Describe the number and type of roots for the equation.

The discriminant is nonzero, so there are two roots. The discriminant is positive and not a perfect square, so the roots are irrational.`,
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            // math.im3.example.1.6.040; IM3-reveal-module-1.pdf, page 46.
            content: {
              markdown: `## Example 5 The Discriminant, Complex Roots

Examine $-5x^2 + 10x - 15 = 0$.

**Part A** Find the value of the discriminant for $-5x^2 + 10x - 15 = 0$.

$a = -5, b = 10, c = -15$

$$b^2 - 4ac = (10)^2 - 4(-5)(-15)$$
$$= 100 - 300$$
$$= -200$$

**Part B** Describe the number and type of roots for the equation.

The discriminant is nonzero, so there are two roots. The discriminant is negative, so the roots are complex.`,
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. Why is the discriminant useful before solving?\n2. When is the quadratic formula more efficient than factoring?\n3. How does the discriminant connect to completing the square?\n4. Can you have exactly one imaginary solution? Why or why not?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: lesson16QuizPrivateProps(),
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned the Quadratic Formula and how to use the discriminant.\n\n- When would you use the quadratic formula instead of factoring?\n- How does the discriminant help you predict solution types?\n- What patterns in the discriminant correspond to special cases?\n\n**Preview**: Next, you'll learn to solve quadratic inequalities — equations with $>$, $<$, $\\geq$, or $\\leq$ signs!",
            },
          },
        ],
      },
    ];

    let phasesCreated = 0;
    let activitiesCreated = 0;

    for (const phase of phaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber),
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      phasesCreated++;

      for (const section of phase.sections) {
        if (section.sectionType === "activity") {
          const activityContent = section.content as SeedActivityContent;

          const insertedActivityId = await ctx.db.insert("activities", {
            componentKey: activityContent.componentKey,
            displayName: `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: activityContent.props as never,
            gradingConfig: { autoGrade: true, partialCredit: true },
            createdAt: now,
            updatedAt: now,
          });

          activitiesCreated++;

          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: {
              activityId: insertedActivityId,
              componentKey: activityContent.componentKey,
            },
            createdAt: now,
          });
        } else {
          await ctx.db.insert("phase_sections", {
            phaseVersionId: phaseId,
            sequenceOrder: section.sequenceOrder,
            sectionType: section.sectionType,
            content: section.content,
            createdAt: now,
          });
        }
      }
    }

    await upsertIm3QuadraticFormulaDrafts(ctx, now);

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});
