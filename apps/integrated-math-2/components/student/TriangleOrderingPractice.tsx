/* eslint-disable next/no-img-element */
"use client";
import { useRef, useState } from "react";
type Part = {
  id: string;
  prompt: string;
  kind: "choice" | "numeric";
  choices?: Array<{ id: string; text: string }>;
};
type Item = {
  activityId: string;
  mode: string;
  problem: number;
  figure: string;
  alt: string;
  prompt: string;
  authoredLabel?: string;
  answer?: string;
  solutionSteps?: string[];
  currentPart?: Part;
  acceptedAnswers?: Record<string, string>;
  hintsUsed: number;
  revealStepsSeen: number;
};
type SavedRequest = { key: string; body: string };
const validId = (value: unknown) =>
  typeof value === "string" && value.length > 0;
export function TriangleOrderingPractice({ items }: { items: Item[] }) {
  const [index, setIndex] = useState(0);
  const [itemState, setItemState] = useState(items[0]);
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [retryLocked, setRetryLocked] = useState(false);
  const pending = useRef(false);
  const retries = useRef(new Map<string, SavedRequest>());
  if (!itemState)
    return (
      <p>
        {items.length
          ? "Practice complete."
          : "Triangle ordering practice is not available."}
      </p>
    );
  async function submit() {
    if (pending.current) return;
    pending.current = true;
    setBusy(true);
    try {
      const saved = retries.current.get(itemState.activityId);
      const proposedAnswers = {
        ...(itemState.acceptedAnswers ?? {}),
        ...(itemState.currentPart
          ? { [itemState.currentPart.id]: answer }
          : {}),
      };
      const proposedBody = JSON.stringify({
        answers: proposedAnswers,
        hintsUsed: itemState.hintsUsed,
        revealStepsSeen: itemState.revealStepsSeen,
      });
      const request = saved ?? { key: crypto.randomUUID(), body: proposedBody };
      retries.current.set(itemState.activityId, request);
      setRetryLocked(true);
      const response = await fetch(
        `/api/activities/${encodeURIComponent(itemState.activityId)}/submissions`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
            "Idempotency-Key": request.key,
          },
          body: request.body,
        },
      );
      if (!response.ok)
        throw Error(
          "Your response was not saved. Submit the same response again.",
        );
      const result: unknown = await response.json();
      if (itemState.mode === "worked_example") {
        if (!isAcknowledged(result))
          throw Error("The saved response is invalid. Submit it again.");
      } else if (
        !isGraded(result, itemState, JSON.parse(request.body) as TriangleBody)
      )
        throw Error("The saved response is invalid. Submit it again.");
      retries.current.delete(itemState.activityId);
      setRetryLocked(false);
      if (
        (result as { kind: string }).kind === "acknowledged" ||
        (result as { complete?: boolean }).complete === true
      ) {
        const next = index + 1;
        setIndex(next);
        setItemState(items[next]);
        setAnswer("");
        setMessage("");
        return;
      }
      const graded = result as {
        nextPart?: Part;
        acceptedAnswers: Record<string, string>;
        hintsUsed: number;
        revealStepsSeen: number;
        hint?: string;
        feedback?: string;
      };
      setItemState({
        ...itemState,
        currentPart: graded.nextPart ?? itemState.currentPart,
        acceptedAnswers: graded.acceptedAnswers,
        hintsUsed: graded.hintsUsed,
        revealStepsSeen: graded.revealStepsSeen,
      });
      setAnswer("");
      setMessage(graded.hint ?? graded.feedback ?? "");
    } finally {
      pending.current = false;
      setBusy(false);
    }
  }
  return (
    <section>
      <h2>{itemState.mode.replaceAll("_", " ")}</h2>
      <img src={itemState.figure} alt={itemState.alt} />
      <p>{itemState.prompt}</p>
      {itemState.mode === "worked_example" ? (
        <>
          <strong>{itemState.authoredLabel}</strong>
          <p>Answer: {itemState.answer}</p>
          <ol>
            {itemState.solutionSteps?.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <button
            disabled={busy}
            onClick={() =>
              void submit().catch((error: Error) => setMessage(error.message))
            }
          >
            Continue
          </button>
        </>
      ) : (
        <>
          <label htmlFor={itemState.activityId}>
            {itemState.currentPart?.prompt}
          </label>
          {itemState.currentPart?.kind === "choice" ? (
            <select
              disabled={busy || retryLocked}
              id={itemState.activityId}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            >
              <option value="">Select an answer</option>
              {itemState.currentPart.choices?.map((choice) => (
                <option key={choice.id} value={choice.id}>
                  {choice.text}
                </option>
              ))}
            </select>
          ) : (
            <input
              disabled={busy || retryLocked}
              id={itemState.activityId}
              value={answer}
              onChange={(event) => setAnswer(event.target.value)}
            />
          )}
          <button
            disabled={!answer || busy}
            onClick={() =>
              void submit().catch((error: Error) => setMessage(error.message))
            }
          >
            Check answer
          </button>
        </>
      )}
      <p role="status">{message}</p>
    </section>
  );
}
type TriangleBody = {
  answers: Record<string, string>;
  hintsUsed: number;
  revealStepsSeen: number;
};
const object = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);
function exactKeys(value: Record<string, unknown>, expected: string[]) {
  const actual = Object.keys(value).sort();
  const keys = [...expected].sort();
  return (
    actual.length === keys.length &&
    actual.every((key, index) => key === keys[index])
  );
}
function stringMap(value: unknown): value is Record<string, string> {
  return (
    object(value) &&
    Object.values(value).every((entry) => typeof entry === "string")
  );
}
function sameMap(left: Record<string, string>, right: Record<string, string>) {
  return (
    exactKeys(left, Object.keys(right)) &&
    Object.entries(right).every(([key, value]) => left[key] === value)
  );
}
function isAcknowledged(value: unknown): value is {
  kind: "acknowledged";
  submissionId: string;
  evidencePersisted: false;
} {
  return (
    object(value) &&
    exactKeys(value, ["kind", "submissionId", "evidencePersisted"]) &&
    value.kind === "acknowledged" &&
    validId(value.submissionId) &&
    value.evidencePersisted === false
  );
}
function validPart(value: unknown): value is {
  partId: string;
  rawAnswer: string;
  isCorrect: boolean;
  score: number;
  maxScore: 1;
  feedback?: string;
} {
  return (
    object(value) &&
    exactKeys(value, [
      "partId",
      "rawAnswer",
      "isCorrect",
      "score",
      "maxScore",
      ...(value.feedback === undefined ? [] : ["feedback"]),
    ]) &&
    validId(value.partId) &&
    typeof value.rawAnswer === "string" &&
    typeof value.isCorrect === "boolean" &&
    (value.score === 0 || value.score === 1) &&
    value.maxScore === 1 &&
    value.isCorrect === (value.score === 1) &&
    (value.feedback === undefined || typeof value.feedback === "string")
  );
}
function expectedNextId(currentId: string) {
  return currentId === "measure_order"
    ? "opposite_correspondence"
    : currentId === "opposite_correspondence" || currentId === "missing_angle"
      ? "final_order"
      : undefined;
}
function validNextPart(
  value: unknown,
  expectedId: string | undefined,
): value is Part {
  if (
    !expectedId ||
    !object(value) ||
    !exactKeys(value, [
      "id",
      "prompt",
      "kind",
      ...(value.choices === undefined ? [] : ["choices"]),
    ]) ||
    value.id !== expectedId ||
    typeof value.prompt !== "string" ||
    value.prompt.length === 0 ||
    (value.kind !== "choice" && value.kind !== "numeric")
  )
    return false;
  if (value.kind === "numeric") return value.choices === undefined;
  return (
    Array.isArray(value.choices) &&
    value.choices.length >= 2 &&
    value.choices.every(
      (choice) =>
        object(choice) &&
        exactKeys(choice, ["id", "text"]) &&
        validId(choice.id) &&
        typeof choice.text === "string" &&
        choice.text.length > 0,
    )
  );
}
function isGraded(value: unknown, item: Item, request: TriangleBody) {
  if (
    !object(value) ||
    !exactKeys(value, [
      "kind",
      "submissionId",
      "score",
      "maxScore",
      "feedback",
      "finalPart",
      "complete",
      "acceptedAnswers",
      "hintsUsed",
      "revealStepsSeen",
      "evidencePersisted",
      ...(value.nextPart === undefined ? [] : ["nextPart"]),
      ...(value.hint === undefined ? [] : ["hint"]),
      ...(value.parts === undefined ? [] : ["parts"]),
    ]) ||
    value.kind !== "graded" ||
    !validId(value.submissionId) ||
    typeof value.score !== "number" ||
    !Number.isSafeInteger(value.score) ||
    value.score < 0 ||
    typeof value.maxScore !== "number" ||
    !Number.isSafeInteger(value.maxScore) ||
    value.maxScore < 1 ||
    typeof value.feedback !== "string" ||
    typeof value.complete !== "boolean" ||
    typeof value.finalPart !== "boolean" ||
    !stringMap(value.acceptedAnswers) ||
    typeof value.hintsUsed !== "number" ||
    !Number.isSafeInteger(value.hintsUsed) ||
    typeof value.revealStepsSeen !== "number" ||
    !Number.isSafeInteger(value.revealStepsSeen) ||
    typeof value.evidencePersisted !== "boolean" ||
    !item.currentPart ||
    !stringMap(request.answers)
  )
    return false;
  const currentCorrect = value.complete || value.score === 1;
  const expectedHintsUsed =
    request.hintsUsed +
    (item.mode === "guided_practice" && !currentCorrect ? 1 : 0);
  if (
    value.hintsUsed !== expectedHintsUsed ||
    value.revealStepsSeen !== request.revealStepsSeen
  )
    return false;
  const currentId = item.currentPart.id;
  const expectedAnswers = { ...(item.acceptedAnswers ?? {}) };
  if (currentCorrect) expectedAnswers[currentId] = request.answers[currentId];
  if (!sameMap(value.acceptedAnswers, expectedAnswers)) return false;
  const acceptedAnswers = value.acceptedAnswers;
  if (value.complete) {
    if (
      !value.finalPart ||
      value.nextPart !== undefined ||
      value.hint !== undefined ||
      !Array.isArray(value.parts) ||
      value.parts.length !== value.maxScore ||
      value.score !== value.maxScore ||
      !value.parts.every(validPart) ||
      value.parts.some(
        (part) =>
          !part.isCorrect || acceptedAnswers[part.partId] !== part.rawAnswer,
      ) ||
      !value.parts.some((part) => part.partId === currentId)
    )
      return false;
    return exactKeys(
      acceptedAnswers,
      value.parts.map((part) => part.partId),
    );
  }
  if (
    value.parts !== undefined ||
    value.maxScore !== 1 ||
    (value.score !== 0 && value.score !== 1)
  )
    return false;
  if (value.finalPart && value.score === 1) return false;
  const nextId = expectedNextId(currentId);
  if (value.score === 1 && !value.finalPart)
    return validNextPart(value.nextPart, nextId) && value.hint === undefined;
  if (value.nextPart !== undefined) return false;
  if (item.mode === "guided_practice" && value.score === 0)
    return typeof value.hint === "string" && value.hint.length > 0;
  return value.hint === undefined;
}
