import { describe, it, expect } from 'vitest';
import {
  computeLessonStatus,
  computeCellColor,
  buildGradebookCell,
  sortRowsByName,
  cellBgClass,
  cellColorLabel,
  applyStudentRowUpdate,
  assembleGradebookRows,
  type PhaseProgressStatus,
  type GradebookLesson,
  type GradebookRow,
  type RawStudent,
  type RawLesson,
  type RawLessonVersion,
  type RawPhaseVersion,
  type RawLessonStandard,
  type RawProgressRow,
  type RawCompetencyRow,
} from '../teacher-reporting/gradebook';

describe('computeLessonStatus', () => {
  it('returns not_started for empty array', () => {
    expect(computeLessonStatus([])).toBe('not_started');
  });

  it('returns completed when all phases are completed', () => {
    const statuses: PhaseProgressStatus[] = ['completed', 'completed', 'completed'];
    expect(computeLessonStatus(statuses)).toBe('completed');
  });

  it('returns in_progress when some phases are completed but not all', () => {
    const statuses: PhaseProgressStatus[] = ['completed', 'in_progress'];
    expect(computeLessonStatus(statuses)).toBe('in_progress');
  });

  it('returns not_started when all phases are not_started', () => {
    const statuses: PhaseProgressStatus[] = ['not_started', 'not_started'];
    expect(computeLessonStatus(statuses)).toBe('not_started');
  });

  it('returns in_progress when at least one phase is in_progress', () => {
    const statuses: PhaseProgressStatus[] = ['not_started', 'in_progress', 'not_started'];
    expect(computeLessonStatus(statuses)).toBe('in_progress');
  });

  it('returns completed when all phases are completed or skipped', () => {
    const statuses: PhaseProgressStatus[] = ['completed', 'skipped', 'completed'];
    expect(computeLessonStatus(statuses)).toBe('completed');
  });
});

describe('computeCellColor', () => {
  it('returns gray when not_started and no mastery level', () => {
    expect(computeCellColor('not_started', null)).toBe('gray');
  });

  it('returns green when completed regardless of mastery', () => {
    expect(computeCellColor('completed', null)).toBe('green');
    expect(computeCellColor('completed', 50)).toBe('green');
    expect(computeCellColor('completed', 100)).toBe('green');
  });

  it('returns green when mastery level >= 80 with progress', () => {
    expect(computeCellColor('in_progress', 80)).toBe('green');
  });

  it('returns gray for not_started regardless of mastery', () => {
    expect(computeCellColor('not_started', 95)).toBe('gray');
    expect(computeCellColor('not_started', 50)).toBe('gray');
    expect(computeCellColor('not_started', 49)).toBe('gray');
  });

  it('returns yellow when in_progress', () => {
    expect(computeCellColor('in_progress', null)).toBe('yellow');
  });

  it('returns yellow when mastery level 50-79', () => {
    expect(computeCellColor('in_progress', 50)).toBe('yellow');
    expect(computeCellColor('in_progress', 79)).toBe('yellow');
  });
});

describe('buildGradebookCell', () => {
  const lesson: GradebookLesson = {
    lessonId: 'l1',
    lessonTitle: 'Test Lesson',
    orderIndex: 1,
    isUnitTest: false,
  };

  it('builds cell with not_started status for empty phases', () => {
    const cell = buildGradebookCell(lesson, [], null);
    expect(cell.completionStatus).toBe('not_started');
    expect(cell.color).toBe('gray');
    expect(cell.masteryLevel).toBeNull();
  });

  it('builds cell with completed status and green color', () => {
    const cell = buildGradebookCell(lesson, ['completed'], 90);
    expect(cell.completionStatus).toBe('completed');
    expect(cell.color).toBe('green');
    expect(cell.masteryLevel).toBe(90);
  });

  it('builds cell with in_progress status and yellow color', () => {
    const cell = buildGradebookCell(lesson, ['completed', 'in_progress'], 60);
    expect(cell.completionStatus).toBe('in_progress');
    expect(cell.color).toBe('yellow');
  });
});

describe('sortRowsByName', () => {
  const rows: GradebookRow[] = [
    { studentId: 's1', displayName: 'Charlie', username: 'charlie', cells: [] },
    { studentId: 's2', displayName: 'Alice', username: 'alice', cells: [] },
    { studentId: 's3', displayName: 'Bob', username: 'bob', cells: [] },
  ];

  it('sorts rows alphabetically by displayName', () => {
    const sorted = sortRowsByName(rows);
    expect(sorted[0].displayName).toBe('Alice');
    expect(sorted[1].displayName).toBe('Bob');
    expect(sorted[2].displayName).toBe('Charlie');
  });

  it('does not mutate original array', () => {
    const original = [...rows];
    sortRowsByName(rows);
    expect(rows[0].displayName).toBe(original[0].displayName);
  });
});

describe('cellBgClass', () => {
  it('returns correct Tailwind class for green', () => {
    expect(cellBgClass('green')).toBe('bg-green-100 text-green-800');
  });

  it('returns correct Tailwind class for yellow', () => {
    expect(cellBgClass('yellow')).toBe('bg-yellow-100 text-yellow-800');
  });

  it('returns correct Tailwind class for red', () => {
    expect(cellBgClass('red')).toBe('bg-red-100 text-red-800');
  });

  it('returns correct Tailwind class for gray', () => {
    expect(cellBgClass('gray')).toBe('bg-muted/30 text-muted-foreground');
  });
});

describe('cellColorLabel', () => {
  it('returns correct label for each color', () => {
    expect(cellColorLabel('green')).toBe('completed');
    expect(cellColorLabel('yellow')).toBe('in progress');
    expect(cellColorLabel('red')).toBe('needs attention');
    expect(cellColorLabel('gray')).toBe('not started');
  });
});

describe('applyStudentRowUpdate', () => {
  it('removes row when deactivated', () => {
    const rows = [
      { studentId: 's1', displayName: 'Alice' },
      { studentId: 's2', displayName: 'Bob' },
    ];
    const updated = applyStudentRowUpdate(rows, {
      studentId: 's1',
      displayName: 'Alice',
      deactivated: true,
    });
    expect(updated).toHaveLength(1);
    expect(updated[0].studentId).toBe('s2');
  });

  it('updates displayName when not deactivated', () => {
    const rows = [
      { studentId: 's1', displayName: 'Alice' },
      { studentId: 's2', displayName: 'Bob' },
    ];
    const updated = applyStudentRowUpdate(rows, {
      studentId: 's1',
      displayName: 'Alice Smith',
      deactivated: false,
    });
    expect(updated[0].displayName).toBe('Alice Smith');
  });

  it('does not mutate original array', () => {
    const rows = [{ studentId: 's1', displayName: 'Alice' }];
    applyStudentRowUpdate(rows, { studentId: 's1', displayName: 'New', deactivated: false });
    expect(rows[0].displayName).toBe('Alice');
  });
});

describe('assembleGradebookRows', () => {
  const students: RawStudent[] = [
    { id: 's1', username: 'alice', displayName: 'Alice' },
    { id: 's2', username: 'bob', displayName: 'Bob' },
  ];

  const lessons: RawLesson[] = [
    { id: 'l1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 },
    { id: 'l2', title: 'Lesson 2', orderIndex: 2, unitNumber: 1 },
  ];

  const lessonVersions: RawLessonVersion[] = [
    { id: 'lv1', lessonId: 'l1' },
    { id: 'lv2', lessonId: 'l2' },
  ];

  const phaseVersions: RawPhaseVersion[] = [
    { id: 'p1', lessonVersionId: 'lv1', phaseNumber: 1 },
    { id: 'p2', lessonVersionId: 'lv2', phaseNumber: 1 },
  ];

  const primaryStandards: RawLessonStandard[] = [
    { lessonVersionId: 'lv1', standardId: 'std1', isPrimary: true },
    { lessonVersionId: 'lv2', standardId: 'std2', isPrimary: true },
  ];

  const progressRows: RawProgressRow[] = [
    { userId: 's1', phaseId: 'p1', status: 'completed' },
    { userId: 's1', phaseId: 'p2', status: 'not_started' },
    { userId: 's2', phaseId: 'p1', status: 'in_progress' },
    { userId: 's2', phaseId: 'p2', status: 'completed' },
  ];

  const competencyRows: RawCompetencyRow[] = [
    { studentId: 's1', standardId: 'std1', masteryLevel: 85 },
    { studentId: 's1', standardId: 'std2', masteryLevel: 0 },
    { studentId: 's2', standardId: 'std1', masteryLevel: 60 },
    { studentId: 's2', standardId: 'std2', masteryLevel: 90 },
  ];

  it('assembles rows with correct student count', () => {
    const result = assembleGradebookRows(
      students,
      lessons,
      lessonVersions,
      phaseVersions,
      primaryStandards,
      progressRows,
      competencyRows,
    );
    expect(result.rows).toHaveLength(2);
  });

  it('assembles lessons in correct order', () => {
    const result = assembleGradebookRows(
      students,
      lessons,
      lessonVersions,
      phaseVersions,
      primaryStandards,
      progressRows,
      competencyRows,
    );
    expect(result.lessons).toHaveLength(2);
    expect(result.lessons[0].lessonTitle).toBe('Lesson 1');
    expect(result.lessons[1].lessonTitle).toBe('Lesson 2');
  });

  it('computes correct cell status for student with completed first lesson', () => {
    const result = assembleGradebookRows(
      students,
      lessons,
      lessonVersions,
      phaseVersions,
      primaryStandards,
      progressRows,
      competencyRows,
    );
    const aliceRow = result.rows.find(r => r.studentId === 's1')!;
    expect(aliceRow.cells[0].completionStatus).toBe('completed');
    expect(aliceRow.cells[0].masteryLevel).toBe(85);
    expect(aliceRow.cells[0].color).toBe('green');
  });

  it('computes correct cell status for student with in_progress first lesson', () => {
    const result = assembleGradebookRows(
      students,
      lessons,
      lessonVersions,
      phaseVersions,
      primaryStandards,
      progressRows,
      competencyRows,
    );
    const bobRow = result.rows.find(r => r.studentId === 's2')!;
    expect(bobRow.cells[0].completionStatus).toBe('in_progress');
    expect(bobRow.cells[0].masteryLevel).toBe(60);
    expect(bobRow.cells[0].color).toBe('yellow');
  });

  it('handles missing progress with not_started status', () => {
    const result = assembleGradebookRows(
      students,
      lessons,
      lessonVersions,
      phaseVersions,
      primaryStandards,
      [],
      [],
    );
    const aliceRow = result.rows.find(r => r.studentId === 's1')!;
    expect(aliceRow.cells[0].completionStatus).toBe('not_started');
    expect(aliceRow.cells[0].color).toBe('gray');
  });

  it('selects the highest version number when multiple versions exist for a lesson', () => {
    const multiVersionLessons: RawLesson[] = [
      { id: 'l1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 },
    ];
    const multiVersionVersions: RawLessonVersion[] = [
      { id: 'lv1-v1', lessonId: 'l1', version: 1 },
      { id: 'lv1-v3', lessonId: 'l1', version: 3 },
      { id: 'lv1-v2', lessonId: 'l1', version: 2 },
    ];
    const multiVersionPhases: RawPhaseVersion[] = [
      { id: 'p1', lessonVersionId: 'lv1-v3', phaseNumber: 1 },
    ];
    const multiVersionStandards: RawLessonStandard[] = [
      { lessonVersionId: 'lv1-v3', standardId: 'std1', isPrimary: true },
    ];

    const result = assembleGradebookRows(
      students,
      multiVersionLessons,
      multiVersionVersions,
      multiVersionPhases,
      multiVersionStandards,
      [{ userId: 's1', phaseId: 'p1', status: 'completed' }],
      [{ studentId: 's1', standardId: 'std1', masteryLevel: 90 }],
    );

    const aliceRow = result.rows.find(r => r.studentId === 's1')!;
    expect(aliceRow.cells[0].completionStatus).toBe('completed');
    expect(aliceRow.cells[0].masteryLevel).toBe(90);
  });

  it('falls back to first encountered when no version numbers are provided', () => {
    const fallbackLessons: RawLesson[] = [
      { id: 'l1', title: 'Lesson 1', orderIndex: 1, unitNumber: 1 },
    ];
    const fallbackVersions: RawLessonVersion[] = [
      { id: 'lv1-first', lessonId: 'l1' },
      { id: 'lv1-second', lessonId: 'l1' },
    ];
    const fallbackPhases: RawPhaseVersion[] = [
      { id: 'p1', lessonVersionId: 'lv1-first', phaseNumber: 1 },
    ];

    const result = assembleGradebookRows(
      [{ id: 's1', username: 'alice', displayName: 'Alice' }],
      fallbackLessons,
      fallbackVersions,
      fallbackPhases,
      [],
      [{ userId: 's1', phaseId: 'p1', status: 'completed' }],
      [],
    );

    const aliceRow = result.rows.find(r => r.studentId === 's1')!;
    expect(aliceRow.cells[0].completionStatus).toBe('completed');
  });
});
