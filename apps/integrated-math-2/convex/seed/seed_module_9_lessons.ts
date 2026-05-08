import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";

interface SeedModule9Result {
  lessons: Array<{
    lessonId: Id<"lessons">;
    lessonVersionId: Id<"lesson_versions">;
    slug: string;
    phasesCreated: number;
    activitiesCreated: number;
  }>;
}

const lessons = [
  {
    slug: "module-9-lesson-1",
    title: "Solving Multi-Step Linear Equations",
    description: "Solve equations using the distributive property, combine like terms, solve equations with variables on both sides, identify equations with no solution or infinitely many solutions, and apply multi-step equations to real-world break-even problems.",
    orderIndex: 1,
  },
  {
    slug: "module-9-lesson-2",
    title: "Solving Absolute Value Equations and Inequalities",
    description: "Solve absolute value equations of the form |ax + b| = c and interpret solutions. Solve absolute value inequalities and graph solution sets on a number line. Write absolute value equations and inequalities to represent real-world scenarios.",
    orderIndex: 2,
  },
  {
    slug: "module-9-lesson-3",
    title: "Equations of Linear Functions",
    description: "Write linear equations in standard form, slope-intercept form, and point-slope form. Identify the slope and y-intercept from an equation. Interpret the parameters of a linear equation in context. Write linear equations to model real-world data.",
    orderIndex: 3,
  },
  {
    slug: "module-9-lesson-4",
    title: "Solving Systems of Equations Graphically",
    description: "Determine the number of solutions for a system of linear equations and classify the system as consistent or inconsistent, independent or dependent. Solve a system of equations by graphing. Use a graphing calculator to solve systems.",
    orderIndex: 4,
  },
  {
    slug: "module-9-lesson-5",
    title: "Solving Systems of Equations Algebraically",
    description: "Solve a system of equations using substitution. Solve a system of equations using elimination. Choose an appropriate method based on the structure of the system. Write and solve systems of equations to represent real-world situations.",
    orderIndex: 5,
  },
  {
    slug: "module-9-lesson-6",
    title: "Solving Systems of Inequalities",
    description: "Graph systems of two or more linear inequalities and identify the overlapping solution region. Determine whether a given ordered pair satisfies a system of inequalities. Write systems of inequalities to represent real-world constraints.",
    orderIndex: 6,
  },
  {
    slug: "module-9-lesson-7",
    title: "Optimization with Linear Programming",
    description: "Graph a system of linear inequalities and identify the vertices of the feasible region. Evaluate a linear objective function at each vertex to find the maximum and minimum values. Apply linear programming to optimize quantities.",
    orderIndex: 7,
  },
  {
    slug: "module-9-lesson-8",
    title: "Systems of Equations in Three Variables",
    description: "Solve systems of three linear equations with three variables using elimination and substitution. Set up and solve real-world problems that lead to systems of three equations in three variables.",
    orderIndex: 8,
  },
  {
    slug: "module-9-lesson-9",
    title: "Solving Absolute Value Equations and Inequalities by Graphing",
    description: "Solve absolute value equations by graphing the related function and identifying intersection points. Solve absolute value equations algebraically by isolating the absolute value expression. Solve absolute value inequalities by graphing.",
    orderIndex: 9,
  },
];

function extractPhases(lessonContent: string): Array<{ phaseNumber: number; title: string; phaseType: string; estimatedMinutes: number; sections: Array<{ sequenceOrder: number; sectionType: "text" | "activity"; content: Record<string, unknown> }> }> {
  const phases: Array<{ phaseNumber: number; title: string; phaseType: string; estimatedMinutes: number; sections: Array<{ sequenceOrder: number; sectionType: "text" | "activity"; content: Record<string, unknown> }> }> = [];

  const lines = lessonContent.split("\n");
  let phaseNumber = 1;
  let currentPhaseTitle = "";
  let currentPhaseType: string | null = null;
  let currentMarkdown = "";
  let sequenceOrder = 1;
  let inVocabulary = false;
  let vocabularyContent = "";

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    if (line.startsWith("## Vocabulary")) {
      inVocabulary = true;
      vocabularyContent = "## Vocabulary\n\n";
      if (currentMarkdown.trim()) {
        phases.push({
          phaseNumber,
          title: currentPhaseTitle,
          phaseType: currentPhaseType || "learn",
          estimatedMinutes: 15,
          sections: [{
            sequenceOrder,
            sectionType: "text",
            content: { markdown: currentMarkdown.trim() },
          }],
        });
        phaseNumber++;
        currentMarkdown = "";
        sequenceOrder = 1;
      }
      continue;
    }

    if (inVocabulary && line.startsWith("## ")) {
      inVocabulary = false;
      phases.push({
        phaseNumber,
        title: "Vocabulary",
        phaseType: "vocabulary",
        estimatedMinutes: 10,
        sections: [{
          sequenceOrder: 1,
          sectionType: "text",
          content: { markdown: vocabularyContent.trim() },
        }],
      });
      phaseNumber++;
      vocabularyContent = "";
      sequenceOrder = 1;
    }

    if (inVocabulary && line.startsWith("* **")) {
      vocabularyContent += line + "\n";
      continue;
    }

    if (line.startsWith("## Explore:")) {
      if (currentMarkdown.trim()) {
        phases.push({
          phaseNumber,
          title: currentPhaseTitle,
          phaseType: currentPhaseType || "learn",
          estimatedMinutes: 15,
          sections: [{
            sequenceOrder,
            sectionType: "text",
            content: { markdown: currentMarkdown.trim() },
          }],
        });
        phaseNumber++;
        currentMarkdown = "";
        sequenceOrder = 1;
      }
      currentPhaseTitle = "Explore";
      currentPhaseType = "explore";
      continue;
    }

    if (line.startsWith("## Learn:")) {
      if (currentMarkdown.trim()) {
        phases.push({
          phaseNumber,
          title: currentPhaseTitle,
          phaseType: currentPhaseType || "learn",
          estimatedMinutes: 15,
          sections: [{
            sequenceOrder,
            sectionType: "text",
            content: { markdown: currentMarkdown.trim() },
          }],
        });
        phaseNumber++;
        currentMarkdown = "";
        sequenceOrder = 1;
      }
      currentPhaseTitle = "Learn";
      currentPhaseType = "learn";
      continue;
    }

    if (line.startsWith("## Example ")) {
      const match = line.match(/^## Example (\d+)/);
      if (match) {
        if (currentMarkdown.trim()) {
          phases.push({
            phaseNumber,
            title: currentPhaseTitle,
            phaseType: currentPhaseType || "learn",
            estimatedMinutes: 15,
            sections: [{
              sequenceOrder,
              sectionType: "text",
              content: { markdown: currentMarkdown.trim() },
            }],
          });
          phaseNumber++;
          currentMarkdown = "";
          sequenceOrder = 1;
        }
        currentPhaseTitle = `Example ${match[1]}`;
        currentPhaseType = "worked_example";
      }
      continue;
    }

    if (line.startsWith("## Mixed Exercises") || line.startsWith("## Review Notes")) {
      if (currentMarkdown.trim()) {
        phases.push({
          phaseNumber,
          title: currentPhaseTitle,
          phaseType: currentPhaseType || "learn",
          estimatedMinutes: 15,
          sections: [{
            sequenceOrder,
            sectionType: "text",
            content: { markdown: currentMarkdown.trim() },
          }],
        });
        phaseNumber++;
        currentMarkdown = "";
        sequenceOrder = 1;
      }
      currentPhaseTitle = line.replace("## ", "");
      currentPhaseType = "independent_practice";
      continue;
    }

    if (line.startsWith("## ")) {
      continue;
    }

    if (line.startsWith("---")) {
      continue;
    }

    if (!line.trim()) {
      continue;
    }

    currentMarkdown += line + "\n";
  }

  if (currentMarkdown.trim()) {
    phases.push({
      phaseNumber,
      title: currentPhaseTitle || "Learn",
      phaseType: currentPhaseType || "learn",
      estimatedMinutes: 15,
      sections: [{
        sequenceOrder,
        sectionType: "text",
        content: { markdown: currentMarkdown.trim() },
      }],
    });
  }

  return phases;
}

export const seedModule9Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule9Result> => {
    const now = Date.now();
    const results: SeedModule9Result["lessons"] = [];

    const fs = await import("fs");
    const path = await import("path");

    for (const lesson of lessons) {
      const curriculumPath = path.join(
        process.cwd(),
        "apps/integrated-math-2/curriculum/modules",
        lesson.slug
      );

      let lessonContent = "";
      try {
        lessonContent = fs.readFileSync(curriculumPath, "utf-8");
      } catch {
        console.log(`Could not read curriculum file for ${lesson.slug}`);
        continue;
      }

      const existingLesson = await ctx.db
        .query("lessons")
        .withIndex("by_slug", (q) => q.eq("slug", lesson.slug))
        .unique();

      const lessonId: Id<"lessons"> = existingLesson
        ? existingLesson._id
        : await ctx.db.insert("lessons", {
            unitNumber: 9,
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

      const phaseData = extractPhases(lessonContent, lesson.slug);

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
          phaseType: phase.phaseType as "explore" | "learn" | "worked_example" | "vocabulary" | "independent_practice" | "guided_practice" | "discourse" | "reflection",
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

      results.push({
        lessonId,
        lessonVersionId,
        slug: lesson.slug,
        phasesCreated,
        activitiesCreated,
      });
    }

    return { lessons: results };
  },
});