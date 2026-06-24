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

/**
 * Compute overall lesson completion status from phase progress statuses.
 * @param {PhaseProgressStatus[]} phaseStatuses - Array of individual phase statuses
 * @returns {LessonCompletionStatus} - Lesson completion status
 */
export function computeLessonStatus(phaseStatuses: PhaseProgressStatus[]): LessonCompletionStatus {
  if (phaseStatuses.length === 0) return 'not_started';
  if (phaseStatuses.every(s => s === 'completed' || s === 'skipped')) return 'completed';
  if (phaseStatuses.some(s => s === 'completed' || s === 'in_progress' || s === 'skipped')) return 'in_progress';
  return 'not_started';
}

/**
 * Determine cell color based on lesson completion status and mastery level.
 * @param {LessonCompletionStatus} completionStatus - The lesson completion status
 * @param {number | null} masteryLevel - Optional mastery percentage (0-100)
 * @returns {CellColor} - Cell color indicator
 */
export function computeCellColor(
  completionStatus: LessonCompletionStatus,
  masteryLevel: number | null,
): CellColor {
  if (completionStatus === 'not_started') return 'gray';
  if (completionStatus === 'completed' || (masteryLevel !== null && masteryLevel >= 80)) {
    return 'green';
  }
  if (completionStatus === 'in_progress' || (masteryLevel !== null && masteryLevel >= 50)) {
    return 'yellow';
  }
  return 'red';
}

/**
 * Map a mastery level to a cell color.
 * @param {number | null} masteryLevel - Mastery percentage (0-100) or null
 * @returns {CellColor} - Cell color indicator
 */
export function computeMasteryColor(masteryLevel: number | null): CellColor {
  if (masteryLevel === null) return 'gray';
  if (masteryLevel >= 80) return 'green';
  if (masteryLevel >= 50) return 'yellow';
  return 'red';
}

/**
 * Build a gradebook cell by computing status and color from phase data.
 * @param {GradebookLesson} lesson - The gradebook lesson metadata
 * @param {PhaseProgressStatus[]} phases - Array of phase progress statuses
 * @param {number | null} masteryLevel - Optional mastery percentage
 * @returns {GradebookCell} - Fully computed gradebook cell
 */
export function buildGradebookCell(
  lesson: GradebookLesson,
  phases: PhaseProgressStatus[],
  masteryLevel: number | null,
): GradebookCell {
  const completionStatus = computeLessonStatus(phases);
  const color = computeCellColor(completionStatus, masteryLevel);
  return { lesson, completionStatus, masteryLevel, color };
}

/**
 * Sort gradebook rows alphabetically by display name.
 * @param {GradebookRow[]} rows - Gradebook rows to sort
 * @returns {GradebookRow[]} - New array sorted by display name
 */
export function sortRowsByName(rows: GradebookRow[]): GradebookRow[] {
  return [...rows].sort((a, b) => {
    const nameA = a.displayName.toLowerCase();
    const nameB = b.displayName.toLowerCase();
    if (nameA < nameB) return -1;
    if (nameA > nameB) return 1;
    return 0;
  });
}

/**
 * Map a cell color to a Tailwind background and text class string.
 * @param {CellColor} color - Cell color indicator
 * @returns {string} - Tailwind CSS class string
 */
export function cellBgClass(color: CellColor): string {
  switch (color) {
    case 'green':  return 'bg-green-100 text-green-800';
    case 'yellow': return 'bg-yellow-100 text-yellow-800';
    case 'red':    return 'bg-red-100 text-red-800';
    case 'gray':
    default:       return 'bg-muted/30 text-muted-foreground';
  }
}

/**
 * Map a cell color to a human-readable status label.
 * @param {CellColor} color - Cell color indicator
 * @returns {string} - Status label string
 */
export function cellColorLabel(color: CellColor): string {
  switch (color) {
    case 'green':  return 'completed';
    case 'yellow': return 'in progress';
    case 'red':    return 'needs attention';
    case 'gray':
    default:       return 'not started';
  }
}

/**
 * Apply a student row update by removing deactivated students or updating names.
 * @param {T[]} rows - Current gradebook rows
 * @param {{ studentId: string; displayName: string; deactivated: boolean }} update - Student update with id, displayName, and deactivated flag
 * @returns {T[]} - Updated rows array
 */
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
  status?: 'draft' | 'review' | 'published' | 'archived';
  version?: number;
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

/**
 * Assemble complete gradebook rows from raw student, lesson, and progress data.
 * @param {RawStudent[]} students - Raw student records
 * @param {RawLesson[]} rawLessons - Raw lesson records
 * @param {RawLessonVersion[]} rawLessonVersions - Raw lesson version records
 * @param {RawPhaseVersion[]} rawPhaseVersions - Raw phase version records
 * @param {RawLessonStandard[]} rawPrimaryStandards - Raw lesson-standard associations
 * @param {RawProgressRow[]} progressRows - Raw phase progress rows
 * @param {RawCompetencyRow[]} competencyRows - Raw competency rows
 * @returns {{ rows: GradebookRow[]; lessons: GradebookLesson[] }} - Assembled gradebook rows and lesson metadata
 */
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
  const statusPriority: Record<string, number> = { published: 0, review: 1, draft: 2, archived: 3 };
  for (const lv of rawLessonVersions) {
    const existing = versionByLessonId.get(lv.lessonId);
    if (!existing) {
      versionByLessonId.set(lv.lessonId, lv.id);
      continue;
    }

    const existingVersion = rawLessonVersions.find(v => v.id === existing);
    const existingPriority = existingVersion?.status ? (statusPriority[existingVersion.status] ?? 4) : 4;
    const newPriority = lv.status ? (statusPriority[lv.status] ?? 4) : 4;

    if (newPriority < existingPriority) {
      versionByLessonId.set(lv.lessonId, lv.id);
    } else if (newPriority === existingPriority) {
      const existingVersionNum = existingVersion?.version ?? 0;
      const newVersionNum = lv.version ?? 0;
      if (newVersionNum > existingVersionNum) {
        versionByLessonId.set(lv.lessonId, lv.id);
      }
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
