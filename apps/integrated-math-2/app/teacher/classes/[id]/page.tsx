import Link from "next/link";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, fetchQuery, internal, api } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { assignLesson } from "../../actions";
export default async function ClassPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ cursor?: string }>;
}) {
  const { cursor } = await searchParams;
  const { id } = await params;
  const claims = await requireTeacherSessionClaims(`/teacher/classes/${id}`);
  const [classroom, curriculum] = await Promise.all([
    fetchInternalQuery(internal.classes.getClass, {
      teacherId: claims.sub as Id<"profiles">,
      classId: id as Id<"classes">,
      cursor,
    }),
    fetchQuery(api.public.getCurriculum, {}),
  ]);
  const assigned = curriculum
    .flatMap((unit) => unit.lessons)
    .filter((lesson) => classroom.assignedLessonIds.includes(lesson.id));
  const lessons = curriculum
    .flatMap((unit) => unit.lessons)
    .filter((lesson) => !classroom.assignedLessonIds.includes(lesson.id));
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/teacher/dashboard">My classes</Link>
      <h1 className="text-3xl font-display my-6">{classroom.name}</h1>
      <p>Give students this class code when they register:</p>
      <p className="font-mono my-3 select-all">
        {classroom.joinCode || "This class has no registration code."}
      </p>
      <h2 className="text-2xl mt-8 mb-4">Assign a lesson</h2>
      {lessons.length ? (
        <form action={assignLesson} className="space-y-4">
          <input type="hidden" name="classId" value={id} />
          <label htmlFor="lesson">Published lesson</label>
          <select id="lesson" name="lessonId" className="input-field w-full">
            {lessons.map((lesson) => (
              <option key={lesson.id} value={lesson.id}>
                {lesson.title}
              </option>
            ))}
          </select>
          <button className="btn-primary">Assign lesson</button>
        </form>
      ) : (
        <p>No additional published lessons are available.</p>
      )}
      <h2 className="text-2xl mt-8 mb-4">Assigned lessons</h2>
      <ul>
        {assigned.map((lesson) => (
          <li key={lesson.id}>{lesson.title}</li>
        ))}
      </ul>
      <h2 className="text-2xl mt-8 mb-4">Students</h2>
      {classroom.students.length === 0 ? (
        <p>No active students on this page.</p>
      ) : (
        <ul>
          {classroom.students.map((student) => (
            <li key={student.id}>
              <Link href={`/teacher/students/${student.id}?classId=${id}`}>{student.name}</Link>
            </li>
          ))}
        </ul>
      )}
      {classroom.nextCursor && (
        <Link href={`/teacher/classes/${id}?cursor=${encodeURIComponent(classroom.nextCursor)}`}>
          More students
        </Link>
      )}
    </div>
  );
}
