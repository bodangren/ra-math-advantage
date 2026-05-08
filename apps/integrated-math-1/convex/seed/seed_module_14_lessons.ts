import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule14Result {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    phasesCreated: number;
  }>;
}

export const seedModule14Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule14Result> => {
    const now = Date.now();
    const lessons = [
      {
        slug: "module-14-lesson-1",
        title: "Angles of Triangles",
        description:
          "Students apply the Triangle Angle-Sum Theorem to find unknown interior angle measures, use the Exterior Angle Theorem, and classify triangles by angle measures.",
        orderIndex: 1,
      },
      {
        slug: "module-14-lesson-2",
        title: "Congruent Triangles",
        description:
          "Students identify congruent corresponding parts of polygons, write congruence statements, and apply properties of congruent triangles to solve problems.",
        orderIndex: 2,
      },
      {
        slug: "module-14-lesson-3",
        title: "Proving Triangles Congruent: SSS, SAS",
        description:
          "Students write two-column, paragraph, and flow proofs to prove triangle congruence using the SSS and SAS postulates.",
        orderIndex: 3,
      },
      {
        slug: "module-14-lesson-4",
        title: "Proving Triangles Congruent: ASA, AAS",
        description:
          "Students write two-column, paragraph, and flow proofs to prove triangle congruence using the ASA and AAS theorems.",
        orderIndex: 4,
      },
      {
        slug: "module-14-lesson-5",
        title: "Proving Right Triangles Congruent",
        description:
          "Students apply the LL, HA, LA, and HL theorems to prove right triangles congruent and write formal proofs.",
        orderIndex: 5,
      },
      {
        slug: "module-14-lesson-6",
        title: "Isosceles and Equilateral Triangles",
        description:
          "Students write two-column proofs using the Isosceles Triangle Theorem and its converse, and find missing side lengths and angle measures.",
        orderIndex: 6,
      },
      {
        slug: "module-14-lesson-7",
        title: "Triangles and Coordinate Proof",
        description:
          "Students position and label triangles on the coordinate plane, write coordinate proofs, and apply coordinate geometry to classify triangles.",
        orderIndex: 7,
      },
    ];

    const results: SeedModule14Result["lessons"] = [];

    for (const lesson of lessons) {
      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 14,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            orderIndex: lesson.orderIndex,
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
            title: lesson.title,
            description: lesson.description,
            status: "published",
            createdAt: now,
          });

      let phasesCreated = 0;

      const phaseData = getPhaseData(lesson.slug);

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

      results.push({ lessonId, lessonVersionId, phasesCreated });
    }

    return { lessons: results };
  },
});

function getPhaseData(slug: string) {
  switch (slug) {
    case "module-14-lesson-1":
      return getLesson1Phases();
    case "module-14-lesson-2":
      return getLesson2Phases();
    case "module-14-lesson-3":
      return getLesson3Phases();
    case "module-14-lesson-4":
      return getLesson4Phases();
    case "module-14-lesson-5":
      return getLesson5Phases();
    case "module-14-lesson-6":
      return getLesson6Phases();
    case "module-14-lesson-7":
      return getLesson7Phases();
    default:
      return [];
  }
}

function getLesson1Phases() {
  return [
    {
      phaseNumber: 1,
      title: "Explore",
      phaseType: "explore" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Explore: What Is the Sum of the Angles in Any Triangle?\n\nStudents investigate the relationship among the three interior angles of a triangle. By tearing off the corners of a paper triangle and arranging them side by side, students observe that the three angles always form a straight angle.\n\nInquiry Question:\nWhy does tearing off and rearranging the corners of any triangle always produce a straight line?",
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
              "## Vocabulary\n\n- **Triangle Angle-Sum Theorem** — The sum of the measures of the interior angles of a triangle is 180°.\n- **Exterior Angle** — An angle formed by one side of a triangle and the extension of an adjacent side.\n- **Remote Interior Angles** — The two interior angles of a triangle that are not adjacent to a given exterior angle.\n- **Exterior Angle Theorem** — The measure of an exterior angle of a triangle equals the sum of the measures of its two remote interior angles.\n- **Acute Triangle** — A triangle in which all three angles are acute (less than 90°).\n- **Right Triangle** — A triangle containing exactly one right angle (90°).\n- **Obtuse Triangle** — A triangle containing exactly one obtuse angle (greater than 90°).\n- **Corollary** — A statement that follows directly from a theorem.\n- **Complementary Angles** — Two angles whose measures sum to 90°.\n- **Flow Proof** — A proof that uses arrows to show the logical flow of an argument.\n- **Paragraph Proof** — A proof written in complete sentences.",
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
              "## Learn: Angles of Triangles\n\nThe angles of a triangle have special relationships that allow us to find missing measures and classify the triangle.\n\n### Key Concept: Triangle Angle-Sum Theorem\n\nFor any triangle, the sum of the three interior angle measures equals 180°.\n[\\angle A + \\angle B + \\angle C = 180°]\n\n### Key Concept: Exterior Angle Theorem\n\nAn exterior angle of a triangle equals the sum of the two remote interior angles.\n[\\text{exterior angle} = \\text{remote interior angle}_1 + \\text{remote interior angle}_2]\n\n### Key Concept: Corollaries\n\n- The acute angles of a right triangle are complementary.\n- A triangle can have at most one right angle.\n- A triangle can have at most one obtuse angle.\n\n### Key Concept: Classifying Triangles by Angles\n\n- If all three angles are acute, the triangle is acute.\n- If one angle is exactly 90°, the triangle is right.\n- If one angle is greater than 90°, the triangle is obtuse.",
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
            markdown:
              "## Example 1 — Find Unknown Angle Measures in Triangles\n\nUse the Triangle Angle-Sum Theorem to find missing interior angle measures from given diagrams.\n\n### Step 1: Identify Known Angles\n\nRead the diagram to determine which angles are given and which angle is unknown.\n\n### Step 2: Apply the Triangle Angle-Sum Theorem\n\nSet up an equation showing that the three angles sum to 180°, then solve for the unknown angle.\n\nFor a triangle with two known angles:\n[\\angle 1 + \\angle 2 + \\angle 3 = 180°]\n\n### Step 3: Find Each Numbered Angle\n\nRepeat the process for each numbered angle in the given diagrams, using subtraction when two angles are known or using the exterior angle relationship when applicable.",
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
            markdown:
              "## Example 2 — Solve for Angle Measures Using Algebra\n\nWrite and solve equations based on angle relationships in triangles and real-world contexts.\n\n### Step 1: Translate the Diagram into an Equation\n\nWhen angles are expressed in terms of a variable, use the Triangle Angle-Sum Theorem to write an equation.\n\nFor angles expressed as [(7x - 7)°], [(4x + 2)°], and [(2x + 6)°]:\n[(7x - 7) + (4x + 2) + (2x + 6) = 180]\n\n### Step 2: Solve for the Variable\n\nCombine like terms and isolate the variable.\n[13x + 1 = 180]\n[13x = 179]\n[x = 13.769...]\n\n### Step 3: Substitute Back to Find the Angle Measure\n\nOnce [x] is known, substitute into the expression for the desired angle.\n\n### Step 4: Apply to Real-World Contexts\n\nFor a gardening problem with grow light angles [(8x)°] and [(7x - 4)°], use the same approach. Recognize that the two angles with the light beam form a triangle with the ground, and apply the Triangle Angle-Sum Theorem or complementary relationship as appropriate.",
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
            markdown:
              "## Example 3 — Use the Exterior Angle Theorem\n\nFind unknown angles in diagrams involving exterior angles of triangles.\n\n### Step 1: Identify Exterior and Remote Interior Angles\n\nLocate the exterior angle and its two remote interior angles in the diagram.\n\n### Step 2: Apply the Exterior Angle Theorem\n\nSet up an equation showing that the exterior angle equals the sum of the remote interior angles.\n[m\\angle \\text{exterior} = m\\angle \\text{remote}_1 + m\\angle \\text{remote}_2]\n\n### Step 3: Solve for the Unknown Angle\n\nUse the equation to find each numbered angle in the diagram. For multiple unknowns, set up a system of equations using both the Exterior Angle Theorem and the Triangle Angle-Sum Theorem.",
          },
        },
      ],
    },
    {
      phaseNumber: 7,
      title: "Independent Practice",
      phaseType: "independent_practice" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Mixed Exercises\n\nThe mixed exercises section provides comprehensive practice with angles of triangles, including:\n\n- Finding the value of [x] and the measure of each angle in triangles with algebraic expressions.\n- Constructing arguments about whether a statement is true or false, and providing counterexamples or proofs.\n- Writing flow proofs and paragraph proofs for corollaries of the Triangle Angle-Sum Theorem.\n- Solving multi-step algebraic problems involving angle relationships in triangles.\n- Classifying triangles by their angles and justifying the classification.\n- Writing inequalities to describe possible angle measures.\n- Applying angle relationships to real-world contexts such as automobiles, basketball, bridge construction, and architecture.\n- Using tools like tracing paper to verify the Triangle Angle-Sum Theorem.\n- Analyzing whether a triangle can be classified when given information about an exterior angle.\n- Finding multiple unknown angle values in complex diagrams.\n- Creating and measuring triangles to confirm theoretical results.\n\n## Review Notes\n\n- Images referenced in the worksheet (triangle diagrams for Examples 1, 2, and 3, tower strut diagram, grow light diagram, automobile hood diagram, Pratt Truss bridge diagram, Flatiron Building diagram) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and measurements.",
          },
        },
      ],
    },
  ];
}

function getLesson2Phases() {
  return [
    {
      phaseNumber: 1,
      title: "Explore",
      phaseType: "explore" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Explore: How Do We Know Two Polygons Match Exactly?\n\nStudents examine pairs of polygons and consider what it means for two shapes to be exactly the same. Inquiry focuses on whether matching all sides and angles is sufficient to guarantee congruence.\n\nInquiry Question:\nIf two polygons have the same side lengths and angle measures, what else must be true about how their vertices correspond?",
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
              "## Vocabulary\n\n- **Congruent** — Having the same size and shape; corresponding parts are equal.\n- **Corresponding Parts** — Matching sides or angles of two congruent polygons that are in the same relative position.\n- **Congruence Statement** — A statement that identifies the corresponding vertices of two congruent polygons in matching order.\n- **Two-Column Proof** — A structured proof with statements in one column and reasons in a second column.\n- **Paragraph Proof** — A proof written in complete sentences that explains the logical steps and reasons.\n- **Bisect** — To divide into two congruent parts.",
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
              "## Learn: Congruent Polygons and Corresponding Parts\n\nTwo polygons are congruent if and only if their corresponding sides and corresponding angles are congruent. The order of vertices in a congruence statement matters because it identifies which parts correspond.\n\n### Key Concept: Corresponding Parts of Congruent Polygons\n\n- In a congruence statement such as [polygon ABCD ≅ polygon PQRS], vertex [A] corresponds to [P], [B] to [Q], [C] to [R], and [D] to [S].\n- Corresponding sides are congruent: [\\overline{AB} ≅ \\overline{PQ}], [\\overline{BC} ≅ \\overline{QR}], and so on.\n- Corresponding angles are congruent: [\\angle A ≅ \\angle P], [\\angle B ≅ \\angle Q], and so on.\n\n### Key Concept: Using Congruence to Find Unknown Values\n\n- If two figures are congruent, set corresponding expressions equal to each other and solve.\n- If [\\overline{AC} ≅ \\overline{DF}], then the lengths are equal: [AC = DF].\n- If [\\angle BAC ≅ \\angle EDF], then the measures are equal: [m\\angle BAC = m\\angle EDF].",
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
            markdown:
              "## Example 1 — Identify Congruent Corresponding Parts and Write a Congruence Statement\n\nGiven pairs of polygons shown in diagrams, identify all pairs of congruent corresponding sides and angles, then write a valid congruence statement.\n\n### Step 1: Match Vertices by Position\n\nExamine the diagrams to determine which vertices correspond based on markings, orientation, or given information.\n\nFor a pair of triangles:\n[\\triangle ABC ≅ \\triangle DEF]\n\nThis means:\n[\\overline{AB} ≅ \\overline{DE}, \\quad \\overline{BC} ≅ \\overline{EF}, \\quad \\overline{AC} ≅ \\overline{DF}]\n[\\angle A ≅ \\angle D, \\quad \\angle B ≅ \\angle E, \\quad \\angle C ≅ \\angle F]\n\n\nFor a pair of quadrilaterals:\n[polygon ABCD ≅ polygon QRST]\n\nThis means:\n[\\overline{AB} ≅ \\overline{QR}, \\quad \\overline{BC} ≅ \\overline{RS}, \\quad \\overline{CD} ≅ \\overline{ST}, \\quad \\overline{DA} ≅ \\overline{TQ}]\n[\\angle A ≅ \\angle Q, \\quad \\angle B ≅ \\angle R, \\quad \\angle C ≅ \\angle S, \\quad \\angle D ≅ \\angle T]\n\n### Step 2: Verify the Congruence Statement\n\nCheck that every pair of corresponding sides and angles is accounted for and that the vertex order correctly reflects the correspondence.",
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
            markdown:
              "## Example 2 — Find Unknown Values Using Congruence\n\nUse given congruence statements to set up equations and solve for unknown variables in diagrams.\n\n### Step 1: Set Up Equations from Corresponding Sides\n\nWhen [\\triangle ABC ≅ \\triangle FDE], match corresponding sides to find [x] and [y].\n\nIf [\\overline{AB}] corresponds to [\\overline{FD}] and expressions are given:\n[AB = FD]\n\nIf [\\overline{BC}] corresponds to [\\overline{DE}]:\n[BC = DE]\n\nFor a quadrilateral where [polygon ABCD ≅ polygon PQRS]:\n[AB = PQ, \\quad BC = QR, \\quad CD = RS, \\quad DA = SP]\n\nSubstitute given expressions and solve:\n[3x - 5 = 2x + 7 \\implies x = 12]\n\n### Step 2: Set Up Equations from Corresponding Angles\n\nMatch corresponding angle measures:\n[m\\angle A = m\\angle D]\n\nIf expressions involve [y]:\n[2y + 10 = 5y - 8 \\implies 18 = 3y \\implies y = 6]\n\n### Step 3: Check Solutions\n\nSubstitute the found values back into the original expressions to confirm that all corresponding parts are indeed congruent.",
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
            markdown:
              "## Example 3 — Apply Congruent Triangles to Real-World Problems\n\nUse properties of congruent triangles to find unknown angle measures in design and construction contexts.\n\n### Step 1: Identify the Congruent Parts in Context\n\nIn a design problem where two triangles share a congruent angle relationship:\n[\\angle ACB ≅ \\angle DEB]\n\nSince corresponding angles of congruent triangles are congruent, the measure of one angle equals the measure of its corresponding angle.\n\n### Step 2: Use the Triangle Angle Sum\n\nWhen two angles of a triangle are known, find the third:\n[m\\angle ACB = 180° - m\\angle ABC - m\\angle BAC]\n[m\\angle ACB = 180° - 35° - 29° = 116°]\n\nTherefore:\n[m\\angle DEB = m\\angle ACB = 116°]\n\n### Step 3: Apply to Carpentry and Structural Supports\n\nIn a support structure with congruent angles:\n[\\angle PRQ ≅ \\angle TVU]\n\nUsing the triangle angle sum in the first triangle to find the unknown angle, then equate to its corresponding angle in the congruent triangle:\n[m\\angle TVU = m\\angle PRQ = 180° - m\\angle RPQ - m\\angle RQP]",
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
              "## Example 4 — Write Proofs of Triangle Congruence\n\nWrite formal proofs to demonstrate that two triangles are congruent using given information about sides and angles.\n\n### Step 1: Write a Two-Column Proof\n\nOrganize the proof with statements and reasons.\n\n**Given:** [\\overline{AB} ≅ \\overline{CB}], [\\overline{AD} ≅ \\overline{CD}], [\\angle BAD ≅ \\angle BCD], [\\overline{BD}] bisects [\\angle ABC]\n\n**Prove:** [\\triangle ABD ≅ \\triangle CBD]\n\n\n| Statements | Reasons |\n|---|---|\n| [\\overline{AB} ≅ \\overline{CB}] | Given |\n| [\\overline{AD} ≅ \\overline{CD}] | Given |\n| [\\angle BAD ≅ \\angle BCD] | Given |\n| [\\overline{BD}] bisects [\\angle ABC] | Given |\n| [\\angle ABD ≅ \\angle CBD] | Definition of angle bisector |\n| [\\triangle ABD ≅ \\triangle CBD] | SAS Congruence Postulate |\n\n### Step 2: Write Another Two-Column Proof Using Different Given Information\n\n**Given:** [\\overline{AB} ≅ \\overline{CB}], [\\overline{AD} ≅ \\overline{CD}], [\\angle ABD ≅ \\angle CBD], [\\angle ADB ≅ \\angle CDB]\n\n**Prove:** [\\triangle ABD ≅ \\triangle CBD]\n\n| Statements | Reasons |\n|---|---|\n| [\\overline{AB} ≅ \\overline{CB}] | Given |\n| [\\overline{AD} ≅ \\overline{CD}] | Given |\n| [\\angle ABD ≅ \\angle CBD] | Given |\n| [\\angle ADB ≅ \\angle CDB] | Given |\n| [\\overline{BD} ≅ \\overline{BD}] | Reflexive Property |\n| [\\triangle ABD ≅ \\triangle CBD] | ASA or AAS Congruence Theorem |\n\n### Step 3: Write a Two-Column Proof with Segment Bisector\n\n**Given:** [\\angle A ≅ \\angle C], [\\angle D ≅ \\angle B], [\\overline{AD} ≅ \\overline{CB}], [\\overline{AE} ≅ \\overline{CE}], [\\overline{AC}] bisects [\\overline{BD}]\n\n\n**Prove:** [\\triangle AED ≅ \\triangle CEB]\n\n| Statements | Reasons |\n|---|---|\n| [\\angle A ≅ \\angle C] | Given |\n| [\\angle D ≅ \\angle B] | Given |\n| [\\overline{AD} ≅ \\overline{CB}] | Given |\n| [\\overline{AC}] bisects [\\overline{BD}] | Given |\n| [\\overline{DE} ≅ \\overline{BE}] | Definition of segment bisector |\n| [\\triangle AED ≅ \\triangle CEB] | ASA or SAS Congruence Theorem |\n\n### Step 4: Write a Paragraph Proof\n\n**Given:** [\\overline{BD}] bisects [\\angle ABC] and [\\angle ADC], [\\overline{AB} ≅ \\overline{CB}], [\\overline{AD} ≅ \\overline{CD}]\n\n**Prove:** [\\triangle ABD ≅ \\triangle CBD]\n\n\nSince [\\overline{BD}] bisects [\\angle ABC], we know that [\\angle ABD ≅ \\angle CBD] by the definition of an angle bisector. Similarly, since [\\overline{BD}] bisects [\\angle ADC], we know that [\\angle ADB ≅ \\angle CDB]. We are given that [\\overline{AB} ≅ \\overline{CB}] and [\\overline{AD} ≅ \\overline{CD}]. Therefore, by the SAS Congruence Postulate applied to two pairs of sides and the included angle, [\\triangle ABD ≅ \\triangle CBD].",
          },
        },
      ],
    },
    {
      phaseNumber: 8,
      title: "Independent Practice",
      phaseType: "independent_practice" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: identifying corresponding parts, writing congruence statements, finding unknown values, applying congruence to real-world situations, and writing proofs. Problems include:\n\n- Identifying the geometric property that guarantees congruent stamped designs.\n- Drawing and labeling figures for congruent triangles and solving for [x] and [y] using corresponding side and angle relationships.\n- Using the triangle angle sum and congruent angle relationships to find missing angle measures.\n- Analyzing the Sierpinski triangle to count congruent equilateral triangles.\n- Identifying congruent triangles in a logo design and naming their corresponding congruent angles and sides.\n- Applying congruent triangle relationships to map distances and angle measures.\n- Completing a two-column proof of the Third Angles Theorem by supplying reasons for each statement.\n- Analyzing whether equilateral triangles are always, sometimes, or never congruent and justifying the argument.\n- Creating critical questions about extending the Third Angles Theorem to quadrilaterals.\n- Finding and correcting errors in student claims about congruence statements for triangles.\n- Justifying why vertex order matters when naming congruent triangles.\n- Finding values of [x] and [y] when two triangles sharing a common side are congruent.\n\n## Review Notes\n\n- Images referenced in the worksheet (diagrams of polygons for corresponding parts, congruent triangles with variable expressions, cell phone case design, carpentry table supports, two-column proof diagrams, Sierpinski triangle, logo designs, map triangles, Third Angles Theorem proof diagram, triangle with labeled vertices for error analysis, and triangles sharing a common side) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams, markings, and values.",
          },
        },
      ],
    },
  ];
}

function getLesson3Phases() {
  return [
    {
      phaseNumber: 1,
      title: "Explore",
      phaseType: "explore" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Explore: How Much Information Is Needed to Prove Two Triangles Congruent?\n\nStudents investigate what minimum set of corresponding parts guarantees that two triangles are congruent. They explore whether three sides, two sides and an angle, or other combinations are sufficient.\n\nInquiry Question:\nWhat combinations of corresponding sides and angles are enough to prove that two triangles are congruent?",
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
              "## Vocabulary\n\n- **Side-Side-Side (SSS) Congruence Postulate** — If three sides of one triangle are congruent to three sides of another triangle, then the triangles are congruent.\n- **Side-Angle-Side (SAS) Congruence Postulate** — If two sides and the included angle of one triangle are congruent to two sides and the included angle of another triangle, then the triangles are congruent.\n- **Included Angle** — The angle formed by two adjacent sides of a triangle.\n- **Two-Column Proof** — A proof formatted with statements in one column and reasons in another.\n- **Paragraph Proof** — A proof written in complete sentences as a paragraph.\n- **Flow Proof** — A proof that uses arrows to show the logical flow from given information to the conclusion.\n- **Reflexive Property** — A quantity is congruent to itself.\n- **Definition of Midpoint** — A midpoint divides a segment into two congruent segments.",
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
              "## Learn: Triangle Congruence Using SSS and SAS\n\nTwo triangles can be proven congruent without showing that all six corresponding parts are congruent. The SSS and SAS postulates provide shortcuts.\n\n### Key Concept: SSS Congruence Postulate\n\nIf three sides of one triangle are congruent to three sides of a second triangle, then the two triangles are congruent.\n\n### Key Concept: SAS Congruence Postulate\n\nIf two sides and the included angle of one triangle are congruent to two sides and the included angle of a second triangle, then the two triangles are congruent.\n\n### Key Concept: Using the Distance Formula on the Coordinate Plane\n\nTo verify SSS on a coordinate plane, calculate the lengths of all three sides of each triangle using the Distance Formula and compare corresponding side lengths.\n[d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}]",
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
            markdown:
              "## Example 1 — Write Proofs Using the SSS Postulate\n\nWrite two-column, paragraph, and flow proofs to establish triangle congruence when three pairs of corresponding sides are given as congruent.\n\n### Step 1: State the Given Information\n\nIdentify the three pairs of congruent sides provided. State the triangles to be proven congruent.\n\n\nFor example, given:\n[\\overline{AB} \\cong \\overline{XY}, \\overline{AC} \\cong \\overline{XZ}, \\overline{BC} \\cong \\overline{YZ}]\n\nProve:\n[\\triangle ABC \\cong \\triangle XYZ]\n\n\n### Step 2: Apply the SSS Postulate\n\nSince all three pairs of corresponding sides are congruent, conclude that the triangles are congruent by SSS. Structure the proof in the requested format.\n\n\nA two-column proof format:\n[\\begin{array}{l|l}\n\\text{Statements} & \\text{Reasons} \\\\\\n\\hline\n\\overline{AB} \\cong \\overline{XY} & \\text{Given} \\\\\n\\overline{AC} \\cong \\overline{XZ} & \\text{Given} \\\\\n\\overline{BC} \\cong \\overline{YZ} & \\text{Given} \\\\\n\\triangle ABC \\cong \\triangle XYZ & \\text{SSS Congruence Postulate}\n\\end{array}]\n\n### Step 3: Use Midpoints and Shared Sides\n\nWhen a midpoint is given, use the Definition of Midpoint to establish a pair of congruent segments. A shared side between two triangles is congruent to itself by the Reflexive Property.\n\nGiven that D is the midpoint of [\\overline{AC}]:\n[\\overline{AD} \\cong \\overline{CD}]\n\n\nThis provides the third pair of congruent sides needed for SSS.",
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
            markdown:
              "## Example 2 — Determine Triangle Congruence on the Coordinate Plane\n\nUse the Distance Formula to calculate side lengths of two triangles on the coordinate plane, then compare lengths to determine congruence by SSS.\n\n\n### Step 1: Apply the Distance Formula\n\nCalculate the lengths of all three sides of each triangle.\n\nFor example, with vertices D(-6, 1), E(1, 2), F(-1, -4):\n[DE = \\sqrt{(1 - (-6))^2 + (2 - 1)^2} = \\sqrt{49 + 1} = \\sqrt{50}]\n[EF = \\sqrt{(-1 - 1)^2 + (-4 - 2)^2} = \\sqrt{4 + 36} = \\sqrt{40}]\n[DF = \\sqrt{(-1 - (-6))^2 + (-4 - 1)^2} = \\sqrt{25 + 25} = \\sqrt{50}]\n\nSimilarly compute all three side lengths for the second triangle.\n\n### Step 2: Compare Corresponding Sides\n\nList the three side lengths of each triangle and check whether corresponding lengths are equal.\n\n\n### Step 3: Draw a Conclusion\n\nIf all three pairs of corresponding sides are equal, the triangles are congruent by SSS. If any pair differs, the triangles are not congruent.",
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
            markdown:
              "## Example 3 — Write Proofs Using the SAS Postulate\n\nWrite two-column, paragraph, and flow proofs to establish triangle congruence when two pairs of corresponding sides and the included angle are known to be congruent.\n\n\n### Step 1: Identify the Included Angle\n\nDetermine which angle is formed by the two given congruent sides. This included angle is required for SAS.\n\n### Step 2: Apply the SAS Postulate\n\nState the pairs of congruent sides and the included congruent angle, then conclude the triangles are congruent by SAS.\n\nFor example, given:\n[\\overline{NP} \\cong \\overline{MP}, \\angle NPL \\cong \\angle MPL]\n\n\nWith shared side:\n[\\overline{PL} \\cong \\overline{PL} \\quad \\text{by the Reflexive Property}]\n\n\nProve:\n[\\triangle NPL \\cong \\triangle MPL]\n\n### Step 3: Use Properties of Parallel Lines and Midpoints\n\nWhen parallel lines are given, use Alternate Interior Angles to establish a pair of congruent angles. When a midpoint is given, use the Definition of Midpoint to establish congruent sides.\n\n\nGiven [\\overline{AB} \\parallel \\overline{CD}] with transversal [\\overline{AC}]:\n[\\angle CAB \\cong \\angle DCA]\n\nThis provides the included angle needed for SAS when combined with congruent sides.",
          },
        },
      ],
    },
    {
      phaseNumber: 7,
      title: "Independent Practice",
      phaseType: "independent_practice" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: writing SSS and SAS proofs, determining congruence from coordinates, analyzing diagrams for sufficient information, and applying congruence to real-world contexts. Problems include:\n\n- Writing two-column, paragraph, and flow proofs using SSS and SAS with given side and angle congruences.\n- Using the Distance Formula to verify whether triangles on the coordinate plane are congruent.\n- Examining figures to determine whether there is enough information to prove triangle congruence using SSS or SAS.\n- Reasoning about whether three given side lengths can form two non-congruent triangles.\n- Identifying which congruence postulate applies in real-world contexts such as baking, tiling, construction, and gaming.\n- Determining whether two pieces of an isosceles triangle divided by a specific cut are congruent.\n- Analyzing whether a given pair of triangles can be proven congruent and explaining why or why not.\n- Finding errors in student reasoning about SAS congruence.\n- Using multiple methods to prove triangle congruence on a coordinate grid and comparing efficiency.\n- Constructing arguments about whether a statement involving isosceles triangles is true or false.\n- Determining whether two right triangles with two pairs of congruent corresponding sides are necessarily congruent.\n- Creating a congruent triangle using construction and justifying the result mathematically.\n\n## Review Notes\n\n- Images referenced in the worksheet (geometric diagrams for proof problems in Examples 1 and 3, coordinate plane figures for Example 2, house roof diagram for problem 15, hourglass icon for problem 16, various triangle diagrams for mixed exercises problems 17-20 and 27, cake diagram for problem 24, tower diagram for problem 26, and graph for problem 32) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and visual information.",
          },
        },
      ],
    },
  ];
}

function getLesson4Phases() {
  return [
    {
      phaseNumber: 1,
      title: "Explore",
      phaseType: "explore" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Explore: How Can Two Angles and a Side Prove Triangles Congruent?\n\nStudents investigate whether knowing two angles and a side is sufficient to guarantee that two triangles are congruent. They compare cases where the side is included between the angles versus when it is not.\n\nInquiry Question:\nIf two triangles have two pairs of congruent corresponding angles and one pair of congruent corresponding sides, is that always enough to prove the triangles congruent? Does it matter whether the side is between the angles?",
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
              "## Vocabulary\n\n- **Angle-Side-Angle (ASA) Congruence Postulate** — If two angles and the included side of one triangle are congruent to two angles and the included side of another triangle, then the triangles are congruent.\n- **Angle-Angle-Side (AAS) Congruence Theorem** — If two angles and a non-included side of one triangle are congruent to two angles and the corresponding non-included side of another triangle, then the triangles are congruent.\n- **Included Side** — The side between two angles of a triangle.\n- **Non-Included Side** — A side that is not between the two given angles.\n- **Two-Column Proof** — A proof formatted with statements in one column and reasons in another.\n- **Paragraph Proof** — A proof written in complete sentences as a paragraph.\n- **Flow Proof** — A proof that uses arrows to show the logical flow from given information to the conclusion.\n- **Reflexive Property** — A quantity is congruent to itself.\n- **Definition of Midpoint** — A midpoint divides a segment into two congruent segments.\n- **Definition of Angle Bisector** — A ray that divides an angle into two congruent angles.\n- **Alternate Interior Angles** — Angles formed when a transversal intersects two parallel lines; they are congruent when the lines are parallel.",
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
              "## Learn: Triangle Congruence Using ASA and AAS\n\nThe ASA and AAS criteria provide shortcuts for proving triangle congruence when angle and side information is known. Understanding whether the side is included or not determines which postulate or theorem to use.\n\n### Key Concept: ASA Congruence Postulate\n\nIf two angles and the included side of one triangle are congruent to two angles and the included side of a second triangle, then the two triangles are congruent.\n\n### Key Concept: AAS Congruence Theorem\n\nIf two angles and a non-included side of one triangle are congruent to two angles and the corresponding non-included side of a second triangle, then the triangles are congruent.\n\n### Key Concept: Using Parallel Lines and Transversals\n\nWhen parallel lines are cut by a transversal, alternate interior angles are congruent. This relationship is often used to establish one of the angle pairs needed for ASA or AAS.\n\nGiven [\\overline{AB} \\parallel \\overline{CD}] with transversal [\\overline{AC}]:\n[\\angle BAC \\cong \\angle DCA]\n\n### Key Concept: Using Midpoints and Angle Bisectors\n\nA midpoint divides a segment into two congruent segments, providing a pair of congruent sides. An angle bisector divides an angle into two congruent angles, providing a pair of congruent angles.",
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
            markdown:
              "## Example 1 — Write Proofs Using ASA and AAS\n\nWrite two-column, paragraph, and flow proofs to establish triangle congruence using the ASA Postulate and AAS Theorem. Problems involve parallel lines, midpoints, angle bisectors, and shared sides.\n\n### Step 1: Identify the Given Information\n\nExtract all givens from the problem statement, including parallel segments, congruent angles, congruent sides, midpoints, and bisectors. Identify the triangles to be proven congruent.\n\n\n### Step 2: Find the Missing Congruent Parts\n\nUse geometric properties to deduce additional congruent parts:\n\n- Alternate Interior Angles from parallel lines:\n[\\angle CBD \\cong \\angle ADB]\n\n- Reflexive Property for a shared side:\n[\\overline{BD} \\cong \\overline{BD}]\n\n\n- Definition of Midpoint:\n[\\overline{ST} \\cong \\overline{VT}]\n\n- Definition of Angle Bisector:\n[\\angle ABD \\cong \\angle CBD]\n\n### Step 3: Apply ASA or AAS\n\nOnce two angles and the included side (ASA) or two angles and a non-included side (AAS) are established, state the triangles are congruent.\n\n\nFor ASA:\n[\\angle A \\cong \\angle C, \\quad \\overline{AB} \\cong \\overline{CB}, \\quad \\angle ABD \\cong \\angle CBD]\n[\\triangle ABD \\cong \\triangle CBD \\quad \\text{by ASA}]\n\n\nFor AAS:\n[\\angle S \\cong \\angle V, \\quad \\angle STR \\cong \\angle VTU, \\quad \\overline{ST} \\cong \\overline{VT}]\n[\\triangle RTS \\cong \\triangle UTV \\quad \\text{by AAS}]\n\n### Step 4: Prove Corresponding Parts Congruent (CPCTC)\n\n\nWhen the goal is to prove a segment or angle congruent rather than the triangles themselves, first prove the triangles congruent by ASA or AAS, then apply CPCTC.\n\n[\\triangle ECB \\cong \\triangle ECD \\quad \\text{by ASA}]\n[\\overline{AD} \\cong \\overline{CD} \\quad \\text{by CPCTC}]",
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
            markdown:
              "## Example 2 — Apply ASA and AAS to Real-World Problems\n\nUse the ASA and AAS congruence criteria to analyze real-world situations involving right triangles, architectural designs, and bridge trusses. Calculate areas, perimeters, and material requirements after establishing congruence.\n\n### Step 1: Determine Whether Triangles Are Congruent\n\nAnalyze the given information to identify two pairs of congruent angles and a pair of congruent sides. Determine whether ASA or AAS applies.\n\nFor two right triangles with a [20°] angle and equal length between the [90°] and [20°] angles:\n[\\text{Angle} = 90°, \\quad \\text{Included Side} \\cong \\text{Included Side}, \\quad \\text{Angle} = 20°]\n[\\triangle_1 \\cong \\triangle_2 \\quad \\text{by ASA}]\n\n### Step 2: Calculate Combined Area\n\nOnce congruence is established, corresponding dimensions are equal. Use the triangle area formula with given dimensions.\n\nFor a triangle with height [h = 2] inches and base [x = 5] inches:\n[A = \\frac{1}{2}bh = \\frac{1}{2}(5)(2) = 5 \\text{ in}^2]\n\nCombined area for two congruent triangles:\n[2 \\times 5 = 10 \\text{ in}^2]\n\n### Step 3: Prove Congruence in Architectural Designs\n\nUse given angle congruences and shared sides in a stained-glass window design to prove triangle congruence by ASA, then calculate the total glass area needed.\n\nGiven [\\angle ABC \\cong \\angle DCB] and [\\angle ACB \\cong \\angle DBC] with shared side [\\overline{BC}]:\n[\\triangle BCA \\cong \\triangle CBD \\quad \\text{by ASA}]\n\nArea calculation using base [CD = 3.5] meters and height [1.4] meters:\n[A = \\frac{1}{2}(3.5)(1.4) = 2.45 \\text{ m}^2]\n\n\nTotal for two congruent triangles:\n[2 \\times 2.45 = 4.9 \\text{ m}^2]\n\n### Step 4: Apply to Bridge Engineering\n\nUse parallel line properties to confirm congruent angles, then apply ASA or AAS to prove triangle congruence in bridge truss analysis. Calculate perimeters of composite figures.\n\nGiven [\\overline{AC} \\parallel \\overline{BK}], [\\overline{CB} \\parallel \\overline{KM}], and [B] is the midpoint of [\\overline{AM}]:\n[\\angle CAB \\cong \\angle KBM \\quad \\text{(corresponding angles)}]\n[\\angle ACB \\cong \\angle BKM \\quad \\text{(corresponding angles)}]\n[\\overline{AB} \\cong \\overline{BM} \\quad \\text{(Definition of Midpoint)}]\n[\\triangle ABC \\cong \\triangle BMK \\quad \\text{by AAS}]\n\n\nFor an equilateral triangle with side [AB = 18.5] feet, the perimeter of quadrilateral [ACKB] is:\n[AC + CK + KB + BA = 18.5 + 18.5 + 18.5 + 18.5 = 74 \\text{ ft}]",
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
            markdown:
              "## Example 3 — Write Advanced Proofs Using ASA and AAS\n\nWrite flow proofs, paragraph proofs, and two-column proofs involving more complex diagrams. Problems require using parallel lines, midpoints, and shared sides to establish the angle-angle-side or angle-side-angle relationships.\n\n### Step 1: Use Given Congruent Sides and Angles\n\nIdentify the directly given information: congruent segments, congruent angles, parallel lines, midpoints, and bisectors.\n\n\nGiven [\\overline{JK} \\cong \\overline{MK}] and [\\angle N \\cong \\angle L]:\n[\\angle JKN \\cong \\angle MKL \\quad \\text{(Vertical Angles)}]\n[\\triangle JKN \\cong \\triangle MKL \\quad \\text{by AAS}]\n\n### Step 2: Use Parallel Lines to Establish Angle Congruence\n\nWhen parallel lines are given, use alternate interior angles or corresponding angles to find a second pair of congruent angles.\n\n\nGiven [\\overline{DE} \\parallel \\overline{FG}] and [\\angle E \\cong \\angle G]:\n[\\angle DFE \\cong \\angle FEG \\quad \\text{(Alternate Interior Angles)}]\n[\\overline{FE} \\cong \\overline{EF} \\quad \\text{(Reflexive Property)}]\n[\\triangle DFG \\cong \\triangle FDE \\quad \\text{by AAS}]\n\n### Step 3: Use Midpoints and Parallel Lines Together\n\nWhen a midpoint and parallel lines are both given, combine the Definition of Midpoint with Alternate Interior Angles to establish the parts needed for ASA or AAS.\n\n\nGiven [V] is the midpoint of [\\overline{YW}] and [\\overline{UY} \\parallel \\overline{XW}]:\n[\\overline{YV} \\cong \\overline{WV} \\quad \\text{(Definition of Midpoint)}]\n[\\angle UYV \\cong \\angle XWV \\quad \\text{(Alternate Interior Angles)}]\n[\\angle UVY \\cong \\angle XVW \\quad \\text{(Vertical Angles)}]\n[\\triangle UVY \\cong \\triangle XVW \\quad \\text{by ASA}]\n\n### Step 4: Use Congruent and Parallel Segments\n\nWhen two segments are both congruent and parallel, use the parallel property for angles and the congruent property for sides.\n\n\nGiven [\\overline{MS} \\cong \\overline{RQ}] and [\\overline{MS} \\parallel \\overline{RQ}]:\n[\\angle MSP \\cong \\angle RQP \\quad \\text{(Alternate Interior Angles)}]\n[\\angle MPS \\cong \\angle RPQ \\quad \\text{(Vertical Angles)}]\n[\\triangle MSP \\cong \\triangle RQP \\quad \\text{by AAS}]",
          },
        },
      ],
    },
    {
      phaseNumber: 7,
      title: "Independent Practice",
      phaseType: "independent_practice" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: writing ASA and AAS proofs, applying congruence to real-world contexts, constructing congruent triangles, analyzing errors, and reasoning about triangle congruence criteria. Problems include:\n\n- Using a compass and straightedge to construct a triangle congruent to a given triangle using the ASA Congruence Postulate.\n- Reasoning about whether two right triangles with a shared acute angle measure and equal included side are congruent, and calculating combined area.\n- Proving triangle congruence in an architectural stained-glass window design and calculating the amount of glass needed.\n- Using properties of parallel lines and midpoints to prove triangle congruence in bridge trusses and calculating perimeters.\n- Writing two-column, paragraph, and flow proofs using ASA and AAS with various combinations of given information.\n- Determining whether two people walking triangular paths in different cities formed congruent triangles, given specific angle measures and side lengths.\n- Using estimation and congruent triangles to estimate the distance across a river by sighting along a walking stick.\n- Writing a paragraph proof involving an angle bisector to show that two segments are congruent.\n- Finding a counterexample to demonstrate why SSA (Side-Side-Angle) cannot be used as a congruence criterion.\n- Identifying errors in student reasoning about triangle congruence proofs.\n- Drawing and labeling two triangles that could be proved congruent by ASA.\n- Explaining how to choose among SSS, SAS, ASA, AAS, and HL when proving triangle congruence.\n- Writing a flow proof using information from a diagram to show triangle congruence.\n\n## Review Notes\n\n- Images referenced in the worksheet (geometric diagrams for proof problems in Examples 1 and 3, doorstop cross-section diagrams for problem 7, stained-glass window diagram for problem 8, bridge truss diagram for problem 9, various triangle diagrams for problems 10-11 and 12-15, construction diagram for problem 16, river estimation diagram for problem 18, angle bisector diagram for problem 19, SSA counterexample diagram for problem 20, error analysis diagram for problem 21, and flow proof diagram for problem 24) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams, markings, and measurements.",
          },
        },
      ],
    },
  ];
}

function getLesson5Phases() {
  return [
    {
      phaseNumber: 1,
      title: "Explore",
      phaseType: "explore" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Explore: Are Right Triangles Easier to Prove Congruent?\n\nStudents examine pairs of right triangles and consider whether knowing one angle is 90° reduces the amount of other information needed to prove congruence. Inquiry focuses on which combinations of hypotenuse and leg information are sufficient.\n\n\nInquiry Question:\nWhy do right triangles have their own set of congruence theorems instead of just using SSS, SAS, ASA, and AAS?",
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
              "## Vocabulary\n\n- **Right Triangle Congruence Theorems** — Special shortcuts for proving two right triangles congruent: LL, HA, LA, and HL.\n- **Leg-Leg (LL) Congruence Theorem** — If the legs of one right triangle are congruent to the corresponding legs of another right triangle, then the triangles are congruent. (Equivalent to SAS.)\n- **Hypotenuse-Angle (HA) Congruence Theorem** — If the hypotenuse and an acute angle of one right triangle are congruent to the hypotenuse and corresponding acute angle of another right triangle, then the triangles are congruent. (Equivalent to AAS.)\n- **Leg-Angle (LA) Congruence Theorem** — If one leg and an acute angle of one right triangle are congruent to the corresponding leg and acute angle of another right triangle, then the triangles are congruent. (Equivalent to ASA or AAS.)\n- **Hypotenuse-Leg (HL) Congruence Theorem** — If the hypotenuse and a leg of one right triangle are congruent to the hypotenuse and corresponding leg of another, then the triangles are congruent.\n- **Hypotenuse** — The side opposite the right angle in a right triangle; it is the longest side.\n- **Leg** — Either of the two sides that form the right angle in a right triangle.\n- **Two-Column Proof** — A structured proof with statements in one column and reasons in a second column.\n- **Paragraph Proof** — A proof written in complete sentences as a paragraph.\n- **Reflexive Property** — A quantity is congruent to itself.\n- **Definition of Midpoint** — A midpoint divides a segment into two congruent segments.\n- **Definition of Perpendicular Lines** — Perpendicular lines intersect to form right angles.",
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
              "## Learn: Proving Right Triangles Congruent\n\nBecause all right triangles contain a 90° angle, we can use special theorems that require fewer corresponding parts than the general triangle congruence postulates.\n\n### Key Concept: Right Triangle Congruence Theorems\n\n- **LL (Leg-Leg):** If two legs of one right triangle are congruent to two legs of another right triangle, the triangles are congruent.\n- **HA (Hypotenuse-Angle):** If the hypotenuse and an acute angle of one right triangle are congruent to the hypotenuse and corresponding acute angle of another, the triangles are congruent.\n- **LA (Leg-Angle):** If one leg and an acute angle of one right triangle are congruent to the corresponding leg and acute angle of another, the triangles are congruent.\n- **HL (Hypotenuse-Leg):** If the hypotenuse and a leg of one right triangle are congruent to the hypotenuse and corresponding leg of another, the triangles are congruent.\n\n### Key Concept: Using the Right Angle\n\nThe right angle in each triangle is always congruent to the right angle in the other because all right angles measure 90°. This gives a guaranteed pair of congruent angles without additional given information.",
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
            markdown:
              "## Example 1 — Write Two-Column Proofs for Right Triangle Congruence\n\nWrite two-column proofs to prove pairs of right triangles congruent in real-world contexts involving perpendicular lines, midpoints, parallel lines, and congruent segments.\n\n### Step 1: Prove Two Right Triangles Congruent Using Perpendicularity and a Midpoint\n\nGiven a perpendicular segment and a midpoint, establish right angles and congruent segments, then apply the appropriate right triangle congruence theorem.\n\n**Given:** [\\overline{XZ} \\perp \\overline{WY}]; [Z] is the midpoint of [\\overline{WY}].\n\n**Prove:** [\\triangle WXZ \\cong \\triangle YXZ]\n\nA two-column proof:\n\n| Statements | Reasons |\n|---|---|\n| [\\overline{XZ} \\perp \\overline{WY}] | Given |\n| [\\angle WZX] and [\\angle YZX] are right angles | Definition of perpendicular lines |\n| [\\triangle WXZ] and [\\triangle YXZ] are right triangles | Definition of right triangle |\n| [Z] is the midpoint of [\\overline{WY}] | Given |\n| [\\overline{WZ} \\cong \\overline{YZ}] | Definition of midpoint |\n| [\\overline{XZ} \\cong \\overline{XZ}] | Reflexive Property |\n| [\\triangle WXZ \\cong \\triangle YXZ] | LL Congruence Theorem |\n\n### Step 2: Prove Two Right Triangles Congruent Using Parallel Lines and Right Angles\n\nWhen parallel lines form right triangles with a transversal, use alternate interior angles and the fact that both triangles contain a right angle.\n\n\n**Given:** [\\angle H] and [\\angle K] are right angles; [\\overline{GH} \\parallel \\overline{KJ}].\n\n**Prove:** [\\triangle GKJ \\cong \\triangle JHG]\n\nA two-column proof:\n\n| Statements | Reasons |\n|---|---|\n| [\\angle H] and [\\angle K] are right angles | Given |\n| [\\triangle GKJ] and [\\triangle JHG] are right triangles | Definition of right triangle |\n| [\\overline{GH} \\parallel \\overline{KJ}] | Given |\n| [\\angle G \\cong \\angle J] | Alternate Interior Angles Theorem |\n| [\\overline{GJ} \\cong \\overline{JG}] | Reflexive Property |\n| [\\triangle GKJ \\cong \\triangle JHG] | HA Congruence Theorem |\n\n### Step 3: Prove Two Right Triangles Congruent Using Perpendicularity and Congruent Hypotenuses\n\nGiven a perpendicular segment and two congruent hypotenuses, apply the HL theorem.\n\n**Given:** [\\overline{BX} \\perp \\overline{AC}]; [AB = CB].\n\n**Prove:** [\\triangle AXB \\cong \\triangle CXB]\n\n\nA two-column proof:\n\n| Statements | Reasons |\n|---|---|\n| [\\overline{BX} \\perp \\overline{AC}] | Given |\n| [\\angle AXB] and [\\angle CXB] are right angles | Definition of perpendicular lines |\n| [\\triangle AXB] and [\\triangle CXB] are right triangles | Definition of right triangle |\n| [AB = CB] | Given |\n| [\\overline{AB} \\cong \\overline{CB}] | Definition of congruent segments |\n| [\\overline{BX} \\cong \\overline{BX}] | Reflexive Property |\n| [\\triangle AXB \\cong \\triangle CXB] | HL Congruence Theorem |",
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
            markdown:
              "## Example 2 — Determine Whether Triangles Are Congruent and Name the Theorem\n\nExamine pairs of triangles shown in diagrams and determine whether they are congruent. If they are, state the right triangle congruence theorem that applies.\n\n### Step 1: Identify the Given Information in Each Diagram\n\nRead each diagram to identify which sides and angles are marked as congruent. Note whether the triangles are right triangles.\n\n### Step 2: Match the Information to a Congruence Theorem\n\nDetermine which theorem applies based on the given parts:\n\n- Two pairs of congruent legs → LL\n- Hypotenuse and one acute angle → HA\n- One leg and one acute angle → LA\n- Hypotenuse and one leg → HL\n\nIf the given information does not match any theorem, the triangles cannot be proven congruent from the diagram alone.\n\n### Step 3: State the Conclusion\n\nFor each pair, write either the congruence statement with the theorem name or explain that there is not enough information.",
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
            markdown:
              "## Example 3 — Identify Corresponding Parts Needed for a Specific Theorem\n\nGiven a general pair of right triangles and a named theorem, determine exactly which corresponding parts must be proven congruent in order to apply that theorem.\n\n\n### Step 1: Analyze the HA Theorem\n\nFor HA, identify the hypotenuse and one acute angle in each triangle. State which pair of corresponding hypotenuses must be congruent and which pair of corresponding acute angles must be congruent.\n\n\n[\\triangle ABC \\cong \\triangle XYZ \\text{ by HA}]\n\n\nRequired congruent parts:\n[\\overline{AB} \\cong \\overline{XY} \\quad \\text{(hypotenuses)}]\n[\\angle A \\cong \\angle X \\quad \\text{or} \\quad \\angle B \\cong \\angle Y \\quad \\text{(acute angles)}]\n\n### Step 2: Analyze the LL Theorem\n\nFor LL, identify the two legs in each triangle. State which pairs of corresponding legs must be congruent.\n\n\nRequired congruent parts:\n[\\overline{AC} \\cong \\overline{XZ}, \\quad \\overline{BC} \\cong \\overline{YZ}]",
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
            markdown:
              "## Example 4 — Write Proofs Using Perpendicular Segments and Congruent Parts\n\nWrite a two-column proof when two perpendicular relationships and one pair of congruent segments are given.\n\n### Step 1: Identify the Right Triangles\n\nGiven two perpendicular relationships, establish that both triangles are right triangles.\n\n\n**Given:** [\\overline{BX} \\perp \\overline{XA}]; [\\overline{BY} \\perp \\overline{YA}]; [\\overline{XA} \\cong \\overline{YA}].\n\n**Prove:** [\\triangle BXA \\cong \\triangle BYA]\n\nA two-column proof:\n\n| Statements | Reasons |\n|---|---|\n| [\\overline{BX} \\perp \\overline{XA}] | Given |\n| [\\overline{BY} \\perp \\overline{YA}] | Given |\n| [\\angle BXA] and [\\angle BYA] are right angles | Definition of perpendicular lines |\n| [\\triangle BXA] and [\\triangle BYA] are right triangles | Definition of right triangle |\n| [\\overline{XA} \\cong \\overline{YA}] | Given |\n| [\\overline{BA} \\cong \\overline{BA}] | Reflexive Property |\n| [\\triangle BXA \\cong \\triangle BYA] | HL Congruence Theorem |",
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
            markdown:
              "## Example 5 — Write a Paragraph Proof for Right Triangle Congruence\n\nWrite a paragraph proof when two perpendicular segments and a pair of congruent segments are given.\n\n\n### Step 1: State the Given Information and Goal\n\nIdentify the right triangles, the congruent right angles, and the other given congruent parts.\n\n**Given:** [\\overline{BY} \\perp \\overline{AC}]; [\\overline{CX} \\perp \\overline{AB}]; [AX = AY].\n\n**Prove:** [\\triangle ABY \\cong \\triangle ACX]\n\n\n### Step 2: Write the Paragraph Proof\n\nSince [\\overline{BY} \\perp \\overline{AC}], [\\angle BYA] is a right angle, so [\\triangle ABY] is a right triangle. Since [\\overline{CX} \\perp \\overline{AB}], [\\angle CXA] is a right angle, so [\\triangle ACX] is a right triangle. We are given that [AX = AY], so [\\overline{AX} \\cong \\overline{AY}]. Angle [\\angle A] is congruent to itself by the Reflexive Property. Therefore, [\\triangle ABY \\cong \\triangle ACX] by the LA Congruence Theorem.",
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
            markdown:
              "## Example 6 — Analyze a Claim About Right Triangle Congruence\n\nEvaluate a student's claim about whether a right triangle congruence theorem proves a real-world geometric relationship.\n\n### Step 1: Identify the Triangles and Given Information\n\nFrom the description, sketch or identify the two triangles formed by the light posts and the ends of the walkway. Determine what information is known and what must be assumed.\n\n\n### Step 2: Check Whether the Conditions Match a Theorem\n\nDetermine whether the triangles are right triangles, whether any hypotenuses or legs are known to be congruent, and whether any acute angles are known to be congruent.\n\n### Step 3: Evaluate the Conclusion\n\nIf the given information does not satisfy the conditions of LL, HA, LA, or HL, explain why the student's conclusion is incorrect. Identify what additional information would be needed to make the proof valid.",
          },
        },
      ],
    },
    {
      phaseNumber: 10,
      title: "Independent Practice",
      phaseType: "independent_practice" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: proving right triangles congruent, identifying applicable theorems, writing two-column proofs and paragraph proofs, and analyzing claims. Problems include:\n\n- Determining whether pairs of triangles shown in diagrams are congruent and naming the right triangle congruence theorem that applies.\n- Identifying which corresponding parts must be congruent to prove [\\triangle ABC \\cong \\triangle XYZ] using HA and using LL.\n- Writing two-column proofs for right triangles formed by perpendicular segments and congruent shared sides.\n- Determining whether two triangles in a sculpture side view are congruent and writing a paragraph proof if they are, or explaining the reasoning if they are not.\n- Writing a paragraph proof for right triangles formed by two perpendicular segments and a pair of congruent segments.\n- Evaluating a student's claim about using a right triangle congruence theorem to prove that two light posts are equidistant from the end of a walkway, and explaining whether the conclusion is correct.\n\n## Review Notes\n\n- Images referenced in the worksheet (pup tent diagram for problem 1, cell phone tower diagram for problem 2, bridge diagram for problem 3, triangle diagrams for mixed exercises problems 4–9, light post diagram for problem 14, and sculpture diagram for problem 12) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams, markings, and measurements.",
          },
        },
      ],
    },
  ];
}

function getLesson6Phases() {
  return [
    {
      phaseNumber: 1,
      title: "Explore",
      phaseType: "explore" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Explore: What Happens When Two Sides of a Triangle Are Congruent?\n\nStudents examine triangles with two congruent sides and observe the relationship between the angles opposite those sides. They discuss whether this relationship always holds and how it can be used to find missing measures.\n\nInquiry Question:\nHow can knowing that two sides of a triangle are congruent help you find the missing angles?",
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
              "## Vocabulary\n\n- **Isosceles Triangle** — A triangle with at least two congruent sides.\n- **Equilateral Triangle** — A triangle with three congruent sides.\n- **Equiangular Triangle** — A triangle with three congruent angles.\n- **Legs** — The congruent sides of an isosceles triangle.\n- **Base** — The side of an isosceles triangle that is not one of the congruent sides.\n- **Vertex Angle** — The angle formed by the two congruent sides of an isosceles triangle.\n- **Base Angles** — The two angles adjacent to the base of an isosceles triangle.\n- **Isosceles Triangle Theorem** — If two sides of a triangle are congruent, then the angles opposite those sides are congruent.\n- **Converse of the Isosceles Triangle Theorem** — If two angles of a triangle are congruent, then the sides opposite those angles are congruent.\n- **Corollary** — A statement that follows directly from a theorem.",
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
              "## Learn: Properties of Isosceles and Equilateral Triangles\n\nThe Isosceles Triangle Theorem and its converse provide powerful tools for finding missing measures and writing proofs. Equilateral triangles have special corollaries that simplify calculations.\n\n### Key Concept: Isosceles Triangle Theorem\n\nIf two sides of a triangle are congruent, then the angles opposite those sides are congruent.\n\nFor example, in triangle ABC with congruent sides AB and AC:\n\n[\\overline{AB} \\cong \\overline{AC}]\n\nThen the opposite angles are congruent:\n\n[\\angle B \\cong \\angle C]\n\n\n### Key Concept: Converse of the Isosceles Triangle Theorem\n\n\nIf two angles of a triangle are congruent, then the sides opposite those angles are congruent.\n\n\nFor example, in triangle ABC with congruent angles B and C:\n\n[\\angle B \\cong \\angle C]\n\nThen the opposite sides are congruent:\n\n\n[\\overline{AB} \\cong \\overline{AC}]\n\n### Key Concept: Corollaries for Equilateral and Equiangular Triangles\n\n- A triangle is equilateral if and only if it is equiangular.\n- Each angle of an equilateral triangle measures:\n\n[60°]",
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
            markdown:
              "## Example 1 — Write Two-Column Proofs Using Isosceles Triangle Properties\n\nWrite two-column proofs to show segment congruence using given angle or side relationships in isosceles triangles.\n\n### Step 1: Identify the Given Information and the Prove Statement\n\nExtract the known congruences and the desired conclusion from the diagram and the problem.\n\n### Step 2: Apply the Converse of the Isosceles Triangle Theorem\n\nWhen two angles of a triangle are congruent, conclude that the sides opposite those angles are congruent.\n\nFor example, if angle 1 is congruent to angle 2:\n\n[\\angle 1 \\cong \\angle 2]\n\n\nThen the sides opposite those angles are congruent:\n\n[\\overline{AB} \\cong \\overline{CB}]\n\n\n### Step 3: Use Segment Addition with Congruent Parts\n\nWhen two pairs of smaller segments are congruent and share a common endpoint, add the congruent parts to show the longer segments are congruent.\n\n\nIf:\n\n[\\overline{CD} \\cong \\overline{CG}]\n\n\nand:\n\n[\\overline{DE} \\cong \\overline{GF}]\n\n\nThen by the Segment Addition Postulate:\n\n[\\overline{CE} \\cong \\overline{CF}]\n\n\n### Step 4: Use Parallel Lines to Establish Angle Congruence\n\n\nWhen a line parallel to one side of a triangle creates alternate interior angles, use those congruent angles with the converse of the Isosceles Triangle Theorem to prove two sides of the triangle are congruent.\n\n### Step 5: Prove an Angle Bisector Using Triangle Congruence\n\nIn an isosceles triangle with a perpendicular segment from the vertex angle to the base, prove the two formed triangles are congruent by the Hypotenuse-Leg or SAS Postulate, then conclude the perpendicular bisects the vertex angle.",
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
            markdown:
              "## Example 2 — Find Side Lengths and Angle Measures in Isosceles Triangles\n\nUse the properties of isosceles triangles to calculate unknown side lengths and angle measures from diagrams.\n\n\n### Step 1: Identify Congruent Sides and Base Angles\n\nMark the congruent legs and the base angles of the isosceles triangle using the given diagram or information.\n\n### Step 2: Apply the Triangle Angle Sum Theorem\n\nSubtract the measure of the vertex angle from 180° and divide the result by 2 to find each base angle.\n\n\n[\\frac{180° - m\\angle V}{2}]\n\n### Step 3: Set Up and Solve Equations for Side Lengths\n\nWhen algebraic expressions represent the lengths of congruent sides, set the expressions equal and solve for the variable.\n\n\nIf the legs are given as:\n\n[2x + 3]\n\n\nand:\n\n[x + 7]\n\nSet them equal:\n\n[2x + 3 = x + 7]\n\n\nThen solve:\n\n[x = 4]\n\n\n### Step 4: Use Right-Triangle Relationships When Needed\n\nIf an altitude splits the isosceles triangle into two right triangles, use the Pythagorean Theorem or trigonometric ratios to find missing lengths or angles. Round to the nearest tenth when necessary.",
          },
        },
      ],
    },
    {
      phaseNumber: 6,
      title: "Worked Examples 3 and 4",
      phaseType: "worked_example" as const,
      estimatedMinutes: 10,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Examples 3 and 4 — Solve for Unknowns in Isosceles and Equilateral Triangles\n\nSet up and solve equations using the properties of isosceles and equilateral triangles.\n\n\n### Step 1: Equate Expressions for Congruent Angles or Sides\n\nIn an isosceles triangle, set the expressions for congruent base angles or congruent legs equal to each other.\n\n\nFor example, if the base angles are:\n\n\n[(3x + 5)°]\n\n\nand:\n\n[(2x + 15)°]\n\nWrite:\n\n\n[3x + 5 = 2x + 15]\n\n\nThen solve:\n\n[x = 10]\n\n### Step 2: Use the Triangle Angle Sum to Verify Missing Angles\n\nAfter solving for the variable, substitute back to find each angle measure and confirm that the three angles sum to 180°.\n\n\n[m\\angle A + m\\angle B + m\\angle C = 180°]\n\n### Step 3: Apply Equilateral Triangle Properties\n\nIn an equilateral triangle, set each angle expression equal to 60° or set each side expression equal to a common value.\n\n\nIf each angle is expressed as:\n\n[4x - 8]\n\nThen:\n\n[4x - 8 = 60]\n\nAnd:\n\n[x = 17]\n\n\n### Step 4: Solve Real-World Problems Modeled by Triangles\n\n\nRecognize isosceles or equilateral shapes in everyday objects, assign variables to unknown dimensions, set up the appropriate equation, and solve.",
          },
        },
      ],
    },
    {
      phaseNumber: 7,
      title: "Independent Practice",
      phaseType: "independent_practice" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: writing proofs, finding missing measures, solving equations, and applying triangle properties to real-world contexts. Problems include:\n\n\n- Writing two-column proofs to establish corollaries about equilateral and equiangular triangles.\n- Writing paragraph proofs to justify angle measures in real-world isosceles triangle structures.\n- Investigating the midsegment triangle formed by connecting the midpoints of the sides of an isosceles triangle and making conjectures.\n- Finding angle measures in complex diagrams containing multiple triangles.\n- Applying isosceles triangle properties to contexts such as marble paths, bridge architecture, and traffic signs.\n- Constructing isosceles right triangles and verifying the constructions with measurement and mathematics.\n- Analyzing statements about isosceles triangles as sometimes, always, or never true and justifying the reasoning.\n- Identifying and explaining errors in student work about angle measures in isosceles triangles.\n- Solving multi-step real-world problems involving parallel lines, isosceles triangles, and distance calculations.\n\n## Review Notes\n\n- Images referenced in the worksheet (media/image1.png through media/image24.png) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams and values.",
          },
        },
      ],
    },
  ];
}

function getLesson7Phases() {
  return [
    {
      phaseNumber: 1,
      title: "Explore",
      phaseType: "explore" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Explore: How Can the Coordinate Plane Help Prove Things About Triangles?\n\nStudents consider why placing a triangle on the coordinate plane might make it easier to prove geometric properties. They discuss strategies such as using the origin as a vertex, placing sides on the axes, and choosing convenient coordinates.\n\nInquiry Question:\nWhy is it helpful to place one vertex of a triangle at the origin and one side along an axis when writing a coordinate proof?",
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
              "## Vocabulary\n\n- **Coordinate Proof** — A style of proof that places geometric figures on the coordinate plane and uses coordinates, slopes, distances, and midpoints to verify geometric properties.\n- **Isosceles Triangle** — A triangle with at least two congruent sides.\n- **Right Triangle** — A triangle containing exactly one right angle.\n- **Isosceles Right Triangle** — A right triangle with two congruent legs.\n- **Hypotenuse** — The side opposite the right angle in a right triangle; the longest side.\n- **Leg** — One of the two sides that form the right angle in a right triangle.\n- **Midpoint** — The point that divides a segment into two congruent segments.\n- **Midsegment** — A segment connecting the midpoints of two sides of a triangle.\n- **Distance Formula** — A formula used to find the distance between two points [(x_1, y_1)] and [(x_2, y_2)]: [d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}].\n- **Slope** — A measure of the steepness of a line, calculated as [\\frac{y_2 - y_1}{x_2 - x_1}].",
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
              "## Learn: Triangles and Coordinate Proof\n\nCoordinate geometry combines algebra and geometry. By placing triangles strategically on the coordinate plane, we can use formulas for distance, slope, and midpoint to verify geometric relationships.\n\n### Key Concept: Placing Triangles on the Coordinate Plane\n\nWhen positioning a triangle for a coordinate proof, choose coordinates that simplify calculations:\n\n- Place one vertex at the origin [(0, 0)].\n- Place at least one side on the [x]-axis or [y]-axis.\n- Use variables to represent unknown lengths so the proof applies to any triangle with the given properties.\n\nFor an isosceles triangle with base [\\overline{AB}] of length [a] and height [b]:\n[A(0, 0), \\quad B(a, 0), \\quad C\\left(\\frac{a}{2}, b\\right)]\n\n\nFor a right triangle with legs along the axes:\n[J(0, 0), \\quad K(a, 0), \\quad L(0, b)]\n\n\n### Key Concept: Writing a Coordinate Proof\n\nA coordinate proof follows the same logical structure as other proofs, but uses coordinates to establish facts:\n\n1. Position and label the figure on the coordinate plane.\n2. State the Given and Prove.\n3. Use the Distance Formula, midpoint formula, or slope formula to establish relationships.\n4. Draw the conclusion.\n\n### Key Concept: Classifying Triangles Using Coordinates\n\nTo classify a triangle from its vertices, calculate the lengths of all three sides using the Distance Formula, then compare:\n\n- If all three side lengths are different, the triangle is scalene.\n- If at least two side lengths are equal, the triangle is isosceles.\n- If all three side lengths are equal, the triangle is equilateral.\n- If the side lengths satisfy the Pythagorean Theorem, the triangle is right.",
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
            markdown:
              "## Example 1 — Position and Label Triangles on the Coordinate Plane\n\nUse given properties and side lengths to assign coordinates to the vertices of triangles, placing them strategically to simplify future calculations.\n\n\n### Step 1: Position an Isosceles Triangle\n\nPlace the base on the [x]-axis with one endpoint at the origin. Use the given base length and height to locate the third vertex directly above the midpoint of the base.\n\nFor an isosceles triangle with base [\\overline{AB}] of length [a] and height [b]:\n[A(0, 0), \\quad B(a, 0), \\quad C\\left(\\frac{a}{2}, b\\right)]\n\n\n### Step 2: Position a Right Triangle\n\nPlace the right angle at the origin with the legs along the axes. Use the given leg lengths to locate the remaining vertices.\n\n\nFor a right triangle with one leg [b] units long and the other leg three times as long:\n[X(0, 0), \\quad Y(0, b), \\quad Z(3b, 0)]\n\n\n### Step 3: Position an Isosceles Right Triangle\n\nPlace the right angle at the origin with the congruent legs along the axes. Use the given leg length to locate the vertices.\n\n\nFor an isosceles right triangle with legs [3a] units long:\n[R(0, 0), \\quad S(3a, 0), \\quad T(0, 3a)]\n\nNote that the hypotenuse is [\\overline{RS}] in this labeling, so adjust vertex labels accordingly.\n\n\n### Step 4: Position a Right Triangle with Given Leg Lengths\n\nPlace the right angle at the origin with legs along the axes. Use the given expressions for leg lengths.\n\n\nFor a right triangle with legs [a] and [4b]:\n[J(0, 0), \\quad K(a, 0), \\quad L(0, 4b)]",
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
            markdown:
              "## Example 2 — Find Missing Coordinates of Triangles\n\nGiven diagrams of triangles on the coordinate plane with some coordinates missing, use properties of the triangle and the placement strategy to determine the unknown coordinates.\n\n\n### Step 1: Identify the Triangle Type and Placement\n\nDetermine whether the triangle is isosceles, right, or isosceles right, and note which sides lie on axes or have known endpoints.\n\n\n### Step 2: Use Symmetry and Properties\n\nFor an isosceles triangle with a vertex on an axis of symmetry, use the fact that the base is horizontal or vertical to find the missing [x]- or [y]-coordinate.\n\n\nFor a right triangle with the right angle at the origin and one leg along an axis, the missing coordinate is determined by the given leg length.\n\n\n### Step 3: Verify the Coordinates\n\nCheck that the coordinates satisfy the given conditions, such as equal side lengths for an isosceles triangle or perpendicular sides for a right triangle.",
          },
        },
      ],
    },
    {
      phaseNumber: 6,
      title: "Worked Examples 3 and 4",
      phaseType: "worked_example" as const,
      estimatedMinutes: 10,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Examples 3 and 4 — Write Coordinate Proofs\n\nWrite formal coordinate proofs for geometric statements about triangles. Each proof requires positioning the triangle, stating the given information, and using algebraic calculations to reach the conclusion.\n\n\n### Step 1: Prove Midsegments Form a Right Triangle\n\nPosition a right triangle with vertices at convenient coordinates. Find the midpoints of each side using the midpoint formula, then show that the triangle formed by connecting these midpoints contains a right angle by showing two of its sides have opposite reciprocal slopes.\n\n\nGiven the midpoints [R], [P], and [Q] of the sides of a right triangle, show:\n[\\triangle RPQ \\text{ is a right triangle}]\n\n### Step 2: Prove a Segment to the Base Is Perpendicular\n\nPosition an isosceles triangle with its base on the [x]-axis and its vertex on the [y]-axis. Use the midpoint formula to find the midpoint of the base, then show that the segment from the vertex to this midpoint is vertical while the base is horizontal, making them perpendicular.\n\nShow:\n[\\overline{SU} \\perp \\overline{RT}]\n\n\n### Step 3: Prove a Segment to the Hypotenuse Is Perpendicular\n\nPosition an isosceles right triangle with the right angle at the origin and legs along the axes. Find the midpoint of the hypotenuse, then show that the segment from the right-angle vertex to this midpoint is perpendicular to the hypotenuse by comparing slopes.\n\n\nShow:\n[\\overline{BM} \\perp \\overline{AC}]\n\n\n### Step 4: Prove a Segment Equals Half the Hypotenuse\n\nPosition a right triangle with the right angle at one vertex and the hypotenuse opposite. Find the midpoint of the hypotenuse, then use the Distance Formula to show that the distance from the right-angle vertex to the midpoint equals half the length of the hypotenuse.\n\n\nShow:\n[AP = \\frac{1}{2}BC]\n\n\n### Step 5: Prove the Midsegment Theorem\n\nPosition a general triangle on the coordinate plane. Find the midpoints of two sides, then use the Distance Formula to show that the segment connecting these midpoints has length equal to half the length of the third side.\n\n\nShow:\n[ST = \\frac{1}{2}AB]",
          },
        },
      ],
    },
    {
      phaseNumber: 7,
      title: "Worked Example 5",
      phaseType: "worked_example" as const,
      estimatedMinutes: 10,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Example 5 — Apply Coordinate Geometry to Real-World Problems\n\nUse the Distance Formula and coordinate geometry to classify triangles formed by real-world locations described by their positions relative to a reference point.\n\n### Step 1: Assign Coordinates to Locations\n\nUse a reference point as the origin and translate directional descriptions into coordinates. East and north correspond to positive directions; west and south correspond to negative directions.\n\n\nFor example, if a school is at the origin, a home 6 miles east and 4 miles north has coordinates [(6, 4)], and a mall 2 miles west and 3 miles north has coordinates [(-2, 3)].\n\n\n### Step 2: Calculate Side Lengths\n\nApply the Distance Formula to find the three distances between the locations:\n[d = \\sqrt{(x_2 - x_1)^2 + (y_2 - y_1)^2}]\n\n\n### Step 3: Classify the Triangle\n\nCompare the three side lengths to classify the triangle as scalene, isosceles, equilateral, and/or right. Check whether the Pythagorean Theorem holds to determine if the triangle is right.\n\n\n### Step 4: Estimate and Verify\n\nFor problems that ask for an estimate first, make a visual or rough calculation to predict the triangle type, then verify with precise coordinate calculations.",
          },
        },
      ],
    },
    {
      phaseNumber: 8,
      title: "Independent Practice",
      phaseType: "independent_practice" as const,
      estimatedMinutes: 20,
      sections: [
        {
          sequenceOrder: 1,
          sectionType: "text" as const,
          content: {
            markdown:
              "## Mixed Exercises\n\nThe mixed exercises section provides practice with all skills from the lesson: positioning triangles on the coordinate plane, finding missing coordinates, writing coordinate proofs, and applying coordinate geometry to real-world contexts. Problems include:\n\n- Determining whether given coordinates can form a right triangle by applying the Distance Formula and the converse of the Pythagorean Theorem.\n- Finding coordinates for the acute angles of a right isosceles triangle placed in Quadrant I with the right angle at the origin.\n- Finding the third vertex of an isosceles triangle when the base is on the [y]-axis with one endpoint at the origin and the opposite vertex is known.\n- Describing the main steps of a coordinate proof to show two angles in different triangles are congruent.\n- Determining whether a triangular community garden has any congruent angles and writing a coordinate proof to justify the answer.\n- Finding the coordinates of midpoints of the sides of an isosceles triangle with given vertex coordinates.\n- Describing sets of points in the coordinate plane that could or could not serve as the third vertex of a triangle with two given vertices.\n- Describing sets of points that would form an isosceles triangle or a right triangle with two given vertices.\n- Drawing an isosceles right triangle so that the midpoint of its hypotenuse is at the origin.\n- Explaining why placing a vertex at the origin, a side on an axis, and keeping the triangle in the first quadrant simplifies coordinate proofs.\n- Finding coordinates for a third vertex that produce a scalene, right, or isosceles triangle when two vertices are given in terms of variables.\n- Analyzing the relationship between the midpoints of a triangle's sides and its vertices to find missing vertex coordinates.\n\n## Review Notes\n\n- Images referenced in the worksheet (triangle diagrams for Example 2 problems 5–8, diagrams for coordinate proof problems 9–13, neighborhood map for problem 14, county fair map for problem 15, 5K run course map for problem 16, shelf bracket diagram for problem 19, flag diagram for problem 20, quilt patch diagram for problem 21, community garden fence diagram for problem 22) could not be fully described without visual reference. Teachers should consult the original worksheet for exact diagrams, coordinates, and measurements.",
          },
        },
      ],
    },
  ];
}
