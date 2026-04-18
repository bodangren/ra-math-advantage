import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5_4Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5_4 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_4Result> => {
    const now = Date.now();
    const lessonSlug = "module-5-lesson-4";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Geometric Sequences and Series",
          slug: lessonSlug,
          description: "Students generate geometric sequences and find sums of geometric series.",
          orderIndex: 4,
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
          title: "Geometric Sequences and Series",
          description: "Students generate geometric sequences and find sums of geometric series.",
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
                "## Explore: Explicit and Recursive Formulas\n\nUse a concrete model to complete the explore.\n\n**Inquiry Question:**\nHow can a geometric sequence be defined?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "graphing-explorer",
              props: {
                variant: "explore",
                equation: "y = a * r^(x-1)",
                title: "Geometric Sequences",
              },
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
                "## Key Terms\n\n- **Sequence**: A set of numbers in a particular order or pattern\n- **Term of a sequence**: Each number in a sequence\n- **Finite sequence**: A sequence with a limited number of terms\n- **Infinite sequence**: A sequence that continues without end\n- **Geometric sequence**: A sequence where each term is found by multiplying the previous term by a nonzero constant called the common ratio\n- **Common ratio**: The constant multiplier in a geometric sequence\n- **Explicit formula**: A formula that defines the nth term directly\n- **Recursive formula**: A formula that defines each term using the previous term\n- **Geometric means**: The terms between two nonconsecutive terms of a geometric sequence\n- **Series**: The sum of the terms of a sequence\n- **Geometric series**: The sum of the terms of a geometric sequence\n- **Sigma notation**: Notation using $\\Sigma$ to represent a sum",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Learn: Sequences",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Sequences\n\nA **sequence** is a set of numbers in a particular order or pattern.\n\n\n- Each number is a **term**\n- $a_1$ is the first term, $a_2$ the second, and so on\n- A **finite** sequence has a limited number of terms\n- An **infinite** sequence continues without end\n\nA sequence can be defined as a function.\n\n### Key Concept: Sequences as Functions\n\n- domain: natural numbers $1, 2, 3, ..., n$\n- range: sequence terms $a_1, a_2, a_3, ..., a_n$\n\nIn a **geometric sequence**, each term is found by multiplying the previous term by a nonzero constant called the **common ratio**.\n\n### Key Concept: nth Term of a Geometric Sequence\n\nIf the first term is $a_1$ and the common ratio is $r$, then:\n\n$$a_n = a_1 r^{n-1}$$\n\nThe recursive form is:\n\n$$a_n = r \\cdot a_{n-1}$$\n\n**Geometric means** are the terms between two nonconsecutive terms of a geometric sequence.",
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
              markdown:
                "## Example 1 — Identify Geometric Sequences\n\nDetermine whether:\n\n\n$$2, 6, 15, 30, ...$$\n\n\nis geometric.\n\n### Ratios:\n\n- $6/2 = 3$\n- $15/6 = 2.5$\n- $30/15 = 2$\n\n\nThe ratios are not the same, so the sequence is **not geometric**.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "2, 6, 15, 30, ...",
                steps: [
                  { expression: "6/2 = 3", explanation: "Calculate ratio between first two terms" },
                  { expression: "15/6 = 2.5", explanation: "Calculate ratio between second and third terms" },
                  { expression: "30/15 = 2", explanation: "Calculate ratio between third and fourth terms" },
                  { expression: "Ratios are not equal (3, 2.5, 2)", explanation: "For a geometric sequence, all ratios must be the same" },
                  { expression: "The sequence is NOT geometric", explanation: "Conclude based on unequal ratios" },
                ],
              },
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
              markdown:
                "## Example 2 — Graph Geometric Sequences\n\nFind and graph the first six terms of:\n\n$$-1, -2, -4, ...$$\n\n### Step 1: Find the common ratio\n\n$$(-2)/(-1) = 2$$\n\n### Step 2: Find the next terms\n\nContinue multiplying by $2$:\n\n$$-8, -16, -32$$\n\n### Step 3: Graph the sequence\n\n- domain: $\{1, 2, 3, 4, 5, 6\\}$\n- range: $\\{-1, -2, -4, -8, -16, -32\\}$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "-1, -2, -4, ...",
                steps: [
                  { expression: "r = (-2)/(-1) = 2", explanation: "Find common ratio" },
                  { expression: "a_3 = -2 * 2 = -4", explanation: "Continue sequence" },
                  { expression: "a_4 = -4 * 2 = -8", explanation: "Continue sequence" },
                  { expression: "a_5 = -8 * 2 = -16", explanation: "Continue sequence" },
                  { expression: "a_6 = -16 * 2 = -32", explanation: "Continue sequence" },
                  { expression: "First six terms: -1, -2, -4, -8, -16, -32", explanation: "Final answer" },
                ],
              },
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
              markdown:
                "## Example 3 — Find the nth Term\n\nJavier starts with a $50$-gram chocolate bar and eats half of what remains each day.\n\nIf he starts on Monday, how much will he eat on Friday?\n\nThe amount eaten each day forms a geometric sequence:\n\n\n- first day: $25$ g\n- common ratio: $1/2$\n\nFriday is the fifth day, so use:\n\n$$a_n = 25(\\frac{1}{2})^{n-1}$$\n\nFor Friday:\n\n\n$$a_5 = 25(\\frac{1}{2})^4 = 1.5625$$\n\nSo Javier eats about:\n\n**$1.6$ g**",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "a_n = 25(1/2)^(n-1), find a_5",
                steps: [
                  { expression: "a_1 = 25, r = 1/2", explanation: "Identify first term and common ratio" },
                  { expression: "a_n = 25(1/2)^(n-1)", explanation: "Write explicit formula" },
                  { expression: "a_5 = 25(1/2)^(5-1)", explanation: "Substitute n = 5 for Friday" },
                  { expression: "a_5 = 25(1/2)^4", explanation: "Simplify exponent" },
                  { expression: "a_5 = 25/16 = 1.5625", explanation: "Calculate" },
                  { expression: "Javier eats about 1.6 g on Friday", explanation: "Result" },
                ],
              },
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
              markdown:
                "## Example 4 — Write an Equation for the nth Term\n\nWrite an equation for the nth term of each geometric sequence.\n\n### Part a: $-1, 3, -9, 27, ...$\n\nFind $r$:\n\n$$r = (-9)/3 = -3$$\nSo:\n$$a_n = -1(-3)^{n-1}$$\n### Part b: $a_8 = 5$ and $r = 1/2$\nUse:\n$$a_n = a_1 r^{n-1}$$\n$$5 = a_1 (1/2)^7$$\n$$a_1 = 640$$\nSo:\n$$a_n = 640(1/2)^{n-1}$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Find nth term: -1, 3, -9, 27, ...",
                steps: [
                  { expression: "r = 3/(-1) = -3", explanation: "Find common ratio" },
                  { expression: "a_n = -1(-3)^(n-1)", explanation: "Write explicit formula with a_1 = -1" },
                  { expression: "For a_8 = 5: 5 = a_1(1/2)^7", explanation: "Set up equation for second part" },
                  { expression: "a_1 = 5 / (1/2)^7 = 640", explanation: "Solve for a_1" },
                  { expression: "a_n = 640(1/2)^(n-1)", explanation: "Write explicit formula for second part" },
                ],
              },
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
              markdown:
                "## Example 5 — Recursive and Explicit Formulas\n\nTranslate between recursive and explicit form.\n### Part a: $a_1 = 5, a_n = (1/5)a_{n-1}, n \\geq 2$\n\nThis is recursive, with:\n\n- $a_1 = 5$\n- $r = 1/5$\n\nExplicit form:\n\n$$a_n = 5(\\frac{1}{5})^{n-1}$$\n### Part b: $a_n = (2/3)(7)^{n-1}$\n\nThis is explicit, with:\n- $a_1 = 2/3$\n- $r = 7$\n\nRecursive form:\n- $a_1 = 2/3$\n- $a_n = 7a_{n-1}, n \\geq 2$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Convert: a_1 = 5, a_n = (1/5)a_(n-1)",
                steps: [
                  { expression: "a_1 = 5, r = 1/5", explanation: "Identify first term and common ratio from recursive form" },
                  { expression: "a_n = 5(1/5)^(n-1)", explanation: "Write explicit form using a_n = a_1 * r^(n-1)" },
                  { expression: "For a_n = (2/3)(7)^(n-1): a_1 = 2/3, r = 7", explanation: "Identify from explicit form" },
                  { expression: "Recursive: a_1 = 2/3, a_n = 7a_(n-1)", explanation: "Write recursive form" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 9,
        title: "Worked Example 6",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 6 — Find Geometric Means\n\nFind four geometric means between $243$ and $32$.\n\nThere are $6$ total terms, so:\n- $a_1 = 243$\n- $a_6 = 32$\n- $n = 6$\n\nUse:\n$$32 = 243r^5$$\n\n$$r^5 = 32/243$$\n\n$$r = 2/3$$\nNow generate the sequence:\n\n$$243, 162, 108, 72, 48, 32$$\nSo the geometric means are:\n- $162$\n- $108$\n- $72$\n- $48$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Find 4 geometric means between 243 and 32",
                steps: [
                  { expression: "n = 6 (4 means + 2 endpoints)", explanation: "Total terms needed" },
                  { expression: "a_1 = 243, a_6 = 32", explanation: "Identify endpoints" },
                  { expression: "32 = 243 * r^5", explanation: "Use a_n = a_1 * r^(n-1)" },
                  { expression: "r^5 = 32/243", explanation: "Solve for r^5" },
                  { expression: "r = (32/243)^(1/5) = 2/3", explanation: "Take fifth root" },
                  { expression: "Geometric means: 162, 108, 72, 48", explanation: "Multiply by r progressively" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 10,
        title: "Learn: Geometric Series",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Geometric Series\n\nA **series** is the sum of the terms of a sequence.\n\n\nThe sum of the first $n$ terms is $S_n$.\n\nA **geometric series** is the sum of the terms of a geometric sequence.\n\n### Key Concept: Partial Sums of a Geometric Series\n\nIf $a_1$, $r$, and $n$ are known:\n\n$$S_n = \\frac{a_1 - a_1 r^n}{1 - r}, \\text{ for } r \\neq 1$$\n\n\nIf $a_1$, $r$, and $a_n$ are known:\n\n\n$$S_n = \\frac{a_1 - a_n r}{1 - r}, \\text{ for } r \\neq 1$$\n\n### Key Concept: Sigma Notation\n\nSigma notation uses $\\Sigma$ to represent a sum.\n\nExample:\n\n$$\\sum_{k=1}^{6} (3k + 2)$$\n\nand\n\n$$\\sum_{k=1}^{8} 5(3)^{k-1}$$",
            },
          },
        ],
      },
      {
        phaseNumber: 11,
        title: "Worked Example 7",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 7 — Find the Sum of a Geometric Series\n\nKateri sets up dominos so each domino knocks down $2$ more, for $6$ rows total.\n\n- $a_1 = 1$\n- $r = 2$\n- $n = 6$\n\nUse:\n$$S_n = \\frac{1 - 1 \\cdot 2^6}{1 - 2}$$\n\n$$= \\frac{1 - 64}{-1}$$\n\n\n$$= 63$$\n\nSo she needs:\n\n**$63$ dominos**",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "S_6 with a_1=1, r=2",
                steps: [
                  { expression: "a_1 = 1, r = 2, n = 6", explanation: "Identify given values" },
                  { expression: "S_n = (a_1 - a_1*r^n)/(1-r)", explanation: "Use geometric series sum formula" },
                  { expression: "S_6 = (1 - 1*2^6)/(1-2)", explanation: "Substitute values" },
                  { expression: "2^6 = 64", explanation: "Calculate exponent" },
                  { expression: "S_6 = (1-64)/(-1) = 63", explanation: "Simplify" },
                  { expression: "Kateri needs 63 dominos", explanation: "Result" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 12,
        title: "Worked Example 8",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 8 — Find the First Term in a Series\n\nFind $a_1$ for a geometric series where:\n\n- $S_n = 21.3125$\n- $n = 5$\n- $r = 1/2$\n\nUse:\n$$21.3125 = \\frac{a_1 - a_1(1/2)^5}{1 - 1/2}$$\n\nSolving gives:\n\n$$a_1 = 11$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Find a_1: S_5=21.3125, r=1/2",
                steps: [
                  { expression: "S_n = (a_1 - a_1*r^n)/(1-r)", explanation: "Geometric series sum formula" },
                  { expression: "21.3125 = (a_1 - a_1*(1/2)^5)/(1-1/2)", explanation: "Substitute given values" },
                  { expression: "(1/2)^5 = 1/32", explanation: "Calculate the power" },
                  { expression: "21.3125 = (a_1 - a_1/32)/(1/2)", explanation: "Simplify denominator" },
                  { expression: "21.3125 = 2*(a_1 - a_1/32)", explanation: "Multiply both sides by 2" },
                  { expression: "a_1 = 11", explanation: "Solve for a_1" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 13,
        title: "Worked Example 9",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Example 9 — Sum in Sigma Notation\n\nFind:\n\n$$\\sum_{k=5}^{12} 3(-2)^{k-1}$$\n\nFirst identify:\n- $a_1 = 3(-2)^{4} = 48$\n- $r = -2$\n- number of terms: $12 - 5 + 1 = 8$\n\nThen:\n\n$$S_n = \\frac{48 - 48(-2)^8}{1 - (-2)}$$\n\n\n$$= -4080$$",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "polynomial",
                equation: "Sum: sum(k=5 to 12) 3(-2)^(k-1)",
                steps: [
                  { expression: "a_1 = 3(-2)^(5-1) = 48", explanation: "Find first term of the series" },
                  { expression: "r = -2", explanation: "Common ratio from the expression" },
                  { expression: "n = 12 - 5 + 1 = 8", explanation: "Number of terms" },
                  { expression: "S_n = (48 - 48*(-2)^8)/(1-(-2))", explanation: "Apply geometric series formula" },
                  { expression: "(-2)^8 = 256", explanation: "Calculate power" },
                  { expression: "S_n = (48 - 48*256)/3 = -4080", explanation: "Simplify to get final sum" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 14,
        title: "Discourse",
        phaseType: "discourse" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Discussion Questions\n\n1. How do you determine whether a sequence is geometric?\n2. Why is the common ratio called the \"common ratio\"?\n3. How is the formula for the sum of a geometric series related to the formula for the nth term?\n4. In what real-world situations might you use sigma notation to represent a geometric series?",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "What is the common ratio in the sequence 3, 6, 12, 24, ...?",
                    options: ["2", "3", "6"],
                    correctIndex: 0,
                  },
                  {
                    question: "For a geometric series with a_1 = 2, r = 3, and n = 4, what is S_4?",
                    options: ["80", "54", "120"],
                    correctIndex: 0,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 15,
        title: "Reflection",
        phaseType: "reflection" as const,
        estimatedMinutes: 5,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown:
                "## Reflection\n\nToday you learned about geometric sequences and series. Consider the following:\n\n- How do you determine whether a sequence is geometric?\n- What is the difference between a geometric sequence and a geometric series?\n- How does the sum formula for geometric series simplify calculations?\n\n**Tip**: Remember that the common ratio $r$ can be negative, which produces an alternating sequence.",
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
          q.eq("lessonVersionId", lessonVersionId).eq("phaseNumber", phase.phaseNumber)
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
          const activityContent = section.content as {
            componentKey: string;
            props: Record<string, unknown>;
          };

          const insertedActivityId = await ctx.db.insert("activities", {
            componentKey: activityContent.componentKey,
            displayName: `${phase.title} - ${activityContent.componentKey}`,
            description: `Activity for ${phase.title}`,
            props: activityContent.props,
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
              ...activityContent,
              activityId: insertedActivityId,
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

    return {
      lessonId,
      lessonVersionId,
      phasesCreated,
      activitiesCreated,
    };
  },
});