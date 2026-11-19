import Link from "next/link";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
export default async function Gradebook({
  searchParams,
}: {
  searchParams: Promise<{ classId?: string; unit?: string; cursor?: string }>;
}) {
  const query = await searchParams;
  const claims = await requireTeacherSessionClaims("/teacher/gradebook");
  const teacherId = claims.sub as Id<"profiles">;
  const { classes } = await fetchInternalQuery(internal.teacher.getTeacherDashboardData, {
    teacherId,
  });
  const classId = query.classId ?? classes[0]?.id;
  const unit = Number(query.unit ?? 1);
  const book = classId
    ? await fetchInternalQuery(internal.teacher.getGradebook, {
        teacherId,
        classId: classId as Id<"classes">,
        unitNumber: unit,
        cursor: query.cursor,
      })
    : null;
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-display mb-6">Gradebook</h1>
      {!book ? (
        <p>Create a class first.</p>
      ) : (
        <>
          <form className="flex flex-wrap gap-4 mb-8">
            <label>
              Class{" "}
              <select name="classId" defaultValue={classId} className="input-field">
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Unit{" "}
              <select name="unit" defaultValue={unit} className="input-field">
                {Array.from({ length: 13 }, (_, i) => (
                  <option key={i + 1}>{i + 1}</option>
                ))}
              </select>
            </label>
            <button className="btn-primary">Show progress</button>
          </form>
          <p className="mb-4">
            Cells show completed phases and total phases. Open a student name to review saved
            answers.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="text-xl mb-4">
                {book.className} — Unit {unit}
              </caption>
              <thead>
                <tr>
                  <th scope="col">Student</th>
                  {book.lessons.map((l) => (
                    <th scope="col" key={l.id}>
                      {l.title}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {book.students.map((s) => (
                  <tr key={s.id}>
                    <th scope="row">
                      <Link href={`/teacher/students/${s.id}?classId=${classId}`}>{s.name}</Link>
                    </th>
                    {s.completed.map((count, i) => (
                      <td key={book.lessons[i].id}>
                        {count} / {book.lessons[i].total}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {book.nextCursor && (
            <Link
              href={`/teacher/gradebook?classId=${classId}&unit=${unit}&cursor=${encodeURIComponent(book.nextCursor)}`}
            >
              Next students
            </Link>
          )}
        </>
      )}
    </div>
  );
}
