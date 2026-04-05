import Link from 'next/link';
import { fetchQuery, api } from '@/lib/convex/server';

interface CurriculumLesson {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  orderIndex: number;
}

interface CurriculumUnit {
  unitNumber: number;
  title: string;
  description: string;
  objectives: string[];
  lessons: CurriculumLesson[];
}

export default async function CurriculumPage() {
  const units: CurriculumUnit[] = await fetchQuery(api.public.getCurriculum, {});

  return (
    <div className="max-w-4xl mx-auto space-y-12 py-8">
      <div className="space-y-3">
        <span className="section-label">Course Overview</span>
        <h1 className="text-4xl font-display font-bold text-foreground">
          Integrated Math 3 Curriculum
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {units.length} modules across a full-year course covering algebra, functions,
          statistics, and trigonometry.
        </p>
      </div>

      <div className="space-y-8">
        {units.map((unit) => (
          <div key={unit.unitNumber} className="card-workbook p-6 space-y-4">
            <div className="flex items-start gap-4">
              <span className="flex-shrink-0 inline-flex items-center justify-center w-9 h-9 rounded-full bg-primary text-primary-foreground font-mono-num text-sm font-bold">
                {unit.unitNumber}
              </span>
              <div className="space-y-1 flex-1">
                <h2 className="font-display text-xl font-semibold text-card-foreground">
                  {unit.title}
                </h2>
                {unit.description && (
                  <p className="text-sm text-muted-foreground">{unit.description}</p>
                )}
              </div>
            </div>

            {unit.lessons.length > 0 && (
              <div className="ml-13 pl-1 border-l-2 border-border space-y-1">
                {unit.lessons.map((lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center gap-2 py-1 pl-3 text-sm text-muted-foreground"
                  >
                    <span className="font-mono-num text-xs text-primary/60">
                      {unit.unitNumber}.{lesson.orderIndex}
                    </span>
                    <span className="text-foreground/80">{lesson.title}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="text-center py-6">
        <Link
          href="/auth/login"
          className="inline-flex items-center gap-2 rounded-md px-6 py-3 text-sm font-medium text-primary-foreground bg-primary hover:opacity-90 transition-opacity"
        >
          Sign in to start learning →
        </Link>
      </div>
    </div>
  );
}
