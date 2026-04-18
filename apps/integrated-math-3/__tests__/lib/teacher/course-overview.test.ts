import { describe, it, expect } from 'vitest';
import { assembleCourseOverviewRows } from '@/lib/teacher/course-overview';
import type {
  RawCOStudent,
  RawCOLesson,
  RawCOLessonVersion,
  RawCOLessonStandard,
  RawCOCompetency,
} from '@/lib/teacher/course-overview';

describe('assembleCourseOverviewRows', () => {
  const students: RawCOStudent[] = [
    { id: 'student-1', username: 'student1', displayName: 'Alice' },
    { id: 'student-2', username: 'student2', displayName: 'Bob' },
  ];

  const rawLessons: RawCOLesson[] = [
    { id: 'lesson-1', unitNumber: 1 },
    { id: 'lesson-2', unitNumber: 1 },
    { id: 'lesson-3', unitNumber: 2 },
  ];

  const rawLessonVersions: RawCOLessonVersion[] = [
    { id: 'lv-1', lessonId: 'lesson-1' },
    { id: 'lv-2', lessonId: 'lesson-2' },
    { id: 'lv-3', lessonId: 'lesson-3' },
  ];

  const rawPrimaryStandards: RawCOLessonStandard[] = [
    { lessonVersionId: 'lv-1', standardId: 'std-1', isPrimary: true },
    { lessonVersionId: 'lv-2', standardId: 'std-2', isPrimary: true },
    { lessonVersionId: 'lv-3', standardId: 'std-3', isPrimary: true },
  ];

  it('returns empty rows when no competency data', () => {
    const result = assembleCourseOverviewRows(
      students,
      rawLessons,
      rawLessonVersions,
      rawPrimaryStandards,
      []
    );

    expect(result.rows).toHaveLength(2);
    expect(result.units).toHaveLength(2);
    expect(result.units[0].unitNumber).toBe(1);
    expect(result.units[1].unitNumber).toBe(2);
  });

  it('computes average mastery per unit correctly', () => {
    const competencyRows: RawCOCompetency[] = [
      { studentId: 'student-1', standardId: 'std-1', masteryLevel: 80 },
      { studentId: 'student-1', standardId: 'std-2', masteryLevel: 90 },
    ];

    const result = assembleCourseOverviewRows(
      students,
      rawLessons,
      rawLessonVersions,
      rawPrimaryStandards,
      competencyRows
    );

    const aliceRow = result.rows.find(r => r.studentId === 'student-1')!;
    expect(aliceRow.cells[0].avgMastery).toBe(85);
    expect(aliceRow.cells[0].color).toBe('green');
    expect(aliceRow.cells[1].avgMastery).toBe(null);
    expect(aliceRow.cells[1].color).toBe('gray');
  });

  it('rounds average mastery to nearest integer', () => {
    const competencyRows: RawCOCompetency[] = [
      { studentId: 'student-1', standardId: 'std-1', masteryLevel: 80 },
      { studentId: 'student-1', standardId: 'std-2', masteryLevel: 81 },
    ];

    const result = assembleCourseOverviewRows(
      students,
      rawLessons,
      rawLessonVersions,
      rawPrimaryStandards,
      competencyRows
    );

    const aliceRow = result.rows.find(r => r.studentId === 'student-1')!;
    expect(aliceRow.cells[0].avgMastery).toBe(81);
  });

  it('returns gray color when no data for a unit', () => {
    const result = assembleCourseOverviewRows(
      students,
      rawLessons,
      rawLessonVersions,
      rawPrimaryStandards,
      []
    );

    const aliceRow = result.rows.find(r => r.studentId === 'student-1')!;
    expect(aliceRow.cells[0].color).toBe('gray');
    expect(aliceRow.cells[1].color).toBe('gray');
  });

  it('computes correct color based on avgMastery', () => {
    const competencyRows: RawCOCompetency[] = [
      { studentId: 'student-1', standardId: 'std-1', masteryLevel: 85 },
    ];

    const result = assembleCourseOverviewRows(
      students,
      rawLessons,
      rawLessonVersions,
      rawPrimaryStandards,
      competencyRows
    );

    const aliceRow = result.rows.find(r => r.studentId === 'student-1')!;
    expect(aliceRow.cells[0].color).toBe('green');
  });

  it('uses displayName with fallback to username', () => {
    const studentsWithNull: RawCOStudent[] = [
      { id: 'student-1', username: 'student1', displayName: null },
    ];

    const result = assembleCourseOverviewRows(
      studentsWithNull,
      rawLessons,
      rawLessonVersions,
      rawPrimaryStandards,
      []
    );

    expect(result.rows[0].displayName).toBe('student1');
  });

  it('sorts units by unitNumber', () => {
    const lessonsOutOfOrder: RawCOLesson[] = [
      { id: 'lesson-3', unitNumber: 3 },
      { id: 'lesson-1', unitNumber: 1 },
      { id: 'lesson-2', unitNumber: 2 },
    ];

    const versionsOutOfOrder: RawCOLessonVersion[] = [
      { id: 'lv-3', lessonId: 'lesson-3' },
      { id: 'lv-1', lessonId: 'lesson-1' },
      { id: 'lv-2', lessonId: 'lesson-2' },
    ];

    const result = assembleCourseOverviewRows(
      students,
      lessonsOutOfOrder,
      versionsOutOfOrder,
      rawPrimaryStandards,
      []
    );

    expect(result.units[0].unitNumber).toBe(1);
    expect(result.units[1].unitNumber).toBe(2);
    expect(result.units[2].unitNumber).toBe(3);
  });

  it('handles multiple standards per unit', () => {
    const lessonsInSameUnit: RawCOLesson[] = [
      { id: 'lesson-1', unitNumber: 1 },
      { id: 'lesson-2', unitNumber: 1 },
    ];

    const versionsInSameUnit: RawCOLessonVersion[] = [
      { id: 'lv-1', lessonId: 'lesson-1' },
      { id: 'lv-2', lessonId: 'lesson-2' },
    ];

    const multipleStandards: RawCOLessonStandard[] = [
      { lessonVersionId: 'lv-1', standardId: 'std-1', isPrimary: true },
      { lessonVersionId: 'lv-2', standardId: 'std-2', isPrimary: true },
    ];

    const competencyRows: RawCOCompetency[] = [
      { studentId: 'student-1', standardId: 'std-1', masteryLevel: 60 },
      { studentId: 'student-1', standardId: 'std-2', masteryLevel: 80 },
    ];

    const result = assembleCourseOverviewRows(
      students,
      lessonsInSameUnit,
      versionsInSameUnit,
      multipleStandards,
      competencyRows
    );

    const aliceRow = result.rows.find(r => r.studentId === 'student-1')!;
    expect(aliceRow.cells[0].avgMastery).toBe(70);
    expect(aliceRow.cells[0].color).toBe('yellow');
  });

  it('ignores non-primary standards', () => {
    const mixedStandards: RawCOLessonStandard[] = [
      { lessonVersionId: 'lv-1', standardId: 'std-1', isPrimary: true },
      { lessonVersionId: 'lv-1', standardId: 'std-2', isPrimary: false },
    ];

    const competencyRows: RawCOCompetency[] = [
      { studentId: 'student-1', standardId: 'std-1', masteryLevel: 70 },
      { studentId: 'student-1', standardId: 'std-2', masteryLevel: 100 },
    ];

    const result = assembleCourseOverviewRows(
      students,
      rawLessons,
      rawLessonVersions,
      mixedStandards,
      competencyRows
    );

    const aliceRow = result.rows.find(r => r.studentId === 'student-1')!;
    expect(aliceRow.cells[0].avgMastery).toBe(70);
  });
});