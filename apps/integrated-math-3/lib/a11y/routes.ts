// apps/integrated-math-3/lib/a11y/routes.ts
//
// Representative route set for the IM3 axe-core accessibility gate
// (Phase 1, Task 3 — see
// `measure/tracks/wcag-aa-remediation_20260605/test-strategy.md` §0 and
// §1).
//
// Six routes cover the four Phase-1 risk categories without crawling
// every IM3 route. The route list is hand-maintained and guarded by
// `apps/integrated-math-3/__tests__/a11y/route-set.test.ts` Group B
// (every route resolves to a real `app/.../page.tsx`), per the
// test-strategy's A10 defense against generated-facts drift.

export type A11ySurface = 'auth' | 'student' | 'teacher';
export type A11yRiskCategory = 'form' | 'landmark' | 'activity' | 'color-state';

export interface A11yRoute {
  /** App-relative path used by the gate; matches Next.js route syntax. */
  path: string;
  /** Human-readable label, surfaced in findability reports. */
  name: string;
  /** Owner / surface category — drives Phase 3 / Phase 4 work split. */
  surface: A11ySurface;
  /** Which of the four Phase-1 risk categories this route exercises. */
  riskCategories: A11yRiskCategory[];
}

/**
 * Representative route set. Tests also import this from the
 * `__tests__/a11y/a11y-routes.ts` re-export shim so production code
 * and test data share one source of truth.
 */
export const A11Y_ROUTES: readonly A11yRoute[] = [
  {
    path: '/auth/login',
    name: 'Login',
    surface: 'auth',
    riskCategories: ['form'],
  },
  {
    path: '/student/dashboard',
    name: 'Student Dashboard',
    surface: 'student',
    riskCategories: ['landmark'],
  },
  {
    path: '/student/lesson/[lessonSlug]',
    name: 'Student Lesson',
    surface: 'student',
    riskCategories: ['activity'],
  },
  {
    path: '/student/practice',
    name: 'Student Daily Practice',
    surface: 'student',
    riskCategories: ['activity'],
  },
  {
    path: '/teacher/dashboard',
    name: 'Teacher Dashboard',
    surface: 'teacher',
    riskCategories: ['landmark'],
  },
  {
    path: '/teacher/gradebook',
    name: 'Teacher Gradebook',
    surface: 'teacher',
    riskCategories: ['color-state'],
  },
];
