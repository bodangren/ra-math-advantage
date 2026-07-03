import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TransferCreditAuditPanel } from '@/components/teacher/transfer-credit/TransferCreditAuditPanel';

interface TransferCreditAuditRecord {
  studentId: string;
  studentName: string;
  sourceCourse: string;
  targetSkill: string;
  seededMastery: number;
  grantedAt: number;
  state: 'skipped' | 'reverted';
  skipKind: 'direct' | 'confirmed';
}

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const aliceRecord: TransferCreditAuditRecord = {
  studentId: 'student-a',
  studentName: 'Alice Student',
  sourceCourse: 'math.im2',
  targetSkill: 'math.im3.skill.solve-quadratic',
  seededMastery: 0.72,
  grantedAt: 1_000_000,
  state: 'skipped',
  skipKind: 'direct',
};

const bobRecord: TransferCreditAuditRecord = {
  studentId: 'student-b',
  studentName: 'Bob Student',
  sourceCourse: 'math.precalc',
  targetSkill: 'math.im3.skill.linear-functions',
  seededMastery: 0.81,
  grantedAt: 2_000_000,
  state: 'skipped',
  skipKind: 'confirmed',
};

const revertedRecord: TransferCreditAuditRecord = {
  studentId: 'student-c',
  studentName: 'Carol Student',
  sourceCourse: 'math.im1',
  targetSkill: 'math.im3.skill.factoring',
  seededMastery: 0.65,
  grantedAt: 3_000_000,
  state: 'reverted',
  skipKind: 'direct',
};

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('TransferCreditAuditPanel', () => {
  it('renders the transfer credit count and one row per record', () => {
    render(<TransferCreditAuditPanel records={[aliceRecord, bobRecord]} />,
    );

    expect(screen.getByText(/Transfer credits: 2/i)).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3); // header + 2 data rows
  });

  it('renders all five auditable fields in each row', () => {
    render(<TransferCreditAuditPanel records={[aliceRecord]} />);

    expect(screen.getByText(aliceRecord.studentName)).toBeInTheDocument();
    expect(screen.getByText(aliceRecord.sourceCourse)).toBeInTheDocument();
    expect(screen.getByText(aliceRecord.targetSkill)).toBeInTheDocument();
    expect(
      screen.getByText(`${Math.round(aliceRecord.seededMastery * 100)}%`),
    ).toBeInTheDocument();
  });

  it('renders skip kind labels (direct vs confirmed)', () => {
    render(<TransferCreditAuditPanel records={[aliceRecord, bobRecord]} />);

    expect(screen.getByText(/direct/i)).toBeInTheDocument();
    expect(screen.getByText(/confirmed/i)).toBeInTheDocument();
  });

  it('renders an Undo skip button for skipped records and fires onRevert', async () => {
    const onRevert = vi.fn();
    render(
      <TransferCreditAuditPanel records={[aliceRecord]} onRevert={onRevert} />,
    );

    const undoButton = screen.getByRole('button', { name: /undo skip/i });
    expect(undoButton).toBeInTheDocument();

    await userEvent.click(undoButton);

    expect(onRevert).toHaveBeenCalledTimes(1);
    expect(onRevert).toHaveBeenCalledWith(aliceRecord);
  });

  it('does not render an undo button for reverted records', () => {
    render(<TransferCreditAuditPanel records={[revertedRecord]} />);

    expect(
      screen.queryByRole('button', { name: /undo skip/i }),
    ).not.toBeInTheDocument();
  });

  it('renders an empty state when no records are provided', () => {
    render(<TransferCreditAuditPanel records={[]} />);

    expect(screen.getByText(/No transfer credits/i)).toBeInTheDocument();
    expect(screen.queryByRole('row')).not.toBeInTheDocument();
  });

  it('has an accessible region label for the audit panel', () => {
    render(<TransferCreditAuditPanel records={[aliceRecord]} />);

    expect(
      screen.getByRole('region', { name: /transfer credit audit/i }),
    ).toBeInTheDocument();
  });
});
