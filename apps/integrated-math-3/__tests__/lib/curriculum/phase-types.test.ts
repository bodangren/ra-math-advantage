import { describe, it, expect } from 'vitest';
import { getPhaseDisplayInfo, PHASE_TYPES, isValidPhaseType } from '@/lib/curriculum/phase-types';

describe('phase-types', () => {
  describe('PHASE_TYPES', () => {
    it('contains all 10 phase types', () => {
      expect(PHASE_TYPES).toHaveLength(10);
    });

    it('contains required phase types', () => {
      expect(PHASE_TYPES).toContain('explore');
      expect(PHASE_TYPES).toContain('vocabulary');
      expect(PHASE_TYPES).toContain('learn');
      expect(PHASE_TYPES).toContain('key_concept');
      expect(PHASE_TYPES).toContain('worked_example');
      expect(PHASE_TYPES).toContain('guided_practice');
      expect(PHASE_TYPES).toContain('independent_practice');
      expect(PHASE_TYPES).toContain('assessment');
      expect(PHASE_TYPES).toContain('discourse');
      expect(PHASE_TYPES).toContain('reflection');
    });
  });

  describe('isValidPhaseType', () => {
    it('returns true for all valid phase types', () => {
      PHASE_TYPES.forEach((type: string) => {
        expect(isValidPhaseType(type)).toBe(true);
      });
    });

    it('returns false for invalid phase types', () => {
      expect(isValidPhaseType('invalid')).toBe(false);
      expect(isValidPhaseType('hook')).toBe(false);
      expect(isValidPhaseType('introduction')).toBe(false);
      expect(isValidPhaseType('closing')).toBe(false);
      expect(isValidPhaseType('')).toBe(false);
      expect(isValidPhaseType(null)).toBe(false);
      expect(isValidPhaseType(undefined)).toBe(false);
    });
  });

  describe('getPhaseDisplayInfo', () => {
    it('returns correct info for explore phase', () => {
      const info = getPhaseDisplayInfo('explore');
      expect(info).toEqual({
        label: 'Explore',
        icon: 'compass',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      });
    });

    it('returns correct info for vocabulary phase', () => {
      const info = getPhaseDisplayInfo('vocabulary');
      expect(info).toEqual({
        label: 'Vocabulary',
        icon: 'book-open',
        color: 'text-purple-600',
        bgColor: 'bg-purple-50',
      });
    });

    it('returns correct info for learn phase', () => {
      const info = getPhaseDisplayInfo('learn');
      expect(info).toEqual({
        label: 'Learn',
        icon: 'lightbulb',
        color: 'text-amber-600',
        bgColor: 'bg-amber-50',
      });
    });

    it('returns correct info for key_concept phase', () => {
      const info = getPhaseDisplayInfo('key_concept');
      expect(info).toEqual({
        label: 'Key Concept',
        icon: 'star',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50',
      });
    });

    it('returns correct info for worked_example phase', () => {
      const info = getPhaseDisplayInfo('worked_example');
      expect(info).toEqual({
        label: 'Example',
        icon: 'play-circle',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      });
    });

    it('returns correct info for guided_practice phase', () => {
      const info = getPhaseDisplayInfo('guided_practice');
      expect(info).toEqual({
        label: 'Guided Practice',
        icon: 'help-circle',
        color: 'text-cyan-600',
        bgColor: 'bg-cyan-50',
      });
    });

    it('returns correct info for independent_practice phase', () => {
      const info = getPhaseDisplayInfo('independent_practice');
      expect(info).toEqual({
        label: 'Practice',
        icon: 'pen-tool',
        color: 'text-indigo-600',
        bgColor: 'bg-indigo-50',
      });
    });

    it('returns correct info for assessment phase', () => {
      const info = getPhaseDisplayInfo('assessment');
      expect(info).toEqual({
        label: 'Assessment',
        icon: 'check-circle-2',
        color: 'text-red-600',
        bgColor: 'bg-red-50',
      });
    });

    it('returns correct info for discourse phase', () => {
      const info = getPhaseDisplayInfo('discourse');
      expect(info).toEqual({
        label: 'Think About It',
        icon: 'message-square',
        color: 'text-pink-600',
        bgColor: 'bg-pink-50',
      });
    });

    it('returns correct info for reflection phase', () => {
      const info = getPhaseDisplayInfo('reflection');
      expect(info).toEqual({
        label: 'Reflection',
        icon: 'clock',
        color: 'text-gray-600',
        bgColor: 'bg-gray-50',
      });
    });
  });
});
