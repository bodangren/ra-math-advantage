export type PhaseProgressStatus = 'not_started' | 'in_progress' | 'completed' | 'skipped';
export type LessonCompletionStatus = 'not_started' | 'in_progress' | 'completed';
export type CellColor = 'green' | 'yellow' | 'red' | 'gray';

export interface GradebookLesson {
  lessonId: string;
  lessonTitle: string;
  orderIndex: number;
  isUnitTest: boolean;
}

export interface GradebookCell {
  lesson: GradebookLesson;
  completionStatus: LessonCompletionStatus;
  masteryLevel: number | null;
  color: CellColor;
}

export interface GradebookRow {
  studentId: string;
  displayName: string;
  username: string;
  cells: GradebookCell[];
}

export function computeLessonStatus(phaseStatuses: PhaseProgressStatus[]): LessonCompletionStatus {
  if (phaseStatuses.length === 0) return 'not_started';
  if (phaseStatuses.every(s => s === 'completed' || s === 'skipped')) return 'completed';
  if (phaseStatuses.some(s => s === 'completed' || s === 'in_progress' || s === 'skipped')) return 'in_progress';
  return 'not_started';
}

export function computeCellColor(
  completionStatus: LessonCompletionStatus,
  masteryLevel: number | null,
): CellColor {
  if (completionStatus === 'not_started' && masteryLevel === null) return 'gray';
  if (completionStatus === 'completed' || (masteryLevel !== null && masteryLevel >= 80)) {
    return 'green';
  }
  if (completionStatus === 'in_progress' || (masteryLevel !== null && masteryLevel >= 50)) {
    return 'yellow';
  }
  return 'red';
}

export function buildGradebookCell(
  lesson: GradebookLesson,
  phases: PhaseProgressStatus[],
  masteryLevel: number | null,
): GradebookCell {
  const completionStatus = computeLessonStatus(phases);
  const color = computeCellColor(completionStatus, masteryLevel);
  return { lesson, completionStatus, masteryLevel, color };
}

export function sortRowsByName(rows: GradebookRow[]): GradebookRow[] {
  return [...rows].sort((a, b) => {
    const nameA = a.displayName.toLowerCase();
    const nameB = b.displayName.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

export function cellBgClass(color: CellColor): string {
  switch (color) {
    case 'green':  return 'bg-green-100 text-green-800';
    case 'yellow': return 'bg-yellow-100 text-yellow-800';
    case 'red':    return 'bg-red-100 text-red-800';
    case 'gray':
    default:       return 'bg-muted/30 text-muted-foreground';
  }
}

export function cellColorLabel(color: CellColor): string {
  switch (color) {
    case 'green':  return 'completed';
    case 'yellow': return 'in progress';
    case 'red':    return 'needs attention';
    case 'gray':
    default:       return 'not started';
  }
}

export function applyStudentRowUpdate<T extends { studentId: string; displayName: string }>(
  rows: T[],
  update: { studentId: string; displayName: string; deactivated: boolean },
): T[] {
  if (update.deactivated) {
    return rows.filter(r => r.studentId !== update.studentId);
  }
  return rows.map(r =>
    r.studentId === update.studentId ? { ...r, displayName: update.displayName } : r,
  );
}

export interface RawLesson {
  id: string;
  title: string;
  orderIndex: number;
  unitNumber: number;
  isUnitTest?: boolean;
}

export interface RawLessonVersion {
  id: string;
  lessonId: string;
}

export interface RawPhaseVersion {
  id: string;
  lessonVersionId: string;
  phaseNumber: number;
}

export interface RawLessonStandard {
  lessonVersionId: string;
  standardId: string;
  isPrimary: boolean;
}

export interface RawStudent {
  id: string;
  username: string;
  displayName: string | null;
}

export interface RawProgressRow {
  userId: string;
  phaseId: string;
  status: PhaseProgressStatus;
}

export interface RawCompetencyRow {
  studentId: string;
  standardId: string;
  masteryLevel: number;
}

export function assembleGradebookRows(
  students: RawStudent[],
  rawLessons: RawLesson[],
  rawLessonVersions: RawLessonVersion[],
  rawPhaseVersions: RawPhaseVersion[],
  rawPrimaryStandards: RawLessonStandard[],
  progressRows: RawProgressRow[],
  competencyRows: RawCompetencyRow[],
): { rows: GradebookRow[]; lessons: GradebookLesson[] } {
  const sortedLessons = [...rawLessons].sort((a, b) => a.orderIndex - b.orderIndex);

  const versionByLessonId = new Map<string, string>();
  for (const lv of rawLessonVersions) {
    if (!versionByLessonId.has(lv.lessonId)) {
      versionByLessonId.set(lv.lessonId, lv.id);
    }
  }

  const phasesByVersion = new Map<string, string[]>();
  const sortedPhases = [...rawPhaseVersions].sort((a, b) => a.phaseNumber - b.phaseNumber);
  for (const pv of sortedPhases) {
    const list = phasesByVersion.get(pv.lessonVersionId) ?? [];
    list.push(pv.id);
    phasesByVersion.set(pv.lessonVersionId, list);
  }

  const primaryStandardByVersion = new Map<string, string>();
  for (const ls of rawPrimaryStandards) {
    if (ls.isPrimary) {
      primaryStandardByVersion.set(ls.lessonVersionId, ls.standardId);
    }
  }

  const progressIndex = new Map<string, PhaseProgressStatus>();
  for (const row of progressRows) {
    progressIndex.set(`${row.userId}|${row.phaseId}`, row.status);
  }

  const competencyIndex = new Map<string, number>();
  for (const row of competencyRows) {
    competencyIndex.set(`${row.studentId}|${row.standardId}`, row.masteryLevel);
  }

  const gradebookLessons: GradebookLesson[] = sortedLessons.map(lesson => ({
    lessonId: lesson.id,
    lessonTitle: lesson.title,
    orderIndex: lesson.orderIndex,
    isUnitTest: lesson.isUnitTest ?? false,
  }));

  const rows: GradebookRow[] = students.map(student => {
    const cells = gradebookLessons.map(gl => {
      const lessonVersionId = versionByLessonId.get(gl.lessonId);
      const phaseIds = lessonVersionId ? (phasesByVersion.get(lessonVersionId) ?? []) : [];
      const standardId = lessonVersionId
        ? primaryStandardByVersion.get(lessonVersionId)
        : undefined;

      const phaseStatuses: PhaseProgressStatus[] = phaseIds.map(
        phaseId => progressIndex.get(`${student.id}|${phaseId}`) ?? 'not_started',
      );

      const masteryLevel =
        standardId != null
          ? (competencyIndex.get(`${student.id}|${standardId}`) ?? null)
          : null;

      return buildGradebookCell(gl, phaseStatuses, masteryLevel);
    });

    return {
      studentId: student.id,
      displayName: student.displayName ?? student.username,
      username: student.username,
      cells,
    };
  });

  return { rows, lessons: gradebookLessons };
}
