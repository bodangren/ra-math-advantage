import Link from "next/link";

import type { SavedPrecalculusPractice } from "@/components/student/PrecalculusMasteryAdvantagePilot";
import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";

export default async function StudentDashboard() {
  const claims = await requireStudentSessionClaims("/student/dashboard");
  const [lessons, saved] = await Promise.all([
    fetchInternalQuery(internal.course.getLessons, {
      learnerId: claims.sub,
    }) as Promise<Array<{ id: string; topic: string; title: string }>>,
    fetchInternalQuery(internal.activities.getSavedTopic11Practice, {
      learnerId: claims.sub,
    }) as Promise<{
      guidedPractice: SavedPrecalculusPractice | null;
      independentPractice: SavedPrecalculusPractice | null;
    }>,
  ]);
  const savedRows = [saved.guidedPractice, saved.independentPractice].filter(
    (item): item is SavedPrecalculusPractice => item !== null,
  );

  return (
    <div className="max-w-content mx-auto px-6 py-16">
      <div className="py-10">
        <div
          className="inline-flex items-center justify-center w-16 h-16 rounded-panel mb-6"
          style={{ backgroundColor: "rgba(94, 106, 210, 0.15)" }}
        >
          <span className="text-3xl" aria-hidden="true">📚</span>
        </div>
        <h1
          className="text-primary-text mb-4"
          style={{ fontSize: "32px", fontWeight: 510 }}
        >
          Student Dashboard
        </h1>
        <p className="text-secondary-text text-lg mb-8 max-w-md mx-auto">
          Open a lesson. Review your saved practice. Start a new attempt when
          you are ready.
        </p>
        <h2>Lessons</h2>
        {lessons.length === 0 ? (
          <p>No lessons are published.</p>
        ) : (
          <ul>
            {lessons.map((lesson) => (
              <li key={lesson.id}>
                <Link className="underline" href={`/student/lessons/${lesson.topic}`}>
                  {lesson.topic} {lesson.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <h2 className="mt-8">Saved Topic 1.1 practice</h2>
        {savedRows.length === 0 ? (
          <p>No saved practice is available.</p>
        ) : (
          savedRows.map((item) => (
            <article className="mt-3 rounded border border-subtle p-3" key={item.submissionId}>
              <h3>{item.mode === "guided_practice" ? "Guided practice" : "Independent practice"}</h3>
              <p>Attempt {item.attemptOrdinal}</p>
              <p>Saved score: {item.score}/{item.maxScore}</p>
              <p>{item.feedback}</p>
              <p>
                {item.deliveryState === "delivered"
                  ? "Evidence delivered."
                  : item.deliveryState === "needs_delivery"
                    ? "Open Topic 1.1 to retry evidence delivery."
                    : "The saved evidence receipt is invalid."}
              </p>
              <Link className="underline" href="/student/lessons/1.1">
                Open Topic 1.1
              </Link>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
