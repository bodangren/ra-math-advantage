import Link from 'next/link';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { TeacherCourse } from '@/components/course/TeacherCourse';
export default async function TeacherDashboard() {
  const claims = await requireTeacherSessionClaims('/teacher/dashboard');
  const [data, topic11Candidates] = await Promise.all([
    fetchInternalQuery(internal.course.getTeacherData, { teacherId: claims.sub }),
    fetchInternalQuery(internal.course.getTopic11TeacherCandidates, { teacherId: claims.sub }),
  ]);
  return <main className="max-w-4xl mx-auto p-6"><h1>Teacher dashboard</h1><Link href="/teacher/gradebook" className="underline">Open gradebook</Link><TeacherCourse data={data} topic11Candidates={topic11Candidates} /></main>;
}
