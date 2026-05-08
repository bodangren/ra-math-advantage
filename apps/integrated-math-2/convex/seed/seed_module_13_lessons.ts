import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule13LessonsResult {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
    activitiesCreated: number;
    slug: string;
  }>;
}

export const seedModule13Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule13LessonsResult> => {
    const now = Date.now();
    const result = [];

    // ========================
    // LESSON 13-1: Trigonometric Identities
    // ========================
    const lesson1Slug = "module-13-lesson-1";

    const existingLesson1 = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lesson1Slug))
      .unique();

    const lesson1Id: Id<"lessons"> = existingLesson1
      ? existingLesson1._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Trigonometric Identities",
          slug: lesson1Slug,
          description: "Students apply reciprocal, quotient, and Pythagorean identities to find trigonometric values, simplify expressions, and verify identities.",
          orderIndex: 1,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion1 = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson1Id))
      .first();

    const lessonVersion1Id: Id<"lesson_versions"> = existingLessonVersion1
      ? existingLessonVersion1._id
      : await ctx.db.insert("lesson_versions", {
          lessonId: lesson1Id,
          version: 1,
          title: "Trigonometric Identities",
          description: "Students apply reciprocal, quotient, and Pythagorean identities to find trigonometric values, simplify expressions, and verify identities.",
          status: "published",
          createdAt: now,
        });

    const lesson1PhaseData = [
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
              markdown: "## Today's Goals\n\n- Apply reciprocal and quotient identities to find trigonometric values\n- Simplify trigonometric expressions using fundamental identities\n- Verify identities by transforming one side to match the other\n- Evaluate trig expressions using identities given partial information\n- Simplify real-world expressions involving trigonometric identities\n\n## Explore: Identities and the Unit Circle\n\nTrigonometric identities are equations that hold true for all values of the variable. Just as simplifying algebraic expressions makes computation easier, simplifying trigonometric expressions reveals underlying relationships between functions.\n\n**Inquiry Question:**\nHow can you determine which reciprocal or quotient identity to apply when simplifying a given expression?",
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
              markdown: "## Key Terms\n\n- **Reciprocal identity** — relates a trig function to the reciprocal of another: csc θ = 1/sin θ, sec θ = 1/cos θ, cot θ = 1/tan θ\n- **Quotient identity** — expresses tangent and cotangent as ratios of sine and cosine: tan θ = sin θ / cos θ, cot θ = cos θ / sin θ\n- **Pythagorean identity** — an identity derived from the Pythagorean theorem: sin²θ + cos²θ = 1\n- **Identity** — an equation that is true for all values of the variable in its domain",
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
              markdown: "## Fundamental Identities\n\n### Key Concept: Reciprocal Identities\n\ncsc θ = 1/sin θ\nsec θ = 1/cos θ\ncot θ = 1/tan θ\n\n### Key Concept: Quotient Identities\n\ntan θ = sin θ / cos θ\ncot θ = cos θ / sin θ\n\n### Key Concept: Simplification Strategy\n\n1. Replace tan, cot, sec, csc with their sin/cos definitions\n2. Simplify the resulting fraction\n3. Look for expressions that equal 1 (e.g., sin θ / sin θ = 1)",
            },
          },
        ],
      },
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
              markdown: "## Example 1 — Find Exact Values Given One Trigonometric Ratio\n\nGiven one trig ratio, find the exact values of other trig functions using identities and the Pythagorean theorem.\n\n### Problem: If sin θ = 3/5 and 0° < θ < 90° (Q1), find cos θ and tan θ.\n\n### Step 1: Identify Known Information\n\nIf sin θ = 3/5 and 0° < θ < 90° (Q1), find cos θ.\n\n### Step 2: Apply the Pythagorean Identity\n\nsin²θ + cos²θ = 1\n\n(3/5)² + cos²θ = 1\n\n9/25 + cos²θ = 1\n\n### Step 3: Solve for cos θ\n\ncos²θ = 1 - 9/25 = 16/25\n\nSince Q1, cos θ = 4/5\n\n### Step 4: Find tan θ Using Quotient Identity\n\ntan θ = sin θ / cos θ = (3/5) / (4/5) = 3/4",
            },
          },
        ],
      },
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
              markdown: "## Example 2 — Find Values in Different Quadrants\n\nUse quadrant information to determine the correct sign for trigonometric values.\n\n### Problem: If sin θ = -1/2 and 180° < θ < 270° (Q3), find cos θ.\n\n### Step 1: Apply Pythagorean Identity\n\nsin²θ + cos²θ = 1\n\n(-1/2)² + cos²θ = 1\n\n1/4 + cos²θ = 1\n\n### Step 2: Solve for cos²θ\n\ncos²θ = 3/4\n\n### Step 3: Determine the Sign\n\nIn Q3, cosine is negative. So cos θ = -√3/2.",
            },
          },
        ],
      },
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
              markdown: "## Example 3 — Simplify Trigonometric Expressions\n\nUse reciprocal and quotient identities to simplify expressions.\n\n### Problem: Simplify sec θ · tan²θ + sec θ\n\n### Step 1: Factor Out Common Term\n\nsec θ · tan²θ + sec θ = sec θ (tan²θ + 1)\n\n### Step 2: Apply Pythagorean Identity\n\nRecall: 1 + tan²θ = sec²θ\n\nsec θ (tan²θ + 1) = sec θ · sec²θ = sec³θ",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4 — Simplify Cofunction Expressions\n\nSimplify expressions involving complementary angle relationships.\n\n### Problem: Simplify cos(π/2 - θ) · cot θ\n\n### Step 1: Apply Cofunction Identity\n\ncos(π/2 - θ) = sin θ\n\n### Step 2: Substitute\n\nsin θ · cot θ = sin θ · (cos θ / sin θ) = cos θ",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5 — Simplify Real-World Wave Equations\n\nApply trigonometric identities to simplify expressions that model physical phenomena.\n\n### Problem: WAVES — The path P of a wave is given by P = (1 + sin²θ · sec²θ) / sec²θ - cos²θ. Simplify this expression.\n\n### Step 1: Rewrite in Terms of sin and cos\n\nsec²θ = 1/cos²θ\n\nP = (1 + sin²θ / cos²θ) / (1/cos²θ) - cos²θ\n\n### Step 2: Simplify the Complex Fraction\n\nP = (1 + sin²θ / cos²θ) · cos²θ - cos²θ\n\nP = cos²θ + sin²θ - cos²θ\n\n### Step 3: Apply Pythagorean Identity\n\nP = sin²θ\n\n---\n\n### Problem: LIGHT WAVE — The distance d is given by d = sin²θ + tan²θ + cos²θ. Simplify.\n\n### Step 1: Apply Identities\n\nRecall: tan²θ = sin²θ / cos²θ\n\nd = sin²θ + sin²θ / cos²θ + cos²θ\n\n### Step 2: Find Common Denominator\n\nd = sin²θ + cos²θ + sin²θ / cos²θ\n\nd = 1 + sin²θ / cos²θ\n\n### Step 3: Write as Single Fraction\n\nd = (cos²θ + sin²θ) / cos²θ + sin²θ / cos²θ - sin²θ\n\nThis simplifies to d = 1 + sin²θ (1/cos²θ - 1)\n\nFor specific values, this reduces further.",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Mixed Exercises\n\nThe mixed exercises provide practice with:\n\n- Finding exact trigonometric values given one ratio and quadrant information (Q2, Q3, Q4)\n- Simplifying expressions using reciprocal, quotient, and Pythagorean identities\n- Proving that expressions are not identities by finding counterexamples\n- Writing two expressions equivalent to a given trig expression\n- Using division to rewrite Pythagorean identities in different forms\n- Proving tan²θ + 1 = sec²θ and cot²θ + 1 = csc²θ\n\n---\n\n## Review Notes\n\n- Image reference: Problem 47 shows graphs for Jordan and Ebony's simplification comparison. Consult original worksheet for exact graph values.\n- The worksheet contains 48 practice problems across worked examples and mixed exercises.\n- Problems 42-48 involve proof and reasoning skills.",
            },
          },
        ],
      },
    ];

    const lesson1PhasesCreated = 0;
    const lesson1ActivitiesCreated = 0;

    for (const phase of lesson1PhaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersion1Id).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId: lessonVersion1Id,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      lesson1PhasesCreated++;

      for (const section of phase.sections) {
        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId,
          sequenceOrder: section.sequenceOrder,
          sectionType: section.sectionType,
          content: section.content,
          createdAt: now,
        });
      }
    }

    result.push({
      lessonId: lesson1Id,
      lessonVersionId: lessonVersion1Id,
      phasesCreated: lesson1PhasesCreated,
      activitiesCreated: lesson1ActivitiesCreated,
      slug: lesson1Slug,
    });

    // ========================
    // LESSON 13-2: Verifying Trigonometric Identities
    // ========================
    const lesson2Slug = "module-13-lesson-2";

    const existingLesson2 = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lesson2Slug))
      .unique();

    const lesson2Id: Id<"lessons"> = existingLesson2
      ? existingLesson2._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Verifying Trigonometric Identities",
          slug: lesson2Slug,
          description: "Students verify trigonometric identities by transforming one side to match the other, applying strategies for choosing which side to transform.",
          orderIndex: 2,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion2 = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson2Id))
      .first();

    const lessonVersion2Id: Id<"lesson_versions"> = existingLessonVersion2
      ? existingLessonVersion2._id
      : await ctx.db.insert("lesson_versions", {
          lessonId: lesson2Id,
          version: 1,
          title: "Verifying Trigonometric Identities",
          description: "Students verify trigonometric identities by transforming one side to match the other, applying strategies for choosing which side to transform.",
          status: "published",
          createdAt: now,
        });

    const lesson2PhaseData = [
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
              markdown: "## Today's Goals\n\n- Verify trigonometric identities by transforming one side to match the other\n- Apply strategies for choosing which side to transform\n- Verify identities by transforming each side independently\n- Determine whether an equation is an identity or not an identity\n- Use identities to prove real-world relationships (e.g., Brewster's Law)\n\n## Explore: The Art of Verification\n\nVerifying an identity is different from solving an equation. You cannot assume the two sides are equal—you must prove they are identical through valid transformations.\n\n**Inquiry Question:**\nWhy do we transform only one side when verifying an identity, rather than moving terms between sides?",
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
              markdown: "## Key Terms\n\n- **Verify an identity** — to prove that an equation is true for all values of the variable by transforming one side into the other\n- **Identity** — an equation that holds true for all values in the domain\n- **Not an identity** — an equation that is false for some values in the domain (a contradiction or conditional equation)",
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
              markdown: "## Strategies for Verifying Identities\n\n### Key Concept: Choose One Side to Transform\n\nPick the more complex side and transform it step by step until it matches the simpler side.\n\n### Key Concept: Useful Strategies\n\n1. Rewrite all trig functions in terms of sin and cos\n2. Factor and cancel common factors\n3. Look for patterns like 1 - sin²θ = cos²θ\n4. Multiply by conjugates to create difference of squares\n5. Break up complex fractions\n\n### Key Concept: Transforming Both Sides\n\nFor some identities, transforming one side is very difficult. In these cases, transform each side independently and show both simplify to the same expression.",
            },
          },
        ],
      },
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
              markdown: "## Example 1 — Verify by Transforming One Side\n\nVerify cos²θ + tan²θ · cos²θ = 1\n\n### Step 1: Factor the Left Side\n\ncos²θ + tan²θ · cos²θ = cos²θ (1 + tan²θ)\n\n### Step 2: Apply the Pythagorean Identity\n\nRecall: 1 + tan²θ = sec²θ\n\ncos²θ · sec²θ = cos²θ · (1/cos²θ) = 1\n\n### Step 3: Conclude\n\nLeft side simplifies to 1, matching the right side. Verified.",
            },
          },
        ],
      },
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
              markdown: "## Example 2 — Verify Using Multiple Identities\n\nVerify cot θ (cot θ + tan θ) = csc²θ\n\n### Step 1: Expand the Left Side\n\ncot θ · cot θ + cot θ · tan θ = cot²θ + 1\n\n### Step 2: Apply the Pythagorean Identity\n\nRecall: 1 + cot²θ = csc²θ\n\ncot²θ + 1 = csc²θ\n\n### Step 3: Conclude\n\nLeft side simplifies to csc²θ. Verified.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3 — Transform Each Side Independently\n\nVerify (sin θ + cot θ / csc θ)² = (2 + sec θ · csc θ) / (sec θ · csc θ)\n\n### Step 1: Simplify the Left Side\n\nFirst, note that cot θ / csc θ = (cos θ / sin θ) / (1/sin θ) = cos θ\n\nSo (sin θ + cos θ)² = sin²θ + 2 sin θ cos θ + cos²θ = 1 + 2 sin θ cos θ\n\n### Step 2: Simplify the Right Side\n\n(2 + sec θ · csc θ) / (sec θ · csc θ) = 2/(sec θ · csc θ) + 1\n\nsec θ · csc θ = (1/cos θ)(1/sin θ) = 1/(sin θ cos θ)\n\nSo 2/(sec θ · csc θ) = 2 sin θ cos θ\n\nThus, the right side equals 1 + 2 sin θ cos θ\n\n### Step 3: Both Sides Match\n\nBoth sides simplify to 1 + 2 sin θ cos θ. Verified.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4 — Verify the Cofunction Identity\n\nVerify cos(θ - π/2) = sin θ (or equivalently cos(π/2 - θ) = sin θ)\n\n### Step 1: Apply the Cosine Difference Identity\n\ncos(A - B) = cos A cos B + sin A sin B\n\ncos(θ - π/2) = cos θ · cos(π/2) + sin θ · sin(π/2)\n\n### Step 2: Substitute Known Values\n\ncos(π/2) = 0 and sin(π/2) = 1\n\ncos θ · 0 + sin θ · 1 = sin θ\n\n### Step 3: Conclude\n\ncos(θ - π/2) = sin θ. Verified.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Mixed Exercises\n\nThe mixed exercises provide practice with:\n\n- Verifying basic identities (tan θ · cos θ = sin θ, cot θ · tan θ = 1)\n- Verifying Pythagorean forms (sin²θ / (1 - sin²θ) = tan²θ)\n- Verifying identities that require algebraic manipulation or factoring\n- Proving Brewster's Law using trigonometric identities (OPTICS problem)\n- Determining whether an equation is an identity and justifying the argument\n- Using calculator methods to test whether an equation is an identity\n- Analyzing why sin²θ + cos²θ = 1 is an identity but sin θ = √(1 - cos²θ) is not\n- Creating trigonometric contradictions and expressions\n\n---\n\n## Review Notes\n\n- Image references: Problem 23 shows an optics diagram for Brewster's Law. Problem 24 shows graphs comparing y = cos²x / (1 - sin x) and y = sin x. Problem 36 shows calculator display for testing identity. Consult original worksheet for exact diagrams.\n- The worksheet contains 42 practice problems across worked examples and mixed exercises.\n- Problems 35-42 involve proof, analysis, and creation tasks.",
            },
          },
        ],
      },
    ];

    const lesson2PhasesCreated = 0;
    const lesson2ActivitiesCreated = 0;

    for (const phase of lesson2PhaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersion2Id).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId: lessonVersion2Id,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      lesson2PhasesCreated++;

      for (const section of phase.sections) {
        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId,
          sequenceOrder: section.sequenceOrder,
          sectionType: section.sectionType,
          content: section.content,
          createdAt: now,
        });
      }
    }

    result.push({
      lessonId: lesson2Id,
      lessonVersionId: lessonVersion2Id,
      phasesCreated: lesson2PhasesCreated,
      activitiesCreated: lesson2ActivitiesCreated,
      slug: lesson2Slug,
    });

    // ========================
    // LESSON 13-3: Sum and Difference Identities
    // ========================
    const lesson3Slug = "module-13-lesson-3";

    const existingLesson3 = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lesson3Slug))
      .unique();

    const lesson3Id: Id<"lessons"> = existingLesson3
      ? existingLesson3._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Sum and Difference Identities",
          slug: lesson3Slug,
          description: "Students apply sum and difference identities to find exact values at non-standard angles and use sum/difference formulas to verify trigonometric identities.",
          orderIndex: 3,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion3 = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson3Id))
      .first();

    const lessonVersion3Id: Id<"lesson_versions"> = existingLessonVersion3
      ? existingLessonVersion3._id
      : await ctx.db.insert("lesson_versions", {
          lessonId: lesson3Id,
          version: 1,
          title: "Sum and Difference Identities",
          description: "Students apply sum and difference identities to find exact values at non-standard angles and use sum/difference formulas to verify trigonometric identities.",
          status: "published",
          createdAt: now,
        });

    const lesson3PhaseData = [
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
              markdown: "## Today's Goals\n\n- Apply sum and difference identities to find exact values at non-standard angles\n- Use sum/difference formulas to verify trigonometric identities\n- Apply sum/difference identities to solve real-world problems (art, cameras)\n- Write expressions as single trigonometric functions using sum/difference formulas\n\n## Explore: Beyond Standard Angles\n\nWe know exact values for sin 30° = 1/2 and sin 45° = √2/2, but what about sin 75°? It is NOT sin 30° + sin 45°. The sum identity gives exact values for compound angles.\n\n**Inquiry Question:**\nWhy doesn't sin(A + B) = sin A + sin B? Can you find a counterexample using specific angle measures?",
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
              markdown: "## Key Terms\n\n- **Sum identity** — a formula expressing sin(A + B), cos(A + B), or tan(A + B) in terms of functions of A and B\n- **Difference identity** — a formula for sin(A - B), cos(A - B), or tan(A - B)\n- **Compound angle** — an angle expressed as the sum or difference of two other angles",
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
              markdown: "## Sum and Difference Identities\n\n### Key Concept: Sine Sum and Difference\n\nsin(A + B) = sin A cos B + cos A sin B\n\nsin(A - B) = sin A cos B - cos A sin B\n\n### Key Concept: Cosine Sum and Difference\n\ncos(A + B) = cos A cos B - sin A sin B\n\ncos(A - B) = cos A cos B + sin A sin B\n\n### Key Concept: Tangent Sum and Difference\n\ntan(A + B) = (tan A + tan B) / (1 - tan A tan B)\n\ntan(A - B) = (tan A - tan B) / (1 + tan A tan B)",
            },
          },
        ],
      },
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
              markdown: "## Example 1 — Find Exact Values Using Sum Identities\n\nFind the exact value of sin 135°.\n\n### Step 1: Rewrite as a Sum of Known Angles\n\n135° = 90° + 45°\n\nsin(90° + 45°) = sin 90° cos 45° + cos 90° sin 45°\n\n### Step 2: Substitute Known Values\n\nsin 90° = 1, cos 45° = √2/2\ncos 90° = 0, sin 45° = √2/2\n\n= 1 · √2/2 + 0 · √2/2 = √2/2\n\n### Step 3: Conclude\n\nsin 135° = √2/2",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 2 — Find cos 165° Using Difference Identity\n\n### Step 1: Rewrite as a Difference\n\n165° = 180° - 15° (or 135° + 30°)\n\nUsing cos(A - B) = cos A cos B + sin A sin B:\n\ncos 165° = cos(180° - 15°) = -cos 15°\n\n### Step 2: Find cos 15°\n\ncos 15° = cos(45° - 30°)\n\n= cos 45° cos 30° + sin 45° sin 30°\n\n= (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4\n\n### Step 3: Apply Sign\n\nSince cos(180° - 15°) = -cos 15°:\n\ncos 165° = -(√6 + √2)/4",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3 — Apply Identities to Real-World Problem\n\nART: Two triangular tiles with sides (3, 4, 5) and (4, 4√3, 8) are placed with 4-inch sides together.\n\n### Part a: Find sin A and cos A for the 3-4-5 triangle\n\nFor the 3-4-5 triangle: sin A = 4/5, cos A = 3/5\n\n### Part b: Find the measure of angle A\n\nUse the identity for the combined triangle. The angle can be found using the dot product of vectors.\n\n### Part c: Determine if the combined triangle is a right triangle\n\nCheck if the Pythagorean theorem holds for the combined sides.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4 — Verify Identities Using Sum/Difference Formulas\n\nVerify cos(60° + θ) = sin(30° - θ)\n\n### Step 1: Apply Cosine Sum Identity\n\ncos(60° + θ) = cos 60° cos θ - sin 60° sin θ\n\n= (1/2) cos θ - (√3/2) sin θ\n\n### Step 2: Apply Sine Difference Identity\n\nsin(30° - θ) = sin 30° cos θ - cos 30° sin θ\n\n= (1/2) cos θ - (√3/2) sin θ\n\n### Step 3: Conclude\n\nBoth expressions match. Verified.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5 — Use Sum/Difference Identities to Write Single Expressions\n\nWrite sin 19° cos 11° + cos 19° sin 11° as a single trigonometric function.\n\n### Step 1: Recognize the Pattern\n\nThis matches sin A cos B + cos A sin B = sin(A + B)\n\n### Step 2: Apply\n\nsin 19° cos 11° + cos 19° sin 11° = sin(19° + 11°) = sin 30°\n\n### Step 3: State the Value\n\nsin 30° = 1/2",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Mixed Exercises\n\nThe mixed exercises provide practice with:\n\n- Finding exact values for angles like sin 330°, cos(-165°), tan 75°, sin(4π/3)\n- Verifying sum and difference identities for various compound angles\n- Proving the cosine sum formula using geometric construction (CONSTRUCT ARGUMENTS problem)\n- Finding exact values for tan 165°, sec 1275°, sin 735°, tan(23π/12)\n- Verifying identities involving sum/difference formulas in general form\n- Constructing arguments explaining how to derive difference formulas from sum formulas\n- Using graphs to find values of h in sin(θ - h) = cos θ\n- Finding exact values for angles like sin(13π/12)\n- Solving problems involving flagpole height using angle of elevation\n- Using sum or difference identities to prove cofunction identities\n\n---\n\n## Review Notes\n\n- Image references: Problem 6 shows angle diagram for camera problem. Problem 7 shows triangular tiles for art problem. Problem 31 shows geometric proof diagram. Problem 46 shows sine and cosine graphs. Problem 48 shows flagpole diagram. Problem 59 shows angle diagram. Problem 60 shows unit circle with angles A and B. Consult original worksheet for exact diagrams.\n- The worksheet contains 63 practice problems across worked examples and mixed exercises.\n- Problems involving proofs and constructions require written explanations.",
            },
          },
        ],
      },
    ];

    const lesson3PhasesCreated = 0;
    const lesson3ActivitiesCreated = 0;

    for (const phase of lesson3PhaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersion3Id).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId: lessonVersion3Id,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      lesson3PhasesCreated++;

      for (const section of phase.sections) {
        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId,
          sequenceOrder: section.sequenceOrder,
          sectionType: section.sectionType,
          content: section.content,
          createdAt: now,
        });
      }
    }

    result.push({
      lessonId: lesson3Id,
      lessonVersionId: lessonVersion3Id,
      phasesCreated: lesson3PhasesCreated,
      activitiesCreated: lesson3ActivitiesCreated,
      slug: lesson3Slug,
    });

    // ========================
    // LESSON 13-4: Double-Angle and Half-Angle Identities
    // ========================
    const lesson4Slug = "module-13-lesson-4";

    const existingLesson4 = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lesson4Slug))
      .unique();

    const lesson4Id: Id<"lessons"> = existingLesson4
      ? existingLesson4._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Double-Angle and Half-Angle Identities",
          slug: lesson4Slug,
          description: "Students apply double-angle formulas for sin(2θ), cos(2θ), tan(2θ) and half-angle identities for sin(θ/2) and cos(θ/2) to find exact values.",
          orderIndex: 4,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion4 = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson4Id))
      .first();

    const lessonVersion4Id: Id<"lesson_versions"> = existingLessonVersion4
      ? existingLessonVersion4._id
      : await ctx.db.insert("lesson_versions", {
          lessonId: lesson4Id,
          version: 1,
          title: "Double-Angle and Half-Angle Identities",
          description: "Students apply double-angle formulas for sin(2θ), cos(2θ), tan(2θ) and half-angle identities for sin(θ/2) and cos(θ/2) to find exact values.",
          status: "published",
          createdAt: now,
        });

    const lesson4PhaseData = [
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
              markdown: "## Today's Goals\n\n- Apply double-angle formulas for sin(2θ), cos(2θ), tan(2θ)\n- Apply half-angle identities for sin(θ/2) and cos(θ/2)\n- Find exact values using double-angle and half-angle formulas\n- Choose the appropriate form of cos(2θ) based on given information\n- Derive double-angle formulas from sum formulas\n- Apply double-angle identities to solve real-world problems (sound waves, monuments)\n\n## Explore: Special Cases of Sum Formulas\n\nThe double-angle formulas are just the sum formulas with A = B = θ. For example:\n\nsin(θ + θ) = sin θ cos θ + cos θ sin θ = 2 sin θ cos θ\n\n**Inquiry Question:**\nWhy are there three forms of cos(2θ)? When is each form most useful?",
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
              markdown: "## Key Terms\n\n- **Double-angle identity** — a formula expressing sin(2θ), cos(2θ), or tan(2θ) in terms of functions of θ\n- **Half-angle identity** — a formula expressing sin(θ/2), cos(θ/2), or tan(θ/2) in terms of functions of θ\n- **Power-reducing identity** — forms like cos(2θ) = 1 - 2 sin²θ = 2 cos²θ - 1 used to reduce powers",
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
              markdown: "## Double-Angle and Half-Angle Formulas\n\n### Key Concept: Double-Angle Identities\n\nsin(2θ) = 2 sin θ cos θ\n\ncos(2θ) = cos²θ - sin²θ = 2 cos²θ - 1 = 1 - 2 sin²θ\n\ntan(2θ) = (2 tan θ) / (1 - tan²θ)\n\n### Key Concept: Choosing the Right Form for cos(2θ)\n\n- Use cos²θ - sin²θ when you know both sin and cos\n- Use 2 cos²θ - 1 when you know cos θ and want to eliminate sin\n- Use 1 - 2 sin²θ when you know sin θ and want to eliminate cos\n\n### Key Concept: Half-Angle Identities\n\nsin(θ/2) = ±√((1 - cos θ)/2)\n\ncos(θ/2) = ±√((1 + cos θ)/2)\n\nThe sign depends on the quadrant of θ/2.",
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Worked Example 1",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 1 — Find sin(2θ), cos(2θ), sin(θ/2), cos(θ/2)\n\nGiven sin θ = 2/3 and 90° < θ < 180° (Q2), find all four values.\n\n### Step 1: Find cos θ\n\nsin²θ + cos²θ = 1\n\ncos²θ = 1 - 4/9 = 5/9\n\nIn Q2, cosine is negative: cos θ = -√5/3\n\n### Step 2: Find sin(2θ)\n\nsin(2θ) = 2 sin θ cos θ = 2 · (2/3) · (-√5/3) = -4√5/9\n\n### Step 3: Find cos(2θ)\n\ncos(2θ) = cos²θ - sin²θ = 5/9 - 4/9 = 1/9\n\n### Step 4: Find sin(θ/2)\n\nSince 90° < θ < 180°, 45° < θ/2 < 90° (Q1).\n\nsin(θ/2) = √((1 - cos θ)/2) = √((1 - (-√5/3))/2) = √((1 + √5/3)/2)\n\n### Step 5: Find cos(θ/2)\n\ncos(θ/2) = √((1 + cos θ)/2) = √((1 - √5/3)/2)\n\nSince θ/2 is in Q1, both sin and cos are positive.",
            },
          },
        ],
      },
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
              markdown: "## Example 2 — Apply Double-Angle to Sound Wave Problem\n\nSOUND WAVES: The sound from a tuning fork is represented by S = 2 sin 2θ. Rewrite this formula in terms of sin θ and cos θ.\n\n### Step 1: Apply Double-Angle Identity\n\nS = 2 sin(2θ) = 2 · (2 sin θ cos θ) = 4 sin θ cos θ\n\n### Step 2: Interpret\n\nThe formula shows the wave can be expressed as 4 sin θ cos θ, which relates to the product-to-sum identities.",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3 — Find Exact Values Using Half-Angle Formulas\n\nFind the exact value of sin 75°.\n\n### Step 1: Write as a Half-Angle\n\n75° = 150° / 2\n\nsin 75° = sin(150° / 2)\n\n### Step 2: Apply Half-Angle Formula\n\nsin(θ/2) = √((1 - cos θ)/2)\n\nsin 75° = √((1 - cos 150°)/2)\n\n### Step 3: Substitute Known Values\n\ncos 150° = -√3/2\n\nsin 75° = √((1 - (-√3/2))/2) = √((1 + √3/2)/2)\n\n### Step 4: Simplify\n\n= √((2 + √3)/4) = √(2 + √3)/2\n\nAlternatively, using 75° = 45° + 30°:\n\nsin 75° = sin 45° cos 30° + cos 45° sin 30°\n\n= (√2/2)(√3/2) + (√2/2)(1/2) = (√6 + √2)/4",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4 — Find tan 165°\n\n### Step 1: Write as Sum or Difference\n\n165° = 180° - 15° or 330° / 2\n\nUsing tan(180° - θ) = -tan θ:\n\ntan 165° = -tan 15°\n\n### Step 2: Find tan 15° Using Half-Angle\n\ntan(15°) = tan(30°/2)\n\nUsing tan(θ/2) = sin θ / (1 + cos θ):\n\ntan 15° = sin 30° / (1 + cos 30°) = (1/2) / (1 + √3/2) = 1/(2 + √3)\n\nRationalize: = (2 - √3)/1 = 2 - √3\n\n### Step 3: Apply Sign\n\ntan 165° = -tan 15° = -(2 - √3) = √3 - 2",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5 — Structure Problem with Isosceles Right Triangle\n\nSTRUCTURE: A large isosceles right triangle has a small triangle formed by bisecting each acute angle.\n\n### Part a: Find sine and cosine for the congruent angles of the small triangle\n\nEach acute angle of the large triangle is 45°. When bisected, each becomes 22.5°.\n\nsin 22.5° = √((1 - cos 45°)/2) = √((1 - √2/2)/2)\n\ncos 22.5° = √((1 + cos 45°)/2) = √((1 + √2/2)/2)\n\n### Part b: Find sine and cosine for the obtuse angle of the small triangle\n\nThe obtuse angle is 180° - 22.5° - 22.5° = 135°.\n\nsin 135° = √2/2, cos 135° = -√2/2",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Mixed Exercises\n\nThe mixed exercises provide practice with:\n\n- Finding exact values of sin(2θ), cos(2θ), tan(2θ) given various trig values and quadrants\n- Using double-angle formulas to find exact values (sin 240° using sum, difference, double-angle, and half-angle methods)\n- Analyzing ramp problems with angle relationships\n- Proving tan(1/2 θ) = sin θ / (1 + cos θ) using unit circle\n- Writing paragraphs comparing when to use each form of cos(2θ)\n- Deriving double-angle identities from sum identities\n- Deriving half-angle identities from double-angle identities\n- Analyzing golf ball distance problems involving d = (2v² sin θ cos θ)/g\n\n---\n\n## Review Notes\n\n- Image references: Problem 11 shows sound wave diagram. Problem 31 shows isosceles triangle structure. Problem 32 shows ramp diagram. Problem 34 shows Teresa and Armando's calculations. Problem 34 shows additional calculation. Consult original worksheet for exact diagrams.\n- The worksheet contains 40 practice problems across worked examples and mixed exercises.\n- Problem 33 requires solving sin 240° using four different methods.",
            },
          },
        ],
      },
    ];

    const lesson4PhasesCreated = 0;
    const lesson4ActivitiesCreated = 0;

    for (const phase of lesson4PhaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersion4Id).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId: lessonVersion4Id,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      lesson4PhasesCreated++;

      for (const section of phase.sections) {
        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId,
          sequenceOrder: section.sequenceOrder,
          sectionType: section.sectionType,
          content: section.content,
          createdAt: now,
        });
      }
    }

    result.push({
      lessonId: lesson4Id,
      lessonVersionId: lessonVersion4Id,
      phasesCreated: lesson4PhasesCreated,
      activitiesCreated: lesson4ActivitiesCreated,
      slug: lesson4Slug,
    });

    // ========================
    // LESSON 13-5: Solving Trigonometric Equations
    // ========================
    const lesson5Slug = "module-13-lesson-5";

    const existingLesson5 = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lesson5Slug))
      .unique();

    const lesson5Id: Id<"lessons"> = existingLesson5
      ? existingLesson5._id
      : await ctx.db.insert("lessons", {
          unitNumber: 13,
          title: "Solving Trigonometric Equations",
          slug: lesson5Slug,
          description: "Students solve trigonometric equations on restricted and unrestricted domains, including quadratic-type equations and equations involving double-angle expressions.",
          orderIndex: 5,
          createdAt: now,
          updatedAt: now,
        });

    const existingLessonVersion5 = await ctx.db
      .query("lesson_versions")
      .withIndex("by_lesson", (q) => q.eq("lessonId", lesson5Id))
      .first();

    const lessonVersion5Id: Id<"lesson_versions"> = existingLessonVersion5
      ? existingLessonVersion5._id
      : await ctx.db.insert("lesson_versions", {
          lessonId: lesson5Id,
          version: 1,
          title: "Solving Trigonometric Equations",
          description: "Students solve trigonometric equations on restricted and unrestricted domains, including quadratic-type equations and equations involving double-angle expressions.",
          status: "published",
          createdAt: now,
        });

    const lesson5PhaseData = [
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
              markdown: "## Today's Goals\n\n- Solve trigonometric equations on restricted and unrestricted domains\n- Solve quadratic-type trigonometric equations by substitution\n- Solve equations involving double-angle expressions\n- Find all solutions using general form with +2πn\n- Solve inequalities involving trigonometric functions\n- Apply trigonometric equations to real-world models (sandcastles, batteries, sound, Ferris wheels)\n\n## Explore: Infinite Solutions\n\nThe equation sin θ = 1/2 has infinitely many solutions because sine repeats every 2π. Within [0, 2π), the solutions are π/6 and 5π/6. The general solution is θ = π/6 + 2πn or θ = 5π/6 + 2πn.\n\n**Inquiry Question:**\nWhy does sin θ = 1/2 have two solutions in [0, 2π) while tan θ = 1/2 has only one? How does periodicity affect the number of solutions?",
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
              markdown: "## Key Terms\n\n- **Principal solutions** — solutions within one period ([0, 2π) or [0°, 360°))\n- **General solution** — all solutions expressed with +2πn (or +360°n) for integer n\n- **Quadratic-type equation** — an equation that can be written in the form au² + bu + c = 0 where u is a trigonometric function",
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
              markdown: "## Solving Trigonometric Equations\n\n### Key Concept: General Strategy\n\n1. Isolate the trig function or rewrite as a quadratic in the trig function\n2. Find all angles in the given interval that satisfy the equation\n3. Write the general solution if requested\n4. Check for extraneous solutions\n\n### Key Concept: Reference Angles and Quadrants\n\nFor sin θ = k (where -1 ≤ k ≤ 1):\n- Reference angle = arcsin(k)\n- Solutions in [0, 2π): reference angle and π - reference angle\n\nFor cos θ = k:\n- Reference angle = arccos(k)\n- Solutions in [0, 2π): reference angle and 2π - reference angle\n\nFor tan θ = k:\n- Reference angle = arctan(k)\n- Solutions in [0, 2π): reference angle and reference angle + π",
            },
          },
        ],
      },
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
              markdown: "## Example 1 — Solve on a Restricted Interval\n\nSolve cos²θ = 1/4 for 0° ≤ θ ≤ 360°.\n\n### Step 1: Take the Square Root\n\ncos²θ = 1/4\n\ncos θ = ±1/2\n\n### Step 2: Find Solutions for cos θ = 1/2\n\nReference angle = 60°. Cosine is positive in Q1 and Q4.\n\nθ = 60° or θ = 300°\n\n### Step 3: Find Solutions for cos θ = -1/2\n\nReference angle = 60°. Cosine is negative in Q2 and Q3.\n\nθ = 120° or θ = 240°\n\n### Step 4: List All Solutions\n\nθ = 60°, 120°, 240°, 300°",
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Worked Example 2",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 2 — Solve for All Values (Radians)\n\nSolve cos 2θ + 3 cos θ = 1 for all values of θ if θ is measured in radians.\n\n### Step 1: Use Double-Angle Identity\n\ncos 2θ = 2 cos²θ - 1\n\n2 cos²θ - 1 + 3 cos θ = 1\n\n2 cos²θ + 3 cos θ - 2 = 0\n\n### Step 2: Factor (Quadratic in cos θ)\n\nLet u = cos θ:\n\n2u² + 3u - 2 = 0\n\n(2u - 1)(u + 2) = 0\n\n### Step 3: Solve for u\n\nu = 1/2 or u = -2\n\nSince cos θ = -2 has no solutions (cosine range is [-1, 1]), we have cos θ = 1/2.\n\n### Step 4: Find θ\n\ncos θ = 1/2 when θ = π/3 + 2πn or θ = 5π/3 + 2πn\n\n### Step 5: Write General Solution\n\nθ = ±π/3 + 2πn (or equivalently θ = π/3 + 2πn and θ = 5π/3 + 2πn)",
            },
          },
        ],
      },
      {
        phaseNumber: 6,
        title: "Worked Example 3",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 3 — Apply to Real-World Model\n\nSANDCASTLES: Water level follows y = 7 + 7 sin(π/6 · t), where y is feet above low tide and t is hours past 6 A.M. Nashiko built her sandcastle 10 feet above low tide at 2 P.M. When will the waterline reach the sandcastle?\n\n### Step 1: Set Up the Equation\n\n10 = 7 + 7 sin(π/6 · t)\n\n3 = 7 sin(π/6 · t)\n\nsin(π/6 · t) = 3/7\n\n### Step 2: Find the Reference Angle\n\narcsin(3/7) ≈ 0.442 radians (or about 25.3°)\n\n### Step 3: Find Solutions in Context\n\nSince 2 P.M. is t = 8 hours past 6 A.M., we look for solutions after t = 8.\n\nFirst solution: π/6 · t = 0.442 gives t ≈ 0.84 hours (before 6 A.M.)\n\nSecond solution in Q2: π/6 · t = π - 0.442 = 2.70 gives t ≈ 16.4 hours past 6 A.M.\n\n### Step 4: Interpret\n\nt ≈ 16.4 hours past 6 A.M. is about 10:24 P.M. Since the water rises then falls, it will reach 10 feet again earlier in the day.",
            },
          },
        ],
      },
      {
        phaseNumber: 7,
        title: "Worked Example 4",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 4 — Solve Trigonometric Inequalities\n\nSolve 3 csc θ ≤ 2 for 0° ≤ θ ≤ 360°.\n\n### Step 1: Rewrite in Terms of Sine\n\ncsc θ = 1/sin θ\n\n3/sin θ ≤ 2\n\n### Step 2: Consider Cases\n\nCase 1: sin θ > 0 (Q1 and Q2)\n3 ≤ 2 sin θ → sin θ ≥ 3/2 (no solution since sin θ ≤ 1)\n\nCase 2: sin θ < 0 (Q3 and Q4)\n3 ≥ 2 sin θ → sin θ ≤ 3/2 (always true when sin θ < 0)\n\n### Step 3: Find Where csc θ = 2\n\ncsc θ = 2 when sin θ = 1/2\n\nθ = 30° or θ = 150°\n\n### Step 4: Determine Solution Regions\n\nSince csc θ ≤ 2 means 1/sin θ ≤ 2, we need:\n- sin θ ≥ 1/2 when sin θ > 0\n- OR sin θ < 0 (any negative sine satisfies the inequality)\n\nθ in [30°, 150°] from the first condition, plus θ in [180°, 360°] from the second.",
            },
          },
        ],
      },
      {
        phaseNumber: 8,
        title: "Worked Example 5",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 5 — Solve Equations with Multiple Trig Functions\n\nSolve cos θ + 1 = sin θ for [0, 2π).\n\n### Step 1: Rearrange\n\ncos θ - sin θ = -1\n\n### Step 2: Square Both Sides (Caution: Check for Extraneous Solutions)\n\n(cos θ - sin θ)² = 1\n\ncos²θ - 2 sin θ cos θ + sin²θ = 1\n\n### Step 3: Simplify Using Pythagorean Identity\n\n1 - 2 sin θ cos θ = 1\n\n-2 sin θ cos θ = 0\n\nsin θ cos θ = 0\n\n### Step 4: Solve sin θ cos θ = 0\n\nsin θ = 0 gives θ = 0, π\n\ncos θ = 0 gives θ = π/2, 3π/2\n\n### Step 5: Check Against Original Equation\n\nFor θ = 0: cos 0 + 1 = 1 + 1 = 2, sin 0 = 0. 2 ≠ 0 (extraneous)\n\nFor θ = π: cos π + 1 = -1 + 1 = 0, sin π = 0. 0 = 0 ✓\n\nFor θ = π/2: cos(π/2) + 1 = 0 + 1 = 1, sin(π/2) = 1. 1 = 1 ✓\n\nFor θ = 3π/2: cos(3π/2) + 1 = 0 + 1 = 1, sin(3π/2) = -1. 1 ≠ -1 (extraneous)\n\n### Step 6: Solution\n\nθ = π/2, π",
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example 6 — Solve with Double-Angle\n\nSolve tan 3θ = 1 for θ measured in degrees.\n\n### Step 1: Find Reference Angle for tan\n\ntan φ = 1 when φ = 45° (and + 180°n)\n\n### Step 2: Set Up the Equation\n\n3θ = 45° + 180°n\n\n### Step 3: Solve for θ\n\nθ = 15° + 60°n\n\n### Step 4: List Solutions\n\nFor n = 0: θ = 15°\nFor n = 1: θ = 75°\nFor n = 2: θ = 135°\nFor n = 3: θ = 195°\nFor n = 4: θ = 255°\nFor n = 5: θ = 315°\n\nWithin [0, 360°]: θ = 15°, 75°, 135°, 195°, 255°, 315°",
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 25,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Mixed Exercises\n\nThe mixed exercises provide practice with:\n\n- Solving basic trig equations (sin θ = √2/2, 2 cos θ = -√3)\n- Solving quadratic-type equations (sin²θ + sin θ = 0, 2 cos²θ - cos θ = 1)\n- Solving equations with multiple trig functions\n- Finding all solutions for equations like sin θ = cos 2θ\n- Solving real-world problems: sound waves on guitar strings (D = 0.5 sin(6.5x) sin(2500t)), Ferris wheel height (h = 134 - 130 cos(2πt/9))\n- Analyzing daylight hours using sine models (f(x) = 3.725 sin(0.016x - 1.180) + 11.932)\n- Solving business profit models (P(x) = 1808.831 sin(0.543x - 2.455) + 1942.476)\n- Solving sprinkler distance problems (d(x) = 3 sec(π/5 x))\n- Analyzing inequalities (sin 2x < sin x)\n- Comparing solving trig equations to solving linear and quadratic equations\n- Determining how many solutions to expect for equations of the form a sin(bθ + c) = d\n\n---\n\n## Review Notes\n\n- Image references: Problem 53 shows table of daylight hours data. Problem 55 shows graph for business profit model. Problem 62 shows Ms. Rollins' student work. Consult original worksheet for exact diagrams and values.\n- The worksheet contains 62 practice problems across worked examples and mixed exercises.\n- Problems 51-56 involve applying trigonometric equations to real-world modeling situations.\n- Problems 57-62 involve analysis, comparison, and creation tasks.",
            },
          },
        ],
      },
    ];

    const lesson5PhasesCreated = 0;
    const lesson5ActivitiesCreated = 0;

    for (const phase of lesson5PhaseData) {
      const existingPhase = await ctx.db
        .query("phase_versions")
        .withIndex("by_lesson_version_and_phase", (q) =>
          q.eq("lessonVersionId", lessonVersion5Id).eq("phaseNumber", phase.phaseNumber)
        )
        .first();

      if (existingPhase) continue;

      const phaseId = await ctx.db.insert("phase_versions", {
        lessonVersionId: lessonVersion5Id,
        phaseNumber: phase.phaseNumber,
        title: phase.title,
        estimatedMinutes: phase.estimatedMinutes,
        phaseType: phase.phaseType,
        createdAt: now,
      });

      lesson5PhasesCreated++;

      for (const section of phase.sections) {
        await ctx.db.insert("phase_sections", {
          phaseVersionId: phaseId,
          sequenceOrder: section.sequenceOrder,
          sectionType: section.sectionType,
          content: section.content,
          createdAt: now,
        });
      }
    }

    result.push({
      lessonId: lesson5Id,
      lessonVersionId: lessonVersion5Id,
      phasesCreated: lesson5PhasesCreated,
      activitiesCreated: lesson5ActivitiesCreated,
      slug: lesson5Slug,
    });

    return { lessons: result };
  },
});
