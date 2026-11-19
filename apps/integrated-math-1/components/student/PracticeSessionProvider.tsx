"use client";

import { useRef, useState } from "react";
import { FillInTheBlank, type FillInTheBlankProps } from "@math-platform/activity-components";

import type { SrsSession } from "@math-platform/srs-engine/contract";
import type { ResolvedQueueItem } from "@/convex/queue/queue";

interface PracticeSessionProviderProps {
  session: SrsSession;
  queue: ResolvedQueueItem[];
  studentId: string;
  pilotActivities?: Array<{
    activityId: string;
    mode: "worked_example" | "guided_practice" | "independent_practice";
    componentKey: string;
    props: Record<string, unknown>;
  }>;
}

export function PracticeSessionProvider({
  session,
  queue,
  studentId,
  pilotActivities = [],
}: PracticeSessionProviderProps) {
  const [itemIndex, setItemIndex] = useState(0);
  const [serverResult, setServerResult] = useState<{ score: number; maxScore: number } | null>(
    null,
  );
  const [workedPending, setWorkedPending] = useState(false);
  const [workedError, setWorkedError] = useState<string | null>(null);
  const keys = useRef(new Map<string, string>());
  const pilotIds = new Set(pilotActivities.map((activity) => activity.activityId));
  const activeItems =
    pilotActivities.length === 3
      ? [
          ...pilotActivities,
          ...queue.filter(
            (queueItem) => !queueItem.activityId || !pilotIds.has(queueItem.activityId),
          ),
        ]
      : queue;
  const item = activeItems[itemIndex];

  const submit = async (payload: unknown) => {
    if (!item?.activityId || !payload || typeof payload !== "object")
      throw new Error("Invalid practice submission");
    const parts = (
      payload as {
        parts?: Array<{ rawAnswer?: unknown; hintsUsed?: number; revealStepsSeen?: number }>;
      }
    ).parts;
    const rawResponse = parts?.[0]?.rawAnswer;
    const hintsUsed = parts?.[0]?.hintsUsed ?? 0;
    const revealStepsSeen = parts?.[0]?.revealStepsSeen ?? 0;
    if (typeof rawResponse !== "string") throw new Error("Invalid practice response");
    let key = keys.current.get(item.activityId);
    if (!key) {
      key = crypto.randomUUID();
      keys.current.set(item.activityId, key);
    }
    const response = await fetch(
      `/api/activities/${encodeURIComponent(item.activityId)}/submissions`,
      {
        method: "POST",
        headers: { "content-type": "application/json", "Idempotency-Key": key },
        body: JSON.stringify({ rawResponse, hintsUsed, revealStepsSeen }),
      },
    );
    if (!response.ok) throw new Error("Unable to save the practice response");
    const result = (await response.json()) as {
      kind?: unknown;
      score?: unknown;
      maxScore?: unknown;
    };
    if (item.mode === "worked_example") {
      if (result.kind !== "acknowledged") throw new Error("Invalid server acknowledgement");
      keys.current.delete(item.activityId);
      return;
    }
    if (result.kind !== "graded") throw new Error("Invalid server grade");
    if (typeof result.score !== "number" || typeof result.maxScore !== "number")
      throw new Error("Invalid server grade");
    setServerResult({ score: result.score, maxScore: result.maxScore });
    keys.current.delete(item.activityId);
    if (result.score < result.maxScore) throw new Error("Try again before you continue");
  };

  if (activeItems.length > 0 && itemIndex >= activeItems.length) {
    return <p role="status">Practice complete.</p>;
  }

  if (item?.componentKey === "fill-in-the-blank" && item.activityId) {
    const acknowledgeWorked = async () => {
      if (workedPending) return;
      setWorkedPending(true);
      setWorkedError(null);
      try {
        await submit({ parts: [{ rawAnswer: "", hintsUsed: 0, revealStepsSeen: 0 }] });
        setServerResult(null);
        setItemIndex((index) => index + 1);
      } catch {
        setWorkedError("Unable to save the practice response. Try again.");
      } finally {
        setWorkedPending(false);
      }
    };
    return (
      <div
        data-testid="practice-session-provider"
        data-student-id={studentId}
        data-queue-length={queue.length}
      >
        <span data-testid="session-id">{session.sessionId}</span>
        <FillInTheBlank
          key={item.activityId}
          {...(item.props as unknown as FillInTheBlankProps)}
          activityId={item.activityId}
          mode={
            item.mode === "worked_example"
              ? "teaching"
              : item.mode === "guided_practice"
                ? "guided"
                : "practice"
          }
          onSubmit={submit}
          onComplete={() => {
            keys.current.delete(item.activityId!);
            setServerResult(null);
            setItemIndex((index) => index + 1);
          }}
        />
        {item.mode === "worked_example" && (
          <button type="button" disabled={workedPending} onClick={() => void acknowledgeWorked()}>
            Continue to guided practice
          </button>
        )}
        {workedError && <p role="alert">{workedError}</p>}
        {serverResult && (
          <p role="status">
            Score: {serverResult.score} / {serverResult.maxScore}
          </p>
        )}
      </div>
    );
  }
  return (
    <div
      data-testid="practice-session-provider"
      data-student-id={studentId}
      data-queue-length={queue.length}
    >
      <span data-testid="session-id">{session.sessionId}</span>
      <span data-testid="first-objective-id">
        {item && "card" in item ? item.card.objectiveId : ""}
      </span>
    </div>
  );
}
