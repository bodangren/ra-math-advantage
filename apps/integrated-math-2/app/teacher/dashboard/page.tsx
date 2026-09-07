import Link from "next/link";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { createClass } from "../actions";
export default async function TeacherDashboard() {
  const claims = await requireTeacherSessionClaims("/teacher/dashboard");
  const data = await fetchInternalQuery(
    internal.teacher.getTeacherDashboardData,
    { teacherId: claims.sub as Id<"profiles"> },
  );
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-3xl font-display mb-6">My classes</h1>
      <form action={createClass} className="card-surface p-6 space-y-4 mb-8">
        <label htmlFor="class-name">New class name</label>
        <input
          id="class-name"
          name="name"
          required
          maxLength={100}
          className="input-field w-full"
        />
        <button className="btn-primary">Create class</button>
      </form>
      {data.classes.length === 0 ? (
        <p>Create a class to enroll students.</p>
      ) : (
        <ul className="space-y-4">
          {data.classes.map((classroom) => (
            <li key={classroom.id} className="card-surface p-5">
              <Link href={`/teacher/classes/${classroom.id}`}>
                {classroom.name}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
