import { computeMasteryColor, type CellColor } from './gradebook';

export type { CellColor };

export interface UnitColumn {
  unitNumber: number;
}

export interface CourseOverviewCell {
  unitNumber: number;
  avgMastery: number | null;
  color: CellColor;
}

export interface CourseOverviewRow {
  studentId: string;
  displayName: string;
  username: string;
  cells: CourseOverviewCell[];
}

export interface RawCOLesson        { id: string; unitNumber: number }
export interface RawCOLessonVersion { id: string; lessonId: string }
export interface RawCOLessonStandard { lessonVersionId: string; standardId: string; isPrimary: boolean }
export interface RawCOStudent        { id: string; username: string; displayName: string | null }
export interface RawCOCompetency     { studentId: string; standardId: string; masteryLevel: number }

export function assembleCourseOverviewRows(
  students: RawCOStudent[],
  rawLessons: RawCOLesson[],
  rawLessonVersions: RawCOLessonVersion[],
  rawPrimaryStandards: RawCOLessonStandard[],
  competencyRows: RawCOCompetency[],
): { rows: CourseOverviewRow[]; units: UnitColumn[] } {
  const unitNumbers = [...new Set(rawLessons.map(l => l.unitNumber))].sort((a, b) => a - b);
  const units: UnitColumn[] = unitNumbers.map(n => ({ unitNumber: n }));

  const unitByLesson   = new Map<string, number>(rawLessons.map(l => [l.id, l.unitNumber]));
  const lessonByVersion = new Map<string, string>(rawLessonVersions.map(lv => [lv.id, lv.lessonId]));

  const standardsByUnit = new Map<number, Set<string>>();
  for (const ls of rawPrimaryStandards) {
    if (!ls.isPrimary) continue;
    const lessonId = lessonByVersion.get(ls.lessonVersionId);
    if (!lessonId) continue;
    const unitNumber = unitByLesson.get(lessonId);
    if (unitNumber == null) continue;
    const set = standardsByUnit.get(unitNumber) ?? new Set<string>();
    set.add(ls.standardId);
    standardsByUnit.set(unitNumber, set);
  }

  const competencyIndex = new Map<string, number>();
  for (const row of competencyRows) {
    competencyIndex.set(`${row.studentId}|${row.standardId}`, row.masteryLevel);
  }

  const rows: CourseOverviewRow[] = students.map(student => {
    const cells: CourseOverviewCell[] = unitNumbers.map(unitNumber => {
      const standardIds = standardsByUnit.get(unitNumber);
      if (!standardIds || standardIds.size === 0) {
        return { unitNumber, avgMastery: null, color: 'gray' };
      }

      const values: number[] = [];
      for (const stdId of standardIds) {
        const level = competencyIndex.get(`${student.id}|${stdId}`);
        if (level != null) values.push(level);
      }

      if (values.length === 0) {
        return { unitNumber, avgMastery: null, color: 'gray' };
      }

      const avg = Math.round(values.reduce((s, v) => s + v, 0) / values.length);
      return { unitNumber, avgMastery: avg, color: computeMasteryColor(avg) };
    });

    return {
      studentId: student.id,
      displayName: student.displayName ?? student.username,
      username: student.username,
      cells,
    };
  });

  return { rows, units };
}
