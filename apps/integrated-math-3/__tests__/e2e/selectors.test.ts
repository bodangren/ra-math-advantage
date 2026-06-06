import { describe, it, expect } from 'vitest';
import { SEL, E2E_SEED_KEY } from '@/e2e/selectors';

const KEBAB_CASE_PATTERN = /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/;

describe('e2e/selectors module — Phase 1 Red', () => {
  describe('module shape', () => {
    it('exports a SEL object', () => {
      expect(SEL).toBeDefined();
      expect(typeof SEL).toBe('object');
      expect(SEL).not.toBeNull();
    });

    it('exports a stable E2E_SEED_KEY string constant', () => {
      expect(E2E_SEED_KEY).toBeDefined();
      expect(typeof E2E_SEED_KEY).toBe('string');
      expect(E2E_SEED_KEY.length).toBeGreaterThan(0);
    });
  });

  describe('SEL values are non-empty strings', () => {
    it('every SEL entry is a non-empty string', () => {
      const entries = Object.entries(SEL);
      expect(entries.length).toBeGreaterThan(0);

      for (const [name, value] of entries) {
        expect(typeof value, `SEL.${name} should be a string`).toBe('string');
        expect(
          (value as string).length,
          `SEL.${name} should be a non-empty string`,
        ).toBeGreaterThan(0);
      }
    });
  });

  describe('SEL values are kebab-case data-testid tokens', () => {
    it('every SEL value matches kebab-case (e.g. "student-dashboard")', () => {
      const entries = Object.entries(SEL);

      for (const [name, value] of entries) {
        expect(
          KEBAB_CASE_PATTERN.test(value as string),
          `SEL.${name} = "${value}" should be kebab-case (a-z, 0-9, single-hyphen separators)`,
        ).toBe(true);
      }
    });
  });

  describe('SEL values are unique', () => {
    it('no duplicate values across SEL entries', () => {
      const values = Object.values(SEL) as string[];
      const unique = new Set(values);
      expect(unique.size, 'duplicate selector values found in SEL').toBe(values.length);
    });
  });

  describe('SEL names are stable (locked-in contract)', () => {
    it('exposes the minimum selector set the Phase 1 smoke spec depends on', () => {
      // The smoke spec will assert these by name. If any of them is renamed,
      // the test fails — which is the point: this is the public contract
      // between the E2E harness and the app components.
      const requiredKeys: Array<keyof typeof SEL> = [
        'studentDashboard',
        'studentDashboardLessonList',
        'studentDashboardLessonLink',
        'loginForm',
        'loginUsername',
        'loginPassword',
        'loginSubmit',
        'appShell',
      ];

      for (const key of requiredKeys) {
        expect(SEL[key], `SEL.${String(key)} should be defined`).toBeDefined();
        expect(typeof SEL[key], `SEL.${String(key)} should be a string`).toBe('string');
        expect(
          (SEL[key] as string).length,
          `SEL.${String(key)} should be a non-empty string`,
        ).toBeGreaterThan(0);
      }
    });

    it('exposes the Phase 2 selector set the auth and lesson-flow specs depend on', () => {
      // Phase 2 Red: the auth (logout/role-redirect/deactivated-denial) and
      // lesson-flow (full lesson + reload-persistence) specs use these keys.
      // The implementation must adopt them via data-testid={SEL.x}; until it
      // does, the E2E specs fail to find elements — which is the Red state.
      const requiredKeys: Array<keyof typeof SEL> = [
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
        expect(SEL[key], `SEL.${String(key)} should be defined`).toBeDefined();
        expect(typeof SEL[key], `SEL.${String(key)} should be a string`).toBe('string');
        expect(
          (SEL[key] as string).length,
          `SEL.${String(key)} should be a non-empty string`,
        ).toBeGreaterThan(0);
      }
    });
  });

  describe('E2E_SEED_KEY is a stable identifier', () => {
    it('is not the empty string and not whitespace-only', () => {
      expect(E2E_SEED_KEY.trim().length).toBeGreaterThan(0);
    });

    it('is deterministic across module loads (snapshot value)', () => {
      // The seed composer uses this key as the tombstone marker so a re-run
      // produces identical document ids. If the value drifts, idempotency
      // breaks. Pin the value.
      expect(E2E_SEED_KEY).toBe('e2e-seed-v1');
    });
  });
});
