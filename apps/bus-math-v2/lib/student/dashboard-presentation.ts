export type DashboardProgressStatus = 'not_started' | 'in_progress' | 'completed';

export interface DashboardLessonActionLink {
  unitNumber: number;
  title: string;
  slug: string;
  description?: string | null;
  actionLabel: 'Start Lesson' | 'Resume Lesson' | 'Review Lesson';
}

/**
 * Returns Tailwind classes for the status badge based on progress status.
 * @param status - The lesson progress status
 * @returns Tailwind class string for badge styling
 */
export function dashboardStatusBadgeClassName(status: DashboardProgressStatus) {
  if (status === 'completed') {
    return 'border-emerald-200 bg-emerald-50 text-emerald-700';
  }

  if (status === 'in_progress') {
    return 'border-sky-200 bg-sky-50 text-sky-700';
  }

  return 'border-amber-200 bg-amber-50 text-amber-700';
}

/**
 * Returns a human-readable label for the dashboard progress status.
 * @param status - The lesson progress status
 * @returns Human-readable label string
 */
export function dashboardStatusLabel(status: DashboardProgressStatus) {
  if (status === 'completed') return 'Completed';
  if (status === 'in_progress') return 'In Progress';
  return 'Not Started';
}
