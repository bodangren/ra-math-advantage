import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { LeadershipPortfolioTable } from '../../components/leadership-portfolio-table';
import { ReportCommentForm } from '../../components/report-comment-form';
import { TeacherResponseForm } from '../../components/teacher-response-form';
import {
  readReportingRequest,
  reportingResultResponse,
} from '../../lib/reporting/reporting-route';

const mockRequireDanielsonApiSession = vi.hoisted(() => vi.fn());

vi.mock('@/lib/auth/server', () => ({
  requireDanielsonApiSession: mockRequireDanielsonApiSession,
}));

const row = {
  teacherProfileId: 'teacher_profiles:one',
  displayName: 'Teacher One',
  danielson: {
    state: 'below_proficient' as const,
    belowComponentIds: ['danielson.framework.component.2c'],
  },
  improvementPlan: {
    contractVersion: 'danielson.ip-progress.v1' as const,
    state: 'not_configured' as const,
  },
  gbf: {
    contractVersion: 'danielson.gbf-progress.v1' as const,
    state: 'not_configured' as const,
  },
  evidenceDue: {
    state: 'overdue' as const,
    dueCount: 3,
    overdueCount: 1,
    maximumOverdueDays: 6,
    nextDueAt: '2026-10-26T00:00:00.000Z',
  },
  attentionReasons: ['below_proficient', 'overdue_evidence'] as const,
};

describe('report request boundary', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockRequireDanielsonApiSession.mockResolvedValue({ sub: 'accounts:current' });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('uses the verified session and removes all client identity and scope fields', async () => {
    const result = await readReportingRequest(new Request(
      'http://localhost/api/reports/comments/public',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          observationId: 'observation_records:one',
          content: 'Public comment.',
          actorAccountId: 'accounts:attacker',
          organizationId: 'organizations:other',
          teacherProfileId: 'teacher_profiles:other',
          roles: ['slt'],
          accessScope: { allTeachers: true },
        }),
      },
    ));

    expect(result).not.toBeInstanceOf(Response);
    expect(result).toEqual({
      claims: { sub: 'accounts:current' },
      command: {
        observationId: 'observation_records:one',
        content: 'Public comment.',
      },
    });
  });

  it('returns the authentication response without reading a command', async () => {
    const unauthorized = new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    mockRequireDanielsonApiSession.mockResolvedValue(unauthorized);

    const result = await readReportingRequest(new Request(
      'http://localhost/api/reports/responses',
      { method: 'POST', body: '{not-json' },
    ));

    expect(result).toBe(unauthorized);
  });

  it('maps a second final response to a stable conflict without protected data', async () => {
    const response = reportingResultResponse({ kind: 'response_exists' });

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({ error: 'A final response already exists.' });
  });
});

describe('report interface accessibility', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('renders the compact portfolio columns, text reasons, and pagination link', () => {
    render(<LeadershipPortfolioTable rows={[row]} nextHref="/reports?cursor=next" />);

    for (const heading of ['Teacher', 'Danielson', 'IP', 'Get Better Faster (GBF)', 'Evidence due']) {
      expect(screen.getByRole('columnheader', { name: heading })).toBeVisible();
    }
    expect(screen.getByRole('link', { name: 'Teacher One' }))
      .toHaveAttribute('href', '/reports/teachers/teacher_profiles%3Aone');
    expect(screen.getByText('Below Proficient')).toBeVisible();
    expect(screen.getByText('Below Proficient; overdue evidence')).toBeVisible();
    expect(screen.getAllByText('Not configured')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Next page' }))
      .toHaveAttribute('href', '/reports?cursor=next');
  });

  it('uses a visible label and focuses a public-comment server error', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ error: 'The comment was not saved.' }),
    }));
    render(<ReportCommentForm
      observationId="observation_records:one"
      commentType="public"
    />);

    const field = screen.getByLabelText('Public comment');
    expect(field).toBeRequired();
    expect(field).toHaveAttribute('maxlength', '4000');
    fireEvent.change(field, { target: { value: 'Teacher-visible comment.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Add public comment' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('The comment was not saved.');
    await waitFor(() => expect(alert).toHaveFocus());
    expect(alert).toHaveAttribute('tabindex', '-1');
  });

  it('uses a visible label and focuses a final-response conflict', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({ error: 'A final response already exists.' }),
    }));
    render(<TeacherResponseForm observationId="observation_records:one" />);

    const field = screen.getByLabelText('Optional final response');
    expect(field).toBeRequired();
    expect(field).toHaveAttribute('maxlength', '4000');
    fireEvent.change(field, { target: { value: 'My final response.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit final response' }));

    const alert = await screen.findByRole('alert');
    expect(alert).toHaveTextContent('A final response already exists.');
    await waitFor(() => expect(alert).toHaveFocus());
    await waitFor(() => expect(fetch).toHaveBeenCalledOnce());
    const request = vi.mocked(fetch).mock.calls[0][1] as RequestInit;
    expect(JSON.parse(String(request.body))).toEqual({
      observationId: 'observation_records:one',
      content: 'My final response.',
    });
  });

  it('does not add a leadership reply route after the teacher response', () => {
    const currentDirectory = resolve(fileURLToPath(import.meta.url), '..');
    const applicationRoot = resolve(currentDirectory, '../..');
    expect(existsSync(resolve(
      applicationRoot,
      'app/api/reports/responses/[responseId]/reply/route.ts',
    ))).toBe(false);
  });
});
