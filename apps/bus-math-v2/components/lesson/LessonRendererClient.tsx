'use client';

import { LessonRendererErrorBoundary } from './LessonRendererErrorBoundary';
import { LessonRenderer } from '@/components/student/LessonRenderer';
import type { DashboardLessonActionLink } from '@/lib/student/dashboard-presentation';
import type { ContentBlock, LessonMetadata, PhaseMetadata } from '@/types/curriculum';

interface Phase {
  id: string;
  phaseNumber: number;
  title: string;
  contentBlocks?: ContentBlock[];
  estimatedMinutes: number | null;
  metadata?: PhaseMetadata;
}

interface Lesson {
  id: string;
  unitNumber: number;
  title: string;
  slug: string;
  description: string | null;
  learningObjectives: string[] | null;
  orderIndex: number;
  metadata: LessonMetadata | null;
}

interface LessonRendererClientProps {
  lesson: Lesson;
  phases: Phase[];
  currentPhaseNumber: number;
  lessonSlug: string;
  isLessonComplete?: boolean;
  recommendedLesson?: DashboardLessonActionLink | null;
}


/**
 * Client wrapper that renders the lesson inside an error boundary.
 *
 * @param props - Lesson data, phases, and navigation state
 * @returns The lesson renderer wrapped in an error boundary
 */
export function LessonRendererClient(props: LessonRendererClientProps) {
  return (
    <LessonRendererErrorBoundary>
      <LessonRenderer {...props} />
    </LessonRendererErrorBoundary>
  );
}