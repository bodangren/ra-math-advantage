"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownRenderer } from "@math-platform/lesson-renderer";
import type { FunctionReturnType } from "convex/server";
import type { internal } from "@/convex/_generated/api";
type Lesson = NonNullable<
  FunctionReturnType<typeof internal.learning.getLesson>
>;
type Section = Lesson["phases"][number]["sections"][number];
async function save(body: unknown) {
  const response = await fetch("/api/learning", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw Error(data.error ?? "Could not save your work.");
  return data;
}
function Question({
  question,
  phaseId,
}: {
  question: Extract<Section, { kind: "question" }>;
  phaseId: string;
}) {
  const [answer, setAnswer] = useState("");
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const [key, setKey] = useState(() => crypto.randomUUID());
  const [showHint, setShowHint] = useState(false);
  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    try {
      const result = await save({
        operation: "submit",
        phaseId,
        activityId: question.id,
        answer,
        submissionKey: key,
      });
      setMessage(result.feedback);
      setKey(crypto.randomUUID());
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save your answer.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="card-surface p-6 space-y-4">
      <MarkdownRenderer content={question.prompt} />
      <label htmlFor={question.id}>Your answer</label>
      {question.answerType === "choice" ? (
        <select
          id={question.id}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          disabled={pending}
          className="input-field w-full"
        >
          <option value="">Select an answer</option>
          {question.choices.map((choice) => (
            <option key={choice.id} value={choice.id}>
              {choice.text}
            </option>
          ))}
        </select>
      ) : (
        <input
          id={question.id}
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          required
          maxLength={128}
          disabled={pending}
          className="input-field w-full"
          aria-describedby={`${question.id}-format`}
        />
      )}
      <p id={`${question.id}-format`} className="text-sm">
        {question.answerType === "numeric"
          ? "Enter a decimal or a fraction."
          : ""}
      </p>
      {question.hint && (
        <>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowHint(!showHint)}
          >
            Show hint
          </button>
          {showHint && <p>{question.hint}</p>}
        </>
      )}
      <button disabled={pending} className="btn-primary">
        {pending ? "Saving..." : "Check answer"}
      </button>
      <p role="status">{message}</p>
    </form>
  );
}
export function LearningSession({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [pending, setPending] = useState(false);
  const current = lesson.phases.find(
    (phase) => phase.unlocked && !phase.completed,
  );
  async function complete() {
    if (!current) return;
    setPending(true);
    setMessage("");
    try {
      await save({ operation: "complete", phaseId: current.id });
      router.refresh();
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not save progress.",
      );
    } finally {
      setPending(false);
    }
  }
  return (
    <div className="space-y-8">
      <p>
        {lesson.phases.filter((p) => p.completed).length} of{" "}
        {lesson.phases.length} phases complete
      </p>
      {lesson.phases.map((phase) => (
        <section key={phase.id} aria-label={phase.title}>
          {phase.completed ? (
            <details>
              <summary>
                {phase.number}. {phase.title} — Complete
              </summary>
              {phase.sections.map((section, i) =>
                section.kind === "text" ? (
                  <MarkdownRenderer key={i} content={section.markdown} />
                ) : (
                  <p key={section.id}>Practice complete.</p>
                ),
              )}
            </details>
          ) : phase.id === current?.id ? (
            <>
              <h2 className="text-2xl font-display mb-4">
                {phase.number}. {phase.title}
              </h2>
              {phase.sections.map((section, i) =>
                section.kind === "text" ? (
                  <MarkdownRenderer key={i} content={section.markdown} />
                ) : (
                  <Question
                    key={section.id}
                    question={section}
                    phaseId={phase.id}
                  />
                ),
              )}
            </>
          ) : (
            <p className="text-muted-text">
              {phase.number}. {phase.title} — Complete the previous phase first.
            </p>
          )}
        </section>
      ))}
      {current ? (
        <button className="btn-primary" disabled={pending} onClick={complete}>
          {pending ? "Saving..." : "Complete this phase"}
        </button>
      ) : (
        <p role="status">Lesson complete.</p>
      )}
      <p role="alert">{message}</p>
    </div>
  );
}
