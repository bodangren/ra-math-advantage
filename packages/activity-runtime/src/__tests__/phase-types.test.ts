import { describe, it, expect } from 'vitest';
import {
  PHASE_TYPES,
  SKIPPABLE_PHASE_TYPES,
  getPhaseDisplayInfo,
  isSkippable,
  isValidPhaseType,
} from '../index';

describe('phase-types', () => {
  describe('PHASE_TYPES', () => {
    it('contains all expected phase types', () => {
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
      expect(PHASE_TYPES.length).toBe(10);
    });
  });

  describe('isValidPhaseType', () => {
    it('returns true for valid phase types', () => {
      expect(isValidPhaseType('explore')).toBe(true);
      expect(isValidPhaseType('independent_practice')).toBe(true);
      expect(isValidPhaseType('assessment')).toBe(true);
    });

    it('returns false for invalid values', () => {
      expect(isValidPhaseType('invalid')).toBe(false);
      expect(isValidPhaseType('')).toBe(false);
      expect(isValidPhaseType(null)).toBe(false);
      expect(isValidPhaseType(undefined)).toBe(false);
      expect(isValidPhaseType(123)).toBe(false);
    });
  });

  describe('getPhaseDisplayInfo', () => {
    it('returns display info for each phase type', () => {
      const info = getPhaseDisplayInfo('explore');
      expect(info.label).toBe('Explore');
      expect(info.icon).toBe('compass');
      expect(info.color).toBe('text-blue-600');
      expect(info.bgColor).toBe('bg-blue-50');
    });

    it('returns correct info for practice phase', () => {
      const info = getPhaseDisplayInfo('independent_practice');
      expect(info.label).toBe('Practice');
      expect(info.icon).toBe('pen-tool');
    });
  });

  describe('SKIPPABLE_PHASE_TYPES', () => {
    it('contains skippable phases', () => {
      expect(SKIPPABLE_PHASE_TYPES).toContain('explore');
      expect(SKIPPABLE_PHASE_TYPES).toContain('discourse');
      expect(SKIPPABLE_PHASE_TYPES.length).toBe(2);
    });
  });

  describe('isSkippable', () => {
    it('returns true for skippable phases', () => {
      expect(isSkippable('explore')).toBe(true);
      expect(isSkippable('discourse')).toBe(true);
    });

    it('returns false for non-skippable phases', () => {
      expect(isSkippable('independent_practice')).toBe(false);
      expect(isSkippable('assessment')).toBe(false);
      expect(isSkippable('learn')).toBe(false);
    });
  });
});