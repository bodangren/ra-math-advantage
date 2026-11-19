"use client";

import { useId, useState } from "react";

import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { PolynomialLimitNotationEndBehaviorProps } from "../../schemas";

export type PolynomialLimitNotationEndBehaviorActivityProps =
  PolynomialLimitNotationEndBehaviorProps & {
    activityId: string;
    mode: "teaching" | "guided" | "practice";
    onSubmit?: (payload: unknown) => void;
    onComplete?: () => void;
  };

type PartId = `${"a" | "b"}_${"leftLimit" | "rightLimit"}`;
type Side = "leftLimit" | "rightLimit";
type LimitEnd = "positive_infinity" | "negative_infinity";
type Direction = "positive_infinity" | "negative_infinity" | "";

const PART_IDS: readonly PartId[] = ["a_leftLimit", "a_rightLimit", "b_leftLimit", "b_rightLimit"];

const EMPTY_ANSWERS: Record<PartId, Direction> = {
  a_leftLimit: "",
  a_rightLimit: "",
  b_leftLimit: "",
  b_rightLimit: "",
};

function expectedPresentationMode(
  mode: PolynomialLimitNotationEndBehaviorActivityProps["mode"],
): PolynomialLimitNotationEndBehaviorProps["presentationMode"] {
  if (mode === "teaching") return "worked_example";
  if (mode === "guided") return "guided_practice";
  return "independent_practice";
}

function formalFrame(functionName: string, side: Side): string {
  return `lim(x → ${side === "leftLimit" ? "−∞" : "∞"}) ${functionName}(x) =`;
}

function resultText(answer: LimitEnd): string {
  return answer === "positive_infinity" ? "Positive infinity" : "Negative infinity";
}

function resultSymbol(answer: LimitEnd): string {
  return answer === "positive_infinity" ? "∞" : "−∞";
}

export function PolynomialLimitNotationEndBehaviorActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PolynomialLimitNotationEndBehaviorActivityProps) {
  const instanceId = useId();
  const [answers, setAnswers] = useState<Record<PartId, Direction>>(EMPTY_ANSWERS);
  const expectedMode = expectedPresentationMode(mode);

  if (props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title =
    props.title ??
    (mode === "teaching"
      ? "Worked Example: Polynomial Limit Notation End Behavior"
      : mode === "guided"
        ? "Guided Practice: Polynomial Limit Notation End Behavior"
        : "Independent Practice: Polynomial Limit Notation End Behavior");
  const isWorked = props.presentationMode === "worked_example";
  const canSubmit = !isWorked && PART_IDS.every((partId) => answers[partId] !== "");

  const submit = () => {
    if (!canSubmit || isWorked) return;
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === "guided" ? "guided_practice" : "independent_practice",
      answers,
      parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answers[partId] })),
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
        {props.items.map((item) => (
          <article key={item.id} className="space-y-2">
            <h3>
              {item.id}) {item.functionName}
            </h3>
            <p>{item.expression}</p>

            {isWorked ? (
              <div className="space-y-1">
                {(["leftLimit", "rightLimit"] as const).map((side) => {
                  const partId = `${item.id}_${side}` as PartId;
                  const answer = props.correctAnswers[partId as keyof typeof props.correctAnswers];
                  return (
                    <div key={partId}>
                      <p>{`${formalFrame(item.functionName, side)} ${resultSymbol(answer)}`}</p>
                      <p>{resultText(answer)}</p>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid gap-3">
                {(["leftLimit", "rightLimit"] as const).map((side) => {
                  const partId = `${item.id}_${side}` as PartId;
                  const groupName = `${instanceId}-${activityId}-${partId}`;
                  return (
                    <fieldset key={partId} className="space-y-2 rounded border border-subtle p-3">
                      <legend>{formalFrame(item.functionName, side)}</legend>
                      <div className="flex gap-4">
                        {(["positive_infinity", "negative_infinity"] as const).map((direction) => {
                          const label = resultText(direction);
                          const inputId = `${groupName}-${direction}`;
                          return (
                            <label
                              key={direction}
                              htmlFor={inputId}
                              className="flex items-center gap-2"
                            >
                              <input
                                id={inputId}
                                type="radio"
                                name={groupName}
                                value={direction}
                                aria-label={`${item.id} ${item.functionName} ${side === "leftLimit" ? "Left end" : "Right end"} ${formalFrame(item.functionName, side)} ${label}`}
                                checked={answers[partId] === direction}
                                onChange={() =>
                                  setAnswers((current) => ({ ...current, [partId]: direction }))
                                }
                              />
                              {label}
                            </label>
                          );
                        })}
                      </div>
                    </fieldset>
                  );
                })}
              </div>
            )}
          </article>
        ))}
      </div>

      {isWorked ? (
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
      ) : (
        <>
          {props.presentationMode === "guided_practice" ? (
            <>
              <ol className="list-decimal space-y-2 pl-5">
                {props.guidedSteps.map((step, index) => (
                  <li key={`${index}-${step}`}>{step}</li>
                ))}
              </ol>
              <p>{props.fieldHelp}</p>
            </>
          ) : null}
          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className="rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:opacity-50"
          >
            Submit answer
          </button>
        </>
      )}
    </section>
  );
}
