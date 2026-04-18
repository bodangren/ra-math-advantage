import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ContentBlockErrorBoundary } from '@/components/lesson/ContentBlockErrorBoundary';

// Component that throws on render
function ThrowingComponent({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Test render error');
  }
  return <p>Normal content</p>;
}

describe('ContentBlockErrorBoundary', () => {
  beforeEach(() => {
    // Suppress console.error for expected error boundary logs
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('normal rendering', () => {
    it('renders children when no error', () => {
      render(
        <ContentBlockErrorBoundary>
          <ThrowingComponent shouldThrow={false} />
        </ContentBlockErrorBoundary>
      );
      expect(screen.getByText('Normal content')).toBeInTheDocument();
    });
  });

  describe('error handling', () => {
    it('catches render errors and shows fallback UI', () => {
      render(
        <ContentBlockErrorBoundary>
          <ThrowingComponent shouldThrow={true} />
        </ContentBlockErrorBoundary>
      );
      expect(screen.queryByText('Normal content')).not.toBeInTheDocument();
      // Should show some error UI
      expect(screen.getAllByText(/error|could not|failed/i).length).toBeGreaterThan(0);
    });

    it('does not crash the parent — boundary isolates the error', () => {
      const { container } = render(
        <div>
          <p>Outside boundary</p>
          <ContentBlockErrorBoundary>
            <ThrowingComponent shouldThrow={true} />
          </ContentBlockErrorBoundary>
        </div>
      );
      expect(screen.getByText('Outside boundary')).toBeInTheDocument();
      expect(container.firstChild).toBeInTheDocument();
    });

    it('renders custom fallback when provided', () => {
      render(
        <ContentBlockErrorBoundary fallback={<p>Custom fallback</p>}>
          <ThrowingComponent shouldThrow={true} />
        </ContentBlockErrorBoundary>
      );
      expect(screen.getByText('Custom fallback')).toBeInTheDocument();
    });
  });
});
