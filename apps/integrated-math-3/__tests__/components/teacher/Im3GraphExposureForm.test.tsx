import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Im3GraphExposureForm } from '@/components/teacher/Im3GraphExposureForm';

const candidates = [
  { classId: 'class-a', studentId: 'student-a', submissionId: 'submission-a', className: 'Math 3', studentName: 'Ari', lessonTitle: 'Quadratic Functions', response: '{"answers":{}}', score: null, maxScore: null, submittedAt: 1 },
  { classId: 'class-b', studentId: 'student-b', submissionId: 'submission-b', className: 'Math 3B', studentName: 'Bo', lessonTitle: 'Quadratic Functions', response: '{"answers":{"x":1}}', score: 1, maxScore: 2, submittedAt: 2 },
];

afterEach(() => vi.unstubAllGlobals());

describe('Im3GraphExposureForm', () => {
  it('shows source details and keeps the exact retry after a network failure', async () => {
    const fetchMock = vi.fn().mockRejectedValueOnce(new TypeError('network')).mockResolvedValueOnce(Response.json({ evidenceId: 'evidence-1', replay: false }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Im3GraphExposureForm candidates={candidates.slice(0, 1)} />);
    expect(screen.getByText((_, element) => element?.tagName === 'P' && element.textContent === 'Source: Graph f(x) = x² using a table.')).toBeInTheDocument();
    expect(screen.getByText(/Worked example reviewed/)).toBeInTheDocument();
    expect(screen.getByText(/does not confirm student mastery/)).toBeInTheDocument();
    expect(screen.queryByText(candidates[0].response)).not.toBeInTheDocument();
    expect(screen.queryByRole('textbox')).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Confirm instruction' }));
    await screen.findByText(/could not be saved/);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm instruction' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[0][1].body).toBe(fetchMock.mock.calls[1][1].body);
    expect(fetchMock.mock.calls[0][1].headers['Idempotency-Key']).toBe(fetchMock.mock.calls[1][1].headers['Idempotency-Key']);
    await waitFor(() => expect(screen.queryByRole('button')).not.toBeInTheDocument());
  });

  it('locks the selected source while one request is pending', async () => {
    let finish!: (response: Response) => void;
    const fetchMock = vi.fn(() => new Promise<Response>((resolve) => { finish = resolve; }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Im3GraphExposureForm candidates={candidates} />);
    fireEvent.click(screen.getByRole('button'));
    expect(screen.getByRole('combobox')).toBeDisabled();
    fireEvent.click(screen.getByRole('button'));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    await act(async () => finish(Response.json({ evidenceId: 'evidence-1', replay: false })));
  });

  it('uses a new key when the teacher selects another source after a failed request', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new TypeError('network'));
    vi.stubGlobal('fetch', fetchMock);
    render(<Im3GraphExposureForm candidates={candidates} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm instruction' }));
    await screen.findByText(/could not be saved/);
    const firstKey = fetchMock.mock.calls[0][1].headers['Idempotency-Key'];
    fireEvent.change(screen.getByRole('combobox'), { target: { value: JSON.stringify(['class-b', 'submission-b']) } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm instruction' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][1].headers['Idempotency-Key']).not.toBe(firstKey);
    expect(JSON.parse(fetchMock.mock.calls[1][1].body)).toEqual({ classId: 'class-b', studentId: 'student-b', submissionId: 'submission-b' });
  });

  it('sends the selected class when two candidates share one submission', async () => {
    const fetchMock = vi.fn().mockResolvedValue(Response.json({ evidenceId: 'evidence-1', replay: false }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Im3GraphExposureForm candidates={[candidates[0], { ...candidates[0], classId: 'class-b', className: 'Math 3B' }]} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: JSON.stringify(['class-b', 'submission-a']) } });
    fireEvent.click(screen.getByRole('button', { name: 'Confirm instruction' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledOnce());
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toEqual({ classId: 'class-b', studentId: 'student-a', submissionId: 'submission-a' });
  });

  it('keeps the candidate and retry key when a success response has no evidence ID', async () => {
    const fetchMock = vi.fn().mockResolvedValueOnce(Response.json({ replay: false })).mockResolvedValueOnce(Response.json({ evidenceId: 'evidence-1', replay: true }));
    vi.stubGlobal('fetch', fetchMock);
    render(<Im3GraphExposureForm candidates={candidates.slice(0, 1)} />);
    fireEvent.click(screen.getByRole('button', { name: 'Confirm instruction' }));
    await screen.findByText(/could not be saved/);
    const firstKey = fetchMock.mock.calls[0][1].headers['Idempotency-Key'];
    fireEvent.click(screen.getByRole('button', { name: 'Confirm instruction' }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(2));
    expect(fetchMock.mock.calls[1][1].headers['Idempotency-Key']).toBe(firstKey);
    await waitFor(() => expect(screen.queryByRole('button')).not.toBeInTheDocument());
  });

  it('shows an empty state without identifier controls', () => {
    render(<Im3GraphExposureForm candidates={[]} />);
    expect(screen.getByText('No graph submissions are ready for review.')).toBeInTheDocument();
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
