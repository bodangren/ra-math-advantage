/** Returns the student dashboard route path. */
export function studentDashboardPath() {
  return '/student/dashboard';
}

/** Returns a dashboard anchor link targeting a specific unit section. */
export function studentUnitAnchor(unitNumber: number) {
  return `${studentDashboardPath()}#unit-${unitNumber}`;
}

/** Returns the student lesson route path for the given slug. */
export function studentLessonPath(slug: string) {
  return `/student/lesson/${slug}`;
}

/** Returns the student lesson phase route path with query parameter. */
export function studentLessonPhasePath(slug: string, phaseNumber: number) {
  return `${studentLessonPath(slug)}?phase=${phaseNumber}`;
}
