import Link from "next/link";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import { TeacherCourse } from "@/components/course/TeacherCourse";
export default async function GradebookPage() {
  const claims = await requireTeacherSessionClaims("/teacher/gradebook");
  const [data, topic11Candidates] = await Promise.all([
    fetchInternalQuery(internal.course.getTeacherData, { teacherId: claims.sub }),
    fetchInternalQuery(internal.course.getTopic11TeacherCandidates, { teacherId: claims.sub }),
  ]);
  return (
    <main className="max-w-4xl mx-auto p-6">
      <h1>Gradebook</h1>
      <Link href="/teacher/dashboard" className="underline">
        Teacher dashboard
      </Link>
      <TeacherCourse data={data} topic11Candidates={topic11Candidates} gradebook />
    </main>
  );
}
