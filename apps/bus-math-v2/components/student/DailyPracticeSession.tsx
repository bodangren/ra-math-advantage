'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getPracticeFamily } from '@/lib/practice/engine/family-registry';
import * as answerInputRegistry from '@/lib/srs/answer-inputs/registry';
import type { PracticeSubmissionEnvelope } from '@/lib/practice/contract';
import type { AccountingEquationDefinition } from '@/lib/practice/engine/families/accounting-equation';
import {
  BM2_PILOT_MODES,
  BM2_PILOT_PROBLEM_FAMILY_ID,
  isBm2PilotPublished,
} from '@/lib/learning-evidence/bm2-pilot';

interface FlatSrsCard {
  cardId: string;
  studentId: string;
  objectiveId: string;
  problemFamilyId: string;
  stability: number;
  difficulty: number;
  state: 'new' | 'learning' | 'review' | 'relearning';
  dueDate: string;
  elapsedDays: number;
  scheduledDays: number;
  reps: number;
  lapses: number;
  lastReview: string | null;
  createdAt: string;
  updatedAt: string;
}
interface DailyPracticeSessionProps {
  studentId: string;
}

/**
 * Renders a daily SRS practice session that presents due cards one at a time
 * with family-specific answer inputs and review submission.
 *
 * @param props - Component props.
 * @param props.studentId - The student's unique ID.
 * @returns A practice session page with card display and answer submission.
 */
export function DailyPracticeSession({ studentId }: DailyPracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sessionCompleted, setSessionCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [cachedSubmissionId, setCachedSubmissionId] = useState<string | null>(null);
  const [pilotModeIndex, setPilotModeIndex] = useState(0);
  const submittedRef = useRef(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const submissionIdRef = useRef<string | null>(null);
  const createIdempotencyKeyRef = useRef<string | null>(null);
  const submissionEnvelopeRef = useRef<PracticeSubmissionEnvelope | null>(null);

  const [dueCards, setDueCards] = useState<FlatSrsCard[]>();
  const [queueError, setQueueError] = useState(false);
  useEffect(() => {
    let active = true;
    void fetch('/api/srs', { cache: 'no-store' }).then(async (response) => {
      if (!response.ok) throw new Error('queue_unavailable');
      const cards = await response.json();
      if (active) setDueCards(cards);
    }).catch(() => { if (active) setQueueError(true); });
    return () => { active = false; };
  }, [studentId]);

  const [sessionCards, setSessionCards] = useState<FlatSrsCard[] | null>(null);
  if (sessionCards === null && dueCards !== undefined) {
    setSessionCards((dueCards as FlatSrsCard[]).filter((card) => Boolean(answerInputRegistry.dailyPracticeInputRegistry[card.problemFamilyId])).slice(0, 10));
  }
  const excludedCount = dueCards?.filter(card => !answerInputRegistry.dailyPracticeInputRegistry[card.problemFamilyId]).length ?? 0;
  const excludedMessage = excludedCount > 0 ? <p role="status" className="text-muted-foreground mb-4">{excludedCount} due practice {excludedCount === 1 ? 'item has' : 'items have'} no supported input. Ask your teacher for the corresponding lesson task.</p> : null;
  const completed = sessionCompleted;

  const currentCard = sessionCards?.[currentIndex];

  if (queueError) return <p role="alert">Unable to load daily practice. Reload this page to try again.</p>;
  if (sessionCards === null) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-muted-foreground">Loading your practice queue...</div>
      </div>
    );
  }

  if (completed || !currentCard) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-center text-2xl">{excludedCount > 0 && sessionCards.length === 0 ? 'Practice inputs unavailable' : 'No Problems Due'}</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            {excludedMessage}
            {sessionCards.length > 0 || excludedCount === 0 ? <p className="text-muted-foreground mb-4">
              Great work! You have no practice problems due right now.
              Check back later for more review.
            </p> : null}
            <Button variant="outline" onClick={() => window.location.reload()}>
              Refresh
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isBm2PilotCard = currentCard.problemFamilyId === BM2_PILOT_PROBLEM_FAMILY_ID;
  const isBm2MasteryAdvantage = isBm2PilotCard && isBm2PilotPublished();
  const pilotMode = BM2_PILOT_MODES[pilotModeIndex] ?? 'independent_practice';
  const familyKey = currentCard.problemFamilyId;
  const family = getPracticeFamily(familyKey);

  if (!family) {
    return (
      <div className="max-w-2xl mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <p className="text-muted-foreground">
              Unknown practice family: {familyKey}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deliverBm2Evidence = async (submissionId: string) => {
    const progressionResponse = await fetch('/api/learning-evidence/bm2-pilot', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ submissionId }),
    });
    if (!progressionResponse.ok) {
      throw new Error('Unable to record BM2 learning evidence');
    }
  };


  /**
   * Processes a practice submission envelope, grades the answer, records
   * the SRS review, and shows the next button.
   *
   * @param envelope - The practice submission envelope with answers and timing.
   */
  const handleSubmit = async (envelope: PracticeSubmissionEnvelope) => {
    if (submittedRef.current) return;
    if (isBm2MasteryAdvantage && envelope.mode === 'guided_practice') {
      setPilotModeIndex(2);
      return;
    }
    submittedRef.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);
    submissionEnvelopeRef.current = envelope;

    try {
      if (isBm2MasteryAdvantage) {
        const idempotencyKey = createIdempotencyKeyRef.current ?? crypto.randomUUID();
        createIdempotencyKeyRef.current = idempotencyKey;
        let submissionId = submissionIdRef.current;

        if (!submissionId) {
          const createResponse = await fetch('/api/progress/assessment', {
            method: 'POST',
            headers: {
              'content-type': 'application/json',
              'Idempotency-Key': idempotencyKey,
            },
            body: JSON.stringify(envelope),
          });
          const created = await createResponse.json() as { submissionId?: unknown };
          if (!createResponse.ok || typeof created.submissionId !== 'string') {
            throw new Error('Unable to create BM2 activity submission');
          }
          submissionId = created.submissionId;
          submissionIdRef.current = submissionId;
          setCachedSubmissionId(submissionId);
        }

        await deliverBm2Evidence(submissionId);
      } else {
        const idempotencyKey = createIdempotencyKeyRef.current ?? crypto.randomUUID();
        createIdempotencyKeyRef.current = idempotencyKey;
        const response = await fetch('/api/srs', { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cardId: currentCard.cardId, activityId: envelope.activityId, answers: envelope.answers, idempotencyKey }) });
        if (!response.ok) throw new Error('Unable to save this review.');
      }
      setShowNext(true);
    } catch (error) {
      submittedRef.current = false;
      setSubmissionError(error instanceof Error ? error.message : 'Unable to save this submission');
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetry = async () => {
    const submissionId = submissionIdRef.current;
    if (!submissionId) {
      const pendingEnvelope = submissionEnvelopeRef.current;
      if (pendingEnvelope) await handleSubmit(pendingEnvelope);
      return;
    }

    submittedRef.current = true;
    setIsSubmitting(true);
    setSubmissionError(null);
    try {
      await deliverBm2Evidence(submissionId);
      setShowNext(true);
    } catch (error) {
      submittedRef.current = false;
      setSubmissionError(error instanceof Error ? error.message : 'Unable to record BM2 learning evidence');
    } finally {
      setIsSubmitting(false);
    }
  };


  /**
   * Advances to the next card or marks the session as complete.
   */
  const handleAdvance = () => {
    setShowNext(false);
    submittedRef.current = false;
    setSubmissionError(null);
    setCachedSubmissionId(null);
    setPilotModeIndex(0);
    submissionIdRef.current = null;
    createIdempotencyKeyRef.current = null;
    submissionEnvelopeRef.current = null;
    if (currentIndex < sessionCards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setSessionCompleted(true);
    }
    setTimeout(() => {
      cardRef.current?.focus();
    }, 0);
  };

  const seed = currentCard.reps + 1 + (isBm2MasteryAdvantage ? pilotModeIndex : 0);
  const AnswerInputComponent = answerInputRegistry.dailyPracticeInputRegistry[familyKey];
  const problemDef = AnswerInputComponent
    ? family.generate(
        seed,
        isBm2MasteryAdvantage ? { mode: pilotMode } : undefined,
      )
    : null;
  const accountingDefinition = isBm2MasteryAdvantage
    ? problemDef as AccountingEquationDefinition
    : null;

  return (
    <div className="max-w-4xl mx-auto py-8">
      {excludedMessage}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Daily Practice</h1>
          <p className="text-muted-foreground text-sm">
            Problem {currentIndex + 1} of {sessionCards.length}
          </p>
        </div>
        <Badge variant="outline">
          {sessionCards.length - currentIndex - 1} remaining
        </Badge>
      </div>

      <Card ref={cardRef} tabIndex={-1} data-testid="practice-card" className="mb-4 outline-none">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            {familyKey.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
          </CardTitle>
        </CardHeader>
        <CardContent className="relative">
          {isSubmitting && (
            <div className="absolute inset-0 bg-background/70 flex items-center justify-center z-10 rounded">
              <div className="text-muted-foreground font-medium">Saving result...</div>
            </div>
          )}
          {isBm2PilotCard && !isBm2MasteryAdvantage ? (
            <p className="text-muted-foreground" role="status">
              This practice item is not available. Ask your teacher for the lesson activity.
            </p>
          ) : pilotMode === 'worked_example' && accountingDefinition ? (
            <div className="space-y-6" data-testid="bm2-worked-example">
              <div className="rounded-lg bg-muted/50 p-4">
                <h3 className="font-medium">Worked example</h3>
                <p className="mt-2 text-sm">{accountingDefinition.scaffolding.formula}</p>
                {accountingDefinition.facts.map((fact) => (
                  <p className="mt-2 text-sm" key={fact.id}>
                    {fact.label}: {fact.value.toLocaleString('en-US')}
                  </p>
                ))}
                <p className="mt-2 text-sm">
                  {accountingDefinition.terms[accountingDefinition.equation.hiddenTermId].label}: {' '}
                  {accountingDefinition.equation[accountingDefinition.equation.hiddenTermId].toLocaleString('en-US')}
                </p>
                <p className="mt-2 text-sm">
                  Check: {accountingDefinition.equation.assets.toLocaleString('en-US')} = {' '}
                  {accountingDefinition.equation.liabilities.toLocaleString('en-US')} + {' '}
                  {accountingDefinition.equation.equity.toLocaleString('en-US')}
                </p>
              </div>
              <Button type="button" onClick={() => setPilotModeIndex(1)}>Continue to guided practice</Button>
            </div>
          ) : AnswerInputComponent ? (
            <AnswerInputComponent
              key={`${currentCard.cardId}:${currentCard.reps}:${pilotMode}`}
              family={family}
              definition={problemDef}
              onSubmit={handleSubmit}
            />
          ) : (
            <p className="text-muted-foreground" role="status">
              Daily practice is not available for this problem family.
            </p>
          )}
          {submissionError && (
            <div className="mt-6 rounded border border-destructive/50 bg-destructive/10 p-4" role="alert">
              <p className="text-sm text-destructive">{submissionError}</p>
              <Button
                type="button"
                variant="outline"
                className="mt-3"
                onClick={handleRetry}
                disabled={isSubmitting}
              >
                {cachedSubmissionId ? 'Retry evidence delivery' : 'Retry submission'}
              </Button>
            </div>
          )}
          {showNext && (
            <div className="mt-6 pt-4 border-t">
              <Button onClick={handleAdvance} className="w-full" data-testid="next-problem-button">
                Next Problem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
