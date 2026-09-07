import { fireEvent, render, screen } from '@testing-library/react';
import { expect, it } from 'vitest';
import { CalibrationExercise } from '../../components/calibration-exercise';
it('compares independent ratings and does not treat agreement as proof', () => {
  render(<CalibrationExercise />);
  fireEvent.change(screen.getByLabelText('Observer A rating'), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText('Observer B rating'), { target: { value: '3' } });
  fireEvent.click(screen.getByRole('button', { name: 'Compare ratings' }));
  expect(screen.getByText(/Disagreement greater than one level/)).toBeInTheDocument();
  expect(screen.getByText(/Agreement does not prove accuracy/)).toBeInTheDocument();
});
