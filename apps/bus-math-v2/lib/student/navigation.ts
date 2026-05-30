/**
 * Returns the student dashboard path.
 * @returns Dashboard path for students
 */
export function studentDashboardPath() {
  return '/student/dashboard';
}

/**
 * Returns the teacher dashboard path.
 * @returns Dashboard path for teachers
 */
export function teacherDashboardPath() {
  return '/teacher/dashboard';
}

/**
 * Returns the appropriate dashboard path based on user role.
 * @param role - User role (student, teacher, admin, or undefined)
 * @returns Dashboard path for the given role
 */
export function getRoleAwareDashboardPath(role: 'student' | 'teacher' | 'admin' | undefined) {
  if (role === 'student') {
    return studentDashboardPath();
  }
  // Teachers and admins both go to teacher dashboard
  return teacherDashboardPath();
}

/**
 * Returns an anchor link to a specific unit on the student dashboard.
 * @param unitNumber - The unit number (1-based)
 * @returns Anchor link to the unit section
 */
export function studentUnitAnchor(unitNumber: number) {
  return `${studentDashboardPath()}#unit-${unitNumber}`;
}

/**
 * Returns the path to a specific lesson for students.
 * @param slug - Lesson slug identifier
 * @returns Path to the lesson page
 */
export function studentLessonPath(slug: string) {
  return `/student/lesson/${slug}`;
}

/**
 * Returns the path to a specific lesson phase for students.
 * @param slug - Lesson slug identifier
 * @param phaseNumber - The phase number (1-based)
 * @returns Path to the lesson with phase query parameter
 */
export function studentLessonPhasePath(slug: string, phaseNumber: number) {
  return `${studentLessonPath(slug)}?phase=${phaseNumber}`;
}
