import Link from "next/link";
import { notFound } from "next/navigation";
import { requireStudentSessionClaims } from "@/lib/auth/server";
import { fetchInternalQuery, internal } from "@/lib/convex/server";
import type { Id } from "@/convex/_generated/dataModel";
import { LearningSession } from "@/components/lesson/LearningSession";
export default async function LessonPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const claims = await requireStudentSessionClaims(`/student/lessons/${slug}`);
  const lesson = await fetchInternalQuery(internal.learning.getLesson, {
    userId: claims.sub as Id<"profiles">,
    slug,
  });
  if (!lesson) notFound();
  const match = /^module-(\d+)-lesson-(\d+)$/.exec(slug);
  const worksheet = match
    ? `/curriculum/worksheets/Int2_${match[1].padStart(2, "0")}${match[2].padStart(2, "0")}_practice.pdf`
    : null;
  return (
    <article className="max-w-4xl mx-auto px-6 py-12">
      <Link href="/student/dashboard">My lessons</Link>
      <h1 className="text-3xl font-display my-6">{lesson.title}</h1>
      {worksheet && (
        <p className="mb-6">
          <a href={worksheet} target="_blank" rel="noreferrer">
            Open the original worksheet and figures (PDF)
          </a>
        </p>
      )}
      <LearningSession lesson={lesson} />
    </article>
  );
}
