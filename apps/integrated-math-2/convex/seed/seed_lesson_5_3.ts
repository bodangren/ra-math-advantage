import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedLesson5_3Result {
  lessonId: Id<"lessons">;
  lessonVersionId: Id<"lesson_versions">;
  phasesCreated: number;
  activitiesCreated: number;
}

export const seedLesson5_3 = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedLesson5_3Result> => {
    const now = Date.now();
    const lessonSlug = "5-3-arcs-and-chords";

    const existingLesson = await ctx.db
      .query("lessons")
      .withIndex("by_slug", (q) => q.eq("slug", lessonSlug))
      .unique();

    const lessonId: Id<"lessons"> = existingLesson
      ? existingLesson._id
      : await ctx.db.insert("lessons", {
          unitNumber: 5,
          title: "Arcs and Chords",
          slug: lessonSlug,
          description: "Students explore relationships between chords, arcs, and the circle's center.",
          orderIndex: 3,
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
          title: "Arcs and Chords",
          description: "Students explore relationships between chords, arcs, and the circle's center.",
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
              markdown: "## Explore: Chords and Their Arcs\n\nDraw two congruent chords in a circle. How far is each from the center? Draw the perpendicular from the center to each chord and measure.",
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
                    question: "Congruent chords in a circle intercept:",
                    options: ["Congruent arcs", "Different arcs", "Semicircles", "Minor arcs only"],
                    correctIndex: 0,
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
              markdown: "## Arc and Chord Theorems\n\n1. **Congruent chords intercept congruent arcs** (and vice versa)\n2. **Congruent chords are equidistant from the center**\n3. **A diameter perpendicular to a chord bisects the chord and its arc**\n4. **The perpendicular bisector of a chord passes through the center**\n\n### Arc Measures\n- **Minor arc**: Less than 180°\n- **Major arc**: Greater than 180°\n- **Semicircle**: Exactly 180°\n- Total arc measure around a circle: 360°",
            },
          },
        ],
      },
      {
        phaseNumber: 3,
        title: "Worked Example",
        phaseType: "worked_example" as const,
        estimatedMinutes: 10,
        sections: [
          {
            sequenceOrder: 1,
            sectionType: "text" as const,
            content: {
              markdown: "## Example: Find a Chord Length\n\nA chord is 16 units long and 6 units from the center. Find the radius.",
            },
          },
          {
            sequenceOrder: 2,
            sectionType: "activity" as const,
            content: {
              componentKey: "step-by-step-solver",
              props: {
                problemType: "chord_calculation",
                equation: "r² = d² + (c/2)²",
                steps: [
                  { expression: "The perpendicular bisects the chord: half = 8", explanation: "Diameter perpendicular to chord bisects it" },
                  { expression: "r² = 6² + 8²", explanation: "Pythagorean Theorem" },
                  { expression: "r² = 36 + 64 = 100", explanation: "Calculate" },
                  { expression: "r = 10", explanation: "The radius is 10" },
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
                    question: "If a chord is 6 units from the center of a circle with radius 10, the chord length is:",
                    options: ["8", "12", "16", "20"],
                    correctIndex: 2,
                  },
                  {
                    question: "A diameter perpendicular to a chord bisects the chord. This means the two halves are:",
                    options: ["Supplementary", "Equal in length", "Perpendicular", "Parallel"],
                    correctIndex: 1,
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
                    question: "Two chords of lengths 10 and 10 are in the same circle. Their distances from the center are:",
                    options: ["Different", "Equal", "Cannot be determined", "One is double the other"],
                    correctIndex: 1,
                  },
                  {
                    question: "If a major arc is 240°, the corresponding minor arc is:",
                    options: ["60°", "120°", "180°", "240°"],
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
