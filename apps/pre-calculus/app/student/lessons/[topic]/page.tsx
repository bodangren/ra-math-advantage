import Link from "next/link";
import { notFound } from "next/navigation";
import { LessonWrittenResponse } from "@/components/course/LessonWrittenResponse";
import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import { PrecalculusTopic11DailyCurriculumPilot } from "@/components/student/PrecalculusTopic11DailyCurriculumPilot";
import { PrecalculusMasteryAdvantagePilot } from "@/components/student/PrecalculusMasteryAdvantagePilot";
import { LessonResponse } from "@/components/course/LessonResponse";
import type { IntervalClassificationProps } from "@math-platform/math-content/schemas";

type ResponseRow = {
  _id: string;
  response: string;
  score?: number;
  maxScore?: number;
  feedback?: string;
};
type Phase = {
  _id: string;
  title: string;
  sections: {
    _id: string;
    sectionType: string;
    content: { markdown?: string; activityId?: string; componentKey?: string };
  }[];
  responses: ResponseRow[];
};
export default async function LessonPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const claims = await requireStudentSessionClaims(`/student/lessons/${topic}`);
  if (!/^[1-4]\.\d{1,2}$/.test(topic)) notFound();
  const [unit, number] = topic.split(".").map(Number);
  const selectedTopic = unit === 1 && number === 1;
  const [lesson, workedSource, deliveryState, approvedPilot] = await Promise.all([
    fetchInternalQuery(internal.course.getLesson, {
      learnerId: claims.sub,
      unit,
      topic: number,
    }) as Promise<{ title: string; phases: Phase[] } | null>,
    selectedTopic
      ? fetchInternalQuery(internal.activities.getApprovedTopic11WorkedSource, {})
      : Promise.resolve(null),
    selectedTopic
      ? fetchInternalQuery(internal.activities.getTopic11LearnerDeliveryState, {
          learnerId: claims.sub,
        })
      : Promise.resolve(null),
    selectedTopic
      ? fetchInternalQuery(internal.activities.getApprovedPrecalculusPilot, {})
      : Promise.resolve([]),
  ]);
  if (!lesson) notFound();
  return (
    <main className="max-w-4xl mx-auto p-6">
      <Link href="/student/lessons" className="underline">
        All lessons
      </Link>
      <h1 className="mt-6">
        {topic} {lesson.title}
      </h1>
      {unit === 4 && <p>Unit 4 is not assessed on the AP Exam.</p>}
      <nav aria-label="Lesson phases" className="flex flex-wrap gap-4 my-6">
        {lesson.phases.map((phase) => (
          <a className="underline" key={phase._id} href={`#phase-${phase._id}`}>
            {phase.title}
          </a>
        ))}
      </nav>
      {lesson.phases.map((phase) => {
        const selectedWorkedOnly = Boolean(
          selectedTopic &&
          workedSource &&
          phase.sections.length === 1 &&
          phase.sections[0]?.sectionType === "activity" &&
          phase.sections[0]?.content.activityId === workedSource?.activityId &&
          phase.sections[0]?.content.componentKey === workedSource.componentKey,
        );
        return (
          <section
            key={phase._id}
            id={`phase-${phase._id}`}
            className="rounded-panel border border-subtle p-6 my-6"
          >
            <h2>{phase.title}</h2>
            {phase.sections.map((section) =>
              section.sectionType === "text" && section.content.markdown ? (
                <LessonWrittenResponse key={section._id} content={section.content.markdown} />
              ) : section.sectionType === "activity" &&
                section.content.componentKey === "precalculus-topic-1-1-daily-curriculum" ? (
                deliveryState === "needs_acknowledgement" &&
                workedSource &&
                section.content.activityId === workedSource.activityId &&
                section.content.componentKey === workedSource.componentKey ? (
                  <PrecalculusTopic11DailyCurriculumPilot
                    key={section._id}
                    stableActivityId={workedSource.stableActivityId}
                    activityProps={workedSource.props as IntervalClassificationProps}
                  />
                ) : deliveryState === "awaiting_teacher_confirmation" ? (
                  <p key={section._id} role="status">
                    Your acknowledgement is saved. Wait for your teacher to confirm the lesson
                    before you start practice.
                    {/* oxlint-disable-next-line next/no-html-link-for-pages -- Request current teacher state from the server on this same lesson URL. */}
                    <a className="underline" href="/student/lessons/1.1">
                      Check lesson status
                    </a>
                  </p>
                ) : deliveryState === "ready_for_practice" ? null : (
                  <p key={section._id}>This worked example is not available.</p>
                )
              ) : null,
            )}
            {!selectedWorkedOnly && <LessonResponse phaseId={phase._id} />}
            {phase.responses.length > 0 && (
              <details className="mt-4">
                <summary>Your submitted work ({phase.responses.length})</summary>
                {phase.responses.map((response) => (
                  <article className="border-t border-subtle mt-3 pt-3" key={response._id}>
                    <p className="whitespace-pre-wrap">{response.response}</p>
                    <p>
                      {response.score === undefined
                        ? "Awaiting teacher review"
                        : `Score: ${response.score}/${response.maxScore}`}
                    </p>
                    <p>{response.feedback}</p>
                  </article>
                ))}
              </details>
            )}
          </section>
        );
      })}
      {deliveryState === "ready_for_practice" &&
        approvedPilot
          .filter((item: { mode: string }) => item.mode !== "worked_example")
          .map(
            (item: {
              mode: "guided_practice" | "independent_practice";
              stableActivityId: string;
              props: IntervalClassificationProps;
            }) => (
              <PrecalculusMasteryAdvantagePilot
                key={item.mode}
                mode={item.mode}
                seed={item.mode === "guided_practice" ? 0 : 2}
                stableActivityId={item.stableActivityId}
                activityProps={item.props}
              />
            ),
          )}
    </main>
  );
}
