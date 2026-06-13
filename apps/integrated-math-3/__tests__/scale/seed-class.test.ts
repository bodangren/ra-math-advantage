/**
 * Phase 1 — Scale Seeds (FR1 / AC1) — Red tests for the 30-student class seed.
 *
 * Per `measure/tracks/load-scale-testing_20260605/test-strategy.md` §5, Phase 1
 * is TDD on pure generator functions first: deterministic IDs, density math,
 * foreign-key integrity, idempotency. These tests target the pure generator at
 * `@/lib/scale/seed-class` and fail at HEAD because the implementation does
 * not yet exist.
 *
 * Red command:
 *   npx vitest run apps/integrated-math-3/__tests__/scale/seed-class.test.ts
 *
 * Companion file: `apps/integrated-math-3/__tests__/scale/seed-school.test.ts`
 * (1,000-student school generator).
 *
 * These tests are pure (no Convex, no network). The Phase 1 closeout plan
 * adds one in-memory `convex-test` insertion test that asserts row counts per
 * table against a snapshot fixture — that test is owned by the Green role,
 * not this Red role.
 */
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, it, expect } from 'vitest';
import {
  generateClassSeed,
  SCALE_RNG_SEED,
  type ClassSeedInput,
  type ClassSeedResult,
} from '@/lib/scale/seed-class';
import { SCALE_STUDENT_COUNT_CLASS } from '@/__tests__/_fixtures/scale/student-roster';
import {
  SCALE_CARDS_PER_STUDENT,
  SCALE_REVIEWS_PER_CARD,
  SCALE_SUBMISSIONS_PER_STUDENT,
} from '@/__tests__/_fixtures/scale/density';
import { SCALE_RNG_SEED_VALUE } from '@/__tests__/_fixtures/scale/rng';

const CLASS_INPUT: ClassSeedInput = {
  organizationSlug: 'class-scale',
  className: 'IM3 Period 1',
  teacherUsername: 'teacher@class-scale',
};

const TEST_DIR = dirname(fileURLToPath(import.meta.url));
const APP_ROOT = resolve(TEST_DIR, '../..');

describe('scale — Phase 1 Red: generateClassSeed (30-student class)', () => {
  describe('module surface', () => {
    it('exports generateClassSeed as a function', () => {
      expect(typeof generateClassSeed).toBe('function');
    });

    it('exports a frozen SCALE_RNG_SEED constant equal to the documented seed', () => {
      // The harness MUST pin the seed value so re-runs are deterministic.
      expect(SCALE_RNG_SEED).toBeDefined();
      expect(SCALE_RNG_SEED).toBe(SCALE_RNG_SEED_VALUE);
    });
  });

  describe('density realism (FR1: 30-student class at realistic density)', () => {
    const result: ClassSeedResult = generateClassSeed(CLASS_INPUT);

    it('produces exactly SCALE_STUDENT_COUNT_CLASS students', () => {
      expect(result.students).toHaveLength(SCALE_STUDENT_COUNT_CLASS);
      expect(result.counts.students).toBe(SCALE_STUDENT_COUNT_CLASS);
    });

    it('produces one active enrollment per student', () => {
      expect(result.enrollments).toHaveLength(SCALE_STUDENT_COUNT_CLASS);
      for (const enrollment of result.enrollments) {
        expect(enrollment.status).toBe('active');
      }
    });

    it('produces SRS cards at SCALE_CARDS_PER_STUDENT per student', () => {
      expect(result.srsCards).toHaveLength(
        SCALE_STUDENT_COUNT_CLASS * SCALE_CARDS_PER_STUDENT,
      );
      expect(result.counts.srsCards).toBe(
        SCALE_STUDENT_COUNT_CLASS * SCALE_CARDS_PER_STUDENT,
      );
    });

    it('produces review-log entries at SCALE_REVIEWS_PER_CARD per card', () => {
      expect(result.reviewLog).toHaveLength(
        SCALE_STUDENT_COUNT_CLASS *
          SCALE_CARDS_PER_STUDENT *
          SCALE_REVIEWS_PER_CARD,
      );
      expect(result.counts.reviewLog).toBe(
        SCALE_STUDENT_COUNT_CLASS *
          SCALE_CARDS_PER_STUDENT *
          SCALE_REVIEWS_PER_CARD,
      );
    });

    it('produces activity submissions at SCALE_SUBMISSIONS_PER_STUDENT per student', () => {
      expect(result.submissions).toHaveLength(
        SCALE_STUDENT_COUNT_CLASS * SCALE_SUBMISSIONS_PER_STUDENT,
      );
      expect(result.counts.submissions).toBe(
        SCALE_STUDENT_COUNT_CLASS * SCALE_SUBMISSIONS_PER_STUDENT,
      );
    });

    it('count fields agree with the array lengths (no drift)', () => {
      expect(result.counts.students).toBe(result.students.length);
      expect(result.counts.enrollments).toBe(result.enrollments.length);
      expect(result.counts.srsCards).toBe(result.srsCards.length);
      expect(result.counts.reviewLog).toBe(result.reviewLog.length);
      expect(result.counts.submissions).toBe(result.submissions.length);
    });
  });

  describe('determinism (AC1: re-running produces identical row IDs and counts)', () => {
    it('same default seed yields byte-identical output', () => {
      const a = generateClassSeed(CLASS_INPUT);
      const b = generateClassSeed(CLASS_INPUT);
      expect(b).toEqual(a);
    });

    it('different class seed scopes do not reuse row IDs', () => {
      const a = generateClassSeed(CLASS_INPUT);
      const b = generateClassSeed({
        organizationSlug: 'class-scale-parallel',
        className: 'IM3 Period 2',
        teacherUsername: 'teacher@class-scale-parallel',
      });
      const idsA = new Set([
        a.teacher.id,
        a.classRoom.id,
        ...a.students.map((s) => s.id),
        ...a.enrollments.map((e) => e.id),
        ...a.srsCards.map((c) => c.id),
        ...a.reviewLog.map((r) => r.id),
        ...a.submissions.map((s) => s.id),
      ]);
      const collisions = [
        b.teacher.id,
        b.classRoom.id,
        ...b.students.map((s) => s.id),
        ...b.enrollments.map((e) => e.id),
        ...b.srsCards.map((c) => c.id),
        ...b.reviewLog.map((r) => r.id),
        ...b.submissions.map((s) => s.id),
      ].filter((id) => idsA.has(id));
      expect(collisions).toEqual([]);
    });

    it('same default seed yields identical student IDs (in order)', () => {
      const a = generateClassSeed(CLASS_INPUT);
      const b = generateClassSeed(CLASS_INPUT);
      expect(b.students.map((s) => s.id)).toEqual(a.students.map((s) => s.id));
    });

    it('same default seed yields identical enrollment IDs', () => {
      const a = generateClassSeed(CLASS_INPUT);
      const b = generateClassSeed(CLASS_INPUT);
      expect(b.enrollments.map((e) => e.id)).toEqual(a.enrollments.map((e) => e.id));
    });

    it('same default seed yields identical SRS card IDs', () => {
      const a = generateClassSeed(CLASS_INPUT);
      const b = generateClassSeed(CLASS_INPUT);
      expect(b.srsCards.map((c) => c.id)).toEqual(a.srsCards.map((c) => c.id));
    });

    it('same default seed yields identical review-log IDs', () => {
      const a = generateClassSeed(CLASS_INPUT);
      const b = generateClassSeed(CLASS_INPUT);
      expect(b.reviewLog.map((r) => r.id)).toEqual(a.reviewLog.map((r) => r.id));
    });

    it('same default seed yields identical submission IDs', () => {
      const a = generateClassSeed(CLASS_INPUT);
      const b = generateClassSeed(CLASS_INPUT);
      expect(b.submissions.map((s) => s.id)).toEqual(a.submissions.map((s) => s.id));
    });

    it('explicit rngSeed override still yields deterministic output', () => {
      const a = generateClassSeed({ ...CLASS_INPUT, rngSeed: 'override-1' });
      const b = generateClassSeed({ ...CLASS_INPUT, rngSeed: 'override-1' });
      expect(b).toEqual(a);
    });

    it('different rngSeed produces different student IDs', () => {
      const a = generateClassSeed({ ...CLASS_INPUT, rngSeed: 'override-1' });
      const b = generateClassSeed({ ...CLASS_INPUT, rngSeed: 'override-2' });
      const idsA = a.students.map((s) => s.id);
      const idsB = b.students.map((s) => s.id);
      // At least one ID must differ — proves the override is wired through
      // and the RNG is not a no-op constant.
      expect(idsA).not.toEqual(idsB);
    });
  });

  describe('foreign-key integrity (no dangling references)', () => {
    const result = generateClassSeed(CLASS_INPUT);
    const studentIds = new Set(result.students.map((s) => s.id));
    const cardIds = new Set(result.srsCards.map((c) => c.id));
    const classId = result.classRoom.id;

    it('every enrollment.classId points at the generated classroom', () => {
      for (const enrollment of result.enrollments) {
        expect(enrollment.classId).toBe(classId);
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

    it('every srsCard.studentId is in the generated student set', () => {
      for (const card of result.srsCards) {
        expect(
          studentIds.has(card.studentId),
          `dangling srsCard.studentId: ${card.studentId}`,
        ).toBe(true);
      }
    });

    it('every reviewLog.studentId is in the generated student set', () => {
      for (const review of result.reviewLog) {
        expect(
          studentIds.has(review.studentId),
          `dangling reviewLog.studentId: ${review.studentId}`,
        ).toBe(true);
      }
    });

    it('every reviewLog.cardId is in the generated srs_cards set', () => {
      for (const review of result.reviewLog) {
        expect(
          cardIds.has(review.cardId),
          `dangling reviewLog.cardId: ${review.cardId}`,
        ).toBe(true);
      }
    });

    it('every submission.studentId is in the generated student set', () => {
      for (const sub of result.submissions) {
        expect(
          studentIds.has(sub.studentId),
          `dangling submission.studentId: ${sub.studentId}`,
        ).toBe(true);
      }
    });

    it('classroom.teacherId matches the generated teacher.id', () => {
      expect(result.classRoom.teacherId).toBe(result.teacher.id);
    });

    it('all student usernames are unique within the class', () => {
      const usernames = result.students.map((s) => s.username);
      expect(new Set(usernames).size).toBe(usernames.length);
    });

    it('all enrollment IDs are unique within the class', () => {
      const ids = result.enrollments.map((e) => e.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all SRS card IDs are unique within the class', () => {
      const ids = result.srsCards.map((c) => c.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all review-log IDs are unique within the class', () => {
      const ids = result.reviewLog.map((r) => r.id);
      expect(new Set(ids).size).toBe(ids.length);
    });

    it('all submission IDs are unique within the class', () => {
      const ids = result.submissions.map((s) => s.id);
      expect(new Set(ids).size).toBe(ids.length);
    });
  });

  describe('organization + classroom + teacher wiring', () => {
    const result = generateClassSeed(CLASS_INPUT);

    it('emits a single organization with the requested slug', () => {
      expect(result.organization.slug).toBe(CLASS_INPUT.organizationSlug);
    });

    it('emits a single classroom with the requested name', () => {
      expect(result.classRoom.name).toBe(CLASS_INPUT.className);
    });

    it('emits a single teacher with the requested username', () => {
      expect(result.teacher.username).toBe(CLASS_INPUT.teacherUsername);
    });

    it('every student record carries the requested organizationSlug', () => {
      for (const student of result.students) {
        expect(student.organizationSlug).toBe(CLASS_INPUT.organizationSlug);
      }
    });
  });

  describe('source boundary contract', () => {
    it('does not import test fixtures from production seed generator code', () => {
      const source = readFileSync(
        resolve(APP_ROOT, 'lib/scale/seed-class.ts'),
        'utf8',
      );
      expect(source).not.toMatch(/@\/__tests__/);
    });
  });

  describe('result shape contract (downstream budget / snapshot consumer guard)', () => {
    const result = generateClassSeed(CLASS_INPUT);

    it('result.counts exposes exactly the expected keys (no drift for snapshot diffs)', () => {
      // The Green/closeout convex-test insertion test compares per-table row
      // counts against a snapshot fixture. The fixture compares against the
      // keys in this list, so any unannounced new key is a contract break.
      expect(Object.keys(result.counts).sort()).toEqual(
        ['enrollments', 'reviewLog', 'srsCards', 'students', 'submissions'],
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