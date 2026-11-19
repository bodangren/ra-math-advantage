"use client";

import { useId, useState } from "react";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { RatePatternClassificationProps } from "../../schemas";

export type RatePatternClassificationActivityProps = RatePatternClassificationProps & {
  activityId: string;
  mode: "teaching" | "guided" | "practice";
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

type Classification = "linear" | "quadratic" | "neither" | "cannot_determine";
type CaseId = "a" | "b" | "c";

const CLASSIFICATIONS: readonly { value: Classification; label: string }[] = [
  { value: "linear", label: "Linear" },
  { value: "quadratic", label: "Quadratic" },
  { value: "neither", label: "Neither" },
  { value: "cannot_determine", label: "Cannot determine" },
];

function expectedPresentationMode(mode: RatePatternClassificationActivityProps["mode"]) {
  if (mode === "teaching") return "worked_example" as const;
  if (mode === "guided") return "guided_practice" as const;
  return "independent_practice" as const;
}

function formatValue(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : value.toFixed(3).replace(/0+$/, "").replace(/\.$/, "");
}

export function RatePatternClassificationActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: RatePatternClassificationActivityProps) {
  const instanceId = useId();
  const [answers, setAnswers] = useState<Record<CaseId, Classification | "">>({
    a: "",
    b: "",
    c: "",
  });
  const expectedMode = expectedPresentationMode(mode);

  if (props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title =
    props.title ??
    (mode === "teaching"
      ? "Worked Example: Classify Rate Patterns"
      : mode === "guided"
        ? "Guided Practice: Classify Rate Patterns"
        : "Independent Practice: Classify Rate Patterns");
  const isWorked = props.presentationMode === "worked_example";
  const canSubmit = !isWorked && props.cases.every((tableCase) => answers[tableCase.id] !== "");

  const submit = () => {
    if (!canSubmit || isWorked) return;
    const answer = Object.fromEntries(
      props.cases.map((tableCase) => [tableCase.id, answers[tableCase.id]]),
    ) as Record<string, string>;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === "guided" ? "guided_practice" : "independent_practice",
      answers: answer,
      parts: props.cases.map((tableCase) => ({
        partId: tableCase.id,
        rawAnswer: answer[tableCase.id],
      })),
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

      <div className="grid gap-4">
        {props.cases.map((tableCase) => (
          <table
            key={tableCase.id}
            aria-label={`Case ${tableCase.id}: ${tableCase.functionName}`}
            className="border-collapse"
          >
            <caption className="text-left font-semibold">
              Case {tableCase.id}: {tableCase.functionName}
            </caption>
            <tbody>
              <tr>
                <th scope="row" className="border px-3 py-2 text-left">
                  x
                </th>
                {tableCase.xValues.map((value) => (
                  <td key={`x-${value}`} className="border px-3 py-2">
                    {formatValue(value)}
                  </td>
                ))}
              </tr>
              <tr>
                <th scope="row" className="border px-3 py-2 text-left">
                  {tableCase.functionName}(x)
                </th>
                {tableCase.yValues.map((value, index) => (
                  <td key={`y-${index}`} className="border px-3 py-2">
                    {formatValue(value)}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        ))}
      </div>

      <div className="grid gap-4">
        {props.cases.map((tableCase) => (
          <fieldset key={tableCase.id}>
            <legend>Classify case {tableCase.id}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {CLASSIFICATIONS.map((option) => {
                const checked = isWorked
                  ? props.correctClassifications[tableCase.id] === option.value
                  : answers[tableCase.id] === option.value;
                return (
                  <label key={option.value} className="flex items-center gap-2">
                    <input
                      type="radio"
                      name={`${activityId}-${instanceId}-${tableCase.id}`}
                      value={option.value}
                      checked={checked}
                      disabled={isWorked}
                      onChange={() =>
                        setAnswers((current) => ({
                          ...current,
                          [tableCase.id]: option.value,
                        }))
                      }
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </fieldset>
        ))}
      </div>

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
          <p>{props.fieldHelp}</p>
          <button type="button" onClick={submit} disabled={!canSubmit}>
            Submit answer
          </button>
        </>
      ) : (
        <button type="button" onClick={submit} disabled={!canSubmit}>
          Submit answer
        </button>
      )}
    </section>
  );
}
