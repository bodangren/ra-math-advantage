export interface CompetencyHeatmapRow {
  studentId: string;
  displayName: string;
  username: string;
  cells: CompetencyHeatmapCell[];
}

export interface CompetencyHeatmapCell {
  standardId: string;
  standardCode: string;
  standardDescription: string;
  category: string | null;
  masteryLevel: number | null;
  color: CompetencyCellColor;
}

export interface CompetencyStandard {
  id: string;
  code: string;
  description: string;
  studentFriendlyDescription: string | null;
  category: string | null;
}

export interface CompetencyHeatmapResponse {
  rows: CompetencyHeatmapRow[];
  standards: CompetencyStandard[];
}

export interface StudentCompetencyDetail {
  studentId: string;
  displayName: string;
  username: string;
  competencies: StudentCompetency[];
}

export interface StudentCompetency {
  standardId: string;
  standardCode: string;
  standardDescription: string;
  category: string | null;
  masteryLevel: number | null;
  evidenceActivityId: string | null;
  lastUpdated: number | null;
  updatedBy: string | null;
  unitNumber: number | null;
  lessonTitle: string | null;
}

export interface RawCHStudent {
  id: string;
  username: string;
  displayName: string | null;
}

export interface RawCHStandard {
  id: string;
  code: string;
  description: string;
  studentFriendlyDescription: string | null;
  category: string | null;
  isActive: boolean;
}

export interface RawCHCompetency {
  studentId: string;
  standardId: string;
  masteryLevel: number;
  evidenceActivityId: string | null;
  lastUpdated: number;
  updatedBy: string | null;
}

export interface RawCHLessonStandard {
  standardId: string;
  lessonVersionId: string;
  isPrimary: boolean;
}

export interface RawCHLessonVersion {
  id: string;
  lessonId: string;
}

export interface RawCHLesson {
  id: string;
  unitNumber: number;
  title: string;
}

export type CompetencyCellColor = "green" | "yellow" | "red" | "gray";

export function computeCompetencyColor(masteryLevel: number | null): CompetencyCellColor {
  if (masteryLevel == null) {
    return "gray";
  }
  if (masteryLevel >= 80) {
    return "green";
  }
  if (masteryLevel >= 50) {
    return "yellow";
  }
  return "red";
}

export function assembleCompetencyHeatmapRows(
  students: RawCHStudent[],
  standards: RawCHStandard[],
  competencyRows: RawCHCompetency[],
): CompetencyHeatmapResponse {
  const activeStandards = standards.filter((s) => s.isActive);

  const standardIndex = new Map<string, RawCHStandard>();
  for (const standard of activeStandards) {
    standardIndex.set(standard.id, standard);
  }

  const competencyIndex = new Map<string, number>();
  for (const row of competencyRows) {
    competencyIndex.set(`${row.studentId}|${row.standardId}`, row.masteryLevel);
  }

  const rows: CompetencyHeatmapRow[] = students.map((student) => {
    const cells: CompetencyHeatmapCell[] = activeStandards.map((standard) => {
      const masteryLevel = competencyIndex.get(`${student.id}|${standard.id}`) ?? null;
      return {
        standardId: standard.id,
        standardCode: standard.code,
        standardDescription: standard.description,
        category: standard.category,
        masteryLevel,
        color: computeCompetencyColor(masteryLevel),
      };
    });

    return {
      studentId: student.id,
      displayName: student.displayName ?? student.username,
      username: student.username,
      cells,
    };
  });

  const responseStandards: CompetencyStandard[] = activeStandards.map((standard) => ({
    id: standard.id,
    code: standard.code,
    description: standard.description,
    studentFriendlyDescription: standard.studentFriendlyDescription,
    category: standard.category,
  }));

  return { rows, standards: responseStandards };
}

export function assembleStudentCompetencyDetail(
  student: RawCHStudent,
  standards: RawCHStandard[],
  competencyRows: RawCHCompetency[],
  lessonStandards: RawCHLessonStandard[],
  lessonVersions: RawCHLessonVersion[],
  lessons: RawCHLesson[],
): StudentCompetencyDetail {
  const activeStandards = standards.filter((s) => s.isActive);

  const standardIndex = new Map<string, RawCHStandard>();
  for (const standard of activeStandards) {
    standardIndex.set(standard.id, standard);
  }

  const competencyByStandard = new Map<string, RawCHCompetency>();
  for (const row of competencyRows) {
    if (row.studentId === student.id) {
      competencyByStandard.set(row.standardId, row);
    }
  }

  const lessonByVersion = new Map<string, string>();
  for (const lv of lessonVersions) {
    lessonByVersion.set(lv.id, lv.lessonId);
  }

  const lessonById = new Map<string, RawCHLesson>();
  for (const lesson of lessons) {
    lessonById.set(lesson.id, lesson);
  }

  const standardContext = new Map<string, { unitNumber: number; lessonTitle: string }>();
  for (const ls of lessonStandards) {
    if (!ls.isPrimary) continue;

    const lessonId = lessonByVersion.get(ls.lessonVersionId);
    if (!lessonId) continue;

    const lesson = lessonById.get(lessonId);
    if (!lesson) continue;

    standardContext.set(ls.standardId, {
      unitNumber: lesson.unitNumber,
      lessonTitle: lesson.title,
    });
  }

  const competencies: StudentCompetency[] = activeStandards.map((standard) => {
    const competency = competencyByStandard.get(standard.id);
    const context = standardContext.get(standard.id);

    return {
      standardId: standard.id,
      standardCode: standard.code,
      standardDescription: standard.description,
      category: standard.category,
      masteryLevel: competency?.masteryLevel ?? null,
      evidenceActivityId: competency?.evidenceActivityId ?? null,
      lastUpdated: competency?.lastUpdated ?? null,
      updatedBy: competency?.updatedBy ?? null,
      unitNumber: context?.unitNumber ?? null,
      lessonTitle: context?.lessonTitle ?? null,
    };
  });

  return {
    studentId: student.id,
    displayName: student.displayName ?? student.username,
    username: student.username,
    competencies,
  };
}
