'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { LessonPageLayout, type PhaseNavItem } from '@/components/textbook/LessonPageLayout';
import { LessonStepper, type StepperPhase } from './LessonStepper';
import { PhaseRenderer, type PhaseSection } from './PhaseRenderer';
import { PhaseCompleteButton } from './PhaseCompleteButton';
import { submitActivity, type PracticeMode } from '@/lib/activities/submission';
import type { PhaseType } from '@/lib/curriculum/phase-types';

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
}

export function LessonRenderer({
  lessonId,
  lessonTitle,
  moduleLabel,
  lessonNumber,
  goals,
  phases,
  mode = 'practice',
}: LessonRendererProps) {
  const initialPhase = phases.find(p => p.status === 'current') ?? phases[0];
  const [activePhaseNumber, setActivePhaseNumber] = useState(initialPhase?.phaseNumber ?? 1);

  const activePhase = phases.find(p => p.phaseNumber === activePhaseNumber) ?? phases[0];

  const [completedActivities, setCompletedActivities] = useState<Set<string>>(new Set());

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

  const handleActivitySubmit = useCallback(async (activityId: string) => {
    setCompletedActivities(prev => new Set([...prev, activityId]));
    try {
      await submitActivity({
        activityId,
        mode: mode as PracticeMode,
        answers: {},
        attemptNumber: 1,
        status: 'submitted',
      });
    } catch (err) {
      setCompletedActivities(prev => {
        const next = new Set(prev);
        next.delete(activityId);
        return next;
      });
      throw err;
    }
  }, [mode]);

  const handleActivityComplete = useCallback((activityId: string) => {
    setCompletedActivities(prev => new Set([...prev, activityId]));
  }, []);

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

  return (
    <LessonPageLayout
      lessonTitle={lessonTitle}
      moduleLabel={moduleLabel}
      lessonNumber={lessonNumber}
      goals={goals}
      phases={navPhases}
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
            onActivityComplete={handleActivityComplete}
          />
        )}

        {!isTeachingMode && activePhase && (
          <PhaseCompleteButton
            lessonId={lessonId}
            phaseNumber={activePhase.phaseNumber}
            initialStatus={activePhase.completed ? 'completed' : 'not_started'}
            disabled={isPhaseGated}
          />
        )}
      </div>
    </LessonPageLayout>
  );
}