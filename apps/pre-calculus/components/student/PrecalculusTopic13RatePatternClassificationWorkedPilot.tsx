"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { RatePatternClassificationActivity } from "@math-platform/activity-components";
import type { RatePatternClassificationProps } from "@math-platform/math-content";
import {
  generateTopic13RatePatternClassification,
  generateTopic13RatePatternClassificationOutput,
} from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const sourceVariant = generateTopic13RatePatternClassification(0);
const sourceOutput = generateTopic13RatePatternClassificationOutput(0);
const finalAnswer = "a) quadratic; b) linear; c) quadratic.";
const createUrl =
  "/api/activities/precalculus-topic-1-3-rate-pattern-classification-worked/submissions";
type WorkedProps = Extract<RatePatternClassificationProps, { presentationMode: "worked_example" }>;
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-3-rate-pattern-classification-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    throw new Error("Invalid server Worked review result");
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic13RatePatternClassificationWorkedPilot() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  const workedProps: WorkedProps = {
    prompt: sourceVariant.prompt,
    cases: sourceVariant.cases.map((tableCase) => ({
      id: tableCase.id,
      functionName: tableCase.functionName,
      xValues: [...tableCase.xValues],
      yValues: [...tableCase.yValues],
    })),
    presentationMode: "worked_example",
    correctClassifications: {
      a: sourceOutput.expectedAnswer.a as WorkedProps["correctClassifications"]["a"],
      b: sourceOutput.expectedAnswer.b as WorkedProps["correctClassifications"]["b"],
      c: sourceOutput.expectedAnswer.c as WorkedProps["correctClassifications"]["c"],
    },
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer,
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
        body: JSON.stringify({
          a: sourceOutput.expectedAnswer.a,
          b: sourceOutput.expectedAnswer.b,
          c: sourceOutput.expectedAnswer.c,
        }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error("Worked review request failed");
      const submission = validateSubmissionResult(body);
      setStatus("saved");
      router.refresh();
      setMessage(`Worked example review saved (attempt ${submission.attemptOrdinal}).`);
    } catch {
      setStatus("error");
      setMessage("Unable to save the rate-pattern classification Worked example review.");
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-13-rate-pattern-classification-worked"
    >
      <RatePatternClassificationActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_13_RATE_PATTERN_CLASSIFICATION_WORKED_ACTIVITY_ID}
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
            ? "Retry rate-pattern classification Worked example review"
            : status === "saved"
              ? "Rate-pattern classification Worked example reviewed"
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
