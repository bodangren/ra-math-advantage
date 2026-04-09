import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { StudentRow, type StudentRowProps } from '@/components/teacher/StudentRow';

const defaultProps: StudentRowProps = {
  studentId: 'student-1',
  studentName: 'Jane Doe',
  progress: 75,
  onViewDetails: vi.fn(),
  onMessage: vi.fn(),
};

describe('StudentRow', () => {
  describe('layout', () => {
    it('renders student name', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} />
          </tbody>
        </table>
      );
      
      expect(screen.getByText('Jane Doe')).toBeInTheDocument();
    });

    it('renders progress percentage', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} />
          </tbody>
        </table>
      );
      
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders view details button', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} />
          </tbody>
        </table>
      );
      
      expect(screen.getByRole('button', { name: 'View details for Jane Doe' })).toBeInTheDocument();
    });

    it('renders message button', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} />
          </tbody>
        </table>
      );
      
      expect(screen.getByRole('button', { name: 'Message Jane Doe' })).toBeInTheDocument();
    });
  });

  describe('progress bar', () => {
    it('renders progress bar with correct width', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} />
          </tbody>
        </table>
      );
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '75%' });
    });

    it('renders 0% progress correctly', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} progress={0} />
          </tbody>
        </table>
      );
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '0%' });
    });

    it('renders 100% progress correctly', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} progress={100} />
          </tbody>
        </table>
      );
      
      const progressBar = screen.getByTestId('progress-bar-fill');
      expect(progressBar).toHaveStyle({ width: '100%' });
    });
  });

  describe('button interactions', () => {
    it('calls onViewDetails when view details button is clicked', () => {
      const onViewDetails = vi.fn();
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} onViewDetails={onViewDetails} />
          </tbody>
        </table>
      );
      
      const button = screen.getByRole('button', { name: 'View details for Jane Doe' });
      button.click();
      
      expect(onViewDetails).toHaveBeenCalledWith('student-1');
    });

    it('calls onMessage when message button is clicked', () => {
      const onMessage = vi.fn();
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} onMessage={onMessage} />
          </tbody>
        </table>
      );
      
      const button = screen.getByRole('button', { name: 'Message Jane Doe' });
      button.click();
      
      expect(onMessage).toHaveBeenCalledWith('student-1');
    });
  });

  describe('accessibility', () => {
    it('has proper ARIA role for progress bar', () => {
      render(
        <table>
          <tbody>
            <StudentRow {...defaultProps} />
          </tbody>
        </table>
      );
      
      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveAttribute('aria-valuenow', '75');
      expect(progressBar).toHaveAttribute('aria-valuemin', '0');
      expect(progressBar).toHaveAttribute('aria-valuemax', '100');
    });
  });
});
