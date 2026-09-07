import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const backend = vi.hoisted(() => ({ acknowledged: false, mutate: vi.fn(), query: vi.fn() }));
vi.mock('@/lib/auth/server', () => ({
  requireStudentRequestClaims: vi.fn().mockResolvedValue({ sub: 'profiles:student', role: 'student' }),
}));
vi.mock('@/lib/convex/server', () => ({
  internal: { activities: {
    createServerOwnedSubmission: 'strict-create',
    getSelectedWorkedAcknowledgement: 'strict-lookup',
  } },
  fetchInternalMutation: backend.mutate,
  fetchInternalQuery: backend.query,
}));
vi.mock('@/components/textbook/LessonPageLayout', () => ({
  LessonPageLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock('@/components/lesson/LessonStepper', () => ({ LessonStepper: () => null }));
vi.mock('@/components/lesson/PhaseRenderer', () => ({ PhaseRenderer: () => <div>Worked solution</div> }));
vi.mock('@/components/lesson/PhaseCompleteButton', () => ({
  PhaseCompleteButton: ({ disabled }: { disabled: boolean }) => (
    <button data-testid="phase-complete-btn" disabled={disabled}>Complete phase</button>
  ),
}));
vi.mock('@/components/lesson/LessonChatbot', () => ({ LessonChatbot: () => null }));

import { POST, GET } from '@/app/api/activities/submissions/route';
import { LessonRenderer, type LessonRendererProps } from '@/components/lesson/LessonRenderer';
import { IM3_PILOT_NODE, IM3_TEACHER_LED_ACTIVITY_ID } from '@/lib/practice/learning-evidence-pilot';

const props: LessonRendererProps = {
  lessonId: 'lesson', lessonTitle: 'Quadratics', moduleLabel: 'Unit 1', lessonNumber: 1,
  phases: [{
    phaseId: 'phase', phaseNumber: 4, phaseType: 'worked_example', title: 'Worked example',
    status: 'current', completed: false,
    sections: [{
      id: 'section', sequenceOrder: 1, sectionType: 'activity',
      content: {
        activityId: 'activities:worked', componentKey: 'graphing-explorer',
        stableActivityId: IM3_TEACHER_LED_ACTIVITY_ID, masteryNodeId: IM3_PILOT_NODE,
        learningEvidenceMode: 'worked_example', srsEligible: false,
      },
    }],
  }],
};

describe('selected IM3 Worked review action composition', () => {
  beforeEach(() => {
    backend.acknowledged = false;
    backend.mutate.mockReset().mockImplementation(async () => {
      backend.acknowledged = true;
      return { submissionId: 'activity_submissions:worked', acknowledged: true };
    });
    backend.query.mockReset().mockImplementation(async () => (
      backend.acknowledged
        ? { submissionId: 'activity_submissions:worked', acknowledged: true }
        : null
    ));
    vi.stubGlobal('fetch', async (input: string | URL | Request, init?: RequestInit) => {
      const url = typeof input === 'string' ? new URL(input, 'http://localhost') : new URL(input instanceof Request ? input.url : input);
      expect(url.pathname).toBe('/api/activities/submissions');
      const request = input instanceof Request ? input : new Request(url, init);
      const response = request.method === 'GET' ? await GET(request) : await POST(request);
      if (request.method === 'GET') {
        expect(response.headers.get('Cache-Control')).toBe('private, no-store');
      }
      return response;
    });
  });

  it('uses the strict create route only after the explicit action', async () => {
    render(<LessonRenderer {...props} />);
    await waitFor(() => expect(backend.query).toHaveBeenCalledOnce());
    expect(backend.mutate).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole('button', { name: 'I reviewed this worked example' }));
    await waitFor(() => expect(backend.mutate).toHaveBeenCalledOnce());
    expect(backend.mutate.mock.calls[0]?.[0]).toBe('strict-create');
    expect(screen.getByTestId('phase-complete-btn')).toBeEnabled();
  });

  it('hydrates a stored acknowledgement after a full remount without a new write', async () => {
    backend.acknowledged = true;
    const view = render(<LessonRenderer {...props} />);
    await waitFor(() => expect(screen.getByTestId('phase-complete-btn')).toBeEnabled());
    view.unmount();
    render(<LessonRenderer {...props} />);
    await waitFor(() => expect(screen.getByTestId('phase-complete-btn')).toBeEnabled());
    expect(backend.mutate).not.toHaveBeenCalled();
  });

  it('keeps the phase gated when the authenticated lookup fails', async () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    backend.query.mockRejectedValueOnce(new Error('lookup unavailable'));
    render(<LessonRenderer {...props} />);
    await waitFor(() => expect(backend.query).toHaveBeenCalledOnce());
    expect(screen.getByTestId('phase-complete-btn')).toBeDisabled();
    expect(screen.getByRole('button', { name: 'I reviewed this worked example' })).toBeEnabled();
    expect(backend.mutate).not.toHaveBeenCalled();
    errorSpy.mockRestore();
  });

  it('retries an ambiguous failure with the same request identity', async () => {
    backend.mutate
      .mockRejectedValueOnce(new Error('connection closed'))
      .mockImplementationOnce(async () => {
        backend.acknowledged = true;
        return { submissionId: 'activity_submissions:worked', acknowledged: true };
      });

    render(<LessonRenderer {...props} />);
    await waitFor(() => expect(backend.query).toHaveBeenCalledOnce());
    fireEvent.click(screen.getByRole('button', { name: 'I reviewed this worked example' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Try again' })).toBeEnabled());

    const firstArgs = backend.mutate.mock.calls[0]?.[1];
    fireEvent.click(screen.getByRole('button', { name: 'Try again' }));
    await waitFor(() => expect(backend.mutate).toHaveBeenCalledTimes(2));
    expect(backend.mutate.mock.calls[1]?.[1]).toEqual(firstArgs);
    expect(screen.getByTestId('phase-complete-btn')).toBeEnabled();
  });
});
