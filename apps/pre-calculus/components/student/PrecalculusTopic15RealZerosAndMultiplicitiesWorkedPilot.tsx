"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { RealZerosAndMultiplicitiesActivity } from "@math-platform/activity-components";
import type { RealZerosAndMultiplicitiesProps } from "@math-platform/math-content";
import { realZerosAndMultiplicitiesSchema } from "@math-platform/math-content";
import { generateTopic15RealZerosAndMultiplicitiesOutput } from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

type WorkedProps = Extract<RealZerosAndMultiplicitiesProps, { presentationMode: "worked_example" }>;
type Pair = { zero: number; multiplicity: number };
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

const sourceOutput = generateTopic15RealZerosAndMultiplicitiesOutput(0);
const sourceAnswer = sourceOutput.expectedAnswer as {
  a: readonly Pair[];
  b: readonly Pair[];
};
const reviewUrl =
  "/api/activities/precalculus-topic-1-5-real-zeros-and-multiplicities-worked/submissions";
const safeError = "Unable to save the Topic 1.5 real zeros and multiplicities Worked review.";
const finalAnswer =
  "For f, the real zeros are x = -1 (multiplicity 1), x = 0 (multiplicity 3), and x = 4 (multiplicity 2). For g, x = -2 (multiplicity 1) and x = 2 (multiplicity 5).";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-5-real-zeros-and-multiplicities-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    !Number.isFinite(Date.parse(value.submittedAt)) ||
    new Date(value.submittedAt).toISOString() !== value.submittedAt
  ) {
    throw new Error(safeError);
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic15RealZerosAndMultiplicitiesWorkedPilot() {
  const publicProps = realZerosAndMultiplicitiesSchema.parse(sourceOutput.data.rendererProps);
  const workedProps = realZerosAndMultiplicitiesSchema.parse({
    ...publicProps,
    presentationMode: "worked_example",
    correctAnswers: {
      a: sourceAnswer.a.map((pair) => ({ ...pair })),
      b: sourceAnswer.b.map((pair) => ({ ...pair })),
    },
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer,
  }) as WorkedProps;

  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
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
      activityId: PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {
        a: sourceAnswer.a.map((pair) => ({ ...pair })),
        b: sourceAnswer.b.map((pair) => ({ ...pair })),
      },
      parts: [
        { partId: "a", rawAnswer: sourceAnswer.a.map((pair) => ({ ...pair })) },
        { partId: "b", rawAnswer: sourceAnswer.b.map((pair) => ({ ...pair })) },
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
      data-testid="precalc-topic-1-5-real-zeros-and-multiplicities-worked"
    >
      <p>
        Review the factored forms, real zeros, multiplicities, and reasoning. Then save this Worked
        review.
      </p>
      <RealZerosAndMultiplicitiesActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_15_REAL_ZEROS_AND_MULTIPLICITIES_WORKED_ACTIVITY_ID}
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
