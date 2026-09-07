'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { LessonPageLayout, type PhaseNavItem } from '@/components/textbook/LessonPageLayout';
import { LessonStepper, type StepperPhase } from './LessonStepper';
import { PhaseRenderer, type PhaseSection } from './PhaseRenderer';
import { PhaseCompleteButton } from './PhaseCompleteButton';
import { LessonSkeleton } from './LessonSkeleton';
import { LessonCompleteScreen } from './LessonCompleteScreen';
import { LessonChatbot } from '@/components/student/LessonChatbot';
import { createServerOwnedActivitySubmission, getSelectedWorkedAcknowledgement, submitActivity, type PracticeMode, type SubmitActivityInput } from '@/lib/activities/submission';
import { toConvexActivityId } from '@math-platform/practice-core';
import { isPracticeSubmissionEnvelope, type PracticeSubmissionEnvelope } from '@math-platform/practice-core/contract';
import type { PhaseType } from '@math-platform/activity-runtime/phase-types';
import { IM3_PILOT_NODE, IM3_TEACHER_LED_ACTIVITY_ID } from '@/lib/practice/learning-evidence-pilot';

export interface LessonPhase {
  phaseId: string;
  phaseNumber: number;
  phaseType: PhaseType;
  title: string;
  sections: PhaseSection[];
  status: 'completed' | 'current' | 'available' | 'locked' | 'skipped';
  completed: boolean;
}

export interface LessonRendererProps {
  lessonId: string;
  lessonTitle: string;
  moduleLabel: string;
  lessonNumber: number;
  goals?: string;
  phases: LessonPhase[];
  mode?: 'teaching' | 'guided' | 'practice';
  isLoading?: boolean;
  onLessonComplete?: (lessonId: string) => void;
  showTeacherPreviewBadge?: boolean;
}

/**
 * Orchestrates the full lesson experience with phase stepper, content rendering, and completion flow.
 *
 * @param {LessonRendererProps} props - Lesson renderer configuration.
 * @returns {JSX.Element} A complete lesson page.
 */
export function LessonRenderer({
  lessonId,
  lessonTitle,
  moduleLabel,
  lessonNumber,
  goals,
  phases,
  mode = 'practice',
  isLoading = false,
  onLessonComplete,
  showTeacherPreviewBadge = false,
}: LessonRendererProps) {
  const initialPhase = phases.find(p => p.status === 'current') ?? phases[0];
  const [activePhaseNumber, setActivePhaseNumber] = useState(initialPhase?.phaseNumber ?? 1);

  const activePhase = phases.find(p => p.phaseNumber === activePhaseNumber) ?? phases[0];

  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());
  const [completedPhases, setCompletedPhases] = useState<Set<number>>(new Set());
  const [showLessonComplete, setShowLessonComplete] = useState(false);
  const workedPayloads = useRef(new Map<string, PracticeSubmissionEnvelope>());
  const workedInFlight = useRef(new Set<string>());
  const [workedErrorActivityId, setWorkedErrorActivityId] = useState<string | null>(null);
  const [savingWorkedActivityId, setSavingWorkedActivityId] = useState<string | null>(null);

  const requiredActivityIds = useMemo(() => {
    if (!activePhase) return [];
    return activePhase.sections
      .filter((s): s is { sectionType: 'activity'; content: { componentKey: string; activityId: string }; id: string; sequenceOrder: number } => s.sectionType === 'activity')
      .map(s => s.content.activityId);
  }, [activePhase]);

  const allActivitiesComplete = useMemo(() => {
    if (requiredActivityIds.length === 0) return true;
    return requiredActivityIds.every(id => completedActivities.has(id));
  }, [requiredActivityIds, completedActivities]);

  const isPhaseGated = requiredActivityIds.length > 0 && !allActivitiesComplete && !activePhase?.completed;

  const selectedWorkedSource = useMemo<Extract<PhaseSection, { sectionType: 'activity' }> | null>(() => {
    if (!activePhase || activePhase.phaseType !== 'worked_example' || mode === 'teaching') return null;
    return activePhase.sections.find((section): section is Extract<PhaseSection, { sectionType: 'activity' }> => (
      section.sectionType === 'activity'
      && section.content.componentKey === 'graphing-explorer'
      && section.content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
      && section.content.masteryNodeId === IM3_PILOT_NODE
      && section.content.learningEvidenceMode === 'worked_example'
      && section.content.srsEligible === false
      && !completedActivities.has(section.content.activityId)
    )) ?? null;
  }, [activePhase, completedActivities, mode]);

  useEffect(() => {
    if (!selectedWorkedSource) return;
    let active = true;
    void getSelectedWorkedAcknowledgement(selectedWorkedSource.content.activityId).then((acknowledged) => {
      if (active && acknowledged) {
        setCompletedActivities((previous) => new Set([
          ...previous,
          selectedWorkedSource.content.activityId,
        ]));
      }
    });
    return () => { active = false; };
  }, [selectedWorkedSource]);

  useEffect(() => {
    const phaseNumbers = phases.map(p => p.phaseNumber).sort((a, b) => a - b);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight') {
        const idx = phaseNumbers.indexOf(activePhaseNumber);
        if (idx < phaseNumbers.length - 1) {
          setActivePhaseNumber(phaseNumbers[idx + 1]);
        }
      } else if (e.key === 'ArrowLeft') {
        const idx = phaseNumbers.indexOf(activePhaseNumber);
        if (idx > 0) {
          setActivePhaseNumber(phaseNumbers[idx - 1]);
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [phases, activePhaseNumber]);

  const handleActivitySubmit = useCallback(async (activityId: string, payload: unknown) => {
    if (selectedWorkedSource?.content.activityId === activityId) return;
    setCompletedActivities(prev => new Set([...prev, activityId]));
    try {
      let input: SubmitActivityInput;
      if (isPracticeSubmissionEnvelope(payload)) {
        input = {
          activityId: payload.activityId,
          mode: payload.mode,
          answers: payload.answers,
          attemptNumber: payload.attemptNumber,
          status: payload.status,
          parts: payload.parts,
          artifact: payload.artifact,
          interactionHistory: payload.interactionHistory,
          analytics: payload.analytics,
          studentFeedback: payload.studentFeedback,
          teacherSummary: payload.teacherSummary,
          timing: payload.timing,
        };
      } else {
        input = {
          activityId,
          mode: mode as PracticeMode,
          answers: payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {},
          attemptNumber: 1,
          status: 'submitted',
        };
      }
      await submitActivity(input);
    } catch (err) {
      setCompletedActivities(prev => {
        const next = new Set(prev);
        next.delete(activityId);
        return next;
      });
      throw err;
    }
  }, [mode, selectedWorkedSource]);

  const deliverSelectedWorked = useCallback(async () => {
    if (!selectedWorkedSource) return;
    const activityId = selectedWorkedSource.content.activityId;
    if (workedInFlight.current.has(activityId)) return;
    const payload = workedPayloads.current.get(activityId) ?? {
      contractVersion: 'practice.v1',
      activityId: toConvexActivityId(activityId),
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {},
      parts: [],
    } satisfies PracticeSubmissionEnvelope;
    workedPayloads.current.set(activityId, payload);
    workedInFlight.current.add(activityId);
    setSavingWorkedActivityId(activityId);
    setWorkedErrorActivityId(null);
    try {
      const result = await createServerOwnedActivitySubmission({
        activityId: payload.activityId,
        mode: payload.mode,
        status: payload.status,
        attemptNumber: payload.attemptNumber,
        submittedAt: payload.submittedAt,
        answers: payload.answers,
        parts: payload.parts,
        idempotencyKey: `worked-example:${activityId}`,
      });
      if (!result.success) throw new Error(result.error);
      workedPayloads.current.delete(activityId);
      setCompletedActivities((previous) => new Set([...previous, activityId]));
    } catch {
      if (await getSelectedWorkedAcknowledgement(activityId)) {
        workedPayloads.current.delete(activityId);
        setCompletedActivities((previous) => new Set([...previous, activityId]));
      } else {
        setWorkedErrorActivityId(activityId);
      }
    } finally {
      workedInFlight.current.delete(activityId);
      setSavingWorkedActivityId(null);
    }
  }, [selectedWorkedSource]);

  const handlePhaseStatusChange = useCallback((status: 'not_started' | 'in_progress' | 'completed' | 'skipped') => {
    if ((status === 'completed' || status === 'skipped') && activePhase) {
      setCompletedPhases(prev => new Set([...prev, activePhase.phaseNumber]));
      const idx = phases.findIndex(p => p.phaseNumber === activePhase.phaseNumber);
      if (idx < phases.length - 1) {
        setTimeout(() => {
          setActivePhaseNumber(phases[idx + 1].phaseNumber);
        }, 300);
      } else {
        setShowLessonComplete(true);
        onLessonComplete?.(lessonId);
      }
    }
  }, [activePhase, phases, lessonId, onLessonComplete]);

  const navPhases: PhaseNavItem[] = phases.map(p => ({
    phaseType: p.phaseType,
    label: p.title,
    completed: p.completed,
    isCurrent: p.phaseNumber === activePhaseNumber,
  }));

  const stepperPhases: StepperPhase[] = phases.map(p => ({
    phaseNumber: p.phaseNumber,
    phaseId: p.phaseId,
    phaseType: p.phaseType,
    title: p.title,
    status: p.phaseNumber === activePhaseNumber && p.status !== 'locked' ? 'current' : p.status,
  }));

  const isTeachingMode = mode === 'teaching';

  if (isLoading) {
    return (
      <LessonPageLayout
        lessonTitle={lessonTitle}
        moduleLabel={moduleLabel}
        lessonNumber={lessonNumber}
        goals={goals}
        phases={[]}
        showTeacherPreviewBadge={showTeacherPreviewBadge}
      >
        <LessonSkeleton phaseCount={phases.length || 4} />
      </LessonPageLayout>
    );
  }

  if (showLessonComplete) {
    return (
      <LessonPageLayout
        lessonTitle={lessonTitle}
        moduleLabel={moduleLabel}
        lessonNumber={lessonNumber}
        goals={goals}
        phases={navPhases}
        showTeacherPreviewBadge={showTeacherPreviewBadge}
      >
        <LessonCompleteScreen
          lessonTitle={lessonTitle}
          lessonNumber={lessonNumber}
          phasesCompleted={completedPhases.size || phases.filter(p => p.completed).length}
          totalPhases={phases.length}
          onContinue={() => {}}
        />
      </LessonPageLayout>
    );
  }

  return (
    <>
      <LessonPageLayout
        lessonTitle={lessonTitle}
        moduleLabel={moduleLabel}
        lessonNumber={lessonNumber}
        goals={goals}
        phases={navPhases}
        showTeacherPreviewBadge={showTeacherPreviewBadge}
      >
        <div className="space-y-6">
          <LessonStepper
            phases={stepperPhases}
            currentPhase={activePhaseNumber}
            onPhaseClick={(phaseNumber) => setActivePhaseNumber(phaseNumber)}
          />

          {activePhase && (
            <PhaseRenderer
              phaseType={activePhase.phaseType}
              sections={activePhase.sections}
              lessonId={lessonId}
              phaseNumber={activePhase.phaseNumber}
              mode={mode}
              onActivitySubmit={handleActivitySubmit}
            />
          )}

          {selectedWorkedSource && workedErrorActivityId !== selectedWorkedSource.content.activityId && (
            <button
              type="button"
              disabled={savingWorkedActivityId === selectedWorkedSource.content.activityId}
              onClick={() => void deliverSelectedWorked()}
            >
              {savingWorkedActivityId === selectedWorkedSource.content.activityId
                ? 'Saving your review…'
                : 'I reviewed this worked example'}
            </button>
          )}

          {workedErrorActivityId === selectedWorkedSource?.content.activityId && (
            <div>
              <p role="alert">We could not save your progress.</p>
              <button type="button" onClick={() => void deliverSelectedWorked()}>Try again</button>
            </div>
          )}

          {!isTeachingMode && activePhase && (
            <PhaseCompleteButton
              lessonId={lessonId}
              phaseNumber={activePhase.phaseNumber}
              phaseType={activePhase.phaseType}
              initialStatus={
                activePhase.status === 'skipped'
                  ? 'skipped'
                  : activePhase.completed || completedPhases.has(activePhase.phaseNumber)
                    ? 'completed'
                    : 'not_started'
              }
              disabled={isPhaseGated}
              onStatusChange={handlePhaseStatusChange}
            />
          )}
        </div>
      </LessonPageLayout>
      {mode === 'practice' && activePhase && (
        <LessonChatbot lessonId={lessonId} phaseNumber={activePhase.phaseNumber} />
      )}
    </>
  );
}
