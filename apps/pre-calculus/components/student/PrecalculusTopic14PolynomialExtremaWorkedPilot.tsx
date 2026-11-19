"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { PolynomialExtremaFromGraphActivity } from "@math-platform/activity-components";
import type { PolynomialExtremaFromGraphProps } from "@math-platform/math-content";
import {
  generateTopic14PolynomialExtremaFromGraph,
  generateTopic14PolynomialExtremaFromGraphOutput,
} from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

type WorkedProps = Extract<PolynomialExtremaFromGraphProps, { presentationMode: "worked_example" }>;
type AnswerId = keyof WorkedProps["correctAnswers"];
type WorkedSubmissionData = {
  contractVersion: "practice.v1";
  activityId: typeof PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID;
  mode: "worked_example";
  status: "submitted";
  attemptNumber: number;
  submittedAt: string;
  answers: Record<AnswerId, string>;
  parts: Array<{ partId: AnswerId; rawAnswer: string }>;
};
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

const sourceVariant = generateTopic14PolynomialExtremaFromGraph(0);
const sourceOutput = generateTopic14PolynomialExtremaFromGraphOutput(0);
const sourceAnswer = sourceOutput.expectedAnswer as Record<AnswerId, number>;
const FINAL_ANSWER = `x = ${sourceAnswer.relative_minimum_x} is a relative minimum and the absolute minimum; x = ${sourceAnswer.relative_maximum_x} is a relative maximum.`;
const REVIEW_URL = "/api/activities/precalculus-topic-1-4-polynomial-extrema-worked/submissions";
const SAFE_ERROR = "Unable to save the Topic 1.4 polynomial extrema Worked review.";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-4-polynomial-extrema-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    throw new Error(SAFE_ERROR);
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic14PolynomialExtremaWorkedPilot() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const requestBodyRef = useRef<WorkedSubmissionData | null>(null);
  const inFlightRef = useRef(false);

  const workedProps: WorkedProps = {
    prompt: sourceVariant.prompt,
    functionName: sourceVariant.functionName,
    coefficients: [
      sourceVariant.coefficients[0],
      sourceVariant.coefficients[1],
      sourceVariant.coefficients[2],
      sourceVariant.coefficients[3],
      sourceVariant.coefficients[4],
    ],
    domain: [sourceVariant.domain[0], sourceVariant.domain[1]],
    points: sourceVariant.points.map((point) => ({ x: point.x, y: point.y })),
    presentationMode: "worked_example",
    correctAnswers: {
      relative_minimum_x: sourceAnswer.relative_minimum_x,
      relative_maximum_x: sourceAnswer.relative_maximum_x,
      absolute_minimum_x: sourceAnswer.absolute_minimum_x,
    },
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer: FINAL_ANSWER,
  };

  async function submit() {
    if (status === "saving" || status === "saved" || inFlightRef.current) return;
    inFlightRef.current = true;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    requestBodyRef.current ??= {
      contractVersion: "practice.v1",
      activityId: PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {
        relative_minimum_x: String(sourceAnswer.relative_minimum_x),
        relative_maximum_x: String(sourceAnswer.relative_maximum_x),
        absolute_minimum_x: String(sourceAnswer.absolute_minimum_x),
      },
      parts: [
        { partId: "relative_minimum_x", rawAnswer: String(sourceAnswer.relative_minimum_x) },
        { partId: "relative_maximum_x", rawAnswer: String(sourceAnswer.relative_maximum_x) },
        { partId: "absolute_minimum_x", rawAnswer: String(sourceAnswer.absolute_minimum_x) },
      ],
    };
    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch(REVIEW_URL, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify(requestBodyRef.current),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(SAFE_ERROR);
      const submission = validateSubmissionResult(body);
      setStatus("saved");
      router.refresh();
      setMessage(`Worked example review saved (attempt ${submission.attemptOrdinal}).`);
    } catch {
      setStatus("error");
      setMessage(SAFE_ERROR);
    } finally {
      inFlightRef.current = false;
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-3xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-1-4-polynomial-extrema-worked"
    >
      <p>Review the graph, answers, and reasoning. Then save this Worked review.</p>
      <PolynomialExtremaFromGraphActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_14_POLYNOMIAL_EXTREMA_WORKED_ACTIVITY_ID}
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
