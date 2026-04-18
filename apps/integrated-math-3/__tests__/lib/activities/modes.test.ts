import { describe, it, expect } from 'vitest';
import { resolveActivityMode, type ActivityMode, type PhaseType } from '@/lib/activities/modes';

describe('modes', () => {
  describe('resolveActivityMode for teacher role', () => {
    it('always resolves to teaching mode regardless of phase', () => {
      const phaseTypes: PhaseType[] = [
        'worked_example',
        'guided_practice',
        'independent_practice',
        'assessment',
        'explore',
        'vocabulary',
      ];

      phaseTypes.forEach(phaseType => {
        const mode = resolveActivityMode({ role: 'teacher', phaseType });
        expect(mode).toBe('teaching');
      });
    });

    it('respects activity-level config override for teacher', () => {
      const mode = resolveActivityMode({
        role: 'teacher',
        phaseType: 'worked_example',
        activityModeOverride: 'practice',
      });
      expect(mode).toBe('practice');
    });
  });

  describe('resolveActivityMode for student role', () => {
    it('resolves worked_example phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'worked_example' });
      expect(mode).toBe('guided');
    });

    it('resolves guided_practice phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'guided_practice' });
      expect(mode).toBe('guided');
    });

    it('resolves independent_practice phase to practice mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'independent_practice' });
      expect(mode).toBe('practice');
    });

    it('resolves assessment phase to practice mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'assessment' });
      expect(mode).toBe('practice');
    });

    it('resolves explore phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'explore' });
      expect(mode).toBe('guided');
    });

    it('resolves vocabulary phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'vocabulary' });
      expect(mode).toBe('guided');
    });

    it('resolves learn phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'learn' });
      expect(mode).toBe('guided');
    });

    it('resolves key_concept phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'key_concept' });
      expect(mode).toBe('guided');
    });

    it('resolves discourse phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'discourse' });
      expect(mode).toBe('guided');
    });

    it('resolves reflection phase to guided mode', () => {
      const mode = resolveActivityMode({ role: 'student', phaseType: 'reflection' });
      expect(mode).toBe('guided');
    });
  });

  describe('activity-level config override', () => {
    it('overrides resolved mode for student', () => {
      const mode = resolveActivityMode({
        role: 'student',
        phaseType: 'worked_example',
        activityModeOverride: 'practice',
      });
      expect(mode).toBe('practice');
    });

    it('overrides resolved mode for teacher', () => {
      const mode = resolveActivityMode({
        role: 'teacher',
        phaseType: 'worked_example',
        activityModeOverride: 'guided',
      });
      expect(mode).toBe('guided');
    });

    it('ignores null/undefined override', () => {
      const mode1 = resolveActivityMode({
        role: 'student',
        phaseType: 'worked_example',
        activityModeOverride: null as unknown as ActivityMode,
      });
      expect(mode1).toBe('guided');

      const mode2 = resolveActivityMode({
        role: 'student',
        phaseType: 'worked_example',
        activityModeOverride: undefined,
      });
      expect(mode2).toBe('guided');
    });
  });

  describe('admin role', () => {
    it('resolves admin role same as teacher (teaching mode)', () => {
      const mode = resolveActivityMode({ role: 'admin', phaseType: 'worked_example' });
      expect(mode).toBe('teaching');
    });

    it('respects activity-level config override for admin', () => {
      const mode = resolveActivityMode({
        role: 'admin',
        phaseType: 'worked_example',
        activityModeOverride: 'practice',
      });
      expect(mode).toBe('practice');
    });
  });

  describe('ActivityMode type', () => {
    it('only allows valid mode values', () => {
      const validModes: ActivityMode[] = ['teaching', 'guided', 'practice'];
      expect(validModes).toHaveLength(3);
    });
  });
});
