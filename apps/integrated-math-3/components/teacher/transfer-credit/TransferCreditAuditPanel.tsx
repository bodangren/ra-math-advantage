'use client';

// TransferCreditAuditPanel — teacher-facing auditable list of transfer
// credits granted to students (Phase 4 / FR6, AC5).
//
// The component is **self-contained**: it does not call Convex, does not
// fetch state, and does not derive eligibility. The caller passes the
// records to render (typically the result of a teacher-audit query) and
// wires `onRevert` to the persistence layer.
//
// Visual states:
//   - empty   → "No transfer credits" empty state
//   - populated → table with header + one row per record; each non-reverted
//                 record exposes an "Undo skip" button.

import { useCallback } from 'react';
import { Button } from '@/components/ui/button';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface TransferCreditAuditRecord {
  /** Student id the record belongs to. */
  studentId: string;
  /** Friendly student name shown in the table. */
  studentName: string;
  /** Student email shown in the table. */
  email: string;
  /** Cross-course source label (e.g. `math.im2`). */
  sourceCourse: string;
  /** Target skill id the skip applies to. */
  targetSkill: string;
  /** Discounted + capped mastery seeded by the FR2 pipeline (0..1). */
  seededMastery: number;
  /** Epoch-ms when the skip was granted. */
  grantedAt: number;
  /** Current state of the record. */
  state: 'skipped' | 'reverted';
  /** Direct-skip vs confirmation-check label. */
  skipKind: 'direct' | 'confirmed';
}

export interface TransferCreditAuditPanelProps {
  /** Auditable transfer-credit records to render. */
  records: readonly TransferCreditAuditRecord[];
  /** Fired when the teacher clicks "Undo skip" on a skipped record. */
  onRevert?: (record: TransferCreditAuditRecord) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

/**
 * Renders the teacher transfer-credit audit panel.
 *
 * Layout:
 *   - A region with an accessible label "Transfer credit audit".
 *   - A heading line that shows the total record count as
 *     "Transfer credits: N".
 *   - A table with columns: Student, Source course, Target skill,
 *     Mastery, Granted, Kind, Action.
 *   - An empty state when no records are provided.
 *
 * The component never mutates props. The caller owns persistence.
 */
export function TransferCreditAuditPanel({
  records,
  onRevert,
}: TransferCreditAuditPanelProps) {
  if (records.length === 0) {
    return (
      <section
        role="region"
        aria-label="Transfer credit audit"
        data-testid="transfer-credit-audit-panel"
        className="rounded-xl border border-border bg-muted/30 p-6"
      >
        <h2 className="font-display text-base font-semibold text-foreground">
          Transfer credits
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          No transfer credits
        </p>
      </section>
    );
  }

  return (
    <section
      role="region"
      aria-label="Transfer credit audit"
      data-testid="transfer-credit-audit-panel"
      className="rounded-xl border border-border bg-background p-5 space-y-4"
    >
      <div className="flex items-center justify-between">
        <h2 className="font-display text-base font-semibold text-foreground">
          Transfer credits: {records.length}
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs uppercase tracking-wide text-muted-foreground">
              <th scope="col" className="py-2 pr-4 font-medium">Student</th>
              <th scope="col" className="py-2 pr-4 font-medium">Source course</th>
              <th scope="col" className="py-2 pr-4 font-medium">Target skill</th>
              <th scope="col" className="py-2 pr-4 font-medium">Mastery</th>
              <th scope="col" className="py-2 pr-4 font-medium">Kind</th>
              <th scope="col" className="py-2 pr-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record) => (
              <AuditRow
                key={`${record.studentId}::${record.targetSkill}::${record.grantedAt}`}
                record={record}
                onRevert={onRevert}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// Row
// ---------------------------------------------------------------------------

interface AuditRowProps {
  record: TransferCreditAuditRecord;
  onRevert?: (record: TransferCreditAuditRecord) => void;
}

function AuditRow({ record, onRevert }: AuditRowProps) {
  const handleRevert = useCallback(() => {
    if (onRevert) {
      onRevert(record);
    }
  }, [record, onRevert]);

  const masteryPct = `${Math.round(record.seededMastery * 100)}%`;
  const kindLabel = record.skipKind === 'confirmed' ? 'Confirmed' : 'Direct';

  return (
    <tr className="border-b border-border last:border-b-0 align-top">
      <td className="py-3 pr-4">
        <div className="font-medium text-foreground">{record.studentName}</div>
        <div className="text-xs text-muted-foreground">{record.email}</div>
      </td>
      <td className="py-3 pr-4 font-mono-num text-xs text-muted-foreground">
        {record.sourceCourse}
      </td>
      <td className="py-3 pr-4 font-mono-num text-xs text-muted-foreground">
        {record.targetSkill}
      </td>
      <td className="py-3 pr-4 font-mono-num text-sm">{masteryPct}</td>
      <td className="py-3 pr-4 text-xs">{kindLabel}</td>
      <td className="py-3 pr-4 text-right">
        {record.state === 'skipped' ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleRevert}
            aria-label="Undo skip"
            data-testid="transfer-credit-undo"
          >
            Undo skip
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground">Reverted</span>
        )}
      </td>
    </tr>
  );
}
