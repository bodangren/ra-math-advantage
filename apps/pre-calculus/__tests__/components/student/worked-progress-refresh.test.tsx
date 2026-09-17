import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { expect, it, vi } from 'vitest';
const mocks = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock('next/navigation', () => ({ useRouter: () => ({ refresh: mocks.refresh }) }));
import { PrecalculusPhysicalContextWorkedPilot } from '@/components/student/PrecalculusPhysicalContextWorkedPilot';
it('refreshes readiness after the classroom introduction is saved', async () => {
  vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ submissionId: 'submission-1' }), { status: 200 })));
  try {
    render(<PrecalculusPhysicalContextWorkedPilot />);
    fireEvent.click(screen.getByRole('button', { name: 'Mark worked example reviewed' }));
    await screen.findByText('Worked example review saved.');
    await waitFor(() => expect(mocks.refresh).toHaveBeenCalledOnce());
  } finally { vi.unstubAllGlobals(); }
});
