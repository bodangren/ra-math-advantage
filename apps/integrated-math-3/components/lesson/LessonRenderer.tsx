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
import {
  IM3_DOMAIN_RANGE_NODE,
  IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_EQUATION_RATE_WORKED_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
  IM3_SYMMETRY_WORKED_ACTIVITY_ID,
  IM3_TEACHER_LED_ACTIVITY_ID,
} from '@/lib/practice/learning-evidence-pilot';

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
  const submissionKeys = useRef(new Map<string, string>());
  const autoSubmissionPayloads = useRef(new Map<string, PracticeSubmissionEnvelope>());
  const autoSubmissionInFlight = useRef(new Set<string>());
  const [autoSubmissionErrorActivityId, setAutoSubmissionErrorActivityId] = useState<string | null>(null);
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

  const workedSource = useMemo<Extract<PhaseSection, { sectionType: 'activity' }> | null>(() => {
    if (!activePhase || activePhase.phaseType !== 'worked_example' || mode === 'teaching') {
      return null;
    }

    const matches = activePhase.sections.filter((section): section is Extract<PhaseSection, { sectionType: 'activity' }> => (
      section.sectionType === 'activity'
      && (
        (
          section.content.componentKey === 'graphing-explorer'
          && section.content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
          && section.content.masteryNodeId === IM3_PILOT_NODE
          && section.content.learningEvidenceMode === 'worked_example'
          && section.content.srsEligible === false
        )
        || (
          section.content.componentKey === 'rate-of-change-calculator'
          && section.content.stableActivityId === IM3_EQUATION_RATE_WORKED_ACTIVITY_ID
          && section.content.masteryNodeId === IM3_EQUATION_RATE_NODE
          && section.content.learningEvidenceMode === 'worked_example'
          && section.content.srsEligible === false
        )
        || (
          section.content.componentKey === 'graphing-explorer'
          && section.content.stableActivityId === IM3_DOMAIN_RANGE_WORKED_ACTIVITY_ID
          && section.content.masteryNodeId === IM3_DOMAIN_RANGE_NODE
          && section.content.learningEvidenceMode === 'worked_example'
          && section.content.srsEligible === false
        )
        || (
          section.content.componentKey === 'graphing-explorer'
          && section.content.stableActivityId === IM3_SYMMETRY_WORKED_ACTIVITY_ID
          && section.content.masteryNodeId === IM3_SYMMETRY_NODE
          && section.content.learningEvidenceMode === 'worked_example'
          && section.content.srsEligible === false
        )
        || (
          section.content.componentKey === 'graphing-explorer'
          && section.content.stableActivityId === IM3_COMPARE_MAXIMUM_WORKED_ACTIVITY_ID
          && section.content.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE
          && section.content.learningEvidenceMode === 'worked_example'
          && section.content.srsEligible === false
        )
        || (
          section.content.componentKey === 'fill-in-the-blank'
          && section.content.stableActivityId === IM3_PROFIT_MODEL_WORKED_ACTIVITY_ID
          && section.content.masteryNodeId === IM3_PROFIT_MODEL_NODE
          && section.content.learningEvidenceMode === 'worked_example'
          && section.content.srsEligible === false
        )
        || (
          section.content.componentKey === 'fill-in-the-blank'
          && section.content.stableActivityId === IM3_PROFIT_MAXIMUM_WORKED_ACTIVITY_ID
          && section.content.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE
          && section.content.learningEvidenceMode === 'worked_example'
          && section.content.srsEligible === false
        )
      )
    ));

    return matches.find((source) => !completedActivities.has(source.content.activityId)) ?? null;
  }, [activePhase, completedActivities, mode]);

  useEffect(() => {
    if (workedSource?.content.stableActivityId !== IM3_TEACHER_LED_ACTIVITY_ID) return;
    let active = true;
    void getSelectedWorkedAcknowledgement(workedSource.content.activityId).then((acknowledged) => {
      if (active && acknowledged) {
        setCompletedActivities((previous) => new Set([
          ...previous,
          workedSource.content.activityId,
        ]));
      }
    });
    return () => { active = false; };
  }, [workedSource]);

  useEffect(() => {
    const phaseNumbers = phases.filter(p => p.status !== 'locked' || mode === 'teaching').map(p => p.phaseNumber).sort((a, b) => a - b);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.defaultPrevented || (e.target instanceof Element && e.target.closest('input, textarea, select, [contenteditable="true"], [role="slider"], [role="radio"]'))) return;
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
  }, [phases, activePhaseNumber, mode]);

  const handleActivitySubmit = useCallback(async (activityId: string, payload: unknown) => {
    if (
      workedSource?.content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
      && workedSource.content.activityId === activityId
    ) return;
    const idempotencyKey = submissionKeys.current.get(activityId) ?? crypto.randomUUID();
    submissionKeys.current.set(activityId, idempotencyKey);
    let input: SubmitActivityInput;
    if (isPracticeSubmissionEnvelope(payload)) {
      input = {
        activityId: payload.activityId,
        mode: payload.mode,
        answers: payload.answers,
        attemptNumber: payload.attemptNumber,
        submittedAt: payload.submittedAt,
        status: payload.status,
        parts: payload.parts,
        artifact: payload.artifact,
        interactionHistory: payload.interactionHistory,
        analytics: payload.analytics,
        studentFeedback: payload.studentFeedback,
        teacherSummary: payload.teacherSummary,
        timing: payload.timing,
        idempotencyKey,
      };
    } else {
      input = {
        activityId,
        mode: mode as PracticeMode,
        answers: payload && typeof payload === 'object' ? (payload as Record<string, unknown>) : {},
        attemptNumber: 1,
        status: 'submitted',
        idempotencyKey,
      };
    }
    const result = await submitActivity(input);
    if (!result.success) throw new Error(result.error);

    submissionKeys.current.delete(activityId);
    setCompletedActivities(prev => new Set([...prev, activityId]));
  }, [mode, workedSource]);

  const deliverEquationWorked = useCallback(async () => {
    if (!workedSource) return;

    const activityId = workedSource.content.activityId;
    if (autoSubmissionInFlight.current.has(activityId)) return;

    submissionKeys.current.set(activityId, `worked-example:${activityId}`);

    const payload = autoSubmissionPayloads.current.get(activityId) ?? {
      contractVersion: 'practice.v1',
      activityId: toConvexActivityId(activityId),
      mode: 'worked_example',
      status: 'submitted',
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {},
      parts: [],
    } satisfies PracticeSubmissionEnvelope;

    autoSubmissionPayloads.current.set(activityId, payload);
    autoSubmissionInFlight.current.add(activityId);
    setSavingWorkedActivityId(activityId);
    setAutoSubmissionErrorActivityId(null);

    try {
      const result = workedSource.content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
        ? await createServerOwnedActivitySubmission({
            activityId: payload.activityId,
            mode: payload.mode,
            status: payload.status,
            attemptNumber: payload.attemptNumber,
            submittedAt: payload.submittedAt,
            answers: payload.answers,
            parts: payload.parts,
            idempotencyKey: `worked-example:${activityId}`,
          })
        : await handleActivitySubmit(activityId, payload).then(() => ({ success: true as const, submissionId: activityId }));
      if (!result.success) throw new Error(result.error);
      if (workedSource.content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID) {
        submissionKeys.current.delete(activityId);
        setCompletedActivities(prev => new Set([...prev, activityId]));
      }
      autoSubmissionPayloads.current.delete(activityId);
      setAutoSubmissionErrorActivityId(null);
    } catch {
      const recovered = workedSource.content.stableActivityId === IM3_TEACHER_LED_ACTIVITY_ID
        && await getSelectedWorkedAcknowledgement(activityId);
      if (recovered) {
        autoSubmissionPayloads.current.delete(activityId);
        submissionKeys.current.delete(activityId);
        setCompletedActivities(prev => new Set([...prev, activityId]));
        setAutoSubmissionErrorActivityId(null);
      } else {
        setAutoSubmissionErrorActivityId(activityId);
      }
    } finally {
      autoSubmissionInFlight.current.delete(activityId);
      setSavingWorkedActivityId(null);
    }
  }, [workedSource, handleActivitySubmit]);

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
    phaseNumber: p.phaseNumber,
    disabled: p.status === 'locked' && mode !== 'teaching',
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
        onPhaseSelect={setActivePhaseNumber}
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
        onPhaseSelect={setActivePhaseNumber}
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
        onPhaseSelect={setActivePhaseNumber}
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

          {workedSource && autoSubmissionErrorActivityId !== workedSource.content.activityId && (
            <button
              type="button"
              className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
              disabled={savingWorkedActivityId === workedSource.content.activityId}
              onClick={() => void deliverEquationWorked()}
            >
              {savingWorkedActivityId === workedSource.content.activityId
                ? 'Saving your review…'
                : 'I reviewed this worked example'}
            </button>
          )}

          {autoSubmissionErrorActivityId === workedSource?.content.activityId && (
            <div className="flex items-center justify-between gap-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm">
              <p role="alert">We could not save your progress.</p>
              <button
                type="button"
                className="underline"
                onClick={() => void deliverEquationWorked()}
              >
                Try again
              </button>
            </div>
          )}

          {!isTeachingMode && activePhase && (
            <PhaseCompleteButton
              key={`${lessonId}-${activePhase.phaseNumber}`}
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
