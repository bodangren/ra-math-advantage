import { redirect } from 'next/navigation';
import { requireServerSessionClaims } from '@/lib/auth/server';

export default async function DashboardPage() {
  const claims = await requireServerSessionClaims('/dashboard');
  redirect(claims.role === 'student' ? '/student/dashboard' : '/teacher/dashboard');
}
