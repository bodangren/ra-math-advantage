import Image from 'next/image';
import type { PhaseType } from '@/lib/curriculum/phase-types';
import { PhaseContainer } from '@/components/textbook/PhaseContainer';
import { CalloutBox } from '@/components/textbook/CalloutBox';
import dynamic from 'next/dynamic';
import { VideoPlayer } from './VideoPlayer';
import { ActivityRenderer } from './ActivityRenderer';
import { ContentBlockErrorBoundary } from './ContentBlockErrorBoundary';

const LessonMarkdownRenderer = dynamic(() => import('./MarkdownRenderer').then(m => ({ default: m.LessonMarkdownRenderer })), {
  ssr: true,
  loading: () => <div className="animate-pulse bg-muted/50 h-24 rounded-md" />,
});

// ── Section type definitions ─────────────────────────────────────────────────

export interface TextSection {
  id: string;
  sequenceOrder: number;
  sectionType: 'text';
  content: { markdown: string };
}

export interface CalloutSection {
  id: string;
  sequenceOrder: number;
  sectionType: 'callout';
  content: { variant: 'important' | 'tip' | 'remember' | 'caution'; text: string };
}

export interface VideoSection {
  id: string;
  sequenceOrder: number;
  sectionType: 'video';
  content: { videoUrl: string; duration: number; transcript?: string; thumbnailUrl?: string };
}

export interface ActivitySection {
  id: string;
  sequenceOrder: number;
  sectionType: 'activity';
  content: { componentKey: string; activityId: string; [key: string]: unknown };
}

export interface ImageSection {
  id: string;
  sequenceOrder: number;
  sectionType: 'image';
  content: { imageUrl: string; alt: string; caption?: string };
}

export type PhaseSection =
  | TextSection
  | CalloutSection
  | VideoSection
  | ActivitySection
  | ImageSection;

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PhaseRendererProps {
  phaseType: PhaseType;
  sections: PhaseSection[];
  lessonId?: string;
  phaseNumber?: number;
  mode?: 'teaching' | 'guided' | 'practice';
  onActivitySubmit?: (activityId: string, payload: unknown) => void;
  onActivityComplete?: (activityId: string) => void;
}

// ── Component ─────────────────────────────────────────────────────────────────

export function PhaseRenderer({
  phaseType,
  sections,
  lessonId,
  phaseNumber,
  mode = 'practice',
  onActivitySubmit,
  onActivityComplete,
}: PhaseRendererProps) {
  if (sections.length === 0) {
    return (
      <PhaseContainer phaseType={phaseType}>
        <p className="text-muted-foreground text-sm py-4 text-center">No content available for this phase.</p>
      </PhaseContainer>
    );
  }

  return (
    <PhaseContainer phaseType={phaseType}>
      <div className="space-y-4">
        {sections.map(section => (
          <ContentBlockErrorBoundary key={section.id}>
            <SectionBlock
              section={section}
              lessonId={lessonId}
              phaseNumber={phaseNumber}
              mode={mode}
              onActivitySubmit={onActivitySubmit}
              onActivityComplete={onActivityComplete}
            />
          </ContentBlockErrorBoundary>
        ))}
      </div>
    </PhaseContainer>
  );
}

// ── Per-section renderer ──────────────────────────────────────────────────────

function SectionBlock({
  section,
  lessonId,
  phaseNumber,
  mode,
  onActivitySubmit,
  onActivityComplete,
}: {
  section: PhaseSection;
  lessonId?: string;
  phaseNumber?: number;
  mode: 'teaching' | 'guided' | 'practice';
  onActivitySubmit?: (activityId: string, payload: unknown) => void;
  onActivityComplete?: (activityId: string) => void;
}) {
  switch (section.sectionType) {
    case 'text':
      return <LessonMarkdownRenderer content={section.content.markdown} />;

    case 'callout':
      return (
        <CalloutBox variant={section.content.variant}>
          {section.content.text}
        </CalloutBox>
      );

    case 'video':
      return (
        <VideoPlayer
          videoUrl={section.content.videoUrl}
          duration={section.content.duration}
          transcript={section.content.transcript}
          thumbnailUrl={section.content.thumbnailUrl}
        />
      );

    case 'activity': {
      const activityId = section.content.activityId as string;
      const handleSubmit = (payload: unknown) => {
        onActivitySubmit?.(activityId, payload);
      };
      const handleComplete = () => {
        onActivityComplete?.(activityId);
      };
      return (
        <ActivityRenderer
          componentKey={section.content.componentKey}
          activityId={activityId}
          lessonId={lessonId}
          phaseNumber={phaseNumber}
          mode={mode}
          onSubmit={handleSubmit}
          onComplete={handleComplete}
        />
      );
    }

    case 'image':
      return (
        <figure className="my-4">
          <div className="relative w-full">
            <Image
              src={section.content.imageUrl}
              alt={section.content.alt}
              width={800}
              height={600}
              className="rounded-lg w-full h-auto"
            />
          </div>
          {section.content.caption && (
            <figcaption className="text-sm text-muted-foreground text-center mt-2">
              {section.content.caption}
            </figcaption>
          )}
        </figure>
      );

    default: {
      const _exhaustive: never = section;
      console.error('Unknown section type:', _exhaustive);
      return null;
    }
  }
}
