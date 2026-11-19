"use client";

import { useId, useState } from "react";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { QuadraticNegativeRateIntervalChoiceProps } from "../../schemas";

export type QuadraticNegativeRateIntervalChoiceActivityProps =
  QuadraticNegativeRateIntervalChoiceProps & {
    activityId: string;
    mode: "teaching" | "guided" | "practice";
    onSubmit?: (payload: unknown) => void;
    onComplete?: () => void;
  };

function expectedPresentationMode(mode: QuadraticNegativeRateIntervalChoiceActivityProps["mode"]) {
  if (mode === "teaching") return "worked_example" as const;
  if (mode === "guided") return "guided_practice" as const;
  return "independent_practice" as const;
}

function formatInput(value: number): string {
  return Number.isInteger(value) ? String(value) : value.toFixed(3);
}

export function QuadraticNegativeRateIntervalChoiceActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: QuadraticNegativeRateIntervalChoiceActivityProps) {
  const instanceId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const expectedMode = expectedPresentationMode(mode);
  const isModeMatch = props.presentationMode === expectedMode;
  const title =
    props.title ??
    (mode === "teaching"
      ? "Worked Example: Identify Negative-Rate Intervals"
      : mode === "guided"
        ? "Guided Practice: Identify Negative-Rate Intervals"
        : "Independent Practice: Identify Negative-Rate Intervals");

  const submit = () => {
    if (!selectedOptionId || !isModeMatch || mode === "teaching") return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === "guided" ? "guided_practice" : "independent_practice",
      answers: { selectedOptionId },
      parts: [{ partId: "selectedOptionId", rawAnswer: selectedOptionId }],
    });
    onSubmit?.(envelope);
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-4 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">
        {title}
      </h2>
      <p>{props.prompt}</p>

      {!isModeMatch ? (
        <p role="alert">This activity is unavailable for this presentation mode.</p>
      ) : (
        <>
          <fieldset
            aria-describedby={
              props.presentationMode === "guided_practice" ? `${instanceId}-field-help` : undefined
            }
          >
            <legend>Select the interval statement.</legend>
            <div className="grid gap-3 sm:grid-cols-2">
              {props.options.map((option) => {
                const isWorked = props.presentationMode === "worked_example";
                const checked = isWorked
                  ? option.id === props.correctOptionId
                  : option.id === selectedOptionId;
                return (
                  <label key={option.id} className="flex items-start gap-2">
                    <input
                      type="radio"
                      name={`${activityId}-${instanceId}-option`}
                      value={option.id}
                      checked={checked}
                      disabled={isWorked}
                      onChange={() => setSelectedOptionId(option.id)}
                    />
                    <span className="font-semibold">{option.label}</span>{" "}
                    <span>{`${props.functionName} has a ${option.rateSign} rate of change on ${formatInput(option.startInput)} ≤ x ≤ ${formatInput(option.endInput)}.`}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>

          {props.presentationMode === "worked_example" ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.steps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ol>
              <p>
                <strong>Answer:</strong> {props.finalAnswer}
              </p>
            </>
          ) : props.presentationMode === "guided_practice" ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.guidedSteps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ol>
              <p id={`${instanceId}-field-help`}>{props.fieldHelp}</p>
              <button type="button" onClick={submit} disabled={!selectedOptionId}>
                Submit answer
              </button>
            </>
          ) : (
            <button type="button" onClick={submit} disabled={!selectedOptionId}>
              Submit answer
            </button>
          )}
        </>
      )}
    </section>
  );
}
