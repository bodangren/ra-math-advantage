"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { RateSignAndTrendFromGraphActivity } from "@math-platform/activity-components";
import type { RateSignAndTrendFromGraphProps } from "@math-platform/math-content";
import { rateSignAndTrendFromGraphSchema } from "@math-platform/math-content";
import {
  generateTopic14RateSignAndTrend,
  generateTopic14RateSignAndTrendOutput,
} from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

type WorkedProps = Extract<RateSignAndTrendFromGraphProps, { presentationMode: "worked_example" }>;
type AnswerId = keyof WorkedProps["correctAnswers"];
type WorkedSubmissionData = {
  contractVersion: "practice.v1";
  activityId: typeof PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID;
  mode: "worked_example";
  status: "submitted";
  attemptNumber: number;
  submittedAt: string;
  answers: Record<AnswerId, string>;
  parts: ReadonlyArray<{ partId: AnswerId; rawAnswer: string }>;
};
type SubmissionResult = {
  submissionId: string;
  attemptOrdinal: number;
  submittedAt: string;
};

const sourceVariant = generateTopic14RateSignAndTrend(0);
const sourceOutput = generateTopic14RateSignAndTrendOutput(0);
const sourceAnswer = sourceOutput.expectedAnswer as Record<AnswerId, string>;
const finalAnswer = `The rate of change is ${sourceAnswer.rateSign} and ${sourceAnswer.rateTrend} on (${sourceVariant.interval[0]}, ${sourceVariant.interval[1]}).`;
const reviewUrl = "/api/activities/precalculus-topic-1-4-rate-sign-and-trend-worked/submissions";
const safeError = "Unable to save the Topic 1.4 rate sign and trend Worked review.";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-topic-1-4-rate-sign-and-trend-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
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

export function PrecalculusTopic14RateSignAndTrendWorkedPilot() {
  const publicProps = rateSignAndTrendFromGraphSchema.parse({
    prompt: sourceVariant.prompt,
    functionName: sourceVariant.functionName,
    interval: [sourceVariant.interval[0], sourceVariant.interval[1]],
    points: sourceVariant.points.map((point) => ({ x: point.x, y: point.y })),
    presentationMode: "independent_practice",
  });
  const workedProps = rateSignAndTrendFromGraphSchema.parse({
    ...publicProps,
    presentationMode: "worked_example",
    correctAnswers: {
      rateSign: sourceAnswer.rateSign,
      rateTrend: sourceAnswer.rateTrend,
    },
    steps: sourceOutput.solutionSteps.map((step) => step.description),
    finalAnswer,
  }) as WorkedProps;

  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);
  const requestBodyRef = useRef<WorkedSubmissionData | null>(null);
  const inFlightRef = useRef(false);

  async function submit() {
    if (status === "saving" || status === "saved" || inFlightRef.current) return;
    inFlightRef.current = true;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    requestBodyRef.current ??= Object.freeze({
      contractVersion: "practice.v1",
      activityId: PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID,
      mode: "worked_example",
      status: "submitted",
      attemptNumber: 1,
      submittedAt: new Date().toISOString(),
      answers: {
        rateSign: String(sourceAnswer.rateSign),
        rateTrend: String(sourceAnswer.rateTrend),
      },
      parts: Object.freeze([
        { partId: "rateSign" as const, rawAnswer: String(sourceAnswer.rateSign) },
        { partId: "rateTrend" as const, rawAnswer: String(sourceAnswer.rateTrend) },
      ]),
    });
    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch(reviewUrl, {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "Idempotency-Key": idempotencyKeyRef.current,
        },
        body: JSON.stringify(requestBodyRef.current),
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
      data-testid="precalc-topic-1-4-rate-sign-and-trend-worked"
    >
      <p>Review the graph, answers, and reasoning. Then save this Worked review.</p>
      <RateSignAndTrendFromGraphActivity
        {...workedProps}
        activityId={PRECALCULUS_TOPIC_14_RATE_SIGN_AND_TREND_WORKED_ACTIVITY_ID}
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
