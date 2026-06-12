import { requireTeacherSessionClaims } from '@/lib/auth/server';

/**
 * Wraps all teacher routes with session-based access control, redirecting
 * unauthenticated users to the login page.
 *
 * @returns The rendered TeacherLayout JSX wrapping its children.
 */
export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireTeacherSessionClaims('/auth/login', '/student/dashboard');
  return <>{children}</>;
}
