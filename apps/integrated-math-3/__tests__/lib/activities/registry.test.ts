import { describe, it, expect, beforeEach } from 'vitest';
import { getActivityComponent, getRegisteredActivityKeys, registerActivity, clearActivityRegistry } from '@/lib/activities/registry';

describe('registry', () => {
  const mockComponent = () => null;

  beforeEach(() => {
    clearActivityRegistry();
  });

  describe('getActivityComponent', () => {
    it('returns component for registered key', () => {
      registerActivity('test-activity', mockComponent);
      const component = getActivityComponent('test-activity');
      expect(component).toBeDefined();
      expect(component).toBe(mockComponent);
    });

    it('returns undefined for unknown key', () => {
      const component = getActivityComponent('unknown-activity');
      expect(component).toBeUndefined();
    });

    it('returns undefined for empty string', () => {
      const component = getActivityComponent('');
      expect(component).toBeUndefined();
    });

    it('returns undefined for null/undefined', () => {
      expect(getActivityComponent(null as unknown as string)).toBeUndefined();
      expect(getActivityComponent(undefined as unknown as string)).toBeUndefined();
    });
  });

  describe('getRegisteredActivityKeys', () => {
    it('returns empty array when no components registered', () => {
      const keys = getRegisteredActivityKeys();
      expect(keys).toEqual([]);
      expect(keys).toHaveLength(0);
    });

    it('returns all 6 Module 1 keys when registered', () => {
      const module1Keys = [
        'comprehension-quiz',
        'fill-in-the-blank',
        'graphing-explorer',
        'equation-solver',
        'drag-drop-categorization',
        'discriminant-analyzer',
      ];

      module1Keys.forEach(key => {
        registerActivity(key, mockComponent);
      });

      const keys = getRegisteredActivityKeys();
      expect(keys).toHaveLength(6);
      module1Keys.forEach(key => {
        expect(keys).toContain(key);
      });
    });

    it('returns keys in insertion order', () => {
      registerActivity('first', mockComponent);
      registerActivity('second', mockComponent);
      registerActivity('third', mockComponent);

      const keys = getRegisteredActivityKeys();
      expect(keys).toEqual(['first', 'second', 'third']);
    });
  });

  describe('registerActivity', () => {
    it('overwrites existing component when same key is registered', () => {
      const component1 = () => null;
      const component2 = () => null;

      registerActivity('test', component1);
      expect(getActivityComponent('test')).toBe(component1);

      registerActivity('test', component2);
      expect(getActivityComponent('test')).toBe(component2);
      expect(getActivityComponent('test')).not.toBe(component1);
    });
  });
});
