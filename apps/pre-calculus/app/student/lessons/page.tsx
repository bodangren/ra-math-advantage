import Link from 'next/link';
import { requireStudentSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
export default async function LessonsPage() {
  const claims = await requireStudentSessionClaims('/student/lessons');
  const lessons: { id: string; topic: string; title: string }[] = await fetchInternalQuery(internal.course.getLessons, { learnerId: claims.sub });
  return <main className="max-w-content mx-auto p-6"><h1>Course lessons</h1>
    <p>Open a lesson. Read each phase. Submit your work for teacher review.</p>
    {lessons.length === 0 && <p>No lessons are published. Ask your teacher to publish the course.</p>}
    <ul className="grid gap-3 mt-6">{lessons.map(lesson => <li key={lesson.id}><Link className="underline" href={`/student/lessons/${lesson.topic}`}>{lesson.topic} {lesson.title}</Link></li>)}</ul>
  </main>;
}
