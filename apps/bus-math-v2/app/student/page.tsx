import { redirect } from 'next/navigation';

import { studentDashboardPath } from '@/lib/student/navigation';

/**
 * Redirects the student index route to the student dashboard.
 *
 * @returns Never renders; always redirects.
 */
export default async function StudentIndexPage() {
  redirect(studentDashboardPath());
}
