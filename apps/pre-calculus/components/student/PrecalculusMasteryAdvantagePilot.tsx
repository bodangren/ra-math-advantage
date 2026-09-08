"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { IntervalClassificationActivity } from "@math-platform/activity-components";
import type { IntervalClassificationProps } from "@math-platform/math-content/schemas";

type EvidenceResponse = {
  persisted: boolean;
  masteryApplied: boolean;
  kstApplied: false;
  delivery: "new" | "replay";
  decision: {
    idempotency: "new";
    exposureState: "awaiting_teacher_exposure" | "introduced";
    eligible: boolean;
    reason: "awaiting_teacher_exposure" | "ungraded_evidence" | "eligible";
    masteryBearing: boolean;
  };
};

export type PrecalculusPilotKnowledgeState = {
  nodeId: string;
  title: string;
  status: "not_started" | "in_progress" | "mastered" | "decaying";
  readiness: "ready" | "blocked" | "awaiting_teacher_exposure";
};

function createIdempotencyKey(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `precalc-pilot-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export type PrecalculusPilotMode = "guided_practice" | "independent_practice";

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const value: unknown = await response.json().catch(() => null);
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The server returned an invalid response.");
  }
  return value as Record<string, unknown>;
}

function hasExactKeys(value: Record<string, unknown>, keys: string[]): boolean {
  return Object.keys(value).sort().join("|") === [...keys].sort().join("|");
}

function parseSubmissionReceipt(value: Record<string, unknown>) {
  if (
    !hasExactKeys(value, [
      "submissionId",
      "score",
      "maxScore",
      "attemptOrdinal",
      "feedback",
    ]) ||
    typeof value.submissionId !== "string" ||
    value.submissionId.trim().length === 0 ||
    typeof value.score !== "number" ||
    !Number.isFinite(value.score) ||
    typeof value.maxScore !== "number" ||
    !Number.isFinite(value.maxScore) ||
    value.maxScore <= 0 ||
    value.score < 0 ||
    value.score > value.maxScore ||
    typeof value.attemptOrdinal !== "number" ||
    !Number.isInteger(value.attemptOrdinal) ||
    value.attemptOrdinal < 1 ||
    typeof value.feedback !== "string"
  )
    throw new Error("Unable to save the practice submission.");
  return value as {
    submissionId: string;
    score: number;
    maxScore: number;
    attemptOrdinal: number;
    feedback: string;
  };
}

function parseEvidenceReceipt(
  value: Record<string, unknown>,
  mode: PrecalculusPilotMode,
): EvidenceResponse {
  if (
    !hasExactKeys(value, [
      "persisted",
      "masteryApplied",
      "kstApplied",
      "delivery",
      "decision",
    ]) ||
    typeof value.decision !== "object" ||
    value.decision === null ||
    Array.isArray(value.decision)
  )
    throw new Error("Evidence delivery failed. Please retry.");
  const decision = value.decision as Record<string, unknown>;
  if (
    !hasExactKeys(decision, [
      "idempotency",
      "exposureState",
      "eligible",
      "reason",
      "masteryBearing",
    ]) ||
    decision.idempotency !== "new" ||
    typeof decision.exposureState !== "string" ||
    !["awaiting_teacher_exposure", "introduced"].includes(
      decision.exposureState,
    ) ||
    typeof decision.reason !== "string" ||
    !["awaiting_teacher_exposure", "ungraded_evidence", "eligible"].includes(
      decision.reason,
    ) ||
    typeof decision.eligible !== "boolean" ||
    typeof decision.masteryBearing !== "boolean" ||
    typeof value.persisted !== "boolean" ||
    typeof value.masteryApplied !== "boolean" ||
    value.kstApplied !== false ||
    (value.delivery !== "new" && value.delivery !== "replay")
  )
    throw new Error("Evidence delivery failed. Please retry.");
  const awaiting = decision.reason === "awaiting_teacher_exposure";
  const independent = decision.reason === "eligible";
  if (
    !awaiting &&
    (mode === "guided_practice") !== (decision.reason === "ungraded_evidence")
  )
    throw new Error("Evidence delivery failed. Please retry.");
  if (
    decision.eligible !== independent ||
    decision.masteryBearing !== independent ||
    (decision.exposureState === "introduced") !== !awaiting ||
    value.persisted !== !awaiting ||
    value.masteryApplied !== independent ||
    (awaiting && value.delivery !== "new")
  )
    throw new Error("Evidence delivery failed. Please retry.");
  return value as unknown as EvidenceResponse;
}

export function PrecalculusMasteryAdvantagePilot({
  knowledgeState,
  mode = "guided_practice",
  stableActivityId,
  activityProps,
}: {
  knowledgeState?: PrecalculusPilotKnowledgeState;
  mode?: PrecalculusPilotMode;
  stableActivityId: string;
  activityProps: IntervalClassificationProps;
}) {
  const activityId = stableActivityId;
  const [attemptKey, setAttemptKey] = useState(0);
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "ready" | "error">(
    "idle",
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [serverFeedback, setServerFeedback] = useState<string | null>(null);
  const [serverScore, setServerScore] = useState<{
    score: number;
    maxScore: number;
  } | null>(null);
  const [hasOpaqueSubmission, setHasOpaqueSubmission] = useState(false);
  const envelopeRef = useRef<Record<string, unknown> | null>(null);
  const createKeyRef = useRef<string | null>(null);
  const submissionIdRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  if (!stableActivityId || !activityProps) {
    return <p role="status">This practice activity is not available.</p>;
  }
  async function deliverEvidence(submissionId: string) {
    const response = await fetch("/api/learning-evidence/precalculus-pilot", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ submissionId }),
    });
    const body = await readJson(response);
    if (!response.ok)
      throw new Error("Evidence delivery failed. Please retry.");

    const evidence = parseEvidenceReceipt(body, mode);
    const reason = evidence.decision?.reason;
    if (
      reason === "awaiting_teacher_exposure" ||
      evidence.decision?.exposureState === "awaiting_teacher_exposure"
    ) {
      setFeedback(
        "Complete this skill with your teacher before using Mastery Advantage.",
      );
    } else if (evidence.masteryApplied === true) {
      setFeedback("Mastery Advantage updated your practice record.");
    } else {
      setFeedback("Your practice was saved.");
    }
    setStatus("ready");
    router.refresh();
  }

  async function submit(submittedEnvelope?: unknown) {
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStatus("saving");
    setFeedback(null);

    try {
      if (!envelopeRef.current) {
        if (
          !submittedEnvelope ||
          typeof submittedEnvelope !== "object" ||
          Array.isArray(submittedEnvelope)
        ) {
          throw new Error("Unable to read the practice submission.");
        }
        const envelope = submittedEnvelope as Record<string, unknown>;
        if (envelope.activityId !== activityId || envelope.mode !== mode) {
          throw new Error("Unable to read the practice submission.");
        }
        const parts = Array.isArray(envelope.parts)
          ? envelope.parts.map((part) =>
              part && typeof part === "object" && !Array.isArray(part)
                ? {
                    partId: (part as Record<string, unknown>).partId,
                    rawAnswer: (part as Record<string, unknown>).rawAnswer,
                  }
                : part,
            )
          : envelope.parts;
        envelopeRef.current = { ...envelope, parts };
        createKeyRef.current ??= createIdempotencyKey();
      }

      let submissionId = submissionIdRef.current;
      if (!submissionId) {
        createKeyRef.current ??= createIdempotencyKey();
        const response = await fetch(
          "/api/activities/precalculus-pilot/submissions",
          {
            method: "POST",
            headers: {
              "content-type": "application/json",
              "Idempotency-Key": createKeyRef.current,
            },
            body: JSON.stringify(envelopeRef.current),
          },
        );
        const body = await readJson(response);
        if (!response.ok)
          throw new Error("Unable to save the practice submission.");
        const receipt = parseSubmissionReceipt(body);
        submissionId = receipt.submissionId;
        submissionIdRef.current = submissionId;
        setHasOpaqueSubmission(true);
        setServerScore({ score: receipt.score, maxScore: receipt.maxScore });
        setServerFeedback(receipt.feedback);
      }

      await deliverEvidence(submissionId);
    } catch (error) {
      setStatus("error");
      setFeedback(
        error instanceof Error ? error.message : "Unable to save the practice.",
      );
    } finally {
      submittingRef.current = false;
    }
  }

  return (
    <section
      id={knowledgeState ? `${knowledgeState.nodeId}-${mode}` : undefined}
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
    >
      {knowledgeState && (
        <div className="mt-4 rounded border border-subtle bg-background p-3">
          <p>{knowledgeState.title}</p>
          <p>Mastery state: {knowledgeState.status.replace("_", " ")}</p>
          <p>
            Readiness:{" "}
            {knowledgeState.readiness === "blocked"
              ? "Review prerequisite skills"
              : knowledgeState.readiness === "awaiting_teacher_exposure"
                ? "Complete the classroom introduction"
                : "Ready"}
          </p>
        </div>
      )}
      <IntervalClassificationActivity
        key={attemptKey}
        {...activityProps}
        activityId={activityId}
        mode={mode === "guided_practice" ? "guided" : "practice"}
        onSubmit={submit}
      />
      {serverScore && (
        <p className="mt-4">
          {`Server score: ${serverScore.score}/${serverScore.maxScore}`}
        </p>
      )}
      {status !== "error" && (serverFeedback || feedback) && (
        <p className="mt-2" role="status">
          {[serverFeedback, feedback]
            .filter((message): message is string => Boolean(message))
            .join(" ")}
        </p>
      )}
      {status === "error" && feedback && (
        <div className="mt-4 grid gap-3" role="alert">
          <p>{feedback}</p>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              void submit();
            }}
          >
            {hasOpaqueSubmission
              ? "Retry evidence delivery"
              : "Retry submission"}
          </button>
        </div>
      )}

      {status === "ready" && (
        <button
          type="button"
          className="btn-secondary mt-4"
          onClick={() => {
            envelopeRef.current = null;
            createKeyRef.current = null;
            submissionIdRef.current = null;
            setFeedback(null);
            setServerFeedback(null);
            setServerScore(null);
            setHasOpaqueSubmission(false);
            setStatus("idle");
            setAttemptKey((key) => key + 1);
          }}
        >
          Start new attempt
        </button>
      )}
    </section>
  );
}
