import { redirect } from 'next/navigation';

/**
 * Root student route that immediately redirects to the student dashboard.
 *
 * @returns {JSX.Element} A redirect response to /student/dashboard.
 */
export default function StudentPage() {
  redirect('/student/dashboard');
}
