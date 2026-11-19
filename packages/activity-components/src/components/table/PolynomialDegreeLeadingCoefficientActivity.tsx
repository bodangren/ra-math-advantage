"use client";

import { useId, useState } from "react";
import { buildPracticeSubmissionEnvelope } from "@math-platform/practice-core/contract";
import type { PolynomialDegreeLeadingCoefficientProps } from "../../schemas";

export type PolynomialDegreeLeadingCoefficientActivityProps =
  PolynomialDegreeLeadingCoefficientProps & {
    activityId: string;
    mode: "teaching" | "guided" | "practice";
    onSubmit?: (payload: unknown) => void;
    onComplete?: () => void;
  };

type PartId =
  | "a_degree"
  | "a_leading_coefficient"
  | "b_degree"
  | "b_leading_coefficient"
  | "c_degree"
  | "c_leading_coefficient";

const PART_IDS: readonly PartId[] = [
  "a_degree",
  "a_leading_coefficient",
  "b_degree",
  "b_leading_coefficient",
  "c_degree",
  "c_leading_coefficient",
];

function expectedPresentationMode(mode: PolynomialDegreeLeadingCoefficientActivityProps["mode"]) {
  if (mode === "teaching") return "worked_example" as const;
  if (mode === "guided") return "guided_practice" as const;
  return "independent_practice" as const;
}

function formatCoefficient(value: number): string {
  return String(Math.abs(value));
}

function formatTerm(
  term: { readonly coefficient: number; readonly exponent: number },
  index: number,
) {
  const negative = term.coefficient < 0;
  const coefficient =
    term.exponent === 0 || Math.abs(term.coefficient) !== 1
      ? formatCoefficient(term.coefficient)
      : "";
  const variable =
    term.exponent === 0 ? (
      ""
    ) : term.exponent === 1 ? (
      "x"
    ) : (
      <>
        <span>x</span>
        <sup>{term.exponent}</sup>
      </>
    );
  const body = (
    <>
      {coefficient}
      {variable}
    </>
  );
  const prefix = index === 0 ? (negative ? "-" : "") : negative ? " - " : " + ";
  return (
    <span key={`${index}-${term.coefficient}-${term.exponent}`}>
      {prefix}
      {body}
    </span>
  );
}

function formatPolynomial(
  terms: readonly { readonly coefficient: number; readonly exponent: number }[],
) {
  return <>{terms.map((term, index) => formatTerm(term, index))}</>;
}

export function PolynomialDegreeLeadingCoefficientActivity({
  activityId,
  mode,
  onSubmit,
  onComplete,
  ...props
}: PolynomialDegreeLeadingCoefficientActivityProps) {
  const instanceId = useId();
  const [answers, setAnswers] = useState<Record<PartId, string>>({
    a_degree: "",
    a_leading_coefficient: "",
    b_degree: "",
    b_leading_coefficient: "",
    c_degree: "",
    c_leading_coefficient: "",
  });
  const expectedMode = expectedPresentationMode(mode);

  if (props.presentationMode !== expectedMode) {
    return <p role="alert">This activity is unavailable for this presentation mode.</p>;
  }

  const title =
    props.title ??
    (mode === "teaching"
      ? "Worked Example: Degree and Leading Coefficient"
      : mode === "guided"
        ? "Guided Practice: Degree and Leading Coefficient"
        : "Independent Practice: Degree and Leading Coefficient");
  const isWorked = props.presentationMode === "worked_example";
  const canSubmit = !isWorked && PART_IDS.every((partId) => answers[partId].trim().length > 0);

  const submit = () => {
    if (!canSubmit || isWorked) return;
    const answer = {
      a_degree: answers.a_degree,
      a_leading_coefficient: answers.a_leading_coefficient,
      b_degree: answers.b_degree,
      b_leading_coefficient: answers.b_leading_coefficient,
      c_degree: answers.c_degree,
      c_leading_coefficient: answers.c_leading_coefficient,
    };
    const envelope = buildPracticeSubmissionEnvelope({
      activityId,
      mode: mode === "guided" ? "guided_practice" : "independent_practice",
      answers: answer,
      parts: PART_IDS.map((partId) => ({ partId, rawAnswer: answer[partId] })),
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
            <p aria-label={`${item.id} polynomial`}>
              {item.functionName === "y" ? "y = " : `${item.functionName}(x) = `}
              {formatPolynomial(item.terms)}
            </p>

            {isWorked ? (
              <div>
                <p>
                  Degree:{" "}
                  {props.correctAnswers[`${item.id}_degree` as keyof typeof props.correctAnswers]}
                </p>
                <p>
                  Leading coefficient:{" "}
                  {
                    props.correctAnswers[
                      `${item.id}_leading_coefficient` as keyof typeof props.correctAnswers
                    ]
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-2 sm:grid-cols-2">
                <label htmlFor={`${instanceId}-${item.id}-degree`}>{item.id} degree</label>
                <input
                  id={`${instanceId}-${item.id}-degree`}
                  type="text"
                  inputMode="decimal"
                  value={answers[`${item.id}_degree` as PartId]}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [`${item.id}_degree`]: event.target.value,
                    }))
                  }
                />
                <label htmlFor={`${instanceId}-${item.id}-leading-coefficient`}>
                  {item.id} leading coefficient
                </label>
                <input
                  id={`${instanceId}-${item.id}-leading-coefficient`}
                  type="text"
                  inputMode="decimal"
                  value={answers[`${item.id}_leading_coefficient` as PartId]}
                  onChange={(event) =>
                    setAnswers((current) => ({
                      ...current,
                      [`${item.id}_leading_coefficient`]: event.target.value,
                    }))
                  }
                />
              </div>
            )}
          </article>
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
          <p id={`${instanceId}-field-help`}>{props.fieldHelp}</p>
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
