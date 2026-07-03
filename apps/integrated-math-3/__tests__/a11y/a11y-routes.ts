/**
 * Representative route set for the IM3 axe-core accessibility gate.
 *
 * Six routes cover the four Phase-1 risk categories without crawling every
 * route: form, landmark, activity, and color-only state.
 */

export interface A11yRoute {
  path: string;
  name: string;
  surface: 'auth' | 'student' | 'teacher';
  riskCategories: Array<'form' | 'landmark' | 'activity' | 'color-state'>;
}

export const A11Y_ROUTES: A11yRoute[] = [
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

/**
 * Flat list of paths used by the gate harness.
 */
export const REPRESENTATIVE_ROUTES: string[] = A11Y_ROUTES.map((route) => route.path);
