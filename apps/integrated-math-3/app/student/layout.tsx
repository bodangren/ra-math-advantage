import { requireStudentSessionClaims } from '@/lib/auth/server';

/**
 * Layout wrapper for all student routes that enforces authentication by
 * verifying session claims before rendering child pages.
 *
 * @returns The rendered StudentLayout JSX.
 */
export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireStudentSessionClaims('/auth/login');
  return <>{children}</>;
}
