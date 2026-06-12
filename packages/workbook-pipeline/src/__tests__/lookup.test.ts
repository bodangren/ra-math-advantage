import { describe, it, expect } from 'vitest';
import type { WorkbookManifest } from '../workbook-pipeline/manifest.js';
import {
  hasStudentWorkbook,
  hasTeacherWorkbook,
  lessonHasWorkbooks,
  hasCapstoneStudentWorkbook,
  hasCapstoneTeacherWorkbook,
  lessonHasAnyWorkbook,
} from '../workbook-pipeline/lookup.js';

/**
 * Create a WorkbookManifest fixture for testing.
 * @param units - Array of unit/lesson entries with student/teacher flags
 * @param capstone - Capstone availability flags
 * @returns A WorkbookManifest suitable for tests
 */
function createTestManifest(
  units: Array<{ unit: number; lesson: number; student: boolean; teacher: boolean }>,
  capstone: { student: boolean; teacher: boolean } = { student: false, teacher: false }
): WorkbookManifest {
  const byUnitAndLesson: Record<string, { student: boolean; teacher: boolean }> = {};
  for (const { unit, lesson, student, teacher } of units) {
    const key = `${unit}-${lesson}`;
    byUnitAndLesson[key] = { student, teacher };
  }
  return {
    version: 1,
    generatedAt: '2026-04-19T00:00:00.000Z',
    files: [],
    byUnitAndLesson,
    byCapstone: capstone,
  };
}

describe('lookup utilities', () => {
  const manifest = createTestManifest([
    { unit: 1, lesson: 4, student: true, teacher: true },
    { unit: 1, lesson: 5, student: true, teacher: false },
    { unit: 2, lesson: 4, student: false, teacher: true },
  ], { student: true, teacher: false });

  describe('hasStudentWorkbook', () => {
    it('returns true when student workbook exists', () => {
      expect(hasStudentWorkbook(manifest, 1, 4)).toBe(true);
      expect(hasStudentWorkbook(manifest, 1, 5)).toBe(true);
    });

    it('returns false when student workbook does not exist', () => {
      expect(hasStudentWorkbook(manifest, 2, 4)).toBe(false);
    });

    it('returns false for non-existent unit/lesson', () => {
      expect(hasStudentWorkbook(manifest, 99, 99)).toBe(false);
    });
  });

  describe('hasTeacherWorkbook', () => {
    it('returns true when teacher workbook exists', () => {
      expect(hasTeacherWorkbook(manifest, 1, 4)).toBe(true);
      expect(hasTeacherWorkbook(manifest, 2, 4)).toBe(true);
    });

    it('returns false when teacher workbook does not exist', () => {
      expect(hasTeacherWorkbook(manifest, 1, 5)).toBe(false);
    });

    it('returns false for non-existent unit/lesson', () => {
      expect(hasTeacherWorkbook(manifest, 99, 99)).toBe(false);
    });
  });

  describe('lessonHasWorkbooks', () => {
    it('returns true when at least one workbook exists', () => {
      expect(lessonHasWorkbooks(manifest, 1, 4)).toBe(true);
      expect(lessonHasWorkbooks(manifest, 1, 5)).toBe(true);
      expect(lessonHasWorkbooks(manifest, 2, 4)).toBe(true);
    });

    it('returns false when no workbooks exist', () => {
      expect(lessonHasWorkbooks(manifest, 99, 99)).toBe(false);
    });
  });

  describe('hasCapstoneStudentWorkbook', () => {
    it('returns true when capstone student workbook exists', () => {
      expect(hasCapstoneStudentWorkbook(manifest)).toBe(true);
    });
  });

  describe('hasCapstoneTeacherWorkbook', () => {
    it('returns false when no capstone teacher workbook exists', () => {
      expect(hasCapstoneTeacherWorkbook(manifest)).toBe(false);
    });
  });

  describe('lessonHasAnyWorkbook', () => {
    it('returns true when any workbook exists for lesson', () => {
      expect(lessonHasAnyWorkbook(manifest, 1, 4)).toBe(true);
      expect(lessonHasAnyWorkbook(manifest, 1, 5)).toBe(true);
    });

    it('returns false when no workbooks exist', () => {
      expect(lessonHasAnyWorkbook(manifest, 99, 99)).toBe(false);
    });
  });
});