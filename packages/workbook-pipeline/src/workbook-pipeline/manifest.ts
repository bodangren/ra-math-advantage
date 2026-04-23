export interface WorkbookManifest {
  version: number;
  generatedAt: string;
  files: string[];
  byUnitAndLesson: Record<string, { student: boolean; teacher: boolean }>;
  byCapstone: { student: boolean; teacher: boolean };
}

export interface ParsedWorkbookEntry {
  unitNumber: number;
  lessonNumber: number;
  type: 'student' | 'teacher';
}

export function parseUnitLessonFilename(
  filename: string
): ParsedWorkbookEntry | null {
  const match = filename.match(/^unit_(\d+)_lesson_(\d+)_(student|teacher)\.xlsx$/);
  if (!match) {
    return null;
  }
  const [, unitStr, lessonStr, type] = match;
  return {
    unitNumber: parseInt(unitStr, 10),
    lessonNumber: parseInt(lessonStr, 10),
    type: type as 'student' | 'teacher',
  };
}

export function isCapstoneFilename(filename: string): boolean {
  return /^capstone_.+\.xlsx$/.test(filename);
}

export function parseCapstoneType(
  filename: string
): 'student' | 'teacher' | null {
  if (!isCapstoneFilename(filename)) {
    return null;
  }
  if (filename.endsWith('_teacher.xlsx')) {
    return 'teacher';
  }
  return 'student';
}

export function buildUnitLessonKey(
  unitNumber: number,
  lessonNumber: number
): string {
  return `${unitNumber}-${lessonNumber}`;
}

export function validateWorkbookManifest(value: unknown): WorkbookManifest {
  if (typeof value !== 'object' || value === null) {
    throw new TypeError('WorkbookManifest must be an object');
  }
  const obj = value as Record<string, unknown>;

  if (typeof obj.version !== 'number') {
    throw new TypeError('WorkbookManifest.version must be a number');
  }
  if (typeof obj.generatedAt !== 'string') {
    throw new TypeError('WorkbookManifest.generatedAt must be a string');
  }
  if (!Array.isArray(obj.files) || !obj.files.every((f) => typeof f === 'string')) {
    throw new TypeError('WorkbookManifest.files must be an array of strings');
  }
  if (typeof obj.byUnitAndLesson !== 'object' || obj.byUnitAndLesson === null) {
    throw new TypeError('WorkbookManifest.byUnitAndLesson must be an object');
  }

  const byUnitAndLesson: Record<string, { student: boolean; teacher: boolean }> = {};
  for (const [key, entry] of Object.entries(obj.byUnitAndLesson)) {
    if (
      typeof entry !== 'object' ||
      entry === null ||
      typeof (entry as Record<string, unknown>).student !== 'boolean' ||
      typeof (entry as Record<string, unknown>).teacher !== 'boolean'
    ) {
      throw new TypeError(
        `WorkbookManifest.byUnitAndLesson["${key}"] must have boolean student and teacher properties`
      );
    }
    byUnitAndLesson[key] = {
      student: (entry as Record<string, unknown>).student as boolean,
      teacher: (entry as Record<string, unknown>).teacher as boolean,
    };
  }

  if (
    typeof obj.byCapstone !== 'object' ||
    obj.byCapstone === null ||
    typeof (obj.byCapstone as Record<string, unknown>).student !== 'boolean' ||
    typeof (obj.byCapstone as Record<string, unknown>).teacher !== 'boolean'
  ) {
    throw new TypeError('WorkbookManifest.byCapstone must have boolean student and teacher properties');
  }

  return {
    version: obj.version,
    generatedAt: obj.generatedAt,
    files: obj.files as string[],
    byUnitAndLesson,
    byCapstone: {
      student: (obj.byCapstone as Record<string, unknown>).student as boolean,
      teacher: (obj.byCapstone as Record<string, unknown>).teacher as boolean,
    },
  };
}