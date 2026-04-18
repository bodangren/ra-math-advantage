import { notFound } from 'next/navigation';
import { requireStudentSessionClaims } from '@/lib/auth/server';
import { fetchInternalQuery, internal } from '@/lib/convex/server';
import { LessonRenderer, type LessonPhase } from '@/components/lesson/LessonRenderer';
import { getPhaseDisplayInfo, type PhaseType } from '@/lib/curriculum/phase-types';
import type { PhaseSection } from '@/components/lesson/PhaseRenderer';

interface PhaseProgressWithSections {
  phaseNumber: number;
  phaseId: string;
  phaseType: PhaseType;
  status: 'completed' | 'current' | 'available' | 'locked';
  startedAt: string | null;
  completedAt: string | null;
  timeSpentSeconds: number | null;
  sections: PhaseSection[];
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

export default async function StudentLessonPage({ params }: PageProps) {
  const { lessonSlug } = await params;
  const claims = await requireStudentSessionClaims('/auth/login');

  const result: LessonProgressResult | null = await fetchInternalQuery(
    internal.student.getLessonProgress,
    { userId: claims.sub, lessonIdentifier: lessonSlug },
  );

  if (!result) {
    notFound();
  }

  const phases: LessonPhase[] = result.phases.map(p => ({
    phaseId: p.phaseId,
    phaseNumber: p.phaseNumber,
    phaseType: p.phaseType,
    title: getPhaseDisplayInfo(p.phaseType).label,
    sections: p.sections,
    status: p.status,
    completed: p.status === 'completed',
  }));

  return (
    <LessonRenderer
      lessonId={lessonSlug}
      lessonTitle={result.lessonTitle}
      moduleLabel={`Unit ${result.unitNumber}`}
      lessonNumber={result.lessonNumber}
      phases={phases}
      mode="practice"
    />
  );
}
