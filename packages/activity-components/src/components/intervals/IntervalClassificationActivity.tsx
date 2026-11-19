"use client";

import { useId, useState } from "react";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { IntervalClassificationProps } from "../../schemas/interval-classification.schema";

const ANSWER_FIELDS = [
  ["increasingIntervals", "Increasing intervals"],
  ["decreasingIntervals", "Decreasing intervals"],
  ["constantIntervals", "Constant intervals"],
] as const;

export type IntervalClassificationActivityProps = IntervalClassificationProps & {
  activityId: string;
  mode: "teaching" | "guided" | "practice";
  onSubmit?: (payload: unknown) => void | Promise<void>;
  onComplete?: () => void;
};

export function IntervalClassificationActivity(props: IntervalClassificationActivityProps) {
  const {
    activityId,
    mode,
    title,
    prompt,
    domain,
    points,
    presentationMode,
    onSubmit,
    onComplete,
  } = props;
  const instanceId = useId();
  const [answers, setAnswers] = useState({
    increasingIntervals: "",
    decreasingIntervals: "",
    constantIntervals: "",
  });
  const [pending, setPending] = useState(false);
  const [submitError, setSubmitError] = useState<string>();
  const graphTitleId = `${instanceId}-graph-title`;
  const graphDescriptionId = `${instanceId}-graph-description`;
  const [domainStart, domainEnd] = domain;
  const values = points.map((point) => point.y);
  const minY = Math.min(...values);
  const maxY = Math.max(...values);
  const ySpan = maxY - minY || 1;
  const width = 320;
  const height = 110;
  const left = 24;
  const right = 10;
  const top = 10;
  const bottom = 22;
  const xScale = (x: number) =>
    left + ((x - domainStart) / (domainEnd - domainStart)) * (width - left - right);
  const yScale = (y: number) => top + ((maxY - y) / ySpan) * (height - top - bottom);
  const graphPoints = points.map((point) => `${xScale(point.x)},${yScale(point.y)}`).join(" ");

  const submit = async () => {
    if (pending) return;
    setPending(true);
    setSubmitError(undefined);
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === "practice" ? "independent_practice" : "guided_practice",
      answers,
    });
    try {
      await onSubmit?.(envelope);
    } catch {
      setSubmitError("Your answer could not be saved. Try again.");
      return;
    } finally {
      setPending(false);
    }
    onComplete?.();
  };

  return (
    <section aria-labelledby={`${instanceId}-heading`} className="space-y-6 p-4 text-foreground">
      <h2 id={`${instanceId}-heading`} className="text-xl font-semibold">
        {title ??
          (mode === "teaching"
            ? "Worked Example: Classify Graph Intervals"
            : mode === "guided"
              ? "Guided Practice: Classify Graph Intervals"
              : "Independent Practice: Classify Graph Intervals")}
      </h2>
      <p>{prompt}</p>

      <svg
        role="img"
        aria-labelledby={`${graphTitleId} ${graphDescriptionId}`}
        viewBox={`0 0 ${width} ${height}`}
        className="h-28 w-full"
      >
        <title id={graphTitleId}>Interval graph</title>
        <desc id={graphDescriptionId}>
          {`Domain ${domainStart} to ${domainEnd}. Line segments connect these points from left to right: ${points.map((point) => `(${point.x}, ${point.y})`).join(", ")}.`}
        </desc>
        <path
          d={`M${left - 14} ${height - bottom}H${width - right}M${left} ${height - bottom + 8}V${top}`}
          stroke="currentColor"
          fill="none"
          opacity="0.35"
        />
        <polyline points={graphPoints} stroke="currentColor" strokeWidth="4" fill="none" />
        <g fill="currentColor" fontSize="12" textAnchor="middle">
          {points.map((point) => (
            <text key={point.x} x={xScale(point.x)} y={height - 4}>
              {point.x}
            </text>
          ))}
        </g>
      </svg>

      {!(
        (mode === "teaching" && presentationMode === "worked_example") ||
        (mode === "guided" && presentationMode === "guided_practice") ||
        (mode === "practice" && presentationMode === "independent_practice")
      ) ? (
        <p role="alert">This activity is unavailable for this presentation mode.</p>
      ) : presentationMode === "worked_example" ? (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            {props.steps.map((step) => (
              <li key={`${step.description}-${step.expression}`}>
                <p>{step.description}</p>
                <p>{step.expression}</p>
                {step.result && <p>{step.result}</p>}
                {step.explanation && <p>{step.explanation}</p>}
              </li>
            ))}
          </ol>
          <p>
            <strong>Answer:</strong> {props.finalAnswer}
          </p>
        </>
      ) : presentationMode === "guided_practice" ? (
        <>
          <ol className="list-decimal space-y-2 pl-5">
            {props.guidedSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <div className="grid gap-4">
            {ANSWER_FIELDS.map(([field, label]) => {
              const helpId = `${instanceId}-${field}-help`;
              return (
                <label key={field} className="grid gap-2">
                  <span>{label}</span>
                  <span id={helpId}>{props.fieldHelp[field]}</span>
                  <input
                    disabled={pending}
                    aria-describedby={helpId}
                    aria-label={label}
                    value={answers[field]}
                    onChange={(event) =>
                      setAnswers((current) => ({
                        ...current,
                        [field]: event.target.value,
                      }))
                    }
                  />
                </label>
              );
            })}
          </div>
          <button type="button" disabled={pending} onClick={submit}>
            {pending ? "Saving answer…" : "Submit answer"}
          </button>
        </>
      ) : (
        <>
          <div className="grid gap-4">
            {ANSWER_FIELDS.map(([field, label]) => (
              <label key={field} className="grid gap-2">
                <span>{label}</span>
                <input
                  disabled={pending}
                  aria-label={label}
                  value={answers[field]}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [field]: event.target.value,
                    }))
                  }
                />
              </label>
            ))}
          </div>
          <button type="button" disabled={pending} onClick={submit}>
            {pending ? "Saving answer…" : "Submit answer"}
          </button>
        </>
      )}
      {submitError && <p role="alert">{submitError}</p>}
    </section>
  );
}
