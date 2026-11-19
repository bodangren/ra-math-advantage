"use client";

import { useId, useState } from "react";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { PolynomialInequalitySignChartProps } from "../../schemas";

export type PolynomialInequalitySignChartActivityProps = PolynomialInequalitySignChartProps & {
  activityId: string;
  mode: "teaching" | "guided" | "practice";
  onSubmit?: (payload: unknown) => void;
  onComplete?: () => void;
};

function expectedPresentationMode(
  mode: PolynomialInequalitySignChartActivityProps["mode"],
): PolynomialInequalitySignChartProps["presentationMode"] | null {
  if (mode === "teaching") return "worked_example";
  if (mode === "guided") return "guided_practice";
  if (mode === "practice") return "independent_practice";
  return null;
}

function formatBound(value: number, isLeft: boolean): string {
  if (!Number.isFinite(value)) return isLeft ? "-∞" : "∞";
  return String(value);
}

export function PolynomialInequalitySignChartActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PolynomialInequalitySignChartActivityProps) {
  const instanceId = useId();
  const [rootValues, setRootValues] = useState<string[]>(() =>
    Array(props.distinctRootCount).fill(""),
  );
  const [intervalSigns, setIntervalSigns] = useState<string[]>(() =>
    Array(props.distinctRootCount + 1).fill(""),
  );
  const [solution, setSolution] = useState("");
  const expectedMode = expectedPresentationMode(mode);
  const rootsHelpId = `${instanceId}-roots-help`;
  const intervalSignsHelpId = `${instanceId}-interval-signs-help`;
  const solutionHelpId = `${instanceId}-solution-help`;

  if (!expectedMode || props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title =
    props.title ??
    (mode === "teaching"
      ? "Worked Example: Polynomial Inequality Sign Chart"
      : mode === "guided"
        ? "Guided Practice: Polynomial Inequality Sign Chart"
        : "Independent Practice: Polynomial Inequality Sign Chart");
  const isWorked = props.presentationMode === "worked_example";
  const parsedRoots = rootValues.map((value) => Number(value));
  const hasFiniteRoots = rootValues.every(
    (value, index) => value.trim().length > 0 && Number.isFinite(parsedRoots[index]),
  );
  const sortedRoots = hasFiniteRoots ? [...parsedRoots].sort((left, right) => left - right) : [];
  const canSubmit =
    !isWorked &&
    hasFiniteRoots &&
    intervalSigns.every((sign) => sign === "+" || sign === "-") &&
    solution.trim().length > 0;
  const submit = () => {
    if (!canSubmit || isWorked) return;
    const answers = {
      roots: parsedRoots,
      intervalSigns,
      solution,
    };
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === "guided" ? "guided_practice" : "independent_practice",
      answers,
      parts: [
        { partId: "roots", rawAnswer: answers.roots },
        { partId: "intervalSigns", rawAnswer: answers.intervalSigns },
        { partId: "solution", rawAnswer: answers.solution },
      ],
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
      <p>{`${props.expression} ${props.operator} 0`}</p>

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
              <div className="grid gap-2">
                <p>Field help</p>
                <p id={rootsHelpId}>{props.fieldHelp.roots}</p>
                <p id={intervalSignsHelpId}>{props.fieldHelp.intervalSigns}</p>
                <p id={solutionHelpId}>{props.fieldHelp.solution}</p>
              </div>
            </>
          ) : null}

          <div className="grid gap-4">
            {rootValues.map((value, index) => {
              const inputId = `${instanceId}-root-${index}`;
              return (
                <label key={inputId} htmlFor={inputId} className="grid gap-2">
                  <span>{`Root ${index + 1}`}</span>
                  <input
                    id={inputId}
                    type="number"
                    step="any"
                    value={value}
                    aria-describedby={
                      props.presentationMode === "guided_practice" ? rootsHelpId : undefined
                    }
                    onChange={(event) =>
                      setRootValues((current) =>
                        current.map((root, rootIndex) =>
                          rootIndex === index ? event.target.value : root,
                        ),
                      )
                    }
                    className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1 text-foreground"
                  />
                </label>
              );
            })}

            {intervalSigns.map((sign, index) => {
              const left = index === 0 ? Number.NEGATIVE_INFINITY : sortedRoots[index - 1];
              const right =
                index === sortedRoots.length ? Number.POSITIVE_INFINITY : sortedRoots[index];
              const intervalLabel = hasFiniteRoots
                ? `(${formatBound(left, true)}, ${formatBound(right, false)})`
                : `Interval ${index + 1}`;
              const selectId = `${instanceId}-sign-${index}`;
              return (
                <label key={selectId} htmlFor={selectId} className="grid gap-2">
                  <span>{`Sign for ${intervalLabel}`}</span>
                  <select
                    id={selectId}
                    aria-label={`Sign for ${intervalLabel}`}
                    value={sign}
                    aria-describedby={
                      props.presentationMode === "guided_practice" ? intervalSignsHelpId : undefined
                    }
                    onChange={(event) =>
                      setIntervalSigns((current) =>
                        current.map((currentSign, signIndex) =>
                          signIndex === index ? event.target.value : currentSign,
                        ),
                      )
                    }
                    className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1 text-foreground"
                  >
                    <option value="">Select a sign</option>
                    <option value="+">+</option>
                    <option value="-">-</option>
                  </select>
                </label>
              );
            })}

            <label htmlFor={`${instanceId}-solution`} className="grid gap-2">
              <span>Solution interval union</span>
              <input
                id={`${instanceId}-solution`}
                type="text"
                value={solution}
                aria-describedby={
                  props.presentationMode === "guided_practice" ? solutionHelpId : undefined
                }
                onChange={(event) => setSolution(event.target.value)}
                className="min-w-0 w-full rounded-md border border-border bg-background px-2 py-1 text-foreground"
              />
            </label>
          </div>

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
