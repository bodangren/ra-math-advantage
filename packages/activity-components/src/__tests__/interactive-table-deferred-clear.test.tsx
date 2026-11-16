import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { InteractiveTableOfValues } from '../components/graphing/InteractiveTableOfValues';

describe('InteractiveTableOfValues deferred response', () => {
  it('invalidates a completed table when one value is cleared', async () => {
    const onTableComplete = vi.fn();
    render(<InteractiveTableOfValues xValues={[-1, 0]} functionExpression="x^2"
      assessmentMode="deferred" onTableComplete={onTableComplete} />);
    fireEvent.change(screen.getByLabelText('f(-1)'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('f(0)'), { target: { value: '0' } });
    await waitFor(() => expect(onTableComplete).toHaveBeenLastCalledWith([{ x: -1, y: 1 }, { x: 0, y: 0 }]));
    fireEvent.change(screen.getByLabelText('f(-1)'), { target: { value: '' } });
    await waitFor(() => expect(onTableComplete).toHaveBeenLastCalledWith([]));
  });
});
