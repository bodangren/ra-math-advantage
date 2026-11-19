"use client";

import { Suspense, createElement, useCallback, useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

import { getActivityComponent } from "@/lib/activities/registry";
import type { Activity } from "@/lib/schemas/validators";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePhaseCompletion } from "@/hooks/usePhaseCompletion";
import {
  isPracticeSubmissionEnvelope,
  type PracticeSubmissionCallbackPayload,
} from "@math-platform/practice-core/contract";
import type { CompletePhaseResponse } from "@/types/api";

interface ActivityRendererProps {
  activityId: string;
  lessonId: string;
  phaseNumber: number;
  required?: boolean;
  initialStatus?: "not_started" | "in_progress" | "completed" | "current" | "available" | "locked";
  onStatusChange?: () => void;
  /** Standard code to credit in student_competency when this activity is completed */
  linkedStandardId?: string;
}

type ActivitySubmissionPayload = PracticeSubmissionCallbackPayload;

const ACCOUNTING_EQUATION_EVENT_KEY = "accounting-equation-event";

function isWorkedEventAcknowledgement(
  payload: ActivitySubmissionPayload,
  expectedActivityId: string,
): boolean {
  if (
    !isPracticeSubmissionEnvelope(payload) ||
    payload.activityId !== expectedActivityId ||
    payload.mode !== "worked_example" ||
    payload.status !== "submitted" ||
    Array.isArray(payload.answers) ||
    typeof payload.answers !== "object" ||
    payload.answers === null ||
    Object.keys(payload.answers).length !== 0 ||
    !Array.isArray(payload.parts) ||
    payload.parts.length !== 0
  )
    return false;
  const artifact = payload.artifact;
  return (
    typeof artifact === "object" &&
    artifact !== null &&
    !Array.isArray(artifact) &&
    (artifact as { kind?: unknown }).kind === "accounting-equation-event-acknowledgement"
  );
}

interface AssessmentResponse {
  attemptOrdinal?: number;
  score: number;
  maxScore: number;
  percentage: number;
  feedback?: string;
}

/**
 * ActivityRenderer fetches an activity from the database by ID
 * and renders it using the activity registry.
 */
export function ActivityRenderer({
  activityId,
  lessonId,
  phaseNumber,
  required = false,
  initialStatus = "not_started",
  onStatusChange,
  linkedStandardId,
}: ActivityRendererProps) {
  const [pendingSubmission, setPendingSubmission] = useState<ActivitySubmissionPayload | null>(
    null,
  );
  const [activity, setActivity] = useState<Activity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] = useState<AssessmentResponse | null>(null);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [completionResult, setCompletionResult] = useState<CompletePhaseResponse | null>(() => {
    if (initialStatus === "completed") {
      return {
        success: true,
        nextPhaseUnlocked: true,
        message: "Activity already completed",
        phaseId: "",
      };
    }
    return null;
  });

  const { completePhase, isCompleting } = usePhaseCompletion({
    lessonId,
    phaseNumber,
    phaseType: "do",
    linkedStandardId,
    onSuccess: (response) => {
      setCompletionResult(response);
      setSubmissionError(null);
      // Notify parent to refresh progress
      onStatusChange?.();
    },
    onError: (completionError) => {
      setCompletionResult(null);
      setSubmissionError(
        completionError instanceof Error ? completionError.message : "Unable to complete activity",
      );
    },
  });

  useEffect(() => {
    async function fetchActivity() {
      try {
        setLoading(true);
        setError(null);

        // Fetch activity from API
        const response = await fetch(`/api/activities/${activityId}`);

        if (!response.ok) {
          throw new Error(`Failed to fetch activity: ${response.statusText}`);
        }

        const data = await response.json();
        setActivity(data);
      } catch (err) {
        console.error("Error fetching activity:", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }

    fetchActivity();
  }, [activityId]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setSubmissionResult(null);
      setSubmissionError(null);
      setSubmitting(false);
    }, 0);
    return () => clearTimeout(timer);
  }, [activityId]);

  const handleAssessmentSubmit = useCallback(
    async (payload: ActivitySubmissionPayload): Promise<boolean> => {
      if (!activity) {
        return false;
      }

      if (!isPracticeSubmissionEnvelope(payload)) {
        return false;
      }

      const canonicalSubmission = payload;
      const answers = canonicalSubmission.answers;
      const isAccountingEquationEvent = activity.componentKey === ACCOUNTING_EQUATION_EVENT_KEY;
      const isWorkedAcknowledgement =
        isAccountingEquationEvent && isWorkedEventAcknowledgement(canonicalSubmission, activityId);
      if (
        !isWorkedAcknowledgement &&
        (!answers ||
          typeof answers !== "object" ||
          Array.isArray(answers) ||
          Object.keys(answers).length === 0)
      ) {
        setSubmissionError("Please complete the assessment before submitting.");
        setSubmissionResult(null);
        return false;
      }

      setSubmitting(true);
      setSubmissionError(null);
      setSubmissionResult(null);

      try {
        const response = await fetch("/api/progress/assessment", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Idempotency-Key": canonicalSubmission.submittedAt,
          },
          body: JSON.stringify(canonicalSubmission),
        });

        const data = await response.json();
        if (!response.ok) {
          throw new Error(data?.error ?? "Unable to submit assessment");
        }

        if (isWorkedAcknowledgement) {
          if (data?.acknowledged !== true) {
            throw new Error("The acknowledgement was not saved.");
          }
          setSubmissionResult(null);
        } else {
          if (
            isAccountingEquationEvent &&
            (typeof data?.score !== "number" ||
              typeof data?.maxScore !== "number" ||
              typeof data?.percentage !== "number")
          ) {
            throw new Error("The saved assessment result is invalid.");
          }
          setSubmissionResult({
            attemptOrdinal: data.attemptOrdinal,
            score: data.score,
            maxScore: data.maxScore,
            percentage: data.percentage,
            feedback: data.feedback,
          });
        }
        return true;
      } catch (submitError) {
        setSubmissionResult(null);
        setSubmissionError(
          submitError instanceof Error ? submitError.message : "Unable to submit assessment",
        );
        return false;
      } finally {
        setSubmitting(false);
      }
    },
    [activity, activityId],
  );

  /**
   * Trigger canonical phase completion flow for activity phases.
   */
  const handleActivityComplete = useCallback(async () => {
    if (!activity || completionResult?.success) {
      return;
    }

    setSubmissionError(null);
    setCompletionResult(null);
    await completePhase();
  }, [activity, completePhase, completionResult]);

  const didPayloadCompleteActivity = useCallback((payload: ActivitySubmissionPayload): boolean => {
    return isPracticeSubmissionEnvelope(payload) && payload.status !== "draft";
  }, []);

  const handleActivitySubmit = useCallback(
    async (payload: ActivitySubmissionPayload) => {
      setPendingSubmission(payload);
      const assessmentWasRecorded = await handleAssessmentSubmit(payload);
      if (!assessmentWasRecorded) return false;

      if (!didPayloadCompleteActivity(payload)) {
        return true;
      }

      await handleActivityComplete();
      return true;
    },
    [didPayloadCompleteActivity, handleActivityComplete, handleAssessmentSubmit],
  );

  const handleAccountingEquationEventSubmit = useCallback(
    async (payload: ActivitySubmissionPayload): Promise<void> => {
      const assessmentWasRecorded = await handleAssessmentSubmit(payload);
      if (!assessmentWasRecorded) {
        throw new Error("The event response was not saved.");
      }
    },
    [handleAssessmentSubmit],
  );

  if (loading) {
    return (
      <Card className="my-4">
        <CardContent className="py-8 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error || !activity) {
    return (
      <Card className="my-4 border-red-200 bg-red-50">
        <CardContent className="py-4">
          <p className="text-red-700">Failed to load activity: {error || "Activity not found"}</p>
        </CardContent>
      </Card>
    );
  }

  const activityComponent = getActivityComponent(activity.componentKey);
  const isAccountingEquationEvent = activity.componentKey === ACCOUNTING_EQUATION_EVENT_KEY;

  if (!activityComponent) {
    return (
      <Card className="my-4 border-yellow-200 bg-yellow-50">
        <CardContent className="py-4">
          <p className="text-yellow-700">Activity component not found: {activity.componentKey}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="my-4">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{activity.displayName}</CardTitle>
          {required && <Badge variant="destructive">Required</Badge>}
        </div>
        {activity.description && (
          <p className="text-sm text-muted-foreground">{activity.description}</p>
        )}
      </CardHeader>
      <CardContent className="space-y-4">
        <Suspense fallback={<p role="status">Loading activity...</p>}>
          {createElement(
            activityComponent,
            isAccountingEquationEvent
              ? {
                  ...(activity.props as Record<string, unknown>),
                  key: activityId,
                  onSubmit: handleAccountingEquationEventSubmit,
                  onComplete: handleActivityComplete,
                }
              : {
                  key: activityId,
                  activity,
                  onSubmit:
                    activity.componentKey === "spreadsheet-evaluator"
                      ? undefined
                      : handleActivitySubmit,
                  onComplete: handleActivityComplete,
                },
          )}
        </Suspense>
        {submitting && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Submitting answers…</AlertTitle>
            <AlertDescription>
              <p>We&apos;re recording your work and calculating your score.</p>
            </AlertDescription>
          </Alert>
        )}
        {isCompleting && (
          <Alert>
            <Loader2 className="h-4 w-4 animate-spin" />
            <AlertTitle>Completing activity…</AlertTitle>
            <AlertDescription>
              <p>Saving your progress and updating your achievements.</p>
            </AlertDescription>
          </Alert>
        )}
        {submissionResult && (
          <Alert>
            <AlertTitle>Work saved</AlertTitle>
            <AlertDescription>
              {submissionResult.maxScore > 0 && (
                <p>
                  Score: {submissionResult.score}/{submissionResult.maxScore} (
                  {submissionResult.percentage}%)
                </p>
              )}
              {submissionResult.attemptOrdinal && <p>Attempt {submissionResult.attemptOrdinal}</p>}
              {submissionResult.feedback && <p>{submissionResult.feedback}</p>}
            </AlertDescription>
          </Alert>
        )}
        {completionResult && (
          <Alert className="border-green-200 bg-green-50">
            <AlertTitle className="text-green-800">Activity completed!</AlertTitle>
            <AlertDescription className="text-green-700">
              <p>{completionResult.message}</p>
              {completionResult.nextPhaseUnlocked && (
                <p className="mt-2 font-medium">
                  Next phase unlocked! Continue to the next section.
                </p>
              )}
            </AlertDescription>
          </Alert>
        )}
        {submissionError && !submitting && !isCompleting && !isAccountingEquationEvent && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              <p>{submissionError}</p>
              <button
                onClick={() =>
                  pendingSubmission
                    ? handleActivitySubmit(pendingSubmission)
                    : handleActivityComplete()
                }
                className="mt-2 text-sm underline hover:no-underline"
              >
                Try again
              </button>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
