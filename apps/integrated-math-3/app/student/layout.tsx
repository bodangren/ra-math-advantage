import { requireStudentSessionClaims } from '@/lib/auth/server';

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  await requireStudentSessionClaims('/auth/login');
  return <>{children}</>;
}
