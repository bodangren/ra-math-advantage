import Link from "next/link";
import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { joinClass } from "./actions";
export default async function StudentDashboard({ searchParams }: { searchParams: Promise<{ join?: string }> }) {
  const { join } = await searchParams;
  const claims = await requireStudentSessionClaims("/student/dashboard");
  const lessons = await fetchInternalQuery(internal.student.getDashboardData, {
    userId: claims.sub as Id<"profiles">,
  });
  const next = lessons.find((lesson) => lesson.completed < lesson.total);
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-display mb-6">My lessons</h1>
      <section className="card-surface p-5 mb-6" aria-labelledby="join-class-heading">
        <h2 id="join-class-heading" className="text-xl mb-3">Join a class</h2>
        <form action={joinClass} className="flex flex-wrap items-end gap-3">
          <div><label htmlFor="class-code" className="block">Class code</label>
          <input id="class-code" name="classCode" required minLength={12} maxLength={80} autoComplete="off" className="border rounded px-3 py-2" /></div>
          <button type="submit" className="btn-primary">Join class</button>
        </form>
        {join === "joined" && <p role="status">You are enrolled in the class.</p>}
        {join === "invalid_class" && <p role="alert">This code is not valid for your account. Ask your teacher for the class code.</p>}
        {join === "enrollment_closed" && <p role="alert">Your enrollment is closed. Contact your teacher.</p>}
        {join === "unavailable" && <p role="alert">Enrollment is unavailable. Try again.</p>}
      </section>
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
