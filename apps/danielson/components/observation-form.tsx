'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type FormOutcome =
  | { kind: 'rated'; rating: 1 | 2 | 3 | 4 }
  | { kind: 'not_enough_evidence' }
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

type ObservationSubmitCommand = Omit<ObservationSaveCommand, 'items'> & {
  items: Array<{
    itemId: string;
    outcome: Exclude<FormOutcome, null>;
    evidenceNote: string | null;
  }>;
};

function reasonLabel(reason: string | undefined): string | null {
  if (!reason) return null;
  return reason.replaceAll('_', ' ').replace(/^./, (value) => value.toUpperCase());
}

export function ObservationForm({
  draft,
  onSave,
  onSubmit,
}: {
  draft: ObservationFormDraft;
  onSave: (command: ObservationSaveCommand) => void | Promise<void>;
  onSubmit: (command: ObservationSubmitCommand) => void | Promise<void>;
}) {
  const [items, setItems] = useState(() => structuredClone(draft.items));
  const [missingItemIds, setMissingItemIds] = useState<string[]>([]);
  const errorSummaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (missingItemIds.length > 0) errorSummaryRef.current?.focus();
  }, [missingItemIds]);

  function setOutcome(itemId: string, outcome: Exclude<FormOutcome, null>) {
    setItems((current) => current.map((item) => (
      item.itemId === itemId ? { ...item, outcome } : item
    )));
    setMissingItemIds((current) => current.filter((id) => id !== itemId));
  }

  function setEvidenceNote(itemId: string, evidenceNote: string) {
    setItems((current) => current.map((item) => (
      item.itemId === itemId ? { ...item, evidenceNote } : item
    )));
  }

  function submissionCommand(): ObservationSubmitCommand | null {
    if (items.some((item) => item.outcome === null)) return null;
    return {
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      items: items.map((item) => ({
        itemId: item.itemId,
        outcome: item.outcome as Exclude<FormOutcome, null>,
        evidenceNote: item.evidenceNote?.trim() || null,
      })),
    };
  }

  function save() {
    void onSave({
      draftId: draft.draftId,
      expectedRevision: draft.revision,
      items: items.map((item) => ({
        itemId: item.itemId,
        outcome: item.outcome,
        evidenceNote: item.evidenceNote?.trim() || null,
      })),
    });
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing = items.filter((item) => item.outcome === null).map((item) => item.itemId);
    if (missing.length > 0) {
      setMissingItemIds(missing);
      return;
    }
    const complete = submissionCommand();
    if (complete) void onSubmit(complete);
  }

  return (
    <form className="observation-form form-stack" onSubmit={submit} noValidate>
      <header className="observation-form-heading">
        <p className="eyebrow">5–10 minute walkthrough</p>
        <h1>Observe {draft.teacherDisplayName}</h1>
        <p className="lede">Rate the three targets that you can see. Select “Not enough evidence” when the visit does not show a target.</p>
      </header>

      {missingItemIds.length > 0 ? (
        <div className="error-summary" role="alert" tabIndex={-1} ref={errorSummaryRef}>
          Select an outcome for each target.
        </div>
      ) : null}

      {items.map((item, index) => {
        const title = item.skillTitle ?? item.skillId ?? item.componentTitle;
        const groupId = `observation-item-${item.itemId}`;
        const errorId = `${groupId}-error`;
        const hasError = missingItemIds.includes(item.itemId);
        const selectedRating = item.outcome?.kind === 'rated' ? item.outcome.rating : null;
        return (
          <fieldset
            className="observation-target card"
            key={item.itemId}
            aria-describedby={hasError ? errorId : undefined}
          >
            <legend>
              <span className="target-number">Target {index + 1}</span>
              <span className="target-title">{title}</span>
              <span className="target-component">{item.componentTitle}</span>
            </legend>
            {reasonLabel(item.priorityReason) ? (
              <p><span className="status attention">{reasonLabel(item.priorityReason)}</span></p>
            ) : null}
            <div className="rating-options" aria-label={`Outcome for ${title}`}>
              {([1, 2, 3, 4] as const).map((rating) => (
                <label className="rating-option" key={rating}>
                  <input
                    type="radio"
                    name={`${groupId}-outcome`}
                    value={rating}
                    checked={selectedRating === rating}
                    onChange={() => setOutcome(item.itemId, { kind: 'rated', rating })}
                  />
                  Rating {rating}
                </label>
              ))}
              <label className="rating-option wide">
                <input
                  type="radio"
                  name={`${groupId}-outcome`}
                  value="not_enough_evidence"
                  checked={item.outcome?.kind === 'not_enough_evidence'}
                  onChange={() => setOutcome(item.itemId, { kind: 'not_enough_evidence' })}
                />
                Not enough evidence
              </label>
            </div>
            {hasError ? <p className="field-error" id={errorId}>Select an outcome.</p> : null}
            <div className="field">
              <label htmlFor={`${groupId}-note`}>Evidence note for {title}</label>
              <textarea
                id={`${groupId}-note`}
                rows={3}
                value={item.evidenceNote ?? ''}
                onChange={(event) => setEvidenceNote(item.itemId, event.currentTarget.value)}
              />
            </div>
          </fieldset>
        );
      })}

      <div className="observation-actions">
        <button className="button secondary" type="button" onClick={save}>Save draft</button>
        <button type="submit">Submit observation</button>
      </div>
    </form>
  );
}
