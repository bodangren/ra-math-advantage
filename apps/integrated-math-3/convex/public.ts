import { query } from "./_generated/server";
import { coerceNullableString, getOrCreateMapEntry } from "./dashboardHelpers";
import { buildLatestPublishedLessonVersionMap } from "../lib/progress/published-curriculum";

interface PublicCurriculumLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
}

interface PublicCurriculumUnit {
  unitNumber: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: PublicCurriculumLesson[];
}

/**
 * Checks whether a lesson is a capstone lesson based on its metadata tags.
 * @param {{ metadata?: { tags?: string[] | null } | null }} lesson - The lesson object with optional metadata
 * @returns {boolean} True if the lesson has a 'capstone' tag
 */
function isCapstoneLesson(lesson: { metadata?: { tags?: string[] | null } | null }) {
  return Boolean(lesson.metadata?.tags?.includes("capstone"));
}

/**
 * Public query that returns aggregate curriculum counts (unit, lesson,
 * activity) for the marketing landing page.
 * @returns {Promise<{ unitCount: number; lessonCount: number; activityCount: number }>} Aggregate counts
 */
export const getCurriculumStats = query({
  args: {},
  handler: async (ctx) => {
    const lessons = await ctx.db.query("lessons").collect();
    const activities = await ctx.db.query("activities").collect();

    const instructionalLessons = lessons.filter((lesson) => !isCapstoneLesson(lesson));
    const uniqueUnits = new Set(instructionalLessons.map((lesson) => lesson.unitNumber));

    return {
      unitCount: uniqueUnits.size,
      lessonCount: lessons.length,
      activityCount: activities.length,
    };
  },
});

/** Returns published lessons for the public curriculum browser. */
export const getCurriculum = query({
  args: {},
  handler: async (ctx) => {
    const lessonRows = await ctx.db.query("lessons").collect();

    lessonRows.sort((a, b) => {
      if (a.unitNumber !== b.unitNumber) return a.unitNumber - b.unitNumber;
      return a.orderIndex - b.orderIndex;
    });

    const allVersions = await ctx.db.query("lesson_versions").collect();
    const lessonIds = lessonRows.map((l) => l._id);
    const versionMap = buildLatestPublishedLessonVersionMap(allVersions, lessonIds);

    const units = new Map<number, PublicCurriculumUnit>();

    for (const lesson of lessonRows) {
      const latestVersion = versionMap.get(lesson._id) ?? null;
      if (!latestVersion) continue;

      const effectiveTitle = latestVersion?.title ?? lesson.title;
      const effectiveDescription = coerceNullableString(
        latestVersion?.description ?? lesson.description,
      );

      const unit = getOrCreateMapEntry(units, lesson.unitNumber, () => {
        const rawTitle =
          lesson.metadata?.unitContent?.introduction?.unitTitle ??
          lesson.metadata?.unitContent?.introduction?.unitNumber ??
          null;

        const unitTitle = rawTitle ?? `Unit ${lesson.unitNumber}`;
        const unitDesc =
          lesson.metadata?.unitContent?.drivingQuestion?.question ??
          lesson.metadata?.unitContent?.introduction?.projectOverview?.scenario ??
          effectiveDescription ??
          "Explore algebra, functions, statistics, and trigonometry.";

        const objectives =
          lesson.metadata?.unitContent?.objectives?.content ?? lesson.learningObjectives ?? [];

        return {
          unitNumber: lesson.unitNumber,
          title: unitTitle,
          description: unitDesc,
          objectives,
          lessons: [],
        };
      });

      unit.lessons.push({
        id: lesson._id,
        title: effectiveTitle,
        slug: lesson.slug,
        description: effectiveDescription,
        orderIndex: lesson.orderIndex,
      });
    }

    return Array.from(units.values());
  },
});
