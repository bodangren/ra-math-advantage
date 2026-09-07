import Link from "next/link";
import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
export default async function StudentDashboard() {
  const claims = await requireStudentSessionClaims("/student/dashboard");
  const lessons = await fetchInternalQuery(internal.student.getDashboardData, {
    userId: claims.sub as Id<"profiles">,
  });
  const next = lessons.find((lesson) => lesson.completed < lesson.total);
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-display mb-6">My lessons</h1>
      {next && (
        <p className="mb-6">
          <Link className="btn-primary" href={`/student/lessons/${next.slug}`}>
            Continue: {next.title}
          </Link>
        </p>
      )}
      {lessons.length === 0 ? (
        <p>Your teacher has not assigned a published lesson yet.</p>
      ) : (
        <ul className="space-y-4">
          {lessons.map((lesson) => (
            <li className="card-surface p-5" key={lesson.id}>
              <Link href={`/student/lessons/${lesson.slug}`}>
                {lesson.unitNumber}.{lesson.orderIndex} {lesson.title}
              </Link>
              <p>
                {lesson.completed} of {lesson.total} phases complete
              </p>
              <progress
                className="w-full"
                aria-label={`${lesson.title} progress`}
                value={lesson.completed}
                max={lesson.total || 1}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
