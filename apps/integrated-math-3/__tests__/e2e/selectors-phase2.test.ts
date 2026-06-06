import { describe, it, expect } from 'vitest';
import { SEL_PHASE2 } from '@/e2e/selectors-phase2';

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

describe('e2e/selectors-phase2 module — Phase 2 Red', () => {
  describe('module shape', () => {
    it('exports a SEL_PHASE2 object', () => {
      expect(SEL_PHASE2).toBeDefined();
      expect(typeof SEL_PHASE2).toBe('object');
      expect(SEL_PHASE2).not.toBeNull();
    });
  });

  describe('SEL_PHASE2 values are non-empty strings', () => {
    it('every entry is a non-empty string', () => {
      const entries = Object.entries(SEL_PHASE2);
      expect(entries.length).toBeGreaterThan(0);

      for (const [name, value] of entries) {
        expect(typeof value, `SEL_PHASE2.${name} should be a string`).toBe('string');
        expect(
          (value as string).length,
          `SEL_PHASE2.${name} should be a non-empty string`,
        ).toBeGreaterThan(0);
      }
    });
  });

  describe('SEL_PHASE2 values are kebab-case data-testid tokens', () => {
    it('every value matches kebab-case (a-z, 0-9, single-hyphen separators)', () => {
      const entries = Object.entries(SEL_PHASE2);

      for (const [name, value] of entries) {
        expect(
          KEBAB_CASE_PATTERN.test(value as string),
          `SEL_PHASE2.${name} = "${value}" should be kebab-case`,
        ).toBe(true);
      }
    });
  });

  describe('SEL_PHASE2 values are unique', () => {
    it('no duplicate values across entries', () => {
      const values = Object.values(SEL_PHASE2) as string[];
      const unique = new Set(values);
      expect(unique.size, 'duplicate selector values found in SEL_PHASE2').toBe(values.length);
    });
  });

  describe('SEL_PHASE2 names are stable (locked-in contract)', () => {
    it('exposes the selector set the Phase 2 auth and lesson-flow specs depend on', () => {
      // Phase 2 Red: the auth (logout/role-redirect/deactivated-denial) and
      // lesson-flow (full lesson + reload-persistence) specs use these keys.
      // The implementation must adopt them via data-testid={SEL_PHASE2.x};
      // until it does, the E2E specs fail to find elements — which is the
      // Red state.
      const requiredKeys: Array<keyof typeof SEL_PHASE2> = [
        'studentDashboardHeading',
        'loginError',
        'logoutButton',
        'userMenu',
        'lessonRenderer',
        'lessonHeader',
        'lessonTitle',
        'phaseStepper',
        'phaseStepperDot',
        'phaseCompleteButton',
        'phaseCompleteStatus',
        'lessonCompleteScreen',
        'lessonCompleteContinueBtn',
        'deactivatedLoginError',
      ];

      for (const key of requiredKeys) {
        expect(SEL_PHASE2[key], `SEL_PHASE2.${String(key)} should be defined`).toBeDefined();
        expect(typeof SEL_PHASE2[key], `SEL_PHASE2.${String(key)} should be a string`).toBe('string');
        expect(
          (SEL_PHASE2[key] as string).length,
          `SEL_PHASE2.${String(key)} should be a non-empty string`,
        ).toBeGreaterThan(0);
      }
    });
  });
});
