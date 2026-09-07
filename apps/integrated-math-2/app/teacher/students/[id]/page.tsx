import Link from "next/link";
import { notFound } from "next/navigation";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
export default async function StudentEvidence({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ classId?: string; cursor?: string }>;
}) {
  const { id } = await params;
  const query = await searchParams;
  if (!query.classId) notFound();
  const claims = await requireTeacherSessionClaims("/teacher/dashboard");
  const evidence = await fetchInternalQuery(
    internal.teacher.getStudentEvidence,
    {
      teacherId: claims.sub as Id<"profiles">,
      classId: query.classId as Id<"classes">,
      studentId: id as Id<"profiles">,
      cursor: query.cursor,
    },
  );
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href={`/teacher/classes/${query.classId}`}>Class</Link>
      <h1 className="text-3xl font-display my-6">
        {evidence.name}: saved answers
      </h1>
      {evidence.submissions.length === 0 ? (
        <p>No saved answers on this page.</p>
      ) : (
        <ul className="space-y-6">
          {evidence.submissions.map((s) => (
            <li key={s.id} className="card-surface p-5">
              <h2 className="text-xl">{s.activity}</h2>
              <p>Answer: {s.answer}</p>
              <p>
                Score: {s.score} / {s.maxScore}
              </p>
              <p>{s.feedback}</p>
              <time dateTime={new Date(s.submittedAt).toISOString()}>
                {new Date(s.submittedAt).toISOString()}
              </time>
            </li>
          ))}
        </ul>
      )}
      {evidence.nextCursor && (
        <Link
          href={`/teacher/students/${id}?classId=${query.classId}&cursor=${encodeURIComponent(evidence.nextCursor)}`}
        >
          Older answers
        </Link>
      )}
    </div>
  );
}
