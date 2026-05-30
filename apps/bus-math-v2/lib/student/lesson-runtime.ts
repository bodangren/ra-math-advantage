import type { DashboardLessonActionLink } from '@/lib/student/dashboard-presentation';
import {
  buildStudentDashboardViewModel,
  type StudentDashboardUnit,
} from '@/lib/student/dashboard';

/**
 * Determines the landing phase for a student entering a lesson.
 * Returns the first incomplete phase, or the last phase if all are done.
 * @param totalPhases - Total number of phases in the lesson
 * @param completedPhaseNumbers - Set of completed phase numbers
 * @returns The recommended phase number to land on
 */
export function resolveLessonLandingPhase({
  totalPhases,
  completedPhaseNumbers,
}: {
  totalPhases: number;
  completedPhaseNumbers: ReadonlySet<number>;
}) {
  if (totalPhases <= 1) {
    return Math.max(totalPhases, 1);
  }

  for (let phaseNumber = 1; phaseNumber <= totalPhases; phaseNumber += 1) {
    if (!completedPhaseNumbers.has(phaseNumber)) {
      return phaseNumber;
    }
  }

  return totalPhases;
}

/**
 * Builds the state for the lesson continue prompt shown to students.
 * @param units - Dashboard units containing lesson information
 * @param currentLessonSlug - The currently viewed lesson slug
 * @returns Object with recommendedLesson or null if none available
 */
export function buildLessonContinueState(
  units: StudentDashboardUnit[],
  currentLessonSlug: string,
): { recommendedLesson: DashboardLessonActionLink | null } {
  const dashboard = buildStudentDashboardViewModel(units);
  const nextLesson = dashboard.nextLesson;

  if (!nextLesson || nextLesson.slug === currentLessonSlug) {
    return { recommendedLesson: null };
  }

  return {
    recommendedLesson: {
      unitNumber: nextLesson.unitNumber,
      title: nextLesson.title,
      slug: nextLesson.slug,
      description: nextLesson.description,
      actionLabel: nextLesson.actionLabel,
    },
  };
}
