export interface StudentDashboardLesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description?: string | null;
  completedPhases: number;
  totalPhases: number;
  progressPercentage: number;
  estimatedMinutes?: number;
  isLocked: boolean;
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
  actionLabel: 'Start Lesson' | 'Resume Lesson';
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
  continueUrl: string | null;
}

function clampPercentage(value: number) {
  if (Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
}

function getLessonStatus(lesson: StudentDashboardLesson): LessonStatus {
  if (lesson.totalPhases > 0 && lesson.completedPhases >= lesson.totalPhases) {
    return 'completed';
  }

  if (lesson.completedPhases > 0 || lesson.progressPercentage > 0) {
    return 'in_progress';
  }

  return 'not_started';
}

function toLessonAction(lesson: StudentDashboardLesson): DashboardLessonAction | null {
  const status = getLessonStatus(lesson);

  if (status === 'completed') {
    return null;
  }

  return {
    ...lesson,
    status,
    actionLabel: status === 'in_progress' ? 'Resume Lesson' : 'Start Lesson',
  };
}

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

export function buildStudentDashboardViewModel(
  units: StudentDashboardUnit[],
): StudentDashboardViewModel {
  let completedPhases = 0;
  let totalPhases = 0;
  let completedLessons = 0;
  let inProgressLessons = 0;

  const allLessonsFlat: StudentDashboardLesson[] = [];
  for (const unit of units) {
    for (const lesson of unit.lessons) {
      allLessonsFlat.push(lesson);
    }
  }

  const isLessonUnlocked = (lessonIndex: number): boolean => {
    if (lessonIndex === 0) return true;
    const previousLesson = allLessonsFlat[lessonIndex - 1];
    return previousLesson.totalPhases > 0 && previousLesson.completedPhases >= previousLesson.totalPhases;
  };

  const unitViews = units.map<StudentDashboardUnitView>((unit) => {
    const lessonsWithLock: StudentDashboardLesson[] = unit.lessons.map((lesson) => {
      const globalIndex = allLessonsFlat.findIndex(l => l.id === lesson.id);
      return {
        ...lesson,
        isLocked: !isLessonUnlocked(globalIndex),
      };
    });

    for (const lesson of lessonsWithLock) {
      completedPhases += lesson.completedPhases;
      totalPhases += lesson.totalPhases;

      const status = getLessonStatus(lesson);
      if (status === 'completed') completedLessons += 1;
      if (status === 'in_progress') inProgressLessons += 1;
    }

    const nextLesson =
      lessonsWithLock.map(toLessonAction).find((lesson): lesson is DashboardLessonAction => lesson?.status === 'in_progress') ??
      lessonsWithLock.map(toLessonAction).find((lesson): lesson is DashboardLessonAction => lesson?.status === 'not_started') ??
      null;

    const unitCompletedLessons = lessonsWithLock.filter((lesson) => getLessonStatus(lesson) === 'completed').length;
    const unitCompletedPhases = lessonsWithLock.reduce(
      (sum, lesson) => sum + lesson.completedPhases,
      0,
    );
    const unitTotalPhases = lessonsWithLock.reduce(
      (sum, lesson) => sum + lesson.totalPhases,
      0,
    );
    const unitProgress =
      unitTotalPhases === 0
        ? 0
        : clampPercentage((unitCompletedPhases / unitTotalPhases) * 100);

    return {
      ...unit,
      lessons: lessonsWithLock,
      completedLessons: unitCompletedLessons,
      progressPercentage: unitProgress,
      status: getUnitStatus(lessonsWithLock, unitCompletedLessons, nextLesson),
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

  const allComplete = allLessonsFlat.length > 0 && allLessonsFlat.every(
    lesson => lesson.totalPhases > 0 && lesson.completedPhases >= lesson.totalPhases
  );

  let continueUrl: string | null = null;
  if (allLessonsFlat.length === 0) {
    continueUrl = null;
  } else if (allComplete) {
    continueUrl = '/student/dashboard?complete=module-1';
  } else {
    const firstIncomplete = allLessonsFlat.find(
      lesson => lesson.totalPhases === 0 || lesson.completedPhases < lesson.totalPhases
    );
    if (firstIncomplete) {
      const nextPhase = (firstIncomplete.completedPhases || 0) + 1;
      continueUrl = `/student/lesson/${firstIncomplete.slug}?phase=${nextPhase}`;
    }
  }

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
    continueUrl,
  };
}
