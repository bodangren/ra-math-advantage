import Image from 'next/image';
import type { PhaseType } from '@math-platform/activity-runtime/phase-types';
import { PhaseContainer } from '@/components/textbook/PhaseContainer';
import { CalloutBox } from '@/components/textbook/CalloutBox';
import dynamic from 'next/dynamic';
import { VideoPlayer } from './VideoPlayer';
import { ActivityRenderer } from './ActivityRenderer';
import { checkQuadraticFormulaDiscriminant } from '@/lib/activities/submission';
import type { QuadraticFormulaAttempt, QuadraticFormulaPendingAttempt } from '@/lib/activities/submission';
import type { Lesson16QuizReceipt } from '@/lib/activities/submission';
export type QuadraticFormulaAttemptView = QuadraticFormulaAttempt | (Omit<QuadraticFormulaPendingAttempt, 'state'> & { state: 'saved-awaiting-details'; answers: Record<string, unknown>; score?: number; maxScore?: number; submissionId: string });
import { ContentBlockErrorBoundary } from './ContentBlockErrorBoundary';
import { IM3_TEACHER_LED_ACTIVITY_ID } from '@/lib/practice/learning-evidence-pilot';

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

const IM3_QF_NODE = 'math.im3.skill.1.6.use-the-quadratic-formula-to-solve-equations';
const IM3_QF_GUIDED_ACTIVITY_ID = `${IM3_QF_NODE}.guided_practice`;
const IM3_QF_INDEPENDENT_ACTIVITY_ID = `${IM3_QF_NODE}.independent_practice`;

export function getQuadraticFormulaSectionMode(
  content: ActivitySection['content'],
): 'guided' | 'practice' | 'invalid' | null {
  const hasIdentitySignal = content.componentKey === 'quadratic-formula'
    || content.masteryNodeId === IM3_QF_NODE
    || content.stableActivityId === IM3_QF_GUIDED_ACTIVITY_ID
    || content.stableActivityId === IM3_QF_INDEPENDENT_ACTIVITY_ID;
  if (!hasIdentitySignal) return null;
  const guided = content.componentKey === 'quadratic-formula'
    && content.masteryNodeId === IM3_QF_NODE
    && content.stableActivityId === IM3_QF_GUIDED_ACTIVITY_ID
    && content.learningEvidenceMode === 'guided_practice'
    && content.srsEligible === false
    && (content.activityProps as { presentationMode?: unknown } | undefined)?.presentationMode === 'guided';
  if (guided) return 'guided';
  const independent = content.componentKey === 'quadratic-formula'
    && content.masteryNodeId === IM3_QF_NODE
    && content.stableActivityId === IM3_QF_INDEPENDENT_ACTIVITY_ID
    && content.learningEvidenceMode === 'independent_practice'
    && content.srsEligible === false
    && (content.activityProps as { presentationMode?: unknown } | undefined)?.presentationMode === 'independent';
  return independent ? 'practice' : 'invalid';
}

// ── Props ─────────────────────────────────────────────────────────────────────

export interface PhaseRendererProps {
  phaseType: PhaseType;
  sections: PhaseSection[];
  lessonId?: string;
  phaseNumber?: number;
  mode?: 'teaching' | 'guided' | 'practice';
  onActivitySubmit?: (activityId: string, payload: unknown) => unknown | Promise<unknown>;
  onActivityComplete?: (activityId: string) => void;
  quadraticFormulaAttempt?: QuadraticFormulaAttemptView;
  lesson16QuizReceipt?: Lesson16QuizReceipt;
  lesson16QuizPendingAnswers?: Lesson16QuizReceipt['answers'];
}

// ── Component ─────────────────────────────────────────────────────────────────

/**
 * Renders a phase's content sections (text, callout, video, activity, image) inside a PhaseContainer.
 *
 * @param {PhaseRendererProps} props - Phase renderer configuration.
 * @returns {JSX.Element} A rendered phase with all its sections.
 */
export function PhaseRenderer({
  phaseType,
  sections,
  lessonId,
  phaseNumber,
  mode = 'practice',
  onActivitySubmit,
  onActivityComplete,
  quadraticFormulaAttempt,
  lesson16QuizReceipt,
  lesson16QuizPendingAnswers,
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
              quadraticFormulaAttempt={quadraticFormulaAttempt}
              lesson16QuizReceipt={lesson16QuizReceipt}
              lesson16QuizPendingAnswers={lesson16QuizPendingAnswers}
            />
          </ContentBlockErrorBoundary>
        ))}
      </div>
    </PhaseContainer>
  );
}

// ── Per-section renderer ──────────────────────────────────────────────────────

/**
 * Renders the appropriate content block for a single section type.
 *
 * @param {{ section: PhaseSection; lessonId?: string; phaseNumber?: number; mode: 'teaching' | 'guided' | 'practice'; onActivitySubmit?: (activityId: string, payload: unknown) => void | Promise<void>; onActivityComplete?: (activityId: string) => void; }} props - Section block configuration.
 * @returns {JSX.Element} A rendered section block.
 */
function SectionBlock({
  section,
  lessonId,
  phaseNumber,
  mode,
  onActivitySubmit,
  onActivityComplete,
  quadraticFormulaAttempt,
  lesson16QuizReceipt,
  lesson16QuizPendingAnswers,
}: {
  section: PhaseSection;
  lessonId?: string;
  phaseNumber?: number;
  mode: 'teaching' | 'guided' | 'practice';
  onActivitySubmit?: (activityId: string, payload: unknown) => unknown | Promise<unknown>;
  onActivityComplete?: (activityId: string) => void;
  quadraticFormulaAttempt?: PhaseRendererProps['quadraticFormulaAttempt'];
  lesson16QuizReceipt?: Lesson16QuizReceipt;
  lesson16QuizPendingAnswers?: Lesson16QuizReceipt['answers'];
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
      const quadraticFormulaMode = getQuadraticFormulaSectionMode(section.content);
      const handleSubmit = (payload: unknown) => {
        return onActivitySubmit?.(activityId, payload);
      };
      const handleComplete = () => {
        onActivityComplete?.(activityId);
      };
      if (quadraticFormulaMode === 'invalid') return <p role="alert">This activity is unavailable.</p>;
      if (quadraticFormulaMode && quadraticFormulaAttempt?.state !== 'pending') {
        if (!quadraticFormulaAttempt) return <p role="status">Loading activity…</p>;
        if (quadraticFormulaAttempt.state === 'unavailable') return <p role="alert">This activity is unavailable. Try again.</p>;
        if (quadraticFormulaAttempt.state === 'no_attempt') return <p>Start this activity when you are ready.</p>;
        if (quadraticFormulaAttempt.state === 'exhausted') return <p>All attempts are complete.</p>;
        const result = quadraticFormulaAttempt;
        return <section aria-label="Quadratic Formula saved result" className="space-y-2"><p>{result.props.equation}</p><p>Attempt {result.attemptOrdinal}</p><p>Score: {result.score ?? 'Saved'}{result.maxScore === undefined ? '' : ` / ${result.maxScore}`}</p>{Object.entries(result.answers).map(([field, answer]) => <p key={field}>{field}: {String(answer)}</p>)}{result.state === 'final' && result.parts.map(part => <p key={part.partId}>{part.partId}: {part.isCorrect ? 'Correct' : 'Incorrect'} ({part.score} / {part.maxScore})</p>)}</section>;
      }
      const selectedProps = quadraticFormulaMode && quadraticFormulaAttempt?.state === 'pending'
        ? quadraticFormulaAttempt.props
        : section.content.activityProps as Record<string, unknown> | undefined;
      const pending = quadraticFormulaAttempt?.state === 'pending' ? quadraticFormulaAttempt : undefined;
      return (
        <ActivityRenderer
          key={pending?.pendingSubmissionId}
          componentKey={section.content.componentKey}
          activityId={activityId}
          lessonId={lessonId}
          phaseNumber={phaseNumber}
          mode={section.content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
            ? 'teaching'
            : quadraticFormulaMode === 'guided' || quadraticFormulaMode === 'practice'
              ? quadraticFormulaMode
              : mode}
          activityProps={selectedProps}
          pendingSubmissionId={pending?.pendingSubmissionId}
          attemptOrdinal={pending?.attemptOrdinal}
          quizReceipt={section.content.componentKey === 'comprehension-quiz' ? lesson16QuizReceipt : undefined}
          quizPendingAnswers={section.content.componentKey === 'comprehension-quiz' ? lesson16QuizPendingAnswers : undefined}
          onSubmit={onActivitySubmit ? handleSubmit : undefined}
          onComplete={handleComplete}
          onCheckDiscriminant={quadraticFormulaMode === 'guided'
            && pending ? (rawAnswer) => checkQuadraticFormulaDiscriminant({ activityId, pendingSubmissionId: pending.pendingSubmissionId, rawAnswer })
            : undefined}
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
