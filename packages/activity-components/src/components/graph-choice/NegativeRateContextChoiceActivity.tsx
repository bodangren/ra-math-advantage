"use client";

import { useId, useState } from "react";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { NegativeRateContextChoiceProps } from "../../schemas";

export type NegativeRateContextChoiceActivityProps = NegativeRateContextChoiceProps & {
  activityId: string;
  mode: "teaching" | "guided" | "practice";
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

function expectedPresentationMode(mode: NegativeRateContextChoiceActivityProps["mode"]) {
  if (mode === "teaching") return "worked_example" as const;
  if (mode === "guided") return "guided_practice" as const;
  return "independent_practice" as const;
}

export function NegativeRateContextChoiceActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: NegativeRateContextChoiceActivityProps) {
  const instanceId = useId();
  const [selectedOptionId, setSelectedOptionId] = useState("");
  const expectedMode = expectedPresentationMode(mode);
  const isModeMatch = props.presentationMode === expectedMode;
  const title =
    props.title ??
    (mode === "teaching"
      ? "Worked Example: Model a Negative Rate Context"
      : mode === "guided"
        ? "Guided Practice: Model a Negative Rate Context"
        : "Independent Practice: Model a Negative Rate Context");

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
            <legend>Select the variable definitions.</legend>
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
                    <span>
                      <span className="block">{option.label}</span>
                      <span className="block">x = {option.xDefinition}</span>
                      <span className="block">y = {option.yDefinition}</span>
                    </span>
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
