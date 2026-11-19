"use client";
import { useRouter } from "next/navigation";

import { useRef, useState } from "react";

import { PhysicalContextGraphChoiceActivity } from "@math-platform/activity-components";
import type { PhysicalContextGraphChoiceProps } from "@math-platform/math-content";
import { generateTopic11PhysicalContextGraphChoice } from "@math-platform/math-content/knowledge-space";

import { PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID } from "@/lib/learning-evidence/precalc-pilot";

const sourceVariant = generateTopic11PhysicalContextGraphChoice(0);
const finalAnswer =
  "Graph D is possible because the vase is narrow, then wide, then narrow, so the height changes steeply, gently, then steeply.";

function createIdempotencyKey(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `precalc-physical-context-worked-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function readJson(response: Response): Promise<Record<string, unknown>> {
  const body: unknown = await response.json().catch(() => null);
  if (typeof body !== "object" || body === null || Array.isArray(body)) {
    throw new Error("The server returned an invalid response.");
  }
  return body as Record<string, unknown>;
}

export function PrecalculusPhysicalContextWorkedPilot() {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const idempotencyKeyRef = useRef<string | null>(null);

  const workedProps: Extract<
    PhysicalContextGraphChoiceProps,
    { presentationMode: "worked_example" }
  > = {
    prompt: sourceVariant.prompt,
    contextDescription: sourceVariant.contextDescription,
    xLabel: sourceVariant.xLabel,
    yLabel: sourceVariant.yLabel,
    containerProfile: sourceVariant.containerProfile,
    options: sourceVariant.options.map((option) => ({ ...option })),
    presentationMode: "worked_example",
    correctOptionId: sourceVariant.correctOptionId,
    steps: [...sourceVariant.reasoning],
    finalAnswer,
  };

  async function submit() {
    if (status === "saving" || status === "saved") return;
    idempotencyKeyRef.current ??= createIdempotencyKey();
    setStatus("saving");
    setMessage(null);

    try {
      const response = await fetch(
        "/api/activities/precalculus-physical-context-worked/submissions",
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": idempotencyKeyRef.current,
          },
          body: JSON.stringify({ selectedOptionId: sourceVariant.correctOptionId }),
        },
      );
      const body = await readJson(response);
      if (
        !response.ok ||
        typeof body.submissionId !== "string" ||
        body.submissionId.trim().length === 0
      ) {
        throw new Error(
          typeof body.error === "string"
            ? body.error
            : "Unable to record the Worked example review.",
        );
      }
      setStatus("saved");
      router.refresh();
      setMessage("Worked example review saved.");
    } catch (error) {
      setStatus("error");
      setMessage(
        error instanceof Error ? error.message : "Unable to record the Worked example review.",
      );
    }
  }

  return (
    <section
      className="mx-auto mt-10 max-w-2xl rounded-panel border border-subtle bg-surface p-6 shadow-sm"
      data-testid="precalc-physical-context-worked"
    >
      <PhysicalContextGraphChoiceActivity
        {...workedProps}
        activityId={PRECALCULUS_PHYSICAL_CONTEXT_WORKED_ACTIVITY_ID}
        mode="teaching"
      />
      <button
        type="button"
        className="btn-primary mt-6"
        disabled={status === "saving" || status === "saved"}
        onClick={submit}
      >
        {status === "saving"
          ? "Saving…"
          : status === "error"
            ? "Retry worked example review"
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
