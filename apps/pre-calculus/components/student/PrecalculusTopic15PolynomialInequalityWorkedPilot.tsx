"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { PolynomialInequalitySignChartActivity } from "@math-platform/activity-components";
import { polynomialInequalitySignChartSchema } from "@math-platform/math-content";
import { generateTopic15PolynomialInequalityOutput } from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

type PracticeStatus = "idle" | "saving" | "saved" | "error";

const sourceOutput = generateTopic15PolynomialInequalityOutput(0);
const reviewUrl = "/api/activities/precalculus-topic-1-5-polynomial-inequality-worked/submissions";
const safeError = "Unable to save the Topic 1.5 polynomial inequality Worked review.";
const finalAnswer = `The solution is ${sourceOutput.expectedAnswer.solution}.`;

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-5-polynomial-inequality-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    !Number.isSafeInteger(value.attemptOrdinal) ||
    value.attemptOrdinal < 1 ||
    typeof value.submittedAt !== "string" ||
    !Number.isFinite(Date.parse(value.submittedAt)) ||
    new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) {
    throw new Error(safeError);
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic15PolynomialInequalityWorkedPilot() {
  const rendererProps = sourceOutput.data.rendererProps as Record<string, unknown>;
  const workedProps = polynomialInequalitySignChartSchema.parse({
    ...rendererProps,
    presentationMode: "worked_example",
    correctAnswers: sourceOutput.expectedAnswer,
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer,
  });
  const router = useRouter();
  const [status, setStatus] = useState<PracticeStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const requestBodyRef = useRef<string | null>(null);
  const inFlightRef = useRef(false);

  async function submit() {
    if (status === "saving" || status === "saved" || inFlightRef.current) return;
    inFlightRef.current = true;
    const idempotencyKey = idempotencyKeyRef.current ?? createIdempotencyKey();
    idempotencyKeyRef.current = idempotencyKey;
    const requestBody = (requestBodyRef.current ??= JSON.stringify({
      contractVersion: "practice.v1",
      activityId: PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: sourceOutput.expectedAnswer,
      parts: [
        { partId: "roots", rawAnswer: sourceOutput.expectedAnswer.roots },
        { partId: "intervalSigns", rawAnswer: sourceOutput.expectedAnswer.intervalSigns },
        { partId: "solution", rawAnswer: sourceOutput.expectedAnswer.solution },
      ],
    }));
    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch(reviewUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: requestBody,
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(safeError);
      const submission = validateSubmissionResult(body);
      setStatus("saved");
      router.refresh();
      setMessage(`Worked example review saved (attempt ${submission.attemptOrdinal}).`);
    } catch {
      setStatus("error");
      setMessage(safeError);
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-1-5-polynomial-inequality-worked"
    >
      <p>
        Review the roots, sign chart, strict endpoint rule, and interval union. Then save this
        Worked review.
      </p>
      <PolynomialInequalitySignChartActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_15_POLYNOMIAL_INEQUALITY_WORKED_ACTIVITY_ID}
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
            ? "Retry Worked review"
            : status === "saved"
              ? "Worked review saved"
              : "Save Worked review"}
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
