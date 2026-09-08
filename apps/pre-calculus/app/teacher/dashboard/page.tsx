import Link from "next/link";
import { Topic11ExposureForm } from "@/components/course/Topic11ExposureForm";
import { requireTeacherSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";

export default async function TeacherDashboard() {
  const claims = await requireTeacherSessionClaims("/teacher/dashboard");
  const candidates = await fetchInternalQuery(internal.course.getTopic11TeacherCandidates, { teacherId: claims.sub });
  return (
    <main className="max-w-content mx-auto px-6 py-16">
      <h1 className="text-primary-text mb-4" style={{ fontSize: "32px", fontWeight: 510 }}>Teacher Dashboard</h1>
      <section aria-labelledby="topic11-heading" className="my-8">
        <h2 id="topic11-heading">Topic 1.1 classroom introductions</h2>
        {candidates.length === 0 ? <p>No Topic 1.1 classroom introductions are waiting for confirmation.</p> : candidates.map((candidate: { learnerId: string; learnerName: string; submissionId: string; acknowledgedAt: number; lessonLabel: string; classChoices: { classId: string; className: string }[] }) => (
          <Topic11ExposureForm key={candidate.submissionId} studentId={candidate.learnerId} studentName={candidate.learnerName} submissionId={candidate.submissionId} lessonTitle={candidate.lessonLabel} submittedAt={candidate.acknowledgedAt} classes={candidate.classChoices.map((classroom) => ({ id: classroom.classId, name: classroom.className }))} />
        ))}
      </section>
      <div className="flex gap-4">
        <Link href="/curriculum" className="btn-secondary">View Curriculum</Link>
        <Link href="/" className="btn-primary">Back to Home</Link>
      </div>
    </main>
  );
}
