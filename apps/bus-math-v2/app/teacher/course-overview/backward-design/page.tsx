import { requireTeacherSessionClaims } from "@/lib/auth/server";
export default async function Page() {
  await requireTeacherSessionClaims("/teacher/course-overview/backward-design");
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-3xl font-bold">Backward design</h1>
      <p className="mt-6">
        Define what a student must be able to do. Select the evidence that will demonstrate that
        skill. Plan instruction and practice that prepare the student to produce that evidence. Use
        the same criteria for feedback and final assessment.
      </p>
    </main>
  );
}
