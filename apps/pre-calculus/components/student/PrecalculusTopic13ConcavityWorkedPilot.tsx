"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { ConcavityFromRateChangeActivity } from "@math-platform/activity-components";
import type { ConcavityFromRateChangeProps } from "@math-platform/math-content";
import {
  generateTopic13ConcavityFromRateChange,
  generateTopic13ConcavityFromRateChangeOutput,
} from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const sourceVariant = generateTopic13ConcavityFromRateChange(0);
const sourceOutput = generateTopic13ConcavityFromRateChangeOutput(0);
const createUrl = "/api/activities/precalculus-topic-1-3-concavity-worked/submissions";
const sourceClassification = sourceOutput.expectedAnswer.classification as "concave_up";
type WorkedProps = Extract<ConcavityFromRateChangeProps, { presentationMode: "worked_example" }>;
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-3-concavity-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function hasExactKeys(value: Record<string, unknown>, keys: string): boolean {
  return Object.keys(value).sort().join("|") === keys;
}

function validateSubmissionResult(value: unknown): SubmissionResult {
  if (
    !isRecord(value) ||
    !hasExactKeys(value, "attemptOrdinal|submissionId|submittedAt") ||
    typeof value.submissionId !== "string" ||
    value.submissionId.trim().length === 0 ||
    typeof value.attemptOrdinal !== "number" ||
    !Number.isInteger(value.attemptOrdinal) ||
    value.attemptOrdinal < 1 ||
    typeof value.submittedAt !== "string" ||
    !Number.isFinite(Date.parse(value.submittedAt))
  ) {
    throw new Error("Invalid server Topic 1.3 concavity Worked review result");
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic13ConcavityWorkedPilot() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const workedProps: WorkedProps = {
    prompt: sourceVariant.prompt,
    functionName: sourceVariant.functionName,
    xValues: [...sourceVariant.xValues],
    yValues: [...sourceVariant.yValues],
    presentationMode: "worked_example",
    correctClassification: sourceClassification,
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer: "concave up.",
  };

  async function submit() {
    if (status === "saving" || status === "saved" || inFlightRef.current) return;
    inFlightRef.current = true;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch(createUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify({ classification: sourceClassification }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error("Worked review request failed");
      const submission = validateSubmissionResult(body);
      setStatus("saved");
      router.refresh();
      setMessage(`Concavity Worked example review saved (attempt ${submission.attemptOrdinal}).`);
    } catch {
      setStatus("error");
      setMessage("Unable to save the Topic 1.3 concavity Worked example review.");
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-1-3-concavity-worked"
    >
      <ConcavityFromRateChangeActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_13_CONCAVITY_WORKED_ACTIVITY_ID}
        mode="teaching"
      />
      <button
        type="button"
        className="btn-primary mt-6"
        disabled={status === "saving" || status === "saved"}
        onClick={() => {
          void submit();
        }}
      >
        {status === "saving"
          ? "Saving…"
          : status === "error"
            ? "Retry Topic 1.3 concavity Worked example review"
            : status === "saved"
              ? "Concavity Worked example reviewed"
              : "Mark worked example reviewed"}
      </button>
      {status === "saved" && message && (
        <p className="mt-4" role="status">
          {message}
        </p>
      )}
      {status === "error" && message && (
        <div className="mt-4" role="alert">
          <p>{message}</p>
        </div>
      )}
    </section>
  );
}
