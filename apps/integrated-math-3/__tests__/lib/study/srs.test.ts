import { describe, it, expect, beforeEach } from 'vitest';
import {
  scheduleNewTerm,
  processReview,
  getDueTerms,
  proficiencyBand,
  updateMastery,
} from '@/lib/study/srs';
import type { ScheduledTerm } from '@/lib/study/types';

describe('srs', () => {
  describe('scheduleNewTerm', () => {
    it('creates a scheduled term with valid structure', () => {
      const scheduled = scheduleNewTerm('quadratic-function');
      expect(scheduled.termSlug).toBe('quadratic-function');
      expect(scheduled.fsrsState).toBeDefined();
      expect(typeof scheduled.scheduledFor).toBe('number');
    });

    it('schedules term due in the future', () => {
      const before = Date.now();
      const scheduled = scheduleNewTerm('test-term');
      const after = Date.now();
      expect(scheduled.scheduledFor).toBeGreaterThanOrEqual(before);
      expect(scheduled.scheduledFor).toBeLessThanOrEqual(after + 60000);
    });

    it('creates unique states for different terms', () => {
      const scheduled1 = scheduleNewTerm('term-1');
      const scheduled2 = scheduleNewTerm('term-2');
      expect(scheduled1.termSlug).not.toBe(scheduled2.termSlug);
    });
  });

  describe('processReview', () => {
    let scheduledTerm: ScheduledTerm;

    beforeEach(() => {
      scheduledTerm = scheduleNewTerm('test-term');
    });

    it('processes "again" rating with negative delta', () => {
      const result = processReview(scheduledTerm, 'again');
      expect(result.masteryDelta).toBe(-0.2);
      expect(result.fsrsState).toBeDefined();
      expect(result.scheduledFor).toBeDefined();
    });

    it('processes "hard" rating with small negative delta', () => {
      const result = processReview(scheduledTerm, 'hard');
      expect(result.masteryDelta).toBe(-0.05);
    });

    it('processes "good" rating with positive delta', () => {
      const result = processReview(scheduledTerm, 'good');
      expect(result.masteryDelta).toBe(0.1);
    });

    it('processes "easy" rating with larger positive delta', () => {
      const result = processReview(scheduledTerm, 'easy');
      expect(result.masteryDelta).toBe(0.2);
    });

    it('updates scheduledFor to future date', () => {
      const before = scheduledTerm.scheduledFor;
      const result = processReview(scheduledTerm, 'good');
      expect(result.scheduledFor).toBeGreaterThan(before);
    });
  });

  describe('getDueTerms', () => {
    it('returns empty array when no terms are due', () => {
      const scheduled = scheduleNewTerm('future-term');
      const due = getDueTerms([scheduled], Date.now() - 1000);
      expect(due).toEqual([]);
    });

    it('returns terms that are due', () => {
      const pastScheduled: ScheduledTerm = {
        termSlug: 'past-term',
        fsrsState: {},
        scheduledFor: Date.now() - 10000,
      };
      const due = getDueTerms([pastScheduled], Date.now());
      expect(due.length).toBe(1);
      expect(due[0].termSlug).toBe('past-term');
    });

    it('filters out future terms', () => {
      const pastScheduled: ScheduledTerm = {
        termSlug: 'past-term',
        fsrsState: {},
        scheduledFor: Date.now() - 10000,
      };
      const futureScheduled: ScheduledTerm = {
        termSlug: 'future-term',
        fsrsState: {},
        scheduledFor: Date.now() + 10000,
      };
      const due = getDueTerms([pastScheduled, futureScheduled], Date.now());
      expect(due.length).toBe(1);
      expect(due[0].termSlug).toBe('past-term');
    });

    it('handles empty array', () => {
      const due = getDueTerms([], Date.now());
      expect(due).toEqual([]);
    });
  });

  describe('proficiencyBand', () => {
    it('returns "new" for score of 0', () => {
      expect(proficiencyBand(0)).toBe('new');
    });

    it('returns "learning" for scores below 0.3', () => {
      expect(proficiencyBand(0.1)).toBe('learning');
      expect(proficiencyBand(0.29)).toBe('learning');
    });

    it('returns "familiar" for scores 0.3 to 0.69', () => {
      expect(proficiencyBand(0.3)).toBe('familiar');
      expect(proficiencyBand(0.5)).toBe('familiar');
      expect(proficiencyBand(0.69)).toBe('familiar');
    });

    it('returns "mastered" for scores 0.7 and above', () => {
      expect(proficiencyBand(0.7)).toBe('mastered');
      expect(proficiencyBand(1)).toBe('mastered');
    });
  });

  describe('updateMastery', () => {
    it('adds delta to current score', () => {
      expect(updateMastery(0.5, 0.1)).toBe(0.6);
    });

    it('subtracts delta from current score', () => {
      expect(updateMastery(0.5, -0.1)).toBe(0.4);
    });

    it('clamps to 0 at minimum', () => {
      expect(updateMastery(0.1, -0.2)).toBe(0);
    });

    it('clamps to 1 at maximum', () => {
      expect(updateMastery(0.9, 0.2)).toBe(1);
    });

    it('handles boundary values', () => {
      expect(updateMastery(0, 0)).toBe(0);
      expect(updateMastery(1, 0)).toBe(1);
    });
  });
});
