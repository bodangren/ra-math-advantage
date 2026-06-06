import { requireTeacherSessionClaims } from '@/lib/auth/server';

export default async function TeacherLayout({ children }: { children: React.ReactNode }) {
  await requireTeacherSessionClaims('/auth/login', '/student/dashboard');
  return <>{children}</>;
}
