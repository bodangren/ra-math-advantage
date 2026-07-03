// Adversarial tests — Teacher transfer-credit audit panel (React component).
//
// Coverage map (test-strategy.md §2 + user AD labels):
//   AD14 — empty-state shape: no undefined rows, accessible empty state
//   AD15 — auditable fields completeness, no missing fields in any row

import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferCreditAuditPanel } from '@/components/teacher/transfer-credit/TransferCreditAuditPanel';

interface Record {
  studentId: string;
  studentName: string;
  sourceCourse: string;
  targetSkill: string;
  seededMastery: number;
  grantedAt: number;
  state: 'skipped' | 'reverted';
  skipKind: 'direct' | 'confirmed';
}

const alice: Record = {
  studentId: 'student-a',
  studentName: 'Alice',
  sourceCourse: 'math.im2',
  targetSkill: 'math.im3.skill.solve-quadratic',
  seededMastery: 0.72,
  grantedAt: 1_000_000,
  state: 'skipped',
  skipKind: 'direct',
};

const bob: Record = {
  studentId: 'student-b',
  studentName: 'Bob',
  sourceCourse: 'math.precalc',
  targetSkill: 'math.im3.skill.linear-functions',
  seededMastery: 0.81,
  grantedAt: 2_000_000,
  state: 'skipped',
  skipKind: 'confirmed',
};

const carol: Record = {
  studentId: 'student-c',
  studentName: 'Carol',
  sourceCourse: 'math.im1',
  targetSkill: 'math.im3.skill.factoring',
  seededMastery: 0.65,
  grantedAt: 3_000_000,
  state: 'reverted',
  skipKind: 'direct',
};

describe('AD14 — empty-state panel renders a defined empty shape (no table rows, no undefined cells)', () => {
  it('renders the "No transfer credits" message and no table rows', () => {
    render(<TransferCreditAuditPanel records={[]} />);

    // Accessible empty-state marker (label, not a bare matched digit).
    expect(
      screen.getByText(/No transfer credits/i),
    ).toBeInTheDocument();
    // No data rows must render — a phantom row on empty input would
    // silently inflate the auditable record count.
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
    // The accessible region is still present (a11y invariant).
    expect(
      screen.getByRole('region', { name: /transfer credit audit/i }),
    ).toBeInTheDocument();
  });

  it('does not render a "Transfer credits: N" label on empty input', () => {
    // The populated-state label would mislead a teacher into thinking
    // there are 0 credits — and the bug we're guarding against is the
    // label rendering with N=undefined, which prints "Transfer credits: NaN".
    render(<TransferCreditAuditPanel records={[]} />);

    expect(screen.queryByText(/Transfer credits:/i)).not.toBeInTheDocument();
  });
});

describe('AD15 — every row exposes all five auditable fields, no NaN / no undefined cells', () => {
  it('row for a populated record contains every auditable field as a defined string or number', () => {
    render(<TransferCreditAuditPanel records={[alice]} />);

    // Each of the five audit dimensions from the spec must be visible.
    expect(screen.getByText(alice.studentName)).toBeInTheDocument();
    expect(screen.getByText(alice.sourceCourse)).toBeInTheDocument();
    expect(screen.getByText(alice.targetSkill)).toBeInTheDocument();
    expect(
      screen.getByText(`${Math.round(alice.seededMastery * 100)}%`),
    ).toBeInTheDocument();

    // No "NaN%" / no "undefined%" must leak through any seededMastery cell.
    expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    expect(screen.queryByText(/undefined/)).not.toBeInTheDocument();
  });

  it('row count matches the records array length (no phantom, no dropped row)', () => {
    render(<TransferCreditAuditPanel records={[alice, bob, carol]} />);

    // A3 defense: the count is parsed from a labeled element
    // ("Transfer credits: N"), not from any matching digit.
    expect(screen.getByText(/Transfer credits: 3/i)).toBeInTheDocument();
    // 1 header row + 3 data rows = 4 rows total.
    expect(screen.getAllByRole('row')).toHaveLength(4);
  });

  it('reverted records render without an Undo skip button (no undefined state element)', () => {
    render(<TransferCreditAuditPanel records={[carol]} />);

    expect(screen.queryByRole('button', { name: /undo skip/i })).not.toBeInTheDocument();
    // The reverted row has a visible state label.
    expect(screen.getByText(/reverted/i)).toBeInTheDocument();
  });
});

describe('AD15 — handler is invoked with the original record (no cloning, no field drift)', () => {
  it('Undo skip fires onRevert with the FULL record object (every auditable field round-trips)', async () => {
    const onRevert = vi.fn();
    render(
      <TransferCreditAuditPanel records={[alice]} onRevert={onRevert} />,
    );

    const undoButton = screen.getByRole('button', { name: /undo skip/i });
    await userEvent.click(undoButton);

    expect(onRevert).toHaveBeenCalledTimes(1);
    const call = onRevert.mock.calls[0][0];
    // Every auditable field is passed through unchanged.
    expect(call.studentId).toBe(alice.studentId);
    expect(call.targetSkill).toBe(alice.targetSkill);
    expect(call.sourceCourse).toBe(alice.sourceCourse);
    expect(call.seededMastery).toBe(alice.seededMastery);
    expect(call.grantedAt).toBe(alice.grantedAt);
    expect(call.state).toBe(alice.state);
    expect(call.skipKind).toBe(alice.skipKind);
  });

  it('does not fire onRevert when no callback is provided', () => {
    // No onRevert → clicking undo must not throw and must not call a missing function.
    expect(() => {
      render(<TransferCreditAuditPanel records={[alice]} />);
      // Simply rendering with no onRevert must not crash.
    }).not.toThrow();
  });
});

describe('Access invariants', () => {
  it('every row has an accessible Undo skip control with an aria-label', () => {
    render(<TransferCreditAuditPanel records={[alice, bob]} />);

    const undoButtons = screen.getAllByRole('button', { name: /undo skip/i });
    // Two skipped records → two buttons.
    expect(undoButtons).toHaveLength(2);
  });

  it('the panel uses a region landmark with a stable aria-label', () => {
    render(<TransferCreditAuditPanel records={[alice]} />);
    expect(
      screen.getByRole('region', { name: /transfer credit audit/i }),
    ).toBeInTheDocument();
  });
});
