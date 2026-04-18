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
    <div className="min-h-screen bg-background">
      <div className="hero-gradient relative overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-6 py-20 lg:py-32">
        <div className="max-w-3xl space-y-6">
          <span className="inline-flex items-center gap-2 font-mono-num text-xs font-medium tracking-widest text-white/70 uppercase">
            <span className="w-8 h-[1px] bg-white/40"></span>
            Course Overview
          </span>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-display font-bold tracking-tight leading-[0.95] text-white">
            Curriculum
          </h1>
          <p className="text-lg md:text-xl text-white/70 leading-relaxed">
            {units.length} modules across a full-year course covering algebra, functions,
            statistics, and trigonometry.
          </p>
        </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16 lg:py-24">
        <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
          {units.map((unit) => (
            <div key={unit.unitNumber} className="group relative p-8 bg-white rounded-lg border border-border hover:border-primary/50 transition-all duration-300">
              <div className="absolute top-6 right-6 font-mono-num text-6xl font-bold text-primary/10 group-hover:text-primary/20 transition-colors">
                {String(unit.unitNumber).padStart(2, '0')}
              </div>
              <div className="relative space-y-4">
                <div className="flex items-center gap-3">
                  <span className="font-mono-num text-sm font-semibold text-primary">
                    Module {unit.unitNumber}
                  </span>
                  <span className="w-8 h-[1px] bg-border" />
                </div>
                <h2 className="font-display text-2xl font-semibold text-foreground">
                  {unit.title}
                </h2>
                {unit.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {unit.description}
                </p>
                )}
                {unit.lessons.length > 0 && (
                  <div className="pt-4 border-t border-border">
                    <p className="font-mono-num text-xs text-muted-foreground uppercase tracking-wider mb-3">
                      {unit.lessons.length} lesson{unit.lessons.length !== 1 ? 's' : ''}
                    </p>
                    <ul className="space-y-2">
                      {unit.lessons.slice(0, 4).map((lesson) => (
                        <li key={lesson.id} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <span className="font-mono-num text-xs text-primary/60 w-10">
                            {unit.unitNumber}.{lesson.orderIndex}
                          </span>
                          <span className="text-foreground/80 group-hover:text-foreground transition-colors">
                            {lesson.title}
                          </span>
                        </li>
                      ))}
                      {unit.lessons.length > 4 && (
                        <li className="text-sm text-muted-foreground italic">
                          +{unit.lessons.length - 4} more lessons
                        </li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-border">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
            <div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                Ready to begin?
              </h3>
              <p className="text-muted-foreground">
                Sign in to access all lessons, activities, and assessments.
              </p>
            </div>
            <Link
              href="/auth/login"
              className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-medium rounded-sm transition-all hover:bg-primary/90 hover:translate-x-1 whitespace-nowrap"
            >
              Sign In
              <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
