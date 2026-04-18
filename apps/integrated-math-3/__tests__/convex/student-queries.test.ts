import { describe, expect, it } from 'vitest';
import { buildLessonPhaseProgress } from '@/lib/progress/published-curriculum';

describe('Student Queries - Phase Type Support', () => {
  describe('buildLessonPhaseProgress includes phaseType', () => {
    it('returns phase data with phaseType field', () => {
      const phases = [
        {
          _id: 'phase1',
          phaseNumber: 1,
          phaseType: 'explore',
        },
        {
          _id: 'phase2',
          phaseNumber: 2,
          phaseType: 'learn',
        },
      ];

      const progressRows: Array<{
        phaseId: string;
        status: 'not_started' | 'in_progress' | 'completed';
        startedAt?: number | null;
        completedAt?: number | null;
        timeSpentSeconds?: number | null;
        updatedAt?: number | null;
      }> = [];

      const result = buildLessonPhaseProgress({ phases, progressRows });

      expect(result).toHaveLength(2);
      expect(result[0]).toHaveProperty('phaseType', 'explore');
      expect(result[1]).toHaveProperty('phaseType', 'learn');
    });

    it('includes phaseType for all phase types', () => {
      const allPhaseTypes = [
        'explore',
        'vocabulary',
        'learn',
        'key_concept',
        'worked_example',
        'guided_practice',
        'independent_practice',
        'assessment',
        'discourse',
        'reflection',
      ];

      const phases = allPhaseTypes.map((phaseType, index) => ({
        _id: `phase${index}`,
        phaseNumber: index + 1,
        phaseType,
      }));

      const result = buildLessonPhaseProgress({ phases, progressRows: [] });

      expect(result).toHaveLength(10);
      result.forEach((phase, index) => {
        expect(phase.phaseType).toBe(allPhaseTypes[index]);
      });
    });
  });
});
