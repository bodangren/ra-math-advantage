"use client";

import type { ReviewDecision } from "../types";

interface ReviewDecisionControlsProps {
  label: string;
  decision: ReviewDecision | undefined;
  approvalDisabledReason?: string;
  onChange: (decision: ReviewDecision) => void;
}

export function ReviewDecisionControls({
  label,
  decision,
  approvalDisabledReason,
  onChange,
}: ReviewDecisionControlsProps) {
  const noteMissing = decision?.status === "needs_fix" && decision.note.trim().length === 0;

  return (
    <div className="border-t border-[#C9C4B5] pt-4">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#365451]">
        {label} decision
      </p>
      <div className="mt-2 flex gap-2">
        <button
          type="button"
          aria-pressed={decision?.status === "approved"}
          disabled={approvalDisabledReason !== undefined}
          onClick={() => onChange({ status: "approved", note: "" })}
          className="border border-[#2D7D46] px-3 py-2 text-sm font-semibold text-[#2D7D46] aria-pressed:bg-[#2D7D46] aria-pressed:text-white disabled:cursor-not-allowed disabled:border-[#8A958E] disabled:text-[#526764]"
        >
          Approved
        </button>
        <button
          type="button"
          aria-pressed={decision?.status === "needs_fix"}
          onClick={() => onChange({ status: "needs_fix", note: decision?.note ?? "" })}
          className="border border-[#A34A36] px-3 py-2 text-sm font-semibold text-[#A34A36] aria-pressed:bg-[#A34A36] aria-pressed:text-white"
        >
          Needs fix
        </button>
      </div>
      {approvalDisabledReason && (
        <p className="mt-2 text-xs font-semibold text-[#7A2E20]">{approvalDisabledReason}</p>
      )}
      {decision?.status === "needs_fix" && (
        <div className="mt-3">
          <label
            htmlFor={`${label}-fix-note`}
            className="block text-xs font-semibold text-[#365451]"
          >
            {label} fix note
          </label>
          <textarea
            id={`${label}-fix-note`}
            value={decision.note}
            onChange={(event) => onChange({ status: "needs_fix", note: event.target.value })}
            rows={3}
            className="mt-1 w-full border border-[#8A958E] bg-white p-2 text-sm outline-none focus:border-[#2D7D46]"
          />
          {noteMissing && (
            <p role="alert" className="mt-1 text-xs font-semibold text-[#A34A36]">
              Add a fix note.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
