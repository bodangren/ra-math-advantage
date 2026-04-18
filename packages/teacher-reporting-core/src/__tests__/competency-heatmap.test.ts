import { describe, expect, it } from 'vitest';
import {
  assembleCompetencyHeatmapRows,
  assembleStudentCompetencyDetail,
  computeCompetencyColor,
  type RawCHStudent,
  type RawCHStandard,
  type RawCHCompetency,
  type RawCHLessonStandard,
  type RawCHLessonVersion,
  type RawCHLesson,
} from '../teacher-reporting/competency-heatmap.js';

describe('competency heatmap assembly', () => {
  describe('computeCompetencyColor', () => {
    it('returns gray for null mastery level', () => {
      expect(computeCompetencyColor(null)).toBe('gray');
    });

    it('returns green for mastery >= 80', () => {
      expect(computeCompetencyColor(80)).toBe('green');
      expect(computeCompetencyColor(90)).toBe('green');
      expect(computeCompetencyColor(100)).toBe('green');
    });

    it('returns yellow for mastery 50-79', () => {
      expect(computeCompetencyColor(50)).toBe('yellow');
      expect(computeCompetencyColor(65)).toBe('yellow');
      expect(computeCompetencyColor(79)).toBe('yellow');
    });

    it('returns red for mastery < 50', () => {
      expect(computeCompetencyColor(0)).toBe('red');
      expect(computeCompetencyColor(25)).toBe('red');
      expect(computeCompetencyColor(49)).toBe('red');
    });
  });

  describe('assembleCompetencyHeatmapRows', () => {
    const mockStudents: RawCHStudent[] = [
      { id: 'student1', username: 'alice', displayName: 'Alice Smith' },
      { id: 'student2', username: 'bob', displayName: null },
    ];

    const mockStandards: RawCHStandard[] = [
      {
        id: 'std1',
        code: 'A-SSE.2',
        description: 'Use the structure of an expression',
        studentFriendlyDescription: 'Rewrite expressions using structure',
        category: 'Algebra',
        isActive: true,
      },
      {
        id: 'std2',
        code: 'A-APR.1',
        description: 'Understand polynomial operations',
        studentFriendlyDescription: 'Add, subtract, and multiply polynomials',
        category: 'Algebra',
        isActive: true,
      },
      {
        id: 'std3',
        code: 'F-IF.7',
        description: 'Graph functions',
        studentFriendlyDescription: null,
        category: null,
        isActive: false,
      },
    ];

    const mockCompetencyRows: RawCHCompetency[] = [
      {
        studentId: 'student1',
        standardId: 'std1',
        masteryLevel: 90,
        evidenceActivityId: 'act1',
        lastUpdated: 1234567890000,
        updatedBy: 'teacher1',
      },
      {
        studentId: 'student1',
        standardId: 'std2',
        masteryLevel: 45,
        evidenceActivityId: 'act2',
        lastUpdated: 1234567890000,
        updatedBy: 'teacher1',
      },
      {
        studentId: 'student2',
        standardId: 'std1',
        masteryLevel: 60,
        evidenceActivityId: null,
        lastUpdated: 1234567890000,
        updatedBy: null,
      },
    ];

    it('filters inactive standards', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);

      expect(result.standards).toHaveLength(2);
      expect(result.standards.map((s) => s.id)).toEqual(['std1', 'std2']);
      expect(result.standards.map((s) => s.code)).toEqual(['A-SSE.2', 'A-APR.1']);
    });

    it('creates one row per student with all active standards as cells', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);

      expect(result.rows).toHaveLength(2);

      expect(result.rows[0].studentId).toBe('student1');
      expect(result.rows[0].displayName).toBe('Alice Smith');
      expect(result.rows[0].username).toBe('alice');
      expect(result.rows[0].cells).toHaveLength(2);

      expect(result.rows[1].studentId).toBe('student2');
      expect(result.rows[1].displayName).toBe('bob');
      expect(result.rows[1].username).toBe('bob');
      expect(result.rows[1].cells).toHaveLength(2);
    });

    it('populates cells with correct standard data and mastery levels', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);

      expect(result.rows[0].cells[0]).toEqual({
        standardId: 'std1',
        standardCode: 'A-SSE.2',
        standardDescription: 'Use the structure of an expression',
        category: 'Algebra',
        masteryLevel: 90,
        color: 'green',
      });

      expect(result.rows[0].cells[1]).toEqual({
        standardId: 'std2',
        standardCode: 'A-APR.1',
        standardDescription: 'Understand polynomial operations',
        category: 'Algebra',
        masteryLevel: 45,
        color: 'red',
      });

      expect(result.rows[1].cells[0]).toEqual({
        standardId: 'std1',
        standardCode: 'A-SSE.2',
        standardDescription: 'Use the structure of an expression',
        category: 'Algebra',
        masteryLevel: 60,
        color: 'yellow',
      });

      expect(result.rows[1].cells[1]).toEqual({
        standardId: 'std2',
        standardCode: 'A-APR.1',
        standardDescription: 'Understand polynomial operations',
        category: 'Algebra',
        masteryLevel: null,
        color: 'gray',
      });
    });

    it('handles empty inputs gracefully', () => {
      const result = assembleCompetencyHeatmapRows([], [], []);

      expect(result.rows).toEqual([]);
      expect(result.standards).toEqual([]);
    });

    it('uses username as fallback when displayName is null', () => {
      const result = assembleCompetencyHeatmapRows(mockStudents, mockStandards, mockCompetencyRows);

      expect(result.rows[1].displayName).toBe('bob');
    });
  });

  describe('assembleStudentCompetencyDetail', () => {
    const mockStudent: RawCHStudent = {
      id: 'student1',
      username: 'alice',
      displayName: 'Alice Smith',
    };

    const mockStandards: RawCHStandard[] = [
      {
        id: 'std1',
        code: 'A-SSE.2',
        description: 'Use the structure of an expression',
        studentFriendlyDescription: 'Rewrite expressions using structure',
        category: 'Algebra',
        isActive: true,
      },
      {
        id: 'std2',
        code: 'A-APR.1',
        description: 'Understand polynomial operations',
        studentFriendlyDescription: null,
        category: 'Algebra',
        isActive: true,
      },
    ];

    const mockCompetencyRows: RawCHCompetency[] = [
      {
        studentId: 'student1',
        standardId: 'std1',
        masteryLevel: 85,
        evidenceActivityId: 'act1',
        lastUpdated: 1234567890000,
        updatedBy: 'teacher1',
      },
      {
        studentId: 'other_student',
        standardId: 'std1',
        masteryLevel: 50,
        evidenceActivityId: null,
        lastUpdated: 1234567890000,
        updatedBy: null,
      },
    ];

    const mockLessonStandards: RawCHLessonStandard[] = [
      {
        standardId: 'std1',
        lessonVersionId: 'lv1',
        isPrimary: true,
      },
    ];

    const mockLessonVersions: RawCHLessonVersion[] = [
      {
        id: 'lv1',
        lessonId: 'lesson1',
      },
    ];

    const mockLessons: RawCHLesson[] = [
      {
        id: 'lesson1',
        unitNumber: 1,
        title: 'Lesson 1: Polynomial Basics',
      },
    ];

    it('creates detail view for specified student only', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      expect(result.studentId).toBe('student1');
      expect(result.displayName).toBe('Alice Smith');
      expect(result.username).toBe('alice');
    });

    it('populates competencies for all active standards', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      expect(result.competencies).toHaveLength(2);
    });

    it('includes mastery data where available for the student', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      const std1Competency = result.competencies.find((c) => c.standardCode === 'A-SSE.2');
      expect(std1Competency).toBeDefined();
      expect(std1Competency?.masteryLevel).toBe(85);
      expect(std1Competency?.evidenceActivityId).toBe('act1');
      expect(std1Competency?.lastUpdated).toBe(1234567890000);
      expect(std1Competency?.updatedBy).toBe('teacher1');
    });

    it('fills null for missing competency data', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      const std2Competency = result.competencies.find((c) => c.standardCode === 'A-APR.1');
      expect(std2Competency).toBeDefined();
      expect(std2Competency?.masteryLevel).toBe(null);
      expect(std2Competency?.evidenceActivityId).toBe(null);
      expect(std2Competency?.lastUpdated).toBe(null);
      expect(std2Competency?.updatedBy).toBe(null);
    });

    it('derives unit and lesson context from primary lesson standards', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      const std1Competency = result.competencies.find((c) => c.standardCode === 'A-SSE.2');
      expect(std1Competency?.unitNumber).toBe(1);
      expect(std1Competency?.lessonTitle).toBe('Lesson 1: Polynomial Basics');
    });

    it('fills null for standards with no primary lesson context', () => {
      const result = assembleStudentCompetencyDetail(
        mockStudent,
        mockStandards,
        mockCompetencyRows,
        mockLessonStandards,
        mockLessonVersions,
        mockLessons,
      );

      const std2Competency = result.competencies.find((c) => c.standardCode === 'A-APR.1');
      expect(std2Competency?.unitNumber).toBe(null);
      expect(std2Competency?.lessonTitle).toBe(null);
    });
  });
});
