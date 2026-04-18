import { notFound } from 'next/navigation';
import { requireTeacherSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { LessonRenderer, type LessonPhase } from '@/components/lesson/LessonRenderer';
import { getPhaseDisplayInfo, type PhaseType } from '@/lib/curriculum/phase-types';
import type { PhaseSection } from '@/components/lesson/PhaseRenderer';
import type { Id } from '@/convex/_generated/dataModel';

interface PhaseProgressWithSections {
  phaseNumber: number;
  phaseId: string;
  phaseType: PhaseType;
  status: 'completed' | 'current' | 'available' | 'locked' | 'skipped';
  title: string;
  sections: PhaseSection[];
  completed: boolean;
}

interface LessonProgressResult {
  lessonTitle: string;
  unitNumber: number;
  lessonNumber: number;
  phases: PhaseProgressWithSections[];
}

interface PageProps {
  params: Promise<{ lessonSlug: string }>;
}

export default async function TeacherLessonPreviewPage({ params }: PageProps) {
  const { lessonSlug } = await params;
  const claims = await requireTeacherSessionClaims('/auth/login');

  const result: LessonProgressResult | null = await fetchInternalQuery(
    internal.teacher.getTeacherLessonPreview,
    { lessonIdentifier: lessonSlug, userId: claims.sub as Id<'profiles'> },
  );

  if (!result) {
    notFound();
  }

  const phases: LessonPhase[] = result.phases.map(p => ({
    phaseId: p.phaseId,
    phaseNumber: p.phaseNumber,
    phaseType: p.phaseType,
    title: p.title || getPhaseDisplayInfo(p.phaseType).label,
    sections: p.sections,
    status: 'available',
    completed: false,
  }));

  return (
    <LessonRenderer
      lessonId={lessonSlug}
      lessonTitle={result.lessonTitle}
      moduleLabel={`Unit ${result.unitNumber}`}
      lessonNumber={result.lessonNumber}
      phases={phases}
      mode="teaching"
      showTeacherPreviewBadge
    />
  );
}
