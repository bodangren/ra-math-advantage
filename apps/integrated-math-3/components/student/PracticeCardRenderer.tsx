"use client";

import { useCallback } from "react";
import { ActivityRenderer } from "@/components/lesson/ActivityRenderer";
import { CardProgressBar } from "./CardProgressBar";
import type { ResolvedQueueItem } from "@/convex/queue/queue";
import {
  buildPracticeSubmissionEnvelope,
  practiceSubmissionEnvelopeSchema,
  type PracticeSubmissionEnvelope,
} from "@math-platform/practice-core/contract";
import { usePracticeTiming } from "@/components/practice-timing";
import {
  IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_DOMAIN_RANGE_NODE,
  IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID,
  IM3_EQUATION_RATE_NODE,
  IM3_GUIDED_PRACTICE_ACTIVITY_ID,
  IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID,
  IM3_PILOT_NODE,
  IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID,
  IM3_TWO_REAL_SOLUTIONS_NODE,
  IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MODEL_NODE,
  IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_PROFIT_MAXIMUM_NODE,
  IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID,
  IM3_MAXIMUM_READING_NODE,
  IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID,
  IM3_COMPARE_MAXIMUM_NODE,
  IM3_SYMMETRY_GUIDED_ACTIVITY_ID,
  IM3_SYMMETRY_NODE,
} from "@/lib/practice/learning-evidence-pilot";

export interface PracticeCardRendererProps {
  queueItem: ResolvedQueueItem;
  currentIndex: number;
  totalCount: number;
  onSubmit: (envelope: PracticeSubmissionEnvelope) => void;
  onComplete: () => void;
}

/**
 * Renders a single practice card with progress bar and activity renderer.
 *
 * @param {PracticeCardRendererProps} props - Practice card renderer configuration.
 * @returns {JSX.Element} A practice card with submission handling.
 */
export function PracticeCardRenderer({
  queueItem,
  currentIndex,
  totalCount,
  onSubmit,
  onComplete,
}: PracticeCardRendererProps) {
  const { getTiming } = usePracticeTiming();
  const isGuidedCard =
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_GUIDED_PRACTICE_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_PILOT_NODE) ||
    (queueItem.componentKey === "rate-of-change-calculator" &&
      queueItem.props.stableActivityId === IM3_EQUATION_RATE_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_EQUATION_RATE_NODE) ||
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_DOMAIN_RANGE_NODE) ||
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_DOMAIN_RANGE_GUIDED_SEED_2_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_DOMAIN_RANGE_NODE &&
      queueItem.props.srsEligible === true) ||
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_MAXIMUM_READING_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_MAXIMUM_READING_NODE &&
      queueItem.props.srsEligible === true) ||
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_SYMMETRY_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_SYMMETRY_NODE &&
      queueItem.props.srsEligible === true) ||
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_COMPARE_MAXIMUM_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_COMPARE_MAXIMUM_NODE &&
      queueItem.props.srsEligible === true) ||
    (queueItem.componentKey === "fill-in-the-blank" &&
      queueItem.props.stableActivityId === IM3_PROFIT_MODEL_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_PROFIT_MODEL_NODE) ||
    (queueItem.componentKey === "fill-in-the-blank" &&
      queueItem.props.stableActivityId === IM3_PROFIT_MAXIMUM_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_PROFIT_MAXIMUM_NODE) ||
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_GRAPH_GUIDED_SEED_2_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_PILOT_NODE &&
      queueItem.props.srsEligible === true) ||
    (queueItem.componentKey === "graphing-explorer" &&
      queueItem.props.stableActivityId === IM3_TWO_REAL_SOLUTIONS_GUIDED_ACTIVITY_ID &&
      queueItem.props.masteryNodeId === IM3_TWO_REAL_SOLUTIONS_NODE &&
      queueItem.props.srsEligible === true);

  const handleSubmit = useCallback(
    (payload: unknown) => {
      const activityId = queueItem.props.activityId;
      if (typeof activityId !== "string" || !activityId) {
        console.error("PracticeCardRenderer: missing or invalid activityId in queue item props");
        return;
      }

      const existingEnvelope = practiceSubmissionEnvelopeSchema.safeParse(payload);
      if (existingEnvelope.success) {
        onSubmit(
          buildPracticeSubmissionEnvelope({
            activityId,
            mode: existingEnvelope.data.mode,
            status: existingEnvelope.data.status,
            attemptNumber: existingEnvelope.data.attemptNumber,
            submittedAt: existingEnvelope.data.submittedAt,
            answers: existingEnvelope.data.answers,
            parts: existingEnvelope.data.parts,
            artifact: existingEnvelope.data.artifact,
            interactionHistory: existingEnvelope.data.interactionHistory,
            analytics: existingEnvelope.data.analytics,
            studentFeedback: existingEnvelope.data.studentFeedback,
            teacherSummary: existingEnvelope.data.teacherSummary,
            timing: existingEnvelope.data.timing ?? getTiming() ?? undefined,
          }),
        );
        return;
      }

      const envelope = buildPracticeSubmissionEnvelope({
        activityId,
        mode: isGuidedCard ? "guided_practice" : "independent_practice",
        answers: payload as Record<string, unknown>,
        timing: getTiming() ?? undefined,
      });
      onSubmit(envelope);
    },
    [getTiming, isGuidedCard, onSubmit, queueItem.props.activityId],
  );

  return (
    <div className="space-y-6" data-testid="practice-card-renderer">
      <CardProgressBar currentIndex={currentIndex} totalCount={totalCount} />
      <div className="rounded-xl border border-border bg-card p-6">
        <ActivityRenderer
          componentKey={queueItem.componentKey}
          activityId={
            typeof queueItem.props.activityId === "string" ? queueItem.props.activityId : ""
          }
          mode={isGuidedCard ? "guided" : "practice"}
          activityProps={queueItem.props}
          onSubmit={handleSubmit}
          onComplete={onComplete}
        />
      </div>
    </div>
  );
}
