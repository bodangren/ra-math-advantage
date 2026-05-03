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
    const lessonSlug = "2-5-coordinate-proofs-quadrilaterals";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 2,
          title: "Coordinate Proofs for Quadrilaterals",
          slug: lessonSlug,
          description: "Students use coordinate geometry to prove quadrilateral properties.",
          orderIndex: 5,
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
          title: "Coordinate Proofs for Quadrilaterals",
          description: "Students use coordinate geometry to prove quadrilateral properties.",
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
              markdown: "## Explore: Coordinates and Shapes\n\nPlace a quadrilateral on a coordinate plane with vertices at A(0,0), B(4,0), C(4,3), D(0,3). What type of quadrilateral is it? Use the distance formula to verify.",
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
                    question: "The midpoint formula is:",
                    options: ["(x₁+x₂, y₁+y₂)", "((x₁+x₂)/2, (y₁+y₂)/2)", "(x₁−x₂, y₁−y₂)", "((x₁−x₂)/2, (y₁−y₂)/2)"],
                    correctIndex: 1,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 2,
        title: "Learn",
        phaseType: "learn" as const,
        estimatedMinutes: 15,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Coordinate Proof Strategies\n\n### Key Formulas\n- **Distance**: $d = \\sqrt{(x_2-x_1)^2 + (y_2-y_1)^2}$\n- **Midpoint**: $M = \\left(\\frac{x_1+x_2}{2}, \\frac{y_1+y_2}{2}\\right)$\n- **Slope**: $m = \\frac{y_2-y_1}{x_2-x_1}$\n\n### Strategy\n1. Place one vertex at the origin\n2. Align one side along the x-axis\n3. Use variables for remaining coordinates\n4. Prove properties algebraically\n\n### Proving a Parallelogram\nShow both pairs of opposite sides have equal slopes (parallel) or equal lengths.",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Worked Example",
        phaseType: "worked_example" as const,
        estimatedMinutes: 12,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example: Prove a Quadrilateral is a Rectangle\n\nShow that A(0,0), B(6,0), C(6,4), D(0,4) forms a rectangle.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "coordinate_proof",
                equation: "Prove ABCD is a rectangle",
                steps: [
                  { expression: "AB slope = 0 (horizontal)", explanation: "(0-0)/(6-0) = 0" },
                  { expression: "BC slope = undefined (vertical)", explanation: "(4-0)/(6-6) = undefined" },
                  { expression: "AB ⊥ BC since horizontal ⊥ vertical", explanation: "Perpendicular sides" },
                  { expression: "AB = 6, BC = 4, CD = 6, DA = 4", explanation: "Opposite sides are congruent" },
                  { expression: "All angles are 90° → Rectangle", explanation: "Parallelogram with right angles" },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 4,
        title: "Guided Practice",
        phaseType: "guided_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "To prove opposite sides are parallel using coordinates, you compare:",
                    options: ["Distances", "Midpoints", "Slopes", "Angles"],
                    correctIndex: 2,
                  },
                  {
                    question: "To prove diagonals bisect each other, you show the diagonals share the same:",
                    options: ["Length", "Slope", "Midpoint", "Equation"],
                    correctIndex: 2,
                  },
                ],
              },
            },
          },
        ],
      },
      {
        phaseNumber: 5,
        title: "Independent Practice",
        phaseType: "independent_practice" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "activity" as const,
            content: {
              componentKey: "comprehension-quiz",
              props: {
                questions: [
                  {
                    question: "Vertices A(0,0), B(3,4), C(8,4), D(5,0). AB slope = 4/3, CD slope = −4/3. Are AB and CD parallel?",
                    options: ["Yes", "No"],
                    correctIndex: 1,
                  },
                  {
                    question: "Which coordinate placement strategy simplifies proofs?",
                    options: ["Center the shape on the origin", "Place one vertex at origin and align a side on x-axis", "Use only positive coordinates", "Place all vertices on axes"],
                    correctIndex: 1,
                  },
                ],
              },
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
