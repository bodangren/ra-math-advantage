export interface StudentDashboardLesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description?: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
}

export interface StudentDashboardUnit {
  unitNumber: number;
  unitTitle: string;
  lessons: StudentDashboardLesson[];
}

export type LessonStatus = 'not_started' | 'in_progress' | 'completed';
type UnitStatus = LessonStatus;

export interface DashboardLessonAction extends StudentDashboardLesson {
  status: LessonStatus;
  actionLabel: 'Start Lesson' | 'Resume Lesson' | 'Review Lesson';
}

export interface StudentDashboardSummary {
  totalUnits: number;
  completedUnits: number;
  totalLessons: number;
  completedLessons: number;
  inProgressLessons: number;
  progressPercentage: number;
}

export interface StudentDashboardUnitView extends StudentDashboardUnit {
  completedLessons: number;
  progressPercentage: number;
  status: UnitStatus;
  nextLesson: DashboardLessonAction | null;
}

export interface StudentDashboardViewModel {
  summary: StudentDashboardSummary;
  nextLesson: DashboardLessonAction | null;
  units: StudentDashboardUnitView[];
}

/**
 * Clamps a percentage value to the valid range of 0-100.
 * @param value - The value to clamp
 * @returns Clamped percentage value (0-100)
 */
function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Determines the lesson status based on completion data.
 * @param lesson - The lesson to evaluate
 * @returns LessonStatus string (not_started, in_progress, or completed)
 */
function getLessonStatus(lesson: StudentDashboardLesson): LessonStatus {
  if (lesson.totalPhases > 0 && lesson.completedPhases >= lesson.totalPhases) {
    return 'completed';
  }

  if (lesson.completedPhases > 0 || lesson.progressPercentage > 0) {
    return 'in_progress';
  }

  return 'not_started';
}

/**
 * Converts a lesson to a DashboardLessonAction with status and action label.
 * @param lesson - The lesson to convert
 * @returns DashboardLessonAction or null if not applicable
 */
function toLessonAction(lesson: StudentDashboardLesson): DashboardLessonAction | null {
  const status = getLessonStatus(lesson);

  return {
    ...lesson,
    status,
    actionLabel: status === 'in_progress' ? 'Resume Lesson' : status === 'completed' ? 'Review Lesson' : 'Start Lesson',
  };
}

/**
 * Determines the overall unit status based on lesson progress.
 * @param lessons - Array of lessons in the unit
 * @param completedLessons - Number of lessons completed
 * @param nextLesson - The next recommended lesson or null
 * @returns UnitStatus string
 */
function getUnitStatus(
  lessons: StudentDashboardLesson[],
  completedLessons: number,
  nextLesson: DashboardLessonAction | null,
): UnitStatus {
  if (lessons.length > 0 && completedLessons === lessons.length) {
    return 'completed';
  }

  if (nextLesson && nextLesson.status === 'in_progress') {
    return 'in_progress';
  }

  if (completedLessons > 0) {
    return 'in_progress';
  }

  return 'not_started';
}

/**
 * Builds the complete student dashboard view model from unit data.
 * @param units - Array of student dashboard units with lesson information
 * @returns Complete view model with summary, next lesson, and unit details
 */
export function buildStudentDashboardViewModel(
  units: StudentDashboardUnit[],
): StudentDashboardViewModel {
  let completedPhases = 0;
  let totalPhases = 0;
  let completedLessons = 0;
  let inProgressLessons = 0;

  const unitViews = units.map<StudentDashboardUnitView>((unit) => {
    const lessons = [...unit.lessons];

    for (const lesson of lessons) {
      completedPhases += lesson.completedPhases;
      totalPhases += lesson.totalPhases;

      const status = getLessonStatus(lesson);
      if (status === 'completed') completedLessons += 1;
      if (status === 'in_progress') inProgressLessons += 1;
    }

    const lessonActions = lessons.map(toLessonAction).filter((l): l is DashboardLessonAction => l !== null);
    
    const nextLesson =
      lessonActions.find((lesson) => lesson.status === 'in_progress') ??
      lessonActions.find((lesson) => lesson.status === 'not_started') ??
      null;

    const unitCompletedLessons = lessons.filter((lesson) => getLessonStatus(lesson) === 'completed').length;
    const unitCompletedPhases = lessons.reduce(
      (sum, lesson) => sum + lesson.completedPhases,
      0,
    );
    const unitTotalPhases = lessons.reduce(
      (sum, lesson) => sum + lesson.totalPhases,
      0,
    );
    const unitProgress =
      unitTotalPhases === 0
        ? 0
        : clampPercentage((unitCompletedPhases / unitTotalPhases) * 100);

    return {
      ...unit,
      lessons,
      completedLessons: unitCompletedLessons,
      progressPercentage: unitProgress,
      status: getUnitStatus(lessons, unitCompletedLessons, nextLesson),
      nextLesson,
    };
  });

  const nextLesson =
    unitViews
      .map((unit) => unit.nextLesson)
      .find((lesson): lesson is DashboardLessonAction => lesson?.status === 'in_progress') ??
    unitViews
      .map((unit) => unit.nextLesson)
      .find((lesson): lesson is DashboardLessonAction => lesson?.status === 'not_started') ??
    null;

  return {
    summary: {
      totalUnits: unitViews.length,
      completedUnits: unitViews.filter((unit) => unit.status === 'completed').length,
      totalLessons: unitViews.reduce((sum, unit) => sum + unit.lessons.length, 0),
      completedLessons,
      inProgressLessons,
      progressPercentage:
        totalPhases === 0 ? 0 : clampPercentage((completedPhases / totalPhases) * 100),
    },
    nextLesson,
    units: unitViews,
  };
}
