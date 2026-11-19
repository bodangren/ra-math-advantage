"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { PolynomialDegreeLeadingCoefficientActivity } from "@math-platform/activity-components";
import type { PolynomialDegreeLeadingCoefficientProps } from "@math-platform/math-content";
import {
  generateTopic14PolynomialDegreeLeadingCoefficient,
  generateTopic14PolynomialDegreeLeadingCoefficientOutput,
} from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

type WorkedProps = Extract<
  PolynomialDegreeLeadingCoefficientProps,
  { presentationMode: "worked_example" }
>;
type AnswerId = keyof WorkedProps["correctAnswers"];
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

const sourceVariant = generateTopic14PolynomialDegreeLeadingCoefficient(0);
const sourceOutput = generateTopic14PolynomialDegreeLeadingCoefficientOutput(0);
const FINAL_ANSWER =
  "a) degree 4, leading coefficient 3; b) degree 3, leading coefficient -7; c) degree 0, leading coefficient 4.";
const REVIEW_URL =
  "/api/activities/precalculus-topic-1-4-polynomial-degree-leading-coefficient-worked/submissions";
const SAFE_ERROR =
  "Unable to save the Topic 1.4 degree and leading coefficient Worked example review.";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-4-polynomial-degree-leading-coefficient-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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
    throw new Error(SAFE_ERROR);
  }
  return value as unknown as SubmissionResult;
}

export function PrecalculusTopic14PolynomialDegreeLeadingCoefficientWorkedPilot() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const requestBodyRef = useRef<Record<AnswerId, string> | null>(null);
  const inFlightRef = useRef(false);

  const workedProps: WorkedProps = {
    prompt: sourceVariant.prompt,
    items: sourceVariant.items.map((item) => ({
      id: item.id,
      functionName: item.functionName,
      terms: item.terms.map((term) => ({
        coefficient: term.coefficient,
        exponent: term.exponent,
      })),
    })),
    presentationMode: "worked_example",
    correctAnswers: {
      a_degree: sourceOutput.expectedAnswer.a_degree as number,
      a_leading_coefficient: sourceOutput.expectedAnswer.a_leading_coefficient as number,
      b_degree: sourceOutput.expectedAnswer.b_degree as number,
      b_leading_coefficient: sourceOutput.expectedAnswer.b_leading_coefficient as number,
      c_degree: sourceOutput.expectedAnswer.c_degree as number,
      c_leading_coefficient: sourceOutput.expectedAnswer.c_leading_coefficient as number,
    },
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer: FINAL_ANSWER,
  };

  async function submit() {
    if (status === "saving" || status === "saved" || inFlightRef.current) return;
    inFlightRef.current = true;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    requestBodyRef.current ??= {
      a_degree: String(sourceOutput.expectedAnswer.a_degree),
      a_leading_coefficient: String(sourceOutput.expectedAnswer.a_leading_coefficient),
      b_degree: String(sourceOutput.expectedAnswer.b_degree),
      b_leading_coefficient: String(sourceOutput.expectedAnswer.b_leading_coefficient),
      c_degree: String(sourceOutput.expectedAnswer.c_degree),
      c_leading_coefficient: String(sourceOutput.expectedAnswer.c_leading_coefficient),
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
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-topic-14-polynomial-degree-leading-coefficient-worked"
    >
      <PolynomialDegreeLeadingCoefficientActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_14_POLYNOMIAL_DEGREE_LEADING_COEFFICIENT_WORKED_ACTIVITY_ID}
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
            ? "Retry degree and leading coefficient Worked example review"
            : status === "saved"
              ? "Worked example reviewed"
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
