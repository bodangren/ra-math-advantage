import { describe, it, expect, beforeEach } from 'vitest';
import { PhaseActivityTracker } from '@/lib/activities/completion';

describe('PhaseActivityTracker', () => {
  let tracker: PhaseActivityTracker;

  beforeEach(() => {
    tracker = new PhaseActivityTracker();
  });

  describe('markActivityComplete', () => {
    it('marks an activity as completed for a student', () => {
      tracker.markActivityComplete('student1', 'activity1');
      expect(tracker.isActivityComplete('student1', 'activity1')).toBe(true);
    });

    it('marks multiple activities for the same student', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student1', 'activity2');
      tracker.markActivityComplete('student1', 'activity3');

      expect(tracker.isActivityComplete('student1', 'activity1')).toBe(true);
      expect(tracker.isActivityComplete('student1', 'activity2')).toBe(true);
      expect(tracker.isActivityComplete('student1', 'activity3')).toBe(true);
    });

    it('tracks activities separately for different students', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student2', 'activity2');

      expect(tracker.isActivityComplete('student1', 'activity1')).toBe(true);
      expect(tracker.isActivityComplete('student1', 'activity2')).toBe(false);
      expect(tracker.isActivityComplete('student2', 'activity1')).toBe(false);
      expect(tracker.isActivityComplete('student2', 'activity2')).toBe(true);
    });

    it('does not change state when marking already completed activity', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student1', 'activity1');

      expect(tracker.isActivityComplete('student1', 'activity1')).toBe(true);
    });
  });

  describe('isActivityComplete', () => {
    it('returns false for untracked activity', () => {
      expect(tracker.isActivityComplete('student1', 'activity1')).toBe(false);
    });

    it('returns false for different student', () => {
      tracker.markActivityComplete('student1', 'activity1');
      expect(tracker.isActivityComplete('student2', 'activity1')).toBe(false);
    });

    it('returns false for different activity', () => {
      tracker.markActivityComplete('student1', 'activity1');
      expect(tracker.isActivityComplete('student1', 'activity2')).toBe(false);
    });
  });

  describe('areAllActivitiesComplete', () => {
    it('returns true when no activities are required', () => {
      expect(tracker.areAllActivitiesComplete('student1', [])).toBe(true);
    });

    it('returns true when all required activities are completed', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student1', 'activity2');
      tracker.markActivityComplete('student1', 'activity3');

      expect(tracker.areAllActivitiesComplete('student1', ['activity1', 'activity2', 'activity3'])).toBe(true);
    });

    it('returns false when some required activities are not completed', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student1', 'activity2');

      expect(tracker.areAllActivitiesComplete('student1', ['activity1', 'activity2', 'activity3'])).toBe(false);
    });

    it('returns false when no required activities are completed', () => {
      expect(tracker.areAllActivitiesComplete('student1', ['activity1', 'activity2'])).toBe(false);
    });

    it('returns true when extra completed activities exist beyond required', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student1', 'activity2');
      tracker.markActivityComplete('student1', 'activity3');
      tracker.markActivityComplete('student1', 'activity4');

      expect(tracker.areAllActivitiesComplete('student1', ['activity1', 'activity2', 'activity3'])).toBe(true);
    });

    it('handles duplicate activity IDs in required list', () => {
      tracker.markActivityComplete('student1', 'activity1');

      expect(tracker.areAllActivitiesComplete('student1', ['activity1', 'activity1'])).toBe(true);
    });
  });

  describe('getCompletedActivities', () => {
    it('returns empty array for student with no completions', () => {
      expect(tracker.getCompletedActivities('student1')).toEqual([]);
    });

    it('returns list of completed activity IDs for student', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student1', 'activity2');
      tracker.markActivityComplete('student1', 'activity3');

      const completed = tracker.getCompletedActivities('student1');
      expect(completed).toHaveLength(3);
      expect(completed).toContain('activity1');
      expect(completed).toContain('activity2');
      expect(completed).toContain('activity3');
    });

    it('does not include activities completed by other students', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student2', 'activity2');

      const student1Completed = tracker.getCompletedActivities('student1');
      const student2Completed = tracker.getCompletedActivities('student2');

      expect(student1Completed).toEqual(['activity1']);
      expect(student2Completed).toEqual(['activity2']);
    });
  });

  describe('clearStudent', () => {
    it('removes all completions for a student', () => {
      tracker.markActivityComplete('student1', 'activity1');
      tracker.markActivityComplete('student1', 'activity2');
      tracker.markActivityComplete('student2', 'activity1');

      tracker.clearStudent('student1');

      expect(tracker.isActivityComplete('student1', 'activity1')).toBe(false);
      expect(tracker.isActivityComplete('student1', 'activity2')).toBe(false);
      expect(tracker.isActivityComplete('student2', 'activity1')).toBe(true);
    });

    it('handles clearing non-existent student', () => {
      expect(() => tracker.clearStudent('nonexistent')).not.toThrow();
    });
  });

  describe('integration with PhaseCompleteButton', () => {
    it('provides data needed for gating logic', () => {
      tracker.markActivityComplete('student1', 'quiz1');
      tracker.markActivityComplete('student1', 'exercise1');

      const requiredActivities = ['quiz1', 'exercise1', 'final-check'];
      const allComplete = tracker.areAllActivitiesComplete('student1', requiredActivities);
      const completedCount = tracker.getCompletedActivities('student1').length;
      const requiredCount = requiredActivities.length;

      expect(allComplete).toBe(false);
      expect(completedCount).toBe(2);
      expect(requiredCount).toBe(3);

      tracker.markActivityComplete('student1', 'final-check');
      expect(tracker.areAllActivitiesComplete('student1', requiredActivities)).toBe(true);
    });
  });
});
