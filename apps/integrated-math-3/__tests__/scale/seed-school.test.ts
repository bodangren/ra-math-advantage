/**
 * Phase 1 — Scale Seeds (FR1 / AC1) — Red tests for the 1,000-student school seed.
 *
 * Companion to `seed-class.test.ts`. Per
 * `measure/tracks/load-scale-testing_20260605/test-strategy.md` §5, Phase 1 is
 * TDD on pure generator functions first: deterministic IDs, density math,
 * foreign-key integrity, idempotency. These tests target the pure generator at
 * `@/lib/scale/seed-school` and fail at HEAD because the implementation does
 * not yet exist.
 *
 * Red command:
 *   npx vitest run apps/integrated-math-3/__tests__/scale/seed-school.test.ts
 *
 * Joint Red command (both Phase 1 generators):
 *   npx vitest run apps/integrated-math-3/__tests__/scale/seed-class.test.ts \
 *                    apps/integrated-math-3/__tests__/scale/seed-school.test.ts
 *
 * The school seed differs from the class seed only in scale: 1,000 students
 * distributed across SCALE_CLASSES_PER_SCHOOL classes, each taught by its own
 * teacher. Same per-student density (cards/reviews/submissions). Same frozen
 * RNG seed for determinism.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  generateSchoolSeed,
  SCALE_RNG_SEED,
  type SchoolSeedInput,
  type SchoolSeedResult,
} from '@/lib/scale/seed-school';
import { SCALE_STUDENT_COUNT_CLASS, SCALE_STUDENT_COUNT_SCHOOL } from '@/__tests__/_fixtures/scale/student-roster';
import {
  SCALE_CARDS_PER_STUDENT,
  SCALE_REVIEWS_PER_CARD,
  SCALE_SUBMISSIONS_PER_STUDENT,
  SCALE_CLASSES_PER_SCHOOL,
  SCALE_TEACHERS_PER_SCHOOL,
} from '@/__tests__/_fixtures/scale/density';
import { SCALE_RNG_SEED_VALUE } from '@/__tests__/_fixtures/scale/rng';

const SCHOOL_INPUT: SchoolSeedInput = {
  organizationSlug: 'school-scale',
};

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');

describe('scale — Phase 1 Red: generateSchoolSeed (1,000-student school)', () => {
  describe('module surface', () => {
    it('exports generateSchoolSeed as a function', () => {
      expect(typeof generateSchoolSeed).toBe('function');
    });

    it('exports a frozen SCALE_RNG_SEED constant equal to the documented seed', () => {
      expect(SCALE_RNG_SEED).toBeDefined();
      expect(SCALE_RNG_SEED).toBe(SCALE_RNG_SEED_VALUE);
    });
  });

  describe('density realism (FR1: 1,000-student school at realistic density)', () => {
    const result: SchoolSeedResult = generateSchoolSeed(SCHOOL_INPUT);

    it('produces exactly SCALE_STUDENT_COUNT_SCHOOL students', () => {
      expect(result.students).toHaveLength(SCALE_STUDENT_COUNT_SCHOOL);
      expect(result.counts.students).toBe(SCALE_STUDENT_COUNT_SCHOOL);
    });

    it('produces SCALE_TEACHERS_PER_SCHOOL teachers', () => {
      expect(result.teachers).toHaveLength(SCALE_TEACHERS_PER_SCHOOL);
      expect(result.counts.teachers).toBe(SCALE_TEACHERS_PER_SCHOOL);
    });

    it('produces SCALE_CLASSES_PER_SCHOOL classes', () => {
      expect(result.classes).toHaveLength(SCALE_CLASSES_PER_SCHOOL);
      expect(result.counts.classes).toBe(SCALE_CLASSES_PER_SCHOOL);
    });

    it('produces one active enrollment per student', () => {
      expect(result.enrollments).toHaveLength(SCALE_STUDENT_COUNT_SCHOOL);
      for (const enrollment of result.enrollments) {
        expect(enrollment.status).toBe('active');
      }
    });

    it('produces SRS cards at SCALE_CARDS_PER_STUDENT per student', () => {
      expect(result.srsCards).toHaveLength(
        SCALE_STUDENT_COUNT_SCHOOL * SCALE_CARDS_PER_STUDENT,
      );
      expect(result.counts.srsCards).toBe(
        SCALE_STUDENT_COUNT_SCHOOL * SCALE_CARDS_PER_STUDENT,
      );
    });

    it('produces review-log entries at SCALE_REVIEWS_PER_CARD per card', () => {
      expect(result.reviewLog).toHaveLength(
        SCALE_STUDENT_COUNT_SCHOOL *
          SCALE_CARDS_PER_STUDENT *
          SCALE_REVIEWS_PER_CARD,
      );
      expect(result.counts.reviewLog).toBe(
        SCALE_STUDENT_COUNT_SCHOOL *
          SCALE_CARDS_PER_STUDENT *
          SCALE_REVIEWS_PER_CARD,
      );
    });

    it('produces activity submissions at SCALE_SUBMISSIONS_PER_STUDENT per student', () => {
      expect(result.submissions).toHaveLength(
        SCALE_STUDENT_COUNT_SCHOOL * SCALE_SUBMISSIONS_PER_STUDENT,
      );
      expect(result.counts.submissions).toBe(
        SCALE_STUDENT_COUNT_SCHOOL * SCALE_SUBMISSIONS_PER_STUDENT,
      );
    });

    it('count fields agree with the array lengths (no drift)', () => {
      expect(result.counts.teachers).toBe(result.teachers.length);
      expect(result.counts.classes).toBe(result.classes.length);
      expect(result.counts.students).toBe(result.students.length);
      expect(result.counts.enrollments).toBe(result.enrollments.length);
      expect(result.counts.srsCards).toBe(result.srsCards.length);
      expect(result.counts.reviewLog).toBe(result.reviewLog.length);
      expect(result.counts.submissions).toBe(result.submissions.length);
    });
  });

  describe('class distribution (no partial tail class)', () => {
    const result = generateSchoolSeed(SCHOOL_INPUT);

    it('every class has exactly SCALE_STUDENT_COUNT_CLASS students enrolled', () => {
      // 1000 / 30 = 33.33 — round up to 34 so every class is a full
      // SCALE_STUDENT_COUNT_CLASS section (no partial tail).
      const classSizes = new Map<string, number>();
      for (const enrollment of result.enrollments) {
        classSizes.set(
          enrollment.classId,
          (classSizes.get(enrollment.classId) ?? 0) + 1,
        );
      }
      expect(classSizes.size).toBe(SCALE_CLASSES_PER_SCHOOL);
      for (const [classId, size] of classSizes) {
        expect(
          size,
          `class ${classId} should have a full roster`,
        ).toBe(SCALE_STUDENT_COUNT_CLASS);
      }
    });

    it('every class has exactly one assigned teacher', () => {
      const teacherIdsByClass = new Map<string, Set<string>>();
      for (const classroom of result.classes) {
        const set = new Set<string>();
        set.add(classroom.teacherId);
        teacherIdsByClass.set(classroom.id, set);
      }
      for (const [classId, teachers] of teacherIdsByClass) {
        expect(
          teachers.size,
          `class ${classId} should have exactly one teacher`,
        ).toBe(1);
      }
    });
  });

  describe('determinism (AC1: re-running produces identical row IDs and counts)', () => {
    it('same default seed yields byte-identical output', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b).toEqual(a);
    });

    it('different school seed scopes do not reuse row IDs', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed({ organizationSlug: 'school-scale-parallel' });
      const idsA = new Set([
        ...a.teachers.map((t) => t.id),
        ...a.classes.map((c) => c.id),
        ...a.students.map((s) => s.id),
        ...a.enrollments.map((e) => e.id),
        ...a.srsCards.map((c) => c.id),
        ...a.reviewLog.map((r) => r.id),
        ...a.submissions.map((s) => s.id),
      ]);
      const collisions = [
        ...b.teachers.map((t) => t.id),
        ...b.classes.map((c) => c.id),
        ...b.students.map((s) => s.id),
        ...b.enrollments.map((e) => e.id),
        ...b.srsCards.map((c) => c.id),
        ...b.reviewLog.map((r) => r.id),
        ...b.submissions.map((s) => s.id),
      ].filter((id) => idsA.has(id));
      expect(collisions).toEqual([]);
    });

    it('same default seed yields identical student IDs (in order)', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b.students.map((s) => s.id)).toEqual(a.students.map((s) => s.id));
    });

    it('same default seed yields identical teacher IDs (in order)', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b.teachers.map((t) => t.id)).toEqual(a.teachers.map((t) => t.id));
    });

    it('same default seed yields identical class IDs (in order)', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b.classes.map((c) => c.id)).toEqual(a.classes.map((c) => c.id));
    });

    it('same default seed yields identical enrollment IDs', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b.enrollments.map((e) => e.id)).toEqual(
        a.enrollments.map((e) => e.id),
      );
    });

    it('same default seed yields identical SRS card IDs', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b.srsCards.map((c) => c.id)).toEqual(a.srsCards.map((c) => c.id));
    });

    it('same default seed yields identical review-log IDs', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b.reviewLog.map((r) => r.id)).toEqual(a.reviewLog.map((r) => r.id));
    });

    it('same default seed yields identical submission IDs', () => {
      const a = generateSchoolSeed(SCHOOL_INPUT);
      const b = generateSchoolSeed(SCHOOL_INPUT);
      expect(b.submissions.map((s) => s.id)).toEqual(
        a.submissions.map((s) => s.id),
      );
    });

    it('explicit rngSeed override still yields deterministic output', () => {
      const a = generateSchoolSeed({ ...SCHOOL_INPUT, rngSeed: 'override-1' });
      const b = generateSchoolSeed({ ...SCHOOL_INPUT, rngSeed: 'override-1' });
      expect(b).toEqual(a);
    });

    it('different rngSeed produces different student IDs', () => {
      const a = generateSchoolSeed({ ...SCHOOL_INPUT, rngSeed: 'override-1' });
      const b = generateSchoolSeed({ ...SCHOOL_INPUT, rngSeed: 'override-2' });
      const idsA = a.students.map((s) => s.id);
      const idsB = b.students.map((s) => s.id);
      expect(idsA).not.toEqual(idsB);
    });
  });

  describe('foreign-key integrity (no dangling references)', () => {
    const result = generateSchoolSeed(SCHOOL_INPUT);
    const studentIds = new Set(result.students.map((s) => s.id));
    const teacherIds = new Set(result.teachers.map((t) => t.id));
    const classIds = new Set(result.classes.map((c) => c.id));
    const cardIds = new Set(result.srsCards.map((c) => c.id));

    it('every enrollment.classId is in the generated class set', () => {
      for (const enrollment of result.enrollments) {
        expect(
          classIds.has(enrollment.classId),
          `dangling enrollment.classId: ${enrollment.classId}`,
        ).toBe(true);
      }
    });

    it('every enrollment.studentId is in the generated student set', () => {
      for (const enrollment of result.enrollments) {
        expect(
          studentIds.has(enrollment.studentId),
          `dangling enrollment.studentId: ${enrollment.studentId}`,
        ).toBe(true);
      }
    });

    it('every class.teacherId is in the generated teacher set', () => {
      for (const classroom of result.classes) {
        expect(
          teacherIds.has(classroom.teacherId),
          `dangling class.teacherId: ${classroom.teacherId}`,
        ).toBe(true);
      }
    });

    it('every srsCard.studentId is in the generated student set', () => {
      for (const card of result.srsCards) {
        expect(
          studentIds.has(card.studentId),
          `dangling srsCard.studentId: ${card.studentId}`,
        ).toBe(true);
      }
    });

    it('every reviewLog.studentId is in the generated student set', () => {
      const dangling = result.reviewLog.filter(
        (r) => !studentIds.has(r.studentId),
      );
      expect(dangling, 'dangling reviewLog.studentId entries').toEqual([]);
    });

    it('every reviewLog.cardId is in the generated srs_cards set', () => {
      const dangling = result.reviewLog.filter(
        (r) => !cardIds.has(r.cardId),
      );
      expect(dangling, 'dangling reviewLog.cardId entries').toEqual([]);
    });

    it('every submission.studentId is in the generated student set', () => {
      for (const sub of result.submissions) {
        expect(
          studentIds.has(sub.studentId),
          `dangling submission.studentId: ${sub.studentId}`,
        ).toBe(true);
      }
    });

    it('all student IDs are unique within the school', () => {
      const ids = result.students.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all teacher IDs are unique within the school', () => {
      const ids = result.teachers.map((t) => t.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all class IDs are unique within the school', () => {
      const ids = result.classes.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all enrollment IDs are unique within the school', () => {
      const ids = result.enrollments.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all SRS card IDs are unique within the school', () => {
      const ids = result.srsCards.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all review-log IDs are unique within the school', () => {
      const ids = result.reviewLog.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all submission IDs are unique within the school', () => {
      const ids = result.submissions.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('every student belongs to exactly one class (no double-enrollment)', () => {
      const classCountByStudent = new Map<string, number>();
      for (const enrollment of result.enrollments) {
        classCountByStudent.set(
          enrollment.studentId,
          (classCountByStudent.get(enrollment.studentId) ?? 0) + 1,
        );
      }
      for (const [studentId, count] of classCountByStudent) {
        expect(
          count,
          `student ${studentId} should belong to exactly one class`,
        ).toBe(1);
      }
    });
  });

  describe('organization wiring', () => {
    const result = generateSchoolSeed(SCHOOL_INPUT);

    it('emits a single organization with the requested slug', () => {
      expect(result.organization.slug).toBe(SCHOOL_INPUT.organizationSlug);
    });

    it('every student record carries the requested organizationSlug', () => {
      for (const student of result.students) {
        expect(student.organizationSlug).toBe(SCHOOL_INPUT.organizationSlug);
      }
    });
  });

  describe('source boundary contract', () => {
    it('does not import test fixtures from production seed generator code', () => {
      const source = readFileSync(
        resolve(APP_ROOT, 'lib/scale/seed-school.ts'),
        'utf8',
      );
      expect(source).not.toMatch(/@\/__tests__/);
    });
  });

  describe('result shape contract (downstream budget / snapshot consumer guard)', () => {
    const result = generateSchoolSeed(SCHOOL_INPUT);

    it('result.counts exposes exactly the expected keys (no drift for snapshot diffs)', () => {
      // The Green/closeout convex-test insertion test compares per-table row
      // counts against a snapshot fixture. The fixture compares against the
      // keys in this list, so any unannounced new key is a contract break.
      expect(Object.keys(result.counts).sort()).toEqual(
        [
          'classes',
          'enrollments',
          'reviewLog',
          'srsCards',
          'students',
          'submissions',
          'teachers',
        ],
      );
    });

    it('result is JSON-serializable (no Map/Set/Date/BigInt in the payload)', () => {
      // The harness writes the generator output to disk and to reports.
      // If the implementation ever returns a non-JSON-serializable value
      // (e.g. a Map, Set, Date, or BigInt) the write path silently fails.
      // This guard pins the contract that the payload is plain JSON.
      let serialized: string;
      expect(() => {
        serialized = JSON.stringify(result);
      }).not.toThrow();
      const roundTripped = JSON.parse(serialized!);
      expect(roundTripped.counts).toEqual(result.counts);
      expect(roundTripped.organization.slug).toBe(result.organization.slug);
    });
  });
});