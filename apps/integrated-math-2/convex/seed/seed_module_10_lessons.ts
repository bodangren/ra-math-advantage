import { internalMutation } from "../_generated/server";
import type { Id } from "../_generated/dataModel";
import { SeedActivityContent } from "./types";

interface SeedModule10Result {
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
    slug: "module-10-lesson-1",
    title: "Multiplication Properties of Exponents",
    description: "Apply the Product of Powers Property when multiplying two expressions with the same base. Apply the Power of a Power Property when raising an expression with an exponent to another power. Apply the Power of a Product Property when raising a product to a power. Simplify expressions using multiple properties of exponents. Write very large and very small numbers in scientific notation.",
    orderIndex: 1,
  },
  {
    slug: "module-10-lesson-2",
    title: "Division Properties of Exponents",
    description: "Apply the Quotient of Powers Property when dividing two expressions with the same base. Apply the Power of a Quotient Property when raising a quotient to a power. Simplify expressions involving fractions raised to powers. Evaluate real-world problems involving ratios, combinations, and exponential growth.",
    orderIndex: 2,
  },
  {
    slug: "module-10-lesson-3",
    title: "Negative Exponents",
    description: "Apply the definition of negative exponents to rewrite expressions with positive exponents. Simplify expressions using the properties of exponents with negative exponents. Evaluate real-world problems involving orders of magnitude comparisons. Understand why any nonzero base raised to the zero power equals 1.",
    orderIndex: 3,
  },
  {
    slug: "module-10-lesson-4",
    title: "Rational Exponents",
    description: "Convert between radical notation and exponential notation for roots. Evaluate expressions with rational exponents. Apply properties of exponents to simplify expressions with rational exponents. Solve real-world problems involving rational exponents in formulas for velocity, geometry, astronomy, and biology.",
    orderIndex: 4,
  },
  {
    slug: "module-10-lesson-5",
    title: "Simplifying Radical Expressions",
    description: "Apply the Product Property of Square Roots to simplify radical expressions. Apply the Quotient Property of Square Roots to simplify radical expressions. Simplify radical expressions by extracting perfect square factors. Simplify cube roots and other higher-index radicals. Solve real-world problems involving geometric formulas with radicals.",
    orderIndex: 5,
  },
  {
    slug: "module-10-lesson-6",
    title: "Operations with Radical Expressions",
    description: "Add and subtract radical expressions by combining like radicals. Simplify radical expressions before adding or subtracting. Multiply radical expressions and distribute radicals over binomials. Apply operations with radicals to solve real-world geometry and measurement problems.",
    orderIndex: 6,
  },
  {
    slug: "module-10-lesson-7",
    title: "Exponential Equations",
    description: "Solve exponential equations by writing both sides with a common base. Apply properties of exponents to rewrite exponential expressions. Interpret exponential models in real-world contexts involving growth and decay. Use exponential equations to solve for unknown quantities in applied problems.",
    orderIndex: 7,
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

export const seedModule10Lessons = internalMutation({
  args: {},
  handler: async (ctx): Promise<SeedModule10Result> => {
    const now = Date.now();
    const results: SeedModule10Result["lessons"] = [];

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
            unitNumber: 10,
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