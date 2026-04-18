import { describe, expect, it } from 'vitest';
import { resolveLessonLandingPhase } from '@/lib/student/lesson-runtime';

describe('resolveLessonLandingPhase', () => {
  describe('handles variable phase counts', () => {
    it('returns first phase for 4-phase lesson with no completed phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set(),
      });

      expect(result).toBe(1);
    });

    it('returns next incomplete phase for 4-phase lesson with some completed phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set([1, 2]),
      });

      expect(result).toBe(3);
    });

    it('returns last phase for 4-phase lesson with all phases completed', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set([1, 2, 3, 4]),
      });

      expect(result).toBe(4);
    });

    it('returns first phase for 8-phase lesson with no completed phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 8,
        completedPhaseNumbers: new Set(),
      });

      expect(result).toBe(1);
    });

    it('returns next incomplete phase for 8-phase lesson with some completed phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 8,
        completedPhaseNumbers: new Set([1, 2, 3, 4, 5]),
      });

      expect(result).toBe(6);
    });

    it('returns last phase for 8-phase lesson with all phases completed', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 8,
        completedPhaseNumbers: new Set([1, 2, 3, 4, 5, 6, 7, 8]),
      });

      expect(result).toBe(8);
    });

    it('returns first phase for 10-phase lesson with no completed phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 10,
        completedPhaseNumbers: new Set(),
      });

      expect(result).toBe(1);
    });

    it('returns next incomplete phase for 10-phase lesson with some completed phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 10,
        completedPhaseNumbers: new Set([1, 2, 3, 4, 5, 6, 7]),
      });

      expect(result).toBe(8);
    });

    it('returns last phase for 10-phase lesson with all phases completed', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 10,
        completedPhaseNumbers: new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
      });

      expect(result).toBe(10);
    });

    it('handles non-sequential completed phase numbers correctly', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 6,
        completedPhaseNumbers: new Set([1, 3, 5]),
      });

      expect(result).toBe(2);
    });

    it('handles edge case with 1 phase', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 1,
        completedPhaseNumbers: new Set(),
      });

      expect(result).toBe(1);
    });

    it('handles edge case with 0 phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 0,
        completedPhaseNumbers: new Set(),
      });

      expect(result).toBe(1);
    });
  });

  describe('handles skipped phases', () => {
    it('returns next non-skipped phase when current phase is skipped', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set([1, 2]),
        skippedPhaseNumbers: new Set([3]),
      });

      expect(result).toBe(4);
    });

    it('skips over multiple skipped phases to find next incomplete', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 6,
        completedPhaseNumbers: new Set([1]),
        skippedPhaseNumbers: new Set([2, 3]),
      });

      expect(result).toBe(4);
    });

    it('returns last phase when all remaining phases are skipped', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set([1, 2, 3]),
        skippedPhaseNumbers: new Set([4]),
      });

      expect(result).toBe(4);
    });

    it('handles mix of completed and skipped phases', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 6,
        completedPhaseNumbers: new Set([1, 4]),
        skippedPhaseNumbers: new Set([2]),
      });

      expect(result).toBe(3);
    });

    it('returns first phase when first phase is skipped', () => {
      const result = resolveLessonLandingPhase({
        totalPhases: 4,
        completedPhaseNumbers: new Set(),
        skippedPhaseNumbers: new Set([1]),
      });

      expect(result).toBe(2);
    });
  });
});
