"use client";

import {
  FFT_2022_RATING_LEVELS,
  FFT_2022_RUBRIC_DESCRIPTORS,
} from "@/lib/proficiency/fft-rubric-descriptors";
import type { DanielsonComponentId } from "@/lib/proficiency/graph";
import { FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";

import { learnHref } from "@/lib/learn/href";

type FormOutcome =
  | { kind: "rated"; rating: 1 | 2 | 3 | 4 }
  | { kind: "not_enough_evidence" }
  | null;

type ObservationFormItem = {
  itemId: string;
  skillId?: string;
  skillTitle?: string;
  componentId: string;
  componentTitle: string;
  priorityReason?: string;
  outcome: FormOutcome;
  evidenceNote: string | null;
};

type ObservationFormDraft = {
  draftId: string;
  revision: number;
  observationType?: "walkthrough" | "formal_q1" | "formal_q4";
  teacherDisplayName: string;
  items: ObservationFormItem[];
};

type ObservationSaveCommand = {
  draftId: string;
  expectedRevision: number;
  items: Array<{
    itemId: string;
    outcome: FormOutcome;
    evidenceNote: string | null;
  }>;
};

type ObservationSubmitCommand = Omit<ObservationSaveCommand, "items"> & {
  items: Array<{
    itemId: string;
    outcome: Exclude<FormOutcome, null>;
    evidenceNote: string | null;
  }>;
};

function reasonLabel(reason: string | undefined): string | null {
  if (!reason) return null;
  return reason.replaceAll("_", " ").replace(/^./, (value) => value.toUpperCase());
}

export function ObservationForm({
  draft,
  onSave,
  onSubmit,
  onDiscard,
  submissionPending = false,
  submissionBusy = false,
}: {
  draft: ObservationFormDraft;
  onSave: (
    command: ObservationSaveCommand,
  ) => void | { revision?: number } | Promise<void | { revision?: number }>;
  onSubmit: (
    command: ObservationSubmitCommand,
  ) => void | { revision?: number } | Promise<void | { revision?: number }>;
  onDiscard?: (command: {
    draftId: string;
    expectedRevision: number;
    confirmed: true;
  }) => void | Promise<void>;
  submissionPending?: boolean;
  submissionBusy?: boolean;
}) {
  const [items, setItems] = useState(() => structuredClone(draft.items));
  const [savedItems, setSavedItems] = useState(() => structuredClone(draft.items));
  const hasUnsavedChanges = JSON.stringify(items) !== JSON.stringify(savedItems);
  const [revision, setRevision] = useState(draft.revision);
  const [missingItemIds, setMissingItemIds] = useState<string[]>([]);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (missingItemIds.length > 0) errorSummaryRef.current?.focus();
  }, [missingItemIds]);

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    function beforeUnload(event: BeforeUnloadEvent) {
      event.preventDefault();
      event.returnValue = "";
    }
    function beforeNavigation(event: MouseEvent) {
      const link = event.target instanceof Element ? event.target.closest("a") : null;
      if (
        !link ||
        link.target === "_blank" ||
        event.ctrlKey ||
        event.metaKey ||
        event.shiftKey ||
        link.getAttribute("href")?.startsWith("#")
      )
        return;
      if (!window.confirm("Leave this observation? Unsaved changes will be lost.")) {
        event.preventDefault();
        event.stopPropagation();
      }
    }
    window.addEventListener("beforeunload", beforeUnload);
    document.addEventListener("click", beforeNavigation, true);
    return () => {
      window.removeEventListener("beforeunload", beforeUnload);
      document.removeEventListener("click", beforeNavigation, true);
    };
  }, [hasUnsavedChanges]);

  function setOutcome(itemId: string, outcome: Exclude<FormOutcome, null>) {
    setItems((current) =>
      current.map((item) => (item.itemId === itemId ? { ...item, outcome } : item)),
    );
    setMissingItemIds((current) => current.filter((id) => id !== itemId));
  }

  function setEvidenceNote(itemId: string, evidenceNote: string) {
    setItems((current) =>
      current.map((item) => (item.itemId === itemId ? { ...item, evidenceNote } : item)),
    );
  }

  function submissionCommand(): ObservationSubmitCommand | null {
    if (items.some((item) => item.outcome === null)) return null;
    return {
      draftId: draft.draftId,
      expectedRevision: revision,
      items: items.map((item) => ({
        itemId: item.itemId,
        outcome: item.outcome as Exclude<FormOutcome, null>,
        evidenceNote: item.evidenceNote?.trim() || null,
      })),
    };
  }

  async function save() {
    const result = await onSave({
      draftId: draft.draftId,
      expectedRevision: revision,
      items: items.map((item) => ({
        itemId: item.itemId,
        outcome: item.outcome,
        evidenceNote: item.evidenceNote?.trim() || null,
      })),
    });
    if (result?.revision !== undefined) {
      setRevision(result.revision);
      setSavedItems(structuredClone(items));
    }
  }

  function discard() {
    if (!onDiscard || !window.confirm("Discard this draft? This action cannot be undone.")) return;
    void onDiscard({ draftId: draft.draftId, expectedRevision: revision, confirmed: true });
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = items.filter((item) => item.outcome === null).map((item) => item.itemId);
    if (missing.length > 0) {
      setMissingItemIds(missing);
      return;
    }
    const complete = submissionCommand();
    if (complete) {
      const result = await onSubmit(complete);
      if (result?.revision !== undefined) setRevision(result.revision);
    }
  }

  return (
    <form className="observation-form form-stack" onSubmit={submit} noValidate>
      <header className="observation-form-heading">
        <p className="eyebrow">
          {draft.observationType === "formal_q1"
            ? "Quarter 1 formal observation"
            : draft.observationType === "formal_q4"
              ? "Quarter 4 formal observation"
              : "5–10 minute walkthrough"}
        </p>
        <h1>Observe {draft.teacherDisplayName}</h1>
        <p className="lede">
          Rate the listed targets that you can see. Select “Not enough evidence” when the visit does
          not show a target.
        </p>
      </header>

      {missingItemIds.length > 0 ? (
        <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
          Select an outcome for each target.
        </div>
      ) : null}

      <details className="card">
        <summary>Rating guide</summary>
        <p>
          Use the Danielson Framework for Teaching (FFT) 2022 descriptor for the component. Record
          the observed action and student response.
        </p>
        <ul>
          <li>1 — Unsatisfactory</li>
          <li>2 — Basic</li>
          <li>3 — Proficient</li>
          <li>4 — Distinguished</li>
        </ul>
        <p>Select “Not enough evidence” when this visit does not support a rating.</p>
        <p>
          <a
            href="https://danielsongroup.org/the-framework-for-teaching/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Framework for Teaching reference
          </a>
        </p>
      </details>
      {items.map((item, index) => {
        const componentRubric =
          FFT_2022_RUBRIC_DESCRIPTORS[
            item.componentId.replace("danielson.framework.component.", "") as DanielsonComponentId
          ];
        const title = item.skillTitle ?? item.skillId ?? item.componentTitle;
        const groupId = `observation-item-${item.itemId}`;
        const errorId = `${groupId}-error`;
        const hasError = missingItemIds.includes(item.itemId);
        const selectedRating = item.outcome?.kind === "rated" ? item.outcome.rating : null;
        return (
          <fieldset
            className="observation-target card"
            key={item.itemId}
            aria-describedby={hasError ? errorId : undefined}
            disabled={submissionPending || submissionBusy}
          >
            <legend>
              <span className="target-number">Target {index + 1}</span>
              <span className="target-title">{title}</span>
              <span className="target-component">{item.componentTitle}</span>
            </legend>
            {reasonLabel(item.priorityReason) ? (
              <p>
                <span className="status attention">{reasonLabel(item.priorityReason)}</span>
              </p>
            ) : null}
            {item.skillId ? (
              <p>
                <Link href={learnHref(item.skillId)} target="_blank" rel="noopener noreferrer">
                  Learn {title}
                </Link>
              </p>
            ) : null}
            {componentRubric ? (
              <details>
                <summary>FFT 2022 rating descriptors</summary>
                <p>
                  Compare the observed evidence with each descriptor before you select a rating.
                </p>
                <dl className="rubric-descriptors">
                  {FFT_2022_RATING_LEVELS.map((level) => (
                    <div key={level.id}>
                      <dt>
                        {level.score} — {level.label}
                      </dt>
                      <dd>{componentRubric.descriptors[level.id]}</dd>
                    </div>
                  ))}
                </dl>
                <a
                  href="https://danielsongroup.org/the-framework-for-teaching/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Open the official FFT reference
                </a>
              </details>
            ) : null}
            <div className="rating-options" aria-label={`Outcome for ${title}`}>
              {([1, 2, 3, 4] as const).map((rating) => (
                <label className="rating-option" key={rating}>
                  <input
                    type="radio"
                    name={`${groupId}-outcome`}
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={() => setOutcome(item.itemId, { kind: "rated", rating })}
                  />
                  Rating {rating} —{" "}
                  {["Unsatisfactory", "Basic", "Proficient", "Distinguished"][rating - 1]}
                </label>
              ))}
              <label className="rating-option wide">
                <input
                  type="radio"
                  name={`${groupId}-outcome`}
                  value="not_enough_evidence"
                  checked={item.outcome?.kind === "not_enough_evidence"}
                  onChange={() => setOutcome(item.itemId, { kind: "not_enough_evidence" })}
                />
                Not enough evidence
              </label>
            </div>
            {hasError ? (
              <p className="field-error" id={errorId}>
                Select an outcome.
              </p>
            ) : null}
            <div className="field">
              <label htmlFor={`${groupId}-note`}>Evidence note for {title}</label>
              <p id={`${groupId}-prompt`}>
                What did the teacher do? What did students do? What happened next? Record facts
                before interpretation.
              </p>
              <textarea
                aria-describedby={`${groupId}-prompt`}
                id={`${groupId}-note`}
                rows={3}
                value={item.evidenceNote ?? ""}
                onChange={(event) => setEvidenceNote(item.itemId, event.currentTarget.value)}
              />
            </div>
          </fieldset>
        );
      })}

      <div className="observation-actions">
        {onDiscard ? (
          <button
            className="button danger"
            type="button"
            onClick={discard}
            disabled={submissionPending || submissionBusy}
          >
            Discard draft
          </button>
        ) : null}
        <button
          className="button secondary"
          type="button"
          onClick={save}
          disabled={submissionPending || submissionBusy}
        >
          Save draft
        </button>
        <button type="submit" disabled={submissionBusy}>
          {submissionBusy
            ? "Submitting…"
            : submissionPending
              ? "Retry submission"
              : "Submit observation"}
        </button>
      </div>
    </form>
  );
}
