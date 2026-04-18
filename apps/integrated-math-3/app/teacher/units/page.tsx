import Link from 'next/link';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import type { Id } from '@/convex/_generated/dataModel';

interface StandardCoverage {
  standardId: string;
  standardCode: string;
  standardDescription: string;
  studentFriendlyDescription: string | null;
  category: string | null;
  lessons: Array<{
    lessonId: string;
    lessonTitle: string;
    lessonSlug: string;
    lessonOrderIndex: number;
    isPrimary: boolean;
  }>;
}

interface LessonInfo {
  id: string;
  title: string;
  slug: string;
  unitNumber: number;
  orderIndex: number;
  learningObjectives: string[];
}

interface StandardsCoverageResult {
  standards: StandardCoverage[];
  lessons: LessonInfo[];
}

export default async function TeacherUnitsPage() {
  const claims = await requireTeacherSessionClaims('/auth/login');

  const coverage: StandardsCoverageResult = await fetchInternalQuery(
    internal.teacher.getStandardsCoverage,
    { unitNumber: 1, userId: claims.sub as Id<'profiles'> },
  );

  return (
    <div className="max-w-5xl mx-auto space-y-8 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-display font-bold text-foreground">Units Overview</h1>
        <Link
          href="/teacher/gradebook"
          className="text-sm font-medium text-primary hover:underline"
        >
          View Gradebook →
        </Link>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Standards Coverage Map</h2>
        <div className="card-workbook p-5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 pr-4 font-medium text-muted-foreground">Standard</th>
                {coverage.lessons.map(lesson => (
                  <th key={lesson.id} className="text-center py-2 px-2 font-medium text-muted-foreground">
                    <div className="writing-mode-vertical" style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}>
                      {lesson.orderIndex}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {coverage.standards.map(standard => (
                <tr key={standard.standardId} className="border-b last:border-b-0">
                  <td className="py-2 pr-4">
                    <div className="font-medium text-foreground">{standard.standardCode}</div>
                    <div className="text-xs text-muted-foreground">{standard.studentFriendlyDescription ?? standard.standardDescription}</div>
                  </td>
                  {coverage.lessons.map(lesson => {
                    const lessonCoverage = standard.lessons.find(l => l.lessonId === lesson.id);
                    return (
                      <td key={lesson.id} className="text-center py-2 px-2">
                        {lessonCoverage ? (
                          lessonCoverage.isPrimary ? (
                            <span className="inline-block w-4 h-4 rounded-full bg-green-500" title="Primary standard" />
                          ) : (
                            <span className="inline-block w-4 h-4 rounded-full bg-yellow-400" title="Secondary standard" />
                          )
                        ) : (
                          <span className="inline-block w-4 h-4 rounded-full bg-muted" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500" />
            Primary standard
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-yellow-400" />
            Secondary standard
          </span>
          <span className="flex items-center gap-1">
            <span className="inline-block w-3 h-3 rounded-full bg-muted" />
            Not covered
          </span>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">Curriculum Units</h2>
        <div className="space-y-4">
          {coverage.lessons.length === 0 ? (
            <p className="text-muted-foreground">No lessons found for Module 1.</p>
          ) : (
            coverage.lessons.map(lesson => (
              <div key={lesson.id} className="card-workbook p-5 space-y-3">
                <div className="flex items-start gap-4">
                  <span className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground font-mono-num text-sm font-bold flex items-center justify-center">
                    {lesson.orderIndex}
                  </span>
                  <div className="flex-1 space-y-1">
                    <h3 className="font-display text-lg font-semibold text-card-foreground">
                      {lesson.title}
                    </h3>
                    <Link
                      href={`/teacher/lesson/${lesson.slug}`}
                      className="text-xs font-medium text-primary hover:underline"
                    >
                      Preview Lesson →
                    </Link>
                  </div>
                  <Link
                    href={`/teacher/gradebook?unit=1`}
                    className="text-xs font-medium text-primary hover:underline flex-shrink-0"
                  >
                    View Progress
                  </Link>
                </div>
                {lesson.learningObjectives.length > 0 && (
                  <div className="ml-12">
                    <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1">Learning Objectives</h4>
                    <ul className="list-disc list-inside text-sm text-foreground space-y-0.5">
                      {lesson.learningObjectives.map((obj, idx) => (
                        <li key={idx}>{obj}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
}
